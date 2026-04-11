import { createRouter } from "../lib";
import auth from "./auth";
import health from "./health";
import organizationCrossAccess from "./organization-cross-access";
import organizationTypePositions from "./organization-type-positions";
import organizationType from "./organization-types";
import organizationUser from "./organization-users";
import organizations from "./organizations";
import users from "./users";

const router = createRouter()
	.route("/", health)
	.route("/auth", auth)
	.route("/users", users)
	.route("/organizations-type-position", organizationTypePositions)
	.route("/organization-users", organizationUser)
	.route("/organization-cross-access", organizationCrossAccess)
	.route("/organization-types", organizationType)
	.route("/organizations", organizations);

export default router;
