import type { Request, Response } from "express";
import prisma from "../../../config/db.js";
import { priorityScheduling } from "../../../algorithms/scheduler.js";
import type { BookingData } from "../../../algorithms/scheduler.js";
import { allocate } from "../../../algorithms/allocator.js";
import { ConflictChecker } from "../../../algorithms/conflictChecker.js";
import { getSlotTimeRange } from "../../../utils/slotTimes.js";

/**
 * Get tomorrow's date as YYYY-MM-DD string.
 */
const getTomorrow = (): string => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0] ?? d.toISOString().substring(0, 10);
};

export const generateSchedule = async (req: Request, res: Response) => {
  try {
    const scheduleDate = getTomorrow();

    // 1. Fetch all data needed in parallel
    const [
      bookings,
      instructors,
      vehicles,
      allExistingLessons,
      allStudents
    ] = await Promise.all([
      prisma.booking.findMany({
        where: { status: "PENDING" },
        include: { student: true }
      }),
      prisma.instructor.findMany(),
      prisma.vehicle.findMany({ where: { active: true } }),
      prisma.lesson.findMany({
        where: { status: "SCHEDULED" }
      }),
      prisma.student.findMany({
        include: { user: { select: { id: true } } }
      })
    ]);

    if (bookings.length === 0) {
      return res.json({ message: "No pending bookings to schedule", scheduled: 0, failed: 0, results: [] });
    }

    // Collect ALL unique dates from pending bookings and sort them (soonest first)
    const uniqueDates = [...new Set(bookings.map(b => b.preferredDate))].sort();

    console.log(`Scheduling ${bookings.length} bookings across ${uniqueDates.length} dates: [${uniqueDates.join(", ")}]`);

    // 2. Pre-process data for in-memory algorithm
    const instructorsForAllocation = instructors.map(i => ({
      id: i.id,
      name: i.name,
      instructorLevel: i.instructorLevel as string,
      available: i.available,
      dailyLessonCount: i.dailyLessonCount
    }));

    const vehiclesForAllocation = vehicles.map(v => ({
      ...v
    }));

    const studentMap = new Map(allStudents.map(s => [s.id, s]));

    // Build O(1) conflict checker from ALL existing scheduled lessons
    const conflictChecker = new ConflictChecker(
      allExistingLessons.map(l => ({
        date: l.scheduledDate,
        slot: l.slot,
        instructorId: l.instructorId,
        vehicleId: l.vehicleId
      }))
    );

    // 3. Build booking data and sort by priority globally
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

    // Sort all bookings by priority: closer preferredDate first, then preferredSlot priority
    const sortedBookings = priorityScheduling(bookingsData);

    console.log(`Scheduling ${sortedBookings.length} bookings sorted by priority across ${uniqueDates.length} dates`);

    // 4. In-memory scheduling: collect all operations, no DB calls inside the loop
    let scheduled = 0;
    let failed = 0;
    const priorityRankByType = new Map<string, number>();
    const results: Array<{
      priorityRank: number;
      bookingId: number;
      studentId: number;
      examDate: string | null;
      failures: number;
      lessonsCompleted: number;
      preferredDate: string;
      preferredSlot: string;
      assignedDate: string;
      assignedSlot: string;
      timeRange: string;
      shifted: boolean;
      instructorName: string;
      vehicleType: string;
    }> = [];

    // Batched write collections
    const lessonsToCreate: Array<{
      slot: string;
      scheduledDate: string;
      trainingDuration: number;
      status: string;
      studentId: number;
      instructorId: number;
      vehicleId: number;
      priorityRank: number;
    }> = [];

    const bookingIdsToUpdate: number[] = [];
    const instructorIncrements = new Map<number, number>();
    const notificationsToCreate: Array<{
      userId: number;
      type: string;
      title: string;
      message: string;
    }> = [];

    for (const booking of sortedBookings) {
      const allocation = allocate(
        booking,
        uniqueDates,
        instructorsForAllocation,
        vehiclesForAllocation,
        conflictChecker
      );

      if (!allocation) {
        failed++;
        continue;
      }

      // Track in-memory lesson for conflict checking of subsequent bookings
      conflictChecker.add({
        date: allocation.date,
        slot: allocation.slot,
        instructorId: allocation.instructor.id,
        vehicleId: allocation.vehicle.id
      });

      // Update instructor load in-memory for fairness
      const inst = instructorsForAllocation.find(i => i.id === allocation.instructor.id);
      if (inst) inst.dailyLessonCount += 1;

      // Collect lesson creation with priority rank (per vehicle type)
      const vType = allocation.vehicle.type;
      const typeRank = (priorityRankByType.get(vType) || 0) + 1;
      priorityRankByType.set(vType, typeRank);

      lessonsToCreate.push({
        slot: allocation.slot,
        scheduledDate: allocation.date,
        trainingDuration: booking.trainingDuration,
        status: "SCHEDULED",
        studentId: booking.studentId,
        instructorId: allocation.instructor.id,
        vehicleId: allocation.vehicle.id,
        priorityRank: typeRank
      });

      // Collect booking status update
      bookingIdsToUpdate.push(booking.id);

      // Collect instructor daily lesson count increment
      instructorIncrements.set(
        allocation.instructor.id,
        (instructorIncrements.get(allocation.instructor.id) ?? 0) + 1
      );

      // Collect notification
      const student = studentMap.get(booking.studentId);
      if (student) {
        const timeRange = getSlotTimeRange(allocation.slot);
        const shiftedMsg = allocation.shifted
          ? ` (Note: Your preferred ${booking.preferredSlot} on ${booking.preferredDate} was unavailable, so you've been moved to ${allocation.slot} on ${allocation.date}.)`
          : "";

        notificationsToCreate.push({
          userId: student.userId,
          type: "SCHEDULE",
          title: "Lesson Scheduled!",
          message: `Your ${allocation.vehicle.type} lesson (${allocation.vehicle.name}, ${allocation.vehicle.vehicleNumber}) is on ${allocation.date} at ${timeRange} with instructor ${allocation.instructor.name}. Duration: ${booking.trainingDuration} minutes.${shiftedMsg}`
        });
      }

      results.push({
        priorityRank: typeRank,
        bookingId: booking.id,
        studentId: booking.studentId,
        examDate: booking.examDate?.toISOString() ?? null,
        failures: booking.failures,
        lessonsCompleted: booking.lessonsCompleted,
        preferredDate: booking.preferredDate,
        preferredSlot: booking.preferredSlot as string,
        assignedDate: allocation.date,
        assignedSlot: allocation.slot,
        timeRange: getSlotTimeRange(allocation.slot),
        shifted: allocation.shifted,
        instructorName: allocation.instructor.name,
        vehicleType: allocation.vehicle.type
      });

      scheduled++;
    }

    // 5. Batch-write everything in a single transaction
    // Increase timeout to 60s to handle large batch operations on Neon Postgres
    await prisma.$transaction(async (tx) => {
      await Promise.all([
        // Create lessons
        lessonsToCreate.length > 0
          ? tx.lesson.createMany({ data: lessonsToCreate as any })
          : Promise.resolve(),

        // Update booking statuses
        bookingIdsToUpdate.length > 0
          ? tx.booking.updateMany({
              where: { id: { in: bookingIdsToUpdate } },
              data: { status: "SCHEDULED" }
            })
          : Promise.resolve(),

        // Create notifications
        notificationsToCreate.length > 0
          ? tx.notification.createMany({ data: notificationsToCreate as any })
          : Promise.resolve(),

        // Update instructor counts in parallel
        ...(instructorIncrements.size > 0
          ? [...instructorIncrements].map(([id, count]) =>
              tx.instructor.update({
                where: { id },
                data: { dailyLessonCount: { increment: count } }
              })
            )
          : []),
      ]);
    }, { timeout: 60000 });

    const scheduledDatesStr = uniqueDates.length <= 3
      ? uniqueDates.join(", ")
      : `${uniqueDates[0]} ... ${uniqueDates[uniqueDates.length - 1]} (${uniqueDates.length} dates)`;

    res.json({
      message: `Schedule generated: ${scheduled} lessons scheduled, ${failed} failed across ${scheduledDatesStr}`,
      scheduleDate,
      scheduled,
      failed,
      results
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Schedule generation failed" });
  }
};

export const cancelSchedule = async (req: Request, res: Response) => {
  try {
    const scheduleDate = getTomorrow();

    // Find all SCHEDULED lessons for tomorrow
    const lessons = await prisma.lesson.findMany({
      where: {
        scheduledDate: scheduleDate,
        status: "SCHEDULED"
      }
    });

    if (lessons.length === 0) {
      return res.status(400).json({ message: `No schedule found for ${scheduleDate} to cancel` });
    }

    // Group lessons by instructor to know how much to decrement
    const instructorLessonCounts = new Map<number, number>();
    for (const lesson of lessons) {
      instructorLessonCounts.set(
        lesson.instructorId,
        (instructorLessonCounts.get(lesson.instructorId) || 0) + 1
      );
    }

    // Unique student IDs whose bookings need reverting
    const studentIds = [...new Set(lessons.map(l => l.studentId))];

    await prisma.$transaction(async (tx) => {
      // Delete lessons for tomorrow
      await tx.lesson.deleteMany({
        where: {
          scheduledDate: scheduleDate,
          status: "SCHEDULED"
        }
      });

      // Set SCHEDULED bookings back to PENDING
      await tx.booking.updateMany({
        where: {
          preferredDate: scheduleDate,
          studentId: { in: studentIds },
          status: "SCHEDULED"
        },
        data: { status: "PENDING" }
      });

      // Decrement instructor daily lesson counts
      for (const [instructorId, count] of instructorLessonCounts) {
        await tx.instructor.update({
          where: { id: instructorId },
          data: { dailyLessonCount: { decrement: count } }
        });
      }
    }, { timeout: 60000 });

    res.json({
      message: `Schedule for ${scheduleDate} cancelled. ${lessons.length} lessons removed, bookings reverted to pending.`,
      cancelledCount: lessons.length
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Schedule cancellation failed" });
  }
};
