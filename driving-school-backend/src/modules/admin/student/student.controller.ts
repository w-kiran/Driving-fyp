import type { Request, Response } from "express";
import prisma from "../../../config/db.js";
import bcrypt from "bcrypt";
import { parseSortParams } from "../../../utils/sortHelper.js";

export const getAllStudents = async (req: Request, res: Response) => {
  try {
    const orderBy = parseSortParams(req, "id", "desc");

    const students = await prisma.student.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        bookings: true,
        _count: { select: { lessons: true } }
      },
      orderBy
    });

    res.json({ students });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getStudentById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        bookings: true,
        lessons: { include: { instructor: true, vehicle: true } }
      }
    });

    if (!student) return res.status(404).json({ message: "Student not found" });

    res.json({ student });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const createStudent = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, address, dob } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        role: "STUDENT",
        student: {
          create: {
            phone,
            address,
            dob: new Date(dob)
          }
        }
      },
      include: { student: true }
    });

    res.json({ message: "Student created successfully", student: user.student });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateStudent = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const { name, phone, address, dob } = req.body;

    const student = await prisma.student.findUnique({ where: { id } });
    if (!student) return res.status(404).json({ message: "Student not found" });

    const updateData: any = {};
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;
    if (dob) updateData.dob = new Date(dob);

    const [updatedStudent] = await Promise.all([
      prisma.student.update({
        where: { id },
        data: updateData
      }),
      name ? prisma.user.update({
        where: { id: student.userId },
        data: { name }
      }) : Promise.resolve(null)
    ]);

    res.json({ message: "Student updated successfully", student: updatedStudent });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteStudent = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);

    const student = await prisma.student.findUnique({ where: { id } });
    if (!student) return res.status(404).json({ message: "Student not found" });

    await prisma.$transaction(async (tx) => {
      await tx.payment.deleteMany({ where: { studentId: id } });
      await tx.booking.deleteMany({ where: { studentId: id } });
      await tx.lesson.deleteMany({ where: { studentId: id } });
      await tx.notification.deleteMany({ where: { userId: student.userId } });
      await tx.student.delete({ where: { id } });
      await tx.user.delete({ where: { id: student.userId } });
    });

    res.json({ message: "Student deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};