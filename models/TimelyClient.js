// models/TimelyClient.js
const mongoose = require("mongoose");

const timelyClientSchema = new mongoose.Schema(
  {
    /* ─────────────────────────────────────────
       BASIC / LOGIN DETAILS
       ───────────────────────────────────────── */
    name: {
      type: String,
      trim: true,
      default: "",
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: "",
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    password: {
      type: String,
      default: "",
    },

    /* ─────────────────────────────────────────
       ORGANISATION DETAILS
       ───────────────────────────────────────── */
    organisationName: {
      type: String,
      trim: true,
      default: "",
    },
    location: {
      type: String,
      trim: true,
      default: "",
    },
    address: {
      type: String,
      trim: true,
      default: "",
    },
    industryType: {
      type: String,
      trim: true,
      default: "",
    },
    companySize: {
      type: String,
      enum: ["1-10", "11-50", "51-200", "201-500", "500+", ""],
      default: "",
    },
    panNumber: {
      type: String,
      trim: true,
      uppercase: true,
      default: "",
    },

    /* ─────────────────────────────────────────
       GENERATED ACCESS KEYS
       (Frontend response me client.clientId,
        client.referralCode isi se aate hain)
       ───────────────────────────────────────── */
    clientId: {
      type: String,
      trim: true,
      default: "",
    },
    referralCode: {
      type: String,
      trim: true,
      uppercase: true,
      default: "",
    },

    /* ─────────────────────────────────────────
       PLAN / SUBSCRIPTION DETAILS
       (Booking ke time set hote hain)
       ───────────────────────────────────────── */
    planId: {
      type: String,
      default: "",
    },
    planName: {
      type: String,
      default: "",
    },
    accessibleProducts: [
      {
        name: { type: String, required: true },
      },
    ],
    validFrom: {
      type: Date,
      default: null,
    },
    validTill: {
      type: Date,
      default: null,
    },

    /* ─────────────────────────────────────────
       LINKED BOOKING (optional reference)
       ───────────────────────────────────────── */
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TimelyBooking",
      default: null,
    },

    /* ─────────────────────────────────────────
       META / TRACKING
       ───────────────────────────────────────── */
    lastLogin: {
      type: Date,
      default: null,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    /* ─────────────────────────────────────────
       STATUS
       ───────────────────────────────────────── */
    status: {
      type: String,
      enum: ["active", "inactive", "expired"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("TimelyClient", timelyClientSchema);