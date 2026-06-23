// models/ClaimedOT.js
const mongoose = require('mongoose');

const ClaimedOTSchema = new mongoose.Schema({
  employeeId: {
    type: String,
  },
  employeeName: {
    type: String,
  },
  attendanceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Attendance',
  },
  date: {
    type: Date,
  },
  otHours: {
    type: Number,
    min: 0
  },
  reason: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvedBy: {
    type: String,
    default: null
  },
  approvedAt: {
    type: Date,
    default: null
  },
  rejectedReason: {
    type: String,
    default: null
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  paidAt: {
    type: Date,
    default: null
  },
  notes: {
    type: String,
    default: null
  },
  // ✅ New fields for OT amount and multiplier
  otAmount: {
    type: Number,
    default: 0
  },
  multiplier: {
    type: Number,
    default: 2
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate claims for same attendance
ClaimedOTSchema.index({ employeeId: 1, attendanceId: 1 }, { unique: true });

// Index for faster queries
ClaimedOTSchema.index({ employeeId: 1, date: -1 });
ClaimedOTSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('ClaimedOT', ClaimedOTSchema);