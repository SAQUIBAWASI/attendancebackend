const express = require("express");

const router = express.Router();

const {
  createEvent,
  getMyEvents,
  getUpcomingEvents,
  getTodayReminders,
  getEventById,
  updateEvent,
  deleteEvent,
} = require("../controller/eventController");

// ==========================================
// CREATE EVENT
// ==========================================
router.post("/", createEvent);

// ==========================================
// GET EMPLOYEE EVENTS
// ==========================================
router.get("/my-events/:userId", getMyEvents);

// ==========================================
// GET UPCOMING EVENTS
// ==========================================
router.get("/upcoming/:userId", getUpcomingEvents);

// ==========================================
// GET TODAY'S REMINDERS
// ==========================================
router.get("/reminders/today/:userId", getTodayReminders);

// ==========================================
// GET SINGLE EVENT
// ==========================================
router.get("/:id", getEventById);

// ==========================================
// UPDATE EVENT
// ==========================================
router.put("/:id", updateEvent);

// ==========================================
// DELETE EVENT
// ==========================================
router.delete("/:id", deleteEvent);

module.exports = router;