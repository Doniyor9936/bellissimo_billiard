import type { UserRoleType } from "@shared/types";
import { boolean, pgEnum, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["supervisor", "admin", "manager"]);

export const users = pgTable("users", {
	id: uuid("id").primaryKey().defaultRandom(),
	phone: varchar("phone", { length: 20 }).notNull().unique(),
	passwordHash: text("password_hash").notNull(),
	role: userRoleEnum("role").notNull().default("manager"),
	isActive: boolean("is_active").notNull().default(true),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date()),
});

// Types
export type UserRecord = typeof users.$inferSelect;
export type NewUserRecord = typeof users.$inferInsert;
export type { UserRoleType };
