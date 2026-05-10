import { Router } from "express";
import {
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  deleteBooking
} from "./booking.controller.js";
import { authenticate } from "../../../middleware/auth.middleware.js";
import { isAdmin } from "../../../middleware/admin.middleware.js";

const router = Router();

router.get("/", authenticate, isAdmin, getAllBookings);
router.get("/:id", authenticate, isAdmin, getBookingById);
router.put("/:id", authenticate, isAdmin, updateBookingStatus);
router.delete("/:id", authenticate, isAdmin, deleteBooking);

export default router;