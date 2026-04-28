import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { cashTransactionTypeEnum, shiftStatusEnum } from "../enums";
import { users } from "./users";

export const shifts = pgTable("shifts", {
	id: uuid("id").primaryKey().defaultRandom(),
	cashierId: uuid("cashier_id")
		.notNull()
		.references(() => users.id),
	openedAt: timestamp("opened_at", { withTimezone: true }).notNull().defaultNow(),
	closedAt: timestamp("closed_at", { withTimezone: true }),
	scheduledClose: timestamp("scheduled_close", { withTimezone: true }),
	openingCash: integer("opening_cash").notNull().default(0),
	totalCash: integer("total_cash").notNull().default(0),
	totalCard: integer("total_card").notNull().default(0),
	totalClick: integer("total_click").notNull().default(0),
	totalReceipts: integer("total_receipts").notNull().default(0),
	cancelledReceipts: integer("cancelled_receipts").notNull().default(0),
	status: shiftStatusEnum("status").notNull().default("open"),
	xReportPrintedAt: timestamp("x_report_printed_at", { withTimezone: true }),
	zReportData: text("z_report_data"),
	notes: text("notes"),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const cashTransactions = pgTable("cash_transactions", {
	id: uuid("id").primaryKey().defaultRandom(),
	shiftId: uuid("shift_id")
		.notNull()
		.references(() => shifts.id),
	userId: uuid("user_id")
		.notNull()
		.references(() => users.id),
	type: cashTransactionTypeEnum("type").notNull(),
	amount: integer("amount").notNull(),
	reason: text("reason"),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Shift = typeof shifts.$inferSelect;
export type NewShift = typeof shifts.$inferInsert;
export type CashTransaction = typeof cashTransactions.$inferSelect;
