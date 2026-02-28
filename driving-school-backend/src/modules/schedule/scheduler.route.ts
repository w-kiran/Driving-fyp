import { Router } from "express";
import { generateSchedule } from "./scheduler.controller.js";

const router = Router();

router.post("/generate", generateSchedule);

export default router;