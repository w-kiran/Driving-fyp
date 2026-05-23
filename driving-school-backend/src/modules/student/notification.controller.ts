import type { Request, Response } from "express";
import prisma from "../../config/db.js";
import jwt from "jsonwebtoken";

export const getMyNotifications = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "Unauthorized" });

    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    let payload: any;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET!);
    } catch {
      return res.status(401).json({ message: "Invalid token" });
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: payload.id },
      orderBy: { createdAt: "desc" }
    });

    res.json({ notifications });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const markNotificationRead = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "Unauthorized" });

    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    let payload: any;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET!);
    } catch {
      return res.status(401).json({ message: "Invalid token" });
    }

    const id = parseInt(req.params.id as string);

    const notification = await prisma.notification.findUnique({
      where: { id }
    });

    if (!notification) return res.status(404).json({ message: "Notification not found" });

    if (notification.userId !== payload.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await prisma.notification.update({
      where: { id },
      data: { read: true }
    });

    res.json({ message: "Notification marked as read" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const markAllNotificationsRead = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "Unauthorized" });

    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    let payload: any;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET!);
    } catch {
      return res.status(401).json({ message: "Invalid token" });
    }

    await prisma.notification.updateMany({
      where: { userId: payload.id, read: false },
      data: { read: true }
    });

    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "Unauthorized" });

    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    let payload: any;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET!);
    } catch {
      return res.status(401).json({ message: "Invalid token" });
    }

    const id = parseInt(req.params.id as string);

    const notification = await prisma.notification.findUnique({
      where: { id }
    });

    if (!notification) return res.status(404).json({ message: "Notification not found" });

    if (notification.userId !== payload.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await prisma.notification.delete({ where: { id } });

    res.json({ message: "Notification deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};