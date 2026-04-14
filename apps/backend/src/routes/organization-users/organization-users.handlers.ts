import { and, count, eq } from "drizzle-orm";

import { db } from "@/db";
import {
	organizations,
	type organizationType,
	organizationTypePosition,
	userOrganization,
	users,
} from "@/db/schema";
import { hashPassword } from "@/lib/auth";
import { checkPermission } from "@/lib/auth/checkPermission";
import { alreadyExists, forbidden, notFound } from "@/lib/errors";
import type { AppRouteHandler } from "@/lib/types";
import { formatOrganizationTypePosition } from "../organization-type-positions/organization-type-positions.handlers";
import { formatUser } from "../users/users.handlers";
import type {
	createOrganizationUser,
	deleteOrganizationUser,
	getOrganizationUser,
	listOrganizationUsers,
	updateOrganizationUser,
} from "./organization-users.routes";

function formatOrganizationUser(
	row: typeof userOrganization.$inferSelect & {
		user: typeof users.$inferSelect;
		organizationTypePosition: typeof organizationTypePosition.$inferSelect & {
			organizationType: typeof organizationType.$inferSelect;
		};
	}
) {
	return {
		id: row.id,
		user: formatUser(row.user),
		position: formatOrganizationTypePosition(row.organizationTypePosition),
		isPrimary: row.isPrimary,
		createdAt: row.createdAt,
		updatedAt: row.updatedAt,
	};
}

export const listHandler: AppRouteHandler<typeof listOrganizationUsers> = async (c) => {
	const { organizationId } = c.req.valid("param");
	const userId = c.get("user").id;

	const permission = await checkPermission(userId, organizationId);
	if (permission === "NONE") {
		throw forbidden("Not authorized");
	}

	const { page, limit } = c.req.valid("query");
	const offset = (page - 1) * limit;

	const [items, [total]] = await Promise.all([
		db.query.userOrganization.findMany({
			where: and(
				eq(userOrganization.isDeleted, false),
				eq(userOrganization.organizationId, organizationId)
			),
			limit,
			offset,
			with: {
				organizationTypePosition: { with: { organizationType: true } },
				user: true,
			},
			orderBy: (u, { desc }) => [desc(u.createdAt)],
		}),
		db
			.select({ count: count() })
			.from(userOrganization)
			.where(
				and(
					eq(userOrganization.isDeleted, false),
					eq(userOrganization.organizationId, organizationId)
				)
			),
	]);

	const totalPages = Math.ceil(total.count / limit);

	return c.json(
		{
			success: true as const,
			data: {
				items: items.map(formatOrganizationUser),
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

export const getByIdHandler: AppRouteHandler<typeof getOrganizationUser> = async (c) => {
	const { id, organizationId } = c.req.valid("param");
	const userId = c.get("user").id;
	const permission = await checkPermission(userId, organizationId);
	if (permission === "NONE") {
		throw forbidden("Not authorized");
	}

	const found = await db.query.userOrganization.findFirst({
		where: and(
			eq(userOrganization.id, id),
			eq(userOrganization.organizationId, organizationId),
			eq(userOrganization.isDeleted, false)
		),
		with: {
			organizationTypePosition: { with: { organizationType: true } },
			user: true,
		},
	});

	if (!found) {
		throw notFound("Foydalanuvchi", id);
	}

	return c.json(
		{
			success: true as const,
			data: formatOrganizationUser(found),
		},
		200
	);
};

export const createHandler: AppRouteHandler<typeof createOrganizationUser> = async (c) => {
	const { organizationId } = c.req.valid("param");
	const bodyArr = c.req.valid("json");
	const userId = c.get("user").id;
	const permission = await checkPermission(userId, organizationId);
	if (permission !== "WRITE") {
		throw forbidden("Not authorized");
	}

	const result = [];

	for (const body of bodyArr) {
		if (!body.userId) {
			if (!(body.fullname && body.phone && body.password)) {
				throw notFound("Ma'lumotlar mavjud bo'lmaydi");
			}

			const existing = await db.query.users.findFirst({
				where: eq(users.phone, body.phone),
			});

			if (existing) {
				throw alreadyExists("Foydalanuvchi", "telefon raqami");
			}

			const hashedPassword = await hashPassword(body.password);

			const [newUser] = await db
				.insert(users)
				.values({
					fullname: body.fullname,
					phone: body.phone,
					password: hashedPassword,
				})
				.returning();
			body.userId = newUser.id;
		}

		const existing = await db.query.userOrganization.findFirst({
			where: and(
				eq(userOrganization.organizationId, organizationId),
				eq(userOrganization.userId, body.userId),
				eq(userOrganization.isDeleted, false)
			),
		});

		if (existing) {
			throw alreadyExists("Foydalanuvchi", "Organization");
		}

		const findOrganization = await db.query.organizations.findFirst({
			where: eq(organizations.id, organizationId),
		});
		if (!findOrganization) {
			throw notFound("Tashkilot", organizationId);
		}

		const findUser = await db.query.users.findFirst({
			where: eq(users.id, body.userId),
		});
		if (!findUser) {
			throw notFound("Foydalanuvchi", body.userId);
		}

		const findPosition = await db.query.organizationTypePosition.findFirst({
			where: eq(organizationTypePosition.id, body.positionId),
		});
		if (!findPosition) {
			throw notFound("Tashkilot Lavozimi", body.positionId);
		}

		const [newOrganizationUser] = await db
			.insert(userOrganization)
			.values({
				organizationId: organizationId,
				userId: body.userId,
				positionId: body.positionId,
				isPrimary: body.isPrimary,
			})
			.returning();

		const createdWithRelations = await db.query.userOrganization.findFirst({
			where: eq(userOrganization.id, newOrganizationUser.id),
			with: {
				organizationTypePosition: { with: { organizationType: true } },
				user: true,
			},
		});

		if (!createdWithRelations) {
			throw notFound("Foydalanuvchi", newOrganizationUser.id);
		}

		result.push(formatOrganizationUser(createdWithRelations));
	}

	return c.json(
		{
			success: true as const,
			data: result[0],
		},
		201
	);
};

export const updateHandler: AppRouteHandler<typeof updateOrganizationUser> = async (c) => {
	const { id, organizationId } = c.req.valid("param");
	const userId = c.get("user").id;
	const body = c.req.valid("json");

	const permission = await checkPermission(userId, organizationId);
	if (permission !== "WRITE") {
		throw forbidden("Not authorized");
	}

	const existing = await db.query.userOrganization.findFirst({
		where: and(
			eq(userOrganization.id, id),
			eq(userOrganization.organizationId, organizationId),
			eq(userOrganization.isDeleted, false)
		),
	});

	if (!existing) {
		throw notFound("Foydalanuvchi", id);
	}

	const updates: Record<string, unknown> = {
		updatedAt: new Date().toISOString(),
	};

	if (body.isPrimary !== undefined) {
		updates.isPrimary = body.isPrimary;
	}
	if (body.positionId !== undefined) {
		const findPosition = await db.query.organizationTypePosition.findFirst({
			where: eq(organizationTypePosition.id, body.positionId),
		});
		if (!findPosition) {
			throw notFound("Tashkilot turi", body.positionId);
		}
		updates.positionId = body.positionId;
	}
	if (body.isActive !== undefined) {
		updates.isActive = body.isActive;
	}

	const [updated] = await db
		.update(userOrganization)
		.set(updates)
		.where(eq(userOrganization.id, existing.id))
		.returning();

	const updatedWithRelations = await db.query.userOrganization.findFirst({
		where: eq(userOrganization.id, updated.id),
		with: {
			organizationTypePosition: { with: { organizationType: true } },
			user: true,
		},
	});
	if (!updatedWithRelations) {
		throw notFound("Foydalanuvchi", updated.id);
	}

	return c.json(
		{
			success: true as const,
			data: formatOrganizationUser(updatedWithRelations),
		},
		200
	);
};

export const deleteHandler: AppRouteHandler<typeof deleteOrganizationUser> = async (c) => {
	const { id, organizationId } = c.req.valid("param");
	const userId = c.get("user").id;
	const permission = await checkPermission(userId, organizationId);
	if (permission !== "WRITE") {
		throw forbidden("Not authorized");
	}

	const existing = await db.query.userOrganization.findFirst({
		where: and(
			eq(userOrganization.id, id),
			eq(userOrganization.organizationId, organizationId),
			eq(userOrganization.isDeleted, false)
		),
	});

	if (!existing) {
		throw notFound("Foydalanuvchi", id);
	}

	await db
		.update(userOrganization)
		.set({ isDeleted: true, deletedAt: new Date().toISOString() })
		.where(eq(userOrganization.id, existing.id));

	return c.json(
		{
			success: true as const,
			data: {
				message: "Foydalanuvchi o'chirildi",
			},
		},
		200
	);
};
