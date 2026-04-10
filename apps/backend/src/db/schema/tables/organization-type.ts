import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const organizationType = pgTable("organization_type", {
	id: uuid().primaryKey().notNull().defaultRandom(),
	name: text().notNull(),
	createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
	isDeleted: boolean("is_deleted").default(false).notNull(),
	deletedAt: timestamp("deleted_at", { mode: "string" }),
});
