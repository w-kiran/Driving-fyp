import { Router } from "express";
import { addInstructor, getInstructors } from "./instructor.controller.js";
import { authenticate } from "../../../middleware/auth.middleware.js";
import { isAdmin } from "../../../middleware/admin.middleware.js";
const router = Router();
// 🔒 Only admin can access
router.post("/", authenticate, isAdmin, addInstructor);
router.get("/", authenticate, isAdmin, getInstructors);
export default router;
//# sourceMappingURL=instructor.route.js.map