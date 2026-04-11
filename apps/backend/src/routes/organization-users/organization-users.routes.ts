import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContentRequired } from "stoker/openapi/helpers";

import { commonResponses, IdParamSchema, PaginationQuerySchema, uuidSchema } from "@/lib";

import {
	CreateOrganizationUserSchema,
	DeleteOrganizationUserResponse,
	OrganizationParamSchema,
	PaginatedOrganizationUsersResponse,
	SingleOrganizatonUserResponse,
	UpdateOrganizationUserSchema,
} from "./organization-users.schemas";

const tags = ["Organization Users"];

export const listOrganizationUsers = createRoute({
	method: "get",
	path: "/{organizationId}/users",
	tags,
	summary: "List organization users",
	description: "Foydalanuvchilar ro'yxatini olish",
	request: {
		params: OrganizationParamSchema,
		query: PaginationQuerySchema,
	},
	responses: {
		[HttpStatusCodes.OK]: {
			content: {
				"application/json": {
					schema: PaginatedOrganizationUsersResponse,
				},
			},
			description: "Foydalanuvchilar ro'yxati",
		},
		...commonResponses,
	},
});

export const getOrganizationUser = createRoute({
	method: "get",
	path: "/{organizationId}/users/{id}",
	tags,
	summary: "Get organization user by ID",
	description: "Foydalanuvchini ID bo'yicha olish",
	request: {
		params: IdParamSchema.extend({ organizationId: uuidSchema }),
	},
	responses: {
		[HttpStatusCodes.OK]: {
			content: {
				"application/json": {
					schema: SingleOrganizatonUserResponse,
				},
			},
			description: "Foydalanuvchi ma'lumotlari",
		},
		...commonResponses,
	},
});

export const createOrganizationUser = createRoute({
	method: "post",
	path: "/{organizationId}/users",
	tags,
	summary: "Create organization user",
	description: "Yangi foydalanuvchi yaratish",
	request: {
		params: OrganizationParamSchema,
		body: jsonContentRequired(CreateOrganizationUserSchema, "Foydalanuvchi ma'lumotlari"),
	},
	responses: {
		[HttpStatusCodes.CREATED]: {
			content: {
				"application/json": {
					schema: SingleOrganizatonUserResponse,
				},
			},
			description: "Foydalanuvchi yaratildi",
		},
		...commonResponses,
	},
});

export const updateOrganizationUser = createRoute({
	method: "patch",
	path: "/{organizationId}/users/{id}",
	tags,
	summary: "Update Organization user",
	description: "Foydalanuvchi ma'lumotlarini yangilash",
	request: {
		params: IdParamSchema.extend({ organizationId: uuidSchema }),
		body: jsonContentRequired(UpdateOrganizationUserSchema, "Yangilanadigan ma'lumotlar"),
	},
	responses: {
		[HttpStatusCodes.OK]: {
			content: {
				"application/json": {
					schema: SingleOrganizatonUserResponse,
				},
			},
			description: "Foydalanuvchi yangilandi",
		},
		...commonResponses,
	},
});

export const deleteOrganizationUser = createRoute({
	method: "delete",
	path: "/{organizationId}/users/{id}",
	tags,
	summary: "Delete Organization user",
	description: "Foydalanuvchini o'chirish (soft delete)",
	request: {
		params: IdParamSchema.extend({ organizationId: uuidSchema }),
	},
	responses: {
		[HttpStatusCodes.OK]: {
			content: {
				"application/json": {
					schema: DeleteOrganizationUserResponse,
				},
			},
			description: "Foydalanuvchi o'chirildi",
		},
		...commonResponses,
	},
});
