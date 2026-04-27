import { createRouter } from "@/lib";
import { authMiddleware } from "@/lib/auth";
import {
	addOrderItemsHandler,
	getSessionOrdersHandler,
	removeOrderItemHandler,
	updateOrderItemHandler,
} from "./orders.handlers";
import { addOrderItems, getSessionOrders, removeOrderItem, updateOrderItem } from "./orders.routes";

const router = createRouter();
router.use(authMiddleware);

router.openapi(getSessionOrders, getSessionOrdersHandler);
router.openapi(addOrderItems, addOrderItemsHandler);
router.openapi(updateOrderItem, updateOrderItemHandler);
router.openapi(removeOrderItem, removeOrderItemHandler);

export default router;
