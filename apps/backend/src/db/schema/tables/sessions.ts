import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { sessionStatusEnum } from "../enums";
import { customers } from "./customers";
import { shifts } from "./shifts";
import { tables } from "./tables";
import { users } from "./users";

export const sessions = pgTable("sessions", {
	id: uuid("id").primaryKey().defaultRandom(),
	tableId: uuid("table_id")
		.notNull()
		.references(() => tables.id),
	cashierId: uuid("cashier_id")
		.notNull()
		.references(() => users.id),
	customerId: uuid("customer_id").references(() => customers.id),
	shiftId: uuid("shift_id")
		.notNull()
		.references(() => shifts.id),
	guestCount: integer("guest_count").notNull().default(1),
	guestName: text("guest_name"),
	tableType: text("table_type").notNull(),
	startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
	pausedAt: timestamp("paused_at", { withTimezone: true }),
	endedAt: timestamp("ended_at", { withTimezone: true }),
	totalMinutes: integer("total_minutes"),
	hourlyRate: integer("hourly_rate").notNull(),
	gameAmount: integer("game_amount"),
	orderAmount: integer("order_amount").notNull().default(0),
	serviceChargePct: integer("service_charge_pct").notNull().default(10),
	serviceChargeAmount: integer("service_charge_amount"),
	discountAmount: integer("discount_amount").notNull().default(0),
	totalAmount: integer("total_amount"),
	status: sessionStatusEnum("status").notNull().default("active"),
	discountReason: text("discount_reason"),
	loyaltyPointsEarned: integer("loyalty_points_earned").notNull().default(0),
	loyaltyPointsUsed: integer("loyalty_points_used").notNull().default(0),
	notes: text("notes"),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
