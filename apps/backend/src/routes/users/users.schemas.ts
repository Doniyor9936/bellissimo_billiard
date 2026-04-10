import { z } from "@hono/zod-openapi";

import {
	createPaginatedSchema,
	createSuccessSchema,
	dateTimeSchema,
	passwordSchema,
	phoneSchema,
	SuccessMessageSchema,
	uuidSchema,
} from "@/lib";

export const UserResponseSchema = z
	.object({
		id: uuidSchema,
		fullname: z.string().openapi({ example: "Abdullayev Sardor" }),
		phone: phoneSchema,
		// photoId: uuidSchema.nullable(),
		isActive: z.boolean().openapi({ example: true }),
		createdAt: dateTimeSchema,
		updatedAt: dateTimeSchema,
	})
	.openapi("UserResponse");

export const CreateUserSchema = z
	.object({
		fullname: z.string().min(1).max(255).openapi({ example: "Abdullayev Sardor" }),
		phone: phoneSchema,
		password: passwordSchema,
	})
	.openapi("CreateUserRequest");

export const UpdateUserSchema = z
	.object({
		fullname: z.string().min(1).max(255).optional().openapi({ example: "Abdullayev Sardor" }),
		phone: phoneSchema.optional(),
		password: passwordSchema.optional(),
		isActive: z.boolean().optional().openapi({ example: true }),
	})
	.openapi("UpdateUserRequest");

export const SingleUserResponse = createSuccessSchema(UserResponseSchema, "User");
export const PaginatedUsersResponse = createPaginatedSchema(UserResponseSchema, "Users");
export { SuccessMessageSchema as DeleteUserResponse };
