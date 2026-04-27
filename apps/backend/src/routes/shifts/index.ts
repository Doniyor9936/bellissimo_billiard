import { createRouter } from "@/lib";
import { authMiddleware } from "@/lib/auth";
import {
	cashTransactionHandler,
	closeShiftHandler,
	getActiveShiftHandler,
	openShiftHandler,
	xReportHandler,
} from "./shifts.handlers";
import { cashTransaction, closeShift, getActiveShift, openShift, xReport } from "./shifts.routes";

const router = createRouter();
router.use(authMiddleware);
router.openapi(getActiveShift, getActiveShiftHandler);
router.openapi(openShift, openShiftHandler);
router.openapi(cashTransaction, cashTransactionHandler);
router.openapi(closeShift, closeShiftHandler);
router.openapi(xReport, xReportHandler);

export default router;
