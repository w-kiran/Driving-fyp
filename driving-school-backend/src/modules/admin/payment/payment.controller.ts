import type { Request, Response } from "express";
import prisma from "../../../config/db.js";
import { v4 as uuidv4 } from "uuid";

export const createPayment = async (req: Request, res: Response) => {
  try {
    const { studentId, bookingId, amount, paymentMethod } = req.body;

    if (!studentId || !amount || !paymentMethod) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const transactionId = `TXN-${uuidv4().slice(0, 8).toUpperCase()}`;

    const payment = await prisma.payment.create({
      data: {
        studentId: parseInt(studentId),
        bookingId: bookingId ? parseInt(bookingId) : null,
        amount,
        paymentMethod,
        transactionId,
        status: "COMPLETED"
      },
      include: { student: { include: { user: true } } }
    });

    await prisma.notification.create({
      data: {
        userId: payment.student.userId,
        type: "PAYMENT",
        title: "Payment Successful",
        message: `Payment of $${amount} completed. Transaction ID: ${transactionId}`
      }
    });

    res.json({ message: "Payment processed", payment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllPayments = async (req: Request, res: Response) => {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        student: { include: { user: { select: { name: true, email: true } } } },
        booking: true
      },
      orderBy: { createdAt: "desc" }
    });

    res.json({ payments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getPaymentById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const payment = await prisma.payment.findUnique({
      where: { id: parseInt(id) },
      include: {
        student: { include: { user: true } },
        booking: true
      }
    });

    if (!payment) return res.status(404).json({ message: "Payment not found" });

    res.json({ payment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const refundPayment = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const payment = await prisma.payment.findUnique({
      where: { id: parseInt(id) }
    });

    if (!payment) return res.status(404).json({ message: "Payment not found" });

    if (payment.status !== "COMPLETED") {
      return res.status(400).json({ message: "Only completed payments can be refunded" });
    }

    const updated = await prisma.payment.update({
      where: { id: parseInt(id) },
      data: { status: "REFUNDED" },
      include: { student: { include: { user: true } } }
    });

    await prisma.notification.create({
      data: {
        userId: updated.student.userId,
        type: "REFUND",
        title: "Payment Refunded",
        message: `Your payment of $${payment.amount} has been refunded. Transaction ID: ${payment.transactionId || "N/A"}`
      }
    });

    res.json({ message: "Payment refunded", payment: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};