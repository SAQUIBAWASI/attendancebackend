const mongoose = require('mongoose');

const PartnerSchema = new mongoose.Schema({
  fullName: {
    type: String,
  },
  email: {
    type: String,
  },
  phone: {
    type: String,
  },
  organization: {
    type: String,
  },
  partnerType: {
    type: String,
  },
  city: {
    type: String,
  },
  message: {
    type: String,
  },
  referralCode: {
    type: String,
  },
  status: {
    type: String,
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Partner = mongoose.model('Partner', PartnerSchema);
module.exports = Partner;