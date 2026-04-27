import { relations } from "drizzle-orm";
import { customers } from "./tables/customers";
import { order_items, orders } from "./tables/orders";
import { payments } from "./tables/payments";
import { inventory_logs, products } from "./tables/products";
import { sessions } from "./tables/sessions";
import { cash_transactions, shifts } from "./tables/shifts";
import { tables } from "./tables/tables";
import { users } from "./tables/users";

export const tablesRelations = relations(tables, ({ many }) => ({
	sessions: many(sessions),
}));

export const sessionsRelations = relations(sessions, ({ one, many }) => ({
	table: one(tables, { fields: [sessions.table_id], references: [tables.id] }),
	cashier: one(users, { fields: [sessions.cashier_id], references: [users.id] }),
	customer: one(customers, { fields: [sessions.customer_id], references: [customers.id] }),
	shift: one(shifts, { fields: [sessions.shift_id], references: [shifts.id] }),
	orders: many(orders),
	payments: many(payments),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
	session: one(sessions, { fields: [orders.session_id], references: [sessions.id] }),
	cashier: one(users, { fields: [orders.cashier_id], references: [users.id] }),
	items: many(order_items),
}));

export const orderItemsRelations = relations(order_items, ({ one }) => ({
	order: one(orders, { fields: [order_items.order_id], references: [orders.id] }),
	product: one(products, { fields: [order_items.product_id], references: [products.id] }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
	session: one(sessions, { fields: [payments.session_id], references: [sessions.id] }),
	cashier: one(users, { fields: [payments.cashier_id], references: [users.id] }),
	customer: one(customers, { fields: [payments.customer_id], references: [customers.id] }),
	shift: one(shifts, { fields: [payments.shift_id], references: [shifts.id] }),
}));

export const customersRelations = relations(customers, ({ many }) => ({
	sessions: many(sessions),
	payments: many(payments),
}));

export const shiftsRelations = relations(shifts, ({ one, many }) => ({
	cashier: one(users, { fields: [shifts.cashier_id], references: [users.id] }),
	sessions: many(sessions),
	payments: many(payments),
	cash_transactions: many(cash_transactions),
}));

export const cashTransactionsRelations = relations(cash_transactions, ({ one }) => ({
	shift: one(shifts, { fields: [cash_transactions.shift_id], references: [shifts.id] }),
	user: one(users, { fields: [cash_transactions.user_id], references: [users.id] }),
}));

export const productsRelations = relations(products, ({ many }) => ({
	order_items: many(order_items),
	inventory_logs: many(inventory_logs),
}));

export const inventoryLogsRelations = relations(inventory_logs, ({ one }) => ({
	product: one(products, { fields: [inventory_logs.product_id], references: [products.id] }),
	user: one(users, { fields: [inventory_logs.user_id], references: [users.id] }),
}));

export const usersRelations = relations(users, ({ many }) => ({
	sessions: many(sessions),
	orders: many(orders),
	payments: many(payments),
	shifts: many(shifts),
}));
