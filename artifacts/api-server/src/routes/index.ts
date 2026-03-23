import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import patientsRouter from "./patients";
import doctorsRouter from "./doctors";
import appointmentsRouter from "./appointments";
import billingRouter from "./billing";
import reportsRouter from "./reports";
import notificationsRouter from "./notifications";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/patients", patientsRouter);
router.use("/doctors", doctorsRouter);
router.use("/appointments", appointmentsRouter);
router.use("/billing", billingRouter);
router.use("/reports", reportsRouter);
router.use("/notifications", notificationsRouter);
router.use("/admin", adminRouter);

export default router;
