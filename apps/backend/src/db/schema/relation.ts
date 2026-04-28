import { relations } from "drizzle-orm";
import { customers } from "./tables/customers";
import { orderItems, orders } from "./tables/orders";
import { payments } from "./tables/payments";
import { inventoryLogs, products } from "./tables/products";
import { sessions } from "./tables/sessions";
import { cashTransactions, shifts } from "./tables/shifts";
import { tables } from "./tables/tables";
import { users } from "./tables/users";

export const tablesRelations = relations(tables, ({ many }) => ({
	sessions: many(sessions),
}));

export const sessionsRelations = relations(sessions, ({ one, many }) => ({
	table: one(tables, { fields: [sessions.tableId], references: [tables.id] }),
	cashier: one(users, { fields: [sessions.cashierId], references: [users.id] }),
	customer: one(customers, { fields: [sessions.customerId], references: [customers.id] }),
	shift: one(shifts, { fields: [sessions.shiftId], references: [shifts.id] }),
	orders: many(orders),
	payments: many(payments),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
	session: one(sessions, { fields: [orders.sessionId], references: [sessions.id] }),
	cashier: one(users, { fields: [orders.cashierId], references: [users.id] }),
	items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
	order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
	product: one(products, { fields: [orderItems.productId], references: [products.id] }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
	session: one(sessions, { fields: [payments.sessionId], references: [sessions.id] }),
	cashier: one(users, { fields: [payments.cashierId], references: [users.id] }),
	customer: one(customers, { fields: [payments.customerId], references: [customers.id] }),
	shift: one(shifts, { fields: [payments.shiftId], references: [shifts.id] }),
}));

export const customersRelations = relations(customers, ({ many }) => ({
	sessions: many(sessions),
	payments: many(payments),
}));

export const shiftsRelations = relations(shifts, ({ one, many }) => ({
	cashier: one(users, { fields: [shifts.cashierId], references: [users.id] }),
	sessions: many(sessions),
	payments: many(payments),
	cash_transactions: many(cashTransactions),
}));

export const cashTransactionsRelations = relations(cashTransactions, ({ one }) => ({
	shift: one(shifts, { fields: [cashTransactions.shiftId], references: [shifts.id] }),
	user: one(users, { fields: [cashTransactions.userId], references: [users.id] }),
}));

export const productsRelations = relations(products, ({ many }) => ({
	orderItems: many(orderItems),
	inventoryLogs: many(inventoryLogs),
}));

export const inventoryLogsRelations = relations(inventoryLogs, ({ one }) => ({
	product: one(products, { fields: [inventoryLogs.productId], references: [products.id] }),
	user: one(users, { fields: [inventoryLogs.userId], references: [users.id] }),
}));

export const usersRelations = relations(users, ({ many }) => ({
	sessions: many(sessions),
	orders: many(orders),
	payments: many(payments),
	shifts: many(shifts),
}));
