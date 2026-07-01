import { Router } from "express";
import {
  getAllLessons,
  getLessonById,
  updateLesson,
  deleteLesson,
  completeLesson
} from "./lesson.controller.js";
import { authenticate } from "../../../middleware/auth.middleware.js";
import { isAdmin } from "../../../middleware/admin.middleware.js";
import { validate } from "../../../middleware/validate.middleware.js";
import { updateLessonSchema, completeLessonSchema } from "../../../utils/validation.js";

const router = Router();

router.get("/", authenticate, isAdmin, getAllLessons);
router.get("/:id", authenticate, isAdmin, getLessonById);
router.put("/:id", authenticate, isAdmin, validate(updateLessonSchema), updateLesson);
router.put("/:id/complete", authenticate, isAdmin, validate(completeLessonSchema), completeLesson);
router.delete("/:id", authenticate, isAdmin, deleteLesson);

export default router;