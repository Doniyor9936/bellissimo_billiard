import { createRouter } from "@/lib";
import { authMiddleware } from "@/lib/auth";

import {
	createHandler,
	deleteHandler,
	getByIdHandler,
	listHandler,
	updateHandler,
} from "./organization-types.handlers";
import {
	createOrganizationType,
	deleteOrganizationType,
	getOrganizationType,
	listOrganizationTypes,
	updateOrganizationType,
} from "./organization-types.routes";

const router = createRouter();

router.use(authMiddleware);

router.openapi(listOrganizationTypes, listHandler);
router.openapi(getOrganizationType, getByIdHandler);
router.openapi(createOrganizationType, createHandler);
router.openapi(updateOrganizationType, updateHandler);
router.openapi(deleteOrganizationType, deleteHandler);

export default router;
