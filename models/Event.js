const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    // Employee ya Admin ki ID
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },

    // User ka role
    userRole: {
      type: String,
      enum: ["employee", "admin"],
    },

    // Event title
    title: {
      type: String,
      trim: true,
    },

    // Event type
    eventType: {
      type: String,
      enum: [
        "birthday",
        "anniversary",
        "achievement",
        "appointment",
        "vacation",
        "exam",
        "other",
      ],
      default: "other",
    },

    // Event date
    date: {
      type: Date,
    },

    // Reminder kitne din pehle
    reminderBefore: {
      type: Number,
      enum: [0, 1, 2, 3, 7, 14, 30],
      default: 1,
    },

    // Event repeat hoga ya nahi
    repeat: {
      type: String,
      enum: ["none", "yearly"],
      default: "none",
    },

    // Optional notes
    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Event", eventSchema);