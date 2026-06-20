const mongoose = require('mongoose');

const extraDayCompOffSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    index: true
  },
  employeeName: {
    type: String,
  },
  extraDayDate: {
    type: Date,
  },
  extraDayDetails: {
    sr: Number,
    date: Date,
    day: String,
    totalHours: Number,
    extraHours: Number
  },
  leaveId: {
    type: String,
    default: null
  },
  leaveDetails: {
    leaveType: String,
    startDate: Date,
    endDate: Date,
    days: Number,
    reason: String,
    status: String
  },
  reason: {
    type: String,
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
  convertedToCompOff: {
    type: Boolean,
    default: false
  },
  workDate: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ExtraDayCompOff', extraDayCompOffSchema);