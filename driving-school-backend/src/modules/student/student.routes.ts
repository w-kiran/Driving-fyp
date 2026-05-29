import { Router } from "express";
import { requestNewLesson, getMyBookings, cancelBooking, getMyLessons, editBooking, deleteBooking } from "./student.controller.js";

const router = Router();

router.post("/request-new-lesson", requestNewLesson);
router.get("/bookings", getMyBookings);
router.put("/bookings/:id", editBooking);
router.put("/bookings/:id/cancel", cancelBooking);
router.delete("/bookings/:id", deleteBooking);
router.get("/lessons", getMyLessons);

export default router;