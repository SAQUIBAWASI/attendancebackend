const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employeeId: { 
    type: String, 
    required: true 
  },
  employeeName: { 
    type: String, 
    required: true 
  },
  date: { 
    type: String, 
    required: true 
  },
  checkIn: { 
    type: Date 
  },
  checkOut: { 
    type: Date 
  },
  status: { 
    type: String, 
    default: 'present' 
  },
  photo: { 
    type: String 
  },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  distanceFromOffice: { 
    type: Number, 
    required: true 
  },
  locationStatus: { 
    type: String, 
    enum: ['within_range', 'outside_range'],
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
});

// Compound index to ensure one record per employee per day
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);