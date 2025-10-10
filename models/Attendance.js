const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  employeeId: { type: String, required: true },
  employeeName: { type: String },
  date: { type: String, required: true },
  checkIn: { type: String },
  checkOut: { type: String },
  status: { type: String, default: 'present' },
  notes: { type: String },
  photo: { type: String },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
  locationStatus: { type: String },
  distanceFromOffice: { type: Number },
});

module.exports = mongoose.model('Attendance', AttendanceSchema);
