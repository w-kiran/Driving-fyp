import prisma from "../../../config/db.js";
import type { Request, Response } from "express";

export const addInstructor = async (req: Request, res: Response) => {
  const { name, instructorLevel } = req.body;

  const instructor = await prisma.instructor.create({
    data: { 
      name, 
      instructorLevel: instructorLevel ?? "INTERMEDIATE"
    }
  });

  res.json({ message: "Instructor created successfully", instructor });
};

export const getInstructors = async (req: Request, res: Response) => {
  const instructors = await prisma.instructor.findMany();
  res.json({ instructors });
};

export const updateInstructor = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const { name, instructorLevel } = req.body;

    const existing = await prisma.instructor.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: "Instructor not found" });

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (instructorLevel !== undefined) updateData.instructorLevel = instructorLevel;

    const instructor = await prisma.instructor.update({
      where: { id },
      data: updateData,
    });

    res.json({ instructor });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const toggleInstructorAvailable = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);

    const existing = await prisma.instructor.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: "Instructor not found" });

    const updated = await prisma.instructor.update({
      where: { id },
      data: { available: !existing.available }
    });

    res.json({ message: "Instructor availability toggled successfully", instructor: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
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

    res.json({ message: "Instructor deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};