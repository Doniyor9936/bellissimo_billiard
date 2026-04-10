import { boolean, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const organizations = pgTable("organizations", {
	id: uuid("id").primaryKey().defaultRandom(),
	name: varchar("name", { length: 255 }).notNull(),
	isDeleted: boolean("is_deleted").notNull().default(false),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date()),
});

export type OrganizationRecord = typeof organizations.$inferSelect;
export type NewOrganizationRecord = typeof organizations.$inferInsert;
