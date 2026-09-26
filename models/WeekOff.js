const mongoose = require('mongoose');

const weekOffSchema = new mongoose.Schema({
  selectedEmployees: [{
    employeeId: String,
    employeeName: String
  }],
  weekOffDays: [String], // e.g. ['Sunday', 'Saturday']
  specificDates: [String], // e.g. ['2026-09-14', '2026-09-21']
  selectAllEmployees: { type: Boolean, default: false },
  selectedMonths: [String], // e.g. ['2026-09', '2026-10']
  selectionMode: { type: String, enum: ['weekly', 'weekwise', 'monthly'], default: 'weekly' },
  weekwiseSelection: [{
    week: Number,
    day: String // e.g. { week: 1, day: 'Sunday' }
  }],
  monthlyPattern: [{
    occurrence: String, // e.g. '1st', '2nd', '3rd', '4th', 'last'
    day: String // e.g. { occurrence: '1st', day: 'Monday' }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('WeekOff', weekOffSchema);
