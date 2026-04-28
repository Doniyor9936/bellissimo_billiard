import { and, count, eq, ilike, lte } from "drizzle-orm";
import { db } from "@/db";
import { inventoryLogs, products } from "@/db/schema";
import type { AppRouteHandler } from "@/lib";
import type {
	createProduct,
	deleteProduct,
	getOneProduct,
	listProducts,
	stockIn,
	updateProduct,
} from "./products.routes";

export const listProductsHandler: AppRouteHandler<typeof listProducts> = async (c) => {
	const { search, category, isAvailable, lowStock, page, limit } = c.req.valid("query");
	const user = c.get("user");

	const offset = (page - 1) * limit;

	const conditions = [];
	if (user.role !== "admin") {
		conditions.push(eq(products.isAvailable, true));
	} else if (isAvailable !== undefined) {
		conditions.push(eq(products.isAvailable, isAvailable === "true"));
	}

	if (category) {
		conditions.push(eq(products.category, category));
	}
	if (search) {
		conditions.push(ilike(products.name, `%${search}%`));
	}

	// Kam qolgan mahsulotlar (stock_quantity <= min_stock)
	if (lowStock) {
		conditions.push(lte(products.stockQuantity, products.minStock));
	}

	const where = and(...conditions);

	const [data, [{ total }]] = await Promise.all([
		db.select().from(products).where(where).orderBy(products.sortOrder).limit(limit).offset(offset),
		db.select({ total: count() }).from(products).where(where),
	]);

	return c.json({ data, meta: { total, page, limit, total_pages: Math.ceil(total / limit) } }, 200);
};

export const getOneProductHandler: AppRouteHandler<typeof getOneProduct> = async (c) => {
	const { id } = c.req.valid("param");

	const [product] = await db.select().from(products).where(eq(products.id, id));

	if (!product) {
		return c.json({ message: "Mahsulot topilmadi" }, 404);
	}

	return c.json(product, 200);
};

export const createProductHandler: AppRouteHandler<typeof createProduct> = async (c) => {
	const body = c.req.valid("json");

	const [newProduct] = await db.insert(products).values(body).returning();

	// Inventory log
	await db.insert(inventoryLogs).values({
		productId: newProduct.id,
		type: "kirim",
		quantity: newProduct.stockQuantity,
		quantityBefore: 0,
		quantityAfter: newProduct.stockQuantity,
		unitCost: newProduct.costPrice ?? undefined,
		reason: "Yangi mahsulot qo'shildi",
	});

	return c.json(newProduct, 201);
};

export const updateProductHandler: AppRouteHandler<typeof updateProduct> = async (c) => {
	const { id } = c.req.valid("param");
	const body = c.req.valid("json");

	const [updated] = await db
		.update(products)
		.set({ ...body, updatedAt: new Date() })
		.where(eq(products.id, id))
		.returning();

	if (!updated) {
		return c.json({ message: "Mahsulot topilmadi" }, 404);
	}

	return c.json(updated, 200);
};

export const deleteProductHandler: AppRouteHandler<typeof deleteProduct> = async (c) => {
	const { id } = c.req.valid("param");

	const [product] = await db.select().from(products).where(eq(products.id, id));

	if (!product) {
		return c.json({ message: "Mahsulot topilmadi" }, 404);
	}

	// Soft delete
	const [_deleted] = await db
		.update(products)
		.set({ isAvailable: false, updatedAt: new Date() })
		.where(eq(products.id, id))
		.returning();

	return c.body(null, 204);
};

export const stockInHandler: AppRouteHandler<typeof stockIn> = async (c) => {
	const { id } = c.req.valid("param");
	const { quantity, unitCost, reason } = c.req.valid("json");
	const user = c.get("user");

	const [product] = await db.select().from(products).where(eq(products.id, id));

	if (!product) {
		return c.json({ message: "Mahsulot topilmadi" }, 404);
	}

	const quantityBefore = product.stockQuantity;
	const quantityAfter = quantityBefore + quantity;

	// Omborni yangilash
	const [updated] = await db
		.update(products)
		.set({ stockQuantity: quantityAfter, updatedAt: new Date() })
		.where(eq(products.id, id))
		.returning();

	// Inventory log
	await db.insert(inventoryLogs).values({
		productId: id,
		userId: user.id,
		type: "kirim",
		quantity,
		quantityBefore: quantityBefore,
		quantityAfter: quantityAfter,
		unitCost,
		reason: reason ?? "Ombor kirim",
	});

	return c.json(updated, 200);
};
