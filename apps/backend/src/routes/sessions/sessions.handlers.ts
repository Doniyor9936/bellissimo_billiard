import { and, count, eq } from "drizzle-orm";
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
const calcSessionAmounts = (session: typeof sessions.$inferSelect) => {
	const now = new Date();
	const start = new Date(session.started_at);
	const pausedMs = session.paused_at ? now.getTime() - new Date(session.paused_at).getTime() : 0;

	const elapsedMs = now.getTime() - start.getTime() - pausedMs;
	const elapsedMinutes = Math.floor(elapsedMs / 1000 / 60);

	// Soatlik tarif bo'yicha hisoblash
	const gameAmount = Math.floor((elapsedMinutes / 60) * session.hourly_rate);

	// Xizmat haqqi
	const subtotal = gameAmount + session.order_amount - session.discount_amount;
	const serviceChargeAmount = Math.floor((subtotal * session.service_charge_pct) / 100);
	const totalAmount = subtotal + serviceChargeAmount;

	return { elapsedMinutes, gameAmount, serviceChargeAmount, totalAmount };
};

// Sessiya detail response yasash
const buildSessionDetail = (session: typeof sessions.$inferSelect, tableName: string) => {
	const { elapsedMinutes, gameAmount, totalAmount } = calcSessionAmounts(session);

	return {
		...session,
		table_name: tableName,
		elapsed_minutes: elapsedMinutes,
		current_game_amount: gameAmount,
		current_total: totalAmount,
	};
};

// GET /
export const listSessionsHandler: AppRouteHandler<typeof listSessions> = async (c) => {
	const { status, table_id, shift_id, page, limit } = c.req.valid("query");
	const offset = (page - 1) * limit;

	const conditions = [];
	if (status) {
		conditions.push(eq(sessions.status, status));
	}
	if (table_id) {
		conditions.push(eq(sessions.table_id, table_id));
	}
	if (shift_id) {
		conditions.push(eq(sessions.shift_id, shift_id));
	}

	const where = conditions.length ? and(...conditions) : undefined;

	const [data, [{ total }]] = await Promise.all([
		db.query.sessions.findMany({
			where,
			with: { table: true },
			limit,
			offset,
			orderBy: (s, { desc }) => desc(s.created_at),
		}),
		db.select({ total: count() }).from(sessions).where(where),
	]);

	const result = data.map((s) => buildSessionDetail(s, s.table.name));

	return c.json(
		{ data: result, meta: { total, page, limit, total_pages: Math.ceil(total / limit) } },
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
	const { table_id, guest_count, guest_name, customer_id } = c.req.valid("json");
	const user = c.get("user");

	// Aktiv smena bormi?
	const activeShift = await db.query.shifts.findFirst({
		where: eq(shifts.status, "open"),
	});

	if (!activeShift) {
		return c.json({ message: "Aktiv smena yo'q, avval smena oching" }, 422);
	}

	// Stol bo'shmi?
	const [table] = await db.select().from(tables).where(eq(tables.id, table_id));

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
			table_id,
			cashier_id: user.id,
			customer_id,
			shift_id: activeShift.id,
			guest_count,
			guest_name,
			table_type: table.type,
			hourly_rate: table.hourly_rate,
			service_charge_pct: 10,
			status: "active",
		})
		.returning();

	// Stolni band qilish
	await db
		.update(tables)
		.set({ status: "band", updated_at: new Date() })
		.where(eq(tables.id, table_id));

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
		.set({ status: "paused", paused_at: new Date(), updated_at: new Date() })
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

	// Pauza vaqtini hisoblash va started_at ga qo'shish
	const pausedMs = Date.now() - new Date(session.paused_at!).getTime();
	const newStartedAt = new Date(new Date(session.started_at).getTime() + pausedMs);

	const [updated] = await db
		.update(sessions)
		.set({
			status: "active",
			paused_at: null,
			started_at: newStartedAt, // ← pauza vaqti hisobga olinmaydi
			updated_at: new Date(),
		})
		.where(eq(sessions.id, id))
		.returning();

	return c.json(buildSessionDetail(updated, session.table.name), 200);
};

// PATCH /:id/rate
export const updateRateHandler: AppRouteHandler<typeof updateRate> = async (c) => {
	const { id } = c.req.valid("param");
	const { hourly_rate } = c.req.valid("json");

	const session = await db.query.sessions.findFirst({
		where: and(eq(sessions.id, id), eq(sessions.status, "active")),
		with: { table: true },
	});

	if (!session) {
		return c.json({ message: "Faol sessiya topilmadi" }, 404);
	}

	const [updated] = await db
		.update(sessions)
		.set({ hourly_rate, updated_at: new Date() })
		.where(eq(sessions.id, id))
		.returning();

	return c.json(buildSessionDetail(updated, session.table.name), 200);
};

// PATCH /:id/discount
export const applyDiscountHandler: AppRouteHandler<typeof applyDiscount> = async (c) => {
	const { id } = c.req.valid("param");
	const { discount_amount, discount_reason } = c.req.valid("json");

	const session = await db.query.sessions.findFirst({
		where: eq(sessions.id, id),
		with: { table: true },
	});

	if (!session) {
		return c.json({ message: "Sessiya topilmadi" }, 404);
	}

	const [updated] = await db
		.update(sessions)
		.set({ discount_amount, discount_reason, updated_at: new Date() })
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

	const { elapsedMinutes, gameAmount, serviceChargeAmount, totalAmount } =
		calcSessionAmounts(session);

	const [closed] = await db
		.update(sessions)
		.set({
			status: "closed",
			ended_at: new Date(),
			total_minutes: elapsedMinutes,
			game_amount: gameAmount,
			service_charge_amount: serviceChargeAmount,
			total_amount: totalAmount,
			updated_at: new Date(),
		})
		.where(eq(sessions.id, id))
		.returning();

	// Stolni bo'shatish
	await db
		.update(tables)
		.set({ status: "bosh", updated_at: new Date() })
		.where(eq(tables.id, session.table_id));

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
			ended_at: new Date(),
			updated_at: new Date(),
		})
		.where(eq(sessions.id, id))
		.returning();

	// Stolni bo'shatish
	await db
		.update(tables)
		.set({ status: "bosh", updated_at: new Date() })
		.where(eq(tables.id, session.table_id));

	return c.json(buildSessionDetail(cancelled, session.table.name), 200);
};
