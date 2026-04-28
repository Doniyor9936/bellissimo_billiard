import { integer, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { products } from "./products";
import { sessions } from "./sessions";
import { users } from "./users";

export const orders = pgTable("orders", {
	id: uuid("id").primaryKey().defaultRandom(),
	sessionId: uuid("session_id")
		.notNull()
		.references(() => sessions.id),
	cashierId: uuid("cashier_id")
		.notNull()
		.references(() => users.id),
	subtotal: integer("subtotal").notNull().default(0),
	totalAmount: integer("total_amount").notNull().default(0),
	notes: text("notes"),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const orderItems = pgTable("order_items", {
	id: uuid("id").primaryKey().defaultRandom(),
	orderId: uuid("order_id")
		.notNull()
		.references(() => orders.id, { onDelete: "cascade" }),
	productId: uuid("product_id")
		.notNull()
		.references(() => products.id),
	productName: varchar("product_name", { length: 150 }).notNull(),
	unitPrice: integer("unit_price").notNull(),
	quantity: integer("quantity").notNull().default(1),
	totalPrice: integer("total_price").notNull(),
	notes: text("notes"),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;
