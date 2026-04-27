import { createRouter } from "../lib";
import auth from "./auth";
import health from "./health";
import orders from "./orders";
import products from "./products";
import sessions from "./sessions";
import shifts from "./shifts";
import tables from "./tables";
import users from "./users";

const router = createRouter()
	.route("/", health)
	.route("/auth", auth)
	.route("/users", users)
	.route("/tables", tables)
	.route("/shifts", shifts)
	.route("/products", products)
	.route("/orders", orders)
	.route("/sessions", sessions);

export default router;
