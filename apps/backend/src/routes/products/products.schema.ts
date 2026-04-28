import { z } from "@hono/zod-openapi";
import { createSelectSchema } from "drizzle-zod";
import { inventoryLogs, productCategoryEnum, products, productUnitEnum } from "@/db/schema";

export const ProductSchema = createSelectSchema(products);
export const InventoryLogSchema = createSelectSchema(inventoryLogs);

export const CreateProductSchema = z
	.object({
		name: z.string().min(1).max(150).openapi({ example: "Pivo «Sarbast» 0.5" }),
		category: z.enum(productCategoryEnum.enumValues).openapi({ example: "ichimlik" }),
		unit: z.enum(productUnitEnum.enumValues).openapi({ example: "shisha" }),
		costPrice: z.number().int().positive().optional().openapi({ example: 12000 }),
		sellingPrice: z.number().int().positive().openapi({ example: 25000 }),
		stockQuantity: z.number().int().min(0).default(0).openapi({ example: 40 }),
		minStock: z.number().int().min(0).default(5).openapi({ example: 24 }),
		isAvailable: z.boolean().default(true),
		isSoldSeparately: z.boolean().default(true),
		sortOrder: z.number().int().default(0),
		description: z.string().optional(),
		imageUrl: z.string().url().optional(),
	})
	.openapi({
		title: "CreateProductSchema",
		description: "Mahsulot yaratish uchun kerakli ma'lumotlar",
		example: {
			name: "Pivo «Sarbast» 0.5",
			category: "ichimlik",
			unit: "shisha",
			costPrice: 12000,
			sellingPrice: 25000,
			stockQuantity: 40,
			minStock: 24,
			isAvailable: true,
			isSoldSeparately: true,
			sortOrder: 0,
			description: "Bu mahsulot Pivo «Sarbast» 0.5 shisha ichimligi.",
			imageUrl:
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
	isAvailable: z.enum(["true", "false"]).optional(),
	lowStock: z
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
		totalPages: z.number(),
	}),
});

// Ombor kirim
export const StockInSchema = z.object({
	quantity: z.number().int().positive().openapi({ example: 20 }),
	unitCost: z.number().int().positive().optional().openapi({ example: 12000 }),
	reason: z.string().optional().openapi({ example: "Yangi partiya" }),
});
