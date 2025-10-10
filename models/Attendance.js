const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  employeeId: { 
    type: String, 
    required: [true, 'Employee ID is required'] 
  },
  employeeName: { 
    type: String, 
    required: [true, 'Employee name is required'] 
  },
  date: { 
    type: Date, 
    required: [true, 'Date is required'],
    default: Date.now 
  },
  checkIn: { 
    type: String,
    required: [true, 'Check-in time is required']
  },
  checkOut: { 
    type: String 
  },
  status: { 
    type: String, 
    enum: ['present', 'absent', 'late', 'half-day'],
    default: 'present' 
  },
  notes: { 
    type: String 
  },
  photo: { 
    type: String 
  },
  location: {
    latitude: { 
      type: Number, 
      required: [true, 'Latitude is required'] 
    },
    longitude: { 
      type: Number, 
      required: [true, 'Longitude is required'] 
    }
  },
  locationStatus: { 
    type: String,
    enum: ['within_office', 'outside_office', 'remote'],
    default: 'within_office'
  },
  distanceFromOffice: { 
    type: Number 
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate attendance for same employee on same date
AttendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);