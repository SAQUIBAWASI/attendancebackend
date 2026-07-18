const mongoose = require("mongoose");

const visitTargetSchema = new mongoose.Schema(
  {
    employeeId: { type: String, required: true },
    employeeName: { type: String, default: "" },
    month: { type: String, required: true }, // "YYYY-MM"
    target: { type: Number, required: true, min: 1 },
    assignedBy: { type: String, default: "Admin" },
  },
  { timestamps: true }
);

// One target per employee per month
visitTargetSchema.index({ employeeId: 1, month: 1 }, { unique: true });

module.exports = mongoose.model("VisitTarget", visitTargetSchema);