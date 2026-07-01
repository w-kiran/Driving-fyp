import { Router } from "express";
import { getMyNotifications, markNotificationRead, markAllNotificationsRead, deleteNotification } from "./notification.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";

const router = Router();

// IMPORTANT: static routes must come before parameterized routes
router.get("/", authenticate, getMyNotifications);
router.put("/read-all", authenticate, markAllNotificationsRead);
router.put("/:id/read", authenticate, markNotificationRead);
router.delete("/:id", authenticate, deleteNotification);

export default router;