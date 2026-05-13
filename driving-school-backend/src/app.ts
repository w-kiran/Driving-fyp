import express, { urlencoded } from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from "./modules/auth/auth.route.js";
import studentRoutes from "./modules/student/student.routes.js";
import instructorRoutes from "./modules/admin/instructor/instructor.route.js";
import vehicleRoutes from "./modules/admin/vehicle/vehicle.route.js";
import bookingRoutes from "./modules/admin/booking/booking.route.js";
import scheduleRoutes from "./modules/admin/schedule/scheduler.route.js";
import lessonRoutes from "./modules/admin/lesson/lesson.route.js";
import dashboardRoutes from "./modules/admin/dashboard/dashboard.route.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(urlencoded({ extended: true }));
const corsOptions = {
  origin: ["http://localhost:3000", "http://localhost:5173"],
  credentials: true
};
app.use(cors(corsOptions));

app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/instructors", instructorRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/admin/bookings", bookingRoutes);
app.use("/api/admin/schedule", scheduleRoutes);
app.use("/api/admin/lessons", lessonRoutes);
app.use("/api/admin/dashboard", dashboardRoutes);

export default app;