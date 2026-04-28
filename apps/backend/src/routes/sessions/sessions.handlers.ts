import { and, count, desc, eq, ilike, or } from "drizzle-orm";
import { db } from "@/db";
import { sessions, shifts, tables } from "@/db/schema";
import type { AppRouteHandler } from "@/lib";
import type {
	applyDiscount,
	cancelSession,
	closeSession,
	getOneSession,
	listSessions,
	openSession,
	pauseSession,
	resumeSession,
	updateRate,
} from "./sessions.routes";

// Vaqt va summani hisoblash
const calcSessionAmounts = (session: typeof sessions.$inferSelect, ovverideEndedAt?: Date) => {
	const now = new Date();
	const start = new Date(session.startedAt);
	const end = ovverideEndedAt ? ovverideEndedAt : session.endedAt ? new Date(session.endedAt) : now;
	// const pausedMs = session.pausedAt ? now.getTime() - new Date(session.pausedAt).getTime() : 0;

	const elapsedMs = Math.max(0, end.getTime() - start.getTime());
	const elapsedMinutes = Math.floor(elapsedMs / 1000 / 60);
	// Soatlik tarif bo'yicha hisoblash
	const gameAmount = Math.floor((elapsedMinutes / 60) * session.hourlyRate);

	// Xizmat haqqi
	const subtotal = gameAmount + session.orderAmount - session.discountAmount;
	const serviceChargeAmount = Math.floor((subtotal * session.serviceChargePct) / 100);
	const totalAmount = subtotal + serviceChargeAmount;

	return { elapsedMinutes, gameAmount, serviceChargeAmount, totalAmount };
};

// Sessiya detail response yasash
const buildSessionDetail = (session: typeof sessions.$inferSelect, tableName: string) => {
	const { elapsedMinutes, gameAmount, totalAmount } = calcSessionAmounts(session);

	return {
		...session,
		tableName: tableName,
		elapsedMinutes: elapsedMinutes,
		currentGameAmount: gameAmount,
		currentTotal: totalAmount,
	};
};

// GET /
export const listSessionsHandler: AppRouteHandler<typeof listSessions> = async (c) => {
	const { search, status, tableId, shiftId, page, limit } = c.req.valid("query");
	const offset = (page - 1) * limit;

	const conditions = [];
	if (status) {
		conditions.push(eq(sessions.status, status));
	}
	if (tableId) {
		conditions.push(eq(sessions.tableId, tableId));
	}
	if (shiftId) {
		conditions.push(eq(sessions.shiftId, shiftId));
	}
	if (search) {
		conditions.push(
			or(ilike(sessions.guestName, `%${search}%`), ilike(tables.name, `%${search}%`))
		);
	}

	const where = conditions.length ? and(...conditions) : undefined;

	const [data, [{ total }]] = await Promise.all([
		db
			.select()
			.from(sessions)
			.leftJoin(tables, eq(sessions.tableId, tables.id))
			.where(where)
			.limit(limit)
			.offset(offset)
			.orderBy(desc(sessions.createdAt)),
		db
			.select({ total: count() })
			.from(sessions)
			.leftJoin(tables, eq(sessions.tableId, tables.id))
			.where(where),
	]);

	const result = data.map((row) => buildSessionDetail(row.sessions, row.tables?.name ?? ""));

	return c.json(
		{ data: result, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } },
		200
	);
};

// GET /:id
export const getOneSessionHandler: AppRouteHandler<typeof getOneSession> = async (c) => {
	const { id } = c.req.valid("param");

	const session = await db.query.sessions.findFirst({
		where: eq(sessions.id, id),
		with: { table: true },
	});

	if (!session) {
		return c.json({ message: "Sessiya topilmadi" }, 404);
	}

	return c.json(buildSessionDetail(session, session.table.name), 200);
};

// POST / — sessiya ochish
export const openSessionHandler: AppRouteHandler<typeof openSession> = async (c) => {
	const { tableId, guestCount, guestName, customerId } = c.req.valid("json");
	const user = c.get("user");

	// Aktiv smena bormi?
	const activeShift = await db.query.shifts.findFirst({
		where: eq(shifts.status, "open"),
	});

	if (!activeShift) {
		return c.json({ message: "Aktiv smena yo'q, avval smena oching" }, 422);
	}

	// Stol bo'shmi?
	const [table] = await db.select().from(tables).where(eq(tables.id, tableId));

	if (!table) {
		return c.json({ message: "Stol topilmadi" }, 404);
	}

	if (table.status !== "bosh") {
		return c.json({ message: `Stol ${table.status} — sessiya ochib bo'lmaydi` }, 422);
	}

	// Sessiya yaratish
	const [newSession] = await db
		.insert(sessions)
		.values({
			tableId,
			cashierId: user.id,
			customerId,
			shiftId: activeShift.id,
			guestCount,
			guestName,
			tableType: table.type,
			hourlyRate: table.hourlyRate,
			serviceChargePct: 10,
			status: "active",
		})
		.returning();

	// Stolni band qilish
	await db
		.update(tables)
		.set({ status: "band", updatedAt: new Date() })
		.where(eq(tables.id, tableId));

	return c.json(buildSessionDetail(newSession, table.name), 201);
};

// POST /:id/pause
export const pauseSessionHandler: AppRouteHandler<typeof pauseSession> = async (c) => {
	const { id } = c.req.valid("param");

	const session = await db.query.sessions.findFirst({
		where: eq(sessions.id, id),
		with: { table: true },
	});

	if (!session) {
		return c.json({ message: "Sessiya topilmadi" }, 404);
	}
	if (session.status !== "active") {
		return c.json({ message: "Sessiya faol emas" }, 422);
	}

	const [updated] = await db
		.update(sessions)
		.set({ status: "paused", pausedAt: new Date(), updatedAt: new Date() })
		.where(eq(sessions.id, id))
		.returning();

	return c.json(buildSessionDetail(updated, session.table.name), 200);
};

// POST /:id/resume
export const resumeSessionHandler: AppRouteHandler<typeof resumeSession> = async (c) => {
	const { id } = c.req.valid("param");

	const session = await db.query.sessions.findFirst({
		where: eq(sessions.id, id),
		with: { table: true },
	});

	if (!session) {
		return c.json({ message: "Sessiya topilmadi" }, 404);
	}
	if (session.status !== "paused") {
		return c.json({ message: "Sessiya pauzada emas" }, 422);
	}
	if (!session.pausedAt) {
		return c.json({ message: "Sessiya pauza vaqti topilmadi" }, 422);
	}

	// Pauza vaqtini hisoblash va started_at ga qo'shish
	const pausedMs = Date.now() - new Date(session.pausedAt!).getTime();
	const newStartedAt = new Date(new Date(session.startedAt).getTime() + pausedMs);

	const [updated] = await db
		.update(sessions)
		.set({
			status: "active",
			pausedAt: null,
			startedAt: newStartedAt, // ← pauza vaqti hisobga olinmaydi
			updatedAt: new Date(),
		})
		.where(eq(sessions.id, id))
		.returning();

	return c.json(buildSessionDetail(updated, session.table.name), 200);
};

// PATCH /:id/rate
export const updateRateHandler: AppRouteHandler<typeof updateRate> = async (c) => {
	const { id } = c.req.valid("param");
	const { hourlyRate } = c.req.valid("json");

	const session = await db.query.sessions.findFirst({
		where: and(eq(sessions.id, id), eq(sessions.status, "active")),
		with: { table: true },
	});

	if (!session) {
		return c.json({ message: "Faol sessiya topilmadi" }, 404);
	}

	const [updated] = await db
		.update(sessions)
		.set({ hourlyRate, updatedAt: new Date() })
		.where(eq(sessions.id, id))
		.returning();

	return c.json(buildSessionDetail(updated, session.table.name), 200);
};

// PATCH /:id/discount
export const applyDiscountHandler: AppRouteHandler<typeof applyDiscount> = async (c) => {
	const { id } = c.req.valid("param");
	const { discountAmount, discountReason } = c.req.valid("json");

	const session = await db.query.sessions.findFirst({
		where: eq(sessions.id, id),
		with: { table: true },
	});

	if (!session) {
		return c.json({ message: "Sessiya topilmadi" }, 404);
	}

	const [updated] = await db
		.update(sessions)
		.set({ discountAmount, discountReason, updatedAt: new Date() })
		.where(eq(sessions.id, id))
		.returning();

	return c.json(buildSessionDetail(updated, session.table.name), 200);
};

// POST /:id/close — to'lovga tayyorlash
export const closeSessionHandler: AppRouteHandler<typeof closeSession> = async (c) => {
	const { id } = c.req.valid("param");

	const session = await db.query.sessions.findFirst({
		where: and(eq(sessions.id, id), eq(sessions.status, "active")),
		with: { table: true },
	});

	if (!session) {
		return c.json({ message: "Faol sessiya topilmadi" }, 404);
	}

	const endedAT = new Date();
	const { elapsedMinutes, gameAmount, serviceChargeAmount, totalAmount } = calcSessionAmounts({
		...session,
		endedAt: endedAT,
	});

	const [closed] = await db
		.update(sessions)
		.set({
			status: "closed",
			endedAt: endedAT,
			totalMinutes: elapsedMinutes,
			gameAmount: gameAmount,
			serviceChargeAmount: serviceChargeAmount,
			totalAmount: totalAmount,
			updatedAt: new Date(),
		})
		.where(eq(sessions.id, id))
		.returning();

	// Stolni bo'shatish
	await db
		.update(tables)
		.set({ status: "bosh", updatedAt: new Date() })
		.where(eq(tables.id, session.tableId));

	return c.json(buildSessionDetail(closed, session.table.name), 200);
};

// POST /:id/cancel
export const cancelSessionHandler: AppRouteHandler<typeof cancelSession> = async (c) => {
	const { id } = c.req.valid("param");

	const session = await db.query.sessions.findFirst({
		where: and(eq(sessions.id, id)),
		with: { table: true },
	});

	if (!session) {
		return c.json({ message: "Sessiya topilmadi" }, 404);
	}
	if (session.status === "closed") {
		return c.json({ message: "Yopilgan sessiyani bekor qilib bo'lmaydi" }, 422);
	}

	const [cancelled] = await db
		.update(sessions)
		.set({
			status: "cancelled",
			endedAt: new Date(),
			updatedAt: new Date(),
		})
		.where(eq(sessions.id, id))
		.returning();

	// Stolni bo'shatish
	await db
		.update(tables)
		.set({ status: "bosh", updatedAt: new Date() })
		.where(eq(tables.id, session.tableId));

	return c.json(buildSessionDetail(cancelled, session.table.name), 200);
};
