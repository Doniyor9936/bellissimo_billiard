import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContentRequired } from "stoker/openapi/helpers";

import { commonResponses, IdParamSchema, PaginationQuerySchema } from "@/lib";

import {
	CreateUserSchema,
	DeleteUserResponse,
	PaginatedUsersResponse,
	SingleUserResponse,
	UpdateUserSchema,
} from "./users.schemas";

const tags = ["Users"];

export const listUsers = createRoute({
	method: "get",
	path: "/",
	tags,
	summary: "List users",
	description: "Foydalanuvchilar ro'yxatini olish",
	request: {
		query: PaginationQuerySchema,
	},
	responses: {
		[HttpStatusCodes.OK]: {
			content: {
				"application/json": {
					schema: PaginatedUsersResponse,
				},
			},
			description: "Foydalanuvchilar ro'yxati",
		},
		...commonResponses,
	},
});

export const getUser = createRoute({
	method: "get",
	path: "/{id}",
	tags,
	summary: "Get user by ID",
	description: "Foydalanuvchini ID bo'yicha olish",
	request: {
		params: IdParamSchema,
	},
	responses: {
		[HttpStatusCodes.OK]: {
			content: {
				"application/json": {
					schema: SingleUserResponse,
				},
			},
			description: "Foydalanuvchi ma'lumotlari",
		},
		...commonResponses,
	},
});

export const createUser = createRoute({
	method: "post",
	path: "/",
	tags,
	summary: "Create user",
	description: "Yangi foydalanuvchi yaratish",
	request: {
		body: jsonContentRequired(CreateUserSchema, "Foydalanuvchi ma'lumotlari"),
	},
	responses: {
		[HttpStatusCodes.CREATED]: {
			content: {
				"application/json": {
					schema: SingleUserResponse,
				},
			},
			description: "Foydalanuvchi yaratildi",
		},
		...commonResponses,
	},
});

export const updateUser = createRoute({
	method: "patch",
	path: "/{id}",
	tags,
	summary: "Update user",
	description: "Foydalanuvchi ma'lumotlarini yangilash",
	request: {
		params: IdParamSchema,
		body: jsonContentRequired(UpdateUserSchema, "Yangilanadigan ma'lumotlar"),
	},
	responses: {
		[HttpStatusCodes.OK]: {
			content: {
				"application/json": {
					schema: SingleUserResponse,
				},
			},
			description: "Foydalanuvchi yangilandi",
		},
		...commonResponses,
	},
});

export const deleteUser = createRoute({
	method: "delete",
	path: "/{id}",
	tags,
	summary: "Delete user",
	description: "Foydalanuvchini o'chirish (soft delete)",
	request: {
		params: IdParamSchema,
	},
	responses: {
		[HttpStatusCodes.OK]: {
			content: {
				"application/json": {
					schema: DeleteUserResponse,
				},
			},
			description: "Foydalanuvchi o'chirildi",
		},
		...commonResponses,
	},
});
