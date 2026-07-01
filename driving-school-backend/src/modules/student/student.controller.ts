import type { Response } from "express";
import type { AuthRequest } from "../../middleware/auth.middleware.js";
import prisma from "../../config/db.js";
import { parseSortParams } from "../../utils/sortHelper.js";

type VehicleTypeKey = "CAR" | "BIKE" | "SCOOTER";

const SLOTS_PER_DAY = 12;

/**
 * Dynamically calculate max bookings per day PER VEHICLE TYPE,
 * based on active instructors and active vehicles of each type.
 * Per-type capacity = min(available instructors, active vehicles of that type) × slots
 */
const getMaxBookingsPerDay = async (): Promise<{
  perType: Record<VehicleTypeKey, number>;
  total: number;
}> => {
  const [activeInstructors, carCount, bikeCount, scooterCount] = await Promise.all([
    prisma.instructor.count({ where: { available: true } }),
    prisma.vehicle.count({ where: { active: true, type: "CAR" } }),
    prisma.vehicle.count({ where: { active: true, type: "BIKE" } }),
    prisma.vehicle.count({ where: { active: true, type: "SCOOTER" } }),
  ]);

  const car = Math.min(activeInstructors, carCount) * SLOTS_PER_DAY;
  const bike = Math.min(activeInstructors, bikeCount) * SLOTS_PER_DAY;
  const scooter = Math.min(activeInstructors, scooterCount) * SLOTS_PER_DAY;

  return {
    perType: { CAR: car, BIKE: bike, SCOOTER: scooter },
    total: activeInstructors * SLOTS_PER_DAY,
  };
};

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

    // Check per-vehicle-type daily limit
    const typeBookingCount = await prisma.booking.count({
      where: {
        preferredDate,
        vehicleType: vehicleType as VehicleTypeKey,
        status: { not: "CANCELLED" },
      },
    });

    const maxPerType = await getMaxBookingsPerDay();
    const typeMax = maxPerType.perType[vehicleType as VehicleTypeKey];
    if (typeBookingCount >= typeMax) {
      return res.status(400).json({ message: `${vehicleType} slots are fully booked for this date (${typeMax} max). Please select another date or vehicle type.` });
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

    // Check per-vehicle-type daily limit if date or vehicle type is being changed
    if (preferredDate && preferredDate !== booking.preferredDate) {
      const effectiveType = (vehicleType || booking.vehicleType) as VehicleTypeKey;
      const typeBookingCount = await prisma.booking.count({
        where: {
          preferredDate,
          vehicleType: effectiveType,
          status: { not: "CANCELLED" },
        },
      });

      const maxPerType = await getMaxBookingsPerDay();
      const typeMax = maxPerType.perType[effectiveType];
      if (typeBookingCount >= typeMax) {
        return res.status(400).json({ message: `${effectiveType} slots are fully booked for this date (${typeMax} max). Please select another date or vehicle type.` });
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

    // Count non-cancelled bookings per date AND per vehicle type in the range
    const counts = await prisma.booking.groupBy({
      by: ["preferredDate", "vehicleType"],
      where: {
        preferredDate: { in: dates },
        status: { not: "CANCELLED" },
      },
      _count: { id: true },
    });

    const { perType: maxPerType } = await getMaxBookingsPerDay();
    const vehicleTypes: VehicleTypeKey[] = ["CAR", "BIKE", "SCOOTER"];

    const result: Record<
      string,
      {
        CAR: { count: number; isFull: boolean; max: number };
        BIKE: { count: number; isFull: boolean; max: number };
        SCOOTER: { count: number; isFull: boolean; max: number };
      }
    > = {};

    dates.forEach((date) => {
      const perType: Record<string, { count: number; isFull: boolean; max: number }> = {};
      for (const vt of vehicleTypes) {
        const found = counts.find((c) => c.preferredDate === date && c.vehicleType === vt);
        const count = found?._count.id || 0;
        const max = maxPerType[vt];
        perType[vt] = { count, isFull: count >= max, max };
      }
      result[date] = perType as any;
    });

    res.json({ dailyCounts: result, maxPerType });
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

export const getMyProgress = async (req: AuthRequest, res: Response) => {
  try {
    const student = await prisma.student.findUnique({
      where: { userId: req.user!.id },
    });
    if (!student) return res.status(404).json({ message: "Student not found" });

    const [lessons, bookings] = await Promise.all([
      prisma.lesson.findMany({
        where: { studentId: student.id },
        include: { instructor: true },
        orderBy: { createdAt: "desc" }
      }),
      prisma.booking.findMany({
        where: { studentId: student.id },
        orderBy: { createdAt: "desc" }
      })
    ]);

    // Stats
    const totalLessons = lessons.length;
    const completedLessons = lessons.filter(l => l.status === "COMPLETED");
    const scheduledLessons = lessons.filter(l => l.status === "SCHEDULED");
    const cancelledLessons = lessons.filter(l => l.status === "CANCELLED");

    // Total training minutes
    const totalMinutes = completedLessons.reduce((sum, l) => sum + (l.trainingDuration || 0), 0);

    // Instructors taught by
    const instructorMap: Record<number, { name: string; count: number }> = {};
    for (const lesson of lessons) {
      if (lesson.instructor) {
        const existing = instructorMap[lesson.instructorId];
        if (existing) {
          existing.count++;
        } else {
          instructorMap[lesson.instructorId] = { name: lesson.instructor.name, count: 1 };
        }
      }
    }

    // Lesson status distribution (for chart)
    const statusDistribution = [
      { status: "SCHEDULED", count: scheduledLessons.length },
      { status: "COMPLETED", count: completedLessons.length },
      { status: "CANCELLED", count: cancelledLessons.length },
    ].filter(d => d.count > 0);

    // Recent lessons (last 10)
    const recentLessons = lessons.slice(0, 10).map(l => ({
      id: l.id,
      date: l.scheduledDate || l.createdAt.toISOString().split("T")[0],
      slot: l.slot,
      duration: l.trainingDuration,
      status: l.status,
      instructorName: l.instructor?.name || "Unknown",
      notes: l.notes
    }));

    // Preferred vehicle types from bookings
    const vehicleTypeCounts: Record<string, number> = {};
    for (const b of bookings) {
      vehicleTypeCounts[b.vehicleType] = (vehicleTypeCounts[b.vehicleType] || 0) + 1;
    }

    const progress = {
      summary: {
        totalLessons,
        completedLessons: completedLessons.length,
        scheduledLessons: scheduledLessons.length,
        cancelledLessons: cancelledLessons.length,
        totalTrainingHours: Math.round((totalMinutes / 60) * 10) / 10,
        totalTrainingMinutes: totalMinutes,
        completionRate: totalLessons > 0 ? Math.round((completedLessons.length / totalLessons) * 100) : 0,
      },
      statusDistribution,
      recentLessons,
      instructors: Object.values(instructorMap).sort((a, b) => b.count - a.count),
      vehicleTypeCounts: Object.entries(vehicleTypeCounts).map(([type, count]) => ({ type, count })),
    };

    res.json({ progress });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};