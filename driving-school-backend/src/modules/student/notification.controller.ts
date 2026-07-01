import type { Response } from "express";
import type { AuthRequest } from "../../middleware/auth.middleware.js";
import prisma from "../../config/db.js";

export const getMyNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: "desc" }
    });

    res.json({ notifications });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const markNotificationRead = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);

    const notification = await prisma.notification.findUnique({
      where: { id }
    });

    if (!notification) return res.status(404).json({ message: "Notification not found" });

    if (notification.userId !== req.user!.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await prisma.notification.update({
      where: { id },
      data: { read: true }
    });

    res.json({ message: "Notification marked as read successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const markAllNotificationsRead = async (req: AuthRequest, res: Response) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user!.id, read: false },
      data: { read: true }
    });

    res.json({ message: "All notifications marked as read successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteNotification = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);

    const notification = await prisma.notification.findUnique({
      where: { id }
    });

    if (!notification) return res.status(404).json({ message: "Notification not found" });

    if (notification.userId !== req.user!.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await prisma.notification.delete({ where: { id } });

    res.json({ message: "Notification deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};