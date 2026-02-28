import express, { urlencoded } from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from "./modules/auth/auth.route.js";
import studentRoutes from "./modules/student/student.routes.js";
import instructorRoutes from "./modules/instructor/instructor.route.js";
import vehicleRoutes from "./modules/vehicle/vehicle.route.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(urlencoded({ extended: true }));
const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true
};
app.use(cors(corsOptions));

// Mount routes here later
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/instructors", instructorRoutes);
app.use("/api/vehicles", vehicleRoutes);

export default app;