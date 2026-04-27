import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { sessionStatusEnum } from "../enums";
import { customers } from "./customers";
import { shifts } from "./shifts";
import { tables } from "./tables";
import { users } from "./users";

export const sessions = pgTable("sessions", {
	id: uuid("id").primaryKey().defaultRandom(),
	table_id: uuid("table_id")
		.notNull()
		.references(() => tables.id),
	cashier_id: uuid("cashier_id")
		.notNull()
		.references(() => users.id),
	customer_id: uuid("customer_id").references(() => customers.id),
	shift_id: uuid("shift_id")
		.notNull()
		.references(() => shifts.id),
	guest_count: integer("guest_count").notNull().default(1),
	guest_name: text("guest_name"),
	table_type: text("table_type").notNull(),
	started_at: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
	paused_at: timestamp("paused_at", { withTimezone: true }),
	ended_at: timestamp("ended_at", { withTimezone: true }),
	total_minutes: integer("total_minutes"),
	hourly_rate: integer("hourly_rate").notNull(),
	game_amount: integer("game_amount"),
	order_amount: integer("order_amount").notNull().default(0),
	service_charge_pct: integer("service_charge_pct").notNull().default(10),
	service_charge_amount: integer("service_charge_amount"),
	discount_amount: integer("discount_amount").notNull().default(0),
	total_amount: integer("total_amount"),
	status: sessionStatusEnum("status").notNull().default("active"),
	discount_reason: text("discount_reason"),
	loyalty_points_earned: integer("loyalty_points_earned").notNull().default(0),
	loyalty_points_used: integer("loyalty_points_used").notNull().default(0),
	notes: text("notes"),
	created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
