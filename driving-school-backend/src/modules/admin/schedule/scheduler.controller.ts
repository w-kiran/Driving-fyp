import type { Request, Response } from "express";
import prisma from "../../../config/db.js";
import { priorityScheduling } from "../../../algorithms/scheduler.js";
import type { BookingData } from "../../../algorithms/scheduler.js";
import { allocate } from "../../../algorithms/allocator.js";
import { getSlotTimeRange } from "../../../utils/slotTimes.js";

const ALL_SLOTS = ["MORNING", "AFTERNOON", "EVENING"];

/**
 * Generate candidate dates: tomorrow through tomorrow+6 (7 days window).
 */
const getScheduleDates = (): string[] => {
  const dates: string[] = [];
  for (let i = 1; i <= 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    dates.push(d.toISOString().split("T")[0] ?? d.toISOString().substring(0, 10));
  }
  return dates;
};

export const generateSchedule = async (req: Request, res: Response) => {
  try {
    const scheduleDates = getScheduleDates();

    const bookings = await prisma.booking.findMany({
      where: { status: "PENDING" },
      include: { student: true }
    });

    if (bookings.length === 0) {
      return res.json({ message: "No pending bookings", scheduled: 0, failed: 0, results: [] });
    }

    const instructors = await prisma.instructor.findMany();

    const instructorsForAllocation = instructors.map(i => ({
      ...i,
      availableSlots: i.availableSlots as string[]
    }));

    const vehicles = await prisma.vehicle.findMany({
      where: { active: true }
    });

    const vehiclesForAllocation = vehicles.map(v => ({
      ...v,
      availableSlots: v.availableSlots as string[]
    }));

    // Get existing lessons across the scheduling window
    const existingLessons = await prisma.lesson.findMany({
      where: { scheduledDate: { in: scheduleDates } }
    });

    const lessonsForAllocation = existingLessons.map(l => ({
      date: l.scheduledDate,
      slot: l.slot,
      instructorId: l.instructorId,
      vehicleId: l.vehicleId
    }));

    // Build booking data with preferred slot + date from the booking itself
    const bookingsData: BookingData[] = bookings.map(b => ({
      id: b.id,
      preferredSlot: b.preferredSlot as string,
      preferredDate: b.preferredDate,
      examDate: b.examDate ?? null,
      status: b.status as "PENDING" | "SCHEDULED" | "COMPLETED",
      failures: b.failures ?? 0,
      lessonsCompleted: b.lessonsCompleted ?? 0,
      trainingDuration: b.trainingDuration ?? 60,
      studentId: b.studentId
    }));

    // Priority sort: exam date first, then failures
    const orderedBookings = priorityScheduling(bookingsData);

    let scheduled = 0;
    let failed = 0;
    const results: Array<{
      bookingId: number;
      studentId: number;
      preferredDate: string;
      preferredSlot: string;
      assignedDate: string;
      assignedSlot: string;
      timeRange: string;
      shifted: boolean;
      instructorName: string;
      vehicleType: string;
    }> = [];

    for (const booking of orderedBookings) {
      const allocation = allocate(
        booking,
        scheduleDates,
        instructorsForAllocation,
        vehiclesForAllocation,
        lessonsForAllocation
      );

      if (!allocation) {
        failed++;
        continue;
      }

      const lesson = await prisma.lesson.create({
        data: {
          slot: allocation.slot as "MORNING" | "AFTERNOON" | "EVENING",
          scheduledDate: allocation.date,
          trainingDuration: booking.trainingDuration,
          status: "SCHEDULED",
          studentId: booking.studentId,
          instructorId: allocation.instructor.id,
          vehicleId: allocation.vehicle.id
        }
      });

      lessonsForAllocation.push({
        date: allocation.date,
        slot: lesson.slot,
        instructorId: lesson.instructorId,
        vehicleId: lesson.vehicleId
      });

      await prisma.booking.update({
        where: { id: booking.id },
        data: { status: "SCHEDULED" }
      });

      await prisma.instructor.update({
        where: { id: allocation.instructor.id },
        data: { dailyLessonCount: { increment: 1 } }
      });

      const timeRange = getSlotTimeRange(allocation.slot);

      // Notify the student
      const student = await prisma.student.findUnique({
        where: { id: booking.studentId },
        include: { user: true }
      });

      if (student) {
        const shiftedMsg = allocation.shifted
          ? ` (Note: Your preferred ${booking.preferredSlot} on ${booking.preferredDate} was unavailable, so you've been moved to ${allocation.slot} on ${allocation.date}.)`
          : "";

        await prisma.notification.create({
          data: {
            userId: student.userId,
            type: "SCHEDULE",
            title: "Lesson Scheduled!",
            message: `Your ${allocation.vehicle.type} lesson is on ${allocation.date} at ${timeRange} with instructor ${allocation.instructor.name}. Duration: ${booking.trainingDuration} minutes.${shiftedMsg}`
          }
        });
      }

      results.push({
        bookingId: booking.id,
        studentId: booking.studentId,
        preferredDate: booking.preferredDate,
        preferredSlot: booking.preferredSlot as string,
        assignedDate: allocation.date,
        assignedSlot: allocation.slot,
        timeRange,
        shifted: allocation.shifted,
        instructorName: allocation.instructor.name,
        vehicleType: allocation.vehicle.type
      });

      scheduled++;
    }

    res.json({
      message: `Schedule generated for ${scheduleDates[0]} to ${scheduleDates[scheduleDates.length - 1]}`,
      scheduled,
      failed,
      results
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Scheduling failed" });
  }
};
