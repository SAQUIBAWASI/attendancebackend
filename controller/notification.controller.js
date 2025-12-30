const Notification = require("../models/Notification.model");

/**
 * 🔔 CREATE NOTIFICATION
 * Admin ya Employee dono ke liye
 */
exports.createNotification = async (req, res) => {
  try {
    const { userId, role, title, message, type } = req.body;

    const notification = await Notification.create({
      userId,
      role,
      title,
      message,
      type,
    });

    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * 📥 GET ALL NOTIFICATIONS (Admin / Employee)
 */
exports.getNotificationsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * 🔴 UNREAD COUNT (Bell icon ke liye)
 */
exports.getUnreadCount = async (req, res) => {
  try {
    const { userId } = req.params;

    const count = await Notification.countDocuments({
      userId,
      isRead: false,
    });

    res.json({ unreadCount: count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * ✅ MARK SINGLE NOTIFICATION AS READ
 */
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    await Notification.findByIdAndUpdate(id, { isRead: true });

    res.json({ message: "Notification marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * ✅ MARK ALL AS READ
 */
exports.markAllAsRead = async (req, res) => {
  try {
    const { userId } = req.params;

    await Notification.updateMany(
      { userId, isRead: false },
      { $set: { isRead: true } }
    );

    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
