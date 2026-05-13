import { Router } from "express";
import { adminLogin, studentRegister, studentLogin } from "./auth.controller.js";
const router = Router();
router.post("/admin/login", adminLogin);
router.post("/student/register", studentRegister);
router.post("/student/login", studentLogin);
export default router;
//# sourceMappingURL=auth.route.js.map