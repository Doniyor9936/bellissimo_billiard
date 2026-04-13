import { and, count, eq, ilike } from "drizzle-orm";

import { db } from "@/db";
import { organizationType } from "@/db/schema";
import { alreadyExists, notFound } from "@/lib/errors";
import type { AppRouteHandler } from "@/lib/types";

import type {
	createOrganizationType,
	deleteOrganizationType,
	getOrganizationType,
	listOrganizationTypes,
	updateOrganizationType,
} from "./organization-types.routes";

function formatOrganizationType(row: typeof organizationType.$inferSelect) {
	return {
		id: row.id,
		name: row.name,
		createdAt: row.createdAt,
		updatedAt: row.updatedAt,
	};
}

export const listHandler: AppRouteHandler<typeof listOrganizationTypes> = async (c) => {
	const { page, limit, search, isActive } = c.req.valid("query");
	const offset = (page - 1) * limit;

	const whereCondition = and(
		eq(organizationType.isDeleted, false),
		search ? ilike(organizationType.name, `%${search}%`) : undefined,
		isActive !== undefined ? eq(organizationType.isDeleted, !isActive) : undefined
	);

	const [items, [total]] = await Promise.all([
		db.query.organizationType.findMany({
			where: whereCondition,
			limit,
			offset,
			orderBy: (t, { desc }) => [desc(t.createdAt)],
		}),
		db.select({ count: count() }).from(organizationType).where(whereCondition),
	]);

	const totalPages = Math.ceil(total.count / limit);

	return c.json(
		{
			success: true as const,
			data: {
				items: items.map(formatOrganizationType),
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

export const getByIdHandler: AppRouteHandler<typeof getOrganizationType> = async (c) => {
	const { id } = c.req.valid("param");

	const found = await db.query.organizationType.findFirst({
		where: and(eq(organizationType.id, id), eq(organizationType.isDeleted, false)),
	});

	if (!found) {
		throw notFound("Tashkilot turi", id);
	}

	return c.json(
		{
			success: true as const,
			data: formatOrganizationType(found),
		},
		200
	);
};

export const createHandler: AppRouteHandler<typeof createOrganizationType> = async (c) => {
	const body = c.req.valid("json");

	const existing = await db.query.organizationType.findFirst({
		where: and(eq(organizationType.name, body.name), eq(organizationType.isDeleted, false)),
	});

	if (existing) {
		throw alreadyExists("Tashkilot turi", "nomi");
	}

	const [created] = await db
		.insert(organizationType)
		.values({
			name: body.name,
		})
		.returning();

	return c.json(
		{
			success: true as const,
			data: formatOrganizationType(created),
		},
		201
	);
};

export const updateHandler: AppRouteHandler<typeof updateOrganizationType> = async (c) => {
	const { id } = c.req.valid("param");
	const body = c.req.valid("json");

	const existing = await db.query.organizationType.findFirst({
		where: and(eq(organizationType.id, id), eq(organizationType.isDeleted, false)),
	});

	if (!existing) {
		throw notFound("Tashkilot turi", id);
	}

	const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() };

	if (body.name !== undefined) {
		if (body.name !== existing.name) {
			const duplicate = await db.query.organizationType.findFirst({
				where: and(eq(organizationType.name, body.name), eq(organizationType.isDeleted, false)),
			});
			if (duplicate) {
				throw alreadyExists("Tashkilot turi", "nomi");
			}
		}
		updates.name = body.name;
	}

	const [updated] = await db
		.update(organizationType)
		.set(updates)
		.where(eq(organizationType.id, id))
		.returning();

	return c.json(
		{
			success: true as const,
			data: formatOrganizationType(updated),
		},
		200
	);
};

export const deleteHandler: AppRouteHandler<typeof deleteOrganizationType> = async (c) => {
	const { id } = c.req.valid("param");

	const existing = await db.query.organizationType.findFirst({
		where: and(eq(organizationType.id, id), eq(organizationType.isDeleted, false)),
	});

	if (!existing) {
		throw notFound("Tashkilot turi", id);
	}

	await db
		.update(organizationType)
		.set({ isDeleted: true, deletedAt: new Date().toISOString() })
		.where(eq(organizationType.id, id));

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
