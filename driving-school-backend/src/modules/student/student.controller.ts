import { PrismaClient } from "@prisma/client";
import type{ Request, Response } from "express";

const prisma = new PrismaClient();

export const requestNewLesson = async (req: Request, res: Response) => {
  const studentId = Number(req.params.id);
  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student) return res.status(404).json({ message: "Student not found" });

  if (student.status === "SCHEDULED") return res.status(400).json({ message: "Cannot request new lesson while current lesson in progress" });

  await prisma.student.update({
    where: { id: studentId },
    data: { status: "PENDING" }
  });

  res.json({ message: "Student is now queued for new lesson" });
};