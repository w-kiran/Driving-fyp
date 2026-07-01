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
import { validate } from "../../../middleware/validate.middleware.js";
import { addVehicleSchema, updateVehicleSchema } from "../../../utils/validation.js";

const router = Router();

// 🔒 Only admin can access these routes
router.post("/", authenticate, isAdmin, validate(addVehicleSchema), addVehicle);
router.get("/", authenticate, isAdmin, getVehicles);
router.put("/:id", authenticate, isAdmin, validate(updateVehicleSchema), updateVehicle);
router.patch("/:id/toggle", authenticate, isAdmin, toggleVehicleActive);
router.delete("/:id", authenticate, isAdmin, deleteVehicle);

export default router;