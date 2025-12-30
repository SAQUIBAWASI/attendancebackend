const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  userId: {
    type: String,          // employeeId OR "ADMIN"
    required: true,
  },
  role: {
    type: String,          // "admin" | "employee"
    required: true,
  },
  title: {
    type: String,
    default: "Notification",
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,          // leave | attendance | general
    default: "general",
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Notification", notificationSchema);
