import type { Request, Response } from "express";
import prisma from "../../../config/db.js";
import { parseSortParams } from "../../../utils/sortHelper.js";

export const getAllBookings = async (req: Request, res: Response) => {
  try {
    const status = req.query.status as string | undefined;
    const studentId = req.query.studentId as string | undefined;
    const date = req.query.date as string | undefined;

    const where: any = {};
    if (status) where.status = status;
    if (studentId) where.studentId = parseInt(studentId);
    if (date) where.preferredDate = date;

    const orderBy = parseSortParams(req, "id", "desc");

    const bookings = await prisma.booking.findMany({
      where,
      include: { student: { include: { user: { select: { name: true, email: true } } } } },
      orderBy
    });

    res.json({ bookings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getBookingById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(id) },
      include: { student: true }
    });

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    res.json({ booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateBookingStatus = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;

    if (!["PENDING", "SCHEDULED", "COMPLETED"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(id) }
    });

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const updated = await prisma.booking.update({
      where: { id: parseInt(id) },
      data: { status: status as "PENDING" | "SCHEDULED" | "COMPLETED" }
    });

    res.json({ message: "Booking updated", booking: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteBooking = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(id) }
    });

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    await prisma.booking.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: "Booking deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};