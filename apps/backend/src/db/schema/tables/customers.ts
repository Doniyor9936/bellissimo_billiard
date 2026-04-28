import { integer, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { customerLoyaltyEnum } from "../enums";

export const customers = pgTable("customers", {
	id: uuid("id").primaryKey().defaultRandom(),
	name: varchar("name", { length: 100 }).notNull(),
	phone: varchar("phone", { length: 20 }).unique(),
	loyaltyTier: customerLoyaltyEnum("loyalty_tier").notNull().default("bronze"),
	loyaltyPoints: integer("loyalty_points").notNull().default(0),
	totalSpent: integer("total_spent").notNull().default(0),
	totalVisits: integer("total_visits").notNull().default(0),
	notes: text("notes"),
	lastVisited_at: timestamp("last_visited_at", { withTimezone: true }),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;
