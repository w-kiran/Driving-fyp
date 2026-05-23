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

const router = Router();

router.get("/", authenticate, isAdmin, getAllLessons);
router.get("/:id", authenticate, isAdmin, getLessonById);
router.put("/:id", authenticate, isAdmin, updateLesson);
router.put("/:id/complete", authenticate, isAdmin, completeLesson);
router.delete("/:id", authenticate, isAdmin, deleteLesson);

export default router;