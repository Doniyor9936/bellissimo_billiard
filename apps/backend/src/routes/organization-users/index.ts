import { createRouter } from "@/lib";
import { authMiddleware } from "@/lib/auth";

import {
	createHandler,
	deleteHandler,
	getByIdHandler,
	listHandler,
	updateHandler,
} from "./organization-users.handlers";
import {
	createOrganizationUser,
	deleteOrganizationUser,
	getOrganizationUser,
	listOrganizationUsers,
	updateOrganizationUser,
} from "./organization-users.routes";

const router = createRouter();

router.use(authMiddleware);

router.openapi(listOrganizationUsers, listHandler);
router.openapi(getOrganizationUser, getByIdHandler);
router.openapi(createOrganizationUser, createHandler);
router.openapi(updateOrganizationUser, updateHandler);
router.openapi(deleteOrganizationUser, deleteHandler);

export default router;
