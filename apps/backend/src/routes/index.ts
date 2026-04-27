import { createRouter } from "../lib";
import auth from "./auth";
import health from "./health";
import tables from "./tables";
import users from "./users";
import shifts from "./shifts";
import sessions from "./sessions";
import products from "./products";
import orders from "./orders";

const router = createRouter()
	.route("/", health)
	.route("/auth", auth)
	.route("/users", users)
	.route("/tables", tables)
	.route("/shifts", shifts)
	.route("/products", products)
	.route("/orders",orders)
	.route("/sessions",sessions);

export default router;
