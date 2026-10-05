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
    customerOrganization: { type: String, trim: true }, // ✅ NEW

    // ===== Doctor fields =====
    doctorName: { type: String, trim: true },
    doctorOrganization: { type: String, trim: true },
    doctorPhone: { type: String, trim: true },
    doctorSpecialization: { type: String, trim: true },
    doctorAddress: { type: String, trim: true },        // ✅ NEW

    // ===== Commission fields =====
    clinicCommission: { type: Number, default: 0 },
    pharmacyCommission: { type: Number, default: 0 },
    labCommission: { type: Number, default: 0 },
    totalCommission: { type: Number, default: 0 },

    // ===== Common fields =====
    onboardDate: { type: String, trim: true },          // ✅ NEW (renamed from referralDate)
    referralDate: { type: String, trim: true },         // kept for backward compatibility
    referralNotes: { type: String, trim: true },

    // ===== Special Offers (Discount) — % OR ₹ =====
    discountFees: { type: Number, default: 0 },         // ✅ NEW
    discountFeesType: {                                 // ✅ NEW
      type: String,
      enum: ['%', '₹'],
      default: '%'
    },
    discountLab: { type: Number, default: 0 },          // ✅ NEW
    discountLabType: {                                  // ✅ NEW
      type: String,
      enum: ['%', '₹'],
      default: '%'
    },


        consultationFee: { type: Number, default: 0, min: 0 },


    // ===== Offers Array =====
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