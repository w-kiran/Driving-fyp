import { Router } from "express";
import { getMyNotifications, markNotificationRead, markAllNotificationsRead, deleteNotification } from "./notification.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";

const router = Router();

router.get("/", authenticate, getMyNotifications);
router.put("/:id/read", authenticate, markNotificationRead);
router.put("/read-all", authenticate, markAllNotificationsRead);
router.delete("/:id", authenticate, deleteNotification);

export default router;