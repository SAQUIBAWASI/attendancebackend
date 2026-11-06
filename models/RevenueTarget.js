const mongoose = require("mongoose");

const revenueTargetSchema = new mongoose.Schema(
  {
    month: { type: Number },
    year: { type: Number },
    // ✅ wPharmacy Add kiya
    category: {
      type: String,
      enum: ["clinic", "lab", "clinicPharmacy", "wPharmacy", "retailPharmacy"],
      default: "clinic",
    },
    amount: { type: Number, default: 0, min: 0 },
    footFall: { type: Number, default: 0 },
    achieved: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ["PENDING", "ACHIEVED", "EXCEEDED", "SHORTFALL"],
      default: "PENDING",
    },
    diff: { type: Number, default: 0 },
    savedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

revenueTargetSchema.index({ month: 1, year: 1, category: 1 });
module.exports = mongoose.model("RevenueTarget", revenueTargetSchema);