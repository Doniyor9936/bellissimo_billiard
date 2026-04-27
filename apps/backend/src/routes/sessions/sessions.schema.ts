import { z } from "@hono/zod-openapi";
import { createSelectSchema } from "drizzle-zod";
import { sessionStatusEnum, sessions } from "@/db/schema";

// DB dan inference
export const SessionSchema = createSelectSchema(sessions);

// Sessiya ochish
export const OpenSessionSchema = z.object({
	table_id: z.string().uuid().openapi({
		example: "123e4567-e89b-12d3-a456-426614174000",
		description: "Stol ID si",
	}),
	guest_count: z.number().int().positive().default(1).openapi({
		example: 4,
		description: "Mehmonlar soni",
	}),
	guest_name: z.string().optional().openapi({
		example: "Temur aka",
		description: "Mijoz ismi (ixtiyoriy)",
	}),
	customer_id: z.string().uuid().optional().openapi({
		example: "123e4567-e89b-12d3-a456-426614174000",
		description: "Ro'yxatdagi mijoz ID si (ixtiyoriy)",
	}),
});

// Pauza
export const PauseSessionSchema = z.object({
	paused_at: z.string().datetime().optional().openapi({
		description: "Pauza vaqti (default: hozir)",
	}),
});

// Tarifni o'zgartirish
export const UpdateRateSchema = z.object({
	hourly_rate: z.number().int().positive().openapi({
		example: 80000,
		description: "Yangi soatlik tarif",
	}),
});

// Chegirma
export const DiscountSchema = z.object({
	discount_amount: z.number().int().min(0).openapi({
		example: 50000,
		description: "Chegirma miqdori",
	}),
	discount_reason: z.string().optional().openapi({
		example: "Doimiy mijoz",
		description: "Chegirma sababi",
	}),
});

// Params
export const SessionParamsSchema = z.object({
	id: z
		.string()
		.uuid()
		.openapi({
			param: { name: "id", in: "path" },
			example: "123e4567-e89b-12d3-a456-426614174000",
		}),
});

// Query
export const SessionListQuerySchema = z.object({
	status: z.enum(sessionStatusEnum.enumValues).optional().openapi({
		example: "active",
		description: "Sessiya holati bo'yicha filter",
	}),
	table_id: z.string().uuid().optional().openapi({
		description: "Stol bo'yicha filter",
	}),
	shift_id: z.string().uuid().optional().openapi({
		description: "Smena bo'yicha filter",
	}),
	page: z.string().optional().default("1").transform(Number).pipe(z.number().int().min(1)),
	limit: z
		.string()
		.optional()
		.default("20")
		.transform(Number)
		.pipe(z.number().int().min(1).max(100)),
});

// Sessiya detail response (screenshotdagi kabi)
export const SessionDetailSchema = SessionSchema.extend({
	table_name: z.string(), // "Stol 1"
	elapsed_minutes: z.number(), // O'yin vaqti: 01:23 → 83 daqiqa
	current_game_amount: z.number(), // Hozirgi o'yin summasi: 83,640
	current_total: z.number(), // Jami (o'yin + buyurtma + xizmat): 514,404
});

// List response
export const SessionListResponseSchema = z.object({
	data: z.array(SessionDetailSchema),
	meta: z.object({
		total: z.number(),
		page: z.number(),
		limit: z.number(),
		total_pages: z.number(),
	}),
});
