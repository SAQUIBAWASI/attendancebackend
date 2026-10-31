// ═══════════════════════════════════════════════════════════════════════
// Bank Credit Schema — with Retail Pharmacy + Cash Received details
// File: models/BankCredit.js
// ═══════════════════════════════════════════════════════════════════════
const mongoose = require("mongoose");

const bankCreditSchema = new mongoose.Schema(
  {
    // ── Date Range Reference ──
    fromDate: { type: String, required: true },
    toDate: { type: String, required: true },

    // rowKey: "YYYY-MM-DD" | "YYYY-MM" | "__total__"
    rowKey: { type: String, default: null },

    // ── Bank Credit Details ──
    bankCredit: { type: Number, default: 0 },
    creditedDiff: { type: Number, default: 0 },
    diffStatus: {
      type: String,
      enum: ["MATCHED", "CREDIT MORE", "CREDIT LESS", "—"],
      default: "—",
    },

    // ── ✅ Cash Received Details (NEW) ──
    cashReceived: { type: Number, default: 0 },
    cashDiff: { type: Number, default: 0 },
    cashStatus: {
      type: String,
      enum: ["MATCHED", "RCVD MORE", "RCVD LESS", "—"],
      default: "—",
    },

    // ── Grand Total (used for diff computation reference) ──
    grandTotal: { type: Number, default: 0 },

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

// rowKey unique (sparse — jb null ho to ignore ho)
bankCreditSchema.index({ rowKey: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("BankCredit", bankCreditSchema);