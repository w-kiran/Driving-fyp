import { Router } from "express";
import { requestNewLesson } from "./student.controller.js";

const router = Router();

router.put("/:id/request-new-lesson", requestNewLesson);

export default router;