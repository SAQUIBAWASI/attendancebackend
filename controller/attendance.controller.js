// const mongoose = require("mongoose");
// const Attendance = require("../models/Attendance");
// const Employee = require("../models/Employee");

// // ✅ Office Coordinates (update only if office moves)
// const OFFICE_COORDS = { lat: 17.448294, lng: 78.391487 };
// const ONSITE_RADIUS_M = 50; // allowed distance in meters

// // ✅ Haversine Formula (to calculate distance in meters)
// function haversineDistance(lat1, lon1, lat2, lon2) {
//   const R = 6371000; // radius of Earth in meters
//   const toRad = (deg) => (deg * Math.PI) / 180;
//   const dLat = toRad(lat2 - lat1);
//   const dLon = toRad(lon2 - lon1);

//   const a =
//     Math.sin(dLat / 2) ** 2 +
//     Math.cos(toRad(lat1)) *
//       Math.cos(toRad(lat2)) *
//       Math.sin(dLon / 2) ** 2;

//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   return Math.round(R * c); // rounded to nearest meter
// }

// // ✅ Check-In Controller
// exports.checkIn = async (req, res) => {
//   try {
//     const { employeeId, employeeEmail, latitude, longitude } = req.body;

//     if (!employeeId)
//       return res.status(400).json({ message: "Employee ID required" });
//     if (!latitude || !longitude)
//       return res.status(400).json({ message: "Latitude/Longitude required" });

//     const userLat = parseFloat(latitude);
//     const userLng = parseFloat(longitude);

//     // 🧭 Calculate distance & onsite status
//     const distance = haversineDistance(
//       OFFICE_COORDS.lat,
//       OFFICE_COORDS.lng,
//       userLat,
//       userLng
//     );
//     const onsite = distance <= ONSITE_RADIUS_M;

//     // 🪵 Debug Logs
//     console.log("Office:", OFFICE_COORDS);
//     console.log("User:", { userLat, userLng });
//     console.log("Distance (m):", distance);
//     console.log("Onsite:", onsite);

//     // ✅ Save Check-In Record
//     const attendance = await Attendance.create({
//       employeeId,
//       employeeEmail,
//       checkInTime: new Date(),
//       latitude: userLat,
//       longitude: userLng,
//       distance,
//       onsite,
//       status: "checked-in",
//     });

//     res.status(200).json({
//       message: onsite
//         ? `✅ Check-In successful (Onsite: ${distance}m away)`
//         : `🚫 Check-In successful (Offsite: ${distance}m away)`,
//       attendance,
//     });
//   } catch (err) {
//     console.error("❌ Check-In Error:", err);
//     res.status(500).json({ message: "Check-In failed", error: err.message });
//   }
// };

// // ✅ Check-Out Controller
// exports.checkOut = async (req, res) => {
//   try {
//     const { employeeId, employeeEmail, latitude, longitude } = req.body;

//     if (!employeeId)
//       return res.status(400).json({ message: "Employee ID required" });
//     if (!latitude || !longitude)
//       return res.status(400).json({ message: "Latitude/Longitude required" });

//     const userLat = parseFloat(latitude);
//     const userLng = parseFloat(longitude);

//     const distance = haversineDistance(
//       OFFICE_COORDS.lat,
//       OFFICE_COORDS.lng,
//       userLat,
//       userLng
//     );
//     const onsite = distance <= ONSITE_RADIUS_M;

//     // 🪵 Debug Logs
//     console.log("Office:", OFFICE_COORDS);
//     console.log("User:", { userLat, userLng });
//     console.log("Distance (m):", distance);
//     console.log("Onsite:", onsite);

//     const startOfToday = new Date();
//     startOfToday.setHours(0, 0, 0, 0);

//     const attendance = await Attendance.findOne({
//       employeeId,
//       status: "checked-in",
//       checkInTime: { $gte: startOfToday },
//     }).sort({ checkInTime: -1 });

//     if (!attendance)
//       return res
//         .status(400)
//         .json({ message: "No check-in record found for today" });

//     const checkOutTime = new Date();
//     const totalHours = (checkOutTime - attendance.checkInTime) / 1000 / 3600;

//     attendance.checkOutTime = checkOutTime;
//     attendance.distance = distance;
//     attendance.onsite = onsite;
//     attendance.totalHours = parseFloat(totalHours.toFixed(2));
//     attendance.status = "checked-out";

//     await attendance.save();

//     res.status(200).json({
//       message: onsite
//         ? `✅ Check-Out successful (Onsite: ${distance}m away)`
//         : `🚫 Check-Out successful (Offsite: ${distance}m away)`,
//       attendance,
//     });
//   } catch (err) {
//     console.error("❌ Check-Out Error:", err);
//     res.status(500).json({ message: "Check-Out failed", error: err.message });
//   }
// };

// // ✅ Get Attendance for One Employee
// exports.getEmployeeAttendance = async (req, res) => {
//   try {
//     const { employeeId } = req.params;

//     if (!employeeId)
//       return res.status(400).json({ message: "Employee ID is required" });

//     const records = await Attendance.find({ employeeId }).sort({
//       checkInTime: -1,
//     });

//     res.status(200).json({
//       message: "Employee attendance records fetched successfully",
//       records,
//     });
//   } catch (err) {
//     console.error("Get Employee Attendance error:", err);
//     res.status(500).json({
//       message: "Failed to fetch attendance records",
//       error: err.message,
//     });
//   }
// };

// // ✅ Get All Attendance
// exports.getAllAttendance = async (req, res) => {
//   try {
//     const records = await Attendance.find().sort({ checkInTime: -1 });

//     res.status(200).json({
//       message: "All employee attendance records fetched successfully",
//       records,
//     });
//   } catch (err) {
//     console.error("Get All Attendance error:", err);
//     res.status(500).json({
//       message: "Failed to fetch attendance records",
//       error: err.message,
//     });
//   }
// };

// // ✅ Get Today's Attendance
// exports.getTodayAttendance = async (req, res) => {
//   try {
//     const todayStart = new Date();
//     todayStart.setHours(0, 0, 0, 0);
//     const todayEnd = new Date();
//     todayEnd.setHours(23, 59, 59, 999);

//     const records = await Attendance.find({
//       checkInTime: { $gte: todayStart, $lte: todayEnd },
//     }).sort({ checkInTime: -1 });

//     res.status(200).json({
//       message: "Today's attendance records fetched successfully",
//       records,
//     });
//   } catch (err) {
//     console.error("Get Today Attendance error:", err);
//     res.status(500).json({
//       message: "Failed to fetch today's attendance",
//       error: err.message,
//     });
//   }
// };

// // ✅ Get Late Attendance
// exports.getLateAttendance = async (req, res) => {
//   try {
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     const tenAM = new Date(today);
//     tenAM.setHours(10, 0, 0, 0);

//     const lateRecords = await Attendance.find({
//       checkInTime: { $gte: tenAM },
//       createdAt: { $gte: today },
//     }).sort({ checkInTime: 1 });

//     res.status(200).json({
//       message: "Late attendance records fetched successfully",
//       records: lateRecords,
//     });
//   } catch (err) {
//     console.error("Get Late Attendance error:", err);
//     res.status(500).json({
//       message: "Failed to fetch late attendance records",
//       error: err.message,
//     });
//   }
// };

// // ✅ Attendance Summary API (for Dashboard)
// exports.getAttendanceSummary = async (req, res) => {
//   try {
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     const endOfDay = new Date();
//     endOfDay.setHours(23, 59, 59, 999);

//     // 1️⃣ Count all employees
//     const totalEmployees = await Employee.countDocuments();

//     // 2️⃣ Get today's attendance
//     const todayRecords = await Attendance.find({
//       checkInTime: { $gte: today, $lte: endOfDay },
//     });

//     const presentToday = todayRecords.length;

//     // 3️⃣ Late employees (check-in after 10 AM)
//     const tenAM = new Date(today);
//     tenAM.setHours(10, 0, 0, 0);

//     const lateToday = todayRecords.filter(
//       (rec) => new Date(rec.checkInTime) >= tenAM
//     ).length;

//     // 4️⃣ Absent = total - present
//     const absentToday = Math.max(totalEmployees - presentToday, 0);

//     // 5️⃣ Attendance Rate %
//     const attendanceRate = totalEmployees
//       ? ((presentToday / totalEmployees) * 100).toFixed(1)
//       : 0;

//     res.status(200).json({
//       message: "Attendance summary fetched successfully",
//       totals: {
//         employees: totalEmployees,
//         presentToday,
//         absentToday,
//         lateToday,
//         attendanceRate,
//       },
//     });
//   } catch (err) {
//     console.error("❌ Attendance Summary Error:", err);
//     res.status(500).json({
//       message: "Failed to fetch attendance summary",
//       error: err.message,
//     });
//   }
// };


// const Attendance = require("../models/Attendance");
// const Employee = require("../models/Employee");

// const OFFICE_COORDS = { lat: 17.448294, lng: 78.391487 };
// const ONSITE_RADIUS_M = 50;

// function haversineDistance(lat1, lon1, lat2, lon2) {
//   const R = 6371000;
//   const toRad = (deg) => (deg * Math.PI) / 180;
//   const dLat = toRad(lat2 - lat1);
//   const dLon = toRad(lon2 - lon1);
//   const a =
//     Math.sin(dLat / 2) ** 2 +
//     Math.cos(toRad(lat1)) *
//       Math.cos(toRad(lat2)) *
//       Math.sin(dLon / 2) ** 2;
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   return Math.round(R * c);
// }

// exports.checkIn = async (req, res) => {
//   try {
//     const { employeeId, employeeEmail, latitude, longitude } = req.body;
//     if (!employeeId || !employeeEmail)
//       return res.status(400).json({ message: "Employee data missing" });
//     if (!latitude || !longitude)
//       return res.status(400).json({ message: "Latitude/Longitude required" });

//     const userLat = parseFloat(latitude);
//     const userLng = parseFloat(longitude);

//     const distance = haversineDistance(
//       OFFICE_COORDS.lat,
//       OFFICE_COORDS.lng,
//       userLat,
//       userLng
//     );
//     const onsite = distance <= ONSITE_RADIUS_M;

//     // ✅ Check if employee already checked-in today
//     const startOfToday = new Date();
//     startOfToday.setHours(0, 0, 0, 0);

//     const existing = await Attendance.findOne({
//       employeeId,
//       checkInTime: { $gte: startOfToday },
//       status: "checked-in",
//     });

//     if (existing)
//       return res
//         .status(400)
//         .json({ message: "Already checked-in for today" });

//     // ✅ Create new check-in record
//     const attendance = await Attendance.create({
//       employeeId,
//       employeeEmail,
//       checkInTime: new Date(),
//       latitude: userLat,
//       longitude: userLng,
//       distance,
//       onsite,
//       status: "checked-in",
//     });

//     res.status(200).json({
//       message: onsite
//         ? `✅ Check-In successful (Onsite: ${distance}m away)`
//         : `✅ Check-In successful (Outside: ${distance}m away)`,
//       attendance,
//     });
//   } catch (err) {
//     console.error("Check-In Error:", err);
//     res.status(500).json({ message: "Check-In failed", error: err.message });
//   }
// };


// // ---------------- Check-Out ----------------
// exports.checkOut = async (req, res) => {
//   try {
//     const { employeeId, latitude, longitude } = req.body;
//     if (!employeeId || !latitude || !longitude)
//       return res.status(400).json({ message: "Missing required data" });

//     const startOfToday = new Date();
//     startOfToday.setHours(0, 0, 0, 0);

//     const attendance = await Attendance.findOne({
//       employeeId,
//       status: "checked-in",
//       checkInTime: { $gte: startOfToday },
//     }).sort({ checkInTime: -1 });

//     if (!attendance)
//       return res.status(400).json({ message: "❌ No check-in found for today" });

//     const distance = haversineDistance(latitude, longitude, OFFICE_COORDS.lat, OFFICE_COORDS.lng);
//     const onsite = distance <= ONSITE_RADIUS_M;

//     attendance.checkOutTime = new Date();
//     attendance.totalHours = parseFloat(((attendance.checkOutTime - attendance.checkInTime) / 3600000).toFixed(2));
//     attendance.distance = distance;
//     attendance.onsite = onsite;
//     attendance.status = "checked-out";

//     await attendance.save();

//     res.status(200).json({
//       message: onsite ? `✅ Checked out onsite (${distance} m)` : `🚫 Checked out offsite (${distance} m)`,
//       attendance,
//     });
//   } catch (err) {
//     console.error("Check-Out Error:", err);
//     res.status(500).json({ message: "Check-Out failed", error: err.message });
//   }
// };


// // ✅ Get Attendance for One Employee
// exports.getEmployeeAttendance = async (req, res) => {
//   try {
//     const { employeeId } = req.params;
//     if (!employeeId)
//       return res.status(400).json({ message: "Employee ID required" });

//     const records = await Attendance.find({ employeeId }).sort({
//       checkInTime: -1,
//     });

//     res.status(200).json({
//       message: "Employee attendance fetched successfully",
//       records,
//     });
//   } catch (err) {
//     console.error("Get Employee Attendance Error:", err);
//     res.status(500).json({ message: "Failed to fetch attendance", error: err.message });
//   }
// };

// // ✅ Get All Attendance
// exports.getAllAttendance = async (req, res) => {
//   try {
//     const records = await Attendance.find().sort({ checkInTime: -1 });
//     res.status(200).json({
//       message: "All attendance records fetched successfully",
//       records,
//     });
//   } catch (err) {
//     console.error("Get All Attendance Error:", err);
//     res.status(500).json({ message: "Failed to fetch attendance", error: err.message });
//   }
// };

// // ✅ Get Today's Attendance
// exports.getTodayAttendance = async (req, res) => {
//   try {
//     const todayStart = new Date();
//     todayStart.setHours(0, 0, 0, 0);
//     const todayEnd = new Date();
//     todayEnd.setHours(23, 59, 59, 999);

//     const records = await Attendance.find({
//       checkInTime: { $gte: todayStart, $lte: todayEnd },
//     }).sort({ checkInTime: -1 });

//     res.status(200).json({
//       message: "Today's attendance fetched successfully",
//       records,
//     });
//   } catch (err) {
//     console.error("Get Today Attendance Error:", err);
//     res.status(500).json({ message: "Failed to fetch today's attendance", error: err.message });
//   }
// };

// // ✅ Late Attendance
// exports.getLateAttendance = async (req, res) => {
//   try {
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     const tenAM = new Date(today);
//     tenAM.setHours(10, 0, 0, 0);

//     const lateRecords = await Attendance.find({
//       checkInTime: { $gte: tenAM },
//       createdAt: { $gte: today },
//     }).sort({ checkInTime: 1 });

//     res.status(200).json({
//       message: "Late attendance fetched successfully",
//       records: lateRecords,
//     });
//   } catch (err) {
//     console.error("Get Late Attendance Error:", err);
//     res.status(500).json({ message: "Failed to fetch late attendance", error: err.message });
//   }
// };

// // ✅ Attendance Summary
// exports.getAttendanceSummary = async (req, res) => {
//   try {
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     const endOfDay = new Date();
//     endOfDay.setHours(23, 59, 59, 999);

//     const totalEmployees = await Employee.countDocuments();
//     const todayRecords = await Attendance.find({
//       checkInTime: { $gte: today, $lte: endOfDay },
//     });

//     const presentToday = todayRecords.length;

//     const tenAM = new Date(today);
//     tenAM.setHours(10, 0, 0, 0);

//     const lateToday = todayRecords.filter(
//       (rec) => new Date(rec.checkInTime) >= tenAM
//     ).length;

//     const absentToday = Math.max(totalEmployees - presentToday, 0);
//     const attendanceRate = totalEmployees
//       ? ((presentToday / totalEmployees) * 100).toFixed(1)
//       : 0;

//     res.status(200).json({
//       message: "Attendance summary fetched successfully",
//       totals: {
//         employees: totalEmployees,
//         presentToday,
//         absentToday,
//         lateToday,
//         attendanceRate,
//       },
//     });
//   } catch (err) {
//     console.error("❌ Attendance Summary Error:", err);
//     res.status(500).json({ message: "Failed to fetch summary", error: err.message });
//   }
// };


const Attendance = require("../models/Attendance");
const Employee = require("../models/Employee");

const OFFICE_COORDS = { lat: 17.448294, lng: 78.391487 };
const ONSITE_RADIUS_M = 600;

// Haversine formula
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// ---------------- Check-In ----------------
exports.checkIn = async (req, res) => {
  try {
    const { employeeId, employeeEmail, latitude, longitude } = req.body;
    if (!employeeId || !employeeEmail)
      return res.status(400).json({ message: "Employee data missing" });
    if (!latitude || !longitude)
      return res.status(400).json({ message: "Latitude/Longitude required" });

    const userLat = parseFloat(latitude);
    const userLng = parseFloat(longitude);

    const distance = haversineDistance(
      OFFICE_COORDS.lat,
      OFFICE_COORDS.lng,
      userLat,
      userLng
    );
    const onsite = distance <= ONSITE_RADIUS_M;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const existing = await Attendance.findOne({
      employeeId,
      checkInTime: { $gte: startOfToday },
      status: "checked-in",
    });

    if (existing)
      return res
        .status(400)
        .json({ message: "Already checked-in for today" });

    const attendance = await Attendance.create({
      employeeId,
      employeeEmail,
      checkInTime: new Date(),
      latitude: userLat,
      longitude: userLng,
      distance,
      onsite,
      status: "checked-in",
    });

    res.status(200).json({
      message: onsite
        ? `✅ Check-In successful (Onsite: ${distance}m away)`
        : `✅ Check-In successful (Outside: ${distance}m away)`,
      attendance,
    });
  } catch (err) {
    console.error("Check-In Error:", err);
    res.status(500).json({ message: "Check-In failed", error: err.message });
  }
};

// ---------------- Check-Out ----------------
exports.checkOut = async (req, res) => {
  try {
    const { employeeId, latitude, longitude } = req.body;
    if (!employeeId)
      return res.status(400).json({ message: "Employee ID required" });
    if (!latitude || !longitude)
      return res.status(400).json({ message: "Latitude/Longitude required" });

    const userLat = parseFloat(latitude);
    const userLng = parseFloat(longitude);

    const distance = haversineDistance(
      OFFICE_COORDS.lat,
      OFFICE_COORDS.lng,
      userLat,
      userLng
    );
    const onsite = distance <= ONSITE_RADIUS_M;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      employeeId,
      checkInTime: { $gte: startOfToday },
      status: "checked-in",
    });

    if (!attendance)
      return res.status(400).json({ message: "No check-in found for today" });

    attendance.checkOutTime = new Date();
    attendance.distance = distance;
    attendance.onsite = onsite;
    attendance.status = "checked-out";
    attendance.totalHours =
      (attendance.checkOutTime - attendance.checkInTime) / 1000 / 3600;

    await attendance.save();

    res.status(200).json({
      message: onsite
        ? `✅ Check-Out successful (Onsite: ${distance}m away)`
        : `✅ Check-Out successful (Outside: ${distance}m away)`,
      attendance,
    });
  } catch (err) {
    console.error("Check-Out Error:", err);
    res.status(500).json({ message: "Check-Out failed", error: err.message });
  }
};

// ---------------- Employee Attendance ----------------
exports.getEmployeeAttendance = async (req, res) => {
  try {
    const { employeeId } = req.params;
    if (!employeeId)
      return res.status(400).json({ message: "Employee ID required" });

    const records = await Attendance.find({ employeeId }).sort({
      checkInTime: -1,
    });

    res.status(200).json({
      message: "Employee attendance fetched successfully",
      records,
    });
  } catch (err) {
    console.error("Get Employee Attendance Error:", err);
    res.status(500).json({
      message: "Failed to fetch attendance",
      error: err.message,
    });
  }
};

// ---------------- All Attendance ----------------
exports.getAllAttendance = async (req, res) => {
  try {
    const records = await Attendance.find().sort({ checkInTime: -1 });
    res.status(200).json({
      message: "All attendance records fetched successfully",
      records,
    });
  } catch (err) {
    console.error("Get All Attendance Error:", err);
    res.status(500).json({ message: "Failed to fetch attendance", error: err.message });
  }
};

// ---------------- Today's Attendance ----------------
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
      message: "Today's attendance fetched successfully",
      records,
    });
  } catch (err) {
    console.error("Get Today Attendance Error:", err);
    res.status(500).json({ message: "Failed to fetch today's attendance", error: err.message });
  }
};

// ✅ Get Absent Today
exports.getAbsentToday = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Employees who checked in today
    const attendanceToday = await Attendance.find({
      checkInTime: { $gte: todayStart, $lte: todayEnd },
    }).select("employeeId");

    const presentEmployeeIds = attendanceToday.map((rec) => rec.employeeId);

    // Employees who are NOT present today
    const absentEmployees = await Employee.find({
      _id: { $nin: presentEmployeeIds },
    });

    res.status(200).json({
      message: "Absent employees fetched successfully",
      records: absentEmployees,
    });
  } catch (err) {
    console.error("Get Absent Today Error:", err);
    res.status(500).json({ message: "Failed to fetch absent employees", error: err.message });
  }
};
// ---------------- Late Attendance ----------------
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
      message: "Late attendance fetched successfully",
      records: lateRecords,
    });
  } catch (err) {
    console.error("Get Late Attendance Error:", err);
    res.status(500).json({ message: "Failed to fetch late attendance", error: err.message });
  }
};

// ---------------- Attendance Summary ----------------
exports.getAttendanceSummary = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const totalEmployees = await Employee.countDocuments();
    const todayRecords = await Attendance.find({
      checkInTime: { $gte: today, $lte: endOfDay },
    });

    const presentToday = todayRecords.length;
    const tenAM = new Date(today);
    tenAM.setHours(10, 0, 0, 0);

    const lateToday = todayRecords.filter(
      (rec) => new Date(rec.checkInTime) >= tenAM
    ).length;

    const absentToday = Math.max(totalEmployees - presentToday, 0);
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
    res.status(500).json({ message: "Failed to fetch summary", error: err.message });
  }
};
