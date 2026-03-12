import { Router } from "express";
import { requestNewLesson } from "./student.controller.js";

const router = Router();

router.put("/request-new-lesson", requestNewLesson);

export default router;