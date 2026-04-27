import { z } from "@hono/zod-openapi";
import { createSelectSchema } from "drizzle-zod";
import { inventory_logs, productCategoryEnum, products, productUnitEnum } from "@/db/schema";

export const ProductSchema = createSelectSchema(products);
export const InventoryLogSchema = createSelectSchema(inventory_logs);

export const CreateProductSchema = z
	.object({
		name: z.string().min(1).max(150).openapi({ example: "Pivo «Sarbast» 0.5" }),
		category: z.enum(productCategoryEnum.enumValues).openapi({ example: "ichimlik" }),
		unit: z.enum(productUnitEnum.enumValues).openapi({ example: "shisha" }),
		cost_price: z.number().int().positive().optional().openapi({ example: 12000 }),
		selling_price: z.number().int().positive().openapi({ example: 25000 }),
		stock_quantity: z.number().int().min(0).default(0).openapi({ example: 40 }),
		min_stock: z.number().int().min(0).default(5).openapi({ example: 24 }),
		is_available: z.boolean().default(true),
		is_sold_separately: z.boolean().default(true),
		sort_order: z.number().int().default(0),
		description: z.string().optional(),
		image_url: z.string().url().optional(),
	})
	.openapi({
		title: "CreateProductSchema",
		description: "Mahsulot yaratish uchun kerakli ma'lumotlar",
		example: {
			name: "Pivo «Sarbast» 0.5",
			category: "ichimlik",
			unit: "shisha",
			cost_price: 12000,
			selling_price: 25000,
			stock_quantity: 40,
			min_stock: 24,
			is_available: true,
			is_sold_separately: true,
			sort_order: 0,
			description: "Bu mahsulot Pivo «Sarbast» 0.5 shisha ichimligi.",
			image_url:
				"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnHe73Bd3b4ycptC9vydrHOFKv57yyvVW8Qw&s",
		},
	});

export const UpdateProductSchema = CreateProductSchema.partial();

export const ProductParamsSchema = z.object({
	id: z
		.string()
		.uuid()
		.openapi({
			param: { name: "id", in: "path" },
			example: "123e4567-e89b-12d3-a456-426614174000",
		}),
});

export const ProductListQuerySchema = z.object({
	search: z.string().optional(),
	category: z.enum(productCategoryEnum.enumValues).optional(),
	is_available: z.enum(["true", "false"]).optional(),
	low_stock: z
		.enum(["true", "false"])
		.optional()
		.transform((v) => v === "true"),
	page: z.string().optional().default("1").transform(Number).pipe(z.number().int().min(1)),
	limit: z
		.string()
		.optional()
		.default("20")
		.transform(Number)
		.pipe(z.number().int().min(1).max(100)),
});

export const ProductListResponseSchema = z.object({
	data: z.array(ProductSchema),
	meta: z.object({
		total: z.number(),
		page: z.number(),
		limit: z.number(),
		total_pages: z.number(),
	}),
});

// Ombor kirim
export const StockInSchema = z.object({
	quantity: z.number().int().positive().openapi({ example: 20 }),
	unit_cost: z.number().int().positive().optional().openapi({ example: 12000 }),
	reason: z.string().optional().openapi({ example: "Yangi partiya" }),
});
