import type { AppRouteHandler } from "@/lib";
import { eq, and, sum } from "drizzle-orm";
import { db } from "@/db";
import { orders, order_items, sessions, products } from "@/db/schema";
import type {
    getSessionOrders,
    addOrderItems,
    updateOrderItem,
    removeOrderItem,
} from "./orders.routes";

// Sessiyaning order va itemlarini olish
const getOrCreateOrder = async (sessionId: string, cashierId: string) => {
    // Sessiyaning mavjud orderi bormi?
    let order = await db.query.orders.findFirst({
        where: eq(orders.session_id, sessionId),
        with: { items: true },
    });

    // Yo'q bo'lsa yangi order yaratiladi
    if (!order) {
        const [newOrder] = await db
            .insert(orders)
            .values({
                session_id: sessionId,
                cashier_id: cashierId,
                subtotal: 0,
                total_amount: 0,
            })
            .returning();

        order = { ...newOrder, items: [] };
    }

    return order;
};

// Order summasini qayta hisoblash
const recalcOrder = async (orderId: string) => {
    const items = await db.query.order_items.findMany({
        where: eq(order_items.order_id, orderId),
    });

    const subtotal = items.reduce((sum, item) => sum + item.total_price, 0);

    const [updated] = await db
        .update(orders)
        .set({ subtotal, total_amount: subtotal, updated_at: new Date() })
        .where(eq(orders.id, orderId))
        .returning();

    return updated;
};

// Sessiya order_amount ni yangilash
const updateSessionOrderAmount = async (sessionId: string, orderId: string) => {
    const [{ total }] = await db
        .select({ total: sum(order_items.total_price) })
        .from(order_items)
        .where(eq(order_items.order_id, orderId));

    await db
        .update(sessions)
        .set({
            order_amount: Number(total ?? 0),
            updated_at: new Date(),
        })
        .where(eq(sessions.id, sessionId));
};

// GET /session/:id
export const getSessionOrdersHandler: AppRouteHandler<typeof getSessionOrders> = async (c) => {
    const { id } = c.req.valid("param");

    const order = await db.query.orders.findFirst({
        where: eq(orders.session_id, id),
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
            return c.json({ message: `Mahsulot topilmadi: ${item.product_id}` }, 404);
        }

        if (!product.is_available) {
            return c.json({ message: `${product.name} mavjud emas` }, 422);
        }

        // Omborda yetarlimi?
        if (product.stock_quantity < item.quantity) {
            return c.json(
                { message: `${product.name} omborda yetarli emas. Qoldi: ${product.stock_quantity}` },
                422,
            );
        }

        // Xuddi shu mahsulot order da bormi? → miqdor qo'shiladi
        const existingItem = await db.query.order_items.findFirst({
            where: and(
                eq(order_items.order_id, order.id),
                eq(order_items.product_id, item.product_id),
            ),
        });

        if (existingItem) {
            const newQty = existingItem.quantity + item.quantity;
            await db
                .update(order_items)
                .set({
                    quantity: newQty,
                    total_price: newQty * existingItem.unit_price,
                    updated_at: new Date(),
                })
                .where(eq(order_items.id, existingItem.id));
        } else {
            await db.insert(order_items).values({
                order_id: order.id,
                product_id: item.product_id,
                product_name: product.name,
                unit_price: product.selling_price,
                quantity: item.quantity,
                total_price: product.selling_price * item.quantity,
                notes: item.notes,
            });
        }

        // Ombor kamaytirish
        await db
            .update(products)
            .set({
                stock_quantity: product.stock_quantity - item.quantity,
                updated_at: new Date(),
            })
            .where(eq(products.id, item.product_id));
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

    const item = await db.query.order_items.findFirst({
        where: eq(order_items.id, id),
        with: { product: true },
    });

    if (!item) {
        return c.json({ message: "Buyurtma pozitsiyasi topilmadi" }, 404);
    }

    const diff = quantity - item.quantity; // +2 yoki -1

    // Ombor tekshirish (faqat ko'payganda)
    if (diff > 0 && item.product.stock_quantity < diff) {
        return c.json(
            { message: `Omborda yetarli emas. Qoldi: ${item.product.stock_quantity}` },
            422,
        );
    }

    // Item yangilash
    const [updated] = await db
        .update(order_items)
        .set({
            quantity,
            total_price: quantity * item.unit_price,
            updated_at: new Date(),
        })
        .where(eq(order_items.id, id))
        .returning();

    // Ombor yangilash
    await db
        .update(products)
        .set({
            stock_quantity: item.product.stock_quantity - diff,
            updated_at: new Date(),
        })
        .where(eq(products.id, item.product_id));

    // Order va sessiya summasini yangilash
    const order = await db.query.orders.findFirst({
        where: eq(orders.id, item.order_id),
    });

    if (order) {
        await recalcOrder(order.id);
        await updateSessionOrderAmount(order.session_id, order.id);
    }

    return c.json(updated, 200);
};

// DELETE /items/:id — o'chirish
export const removeOrderItemHandler: AppRouteHandler<typeof removeOrderItem> = async (c) => {
    const { id } = c.req.valid("param");

    const item = await db.query.order_items.findFirst({
        where: eq(order_items.id, id),
        with: { product: true },
    });

    if (!item) {
        return c.json({ message: "Buyurtma pozitsiyasi topilmadi" }, 404);
    }

    // O'chirish
    await db.delete(order_items).where(eq(order_items.id, id));

    // Omborni qaytarish
    await db
        .update(products)
        .set({
            stock_quantity: item.product.stock_quantity + item.quantity,
            updated_at: new Date(),
        })
        .where(eq(products.id, item.product_id));

    // Order va sessiya summasini yangilash
    const order = await db.query.orders.findFirst({
        where: eq(orders.id, item.order_id),
    });

    if (order) {
        await recalcOrder(order.id);
        await updateSessionOrderAmount(order.session_id, order.id);
    }

    return c.body(null, 204);
};