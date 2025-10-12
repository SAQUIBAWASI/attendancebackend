const Attendance = require('../models/Attendance');

exports.markAttendance = async (req, res) => {
  try {
    console.log("🎯 Attendance API Hit!");
    console.log("📦 Request Body:", req.body);

    const { 
      employeeId, 
      employeeName, 
      date, 
      checkIn, 
      checkOut, 
      photo, 
      location, 
      distanceFromOffice, 
      locationStatus 
    } = req.body;

    // ✅ Validation
    if (!employeeId) {
      return res.status(400).json({ error: 'Employee ID is required' });
    }
    if (!employeeName) {
      return res.status(400).json({ error: 'Employee Name is required' });
    }
    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }
    if (!location || !location.latitude || !location.longitude) {
      return res.status(400).json({ error: 'Valid location is required' });
    }

    // ✅ Find existing attendance record for today
    let attendanceRecord = await Attendance.findOne({ 
      employeeId, 
      date 
    });

    if (!attendanceRecord) {
      // ✅ Create new attendance record
      attendanceRecord = new Attendance({
        employeeId,
        employeeName,
        date,
        checkIn: checkIn ? new Date(checkIn) : null,
        checkOut: checkOut ? new Date(checkOut) : null,
        photo: photo || '',
        location: {
          latitude: location.latitude,
          longitude: location.longitude
        },
        distanceFromOffice: distanceFromOffice || 0,
        locationStatus: locationStatus || 'outside_range',
        status: 'present'
      });
    } else {
      // ✅ Update existing record
      if (checkIn && !attendanceRecord.checkIn) {
        attendanceRecord.checkIn = new Date(checkIn);
      }
      if (checkOut && !attendanceRecord.checkOut) {
        attendanceRecord.checkOut = new Date(checkOut);
      }
      
      // Update other fields if provided
      if (photo) attendanceRecord.photo = photo;
      if (location) {
        attendanceRecord.location = {
          latitude: location.latitude,
          longitude: location.longitude
        };
      }
      if (distanceFromOffice) attendanceRecord.distanceFromOffice = distanceFromOffice;
      if (locationStatus) attendanceRecord.locationStatus = locationStatus;
    }

    // ✅ Save to database
    await attendanceRecord.save();
    
    console.log("✅ Attendance saved successfully!");

    // ✅ Send success response
    res.status(200).json({
      success: true,
      message: checkIn ? 'Check-in successful!' : 'Check-out successful!',
      data: attendanceRecord
    });

  } catch (err) {
    console.error("❌ Attendance Error:", err);
    
    // Handle duplicate key error
    if (err.code === 11000) {
      return res.status(400).json({ 
        error: 'Attendance already marked for today' 
      });
    }
    
    res.status(500).json({ 
      error: err.message || 'Internal server error in marking attendance' 
    });
  }
};

// ✅ Get attendance by employee ID and date
exports.getAttendance = async (req, res) => {
  try {
    const { employeeId, date } = req.params;

    const attendance = await Attendance.findOne({ employeeId, date });

    if (!attendance) {
      return res.status(404).json({ 
        error: 'Attendance record not found' 
      });
    }

    res.status(200).json({
      success: true,
      data: attendance
    });

  } catch (err) {
    console.error("❌ Get Attendance Error:", err);
    res.status(500).json({ 
      error: err.message || 'Internal server error' 
    });
  }
};

// ✅ Get all attendance for an employee
exports.getEmployeeAttendance = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const attendance = await Attendance.find({ employeeId })
      .sort({ date: -1 })
      .limit(30); // Last 30 records

    res.status(200).json({
      success: true,
      data: attendance
    });

  } catch (err) {
    console.error("❌ Get Employee Attendance Error:", err);
    res.status(500).json({ 
      error: err.message || 'Internal server error' 
    });
  }
};