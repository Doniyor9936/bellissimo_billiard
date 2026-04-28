import { boolean, integer, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const settings = pgTable("settings", {
	id: uuid("id").primaryKey().defaultRandom(),
	club_name: varchar("club_name", { length: 100 }).notNull().default("Bellissimo Billiard"),
	address: text("address"),
	phone: varchar("phone", { length: 20 }),
	website: varchar("website", { length: 100 }),
	currency: varchar("currency", { length: 10 }).notNull().default("UZS"),
	openTime: varchar("open_time", { length: 5 }).notNull().default("12:00"),
	closeTime: varchar("close_time", { length: 5 }).notNull().default("02:00"),
	serviceChargePct: integer("service_charge_pct").notNull().default(10),
	serviceChargeEnabled: boolean("service_charge_enabled").notNull().default(true),
	loyaltyEnabled: boolean("loyalty_enabled").notNull().default(true),
	pointsPer1000: integer("points_per_1000").notNull().default(1),
	bronzeThreshold: integer("bronze_threshold").notNull().default(0),
	silverThreshold: integer("silver_threshold").notNull().default(500),
	goldThreshold: integer("gold_threshold").notNull().default(2000),
	receiptHeader: text("receipt_header"),
	receiptFooter: text("receipt_footer"),
	receiptShowLogo: boolean("receipt_show_logo").notNull().default(true),
	taxEnabled: boolean("tax_enabled").notNull().default(false),
	ofdEnabled: boolean("ofd_enabled").notNull().default(false),
	ofdEndpoint: text("ofd_endpoint"),
	updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Settings = typeof settings.$inferSelect;
export type NewSettings = typeof settings.$inferInsert;
