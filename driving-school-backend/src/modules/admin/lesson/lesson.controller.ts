import type { Request, Response } from "express";
import prisma from "../../../config/db.js";
import { parseSortParams } from "../../../utils/sortHelper.js";

export const getAllLessons = async (req: Request, res: Response) => {
  try {
    const status = req.query.status as string | undefined;
    const instructorId = req.query.instructorId as string | undefined;
    const date = req.query.date as string | undefined;

    const where: any = {};
    if (status) where.status = status;
    if (instructorId) where.instructorId = parseInt(instructorId);

    const orderBy = parseSortParams(req, "id", "desc");

    const lessons = await prisma.lesson.findMany({
      where,
      include: { student: { include: { user: { select: { name: true, email: true } } } }, instructor: true, vehicle: true },
      orderBy
    });

    if (date) {
      const filtered = lessons.filter(l => l.slot === date);
      return res.json({ lessons: filtered });
    }

    res.json({ lessons });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getLessonById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const lesson = await prisma.lesson.findUnique({
      where: { id: parseInt(id) },
      include: { student: true, instructor: true, vehicle: true }
    });

    if (!lesson) return res.status(404).json({ message: "Lesson not found" });

    res.json({ lesson });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateLesson = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { slot, status, trainingDuration, instructorId, vehicleId } = req.body;

    const lesson = await prisma.lesson.findUnique({
      where: { id: parseInt(id) }
    });

    if (!lesson) return res.status(404).json({ message: "Lesson not found" });

    const data: any = {};
    if (slot) data.slot = slot;
    if (status) data.status = status;
    if (trainingDuration) data.trainingDuration = trainingDuration;
    if (instructorId) data.instructorId = parseInt(instructorId);
    if (vehicleId) data.vehicleId = parseInt(vehicleId);

    const updated = await prisma.lesson.update({
      where: { id: parseInt(id) },
      data,
      include: { student: true, instructor: true, vehicle: true }
    });

    res.json({ message: "Lesson updated", lesson: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteLesson = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const lesson = await prisma.lesson.findUnique({
      where: { id: parseInt(id) }
    });

    if (!lesson) return res.status(404).json({ message: "Lesson not found" });

    await prisma.lesson.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: "Lesson deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const completeLesson = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { passed, notes } = req.body;

    const lesson = await prisma.lesson.findUnique({
      where: { id: parseInt(id) },
      include: { student: true }
    });

    if (!lesson) return res.status(404).json({ message: "Lesson not found" });

    if (lesson.status !== "SCHEDULED") {
      return res.status(400).json({ message: "Only scheduled lessons can be completed" });
    }

    const updatedLesson = await prisma.lesson.update({
      where: { id: parseInt(id) },
      data: {
        status: "COMPLETED",
        notes: notes || null
      },
      include: { student: true, instructor: true, vehicle: true }
    });

    const booking = await prisma.booking.findFirst({
      where: {
        studentId: lesson.studentId,
        status: "SCHEDULED"
      },
      orderBy: { createdAt: "desc" }
    });

    if (booking) {
      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          lessonsCompleted: { increment: passed ? 1 : 0 },
          failures: { increment: passed ? 0 : 1 }
        }
      });
    }

    res.json({ message: "Lesson completed", lesson: updatedLesson });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};