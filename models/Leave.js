const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema(
  {
    employeeId: { type: String, required: true }, // keep as string if you are not using ObjectId
    employeeName: { type: String, required: true }, // ✅ add this
    leaveType: { type: String, required: true },
    startDate: { type: String, required: true }, // ✅ change Date → String (to match frontend)
    endDate: { type: String, required: true },
    days: { type: Number, required: true },
    reason: { type: String, required: true },
    status: { type: String, default: "pending" },
    appliedDate: { type: Date, default: Date.now },
    approvedDate: { type: Date },
    comments: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Leave", leaveSchema);
