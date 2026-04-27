import { createRoute } from "@hono/zod-openapi";
import { commonResponses } from "@/lib";
import {
	CreateTableSchema,
	TableListQuerySchema,
	TableListResponseSchema,
	TableParamsSchema,
	TableSchema,
	UpdateTableSchema,
} from "./tables.schema";

export const fullTables = createRoute({
	path: "/",
	method: "get",
	tags: ["Tables"],
	request: { query: TableListQuerySchema },
	responses: {
		200: {
			content: {
				"application/json": {
					schema: TableListResponseSchema,
				},
			},
			description: "Tables list",
		},
		...commonResponses,
	},
});

export const createTables = createRoute({
	path: "/",
	method: "post",
	tags: ["Tables"],
	request: {
		body: {
			content: {
				"application/json": {
					schema: CreateTableSchema,
				},
			},
		},
	},
	responses: {
		201: {
			content: {
				"application/json": {
					schema: TableSchema,
				},
			},
			description: "Table created",
		},
		...commonResponses,
	},
});

export const getOneTable = createRoute({
	path: "/{id}",
	method: "get",
	tags: ["Tables"],
	request: {
		params: TableParamsSchema,
	},
	responses: {
		200: {
			content: {
				"application/json": {
					schema: TableSchema,
				},
			},
			description: "Table details",
		},
		...commonResponses,
	},
});

export const updateTable = createRoute({
	path: "/{id}",
	method: "put",
	tags: ["Tables"],
	request: {
		params: TableParamsSchema,
		body: {
			content: {
				"application/json": {
					schema: UpdateTableSchema,
				},
			},
		},
	},
	responses: {
		200: {
			content: {
				"application/json": {
					schema: TableSchema,
				},
			},
			description: "Table updated",
		},
		...commonResponses,
	},
});

export const deleteTable = createRoute({
	path: "/{id}",
	method: "delete",
	tags: ["Tables"],
	request: {
		params: TableParamsSchema,
	},
	responses: {
		204: {
			description: "Table deleted",
		},
		...commonResponses,
	},
});
