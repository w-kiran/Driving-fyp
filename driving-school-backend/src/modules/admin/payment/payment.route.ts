import { Router } from "express";
import { createPayment, getAllPayments, getPaymentById, refundPayment } from "./payment.controller.js";
import { authenticate } from "../../../middleware/auth.middleware.js";
import { isAdmin } from "../../../middleware/admin.middleware.js";
import { validate } from "../../../middleware/validate.middleware.js";
import { createPaymentSchema } from "../../../utils/validation.js";

const router = Router();

router.post("/", authenticate, isAdmin, validate(createPaymentSchema), createPayment);
router.get("/", authenticate, isAdmin, getAllPayments);
router.get("/:id", authenticate, isAdmin, getPaymentById);
router.put("/:id/refund", authenticate, isAdmin, refundPayment);

export default router;