import { createRouter } from "@/lib";
import { authMiddleware } from "@/lib/auth";

import {
	createHandler,
	deleteHandler,
	getByIdHandler,
	listHandler,
	updateHandler,
} from "./users.handlers";
import { createUser, deleteUser, getUser, listUsers, updateUser } from "./users.routes";

const router = createRouter();

router.use(authMiddleware);

router.openapi(listUsers, listHandler);
router.openapi(getUser, getByIdHandler);
router.openapi(createUser, createHandler);
router.openapi(updateUser, updateHandler);
router.openapi(deleteUser, deleteHandler);

export default router;
