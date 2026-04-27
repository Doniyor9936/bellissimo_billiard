import { pgTable, uuid, integer, timestamp, text, varchar } from "drizzle-orm/pg-core";
import { sessions } from "./sessions";
import { products } from "./products";
import { users } from "./users";

export const orders = pgTable("orders", {
    id: uuid("id").primaryKey().defaultRandom(),
    session_id: uuid("session_id").notNull().references(() => sessions.id),
    cashier_id: uuid("cashier_id").notNull().references(() => users.id),
    subtotal: integer("subtotal").notNull().default(0),
    total_amount: integer("total_amount").notNull().default(0),
    notes: text("notes"),
    created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const order_items = pgTable("order_items", {
    id: uuid("id").primaryKey().defaultRandom(),
    order_id: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
    product_id: uuid("product_id").notNull().references(() => products.id),
    product_name: varchar("product_name", { length: 150 }).notNull(),
    unit_price: integer("unit_price").notNull(),
    quantity: integer("quantity").notNull().default(1),
    total_price: integer("total_price").notNull(),
    notes: text("notes"),
    created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderItem = typeof order_items.$inferSelect;
export type NewOrderItem = typeof order_items.$inferInsert;