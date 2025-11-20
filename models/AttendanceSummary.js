const mongoose = require("mongoose");

const AttendanceSummarySchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
  },

  name: {
    type: String,
    default: "Unknown",
  },

  presentDays: { type: Number, default: 0 },
  lateDays: { type: Number, default: 0 },
  onsiteDays: { type: Number, default: 0 },
  halfDayLeaves: { type: Number, default: 0 },
  fullDayLeaves: { type: Number, default: 0 },
  totalWorkingDays: { type: Number, default: 0 },

  fromDate: { type: Date },
  toDate: { type: Date },
  month: { type: String }, // "2025-11"

  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model("AttendanceSummary", AttendanceSummarySchema);
