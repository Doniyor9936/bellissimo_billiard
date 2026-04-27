import { createRouter } from "@/lib";
import { authMiddleware } from "@/lib/auth";
import { createTableHandler, deleteTableHandler, listTablesHandler, updateTableHandler } from "./tables.handler";
import { createTables, deleteTable, fullTables, updateTable } from "./tables.routes";

const router = createRouter();

router.use(authMiddleware);

router.openapi(fullTables, listTablesHandler);
router.openapi(createTables, createTableHandler);
router.openapi(updateTable, updateTableHandler);
router.openapi(deleteTable, deleteTableHandler);

export default router;