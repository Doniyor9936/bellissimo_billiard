import { createRouter } from "../lib";
import auth from "./auth";
import health from "./health";
import organizationCrossAccess from "./organization-cross-access";
import organizationTypePositions from "./organization-type-positions";
import organizations from "./organizations";

const router = createRouter()
	.route("/", health)
	.route("/auth", auth)
	.route("/organizations-type", organizationTypePositions)
	.route("organization-cross-access", organizationCrossAccess)
	.route("/organizations", organizations);

export default router;
