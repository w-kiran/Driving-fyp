import { Router } from "express";
import {
  addInstructor,
  getInstructors,
  updateInstructor,
  deleteInstructor,
  toggleInstructorAvailable
} from "./instructor.controller.js";
import { authenticate } from "../../../middleware/auth.middleware.js";
import { isAdmin } from "../../../middleware/admin.middleware.js";
import { validate } from "../../../middleware/validate.middleware.js";
import { addInstructorSchema, updateInstructorSchema } from "../../../utils/validation.js";

const router = Router();

// 🔒 Only admin can access
router.post("/", authenticate, isAdmin, validate(addInstructorSchema), addInstructor);
router.get("/", authenticate, isAdmin, getInstructors);
router.put("/:id", authenticate, isAdmin, validate(updateInstructorSchema), updateInstructor);
router.patch("/:id/toggle", authenticate, isAdmin, toggleInstructorAvailable);
router.delete("/:id", authenticate, isAdmin, deleteInstructor);

export default router;