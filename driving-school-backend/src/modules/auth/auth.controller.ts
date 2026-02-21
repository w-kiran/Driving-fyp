import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type{ Request, Response } from "express";

const prisma = new PrismaClient();

export const adminLogin = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) return res.status(404).json({ message: "Admin not found" });

  const valid = await bcrypt.compare(password, admin.password);
  if (!valid) return res.status(400).json({ message: "Invalid password" });

  const token = jwt.sign({ id: admin.id, role: "ADMIN" }, process.env.JWT_SECRET!, { expiresIn: "1d" });

  res.json({ token });
};

export const studentRegister = async (req: Request, res: Response) => {
  const { name, email, password, preferredSlots, examDate } = req.body;
  const hashed = await bcrypt.hash(password, 10);

  await prisma.student.create({
    data: { name, email, password: hashed, preferredSlots, examDate }
  });

  res.json({ message: "Student registered" });
};

export const studentLogin = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const student = await prisma.student.findUnique({ where: { email } });
  if (!student) return res.status(404).json({ message: "Student not found" });

  const valid = await bcrypt.compare(password, student.password);
  if (!valid) return res.status(400).json({ message: "Invalid password" });

  const token = jwt.sign({ id: student.id, role: "STUDENT" }, process.env.JWT_SECRET!, { expiresIn: "1d" });
  res.json({ token, status: student.status });
};