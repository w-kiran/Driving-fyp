import type { Request, Response } from "express";
import prisma from "../../config/db.js";
import jwt from "jsonwebtoken";
import { parseSortParams } from "../../utils/sortHelper.js";

interface BookingRequest {
  preferredSlot: "MORNING" | "AFTERNOON" | "EVENING";
  preferredDate: string;
  vehicleType: "CAR" | "BIKE" | "SCOOTER";
  trainingDuration: number;
  experienceLevel: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  lessonsCompleted?: number;
  failures?: number;
  examDate?: string;
}

export const requestNewLesson = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "Unauthorized" });

    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    let payload: any;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET!);
    } catch {
      return res.status(401).json({ message: "Invalid token" });
    }

    const {
      preferredSlot,
      preferredDate,
      vehicleType,
      trainingDuration,
      experienceLevel,
      lessonsCompleted = 0,
      failures = 0,
      examDate,
    }: BookingRequest = req.body;

    if (!preferredSlot || !vehicleType || !trainingDuration || !experienceLevel || !preferredDate) {
      return res.status(400).json({ message: "Missing required booking fields" });
    }

    const duration = Number(trainingDuration);
    if (![30, 60].includes(duration)) {
      return res.status(400).json({ message: "Training duration must be 30 or 60 minutes" });
    }

    const student = await prisma.student.findUnique({
      where: { userId: payload.id },
    });
    if (!student) return res.status(404).json({ message: "Student not found" });

    const dateParts = preferredDate.split("-");
    if (dateParts.length !== 3) {
      return res.status(400).json({ message: "Invalid preferredDate format" });
    }

    const year = Number(dateParts[0]);
    const month = Number(dateParts[1]);
    const day = Number(dateParts[2]);

    if (isNaN(year) || isNaN(month) || isNaN(day)) {
      return res.status(400).json({ message: "Invalid preferredDate values" });
    }

    const dateObj = new Date(year, month - 1, day);
    dateObj.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 7);
    maxDate.setHours(23, 59, 59, 999);

    if (dateObj < today) {
      return res.status(400).json({ message: "Preferred date cannot be before today" });
    }

    if (dateObj > maxDate) {
      return res.status(400).json({ message: "Preferred date cannot be more than 7 days from today" });
    }

    const bookingCount = await prisma.booking.count({
      where: { studentId: student.id, preferredDate },
    });

    if (bookingCount >= 3) {
      return res.status(400).json({ message: "You can only book maximum 3 lessons per day" });
    }

    const booking = await prisma.booking.create({
      data: {
        studentId: student.id,
        preferredSlot: preferredSlot as "MORNING" | "AFTERNOON" | "EVENING",
        preferredDate,
        vehicleType: vehicleType as "CAR" | "BIKE" | "SCOOTER",
        trainingDuration: duration,
        experienceLevel: experienceLevel as "BEGINNER" | "INTERMEDIATE" | "ADVANCED",
        lessonsCompleted,
        failures,
        examDate: examDate ? new Date(examDate) : null,
        status: "PENDING",
      },
    });

    res.json({ message: "Lesson request created successfully", booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMyBookings = async (_req: Request, res: Response) => {
  try {
    const authHeader = _req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "Unauthorized" });

    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    let payload: any;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET!);
    } catch {
      return res.status(401).json({ message: "Invalid token" });
    }

    const student = await prisma.student.findUnique({
      where: { userId: payload.id },
    });
    if (!student) return res.status(404).json({ message: "Student not found" });

    const vehicleType = _req.query.vehicleType as string | undefined;
    const orderBy = parseSortParams(_req, "createdAt", "desc");

    const where: any = { studentId: student.id };
    if (vehicleType) where.vehicleType = vehicleType;

    const bookings = await prisma.booking.findMany({
      where,
      orderBy
    });

    res.json({ bookings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const cancelBooking = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "Unauthorized" });

    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    let payload: any;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET!);
    } catch {
      return res.status(401).json({ message: "Invalid token" });
    }

    const student = await prisma.student.findUnique({
      where: { userId: payload.id },
    });
    if (!student) return res.status(404).json({ message: "Student not found" });

    const id = req.params.id as string;
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(id) }
    });

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.studentId !== student.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (booking.status !== "PENDING") {
      return res.status(400).json({ message: "Only PENDING bookings can be cancelled" });
    }

    await prisma.booking.update({
      where: { id: parseInt(id) },
      data: { status: "CANCELLED" }
    });

    res.json({ message: "Booking cancelled successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMyLessons = async (_req: Request, res: Response) => {
  try {
    const authHeader = _req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "Unauthorized" });

    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    let payload: any;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET!);
    } catch {
      return res.status(401).json({ message: "Invalid token" });
    }

    const student = await prisma.student.findUnique({
      where: { userId: payload.id },
    });
    if (!student) return res.status(404).json({ message: "Student not found" });

    const orderBy = parseSortParams(_req, "createdAt", "desc");

    const lessons = await prisma.lesson.findMany({
      where: { studentId: student.id },
      include: { instructor: true, vehicle: true },
      orderBy
    });

    res.json({ lessons });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};