import { integer, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { customerLoyaltyEnum } from "../enums";

export const customers = pgTable("customers", {
	id: uuid("id").primaryKey().defaultRandom(),
	name: varchar("name", { length: 100 }).notNull(),
	phone: varchar("phone", { length: 20 }).unique(),
	loyalty_tier: customerLoyaltyEnum("loyalty_tier").notNull().default("bronze"),
	loyalty_points: integer("loyalty_points").notNull().default(0),
	total_spent: integer("total_spent").notNull().default(0),
	total_visits: integer("total_visits").notNull().default(0),
	notes: text("notes"),
	last_visited_at: timestamp("last_visited_at", { withTimezone: true }),
	created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;
