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
import { OrganizationTypePositionResponseSchema } from "../organization-type-positions/organization-type-positions.schemas";
import { UserResponseSchema } from "../users/users.schemas";

export const OrganizationParamSchema = z.object({
	organizationId: uuidSchema.openapi({
		example: "123e4567-e89b-12d3-a456-426614174000",
	}),
});

export const OrganizationUserResponseSchema = z
	.object({
		id: uuidSchema,
		user: UserResponseSchema,
		position: OrganizationTypePositionResponseSchema,
		isPrimary: z.boolean().openapi({ example: true }),
		createdAt: dateTimeSchema,
		updatedAt: dateTimeSchema,
	})
	.openapi("OrganizationUserResponse");

export const CreateOrganizationUserSchema = z
	.array(
		z.object({
			fullname: z.string().min(1).max(255).optional().openapi({ example: "Abdullayev Sardor" }),
			phone: phoneSchema.optional(),
			password: passwordSchema.optional(),
			userId: uuidSchema.optional(),
			positionId: uuidSchema,
			isPrimary: z.boolean().optional().openapi({ example: true }),
		})
	)
	.openapi("CreateOrganizatonUserRequest");

export const UpdateOrganizationUserSchema = z
	.object({
		positionId: uuidSchema.optional(),
		isPrimary: z.boolean().optional().openapi({ example: true }),
		isActive: z.boolean().optional().openapi({ example: true }),
	})
	.openapi("UpdateOrganizationUserRequest");

export const SingleOrganizatonUserResponse = createSuccessSchema(
	OrganizationUserResponseSchema,
	"OrganizationUser"
);
export const PaginatedOrganizationUsersResponse = createPaginatedSchema(
	OrganizationUserResponseSchema,
	"OrganizaitonUsers"
);
export { SuccessMessageSchema as DeleteOrganizationUserResponse };
