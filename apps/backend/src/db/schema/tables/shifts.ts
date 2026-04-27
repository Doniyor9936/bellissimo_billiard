import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { cashTransactionTypeEnum, shiftStatusEnum } from "../enums";
import { users } from "./users";

export const shifts = pgTable("shifts", {
	id: uuid("id").primaryKey().defaultRandom(),
	cashier_id: uuid("cashier_id")
		.notNull()
		.references(() => users.id),
	opened_at: timestamp("opened_at", { withTimezone: true }).notNull().defaultNow(),
	closed_at: timestamp("closed_at", { withTimezone: true }),
	scheduled_close: timestamp("scheduled_close", { withTimezone: true }),
	opening_cash: integer("opening_cash").notNull().default(0),
	total_cash: integer("total_cash").notNull().default(0),
	total_card: integer("total_card").notNull().default(0),
	total_click: integer("total_click").notNull().default(0),
	total_receipts: integer("total_receipts").notNull().default(0),
	cancelled_receipts: integer("cancelled_receipts").notNull().default(0),
	status: shiftStatusEnum("status").notNull().default("open"),
	x_report_printed_at: timestamp("x_report_printed_at", { withTimezone: true }),
	z_report_data: text("z_report_data"),
	notes: text("notes"),
	created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const cash_transactions = pgTable("cash_transactions", {
	id: uuid("id").primaryKey().defaultRandom(),
	shift_id: uuid("shift_id")
		.notNull()
		.references(() => shifts.id),
	user_id: uuid("user_id")
		.notNull()
		.references(() => users.id),
	type: cashTransactionTypeEnum("type").notNull(),
	amount: integer("amount").notNull(),
	reason: text("reason"),
	created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Shift = typeof shifts.$inferSelect;
export type NewShift = typeof shifts.$inferInsert;
export type CashTransaction = typeof cash_transactions.$inferSelect;
