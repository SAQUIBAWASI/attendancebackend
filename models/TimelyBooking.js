// models/TimelyBooking.js
const mongoose = require("mongoose");

const timelyBookingSchema = new mongoose.Schema(
  {
    /* ─────────────────────────────────────────
       CLIENT / CUSTOMER DETAILS
       ───────────────────────────────────────── */
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    workEmail: {
      type: String,
      required: [true, "Work email is required"],
      lowercase: true,
      trim: true,
    },
    mobileNumber: {
      type: String,
      required: [true, "Mobile number is required"],
      trim: true,
    },
    companySize: {
      type: String,
      enum: ["1-10", "11-50", "51-200", "201-500", "500+"],
      default: "1-10",
    },
    industryType: {
      type: String,
      trim: true,
      default: "",
    },
    address: {
      type: String,
      trim: true,
      default: "",
    },
    organizationName: {
      type: String,
      trim: true,
      default: "",
    },
    panNumber: {
      type: String,
      trim: true,
      uppercase: true,
      default: "",
    },

    /* ─────────────────────────────────────────
       PLAN REFERENCE
       ───────────────────────────────────────── */
    planId: {
      type: String,
      required: [true, "Plan ID is required"],
    },
    planName: {
      type: String,
      default: "",
    },
    planSnapshot: {
      price: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      validity: { type: Number, default: 0 },
      validityUnit: {
        type: String,
        enum: ["days", "months", "years"],
        default: "days",
      },
    },

    /* ─────────────────────────────────────────
       ACCESSIBLE PRODUCTS (snapshot)
       ───────────────────────────────────────── */
    accessibleProducts: [
      {
        name: { type: String, required: true },
      },
    ],

    /* ─────────────────────────────────────────
       PAYMENT DETAILS (Razorpay)
       ───────────────────────────────────────── */
    transactionId: {
      type: String,
      default: "",
    },
    razorpayOrderId: {
      type: String,
      default: "",
    },
    baseAmount: {
      type: Number,
      default: 0,
    },
    gstAmount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      default: "",
    },
    paidAt: {
      type: Date,
      default: null,
    },

    /* ─────────────────────────────────────────
       REFERRAL
       ───────────────────────────────────────── */
    referralCode: {
      type: String,
      default: "",
      trim: true,
      uppercase: true,
    },
    generatedReferralCode: {
      type: String,
      default: "",
      uppercase: true,
    },

    /* ─────────────────────────────────────────
       GENERATED ACCESS KEYS
       ───────────────────────────────────────── */
    clientId: {
      type: String,
      default: "",
    },

    /* ─────────────────────────────────────────
       LINKED CLIENT
       ───────────────────────────────────────── */
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TimelyClient",
      default: null,
    },

    /* ─────────────────────────────────────────
       VALIDITY / SUBSCRIPTION WINDOW
       ───────────────────────────────────────── */
    validFrom: {
      type: Date,
      default: Date.now,
    },
    validTill: {
      type: Date,
      default: null,
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
    timestamps: true, // createdAt, updatedAt
  }
);

module.exports = mongoose.model("TimelyBooking", timelyBookingSchema);