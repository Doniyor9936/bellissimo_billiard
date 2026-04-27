import { pgEnum } from "drizzle-orm/pg-core";

export const crossAccessType = pgEnum("cross_access_type", ["READ", "WRITE"]);


// Billiard stol turlari
export const tableTypeEnum = pgEnum("table_type", [
    "america",      // Amerika
    "rus_piramida", // Rus piramidasi
    "snooker",      // Snooker
]);

// Stol holati
export const tableStatusEnum = pgEnum("table_status", [
    "bosh",  // Bo'sh
    "band",  // Band (o'yin ketmoqda)
    "bron",  // Bron qilingan
    "yopiq", // Yopiq (texnik sabab)
]);

// Stol kategoriyasi
export const tableCategoryEnum = pgEnum("table_category", [
    "standard",
    "vip",
]);

// Sessiya holati
export const sessionStatusEnum = pgEnum("session_status", [
    "active",   // Faol o'yin
    "paused",   // Pauza
    "closed",   // Yopilgan (to'langan)
    "cancelled",// Bekor qilingan
]);

// Mahsulot kategoriyasi (Menyu)
export const productCategoryEnum = pgEnum("product_category", [
    "taom",      // Taomlar
    "zakuska",   // Zakuskalar
    "ichimlik",  // Ichimliklar
    "choy_qahva",// Choy & Qahva
    "kalyan",    // Kalyan
    "boshqa",    // Boshqa
]);

// Mahsulot birligi (Ombor)
export const productUnitEnum = pgEnum("product_unit", [
    "shisha",  // Shisha (ichimliklar)
    "kg",      // Kilogram (go'sht, sabzavot)
    "dona",    // Dona
    "paket",   // Paket (tamaki)
    "litr",    // Litr
]);

// To'lov usuli
export const paymentMethodEnum = pgEnum("payment_method", [
    "naqd",       // Naqd pul
    "karta",      // Bank kartasi
    "click",      // Click
    "payme",      // Payme
    "bolib_tolash",// Bo'lib to'lash
]);

// To'lov holati
export const paymentStatusEnum = pgEnum("payment_status", [
    "pending",   // Kutilmoqda
    "completed", // Bajarildi
    "cancelled", // Bekor qilindi
    "refunded",  // Qaytarildi
]);

// Mijoz loyallik darajasi
export const customerLoyaltyEnum = pgEnum("customer_loyalty", [
    "bronze", // Bronze
    "silver", // Silver
    "gold",   // Gold ⭐
]);

// Foydalanuvchi roli
export const userRoleEnum = pgEnum("user_role", [
    "admin",   // Administrator
    "kassir",  // Kassir
]);

// Smena holati
export const shiftStatusEnum = pgEnum("shift_status", [
    "open",   // Ochiq
    "closed", // Yopilgan (Z-hisobot)
]);

// Kassa tranzaksiya turi
export const cashTransactionTypeEnum = pgEnum("cash_transaction_type", [
    "kirim",  // Kassaga pul kiritish
    "chiqim", // Kassadan pul olish
]);