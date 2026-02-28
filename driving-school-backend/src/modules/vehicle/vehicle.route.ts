import { Router } from "express";
import {
  addVehicle,
  getVehicles
} from "./vehicle.controller.js";

const router = Router();

router.post("/", addVehicle);
router.get("/", getVehicles);

export default router;