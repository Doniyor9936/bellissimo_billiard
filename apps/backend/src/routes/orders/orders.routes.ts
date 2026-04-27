import { createRoute } from "@hono/zod-openapi";
import { commonResponses } from "@/lib";
import {
	AddOrderItemsSchema,
	OrderDetailSchema,
	OrderItemParamsSchema,
	OrderItemSchema,
	OrderParamsSchema,
	UpdateOrderItemSchema,
} from "./orders.schema";

const tags = ["Orders"];

// Sessiyaning barcha buyurtmalari
export const getSessionOrders = createRoute({
	path: "/session/{id}",
	method: "get",
	tags,
	request: { params: OrderParamsSchema },
	responses: {
		200: {
			content: { "application/json": { schema: OrderDetailSchema } },
			description: "Sessiya buyurtmalari",
		},
		...commonResponses,
	},
});

// Buyurtma qo'shish
export const addOrderItems = createRoute({
	path: "/",
	method: "post",
	tags,
	request: {
		body: {
			content: { "application/json": { schema: AddOrderItemsSchema } },
		},
	},
	responses: {
		201: {
			content: { "application/json": { schema: OrderDetailSchema } },
			description: "Buyurtma qo'shildi",
		},

		...commonResponses,
	},
});

// Buyurtma itemini o'zgartirish (miqdor)
export const updateOrderItem = createRoute({
	path: "/items/{id}",
	method: "patch",
	tags,
	request: {
		params: OrderItemParamsSchema,
		body: {
			content: { "application/json": { schema: UpdateOrderItemSchema } },
		},
	},
	responses: {
		200: {
			content: { "application/json": { schema: OrderItemSchema } },
			description: "Miqdor yangilandi",
		},

		...commonResponses,
	},
});

// Buyurtma itemini o'chirish
export const removeOrderItem = createRoute({
	path: "/items/{id}",
	method: "delete",
	tags,
	request: { params: OrderItemParamsSchema },
	responses: {
		204: { description: "O'chirildi" },
		...commonResponses,
	},
});
