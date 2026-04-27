import { boolean, integer, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { paymentMethodEnum, paymentStatusEnum } from "../enums";
import { customers } from "./customers";
import { sessions } from "./sessions";
import { shifts } from "./shifts";
import { users } from "./users";

export const payments = pgTable("payments", {
	id: uuid("id").primaryKey().defaultRandom(),
	session_id: uuid("session_id")
		.notNull()
		.references(() => sessions.id),
	cashier_id: uuid("cashier_id")
		.notNull()
		.references(() => users.id),
	customer_id: uuid("customer_id").references(() => customers.id),
	shift_id: uuid("shift_id")
		.notNull()
		.references(() => shifts.id),
	receipt_number: varchar("receipt_number", { length: 20 }).notNull().unique(),
	game_amount: integer("game_amount").notNull(),
	order_amount: integer("order_amount").notNull(),
	subtotal: integer("subtotal").notNull(),
	service_charge: integer("service_charge").notNull(),
	discount_amount: integer("discount_amount").notNull().default(0),
	total_amount: integer("total_amount").notNull(),
	payment_method: paymentMethodEnum("payment_method").notNull(),
	amount_paid: integer("amount_paid").notNull(),
	change_amount: integer("change_amount").notNull().default(0),
	status: paymentStatusEnum("status").notNull().default("completed"),
	loyalty_points_earned: integer("loyalty_points_earned").notNull().default(0),
	loyalty_points_used: integer("loyalty_points_used").notNull().default(0),
	apply_loyalty_points: boolean("apply_loyalty_points").notNull().default(false),
	refund_reason: text("refund_reason"),
	refunded_at: timestamp("refunded_at", { withTimezone: true }),
	notes: text("notes"),
	created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
