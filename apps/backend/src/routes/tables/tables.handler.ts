import { and, count, eq, ilike } from "drizzle-orm";
import { db } from "@/db";
import { tables } from "@/db/schema";
import type { AppRouteHandler } from "@/lib";
import type {
	createTables,
	deleteTable,
	fullTables,
	getOneTable,
	updateTable,
} from "./tables.routes";

export const listTablesHandler: AppRouteHandler<typeof fullTables> = async (c) => {
	const { search, limit, status, category, page } = c.req.valid("query");

	const offset = (page - 1) * limit;
	const conditions = [eq(tables.is_active, true)];

	if (status) {
		conditions.push(eq(tables.status, status));
	}
	if (category) {
		conditions.push(eq(tables.category, category));
	}
	if (search) {
		conditions.push(ilike(tables.name, `%${search}%`));
	}

	const where = conditions.length ? and(...conditions) : undefined;

	const [data, [{ total }]] = await Promise.all([
		db.select().from(tables).where(where).orderBy(tables.sort_order).limit(1).offset(offset),
		db.select({ total: count() }).from(tables).where(where),
	]);

	return c.json({
		data,
		meta: {
			total,
			page,
			limit,
			total_pages: Math.ceil(total / limit),
		},
	});
};

// POST / — yangi stol yaratish
export const createTableHandler: AppRouteHandler<typeof createTables> = async (c) => {
	const body = c.req.valid("json");

	const [existing] = await db.select().from(tables).where(eq(tables.number, body.number));

	if (existing) {
		return c.json({ message: `Stol ${body.number} allaqachon mavjud` }, 422);
	}

	const [newTable] = await db.insert(tables).values(body).returning();

	return c.json(newTable, 201);
};

export const getOneTableHandler: AppRouteHandler<typeof getOneTable> = async (c) => {
	const { id } = c.req.valid("param");

	const [table] = await db.select().from(tables).where(eq(tables.id, id));

	if (!table) {
		return c.json({ message: "Stol topilmadi" }, 404);
	}

	return c.json(table);
};
export const updateTableHandler: AppRouteHandler<typeof updateTable> = async (c) => {
	const { id } = c.req.valid("param");
	const body = c.req.valid("json");

	const [updated] = await db
		.update(tables)
		.set({ ...body, updated_at: new Date() })
		.where(eq(tables.id, id))
		.returning();

	if (!updated) {
		return c.json({ message: "Stol topilmadi" }, 404);
	}

	return c.json(updated, 200);
};

export const deleteTableHandler: AppRouteHandler<typeof deleteTable> = async (c) => {
	const { id } = c.req.valid("param");

	// Faol sessiya bormi tekshir
	const activeSession = await db.query.sessions.findFirst({
		where: (s, { and, eq }) => and(eq(s.table_id, id), eq(s.status, "active")),
	});

	if (activeSession) {
		return c.json({ message: "Faol sessiya mavjud, stolni o'chirib bo'lmaydi" }, 422);
	}

	// Soft delete — is_active false qilinadi
	const [deleted] = await db
		.update(tables)
		.set({
			is_active: false,
			updated_at: new Date(),
		})
		.where(eq(tables.id, id))
		.returning();

	if (!deleted) {
		return c.json({ message: "Stol topilmadi" }, 404);
	}

	return c.json({ message: "stol o'chirli" }, 200);
};
