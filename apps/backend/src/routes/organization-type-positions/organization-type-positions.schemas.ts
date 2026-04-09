import { z } from "@hono/zod-openapi";

import {
	createPaginatedSchema,
	createSuccessSchema,
	dateTimeSchema,
	SuccessMessageSchema,
	uuidSchema,
} from "@/lib";

import { OrganizationTypeResponseSchema } from "../organization-types/organization-types.schemas";

export const OrganizationTypePositionResponseSchema = z
	.object({
		id: uuidSchema,
		name: z.string().openapi({ example: "O'qituvchi" }),
		type: OrganizationTypeResponseSchema.optional(),
		createdAt: dateTimeSchema,
		updatedAt: dateTimeSchema,
	})
	.openapi("OrganizationTypePositionResponse");

export const CreateOrganizationTypePositionSchema = z
	.object({
		name: z.string().min(1).max(255).openapi({ example: "O'qituvchi" }),
		typeId: uuidSchema,
	})
	.openapi("CreateOrganizationTypePositionRequest");

export const UpdateOrganizationTypePositionSchema = z
	.object({
		name: z.string().min(1).max(255).optional().openapi({ example: "O'qituvchi" }),
	})
	.openapi("UpdateOrganizationTypePositionRequest");

export const SingleOrganizationTypePositionResponse = createSuccessSchema(
	OrganizationTypeResponseSchema,
	"OrganizationTypePosition"
);
export const PaginatedOrganizationTypePositionsResponse = createPaginatedSchema(
	OrganizationTypeResponseSchema,
	"OrganizationTypePositions"
);
export { SuccessMessageSchema as DeleteOrganizationTypePositionResponse };
