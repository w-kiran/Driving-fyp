import prisma from "../../../config/db.js";
import type { Request, Response } from "express";

export const addInstructor = async (req: Request, res: Response) => {
  const { name, availableSlots, instructorLevel } = req.body;

  const instructor = await prisma.instructor.create({
    data: { 
      name, 
      availableSlots,
      instructorLevel: instructorLevel ?? "INTERMEDIATE"
    }
  });

  res.json({ instructor });
};

export const getInstructors = async (req: Request, res: Response) => {
  const instructors = await prisma.instructor.findMany();
  res.json({ instructors });
};

export const deleteInstructor = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);

    const instructor = await prisma.instructor.findUnique({ where: { id } });
    if (!instructor) return res.status(404).json({ message: "Instructor not found" });

    await prisma.$transaction(async (tx) => {
      await tx.lesson.deleteMany({ where: { instructorId: id } });
      await tx.instructor.delete({ where: { id } });
    });

    res.json({ message: "Instructor deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};