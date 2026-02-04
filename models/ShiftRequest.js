const mongoose = require("mongoose");

const shiftRequestSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
    },
    employeeName: {
      type: String,
      required: true,
    },
    currentShift: {
      type: String, // e.g., "A"
    },
    requestedShiftType: {
      type: String, // e.g., "B"
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    adminComment: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ShiftRequest", shiftRequestSchema);
