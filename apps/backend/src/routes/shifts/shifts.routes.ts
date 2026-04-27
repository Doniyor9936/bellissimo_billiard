import { createRoute } from "@hono/zod-openapi";
import { commonResponses } from "@/lib";
import {
	CashTransactionBodySchema,
	CashTransactionSchema,
	OpenShiftSchema,
	ShiftParamsSchema,
	ShiftResponseSchema,
	ShiftSchema,
} from "./shifts.schema";

const tags = ["Shifts"];

export const getActiveShift = createRoute({
	path: "/active",
	method: "get",
	tags,
	responses: {
		200: {
			content: { "application/json": { schema: ShiftResponseSchema } },
			description: "Aktiv smena",
		},
		...commonResponses,
	},
});

export const openShift = createRoute({
	path: "/open",
	method: "post",
	tags,
	request: {
		body: {
			content: { "application/json": { schema: OpenShiftSchema } },
		},
	},
	responses: {
		201: {
			content: { "application/json": { schema: ShiftSchema } },
			description: "Smena ochildi",
		},
		...commonResponses,
	},
});

export const closeShift = createRoute({
	path: "/{id}/close",
	method: "post",
	tags,
	request: {
		params: ShiftParamsSchema,
	},
	responses: {
		200: {
			content: { "application/json": { schema: ShiftResponseSchema } },
			description: "Smena yopildi",
		},

		...commonResponses,
	},
});

export const xReport = createRoute({
	path: "/{id}/x-report",
	method: "get",
	tags,
	request: {
		params: ShiftParamsSchema,
	},
	responses: {
		200: {
			content: { "application/json": { schema: ShiftResponseSchema } },
			description: "X-hisobot",
		},
		...commonResponses,
	},
});

export const cashTransaction = createRoute({
	path: "/{id}/cash",
	method: "post",
	tags,
	request: {
		params: ShiftParamsSchema,
		body: {
			content: { "application/json": { schema: CashTransactionBodySchema } },
		},
	},
	responses: {
		201: {
			content: { "application/json": { schema: CashTransactionSchema } },
			description: "Tranzaksiya amalga oshirildi",
		},

		...commonResponses,
	},
});
