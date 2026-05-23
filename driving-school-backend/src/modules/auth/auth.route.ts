import { Router } from "express";
import {
  adminLogin,
  studentRegister,
  studentLogin,
  logout
} from "./auth.controller.js";

const router = Router();

router.post("/admin/login", adminLogin);
router.post("/student/register", studentRegister);
router.post("/student/login", studentLogin);
router.post("/logout", logout);

export default router;