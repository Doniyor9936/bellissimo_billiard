import { createRouter } from "@/lib";
import { authMiddleware } from "@/lib/auth";
import {
	applyDiscountHandler,
	cancelSessionHandler,
	closeSessionHandler,
	getOneSessionHandler,
	listSessionsHandler,
	openSessionHandler,
	pauseSessionHandler,
	resumeSessionHandler,
	updateRateHandler,
} from "./sessions.handlers";
import {
	applyDiscount,
	cancelSession,
	closeSession,
	getOneSession,
	listSessions,
	openSession,
	pauseSession,
	resumeSession,
	updateRate,
} from "./sessions.routes";

const router = createRouter();
router.use(authMiddleware);
router.openapi(listSessions, listSessionsHandler);
router.openapi(getOneSession, getOneSessionHandler);
router.openapi(openSession, openSessionHandler);
router.openapi(pauseSession, pauseSessionHandler);
router.openapi(resumeSession, resumeSessionHandler);
router.openapi(updateRate, updateRateHandler);
router.openapi(applyDiscount, applyDiscountHandler);
router.openapi(closeSession, closeSessionHandler);
router.openapi(cancelSession, cancelSessionHandler);

export default router;
