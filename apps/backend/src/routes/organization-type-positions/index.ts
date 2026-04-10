import { createRouter } from "@/lib";
import { authMiddleware } from "@/lib/auth";

import {
	createHandler,
	deleteHandler,
	getByIdHandler,
	listHandler,
	updateHandler,
} from "./organization-type-positions.handlers";
import {
	createOrganizationTypePosition,
	deleteOrganizationTypePosition,
	getOrganizationTypePosition,
	listOrganizationTypePositions,
	updateOrganizationTypePositon,
} from "./organization-type-positions.routes";

const router = createRouter();

router.use(authMiddleware);

router.openapi(listOrganizationTypePositions, listHandler);
router.openapi(getOrganizationTypePosition, getByIdHandler);
router.openapi(createOrganizationTypePosition, createHandler);
router.openapi(updateOrganizationTypePositon, updateHandler);
router.openapi(deleteOrganizationTypePosition, deleteHandler);

export default router;
