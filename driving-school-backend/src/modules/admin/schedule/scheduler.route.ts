import { Router } from "express";
import { generateSchedule, cancelSchedule } from "./scheduler.controller.js";
import { authenticate } from "../../../middleware/auth.middleware.js";
import { isAdmin } from "../../../middleware/admin.middleware.js";

const router = Router();

router.post("/generate", authenticate, isAdmin, generateSchedule);
router.post("/cancel", authenticate, isAdmin, cancelSchedule);

export default router;