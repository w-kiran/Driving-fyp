import { Router } from "express";
import { createPayment, getAllPayments, getPaymentById, refundPayment } from "./payment.controller.js";
import { authenticate } from "../../../middleware/auth.middleware.js";
import { isAdmin } from "../../../middleware/admin.middleware.js";

const router = Router();

router.post("/", authenticate, isAdmin, createPayment);
router.get("/", authenticate, isAdmin, getAllPayments);
router.get("/:id", authenticate, isAdmin, getPaymentById);
router.put("/:id/refund", authenticate, isAdmin, refundPayment);

export default router;