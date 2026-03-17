import {
  PrismaClient,
  Slot,
  VehicleType,
  ExperienceLevel,
  Status,
} from "@prisma/client";
import type { Request, Response } from "express";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

interface BookingRequest {
  preferredSlot: "MORNING" | "AFTERNOON" | "EVENING";
  preferredDate: string; // "YYYY-MM-DD" format
  vehicleType: "CAR" | "BIKE" | "SCOOTER";
  trainingDuration: number;
  experienceLevel: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  lessonsCompleted?: number;
  failures?: number;
  examDate?: string;
}

export const requestNewLesson = async (req: Request, res: Response) => {
  try {
    // --- AUTH ---
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

    // --- REQUEST BODY ---
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

    if (
      !preferredSlot ||
      !vehicleType ||
      !trainingDuration ||
      !experienceLevel ||
      !preferredDate
    ) {
      return res
        .status(400)
        .json({ message: "Missing required booking fields" });
    }

    // Validate training duration
    if (![30, 60].includes(trainingDuration)) {
      return res.status(400).json({
        message: "Training duration must be 30 or 60 minutes",
      });
    }

    // --- STUDENT ---
    const student = await prisma.student.findUnique({
      where: { userId: payload.id },
    });
    if (!student) return res.status(404).json({ message: "Student not found" });

    // --- PREFERRED DATE VALIDATION ---
    // Ensure preferredDate exists
    if (!preferredDate) {
      return res.status(400).json({ message: "Missing preferredDate" });
    }

    // Split and validate parts
    const dateParts = preferredDate.split("-");
    if (dateParts.length !== 3) {
      return res.status(400).json({ message: "Invalid preferredDate format" });
    }

    // Parse numbers safely
    const year = Number(dateParts[0]);
    const month = Number(dateParts[1]);
    const day = Number(dateParts[2]);

    if (isNaN(year) || isNaN(month) || isNaN(day)) {
      return res.status(400).json({ message: "Invalid preferredDate values" });
    }

    // Now TypeScript knows these are numbers, no undefined
    const dateObj = new Date(year, month - 1, day);
    dateObj.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 7);
    maxDate.setHours(23, 59, 59, 999);

    if (dateObj < today) {
      return res.status(400).json({
        message: "Preferred date cannot be before today",
      });
    }

    if (dateObj > maxDate) {
      return res.status(400).json({
        message: "Preferred date cannot be more than 7 days from today",
      });
    }

    // --- MAX 3 BOOKINGS PER DAY ---
    const bookingCount = await prisma.booking.count({
      where: {
        studentId: student.id,
        preferredDate, // use string directly
      },
    });

    if (bookingCount >= 3) {
      return res.status(400).json({
        message: "You can only book maximum 3 lessons per day",
      });
    }

    // --- VEHICLE DAILY CAPACITY ---
    const MAX_MINUTES_PER_VEHICLE: Record<VehicleType, number> = {
      CAR: 1440, // 2 cars × 720 min/day
      BIKE: 720, // 1 bike × 720 min/day
      SCOOTER: 720, // 1 scooter × 720 min/day
    };

    const bookings = await prisma.booking.findMany({
      where: {
        preferredDate,
        vehicleType: vehicleType as VehicleType,
      },
      select: { trainingDuration: true },
    });

    const totalMinutes = bookings.reduce(
      (sum, b) => sum + (b.trainingDuration ?? 60),
      0,
    );

    if (
      totalMinutes + trainingDuration >
      MAX_MINUTES_PER_VEHICLE[vehicleType]
    ) {
      return res.status(400).json({
        message: `No available ${vehicleType} time slots for this day`,
      });
    }

    // --- CREATE BOOKING ---
    const booking = await prisma.booking.create({
      data: {
        studentId: student.id,
        preferredSlot: preferredSlot as Slot,
        preferredDate, // string, stored exactly as local date
        vehicleType: vehicleType as VehicleType,
        trainingDuration,
        experienceLevel: experienceLevel as ExperienceLevel,
        lessonsCompleted,
        failures,
        examDate: examDate ? new Date(examDate) : null, // examDate still optional DateTime
        status: Status.PENDING,
      },
    });

    res.json({
      message: "Lesson request created successfully",
      booking,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
