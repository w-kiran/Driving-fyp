import { Router } from "express";
import { generateSchedule } from "./scheduler.controller.js";
import { authenticate } from "../../../middleware/auth.middleware.js";
import { isAdmin } from "../../../middleware/admin.middleware.js";

const router = Router();

router.post("/generate", authenticate, isAdmin, generateSchedule);

export default router;