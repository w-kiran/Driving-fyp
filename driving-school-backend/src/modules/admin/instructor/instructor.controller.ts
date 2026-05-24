import prisma from "../../../config/db.js";
import type { Request, Response } from "express";

export const addInstructor = async (req: Request, res: Response) => {
  const { name, availableSlots } = req.body;

  const instructor = await prisma.instructor.create({
    data: { name, availableSlots }
  });

  res.json({ instructor });
};

export const getInstructors = async (req: Request, res: Response) => {
  const instructors = await prisma.instructor.findMany();
  res.json({ instructors });
};

export const deleteInstructor = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string);
  await prisma.instructor.delete({ where: { id } });
  res.json({ message: "Instructor deleted" });
};