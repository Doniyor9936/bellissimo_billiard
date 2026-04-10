import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContentRequired } from "stoker/openapi/helpers";

import { commonResponses, IdParamSchema, PaginationQuerySchema } from "@/lib";

import {
	CreateOrganizationCrossAccessSchema,
	DeleteOrganizationCrossAccessResponse,
	PaginatedOrganizationCrossAccessResponse,
	SingleOrganizationCrossAccessResponse,
	UpdateOrganizationCrossAccessSchema,
} from "./organization-cross-access.schemas";

const tags = ["OrganizationCrossAccess"];

export const listOrganizationCrossAccess = createRoute({
	method: "get",
	path: "/",
	tags,
	summary: "List organization cross access",
	description: "Tashkilotlararo kirish huquqlari ro'yxatini olish",
	request: {
		query: PaginationQuerySchema,
	},
	responses: {
		[HttpStatusCodes.OK]: {
			content: {
				"application/json": {
					schema: PaginatedOrganizationCrossAccessResponse,
				},
			},
			description: "Tashkilotlararo kirish huquqlari ro'yxati",
		},
		...commonResponses,
	},
});

export const getOrganizationCrossAccess = createRoute({
	method: "get",
	path: "/{id}",
	tags,
	summary: "Get organization cross access by ID",
	description: "Tashkilotlararo kirish huquqini ID bo'yicha olish",
	request: {
		params: IdParamSchema,
	},
	responses: {
		[HttpStatusCodes.OK]: {
			content: {
				"application/json": {
					schema: SingleOrganizationCrossAccessResponse,
				},
			},
			description: "Tashkilotlararo kirish huquqi ma'lumotlari",
		},
		...commonResponses,
	},
});

export const createOrganizationCrossAccess = createRoute({
	method: "post",
	path: "/",
	tags,
	summary: "Create organization cross access",
	description: "Yangi tashkilotlararo kirish huquqi yaratish",
	request: {
		body: jsonContentRequired(
			CreateOrganizationCrossAccessSchema,
			"Tashkilotlararo kirish huquqi ma'lumotlari"
		),
	},
	responses: {
		[HttpStatusCodes.CREATED]: {
			content: {
				"application/json": {
					schema: SingleOrganizationCrossAccessResponse,
				},
			},
			description: "Tashkilotlararo kirish huquqi yaratildi",
		},
		...commonResponses,
	},
});

export const updateOrganizationCrossAccess = createRoute({
	method: "patch",
	path: "/{id}",
	tags,
	summary: "Update organization cross access",
	description: "Tashkilotlararo kirish huquqi ma'lumotlarini yangilash",
	request: {
		params: IdParamSchema,
		body: jsonContentRequired(UpdateOrganizationCrossAccessSchema, "Yangilanadigan ma'lumotlar"),
	},
	responses: {
		[HttpStatusCodes.OK]: {
			content: {
				"application/json": {
					schema: SingleOrganizationCrossAccessResponse,
				},
			},
			description: "Tashkilotlararo kirish huquqi yangilandi",
		},
		...commonResponses,
	},
});

export const deleteOrganizationCrossAccess = createRoute({
	method: "delete",
	path: "/{id}",
	tags,
	summary: "Delete organization cross access",
	description: "Tashkilotlararo kirish huquqini o'chirish (soft delete)",
	request: {
		params: IdParamSchema,
	},
	responses: {
		[HttpStatusCodes.OK]: {
			content: {
				"application/json": {
					schema: DeleteOrganizationCrossAccessResponse,
				},
			},
			description: "Tashkilotlararo kirish huquqi o'chirildi",
		},
		...commonResponses,
	},
});
