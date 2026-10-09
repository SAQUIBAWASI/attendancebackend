const mongoose = require("mongoose");

const compOffRequestSchema = new mongoose.Schema(
  {
    employeeId: { 
      type: String, 
      required: true 
    },
    employeeName: { 
      type: String, 
      required: true 
    },
    // ✅ originalLeaveId ab OPTIONAL hai (fresh comp-off request ke liye)
    originalLeaveId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Leave",
      required: false,
      default: null
    },
    // ✅ Extra day details
    extraDayDate: { 
      type: String, 
      default: null 
    },
    extraDayDetails: {
      date: { type: String },
      day: { type: String },
      totalHours: { type: Number, default: 8 },
      extraHours: { type: Number, default: 0 },
      workType: { type: String, default: "Week-off Work" }
    },
    // ✅ Leave details (agar leave se convert ho raha ho)
    leaveDetails: {
      leaveType: { type: String },
      startDate: { type: String },
      endDate: { type: String },
      days: { type: Number },
      reason: { type: String },
      status: { type: String }
    },
    workDate: { 
      type: String, 
      required: true 
    },
    reason: { 
      type: String, 
      default: "" 
    },
    count: { type: Number, default: 1, min: 0.5 },
    status: { 
      type: String, 
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },
    approvedBy: { 
      type: String,
      default: null
    },
    approvedDate: { 
      type: Date 
    },
    rejectionReason: {
      type: String,
      default: ""
    },
    convertedToCompOff: {
      type: Boolean,
      default: false
    },
    compOffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CompOff"
    },
    // ✅ Expiry tracking
    validTill: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("CompOffRequest", compOffRequestSchema);