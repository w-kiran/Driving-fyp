import type { Request, Response } from "express";
import prisma from "../../../config/db.js";
import { priorityScheduling } from "../../../algorithms/scheduler.js";
import type { BookingData } from "../../../algorithms/scheduler.js";
import { allocate } from "../../../algorithms/allocator.js";
import { ConflictChecker } from "../../../algorithms/conflictChecker.js";
import { getSlotTimeRange } from "../../../utils/slotTimes.js";

const ALL_SLOTS = ["MORNING", "AFTERNOON", "EVENING"];

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
    const scheduleDates = [scheduleDate];

    // 1. Fetch all data needed in parallel
    const [
      bookings,
      instructors,
      vehicles,
      existingLessons,
      allStudents
    ] = await Promise.all([
      prisma.booking.findMany({
        where: { status: "PENDING" },
        include: { student: true }
      }),
      prisma.instructor.findMany(),
      prisma.vehicle.findMany({ where: { active: true } }),
      prisma.lesson.findMany({
        where: { scheduledDate: scheduleDate }
      }),
      prisma.student.findMany({
        include: { user: { select: { id: true } } }
      })
    ]);

    // Filter to only bookings with preferredDate = tomorrow
    const tomorrowBookings = bookings.filter(b => b.preferredDate === scheduleDate);

    if (tomorrowBookings.length === 0) {
      return res.json({ message: `No pending bookings for ${scheduleDate}`, scheduled: 0, failed: 0, results: [] });
    }

    console.log(`Scheduling for ${scheduleDate}: ${tomorrowBookings.length} eligible bookings (${bookings.length - tomorrowBookings.length} excluded for other dates)`);

    // 2. Pre-process data for in-memory algorithm

    // 2. Pre-process data for in-memory algorithm
    const instructorsForAllocation = instructors.map(i => ({
      ...i,
      instructorLevel: i.instructorLevel as string,
      availableSlots: i.availableSlots as string[]
    }));

    const vehiclesForAllocation = vehicles.map(v => ({
      ...v
    }));

    const studentMap = new Map(allStudents.map(s => [s.id, s]));

    // Build O(1) conflict checker from existing lessons
    const conflictChecker = new ConflictChecker(
      existingLessons.map(l => ({
        date: l.scheduledDate,
        slot: l.slot,
        instructorId: l.instructorId,
        vehicleId: l.vehicleId
      }))
    );

    // 3. Group bookings by vehicleType and priority-sort per group
    const bookingsData: BookingData[] = tomorrowBookings.map(b => ({
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

    // Group by vehicleType and sort each group by priority
    const vehicleTypeGroups = new Map<string, BookingData[]>();
    for (const booking of bookingsData) {
      const b = tomorrowBookings.find(tb => tb.id === booking.id);
      const vType = b?.vehicleType ?? "CAR";
      if (!vehicleTypeGroups.has(vType)) {
        vehicleTypeGroups.set(vType, []);
      }
      vehicleTypeGroups.get(vType)!.push(booking);
    }

    // Sort each vehicle type group by priority independently
    const orderedBookingsByType = new Map<string, BookingData[]>();
    for (const [vType, group] of vehicleTypeGroups) {
      orderedBookingsByType.set(vType, priorityScheduling(group));
    }

    // Flatten back to single ordered list (interleave by vehicle type for balanced processing)
    // First all MORNING slots across types, then AFTERNOON, then EVENING
    const orderedBookings: BookingData[] = [];
    const added = new Set<BookingData>();
    for (const slot of ["MORNING", "AFTERNOON", "EVENING"]) {
      for (const [, group] of orderedBookingsByType) {
        for (const booking of group) {
          if (booking.preferredSlot === slot && !added.has(booking)) {
            added.add(booking);
            orderedBookings.push(booking);
          }
        }
      }
    }

    // Log priority order for verification
    console.log('--- Priority Order (before scheduling, by vehicle type) ---');
    for (const [vType, group] of orderedBookingsByType) {
      console.log(`  [${vType}] priority order:`);
      group.forEach((b, i) => {
        console.log(
          `    #${i + 1}: Booking #${b.id} | slot: ${b.preferredSlot} | ` +
          `examDate: ${b.examDate?.toISOString().split('T')[0] ?? 'NONE'}`
        );
      });
    }
    console.log('------------------------------------------');

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

    for (const booking of orderedBookings) {
      const allocation = allocate(
        booking,
        scheduleDates,
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
          message: `Your ${allocation.vehicle.type} lesson is on ${allocation.date} at ${timeRange} with instructor ${allocation.instructor.name}. Duration: ${booking.trainingDuration} minutes.${shiftedMsg}`
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

    res.json({
      message: `Schedule generated for ${scheduleDate}: ${scheduled} lessons scheduled, ${failed} failed`,
      scheduleDate,
      scheduled,
      failed,
      results
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Scheduling failed" });
  }
};
