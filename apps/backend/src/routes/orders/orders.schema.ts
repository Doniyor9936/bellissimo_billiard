import { z } from "@hono/zod-openapi";
import { createSelectSchema } from "drizzle-zod";
import { order_items, orders } from "@/db/schema";

// DB dan inference
export const OrderSchema = createSelectSchema(orders);
export const OrderItemSchema = createSelectSchema(order_items);

// Buyurtma qo'shish — bir yoki bir nechta mahsulot
export const AddOrderItemsSchema = z.object({
	session_id: z.string().uuid().openapi({
		example: "123e4567-e89b-12d3-a456-426614174000",
		description: "Sessiya ID si",
	}),
	items: z
		.array(
			z.object({
				product_id: z.string().uuid().openapi({
					example: "123e4567-e89b-12d3-a456-426614174000",
				}),
				quantity: z.number().int().positive().openapi({
					example: 2,
				}),
				notes: z.string().optional().openapi({
					example: "Kam tuzli",
				}),
			})
		)
		.min(1)
		.openapi({
			description: "Kamida 1 ta mahsulot bo'lishi kerak",
		}),
});

// Miqdor o'zgartirish
export const UpdateOrderItemSchema = z.object({
	quantity: z.number().int().positive().openapi({
		example: 3,
		description: "Yangi miqdor",
	}),
});

// Params
export const OrderParamsSchema = z.object({
	id: z
		.string()
		.uuid()
		.openapi({
			param: { name: "id", in: "path" },
			example: "123e4567-e89b-12d3-a456-426614174000",
		}),
});

export const OrderItemParamsSchema = z.object({
	id: z
		.string()
		.uuid()
		.openapi({
			param: { name: "id", in: "path" },
			description: "Order item ID si",
		}),
});

// Response — order + items birgalikda
export const OrderDetailSchema = OrderSchema.extend({
	items: z.array(OrderItemSchema),
});
