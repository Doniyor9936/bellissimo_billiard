import { z } from "@hono/zod-openapi";

import {
	createPaginatedSchema,
	createSuccessSchema,
	dateTimeSchema,
	SuccessMessageSchema,
	uuidSchema,
} from "@/lib";

export const OrganizationTypeResponseSchema = z
	.object({
		id: uuidSchema,
		name: z.string().openapi({ example: "Maktab" }),
		createdAt: dateTimeSchema,
		updatedAt: dateTimeSchema,
	})
	.openapi("OrganizationTypeResponse");

export const CreateOrganizationTypeSchema = z
	.object({
		name: z.string().min(1).max(255).openapi({ example: "Maktab" }),
	})
	.openapi("CreateOrganizationTypeRequest");

export const UpdateOrganizationTypeSchema = z
	.object({
		name: z.string().min(1).max(255).optional().openapi({ example: "Maktab" }),
	})
	.openapi("UpdateOrganizationTypeRequest");

export const SingleOrganizationTypeResponse = createSuccessSchema(
	OrganizationTypeResponseSchema,
	"OrganizationType"
);
export const PaginatedOrganizationTypesResponse = createPaginatedSchema(
	OrganizationTypeResponseSchema,
	"OrganizationTypes"
);
export { SuccessMessageSchema as DeleteOrganizationTypeResponse };
