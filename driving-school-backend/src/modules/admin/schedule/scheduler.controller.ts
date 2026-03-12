import type { Request, Response } from "express";
import prisma from "../../../config/db.js";
import { priorityScheduling } from "../../../algorithms/scheduler.js";
import { allocate } from "../../../algorithms/allocator.js";
import type { Lesson, Instructor, Vehicle, Student } from "@prisma/client";

export const generateSchedule = async (req: Request, res: Response) => {
  try {
    const students: Student[] = await prisma.student.findMany({
      where: { status: "PENDING" }
    });

    const instructors: Instructor[] = await prisma.instructor.findMany();

    const vehicles: Vehicle[] = await prisma.vehicle.findMany({
      where: { active: true }
    });

    const existingLessons: Lesson[] = await prisma.lesson.findMany({
      where: { status: "SCHEDULED" }
    });

    const orderedStudents = priorityScheduling(students);

    for (const student of orderedStudents) {
      const allocation = allocate(
        student,
        instructors,
        vehicles,
        existingLessons
      );

      if (!allocation) continue;

      const lesson = await prisma.lesson.create({
        data: {
          slot: allocation.slot,
          status: "SCHEDULED",
          studentId: student.id,
          instructorId: allocation.instructor.id,
          vehicleId: allocation.vehicle.id
        }
      });

      existingLessons.push(lesson);

      await prisma.student.update({
        where: { id: student.id },
        data: { status: "SCHEDULED" }
      });

      await prisma.instructor.update({
        where: { id: allocation.instructor.id },
        data: {
          dailyLessonCount: { increment: 1 }
        }
      });
    }

    res.json({ message: "Schedule generated successfully" });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Scheduling failed" });
  }
};