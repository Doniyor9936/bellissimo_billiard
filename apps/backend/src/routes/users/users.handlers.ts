import { and, count, eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";
import { hashPassword } from "@/lib/auth";
import { alreadyExists, notFound } from "@/lib/errors";
import type { AppRouteHandler } from "@/lib/types";
import type { createUser, deleteUser, getUser, listUsers, updateUser } from "./users.routes";

export function formatUser(row: typeof users.$inferSelect) {
	return {
		id: row.id,
		phone: row.phone,
		fullname: row.fullname,
		role: row.role,
		isActive: row.isActive,
		createdAt: row.createdAt,
		updatedAt: row.updatedAt,
	};
}

export const listHandler: AppRouteHandler<typeof listUsers> = async (c) => {
	const { page, limit } = c.req.valid("query");
	const offset = (page - 1) * limit;

	const [items, [total]] = await Promise.all([
		db.query.users.findMany({
			where: eq(users.isDeleted, false),
			limit,
			offset,
			orderBy: (u, { desc }) => [desc(u.createdAt)],
		}),
		db.select({ count: count() }).from(users).where(eq(users.isDeleted, false)),
	]);

	const totalPages = Math.ceil(total.count / limit);

	return c.json(
		{
			success: true as const,
			data: {
				items: items.map(formatUser),
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

export const getByIdHandler: AppRouteHandler<typeof getUser> = async (c) => {
	const { id } = c.req.valid("param");

	const found = await db.query.users.findFirst({
		where: and(eq(users.id, id), eq(users.isDeleted, false)),
	});

	if (!found) {
		throw notFound("Foydalanuvchi", id);
	}

	return c.json(
		{
			success: true as const,
			data: formatUser(found),
		},
		200
	);
};

export const createHandler: AppRouteHandler<typeof createUser> = async (c) => {
	const body = c.req.valid("json");

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

	return c.json(
		{
			success: true as const,
			data: formatUser(newUser),
		},
		201
	);
};

export const updateHandler: AppRouteHandler<typeof updateUser> = async (c) => {
	const { id } = c.req.valid("param");
	const body = c.req.valid("json");

	const existing = await db.query.users.findFirst({
		where: and(eq(users.id, id), eq(users.isDeleted, false)),
	});

	if (!existing) {
		throw notFound("Foydalanuvchi", id);
	}

	const updates: Record<string, unknown> = {
		updatedAt: new Date().toISOString(),
	};

	if (body.fullname !== undefined) {
		updates.fullname = body.fullname;
	}
	if (body.phone !== undefined) {
		updates.phoneNumber = body.phone;
	}
	if (body.isActive !== undefined) {
		updates.isActive = body.isActive;
	}

	if (body.password !== undefined) {
		updates.password = await hashPassword(body.password);
	}

	if (body.phone !== undefined && body.phone !== existing.phone) {
		const duplicate = await db.query.users.findFirst({
			where: eq(users.phone, body.phone),
		});
		if (duplicate) {
			throw alreadyExists("Foydalanuvchi", "telefon raqami");
		}
	}

	const [updated] = await db.update(users).set(updates).where(eq(users.id, id)).returning();

	return c.json(
		{
			success: true as const,
			data: formatUser(updated),
		},
		200
	);
};

export const deleteHandler: AppRouteHandler<typeof deleteUser> = async (c) => {
	const { id } = c.req.valid("param");

	const existing = await db.query.users.findFirst({
		where: and(eq(users.id, id), eq(users.isDeleted, false)),
	});

	if (!existing) {
		throw notFound("Foydalanuvchi", id);
	}

	await db.update(users).set({ isDeleted: true }).where(eq(users.id, id));

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
