const mongoose = require("mongoose");

const resignationSchema = new mongoose.Schema(
  {
    // ── Employee Reference ──
    employeeId: {
      type: String,
      required: true,
      index: true,
    },
    employeeObjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },
    employeeName: { type: String, required: true },
    email: { type: String, default: "" },
    department: { type: String, default: "" },
    designation: { type: String, default: "" },
    joiningDate: { type: Date, default: null },

    // ── Resignation Details ──
    resignationDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    lastWorkingDate: {
      type: Date,
      required: true,
    },
    noticePeriodDays: {
      type: Number,
      default: 30,
    },
    reasonCategory: {
      type: String,
      enum: [
        "Better Opportunity",
        "Personal Reasons",
        "Higher Studies",
        "Health Issues",
        "Relocation",
        "Work Environment",
        "Compensation",
        "Other",
      ],
      default: "Other",
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    comments: {
      type: String,
      default: "",
    },

    // ── Status Flow ──
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "withdrawn"],
      default: "pending",
      index: true,
    },

    // ── Admin Action ──
    approvedBy: { type: String, default: "" },
    approvedAt: { type: Date, default: null },
    rejectedReason: { type: String, default: "" },
    adminRemark: { type: String, default: "" },

    // ── Short Notice Flag ──
    isShortNotice: { type: Boolean, default: false },
    shortNoticeDays: { type: Number, default: 0 },
  },
  { timestamps: true }
);

resignationSchema.index({ employeeId: 1, status: 1 });

module.exports = mongoose.model("Resignation", resignationSchema);