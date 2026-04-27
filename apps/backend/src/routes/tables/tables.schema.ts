import { z } from "@hono/zod-openapi";
import { createSelectSchema } from "drizzle-zod";
import { tableCategoryEnum, tableStatusEnum, tables } from "@/db/schema";

export const TableSchema = createSelectSchema(tables);

export const CreateTableSchema = z
	.object({
		name: z.string().min(1).max(50),
		number: z.number().int().positive(),
		type: z.enum(["america", "rus_piramida", "snooker"]),
		category: z.enum(["standard", "vip"]).default("standard"),
		hourly_rate: z.number().int().positive(),
		min_rate: z.number().int().positive().optional(),
		sort_order: z.number().int().default(0),
		description: z.string().optional(),
	})
	.openapi({
		title: "CreateTableSchema",
		description: "Jadval yaratish uchun kerakli ma'lumotlar",
		example: {
			name: "Jadval 1",
			number: 1,
			type: "america",
			category: "standard",
			hourly_rate: 50000,
			min_rate: 10000,
			sort_order: 0,
			description: "Bu jadval 1 raqamli va standart kategoriyaga mansub.",
		},
	});

export const UpdateTableSchema = CreateTableSchema.partial();

export const UpdateStatusSchema = z.object({
	status: z.enum(["bosh", "band", "bron", "yopiq"]).openapi({
		example: "band",
		title: "UpdateStatusSchema",
	}),
});

export const TableParamsSchema = z.object({
	id: z
		.string()
		.uuid()
		.openapi({
			param: { name: "id", in: "path" },
			example: "123e4567-e89b-12d3-a456-426614174000",
		}),
});

export const TableListQuerySchema = z.object({
	status: z.enum(tableStatusEnum.enumValues).optional().openapi({
		example: "bosh",
		description: "Jadvalning holati bo'yicha filtrlash",
	}),
	category: z.enum(tableCategoryEnum.enumValues).optional().openapi({
		example: "standard",
		description: "Jadvalning kategoriyasi bo'yicha filtrlash",
	}),
	limit: z
		.string()
		.optional()
		.default("20")
		.transform(Number)
		.pipe(z.number().int().min(1).max(100))
		.openapi({
			example: "20",
			description: "Sahifada ko'rsatiladigan elementlar soni",
		}),
	page: z.string().optional().default("1").transform(Number).pipe(z.number().int().min(1)).openapi({
		example: "1",
		description: "Sahifa raqami",
	}),
	search: z.string().optional().openapi({
		example: "1",
		description: "Jadval nomi yoki raqami bo'yicha qidirish",
	}),
});

export const TableListResponseSchema = z.object({
	data: z.array(TableSchema),
	meta: z.object({
		total: z.number(),
		page: z.number(),
		limit: z.number(),
		total_pages: z.number(),
	}),
});
