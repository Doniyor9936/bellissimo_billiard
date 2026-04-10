import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContentRequired } from "stoker/openapi/helpers";

import { commonResponses, IdParamSchema, PaginationQuerySchema } from "@/lib";

import {
	CreateOrganizationTypePositionSchema,
	DeleteOrganizationTypePositionResponse,
	PaginatedOrganizationTypePositionsResponse,
	SingleOrganizationTypePositionResponse,
	UpdateOrganizationTypePositionSchema,
} from "./organization-type-positions.schemas";

const tags = ["Organization Type Positions"];

export const listOrganizationTypePositions = createRoute({
	method: "get",
	path: "/",
	tags,
	summary: "List organization type positionss",
	description: "Tashkilot tur positsiyalarini ro'yxatini olish",
	request: {
		query: PaginationQuerySchema,
	},
	responses: {
		[HttpStatusCodes.OK]: {
			content: {
				"application/json": {
					schema: PaginatedOrganizationTypePositionsResponse,
				},
			},
			description: "Tashkilot tur positsiyalari ro'yxati",
		},
		...commonResponses,
	},
});

export const getOrganizationTypePosition = createRoute({
	method: "get",
	path: "/{id}",
	tags,
	summary: "Get organization type position by ID",
	description: "Tashkilot tur positsini ID bo'yicha olish",
	request: {
		params: IdParamSchema,
	},
	responses: {
		[HttpStatusCodes.OK]: {
			content: {
				"application/json": {
					schema: SingleOrganizationTypePositionResponse,
				},
			},
			description: "Tashkilot tur positsiyasi ma'lumotlari",
		},
		...commonResponses,
	},
});

export const createOrganizationTypePosition = createRoute({
	method: "post",
	path: "/",
	tags,
	summary: "Create organization type position",
	description: "Yangi tashkilot tur positsiyasi yaratish",
	request: {
		body: jsonContentRequired(CreateOrganizationTypePositionSchema, "Tashkilot turi ma'lumotlari"),
	},
	responses: {
		[HttpStatusCodes.CREATED]: {
			content: {
				"application/json": {
					schema: SingleOrganizationTypePositionResponse,
				},
			},
			description: "Tashkilot turi yaratildi",
		},
		...commonResponses,
	},
});

export const updateOrganizationTypePositon = createRoute({
	method: "patch",
	path: "/{id}",
	tags,
	summary: "Update organization type",
	description: "Tashkilot turi ma'lumotlarini yangilash",
	request: {
		params: IdParamSchema,
		body: jsonContentRequired(UpdateOrganizationTypePositionSchema, "Yangilanadigan ma'lumotlar"),
	},
	responses: {
		[HttpStatusCodes.OK]: {
			content: {
				"application/json": {
					schema: SingleOrganizationTypePositionResponse,
				},
			},
			description: "Tashkilot turi yangilandi",
		},
		...commonResponses,
	},
});

export const deleteOrganizationTypePosition = createRoute({
	method: "delete",
	path: "/{id}",
	tags,
	summary: "Delete organization type",
	description: "Tashkilot turini o'chirish (soft delete)",
	request: {
		params: IdParamSchema,
	},
	responses: {
		[HttpStatusCodes.OK]: {
			content: {
				"application/json": {
					schema: DeleteOrganizationTypePositionResponse,
				},
			},
			description: "Tashkilot turi o'chirildi",
		},
		...commonResponses,
	},
});
