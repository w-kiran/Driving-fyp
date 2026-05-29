import { Router } from "express";
import {
  addVehicle,
  getVehicles,
  updateVehicle,
  toggleVehicleActive,
  deleteVehicle
} from "./vehicle.controller.js";
import { authenticate } from "../../../middleware/auth.middleware.js";
import { isAdmin } from "../../../middleware/admin.middleware.js";

const router = Router();

// 🔒 Only admin can access these routes
router.post("/", authenticate, isAdmin, addVehicle);
router.get("/", authenticate, isAdmin, getVehicles);
router.put("/:id", authenticate, isAdmin, updateVehicle);
router.patch("/:id/toggle", authenticate, isAdmin, toggleVehicleActive);
router.delete("/:id", authenticate, isAdmin, deleteVehicle);

export default router;