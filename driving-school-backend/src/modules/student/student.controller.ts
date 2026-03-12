import { PrismaClient, Slot, VehicleType, ExperienceLevel, Status } from "@prisma/client";
import type { Request, Response } from "express";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

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
    examDate
  }: BookingRequest = req.body;

  if (!preferredSlot || !vehicleType || !trainingDuration || !experienceLevel || !preferredDate) {
    return res.status(400).json({ message: "Missing required booking fields" });
  }

  const student = await prisma.student.findUnique({
    where: { userId: payload.id }
  });

  if (!student) return res.status(404).json({ message: "Student not found" });

  const booking = await prisma.booking.create({
    data: {
      studentId: student.id,
      preferredSlot: preferredSlot as Slot,
      preferredDate: new Date(preferredDate),
      vehicleType: vehicleType as VehicleType,
      trainingDuration,
      experienceLevel: experienceLevel as ExperienceLevel,
      lessonsCompleted,
      failures,
      examDate: examDate ? new Date(examDate) : null,
      status: Status.PENDING
    }
  });

  res.json({
    message: "Lesson request created successfully",
    booking
  });
};