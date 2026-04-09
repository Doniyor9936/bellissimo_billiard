import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContentRequired } from "stoker/openapi/helpers";

import { commonResponses, IdParamSchema, PaginationQuerySchema } from "@/lib";

import {
	CreateOrganizationTypeSchema,
	DeleteOrganizationTypeResponse,
	PaginatedOrganizationTypesResponse,
	SingleOrganizationTypeResponse,
	UpdateOrganizationTypeSchema,
} from "./organization-types.schemas";

const tags = ["Organization Types"];

export const listOrganizationTypes = createRoute({
	method: "get",
	path: "/",
	tags,
	summary: "List organization types",
	description: "Tashkilot turlarini ro'yxatini olish",
	request: {
		query: PaginationQuerySchema,
	},
	responses: {
		[HttpStatusCodes.OK]: {
			content: {
				"application/json": {
					schema: PaginatedOrganizationTypesResponse,
				},
			},
			description: "Tashkilot turlari ro'yxati",
		},
		...commonResponses,
	},
});

export const getOrganizationType = createRoute({
	method: "get",
	path: "/{id}",
	tags,
	summary: "Get organization type by ID",
	description: "Tashkilot turini ID bo'yicha olish",
	request: {
		params: IdParamSchema,
	},
	responses: {
		[HttpStatusCodes.OK]: {
			content: {
				"application/json": {
					schema: SingleOrganizationTypeResponse,
				},
			},
			description: "Tashkilot turi ma'lumotlari",
		},
		...commonResponses,
	},
});

export const createOrganizationType = createRoute({
	method: "post",
	path: "/",
	tags,
	summary: "Create organization type",
	description: "Yangi tashkilot turi yaratish",
	request: {
		body: jsonContentRequired(CreateOrganizationTypeSchema, "Tashkilot turi ma'lumotlari"),
	},
	responses: {
		[HttpStatusCodes.CREATED]: {
			content: {
				"application/json": {
					schema: SingleOrganizationTypeResponse,
				},
			},
			description: "Tashkilot turi yaratildi",
		},
		...commonResponses,
	},
});

export const updateOrganizationType = createRoute({
	method: "patch",
	path: "/{id}",
	tags,
	summary: "Update organization type",
	description: "Tashkilot turi ma'lumotlarini yangilash",
	request: {
		params: IdParamSchema,
		body: jsonContentRequired(UpdateOrganizationTypeSchema, "Yangilanadigan ma'lumotlar"),
	},
	responses: {
		[HttpStatusCodes.OK]: {
			content: {
				"application/json": {
					schema: SingleOrganizationTypeResponse,
				},
			},
			description: "Tashkilot turi yangilandi",
		},
		...commonResponses,
	},
});

export const deleteOrganizationType = createRoute({
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
					schema: DeleteOrganizationTypeResponse,
				},
			},
			description: "Tashkilot turi o'chirildi",
		},
		...commonResponses,
	},
});
