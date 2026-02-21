// modules/schedule/schedule.controller.ts
import { PrismaClient } from "@prisma/client";
import { priorityScheduling } from "../../algorithms/scheduler.js";
import { allocate } from "../../algorithms/allocator.js";

import type { Request, Response } from "express";

const prisma = new PrismaClient();

export const generateSchedule = async (req: Request, res: Response) => {
  const students = await prisma.student.findMany({
    where: { status: "PENDING" }
  });

  const instructors = await prisma.instructor.findMany();
  const vehicles = await prisma.vehicle.findMany();

  const ordered = priorityScheduling(students);

  for (const student of ordered) {
    const allocation = allocate(student, instructors, vehicles);
    if (!allocation) continue;

    await prisma.lesson.create({
      data: {
        slot: allocation.slot,
        status: "SCHEDULED",
        studentId: student.id,
        instructorId: allocation.instructor.id,
        vehicleId: allocation.vehicle.id
      }
    });

    await prisma.student.update({
      where: { id: student.id },
      data: { status: "SCHEDULED" }
    });
  }

  res.json({ message: "Schedule generated" });
};