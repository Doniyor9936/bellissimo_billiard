import { createRoute } from "@hono/zod-openapi";
import { commonResponses } from "@/lib";
import {
	DiscountSchema,
	OpenSessionSchema,
	SessionDetailSchema,
	SessionListQuerySchema,
	SessionListResponseSchema,
	SessionParamsSchema,
	UpdateRateSchema,
} from "./sessions.schema";

const tags = ["Sessions"];

// Sessiyalar ro'yxati
export const listSessions = createRoute({
	path: "/",
	method: "get",
	tags,
	request: { query: SessionListQuerySchema },
	responses: {
		200: {
			content: { "application/json": { schema: SessionListResponseSchema } },
			description: "Sessiyalar ro'yxati",
		},
		...commonResponses,
	},
});

// Bitta sessiya
export const getOneSession = createRoute({
	path: "/{id}",
	method: "get",
	tags,
	request: { params: SessionParamsSchema },
	responses: {
		200: {
			content: { "application/json": { schema: SessionDetailSchema } },
			description: "Sessiya ma'lumotlari",
		},
		...commonResponses,
	},
});

// Sessiya ochish
export const openSession = createRoute({
	path: "/",
	method: "post",
	tags,
	request: {
		body: {
			content: { "application/json": { schema: OpenSessionSchema } },
		},
	},
	responses: {
		201: {
			content: { "application/json": { schema: SessionDetailSchema } },
			description: "Sessiya ochildi",
		},

		...commonResponses,
	},
});

// Pauza
export const pauseSession = createRoute({
	path: "/{id}/pause",
	method: "post",
	tags,
	request: {
		params: SessionParamsSchema,
	},
	responses: {
		200: {
			content: { "application/json": { schema: SessionDetailSchema } },
			description: "Pauza boshlandi",
		},

		...commonResponses,
	},
});

// Pauzadan davom etish
export const resumeSession = createRoute({
	path: "/{id}/resume",
	method: "post",
	tags,
	request: {
		params: SessionParamsSchema,
	},
	responses: {
		200: {
			content: { "application/json": { schema: SessionDetailSchema } },
			description: "O'yin davom etdi",
		},
		...commonResponses,
	},
});

// Tarifni o'zgartirish
export const updateRate = createRoute({
	path: "/{id}/rate",
	method: "patch",
	tags,
	request: {
		params: SessionParamsSchema,
		body: {
			content: { "application/json": { schema: UpdateRateSchema } },
		},
	},
	responses: {
		200: {
			content: { "application/json": { schema: SessionDetailSchema } },
			description: "Tarif yangilandi",
		},

		...commonResponses,
	},
});

// Chegirma qo'shish
export const applyDiscount = createRoute({
	path: "/{id}/discount",
	method: "patch",
	tags,
	request: {
		params: SessionParamsSchema,
		body: {
			content: { "application/json": { schema: DiscountSchema } },
		},
	},
	responses: {
		200: {
			content: { "application/json": { schema: SessionDetailSchema } },
			description: "Chegirma qo'shildi",
		},

		...commonResponses,
	},
});

// Sessiyani yopish (to'lovga o'tish)
export const closeSession = createRoute({
	path: "/{id}/close",
	method: "post",
	tags,
	request: {
		params: SessionParamsSchema,
	},
	responses: {
		200: {
			content: { "application/json": { schema: SessionDetailSchema } },
			description: "Sessiya yopildi, to'lovga tayyor",
		},

		...commonResponses,
	},
});

// Sessiyani bekor qilish
export const cancelSession = createRoute({
	path: "/{id}/cancel",
	method: "post",
	tags,
	request: {
		params: SessionParamsSchema,
	},
	responses: {
		200: {
			content: { "application/json": { schema: SessionDetailSchema } },
			description: "Sessiya bekor qilindi",
		},
		...commonResponses,
	},
});
