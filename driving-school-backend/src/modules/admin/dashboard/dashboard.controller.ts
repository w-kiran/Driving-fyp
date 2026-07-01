import type { Request, Response } from "express";
import prisma from "../../../config/db.js";

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Generate date strings for last 7 days
    const dates: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      dates.push(`${year}-${month}-${day}`);
    }

    const [
      totalStudents,
      totalInstructors,
      pendingBookings,
      scheduledLessons,
      completedLessons,
      totalVehicles,
      instructorStats,
      lessonStatusCounts,
      bookingStatusCounts,
      bookingTrend,
      bookingTypeCounts
    ] = await Promise.all([
      prisma.student.count(),
      prisma.instructor.count(),
      prisma.booking.count({ where: { status: "PENDING" } }),
      prisma.lesson.count({ where: { status: "SCHEDULED" } }),
      prisma.lesson.count({ where: { status: "COMPLETED" } }),
      prisma.vehicle.count({ where: { active: true } }),
      prisma.instructor.findMany({
        select: {
          id: true,
          name: true,
          dailyLessonCount: true,
          _count: { select: { lessons: true } }
        }
      }),
      // Lesson status distribution
      prisma.lesson.groupBy({
        by: ["status"],
        _count: { id: true }
      }),
      // Booking status distribution
      prisma.booking.groupBy({
        by: ["status"],
        _count: { id: true }
      }),
      // Booking trends per day for last 7 days
      prisma.booking.groupBy({
        by: ["preferredDate", "vehicleType"],
        where: {
          preferredDate: { in: dates },
          status: { not: "CANCELLED" }
        },
        _count: { id: true }
      }),
      // Bookings by vehicle type
      prisma.booking.groupBy({
        by: ["vehicleType"],
        where: { status: { not: "CANCELLED" } },
        _count: { id: true }
      })
    ]);

    // Build booking trend per day (all vehicle types combined + per type)
    const buildEmptyDay = () => ({
      date: "",
      total: 0,
      CAR: 0 as number,
      BIKE: 0 as number,
      SCOOTER: 0 as number
    });

    const bookingTrends = dates.map(date => {
      const day: ReturnType<typeof buildEmptyDay> = { date, total: 0, CAR: 0, BIKE: 0, SCOOTER: 0 };
      bookingTrend
        .filter(b => b.preferredDate === date)
        .forEach(b => {
          const vt = b.vehicleType as "CAR" | "BIKE" | "SCOOTER";
          day[vt] = b._count.id;
          day.total += b._count.id;
        });
      return day;
    });

    const lessonDistribution = lessonStatusCounts.map(s => ({
      status: s.status,
      count: s._count.id
    }));

    const bookingDistribution = bookingStatusCounts.map(s => ({
      status: s.status,
      count: s._count.id
    }));

    const bookingByType = bookingTypeCounts.map(b => ({
      type: b.vehicleType,
      count: b._count.id
    }));

    const stats = {
      students: totalStudents,
      instructors: totalInstructors,
      vehicles: totalVehicles,
      bookings: {
        pending: pendingBookings
      },
      lessons: {
        scheduled: scheduledLessons,
        completed: completedLessons
      },
      instructorLoad: instructorStats.map(i => ({
        id: i.id,
        name: i.name,
        dailyLessonCount: i.dailyLessonCount,
        totalLessons: i._count.lessons
      })),
      charts: {
        bookingTrends,
        lessonDistribution,
        bookingDistribution,
        bookingByType
      }
    };

    res.json({ stats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};