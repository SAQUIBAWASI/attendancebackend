// ═══════════════════════════════════════════════════════════════════════
// NEW: Revenue Target Schema
// File: models/RevenueTarget.js
// ═══════════════════════════════════════════════════════════════════════
const mongoose = require("mongoose");

const revenueTargetSchema = new mongoose.Schema(
  {
    // ── Target Period ──
    month: {
      type: Number, // 1-12
    },
    year: {
      type: Number,
    },

    // ── Target Details ──
    amount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ── Achieved (baad me update hoga) ──
    achieved: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ── Achievement Status ──
    status: {
      type: String,
      enum: ["PENDING", "ACHIEVED", "EXCEEDED", "SHORTFALL"],
      default: "PENDING",
    },

    // ── Difference (achieved - target) ──
    diff: {
      type: Number,
      default: 0,
    },

    // ── Timestamps ──
    savedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

revenueTargetSchema.index({ month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model("RevenueTarget", revenueTargetSchema);