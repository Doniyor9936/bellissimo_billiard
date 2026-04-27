import { boolean, integer, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { tableCategoryEnum, tableStatusEnum, tableTypeEnum } from "../enums";

export const tables = pgTable("tables", {
	id: uuid("id").primaryKey().defaultRandom(),
	name: varchar("name", { length: 50 }).notNull(),
	number: integer("number").notNull().unique(),
	type: tableTypeEnum("type").notNull(),
	category: tableCategoryEnum("category").notNull().default("standard"),
	hourly_rate: integer("hourly_rate").notNull(),
	min_rate: integer("min_rate"),
	status: tableStatusEnum("status").notNull().default("bosh"),
	sort_order: integer("sort_order").notNull().default(0),
	is_active: boolean("is_active").notNull().default(true),
	description: text("description"),
	created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
	deleted_at: timestamp("deleted_at", { withTimezone: true }).notNull(),
});

export type Table = typeof tables.$inferSelect;
export type NewTable = typeof tables.$inferInsert;
