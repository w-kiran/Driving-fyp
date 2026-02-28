import { Router } from "express";
import {
  addInstructor,
  getInstructors
} from "./instructor.controller.js";

const router = Router();

router.post("/", addInstructor);
router.get("/", getInstructors);

export default router;