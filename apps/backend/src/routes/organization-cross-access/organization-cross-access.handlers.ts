import { and, count, eq, like, or, sql } from "drizzle-orm";

import { db } from "@/db";
import { organizationCrossAccess, organizations } from "@/db/schema";
import { checkPermission } from "@/lib/auth/checkPermission";
import { alreadyExists, forbidden, notFound } from "@/lib/errors";
import type { AppRouteHandler } from "@/lib/types";
import type {
	createOrganizationCrossAccess,
	deleteOrganizationCrossAccess,
	getOrganizationCrossAccess,
	listOrganizationCrossAccess,
	updateOrganizationCrossAccess,
} from "./organization-cross-access.routes";

async function checkDuplicate(viewerId: string, targetId: string, excludeId?: string) {
	const duplicate = await db.query.organizationCrossAccess.findFirst({
		where: and(
			eq(organizationCrossAccess.viewerId, viewerId),
			eq(organizationCrossAccess.targetId, targetId),
			eq(organizationCrossAccess.isDeleted, false)
		),
	});
	if (duplicate && duplicate.id !== excludeId) {
		throw alreadyExists("OrganizationCrossAccess", "viewerId va targetId");
	}
}

function formatOrganizationCrossAccess(
	row: typeof organizationCrossAccess.$inferSelect & {
		viewer?: typeof organizations.$inferSelect | null;
		target?: typeof organizations.$inferSelect | null;
	}
) {
	return {
		id: row.id,
		accessType: row.accessType,
		viewer: row.viewer ?? undefined,
		target: row.target ?? undefined,
		createdAt: row.createdAt,
		updatedAt: row.updatedAt,
		isDeleted: row.isDeleted,
		deletedAt: row.deletedAt,
	};
}

export const listHandler: AppRouteHandler<typeof listOrganizationCrossAccess> = async (c) => {
	const { page, limit, search, isActive } = c.req.valid("query");
	const offset = (page - 1) * limit;

	const whereConditions = [
		eq(organizationCrossAccess.isDeleted, false),
		search
			? or(
					like(sql`${organizationCrossAccess.viewerId}::text`, `%${search}%`),
					like(sql`${organizationCrossAccess.targetId}::text`, `%${search}%`)
				)
			: undefined,
		isActive !== undefined ? eq(organizationCrossAccess.isDeleted, !isActive) : undefined,
	].filter(Boolean);

	const [items, [total]] = await Promise.all([
		db.query.organizationCrossAccess.findMany({
			where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
			limit,
			offset,
			orderBy: (t, { desc }) => [desc(t.createdAt)],
			with: {
				target: true,
				viewer: true,
			},
		}),
		db
			.select({ count: count() })
			.from(organizationCrossAccess)
			.where(whereConditions.length > 0 ? and(...whereConditions) : undefined),
	]);

	const totalPages = Math.ceil(total.count / limit);

	return c.json(
		{
			success: true as const,
			data: {
				items: items.map(formatOrganizationCrossAccess),
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

export const getByIdHandler: AppRouteHandler<typeof getOrganizationCrossAccess> = async (c) => {
	const { id } = c.req.valid("param");

	const found = await db.query.organizationCrossAccess.findFirst({
		where: and(eq(organizationCrossAccess.id, id), eq(organizationCrossAccess.isDeleted, false)),
		with: {
			viewer: true,
			target: true,
		},
	});

	if (!found) {
		throw notFound("OrganizationCrossAccess", id);
	}

	return c.json(
		{
			success: true as const,
			data: formatOrganizationCrossAccess(found),
		},
		200
	);
};

export const createHandler: AppRouteHandler<typeof createOrganizationCrossAccess> = async (c) => {
	const body = c.req.valid("json");
	const authUser = c.get("user");

	const targetPermission = await checkPermission(authUser.id, body.targetId);
	const viewerPermission = await checkPermission(authUser.id, body.viewerId);

	if (targetPermission !== "WRITE" || viewerPermission !== "WRITE") {
		throw forbidden("Bu tashkilotlarni ko'rishga ruxsatingiz yo'q");
	}

	const existing = await db.query.organizationCrossAccess.findFirst({
		where: and(
			eq(organizationCrossAccess.viewerId, body.viewerId),
			eq(organizationCrossAccess.targetId, body.targetId),
			eq(organizationCrossAccess.isDeleted, false)
		),
	});

	if (existing) {
		throw alreadyExists("OrganizationCrossAccess", "viewerId va targetId");
	}

	const viewerOrg = await db.query.organizations.findFirst({
		where: and(eq(organizations.id, body.viewerId), eq(organizations.isDeleted, false)),
	});

	if (!viewerOrg) {
		throw notFound("Organization (viewer)", body.viewerId);
	}

	const targetOrg = await db.query.organizations.findFirst({
		where: and(eq(organizations.id, body.targetId), eq(organizations.isDeleted, false)),
	});

	if (!targetOrg) {
		throw notFound("Organization (target)", body.targetId);
	}

	const [created] = await db
		.insert(organizationCrossAccess)
		.values({
			viewerId: body.viewerId,
			targetId: body.targetId,
			accessType: body.accessType,
		})
		.returning();

	const createdWithRelations = await db.query.organizationCrossAccess.findFirst({
		where: eq(organizationCrossAccess.id, created.id),
		with: {
			viewer: true,
			target: true,
		},
	});

	if (!createdWithRelations) {
		throw notFound("OrganizationCrossAccess", created.id);
	}

	return c.json(
		{
			success: true as const,
			data: formatOrganizationCrossAccess(createdWithRelations),
		},
		201
	);
};

export const updateHandler: AppRouteHandler<typeof updateOrganizationCrossAccess> = async (c) => {
	const { id } = c.req.valid("param");
	const body = c.req.valid("json");

	const existing = await db.query.organizationCrossAccess.findFirst({
		where: and(eq(organizationCrossAccess.id, id), eq(organizationCrossAccess.isDeleted, false)),
	});

	if (!existing) {
		throw notFound("OrganizationCrossAccess", id);
	}

	if (body.viewerId !== undefined) {
		const viewerOrg = await db.query.organizations.findFirst({
			where: eq(organizations.id, body.viewerId),
		});

		if (!viewerOrg) {
			throw notFound("Organization (viewer)", body.viewerId);
		}
	}

	if (body.targetId !== undefined) {
		const targetOrg = await db.query.organizations.findFirst({
			where: eq(organizations.id, body.targetId),
		});

		if (!targetOrg) {
			throw notFound("Organization (target)", body.targetId);
		}
	}

	const newViewerId = body.viewerId ?? existing.viewerId;
	const newTargetId = body.targetId ?? existing.targetId;

	checkDuplicate(newViewerId, newTargetId, id);

	await db
		.update(organizationCrossAccess)
		.set({
			viewerId: body.viewerId,
			targetId: body.targetId,
			accessType: body.accessType,
			updatedAt: new Date().toISOString(),
		})
		.where(eq(organizationCrossAccess.id, id));

	const updatedWithRelations = await db.query.organizationCrossAccess.findFirst({
		where: eq(organizationCrossAccess.id, id),
		with: {
			viewer: true,
			target: true,
		},
	});

	if (!updatedWithRelations) {
		throw notFound("OrganizationCrossAccess", id);
	}

	return c.json(
		{
			success: true as const,
			data: formatOrganizationCrossAccess(updatedWithRelations),
		},
		200
	);
};

export const deleteHandler: AppRouteHandler<typeof deleteOrganizationCrossAccess> = async (c) => {
	const { id } = c.req.valid("param");

	const existing = await db.query.organizationCrossAccess.findFirst({
		where: and(eq(organizationCrossAccess.id, id), eq(organizationCrossAccess.isDeleted, false)),
	});

	if (!existing) {
		throw notFound("OrganizationCrossAccess", id);
	}

	await db
		.update(organizationCrossAccess)
		.set({ isDeleted: true, deletedAt: new Date().toISOString() })
		.where(eq(organizationCrossAccess.id, id));

	return c.json(
		{
			success: true as const,
			data: {
				message: "Tashkilotlararo kirish huquqi o'chirildi",
			},
		},
		200
	);
};
