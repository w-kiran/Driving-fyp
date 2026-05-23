import { Router } from "express";
import { getMyNotifications, markNotificationRead, markAllNotificationsRead, deleteNotification } from "./notification.controller.js";
const router = Router();
router.get("/", getMyNotifications);
router.put("/:id/read", markNotificationRead);
router.put("/read-all", markAllNotificationsRead);
router.delete("/:id", deleteNotification);
export default router;
//# sourceMappingURL=notification.routes.js.map