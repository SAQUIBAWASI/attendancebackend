const Attendance = require("../models/Attendance");

// ---------------- Check-In ----------------
// Timely Health Office Coordinates
const OFFICE_COORDS = { lat: 17.4458661, lng: 78.3849383 };
const ONSITE_RADIUS_M = 50; // 50 meters

// ✅ Haversine formula to calculate distance (in meters)
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Radius of Earth in meters
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

exports.checkIn = async (req, res) => {
  try {
    const { employeeId, employeeEmail, latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res
        .status(400)
        .json({ message: "Latitude and longitude are required" });
    }

    // ✅ Calculate distance between employee and office
    const distance = haversineDistance(
      OFFICE_COORDS.lat,
      OFFICE_COORDS.lng,
      parseFloat(latitude),
      parseFloat(longitude)
    );

    // ✅ Determine if employee is onsite
    const onsite = distance <= ONSITE_RADIUS_M;

    // ✅ Auto current date & time for check-in
    const checkInTime = new Date();

    // ✅ Create attendance record (no photoUrl)
    const attendance = await Attendance.create({
      employeeId,
      employeeEmail,
      checkInTime,
      latitude,
      longitude,
      distance,
      onsite,
      status: "checked-in"
    });

    // ✅ Send response
    res.status(200).json({
      message: onsite
        ? "Check-In successful (Onsite)"
        : "Check-In successful (Offsite)",
      checkInTime,
      distance: `${distance.toFixed(2)} meters`,
      onsite,
      attendance
    });
  } catch (err) {
    console.error("Check-in error:", err);
    res.status(500).json({ message: "Failed to Check-In", error: err.message });
  }
};

// ---------------- Check-Out ----------------
exports.checkOut = async (req, res) => {
  try {
    const { employeeId, employeeEmail, latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res
        .status(400)
        .json({ message: "Latitude and longitude are required" });
    }

    const latNum = parseFloat(latitude);
    const lonNum = parseFloat(longitude);

    // ✅ Calculate distance from office
    const distance = haversineDistance(
      OFFICE_COORDS.lat,
      OFFICE_COORDS.lng,
      latNum,
      lonNum
    );

    // ✅ Determine if employee is onsite
    const onsite = distance <= ONSITE_RADIUS_M;

    // ✅ Find today's check-in record for this employee
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      employeeId,
      status: "checked-in",
      checkInTime: { $gte: today },
    });

    if (!attendance) {
      return res
        .status(400)
        .json({ message: "No check-in record found for today" });
    }

    // ✅ Update the record with checkOutTime, distance, onsite, totalHours
    const checkOutTime = new Date();
    const totalHours =
      (checkOutTime.getTime() - attendance.checkInTime.getTime()) / 1000 / 3600; // in hours

    attendance.checkOutTime = checkOutTime;
    attendance.distance = distance;
    attendance.onsite = onsite;
    attendance.status = "checked-out";
    attendance.totalHours = parseFloat(totalHours.toFixed(2));

    await attendance.save();

    res.status(200).json({
      message: onsite
        ? "Check-Out successful (Onsite)"
        : "Check-Out successful (Offsite)",
      checkInTime: attendance.checkInTime,
      checkOutTime,
      totalHours: attendance.totalHours,
      distance: `${distance.toFixed(2)} meters`,
      onsite,
      attendance,
    });
  } catch (err) {
    console.error("Check-Out error:", err);
    res
      .status(500)
      .json({ message: "Failed to Check-Out", error: err.message });
  }
};



// ---------------- Get All Attendance Records for an Employee ----------------
exports.getEmployeeAttendance = async (req, res) => {
  try {
    const { employeeId } = req.params; // get employeeId from URL param

    if (!employeeId) {
      return res.status(400).json({ message: "Employee ID is required" });
    }

    // ✅ Find all attendance records for this employee, sorted by date descending
    const records = await Attendance.find({ employeeId }).sort({ checkInTime: -1 });

    res.status(200).json({
      message: "Employee attendance records fetched successfully",
      records,
    });
  } catch (err) {
    console.error("Get Employee Attendance error:", err);
    res.status(500).json({
      message: "Failed to fetch attendance records",
      error: err.message,
    });
  }
};





// ---------------- Get All Attendance ----------------
// Controller: get all attendance records for all employees
exports.getAllAttendance = async (req, res) => {
  try {
    // ✅ Fetch all attendance records, newest first
    const records = await Attendance.find();

    res.status(200).json({
      message: "All employee attendance records fetched successfully",
      records,
    });
  } catch (err) {
    console.error("Get All Attendance error:", err);
    res.status(500).json({
      message: "Failed to fetch attendance records",
      error: err.message,
    });
  }
};



exports.getTodayAttendance = async (req, res) => {
  try {
    // ✅ Set today's start and end time
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // ✅ Fetch attendance where checkInTime is today
    const records = await Attendance.find({
      checkInTime: { $gte: todayStart, $lte: todayEnd }
    }).sort({ checkInTime: -1 });

    res.status(200).json({
      message: "Today's attendance records fetched successfully",
      records,
    });
  } catch (err) {
    console.error("Get Today Attendance error:", err);
    res.status(500).json({
      message: "Failed to fetch today's attendance",
      error: err.message,
    });
  }
};




// controllers/attendanceController.js

exports.getLateAttendance = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // start of today

    // 10:00 AM today
    const tenAM = new Date(today);
    tenAM.setHours(10, 0, 0, 0);

    // Fetch records checked in after 10:00 AM
    const lateRecords = await Attendance.find({
      checkInTime: { $gte: tenAM }, // after 10 AM
      status: "checked-in",
      createdAt: { $gte: today } // ensure today's records only
    }).sort({ checkInTime: 1 }); // earliest late first

    res.status(200).json({
      message: "Late attendance records fetched successfully",
      records: lateRecords,
    });
  } catch (err) {
    console.error("Get Late Attendance error:", err);
    res.status(500).json({
      message: "Failed to fetch late attendance records",
      error: err.message,
    });
  }
};

