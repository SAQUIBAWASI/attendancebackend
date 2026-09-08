// models/ReferralContact.js
const mongoose = require('mongoose');

const ReferralContactSchema = new mongoose.Schema(
  {
    referralType: {
      type: String,
      enum: ['customer', 'doctor'],
      default: 'customer'
    },
    // Customer fields
    customerName: { type: String, trim: true },
    customerPhone: { type: String, trim: true },
    customerAddress: { type: String, trim: true },
    // Doctor fields
    doctorName: { type: String, trim: true },
    doctorOrganization: { type: String, trim: true },
    doctorPhone: { type: String, trim: true },
    doctorSpecialization: { type: String, trim: true },
    // Commission fields
    clinicCommission: { type: Number, default: 0 },
    pharmacyCommission: { type: Number, default: 0 },
    labCommission: { type: Number, default: 0 },
    totalCommission: { type: Number, default: 0 },
    // Common fields
    referralDate: { type: String, trim: true },
    referralNotes: { type: String, trim: true },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ReferralContact', ReferralContactSchema);