import { Router } from "express";
import { getDashboardStats } from "./dashboard.controller.js";
import { authenticate } from "../../../middleware/auth.middleware.js";
import { isAdmin } from "../../../middleware/admin.middleware.js";
const router = Router();
router.get("/", authenticate, isAdmin, getDashboardStats);
export default router;
//# sourceMappingURL=dashboard.route.js.map