import { and, count, eq, ilike, inArray } from "drizzle-orm";
import { db } from "@/db";
import { organizations } from "@/db/schema/tables/organization";
import { userOrganization } from "@/db/schema/tables/user-organization";
import { alreadyExists, forbidden, notFound, unauthorized } from "@/lib/errors";
import type { AppRouteHandler } from "@/lib/types";
import type {
	createOrganization,
	deleteOrganization,
	getOrganization,
	listOrganizations,
	updateOrganization,
} from "./organizations.routes";

// ─── Helper ───────────────────────────────────────────────────────────────────

function formatOrganization(row: typeof organizations.$inferSelect) {
	return {
		id: row.id,
		name: row.name,
		createdAt: row.createdAt,
		updatedAt: row.updatedAt,
	};
}

// Admin userning tashkilot IDlarini olish
async function getAdminOrganizationIds(userId: string): Promise<string[]> {
	const rows = await db.query.userOrganization.findMany({
		where: eq(userOrganization.userId, userId),
		columns: { organizationId: true },
	});
	return rows.map((r) => r.organizationId);
}

// ─── Handlers ─────────────────────────────────────────────────────────────────

export const listOrganizationsHandler: AppRouteHandler<typeof listOrganizations> = async (c) => {
	const user = c.get("user");
	if (!user) {
		throw unauthorized();
	}

	const { page, limit, search } = c.req.valid("query");
	const offset = (page - 1) * limit;

	const isSuperAdmin = user.role === "superadmin";

	// Admin bo'lsa — faqat o'ziga biriktirilgan orglar
	const adminOrgIds = isSuperAdmin ? null : await getAdminOrganizationIds(user.id);

	// Admin bo'lib, hech qanday orgi yo'q bo'lsa
	if (!isSuperAdmin && adminOrgIds?.length === 0) {
		return c.json(
			{
				success: true as const,
				data: {
					items: [],
					pagination: { page, limit, total: 0, totalPages: 0 },
				},
			},
			200
		);
	}

	// WHERE shartlarini qurish
	const buildWhere = () => {
		const conditions = [eq(organizations.isDeleted, false)];

		if (search) {
			conditions.push(ilike(organizations.name, `%${search}%`));
		}

		if (!isSuperAdmin && adminOrgIds) {
			conditions.push(inArray(organizations.id, adminOrgIds));
		}

		return and(...conditions);
	};

	const [items, [total]] = await Promise.all([
		db.query.organizations.findMany({
			where: buildWhere(),
			limit,
			offset,
			orderBy: (t, { desc }) => [desc(t.createdAt)],
		}),
		db.select({ count: count() }).from(organizations).where(buildWhere()),
	]);

	return c.json(
		{
			success: true as const,
			data: {
				items: items.map(formatOrganization),
				pagination: {
					page,
					limit,
					total: total.count,
					totalPages: Math.ceil(total.count / limit),
				},
			},
		},
		200
	);
};

export const getOrganizationHandler: AppRouteHandler<typeof getOrganization> = async (c) => {
	const user = c.get("user");
	if (!user) {
		throw unauthorized();
	}

	const { id } = c.req.valid("param");
	const isSuperAdmin = user.role === "superadmin";

	// Admin bo'lsa — faqat o'ziga biriktirilgan orgga kirishi mumkin
	if (!isSuperAdmin) {
		const adminOrgIds = await getAdminOrganizationIds(user.id);
		if (!adminOrgIds.includes(id)) {
			throw forbidden();
		}
	}

	const found = await db.query.organizations.findFirst({
		where: and(eq(organizations.id, id), eq(organizations.isDeleted, false)),
	});

	if (!found) {
		throw notFound("Tashkilot", id);
	}

	return c.json({ success: true as const, data: formatOrganization(found) }, 200);
};

export const createOrganizationHandler: AppRouteHandler<typeof createOrganization> = async (c) => {
	const user = c.get("user");
	if (!user) {
		throw unauthorized();
	}

	// Faqat superadmin yarata oladi
	if (user.role !== "superadmin") {
		throw forbidden();
	}

	const body = c.req.valid("json");

	const existing = await db.query.organizations.findFirst({
		where: and(eq(organizations.name, body.name), eq(organizations.isDeleted, false)),
	});

	if (existing) {
		throw alreadyExists("Tashkilot", "nomi");
	}

	const [created] = await db.insert(organizations).values({ name: body.name }).returning();

	return c.json({ success: true as const, data: formatOrganization(created) }, 201);
};

export const updateOrganizationHandler: AppRouteHandler<typeof updateOrganization> = async (c) => {
	const user = c.get("user");
	if (!user) {
		throw unauthorized();
	}

	const { id } = c.req.valid("param");
	const body = c.req.valid("json");
	const isSuperAdmin = user.role === "superadmin";

	// Admin bo'lsa — faqat o'z organizatsiyasini update qila oladi
	if (!isSuperAdmin) {
		const adminOrgIds = await getAdminOrganizationIds(user.id);
		if (!adminOrgIds.includes(id)) {
			throw forbidden();
		}
	}

	const existing = await db.query.organizations.findFirst({
		where: and(eq(organizations.id, id), eq(organizations.isDeleted, false)),
	});

	if (!existing) {
		throw notFound("Tashkilot", id);
	}

	const updates: Record<string, unknown> = {
		updatedAt: new Date().toISOString(),
	};

	if (body.name && body.name !== existing.name) {
		const duplicate = await db.query.organizations.findFirst({
			where: and(eq(organizations.name, body.name), eq(organizations.isDeleted, false)),
		});
		if (duplicate) {
			throw alreadyExists("Tashkilot", "nomi");
		}
		updates.name = body.name;
	}

	const [updated] = await db
		.update(organizations)
		.set(updates)
		.where(eq(organizations.id, id))
		.returning();

	return c.json({ success: true as const, data: formatOrganization(updated) }, 200);
};

export const deleteOrganizationHandler: AppRouteHandler<typeof deleteOrganization> = async (c) => {
	const user = c.get("user");
	if (!user) {
		throw unauthorized();
	}

	// Faqat superadmin o'chira oladi
	if (user.role !== "superadmin") {
		throw forbidden();
	}

	const { id } = c.req.valid("param");

	const existing = await db.query.organizations.findFirst({
		where: and(eq(organizations.id, id), eq(organizations.isDeleted, false)),
	});

	if (!existing) {
		throw notFound("Tashkilot", id);
	}

	await db.update(organizations).set({ isDeleted: true }).where(eq(organizations.id, id));

	return c.json(
		{
			success: true as const,
			data: { message: "Tashkilot muvaffaqiyatli o'chirildi" },
		},
		200
	);
};
