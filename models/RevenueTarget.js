// ═══════════════════════════════════════════════════════════════════════
// Revenue Target Schema (with category support)
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

    // ── 🆕 Category (Clinic / Lab / Clinic Pharmacy / Retail Pharmacy) ──
    category: {
      type: String,
      enum: ["clinic", "lab", "clinicPharmacy", "retailPharmacy"],
      default: "clinic",
    },

    // ── Target Details ──
    amount: {
      type: Number,
      default: 0,
      min: 0,
    },

      footFall: { type: Number, default: 0 }, // ✅ Add this


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

// ── 🔑 Compound unique index — same month+year me har category ka apna target ──
// (clinic, lab, clinicPharmacy, retailPharmacy) — 4 rows per month max
revenueTargetSchema.index(
  { month: 1, year: 1, category: 1 },
);

module.exports = mongoose.model("RevenueTarget", revenueTargetSchema);