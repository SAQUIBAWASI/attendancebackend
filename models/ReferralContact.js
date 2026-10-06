// models/ReferralContact.js
const mongoose = require('mongoose');

const ReferralContactSchema = new mongoose.Schema(
  {
    referralType: {
      type: String,
      enum: ['customer', 'doctor'],
      default: 'customer'
    },

    // ===== Customer fields =====
    customerName: { type: String, trim: true },
    customerPhone: { type: String, trim: true },
    customerAddress: { type: String, trim: true },
    customerOrganization: { type: String, trim: true },

    // ===== Doctor fields =====
    doctorName: { type: String, trim: true },
    doctorOrganization: { type: String, trim: true },
    doctorPhone: { type: String, trim: true },
    doctorSpecialization: { type: String, trim: true },
    doctorAddress: { type: String, trim: true },

    // ===== Commission fields =====
    clinicCommission: { type: Number, default: 0 },
    clinicCommissionType: {                       // ✅ NEW
      type: String,
      enum: ['%', '₹'],
      default: '%'
    },
    pharmacyCommission: { type: Number, default: 0 },
    pharmacyCommissionType: {                     // ✅ NEW
      type: String,
      enum: ['%', '₹'],
      default: '%'
    },
    labCommission: { type: Number, default: 0 },
    labCommissionType: {                          // ✅ NEW
      type: String,
      enum: ['%', '₹'],
      default: '%'
    },
    feesCommission: { type: Number, default: 0 }, // ✅ NEW
    feesCommissionType: {                         // ✅ NEW
      type: String,
      enum: ['%', '₹'],
      default: '%'
    },
    totalCommission: { type: Number, default: 0 },

    // ===== Consultation Fee (₹ only) =====
    consultationFee: { type: Number, default: 0, min: 0 },

    // ===== Services =====
    services: [                                   // ✅ NEW
      {
        name:  { type: String, trim: true, default: "" },
        price: { type: Number, default: 0, min: 0 }
      }
    ],

    // ===== Common fields =====
    onboardDate: { type: String, trim: true },
    referralDate: { type: String, trim: true },   // kept for backward compatibility
    referralNotes: { type: String, trim: true },

    // ===== Special Offers (Discount) — % OR ₹ =====
    discountFees: { type: Number, default: 0 },
    discountFeesType: {
      type: String,
      enum: ['%', '₹'],
      default: '%'
    },
    discountLab: { type: Number, default: 0 },
    discountLabType: {
      type: String,
      enum: ['%', '₹'],
      default: '%'
    },

    // ===== Offers Array (legacy + Offer modal) =====
    offers: [
      {
        offerName: { type: String, default: "" },
        offerAmount: { type: Number, default: 0 }
      }
    ],

    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ReferralContact', ReferralContactSchema);