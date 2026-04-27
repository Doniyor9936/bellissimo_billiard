import { createRouter } from "@/lib";
import { authMiddleware, requireRole } from "@/lib/auth";
import {
	createProductHandler,
	deleteProductHandler,
	getOneProductHandler,
	listProductsHandler,
	stockInHandler,
	updateProductHandler,
} from "./products.handlers";
import {
	createProduct,
	deleteProduct,
	getOneProduct,
	listProducts,
	stockIn,
	updateProduct,
} from "./products.routes";

const router = createRouter();
router.use(authMiddleware);
router.use(requireRole("admin"));

router.openapi(listProducts, listProductsHandler);
router.openapi(getOneProduct, getOneProductHandler);
router.openapi(createProduct, createProductHandler);
router.openapi(updateProduct, updateProductHandler);
router.openapi(deleteProduct, deleteProductHandler);
router.openapi(stockIn, stockInHandler);

export default router;
