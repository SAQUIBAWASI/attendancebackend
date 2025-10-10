const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema(
  {
    employeeId: { type: String, required: true },
    leaveType: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    days: { type: Number, required: true },
    reason: { type: String, required: true },
    status: { type: String, default: "pending" },
    appliedDate: { type: Date, default: Date.now },
    approvedDate: { type: Date },
    comments: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Leave", leaveSchema);
