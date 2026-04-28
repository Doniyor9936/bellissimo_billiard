import { and, eq, sum } from "drizzle-orm";
import { db } from "@/db";
import { orderItems, orders, products, sessions } from "@/db/schema";
import type { AppRouteHandler } from "@/lib";
import type {
	addOrderItems,
	getSessionOrders,
	removeOrderItem,
	updateOrderItem,
} from "./orders.routes";

// Sessiyaning order va itemlarini olish
const getOrCreateOrder = async (sessionId: string, cashierId: string) => {
	// Sessiyaning mavjud orderi bormi?
	let order = await db.query.orders.findFirst({
		where: eq(orders.sessionId, sessionId),
		with: { items: true },
	});

	// Yo'q bo'lsa yangi order yaratiladi
	if (!order) {
		const [newOrder] = await db
			.insert(orders)
			.values({
				sessionId: sessionId,
				cashierId: cashierId,
				subtotal: 0,
				totalAmount: 0,
			})
			.returning();

		order = { ...newOrder, items: [] };
	}

	return order;
};

// Order summasini qayta hisoblash
const recalcOrder = async (orderId: string) => {
	const items = await db.query.orderItems.findMany({
		where: eq(orderItems.orderId, orderId),
	});

	const subtotal = items.reduce((sum, item) => sum + item.total_price, 0);

	const [updated] = await db
		.update(orders)
		.set({ subtotal, totalAmount: subtotal, updated_at: new Date() })
		.where(eq(orders.id, orderId))
		.returning();

	return updated;
};

// Sessiya order_amount ni yangilash
const updateSessionOrderAmount = async (sessionId: string, orderId: string) => {
	const [{ total }] = await db
		.select({ total: sum(orderItems.totalPrice) })
		.from(orderItems)
		.where(eq(orderItems.orderId, orderId));

	await db
		.update(sessions)
		.set({
			orderAmount: Number(total ?? 0),
			updated_at: new Date(),
		})
		.where(eq(sessions.id, sessionId));
};

// GET /session/:id
export const getSessionOrdersHandler: AppRouteHandler<typeof getSessionOrders> = async (c) => {
	const { id } = c.req.valid("param");

	const order = await db.query.orders.findFirst({
		where: eq(orders.sessionId, id),
		with: { items: true },
	});

	if (!order) {
		return c.json({ message: "Buyurtma topilmadi" }, 404);
	}

	return c.json(order, 200);
};

// POST / — buyurtma qo'shish
export const addOrderItemsHandler: AppRouteHandler<typeof addOrderItems> = async (c) => {
	const { session_id, items } = c.req.valid("json");
	const user = c.get("user");

	// Sessiya faolmi?
	const session = await db.query.sessions.findFirst({
		where: and(eq(sessions.id, session_id), eq(sessions.status, "active")),
	});

	if (!session) {
		return c.json({ message: "Faol sessiya topilmadi" }, 404);
	}

	// Order olish yoki yaratish
	const order = await getOrCreateOrder(session_id, user.id);

	// Har bir mahsulotni tekshirish va qo'shish
	for (const item of items) {
		const product = await db.query.products.findFirst({
			where: eq(products.id, item.product_id),
		});

		if (!product) {
			return c.json({ message: `Mahsulot topilmadi: ${item.productId}` }, 404);
		}

		if (!product.isAvailable) {
			return c.json({ message: `${product.name} mavjud emas` }, 422);
		}

		// Omborda yetarlimi?
		if (product.stockQuantity < item.quantity) {
			return c.json(
				{ message: `${product.name} omborda yetarli emas. Qoldi: ${product.stockQuantity}` },
				422
			);
		}

		// Xuddi shu mahsulot order da bormi? → miqdor qo'shiladi
		const existingItem = await db.query.orderItems.findFirst({
			where: and(eq(orderItems.orderId, order.id), eq(orderItems.productId, item.productId)),
		});

		if (existingItem) {
			const newQty = existingItem.quantity + item.quantity;
			await db
				.update(orderItems)
				.set({
					quantity: newQty,
					total_price: newQty * existingItem.unitPrice,
					updated_at: new Date(),
				})
				.where(eq(orderItems.id, existingItem.id));
		} else {
			await db.insert(orderItems).values({
				orderId: order.id,
				productId: item.productId,
				productName: product.name,
				unitPrice: product.sellingPrice,
				quantity: item.quantity,
				totalPrice: product.sellingPrice * item.quantity,
				notes: item.notes,
			});
		}

		// Ombor kamaytirish
		await db
			.update(products)
			.set({
				stockQuantity: product.stockQuantity - item.quantity,
				updatedAt: new Date(),
			})
			.where(eq(products.id, item.productId));
	}

	// Order summasini yangilash
	await recalcOrder(order.id);
	await updateSessionOrderAmount(session_id, order.id);

	// Yangilangan orderni qaytarish
	const updatedOrder = await db.query.orders.findFirst({
		where: eq(orders.id, order.id),
		with: { items: true },
	});

	return c.json(updatedOrder!, 201);
};

// PATCH /items/:id — miqdor o'zgartirish
export const updateOrderItemHandler: AppRouteHandler<typeof updateOrderItem> = async (c) => {
	const { id } = c.req.valid("param");
	const { quantity } = c.req.valid("json");

	const item = await db.query.orderItems.findFirst({
		where: eq(orderItems.id, id),
		with: { product: true },
	});

	if (!item) {
		return c.json({ message: "Buyurtma pozitsiyasi topilmadi" }, 404);
	}

	const diff = quantity - item.quantity; // +2 yoki -1

	// Ombor tekshirish (faqat ko'payganda)
	if (diff > 0 && item.product.stockQuantity < diff) {
		return c.json({ message: `Omborda yetarli emas. Qoldi: ${item.product.stockQuantity}` }, 422);
	}

	// Item yangilash
	const [updated] = await db
		.update(orderItems)
		.set({
			quantity,
			total_price: quantity * item.unitPrice,
			updated_at: new Date(),
		})
		.where(eq(orderItems.id, id))
		.returning();

	// Ombor yangilash
	await db
		.update(products)
		.set({
			stockQuantity: item.product.stockQuantity - diff,
			updated_at: new Date(),
		})
		.where(eq(products.id, item.productId));

	// Order va sessiya summasini yangilash
	const order = await db.query.orders.findFirst({
		where: eq(orders.id, item.orderId),
	});

	if (order) {
		await recalcOrder(order.id);
		await updateSessionOrderAmount(order.sessionId, order.id);
	}

	return c.json(updated, 200);
};

// DELETE /items/:id — o'chirish
export const removeOrderItemHandler: AppRouteHandler<typeof removeOrderItem> = async (c) => {
	const { id } = c.req.valid("param");

	const item = await db.query.orderItems.findFirst({
		where: eq(orderItems.id, id),
		with: { product: true },
	});

	if (!item) {
		return c.json({ message: "Buyurtma pozitsiyasi topilmadi" }, 404);
	}

	// O'chirish
	await db.delete(orderItems).where(eq(orderItems.id, id));

	// Omborni qaytarish
	await db
		.update(products)
		.set({
			stockQuantity: item.product.stockQuantity + item.quantity,
			updatedAt: new Date(),
		})
		.where(eq(products.id, item.productId));

	// Order va sessiya summasini yangilash
	const order = await db.query.orders.findFirst({
		where: eq(orders.id, item.order_id),
	});

	if (order) {
		await recalcOrder(order.id);
		await updateSessionOrderAmount(order.sessionId, order.id);
	}

	return c.body(null, 204);
};
