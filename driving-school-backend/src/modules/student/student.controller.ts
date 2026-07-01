import type { Response } from "express";
import type { AuthRequest } from "../../middleware/auth.middleware.js";
import prisma from "../../config/db.js";
import { parseSortParams } from "../../utils/sortHelper.js";

const MAX_BOOKINGS_PER_DAY = 132;

interface BookingRequest {
  preferredSlot: "SLOT_1" | "SLOT_2" | "SLOT_3" | "SLOT_4" | "SLOT_5" | "SLOT_6" | "SLOT_7" | "SLOT_8" | "SLOT_9" | "SLOT_10" | "SLOT_11" | "SLOT_12";
  preferredDate: string;
  vehicleType: "CAR" | "BIKE" | "SCOOTER";
  trainingDuration: number;
  experienceLevel: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  lessonsCompleted?: number;
  failures?: number;
  examDate?: string;
}

export const requestNewLesson = async (req: AuthRequest, res: Response) => {
  try {
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
      where: { userId: req.user!.id },
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

    // Check per-student daily limit (max 3 bookings per day per student)
    const studentBookingCount = await prisma.booking.count({
      where: {
        studentId: student.id,
        preferredDate,
        status: { not: "CANCELLED" },
      },
    });

    if (studentBookingCount >= 3) {
      return res.status(400).json({ message: "You can only book a maximum of 3 lessons per day" });
    }

    // Check global daily limit (max 132 bookings across all students per day)
    const globalBookingCount = await prisma.booking.count({
      where: {
        preferredDate,
        status: { not: "CANCELLED" },
      },
    });

    if (globalBookingCount >= MAX_BOOKINGS_PER_DAY) {
      return res.status(400).json({ message: `This date is fully booked (${MAX_BOOKINGS_PER_DAY} max). Please select another date.` });
    }

    const booking = await prisma.booking.create({
      data: {
        studentId: student.id,
        preferredSlot: preferredSlot as "SLOT_1" | "SLOT_2" | "SLOT_3" | "SLOT_4" | "SLOT_5" | "SLOT_6" | "SLOT_7" | "SLOT_8" | "SLOT_9" | "SLOT_10" | "SLOT_11" | "SLOT_12",
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

export const getMyBookings = async (req: AuthRequest, res: Response) => {
  try {
    const student = await prisma.student.findUnique({
      where: { userId: req.user!.id },
    });
    if (!student) return res.status(404).json({ message: "Student not found" });

    const vehicleType = req.query.vehicleType as string | undefined;
    const orderBy = parseSortParams(req, "createdAt", "desc");

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

export const cancelBooking = async (req: AuthRequest, res: Response) => {
  try {
    const student = await prisma.student.findUnique({
      where: { userId: req.user!.id },
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

export const editBooking = async (req: AuthRequest, res: Response) => {
  try {
    const student = await prisma.student.findUnique({
      where: { userId: req.user!.id },
    });
    if (!student) return res.status(404).json({ message: "Student not found" });

    const id = req.params.id as string;
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(id) },
    });

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.studentId !== student.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (booking.status !== "PENDING") {
      return res.status(400).json({ message: "Only PENDING bookings can be edited" });
    }

    const {
      preferredSlot,
      preferredDate,
      vehicleType,
      trainingDuration,
      experienceLevel,
      examDate,
    } = req.body;

    if (preferredDate) {
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
    }

    // Check global daily limit if date is being changed
    if (preferredDate && preferredDate !== booking.preferredDate) {
      const globalBookingCount = await prisma.booking.count({
        where: {
          preferredDate,
          status: { not: "CANCELLED" },
        },
      });

      if (globalBookingCount >= MAX_BOOKINGS_PER_DAY) {
        return res.status(400).json({ message: `This date is fully booked (${MAX_BOOKINGS_PER_DAY} max). Please select another date.` });
      }
    }

    if (trainingDuration) {
      const duration = Number(trainingDuration);
      if (![30, 60].includes(duration)) {
        return res.status(400).json({ message: "Training duration must be 30 or 60 minutes" });
      }
    }

    const updateData: any = {};
    if (preferredSlot) updateData.preferredSlot = preferredSlot;
    if (preferredDate) updateData.preferredDate = preferredDate;
    if (vehicleType) updateData.vehicleType = vehicleType;
    if (trainingDuration) updateData.trainingDuration = Number(trainingDuration);
    if (experienceLevel) updateData.experienceLevel = experienceLevel;
    if (examDate !== undefined) {
      updateData.examDate = examDate ? new Date(examDate) : null;
    }

    const updated = await prisma.booking.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    res.json({ message: "Booking updated successfully", booking: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getDailyBookingCounts = async (_req: AuthRequest, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Generate date strings for the next 7 days (today + 7)
    const dates: string[] = [];
    for (let i = 0; i <= 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      dates.push(`${year}-${month}-${day}`);
    }

    // Count non-cancelled bookings per date in the range
    const counts = await prisma.booking.groupBy({
      by: ["preferredDate"],
      where: {
        preferredDate: { in: dates },
        status: { not: "CANCELLED" },
      },
      _count: { id: true },
    });

    const result: Record<string, { count: number; isFull: boolean }> = {};
    dates.forEach((date) => {
      const found = counts.find((c) => c.preferredDate === date);
      const count = found?._count.id || 0;
      result[date] = { count, isFull: count >= MAX_BOOKINGS_PER_DAY };
    });

    res.json({ dailyCounts: result, maxBookingsPerDay: MAX_BOOKINGS_PER_DAY });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteBooking = async (req: AuthRequest, res: Response) => {
  try {
    const student = await prisma.student.findUnique({
      where: { userId: req.user!.id },
    });
    if (!student) return res.status(404).json({ message: "Student not found" });

    const id = req.params.id as string;
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(id) },
    });

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.studentId !== student.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (booking.status !== "PENDING") {
      return res.status(400).json({ message: "Only PENDING bookings can be deleted" });
    }

    await prisma.booking.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: "Booking deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMyLessons = async (req: AuthRequest, res: Response) => {
  try {
    const student = await prisma.student.findUnique({
      where: { userId: req.user!.id },
    });
    if (!student) return res.status(404).json({ message: "Student not found" });

    const orderBy = parseSortParams(req, "createdAt", "desc");

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