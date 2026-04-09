import { z } from "@hono/zod-openapi";

import {
	createPaginatedSchema,
	createSuccessSchema,
	dateTimeSchema,
	SuccessMessageSchema,
	uuidSchema,
} from "@/lib";
import { OrganizationResponseSchema } from "../organizations/organizations.schema";

export const crossAccessTypeSchema = z.enum(["READ", "WRITE"]).openapi({
	example: "READ",
});

export const OrganizationCrossAccessResponseSchema = z
	.object({
		id: uuidSchema,
		accessType: crossAccessTypeSchema,
		viewer: OrganizationResponseSchema.optional(),
		target: OrganizationResponseSchema.optional(),
		createdAt: dateTimeSchema,
		updatedAt: dateTimeSchema,
		isDeleted: z.boolean().openapi({ example: false }),
		deletedAt: dateTimeSchema.nullable(),
	})
	.openapi("OrganizationCrossAccessResponse");

export const CreateOrganizationCrossAccessSchema = z
	.object({
		viewerId: uuidSchema.openapi({ example: "viewer org id" }),
		targetId: uuidSchema.openapi({ example: "target org id" }),
		accessType: crossAccessTypeSchema,
	})
	.openapi("CreateOrganizationCrossAccessRequest");

export const UpdateOrganizationCrossAccessSchema = z
	.object({
		viewerId: uuidSchema.optional(),
		targetId: uuidSchema.optional(),
		accessType: crossAccessTypeSchema.optional(),
	})
	.openapi("UpdateOrganizationCrossAccessRequest");

export const SingleOrganizationCrossAccessResponse = createSuccessSchema(
	OrganizationCrossAccessResponseSchema,
	"OrganizationCrossAccess"
);

export const PaginatedOrganizationCrossAccessResponse = createPaginatedSchema(
	OrganizationCrossAccessResponseSchema,
	"OrganizationCrossAccessList"
);

export { SuccessMessageSchema as DeleteOrganizationCrossAccessResponse };
