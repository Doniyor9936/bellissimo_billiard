import { and, count, eq, sql, sum } from "drizzle-orm";
import { db } from "@/db";
import { cashTransactions, payments, sessions, shifts } from "@/db/schema";
import type { AppRouteHandler } from "@/lib";
import type {
	cashTransaction,
	closeShift,
	getActiveShift,
	openShift,
	xReport,
} from "./shifts.routes";

// Smena statistikasini hisoblash

const getShiftStats = async (shiftId: string) => {
	const [stats] = await db
		.select({
			totalCash: sum(
				sql`CASE WHEN ${payments.paymentMethod} = 'naqd' THEN ${payments.totalAmount} ELSE 0 END`
			),
			totalCard: sum(
				sql`CASE WHEN ${payments.paymentMethod} = 'karta' THEN ${payments.totalAmount} ELSE 0 END`
			),
			totalClick: sum(
				sql`CASE WHEN ${payments.paymentMethod} = 'click' THEN ${payments.totalAmount} ELSE 0 END`
			),
			totalReceipts: count(payments.id),
		})
		.from(payments)
		.where(and(eq(payments.shiftId, shiftId), eq(payments.status, "completed")));

	const [{ cancelled }] = await db
		.select({ cancelled: count(payments.id) })
		.from(payments)
		.where(and(eq(payments.shiftId, shiftId), eq(payments.status, "cancelled")));

	return {
		totalCash: Number(stats.totalCash ?? 0),
		totalCard: Number(stats.totalCard ?? 0),
		totalClick: Number(stats.totalClick ?? 0),
		totalReceipts: Number(stats.totalReceipts ?? 0),
		cancelledReceipts: Number(cancelled ?? 0),
	};
};
// GET /active
export const getActiveShiftHandler: AppRouteHandler<typeof getActiveShift> = async (c) => {
	const shift = await db.query.shifts.findFirst({
		where: eq(shifts.status, "open"),
	});

	if (!shift) {
		return c.json({ message: "Aktiv smena topilmadi" }, 404);
	}

	const stats = await getShiftStats(shift.id);

	return c.json({ shift, stats }, 200);
};

// POST /open
export const openShiftHandler: AppRouteHandler<typeof openShift> = async (c) => {
	const { openingCash } = c.req.valid("json");

	const existing = await db.query.shifts.findFirst({
		where: eq(shifts.status, "open"),
	});

	if (existing) {
		return c.json({ message: "Allaqachon ochiq smena mavjud" }, 422);
	}

	const user = c.get("user");

	const [newShift] = await db
		.insert(shifts)
		.values({
			cashierId: user.id,
			openingCash,
			status: "open",
		})
		.returning();

	return c.json(newShift, 201);
};

// POST /:id/close
export const closeShiftHandler: AppRouteHandler<typeof closeShift> = async (c) => {
	const { id } = c.req.valid("param");

	const shift = await db.query.shifts.findFirst({
		where: and(eq(shifts.id, id), eq(shifts.status, "open")),
	});

	if (!shift) {
		return c.json({ message: "Smena topilmadi yoki allaqachon yopilgan" }, 404);
	}

	// Faol sessiyalar bormi?
	const activeSession = await db.query.sessions.findFirst({
		where: and(eq(sessions.shiftId, id), eq(sessions.status, "active")),
	});

	if (activeSession) {
		return c.json({ message: "Faol sessiyalar mavjud, avval yoping" }, 422);
	}

	const stats = await getShiftStats(id);

	const [closed] = await db
		.update(shifts)
		.set({
			status: "closed",
			closedAt: new Date(),
			totalCash: stats.totalCash,
			totalCard: stats.totalCard,
			totalClick: stats.totalClick,
			totalReceipts: stats.totalReceipts,
			cancelledReceipts: stats.cancelledReceipts,
			zReportData: JSON.stringify(stats),
			updatedAt: new Date(),
		})
		.where(eq(shifts.id, id))
		.returning();

	return c.json({ shift: closed, stats }, 200);
};

// GET /:id/x-report
export const xReportHandler: AppRouteHandler<typeof xReport> = async (c) => {
	const { id } = c.req.valid("param");

	const shift = await db.query.shifts.findFirst({
		where: eq(shifts.id, id),
	});

	if (!shift) {
		return c.json({ message: "Smena topilmadi" }, 404);
	}

	const stats = await getShiftStats(id);

	await db.update(shifts).set({ xReportPrintedAt: new Date() }).where(eq(shifts.id, id));

	return c.json({ shift, stats }, 200);
};

// POST /:id/cash
export const cashTransactionHandler: AppRouteHandler<typeof cashTransaction> = async (c) => {
	const { id } = c.req.valid("param");
	const { type, amount, reason } = c.req.valid("json");

	const shift = await db.query.shifts.findFirst({
		where: and(eq(shifts.id, id), eq(shifts.status, "open")),
	});

	if (!shift) {
		return c.json({ message: "Aktiv smena topilmadi" }, 404);
	}

	const user = c.get("user");

	const [transaction] = await db
		.insert(cashTransactions)
		.values({
			shiftId: id,
			userId: user.id,
			type,
			amount,
			reason,
		})
		.returning();

	return c.json(transaction, 201);
};
