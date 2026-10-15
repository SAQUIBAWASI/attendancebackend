// ═══════════════════════════════════════════════════════════════════════
// Bank Credit Schema — with Retail Pharmacy details
// File: models/BankCredit.js
// ═══════════════════════════════════════════════════════════════════════
const mongoose = require("mongoose");

const bankCreditSchema = new mongoose.Schema(
  {
    // ── Date Range Reference ──
    fromDate: { type: String },
    toDate: { type: String },

    // ── Bank Credit Details ──
    bankCredit: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },
    creditedDiff: { type: Number, default: 0 },
    diffStatus: {
      type: String,
      enum: ["MATCHED", "CREDIT MORE", "CREDIT LESS", "—"],
      default: "—",
    },

    // ── ✅ Retail Pharmacy (manually entered on frontend) ──
    retailPharmacy: {
      cash: { type: Number, default: 0 },
      online: { type: Number, default: 0 },
      due: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
      card: { type: Number, default: 0 },
      insurance: { type: Number, default: 0 },
      footFall: { type: Number, default: 0 },
    },

    // ── Saved By ──
    savedBy: { type: String, default: "Admin" },
    savedAt: { type: Date, default: Date.now },

    // ── Notes (optional) ──
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

// ✅ Unique per date range (upsert-friendly)
bankCreditSchema.index({ fromDate: 1, toDate: 1 }, { unique: true });

module.exports = mongoose.model("BankCredit", bankCreditSchema);