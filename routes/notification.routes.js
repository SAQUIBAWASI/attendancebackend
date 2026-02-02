const router = require("express").Router();
const controller = require("../controller/notification.controller");

// Create notification (ADMIN / SYSTEM use karega)
router.post("/create", controller.createNotification);

// Subscribe to Push Notifications
router.post("/subscribe", controller.subscribe);

// Get notifications (Admin / Employee)
router.get("/:userId", controller.getNotificationsByUser);

// Unread count (Bell icon)
router.get("/unread/:userId", controller.getUnreadCount);

// Mark one as read
router.put("/read/:id", controller.markAsRead);

// Mark all as read
router.put("/read-all/:userId", controller.markAllAsRead);

module.exports = router;
