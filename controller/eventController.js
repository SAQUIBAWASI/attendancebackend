const mongoose = require("mongoose");
const Event = require("../models/Event");

// ==========================================
// ADD EVENT
// ==========================================
const createEvent = async (req, res) => {
  try {
    const {
      userId,
      userRole,
      title,
      eventType,
      date,
      reminderBefore,
      repeat,
      notes,
    } = req.body;

    if (!userId || !title || !date) {
      return res.status(400).json({
        success: false,
        message: "User ID, title and date are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid User ID",
      });
    }

    const event = await Event.create({
      userId,
      userRole: userRole || "employee",
      title,
      eventType: eventType || "other",
      date,
      reminderBefore:
        reminderBefore !== undefined ? reminderBefore : 1,
      repeat: repeat || "none",
      notes: notes || "",
    });

    res.status(201).json({
      success: true,
      message: "Event added successfully",
      event,
    });
  } catch (error) {
    console.error("Create Event Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create event",
      error: error.message,
    });
  }
};

// ==========================================
// GET MY EVENTS
// ==========================================
const getMyEvents = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid User ID",
      });
    }

    const events = await Event.find({
      userId,
    }).sort({ date: 1 });

    res.status(200).json({
      success: true,
      count: events.length,
      events,
    });
  } catch (error) {
    console.error("Get My Events Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch events",
      error: error.message,
    });
  }
};

// ==========================================
// GET UPCOMING EVENTS
// ==========================================
const getUpcomingEvents = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid User ID",
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const next30Days = new Date();
    next30Days.setDate(next30Days.getDate() + 30);
    next30Days.setHours(23, 59, 59, 999);

    const events = await Event.find({
      userId,
      date: {
        $gte: today,
        $lte: next30Days,
      },
    }).sort({ date: 1 });

    res.status(200).json({
      success: true,
      count: events.length,
      events,
    });
  } catch (error) {
    console.error("Upcoming Events Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch upcoming events",
      error: error.message,
    });
  }
};

// ==========================================
// GET TODAY'S REMINDERS
// ==========================================
const getTodayReminders = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid User ID",
      });
    }

    const today = new Date();

    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const events = await Event.find({
      userId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    }).sort({ date: 1 });

    res.status(200).json({
      success: true,
      count: events.length,
      events,
    });
  } catch (error) {
    console.error("Today's Reminder Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch today's reminders",
      error: error.message,
    });
  }
};

// ==========================================
// GET SINGLE EVENT
// ==========================================
const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    res.status(200).json({
      success: true,
      event,
    });
  } catch (error) {
    console.error("Get Event Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch event",
      error: error.message,
    });
  }
};

// ==========================================
// UPDATE EVENT
// ==========================================
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      userId,
      title,
      eventType,
      date,
      reminderBefore,
      repeat,
      notes,
    } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const event = await Event.findOne({
      _id: id,
      userId,
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (title !== undefined) event.title = title;
    if (eventType !== undefined) event.eventType = eventType;
    if (date !== undefined) event.date = date;
    if (reminderBefore !== undefined) {
      event.reminderBefore = reminderBefore;
    }
    if (repeat !== undefined) event.repeat = repeat;
    if (notes !== undefined) event.notes = notes;

    await event.save();

    res.status(200).json({
      success: true,
      message: "Event updated successfully",
      event,
    });
  } catch (error) {
    console.error("Update Event Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update event",
      error: error.message,
    });
  }
};

// ==========================================
// DELETE EVENT
// ==========================================
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const query = { _id: id };
    if (userId) {
      query.userId = userId;
    }

    const event = await Event.findOneAndDelete(query);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error("Delete Event Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete event",
      error: error.message,
    });
  }
};

module.exports = {
  createEvent,
  getMyEvents,
  getUpcomingEvents,
  getTodayReminders,
  getEventById,
  updateEvent,
  deleteEvent,
};