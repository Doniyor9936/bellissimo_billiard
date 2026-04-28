import { boolean, integer, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { tableCategoryEnum, tableStatusEnum, tableTypeEnum } from "../enums";

export const tables = pgTable("tables", {
	id: uuid("id").primaryKey().defaultRandom(),
	name: varchar("name", { length: 50 }).notNull(),
	number: integer("number").notNull().unique(),
	type: tableTypeEnum("type").notNull(),
	category: tableCategoryEnum("category").notNull().default("standard"),
	hourlyRate: integer("hourly_rate").notNull(),
	minRate: integer("min_rate"),
	status: tableStatusEnum("status").notNull().default("bosh"),
	sortOrder: integer("sort_order").notNull().default(0),
	isActive: boolean("is_active").notNull().default(true),
	description: text("description"),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
	deletedAt: timestamp("deleted_at", { withTimezone: true }).notNull(),
});

export type Table = typeof tables.$inferSelect;
export type NewTable = typeof tables.$inferInsert;
