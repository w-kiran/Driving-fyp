import { Router } from "express";
import { getAllStudents, getStudentById, createStudent, updateStudent, deleteStudent } from "./student.controller.js";
import { authenticate } from "../../../middleware/auth.middleware.js";
import { isAdmin } from "../../../middleware/admin.middleware.js";
import { validate } from "../../../middleware/validate.middleware.js";
import { createStudentSchema, updateStudentSchema } from "../../../utils/validation.js";

const router = Router();

router.get("/", authenticate, isAdmin, getAllStudents);
router.get("/:id", authenticate, isAdmin, getStudentById);
router.post("/", authenticate, isAdmin, validate(createStudentSchema), createStudent);
router.put("/:id", authenticate, isAdmin, validate(updateStudentSchema), updateStudent);
router.delete("/:id", authenticate, isAdmin, deleteStudent);

export default router;