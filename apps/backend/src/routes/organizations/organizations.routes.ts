import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContentRequired } from "stoker/openapi/helpers";

import { commonResponses } from "@/lib";
import {
	createOrganizationSchema,
	deleteOrganizationResponseSchema,
	OrganizationResponseSchema,
	organizationIdParamSchema,
	organizationListQuerySchema,
	organizationPaginatedResponseSchema,
	updateOrganizationSchema,
} from "./organizations.schema";

const tags = ["Organizations"];

export const listOrganizations = createRoute({
	method: "get",
	path: "/",
	tags,
	summary: "List organizations",
	description: "Tashkilotlar ro'yxatini olish (superadmin — hammasi, admin — permission asosida)",
	request: {
		query: organizationListQuerySchema,
	},
	responses: {
		[HttpStatusCodes.OK]: {
			content: {
				"application/json": {
					schema: organizationPaginatedResponseSchema,
				},
			},
			description: "Tashkilotlar ro'yxati",
		},
		...commonResponses,
	},
});

export const getOrganization = createRoute({
	method: "get",
	path: "/{id}",
	tags,
	summary: "Get organization by ID",
	description: "Tashkilotni ID bo'yicha olish",
	request: {
		params: organizationIdParamSchema,
	},
	responses: {
		[HttpStatusCodes.OK]: {
			content: {
				"application/json": {
					schema: OrganizationResponseSchema,
				},
			},
			description: "Tashkilot ma'lumotlari",
		},
		...commonResponses,
	},
});

export const createOrganization = createRoute({
	method: "post",
	path: "/",
	tags,
	summary: "Create organization",
	description: "Yangi tashkilot yaratish (superadmin yoki organizations:create ruxsati bilan)",
	request: {
		body: jsonContentRequired(createOrganizationSchema, "Tashkilot ma'lumotlari"),
	},
	responses: {
		[HttpStatusCodes.CREATED]: {
			content: {
				"application/json": {
					schema: OrganizationResponseSchema,
				},
			},
			description: "Tashkilot yaratildi",
		},
		...commonResponses,
	},
});

export const updateOrganization = createRoute({
	method: "patch",
	path: "/{id}",
	tags,
	summary: "Update organization",
	description:
		"Tashkilot ma'lumotlarini yangilash (superadmin yoki organizations:update ruxsati bilan)",
	request: {
		params: organizationIdParamSchema,
		body: jsonContentRequired(updateOrganizationSchema, "Yangilanadigan ma'lumotlar"),
	},
	responses: {
		[HttpStatusCodes.OK]: {
			content: {
				"application/json": {
					schema: OrganizationResponseSchema,
				},
			},
			description: "Tashkilot yangilandi",
		},
		...commonResponses,
	},
});

export const deleteOrganization = createRoute({
	method: "delete",
	path: "/{id}",
	tags,
	summary: "Delete organization",
	description: "Tashkilotni o'chirish (superadmin yoki organizations:delete ruxsati bilan)",
	request: {
		params: organizationIdParamSchema,
	},
	responses: {
		[HttpStatusCodes.OK]: {
			content: {
				"application/json": {
					schema: deleteOrganizationResponseSchema,
				},
			},
			description: "Tashkilot o'chirildi",
		},
		...commonResponses,
	},
});
