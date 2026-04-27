import { pgTable, uuid, varchar, timestamp, text, boolean, integer } from "drizzle-orm/pg-core";

export const settings = pgTable("settings", {
    id: uuid("id").primaryKey().defaultRandom(),
    club_name: varchar("club_name", { length: 100 }).notNull().default("Bellissimo Billiard"),
    address: text("address"),
    phone: varchar("phone", { length: 20 }),
    website: varchar("website", { length: 100 }),
    currency: varchar("currency", { length: 10 }).notNull().default("UZS"),
    open_time: varchar("open_time", { length: 5 }).notNull().default("12:00"),
    close_time: varchar("close_time", { length: 5 }).notNull().default("02:00"),
    service_charge_pct: integer("service_charge_pct").notNull().default(10),
    service_charge_enabled: boolean("service_charge_enabled").notNull().default(true),
    loyalty_enabled: boolean("loyalty_enabled").notNull().default(true),
    points_per_1000: integer("points_per_1000").notNull().default(1),
    bronze_threshold: integer("bronze_threshold").notNull().default(0),
    silver_threshold: integer("silver_threshold").notNull().default(500),
    gold_threshold: integer("gold_threshold").notNull().default(2000),
    receipt_header: text("receipt_header"),
    receipt_footer: text("receipt_footer"),
    receipt_show_logo: boolean("receipt_show_logo").notNull().default(true),
    tax_enabled: boolean("tax_enabled").notNull().default(false),
    ofd_enabled: boolean("ofd_enabled").notNull().default(false),
    ofd_endpoint: text("ofd_endpoint"),
    updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Settings = typeof settings.$inferSelect;
export type NewSettings = typeof settings.$inferInsert;