import { Router } from "express";
import { getAllStudents, getStudentById, createStudent, updateStudent, deleteStudent } from "./student.controller.js";
import { authenticate } from "../../../middleware/auth.middleware.js";
import { isAdmin } from "../../../middleware/admin.middleware.js";

const router = Router();

router.get("/", authenticate, isAdmin, getAllStudents);
router.get("/:id", authenticate, isAdmin, getStudentById);
router.post("/", authenticate, isAdmin, createStudent);
router.put("/:id", authenticate, isAdmin, updateStudent);
router.delete("/:id", authenticate, isAdmin, deleteStudent);

export default router;