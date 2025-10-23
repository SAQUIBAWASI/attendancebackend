const mongoose = require("mongoose");
const Attendance = require("../models/Attendance");
// ✅ Office Coordinates (same as frontend)
const OFFICE_COORDS = { lat: 17.445860, lng: 78.387154 };

// ✅ Maximum allowed distance (50 meters)
const ONSITE_RADIUS_M = 700;

// ✅ Haversine distance formula
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth radius in meters
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c); // distance in meters
}

// ✅ Check-in controller
exports.checkIn = async (req, res) => {
  try {
    const { employeeId, latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ message: "Location not provided" });
    }

    const userLat = parseFloat(latitude);
    const userLng = parseFloat(longitude);

    // Calculate distance from office
    const distance = haversineDistance(
      userLat,
      userLng,
      OFFICE_COORDS.lat,
      OFFICE_COORDS.lng
    );

    // ✅ Detect onsite/offsite automatically
    const onsite = distance <= ONSITE_RADIUS_M;

    console.log("✅ Office Coords:", OFFICE_COORDS);
    console.log("✅ User Coords:", { userLat, userLng });
    console.log("✅ Distance (m):", distance);
    console.log("✅ Onsite:", onsite ? "Yes" : "No");

    // Check if already checked in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingAttendance = await Attendance.findOne({
      employeeId,
      date: { $gte: today },
    });

    if (existingAttendance) {
      return res.status(400).json({ message: "Already checked in today" });
    }

    // ✅ Save attendance (onsite or offsite)
    const attendance = new Attendance({
      employeeId,
      checkIn: new Date(),
      date: today,
      onsite,
      distanceFromOffice: distance, // optional: store distance for record
      location: { lat: userLat, lng: userLng },
    });

    await attendance.save();

    res.status(200).json({
      message: onsite
        ? "✅ Check-in successful (Onsite)"
        : `✅ Check-in successful (Offsite - ${distance}m away)`,
      attendance,
    });
  } catch (error) {
    console.error("❌ Check-in Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Check-out controller
exports.checkOut = async (req, res) => {
  try {
    const { employeeId } = req.body;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      employeeId,
      date: { $gte: today },
    });

    if (!attendance) {
      return res.status(400).json({ message: "No check-in found for today" });
    }

    if (attendance.checkOut) {
      return res.status(400).json({ message: "Already checked out" });
    }

    attendance.checkOut = new Date();
    await attendance.save();

    res.status(200).json({
      message: "✅ Check-out successful",
      attendance,
    });
  } catch (error) {
    console.error("❌ Check-out Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
// ✅ Get Attendance for One Employee
exports.getEmployeeAttendance = async (req, res) => {
  try {
    const { employeeId } = req.params;
    if (!employeeId)
      return res.status(400).json({ message: "Employee ID is required" });

    const records = await Attendance.find({ employeeId }).sort({
      checkInTime: -1,
    });

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

// ✅ Get All Attendance
exports.getAllAttendance = async (req, res) => {
  try {
    const records = await Attendance.find().sort({ checkInTime: -1 });
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

// ✅ Get Today's Attendance
exports.getTodayAttendance = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const records = await Attendance.find({
      checkInTime: { $gte: todayStart, $lte: todayEnd },
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

// ✅ Get Late Attendance
exports.getLateAttendance = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tenAM = new Date(today);
    tenAM.setHours(10, 0, 0, 0);

    const lateRecords = await Attendance.find({
      checkInTime: { $gte: tenAM },
      createdAt: { $gte: today },
    }).sort({ checkInTime: 1 });

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
// ✅ Attendance Summary API (for Dashboard)
const Employee = require("../models/Employee"); // make sure you have Employee model

exports.getAttendanceSummary = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // 1️⃣ Count all employees
    const totalEmployees = await Employee.countDocuments();

    // 2️⃣ Get today's attendance
    const todayRecords = await Attendance.find({
      checkInTime: { $gte: today, $lte: endOfDay },
    });

    const presentToday = todayRecords.length;

    // 3️⃣ Late employees (check-in after 10 AM)
    const tenAM = new Date(today);
    tenAM.setHours(10, 0, 0, 0);
    const lateToday = todayRecords.filter(
      (rec) => new Date(rec.checkInTime) >= tenAM
    ).length;

    // 4️⃣ Absent = total - present
    const absentToday = Math.max(totalEmployees - presentToday, 0);

    // 5️⃣ Attendance Rate %
    const attendanceRate = totalEmployees
      ? ((presentToday / totalEmployees) * 100).toFixed(1)
      : 0;

    res.status(200).json({
      message: "Attendance summary fetched successfully",
      totals: {
        employees: totalEmployees,
        presentToday,
        absentToday,
        lateToday,
        attendanceRate,
      },
    });
  } catch (err) {
    console.error("❌ Attendance Summary Error:", err);
    res.status(500).json({
      message: "Failed to fetch attendance summary",
      error: err.message,
    });
  }
};
