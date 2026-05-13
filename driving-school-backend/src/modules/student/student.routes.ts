import { Router } from "express";
import { requestNewLesson, getMyBookings, cancelBooking, getMyLessons } from "./student.controller.js";

const router = Router();

router.put("/request-new-lesson", requestNewLesson);
router.get("/bookings", getMyBookings);
router.put("/bookings/:id/cancel", cancelBooking);
router.get("/lessons", getMyLessons);

export default router;