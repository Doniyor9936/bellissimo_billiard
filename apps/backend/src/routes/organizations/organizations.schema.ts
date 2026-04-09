import { z } from "@hono/zod-openapi";

// ─── Request Schemas ──────────────────────────────────────────────────────────

export const organizationIdParamSchema = z
	.object({
		id: z.string().uuid().openapi({
			example: "123e4567-e89b-12d3-a456-426614174000",
		}),
	})
	.openapi("OrganizationIdParam");

export const organizationListQuerySchema = z
	.object({
		search: z.string().optional().openapi({
			example: "Tashkent",
			description: "Nomi bo'yicha qidirish",
		}),
		page: z.coerce.number().min(1).default(1).openapi({
			example: 1,
		}),
		limit: z.coerce.number().min(1).max(100).default(10).openapi({
			example: 10,
		}),
	})
	.openapi("OrganizationListQuery");

export const createOrganizationSchema = z
	.object({
		name: z.string().min(1).max(255).openapi({
			example: "Tashkent Qurilish",
			description: "Tashkilot nomi",
		}),
	})
	.openapi("CreateOrganizationRequest");

export const updateOrganizationSchema = createOrganizationSchema
	.partial()
	.openapi("UpdateOrganizationRequest");

// ─── Response Schemas ─────────────────────────────────────────────────────────

export const OrganizationResponseSchema = z
	.object({
		id: z.string().uuid().openapi({
			example: "123e4567-e89b-12d3-a456-426614174000",
		}),
		name: z.string().openapi({
			example: "Tashkent Qurilish",
		}),
		createdAt: z.string().datetime().openapi({
			example: "2024-01-15T10:30:00.000Z",
		}),
		updatedAt: z.string().datetime().openapi({
			example: "2024-01-15T10:30:00.000Z",
		}),
	})
	.openapi("OrganizationResponse");

export const organizationPaginatedResponseSchema = z
	.object({
		success: z.literal(true),
		data: z.object({
			items: z.array(OrganizationResponseSchema),
			pagination: z.object({
				page: z.number().openapi({ example: 1 }),
				limit: z.number().openapi({ example: 10 }),
				total: z.number().openapi({ example: 100 }),
				totalPages: z.number().openapi({ example: 10 }),
			}),
		}),
	})
	.openapi("OrganizationPaginatedResponse");

export const singleOrganizationResponseSchema = z
	.object({
		success: z.literal(true),
		data: OrganizationResponseSchema,
	})
	.openapi("SingleOrganizationResponse");

export const deleteOrganizationResponseSchema = z
	.object({
		success: z.literal(true),
		data: z.object({
			message: z.string().openapi({
				example: "Tashkilot muvaffaqiyatli o'chirildi",
			}),
		}),
	})
	.openapi("DeleteOrganizationResponse");

// ─── Types ────────────────────────────────────────────────────────────────────

export type CreateOrganizationDto = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganizationDto = z.infer<typeof updateOrganizationSchema>;
export type OrganizationListQuery = z.infer<typeof organizationListQuerySchema>;
export type OrganizationOutput = z.infer<typeof OrganizationResponseSchema>;
