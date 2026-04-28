import { boolean, integer, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { productCategoryEnum, productUnitEnum } from "../enums";

export const products = pgTable("products", {
	id: uuid("id").primaryKey().defaultRandom(),
	name: varchar("name", { length: 150 }).notNull(),
	category: productCategoryEnum("category").notNull(),
	unit: productUnitEnum("unit").notNull(),
	costPrice: integer("cost_price"),
	sellingPrice: integer("selling_price").notNull(),
	stockQuantity: integer("stock_quantity").notNull().default(0),
	minStock: integer("min_stock").notNull().default(5),
	isAvailable: boolean("is_available").notNull().default(true),
	isSoldSeparately: boolean("is_sold_separately").notNull().default(true),
	sortOrder: integer("sort_order").notNull().default(0),
	description: text("description"),
	imageUrl: text("image_url"),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const inventoryLogs = pgTable("inventory_logs", {
	id: uuid("id").primaryKey().defaultRandom(),
	productId: uuid("product_id")
		.notNull()
		.references(() => products.id),
	userId: uuid("user_id"),
	type: varchar("type", { length: 20 }).notNull(),
	quantity: integer("quantity").notNull(),
	quantityBefore: integer("quantity_before").notNull(),
	quantityAfter: integer("quantity_after").notNull(),
	unitCost: integer("unit_cost"),
	reason: text("reason"),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type InventoryLog = typeof inventoryLogs.$inferSelect;
