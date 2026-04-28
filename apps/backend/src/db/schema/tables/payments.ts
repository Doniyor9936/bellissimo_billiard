import { boolean, integer, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { paymentMethodEnum, paymentStatusEnum } from "../enums";
import { customers } from "./customers";
import { sessions } from "./sessions";
import { shifts } from "./shifts";
import { users } from "./users";

export const payments = pgTable("payments", {
	id: uuid("id").primaryKey().defaultRandom(),
	sessionId: uuid("session_id")
		.notNull()
		.references(() => sessions.id),
	cashierId: uuid("cashier_id")
		.notNull()
		.references(() => users.id),
	customerId: uuid("customer_id").references(() => customers.id),
	shiftId: uuid("shift_id")
		.notNull()
		.references(() => shifts.id),
	receiptNumber: varchar("receipt_number", { length: 20 }).notNull().unique(),
	gameAmount: integer("game_amount").notNull(),
	orderAmount: integer("order_amount").notNull(),
	subtotal: integer("subtotal").notNull(),
	serviceCharge: integer("service_charge").notNull(),
	discountAmount: integer("discount_amount").notNull().default(0),
	totalAmount: integer("total_amount").notNull(),
	paymentMethod: paymentMethodEnum("payment_method").notNull(),
	amountPaid: integer("amount_paid").notNull(),
	changeAmount: integer("change_amount").notNull().default(0),
	status: paymentStatusEnum("status").notNull().default("completed"),
	loyaltyPointsEarned: integer("loyalty_points_earned").notNull().default(0),
	loyaltyPointsUsed: integer("loyalty_points_used").notNull().default(0),
	applyLoyaltyPoints: boolean("apply_loyalty_points").notNull().default(false),
	refundReason: text("refund_reason"),
	refundedAt: timestamp("refunded_at", { withTimezone: true }),
	notes: text("notes"),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
