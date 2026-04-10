import { createRouter } from "@/lib";
import { authMiddleware } from "@/lib/auth";
import {
	createOrganizationHandler,
	deleteOrganizationHandler,
	getOrganizationHandler,
	listOrganizationsHandler,
	updateOrganizationHandler,
} from "./organizations.handler";
import {
	createOrganization,
	deleteOrganization,
	getOrganization,
	listOrganizations,
	updateOrganization,
} from "./organizations.routes";

const router = createRouter();
router.use("*", authMiddleware);

router.openapi(listOrganizations, listOrganizationsHandler);
router.openapi(getOrganization, getOrganizationHandler);
router.openapi(createOrganization, createOrganizationHandler);
router.openapi(updateOrganization, updateOrganizationHandler);
router.openapi(deleteOrganization, deleteOrganizationHandler);

export default router;
