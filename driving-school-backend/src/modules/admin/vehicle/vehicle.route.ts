import { Router } from "express";
import {
  addVehicle,
  getVehicles
} from "./vehicle.controller.js";
import { authenticate } from "../../../middleware/auth.middleware.js";
import { isAdmin } from "../../../middleware/admin.middleware.js";

const router = Router();

// 🔒 Only admin can access these routes
router.post("/", authenticate, isAdmin, addVehicle);
router.get("/", authenticate, isAdmin, getVehicles);

export default router;