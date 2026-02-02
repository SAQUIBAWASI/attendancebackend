const Notification = require("../models/Notification");
const Subscription = require("../models/Subscription.model");
const webPush = require("web-push");
const Admin = require("../models/Admin"); // ✅ Import Admin Model
const Employee = require("../models/Employee"); // ✅ Import Employee Model

// VAPID Keys (Ideally should be in .env)
const publicVapidKey = "BOFQxoNLt_G7fyVy9hcbd9NAHowswnwky_6B-wVgRm-j8JF0oZRkE4yezPUdMAN3BpMrZ1HGldgH7lTw34W5yBQ";
const privateVapidKey = "PyXz-UC5sqxa2k-JpxSFDB2jOCeliRSA-Wk24yCTw7k";

webPush.setVapidDetails(
  "mailto:test@test.com",
  publicVapidKey,
  privateVapidKey
);

/**
 * 📤 HELPER: Send Push Notification to a User
 */
const sendPushToUser = async (userId, payload) => {
  try {
    const subscriptions = await Subscription.find({ userId });

    const notifications = subscriptions.map(sub => {
      return webPush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: sub.keys
        },
        JSON.stringify(payload)
      ).catch(err => {
        console.error("Push error for one device:", err);
        // Clean up invalid subscriptions
        if (err.statusCode === 410 || err.statusCode === 404) {
          Subscription.deleteOne({ _id: sub._id }).exec();
        }
      });
    });

    await Promise.all(notifications);
  } catch (error) {
    console.error("Error sending push notifications:", error);
  }
};
exports.sendPushToUser = sendPushToUser; // ✅ Export for other controllers

/**
 * 🔔 CREATE NOTIFICATION
 * Stores in DB and triggers Push Notification
 */
exports.createNotification = async (req, res) => {
  try {
    const { userId, role, title, message, type } = req.body;

    // ✅ CASE 1: BROADCAST TO ALL ADMINS
    if (userId === "ADMIN") {
      const admins = await Admin.find({ role: "admin" });
      
      const notifications = await Promise.all(
        admins.map(async (admin) => {
           // Create DB entry for each admin
           return Notification.create({
             userId: admin.email, // Using Email as ID for Admins (common pattern if they don't have employeeId)
             role: "admin",
             title,
             message,
             type
           });
        })
      );
      
      // Send Push to all admins
      admins.forEach(admin => {
        sendPushToUser(admin.email, { title, body: message, url: "/admin/dashboard" });
      });

      // Also send to "ADMIN" general subscription if any (fallback)
      sendPushToUser("ADMIN", { title, body: message, url: "/admin/dashboard" });

      return res.status(201).json({ message: "Notification sent to all admins", count: notifications.length });
    }

    // ✅ CASE 2: BROADCAST TO ALL EMPLOYEES (e.g. Holidays)
    if (userId === "ALL") {
      const employees = await Employee.find({ status: "active" });
      
      const notifications = await Promise.all(
        employees.map(async (emp) => {
           return Notification.create({
             userId: emp.employeeId,
             role: "employee",
             title,
             message,
             type
           });
        })
      );
      
      // Send Push to all employees
      employees.forEach(emp => {
        sendPushToUser(emp.employeeId, { title, body: message, url: "/employee/dashboard" });
      });

      return res.status(201).json({ message: "Notification sent to all employees", count: notifications.length });
    }

    // ✅ CASE 3: SINGLE USER NOTIFICATION
    const notification = await Notification.create({
      userId,
      role,
      title,
      message,
      type,
    });

    if (userId) {
      sendPushToUser(userId, { title, body: message, url: "/" });
    }

    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * 📨 SUBSCRIBE USER TO PUSH NOTIFICATIONS
 */
exports.subscribe = async (req, res) => {
  try {
    const { userId, subscription } = req.body;

    if (!userId || !subscription) {
      return res.status(400).json({ message: "Missing userId or subscription data" });
    }

    // Upsert subscription
    await Subscription.findOneAndUpdate(
      { userId, endpoint: subscription.endpoint },
      { userId, ...subscription },
      { upsert: true, new: true }
    );

    res.status(201).json({ message: "Subscribed successfully" });
  } catch (error) {
    console.error("Subscription error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * 📥 GET ALL NOTIFICATIONS (Admin / Employee)
 */
exports.getNotificationsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // If userId is "ADMIN", it might fetch shared notifications, 
    // but our logic above creates individual copies.
    // So this just works for the passed userId.

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
