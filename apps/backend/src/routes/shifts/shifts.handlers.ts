import { and, count, eq, sql, sum } from "drizzle-orm";
import { db } from "@/db";
import { cash_transactions, payments, sessions, shifts } from "@/db/schema";
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
			total_cash: sum(
				sql`CASE WHEN ${payments.payment_method} = 'naqd' THEN ${payments.total_amount} ELSE 0 END`
			),
			total_card: sum(
				sql`CASE WHEN ${payments.payment_method} = 'karta' THEN ${payments.total_amount} ELSE 0 END`
			),
			total_click: sum(
				sql`CASE WHEN ${payments.payment_method} = 'click' THEN ${payments.total_amount} ELSE 0 END`
			),
			total_receipts: count(payments.id),
		})
		.from(payments)
		.where(and(eq(payments.shift_id, shiftId), eq(payments.status, "completed")));

	const [{ cancelled }] = await db
		.select({ cancelled: count(payments.id) })
		.from(payments)
		.where(and(eq(payments.shift_id, shiftId), eq(payments.status, "cancelled")));

	return {
		total_cash: Number(stats.total_cash ?? 0),
		total_card: Number(stats.total_card ?? 0),
		total_click: Number(stats.total_click ?? 0),
		total_receipts: Number(stats.total_receipts ?? 0),
		cancelled_receipts: Number(cancelled ?? 0),
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
	const { opening_cash } = c.req.valid("json");

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
			cashier_id: user.id,
			opening_cash,
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
		where: and(eq(sessions.shift_id, id), eq(sessions.status, "active")),
	});

	if (activeSession) {
		return c.json({ message: "Faol sessiyalar mavjud, avval yoping" }, 422);
	}

	const stats = await getShiftStats(id);

	const [closed] = await db
		.update(shifts)
		.set({
			status: "closed",
			closed_at: new Date(),
			total_cash: stats.total_cash,
			total_card: stats.total_card,
			total_click: stats.total_click,
			total_receipts: stats.total_receipts,
			cancelled_receipts: stats.cancelled_receipts,
			z_report_data: JSON.stringify(stats),
			updated_at: new Date(),
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

	await db.update(shifts).set({ x_report_printed_at: new Date() }).where(eq(shifts.id, id));

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
		.insert(cash_transactions)
		.values({
			shift_id: id,
			user_id: user.id,
			type,
			amount,
			reason,
		})
		.returning();

	return c.json(transaction, 201);
};
