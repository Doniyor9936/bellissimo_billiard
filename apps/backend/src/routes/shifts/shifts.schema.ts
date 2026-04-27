import { z } from "@hono/zod-openapi";
import { createSelectSchema } from "drizzle-zod";
import { cash_transactions, cashTransactionTypeEnum, shifts } from "@/db/schema";

// DB dan inference
export const ShiftSchema = createSelectSchema(shifts);
export const CashTransactionSchema = createSelectSchema(cash_transactions);

// Smena ochish
export const OpenShiftSchema = z.object({
	opening_cash: z.number().int().min(0).default(0).openapi({
		example: 200000,
		description: "Smena boshidagi naqd pul miqdori",
	}),
});

// Kassaga kirim/chiqim
export const CashTransactionBodySchema = z.object({
	type: z.enum(cashTransactionTypeEnum.enumValues).openapi({
		example: "kirim",
	}),
	amount: z.number().int().positive().openapi({
		example: 100000,
	}),
	reason: z.string().optional().openapi({
		example: "Mayda pul uchun",
	}),
});

// Params
export const ShiftParamsSchema = z.object({
	id: z
		.string()
		.uuid()
		.openapi({
			param: { name: "id", in: "path" },
			example: "123e4567-e89b-12d3-a456-426614174000",
		}),
});

// Stats (X va Z hisobot uchun)
export const ShiftStatsSchema = z.object({
	total_cash: z.number(),
	total_card: z.number(),
	total_click: z.number(),
	total_receipts: z.number(),
	cancelled_receipts: z.number(),
});

// Response
export const ShiftResponseSchema = z.object({
	shift: ShiftSchema,
	stats: ShiftStatsSchema,
});
