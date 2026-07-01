import { Router } from "express";
import {
  adminLogin,
  studentRegister,
  studentLogin,
  logout
} from "./auth.controller.js";
import { validate } from "../../middleware/validate.middleware.js";
import {
  adminLoginSchema,
  studentRegisterSchema,
  studentLoginSchema,
} from "../../utils/validation.js";

const router = Router();

router.post("/admin/login", validate(adminLoginSchema), adminLogin);
router.post("/student/register", validate(studentRegisterSchema), studentRegister);
router.post("/student/login", validate(studentLoginSchema), studentLogin);
router.post("/logout", logout);

export default router;