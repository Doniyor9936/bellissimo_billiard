import { and, count, eq } from "drizzle-orm";

import { db } from "@/db";
import type { organizationType } from "@/db/schema/tables/organization-type";
import { organizationTypePosition } from "@/db/schema/tables/organization-type-position";
import { alreadyExists, notFound } from "@/lib/errors";
import type { AppRouteHandler } from "@/lib/types";
import type {
	createOrganizationTypePosition,
	deleteOrganizationTypePosition,
	getOrganizationTypePosition,
	listOrganizationTypePositions,
	updateOrganizationTypePositon,
} from "./organization-type-positions.routes";

export function formatOrganizationTypePosition(
	row: typeof organizationTypePosition.$inferSelect & {
		organizationType?: typeof organizationType.$inferSelect;
	}
) {
	return {
		id: row.id,
		name: row.name,
		type: row.organizationType,
		createdAt: row.createdAt,
		updatedAt: row.updatedAt,
	};
}

export const listHandler: AppRouteHandler<typeof listOrganizationTypePositions> = async (c) => {
	const { page, limit, search, isActive } = c.req.valid("query");
	const offset = (page - 1) * limit;

	const whereConditions = [
		eq(organizationTypePosition.isDeleted, false),
		search ? eq(organizationTypePosition.name, search) : undefined,
		isActive !== undefined ? eq(organizationTypePosition.isDeleted, !isActive) : undefined,
	].filter(Boolean);

	const [items, [total]] = await Promise.all([
		db.query.organizationTypePosition.findMany({
			where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
			limit,
			offset,
			with: { organizationType: true },
			orderBy: (t, { desc }) => [desc(t.createdAt)],
		}),
		db
			.select({ count: count() })
			.from(organizationTypePosition)
			.where(whereConditions.length > 0 ? and(...whereConditions) : undefined),
	]);

	const totalPages = Math.ceil(total.count / limit);

	return c.json(
		{
			success: true as const,
			data: {
				items: items.map(formatOrganizationTypePosition),
				meta: {
					total: total.count,
					page,
					limit,
					totalPages,
				},
			},
		},
		200
	);
};

export const getByIdHandler: AppRouteHandler<typeof getOrganizationTypePosition> = async (c) => {
	const { id } = c.req.valid("param");

	const found = await db.query.organizationTypePosition.findFirst({
		where: and(eq(organizationTypePosition.id, id), eq(organizationTypePosition.isDeleted, false)),
		with: { organizationType: true },
	});

	if (!found) {
		throw notFound("Tashkilot turi", id);
	}

	return c.json(
		{
			success: true as const,
			data: formatOrganizationTypePosition(found),
		},
		200
	);
};

export const createHandler: AppRouteHandler<typeof createOrganizationTypePosition> = async (c) => {
	const body = c.req.valid("json");

	const existing = await db.query.organizationTypePosition.findFirst({
		where: and(
			eq(organizationTypePosition.name, body.name),
			eq(organizationTypePosition.typeId, body.typeId),
			eq(organizationTypePosition.isDeleted, false)
		),
	});

	if (existing) {
		throw alreadyExists("Tashkilot turi", "nomi");
	}

	const [created] = await db
		.insert(organizationTypePosition)
		.values({
			name: body.name,
			typeId: body.typeId,
		})
		.returning();

	return c.json(
		{
			success: true as const,
			data: formatOrganizationTypePosition(created),
		},
		201
	);
};

export const updateHandler: AppRouteHandler<typeof updateOrganizationTypePositon> = async (c) => {
	const { id } = c.req.valid("param");
	const body = c.req.valid("json");

	const existing = await db.query.organizationTypePosition.findFirst({
		where: and(eq(organizationTypePosition.id, id), eq(organizationTypePosition.isDeleted, false)),
	});

	if (!existing) {
		throw notFound("Tashkilot turi", id);
	}

	const updates: Record<string, unknown> = {
		updatedAt: new Date().toISOString(),
	};

	if (body.name !== undefined) {
		if (body.name !== existing.name) {
			const duplicate = await db.query.organizationTypePosition.findFirst({
				where: and(
					eq(organizationTypePosition.name, body.name),
					eq(organizationTypePosition.isDeleted, false)
				),
			});
			if (duplicate) {
				throw alreadyExists("Tashkilot turi", "nomi");
			}
		}
		updates.name = body.name;
	}

	const [updated] = await db
		.update(organizationTypePosition)
		.set(updates)
		.where(eq(organizationTypePosition.id, id))
		.returning();

	return c.json(
		{
			success: true as const,
			data: formatOrganizationTypePosition(updated),
		},
		200
	);
};

export const deleteHandler: AppRouteHandler<typeof deleteOrganizationTypePosition> = async (c) => {
	const { id } = c.req.valid("param");

	const existing = await db.query.organizationTypePosition.findFirst({
		where: and(eq(organizationTypePosition.id, id), eq(organizationTypePosition.isDeleted, false)),
	});

	if (!existing) {
		throw notFound("Tashkilot turi", id);
	}

	await db
		.update(organizationTypePosition)
		.set({ isDeleted: true, deletedAt: new Date().toISOString() })
		.where(eq(organizationTypePosition.id, id));

	return c.json(
		{
			success: true as const,
			data: {
				message: "Tashkilot turi o'chirildi",
			},
		},
		200
	);
};
