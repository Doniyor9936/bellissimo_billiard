import { createRouter } from "@/lib";
import { authMiddleware } from "@/lib/auth";

import {
	createHandler,
	deleteHandler,
	getByIdHandler,
	listHandler,
	updateHandler,
} from "./organization-cross-access.handlers";
import {
	createOrganizationCrossAccess,
	deleteOrganizationCrossAccess,
	getOrganizationCrossAccess,
	listOrganizationCrossAccess,
	updateOrganizationCrossAccess,
} from "./organization-cross-access.routes";

const router = createRouter();

router.use(authMiddleware);

router.openapi(listOrganizationCrossAccess, listHandler);
router.openapi(getOrganizationCrossAccess, getByIdHandler);
router.openapi(createOrganizationCrossAccess, createHandler);
router.openapi(updateOrganizationCrossAccess, updateHandler);
router.openapi(deleteOrganizationCrossAccess, deleteHandler);

export default router;
