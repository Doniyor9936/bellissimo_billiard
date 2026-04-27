import { boolean, integer, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { productCategoryEnum, productUnitEnum } from "../enums";

export const products = pgTable("products", {
	id: uuid("id").primaryKey().defaultRandom(),
	name: varchar("name", { length: 150 }).notNull(),
	category: productCategoryEnum("category").notNull(),
	unit: productUnitEnum("unit").notNull(),
	cost_price: integer("cost_price"),
	selling_price: integer("selling_price").notNull(),
	stock_quantity: integer("stock_quantity").notNull().default(0),
	min_stock: integer("min_stock").notNull().default(5),
	is_available: boolean("is_available").notNull().default(true),
	is_sold_separately: boolean("is_sold_separately").notNull().default(true),
	sort_order: integer("sort_order").notNull().default(0),
	description: text("description"),
	image_url: text("image_url"),
	created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const inventory_logs = pgTable("inventory_logs", {
	id: uuid("id").primaryKey().defaultRandom(),
	product_id: uuid("product_id")
		.notNull()
		.references(() => products.id),
	user_id: uuid("user_id"),
	type: varchar("type", { length: 20 }).notNull(),
	quantity: integer("quantity").notNull(),
	quantity_before: integer("quantity_before").notNull(),
	quantity_after: integer("quantity_after").notNull(),
	unit_cost: integer("unit_cost"),
	reason: text("reason"),
	created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type InventoryLog = typeof inventory_logs.$inferSelect;
