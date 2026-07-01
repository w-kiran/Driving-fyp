import { Router } from "express";
import { requestNewLesson, getMyBookings, cancelBooking, getMyLessons, editBooking, deleteBooking, getDailyBookingCounts, getMyProgress } from "./student.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { createBookingSchema, editBookingSchema } from "../../utils/validation.js";

const router = Router();

router.post("/request-new-lesson", authenticate, validate(createBookingSchema), requestNewLesson);
router.get("/bookings", authenticate, getMyBookings);
router.put("/bookings/:id", authenticate, validate(editBookingSchema), editBooking);
router.put("/bookings/:id/cancel", authenticate, cancelBooking);
router.delete("/bookings/:id", authenticate, deleteBooking);
router.get("/lessons", authenticate, getMyLessons);
router.get("/daily-booking-counts", authenticate, getDailyBookingCounts);
router.get("/progress", authenticate, getMyProgress);

export default router;