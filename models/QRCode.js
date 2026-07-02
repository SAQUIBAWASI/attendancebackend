// models/QRCode.js
const mongoose = require('mongoose');

const qrCodeSchema = new mongoose.Schema({
  companyName: {
    type: String,
  },
  locationName: {
    type: String,
  },
  address: {
    type: String,
    default: ''
  },
  latitude: {
    type: String,
    default: ''
  },
  longitude: {
    type: String,
    default: ''
  },
  adminName: {
    type: String,
    default: ''
  },
  token: {
    type: String,
  },
  qrData: {
    type: String, // ✅ Ab isme URL store hoga
  },
  expiryTime: {
    type: Number,
    default: 30
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('QRCode', qrCodeSchema);