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


// const Attendance = require("../models/Attendance");
// const Employee = require("../models/Employee");

// const OFFICE_COORDS = { lat: 17.448294, lng: 78.391487 };
// const ONSITE_RADIUS_M = 600;

// // Haversine formula
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

// // ---------------- Check-In ----------------
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

//     const startOfToday = new Date();
//     startOfToday.setHours(0, 0, 0, 0);

//     const attendance = await Attendance.findOne({
//       employeeId,
//       checkInTime: { $gte: startOfToday },
//       status: "checked-in",
//     });

//     if (!attendance)
//       return res.status(400).json({ message: "No check-in found for today" });

//     attendance.checkOutTime = new Date();
//     attendance.distance = distance;
//     attendance.onsite = onsite;
//     attendance.status = "checked-out";
//     attendance.totalHours =
//       (attendance.checkOutTime - attendance.checkInTime) / 1000 / 3600;

//     await attendance.save();

//     res.status(200).json({
//       message: onsite
//         ? `✅ Check-Out successful (Onsite: ${distance}m away)`
//         : `✅ Check-Out successful (Outside: ${distance}m away)`,
//       attendance,
//     });
//   } catch (err) {
//     console.error("Check-Out Error:", err);
//     res.status(500).json({ message: "Check-Out failed", error: err.message });
//   }
// };

// // ---------------- Employee Attendance ----------------
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
//     res.status(500).json({
//       message: "Failed to fetch attendance",
//       error: err.message,
//     });
//   }
// };

// // ---------------- All Attendance ----------------
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

// // ---------------- Today's Attendance ----------------
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

// // ✅ Get Absent Today
// exports.getAbsentToday = async (req, res) => {
//   try {
//     const todayStart = new Date();
//     todayStart.setHours(0, 0, 0, 0);

//     const todayEnd = new Date();
//     todayEnd.setHours(23, 59, 59, 999);

//     // Employees who checked in today
//     const attendanceToday = await Attendance.find({
//       checkInTime: { $gte: todayStart, $lte: todayEnd },
//     }).select("employeeId");

//     const presentEmployeeIds = attendanceToday.map((rec) => rec.employeeId);

//     // Employees who are NOT present today
//     const absentEmployees = await Employee.find({
//       _id: { $nin: presentEmployeeIds },
//     });

//     res.status(200).json({
//       message: "Absent employees fetched successfully",
//       records: absentEmployees,
//     });
//   } catch (err) {
//     console.error("Get Absent Today Error:", err);
//     res.status(500).json({ message: "Failed to fetch absent employees", error: err.message });
//   }
// };
// // ---------------- Late Attendance ----------------
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

// // // ---------------- SUMMARY ----------------
// exports.getAttendanceSummary = async (req, res) => {
//   try {
//     const attendance = await Attendance.find();

//     // --------------------------
//     // Helpers
//     // --------------------------
//     const isToday = (date) => {
//       const today = new Date();
//       return (
//         date.getDate() === today.getDate() &&
//         date.getMonth() === today.getMonth() &&
//         date.getFullYear() === today.getFullYear()
//       );
//     };

//     const isThisWeek = (date) => {
//       const today = new Date();
//       const firstDay = new Date(today.setDate(today.getDate() - today.getDay()));
//       const lastDay = new Date(today.setDate(today.getDate() - today.getDay() + 6));
//       return date >= firstDay && date <= lastDay;
//     };

//     const isThisMonth = (date) => {
//       const today = new Date();
//       return (
//         date.getMonth() === today.getMonth() &&
//         date.getFullYear() === today.getFullYear()
//       );
//     };

//     // --------------------------
//     // Half Day / Full Day Logic FIXED
//     // --------------------------
//     const isHalfDay = (h) => h >= 4.5 && h < 9;
//     const isFullDay = (h) => h >= 9;

//     // Utility: extract hours safely
//     const getHours = (att) => Number(att.totalHours || 0);

//     // --------------------------
//     // TODAY STATS
//     // --------------------------
//     const todayAttendance = attendance.filter(a => isToday(a.checkInTime));
//     const todayHalf = todayAttendance.filter(a => isHalfDay(getHours(a))).length;
//     const todayFull = todayAttendance.filter(a => isFullDay(getHours(a))).length;
//     const todayWorking = todayFull + todayHalf * 0.5;

//     // --------------------------
//     // WEEKLY STATS
//     // --------------------------
//     const weekAttendance = attendance.filter(a => isThisWeek(a.checkInTime));
//     const weekHalf = weekAttendance.filter(a => isHalfDay(getHours(a))).length;
//     const weekFull = weekAttendance.filter(a => isFullDay(getHours(a))).length;
//     const weekWorking = weekFull + weekHalf * 0.5;

//     // --------------------------
//     // MONTHLY STATS
//     // --------------------------
//     const monthAttendance = attendance.filter(a => isThisMonth(a.checkInTime));
//     const monthHalf = monthAttendance.filter(a => isHalfDay(getHours(a))).length;
//     const monthFull = monthAttendance.filter(a => isFullDay(getHours(a))).length;
//     const monthWorking = monthFull + monthHalf * 0.5;

//     res.status(200).json({
//       success: true,

//       today: {
//         present: todayAttendance.length,
//         halfDay: todayHalf,
//         fullDay: todayFull,
//         workingDays: todayWorking,
//       },

//       weekly: {
//         present: weekAttendance.length,
//         halfDay: weekHalf,
//         fullDay: weekFull,
//         workingDays: weekWorking,
//       },

//       monthly: {
//         present: monthAttendance.length,
//         halfDay: monthHalf,
//         fullDay: monthFull,
//         workingDays: monthWorking,
//       }
//     });

//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };


// const Attendance = require("../models/Attendance");
// const Employee = require("../models/Employee");

// // Config
// const shifts = {
//   A: "10:00",
//   B: "09:00",
//   C: "07:00",
//   D: "06:30",
//   E: "14:00",
//   F: "08:00",
//   G: "10:30",
//   H: "07:00",
//   I: "11:00",
// };
// const OFFICE_COORDS = { lat: 17.448294, lng: 78.391487 }; // fallback
// const ONSITE_RADIUS_M = 50; // keep your expected value

// // Haversine
// function haversineDistance(lat1, lon1, lat2, lon2) {
//   const R = 6371000;
//   const toRad = (deg) => (deg * Math.PI) / 180;
//   const dLat = toRad(lat2 - lat1);
//   const dLon = toRad(lon2 - lon1);
//   const a =
//     Math.sin(dLat / 2) ** 2 +
//     Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   return Math.round(R * c);
// }

// // ---------------- CHECK-IN ----------------
// exports.checkIn = async (req, res) => {
//   try {
//     console.log("CHECKIN REQ BODY:", req.body);

//     let { employeeId, employeeEmail, latitude, longitude, reason, shiftCode } = req.body;

//     // basic validation
//     if (!employeeId || !employeeEmail) {
//       console.log("Missing employeeId or employeeEmail");
//       return res.status(400).json({ message: "Employee ID and email required" });
//     }
//     if (latitude == null || longitude == null) {
//       console.log("Missing lat/lng");
//       return res.status(400).json({ message: "Latitude & Longitude required" });
//     }

//     // convert & validate numbers
//     latitude = parseFloat(latitude);
//     longitude = parseFloat(longitude);
//     if (!isFinite(latitude) || !isFinite(longitude)) {
//       console.log("Invalid lat/lng:", latitude, longitude);
//       return res.status(400).json({ message: "Latitude & Longitude must be valid numbers" });
//     }

//     // fetch employee (populate location)
//     const employee = await Employee.findOne({ employeeId }).populate("location");
//     if (!employee) {
//       console.log("Employee not found:", employeeId);
//       return res.status(404).json({ message: "Employee not found" });
//     }

//     // location fallback
//     const assigned = employee.location;
//     const locLat = assigned && isFinite(assigned.latitude) ? assigned.latitude : OFFICE_COORDS.lat;
//     const locLng = assigned && isFinite(assigned.longitude) ? assigned.longitude : OFFICE_COORDS.lng;
//     const officeName = assigned?.name || "Default Office";

//     // distance + onsite
//     const distance = haversineDistance(locLat, locLng, latitude, longitude);
//     const onsite = distance <= ONSITE_RADIUS_M;

//     // check duplicate for same day (use full day range)
//     const todayStart = new Date();
//     todayStart.setHours(0, 0, 0, 0);
//     const todayEnd = new Date();
//     todayEnd.setHours(23, 59, 59, 999);

//     const existing = await Attendance.findOne({
//       employeeId,
//       checkInTime: { $gte: todayStart, $lte: todayEnd },
//       status: "checked-in",
//     });

//     if (existing) {
//       console.log("Already checked-in record exists:", existing._id);
//       return res.status(400).json({ message: "Already checked-in for today" });
//     }

//     // shift -> default A if not provided
//     const workingShift = shiftCode && shifts[shiftCode] ? shiftCode : "A";
//     const [shH, shM] = shifts[workingShift].split(":").map((n) => Number(n));
//     const shiftStart = new Date();
//     shiftStart.setHours(shH, shM, 0, 0);
//     const graceMin = 5;
//     const shiftWithGrace = new Date(shiftStart.getTime() + graceMin * 60000);
//     const lateToday = new Date() > shiftWithGrace;

//     // create attendance (fields must match Attendance schema)
//     const attendance = await Attendance.create({
//       employeeId: employee.employeeId,
//       employeeEmail: employee.email || employeeEmail,
//       name: employee.name || "Unknown",
//       shiftCode: workingShift,
//       lateToday,
//       checkInTime: new Date(),
//       latitude,
//       longitude,
//       distance,
//       onsite,
//       officeName,
//       status: "checked-in",
//       reason: reason || undefined,
//     });

//     console.log("Check-in created:", attendance._id);
//     return res.status(200).json({
//       message: "Check-in successful",
//       lateToday,
//       onsite,
//       distance,
//       attendance,
//     });
//   } catch (err) {
//     console.error("CHECK-IN ERROR:", err);
//     return res.status(500).json({ message: "Check-In failed", error: err.message });
//   }
// };

// // ---------------- CHECK-OUT ----------------
// exports.checkOut = async (req, res) => {
//   try {
//     console.log("CHECKOUT REQ BODY:", req.body);
//     let { employeeId, latitude, longitude, reason } = req.body;

//     if (!employeeId) {
//       return res.status(400).json({ message: "Employee ID required" });
//     }
//     if (latitude == null || longitude == null) {
//       return res.status(400).json({ message: "Latitude & Longitude required" });
//     }

//     latitude = parseFloat(latitude);
//     longitude = parseFloat(longitude);
//     if (!isFinite(latitude) || !isFinite(longitude)) {
//       return res.status(400).json({ message: "Latitude & Longitude must be valid numbers" });
//     }

//     const employee = await Employee.findOne({ employeeId }).populate("location");
//     if (!employee) return res.status(404).json({ message: "Employee not found" });

//     const assigned = employee.location;
//     const locLat = assigned && isFinite(assigned.latitude) ? assigned.latitude : OFFICE_COORDS.lat;
//     const locLng = assigned && isFinite(assigned.longitude) ? assigned.longitude : OFFICE_COORDS.lng;

//     const distance = haversineDistance(locLat, locLng, latitude, longitude);
//     const onsite = distance <= ONSITE_RADIUS_M;

//     const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
//     const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);

//     const record = await Attendance.findOne({
//       employeeId,
//       checkInTime: { $gte: todayStart, $lte: todayEnd },
//       status: "checked-in",
//     });

//     if (!record) {
//       console.log("No check-in found for:", employeeId);
//       return res.status(400).json({ message: "No check-in found for today" });
//     }

//     const checkOutTime = new Date();
//     const totalHours = ((checkOutTime - new Date(record.checkInTime)) / (1000 * 60 * 60)).toFixed(2);

//     const updated = await Attendance.findByIdAndUpdate(
//       record._id,
//       {
//         checkOutTime,
//         totalHours: Number(totalHours),
//         status: "checked-out",
//         latitude,
//         longitude,
//         distance,
//         onsite,
//         reason: onsite ? record.reason : reason || record.reason || "No reason provided",
//       },
//       { new: true }
//     );

//     console.log("Check-out updated:", updated._id);
//     return res.status(200).json({ message: "Check-out successful", attendance: updated });
//   } catch (err) {
//     console.error("CHECK-OUT ERROR:", err);
//     return res.status(500).json({ message: "Check-Out failed", error: err.message });
//   }
// };

// // ---------------- GET EMPLOYEE ATTENDANCE ----------------
// exports.getEmployeeAttendance = async (req,res)=>{
//   try{
//     const { employeeId } = req.params;
//     const records = await Attendance.find({ employeeId }).sort({ checkInTime:-1 });
//     res.status(200).json({ records });
//   }catch(err){
//     res.status(500).json({message:"Error", error:err.message});
//   }
// };

// // ---------------- ALL ATTENDANCE ----------------
// exports.getAllAttendance = async (req,res)=>{
//   try{
//     const records = await Attendance.find().sort({ checkInTime:-1 });
//     res.status(200).json({ records });
//   }catch(err){
//     res.status(500).json({message:"Error", error:err.message});
//   }
// };

// // ---------------- TODAY ATTENDANCE ----------------
// exports.getTodayAttendance = async (req,res)=>{
//   try{
//     const start = new Date(); start.setHours(0,0,0,0);
//     const end = new Date(); end.setHours(23,59,59,999);
//     const records = await Attendance.find({ checkInTime:{ $gte:start, $lte:end } }).sort({ checkInTime:-1 });
//     res.status(200).json({ records });
//   }catch(err){
//     res.status(500).json({message:"Error", error:err.message});
//   }
// };

// // ---------------- LATE ATTENDANCE ----------------
// exports.getLateAttendance = async (req,res)=>{
//   try{
//     const start = new Date(); start.setHours(0,0,0,0);
//     const end = new Date(); end.setHours(23,59,59,999);
//     const records = await Attendance.find({ lateToday:true, checkInTime:{ $gte:start, $lte:end } }).sort({ checkInTime:1 });
//     res.status(200).json({ records });
//   }catch(err){
//     res.status(500).json({message:"Error", error:err.message});
//   }
// };

// // ---------------- ABSENT TODAY ----------------
// exports.getAbsentToday = async (req,res)=>{
//   try{
//     const start = new Date(); start.setHours(0,0,0,0);
//     const end = new Date(); end.setHours(23,59,59,999);

//     const attended = await Attendance.find({ checkInTime:{ $gte:start, $lte:end } });
//     const presentIds = attended.map(a=>a.employeeId);

//     const absent = await Employee.find({ employeeId: { $nin: presentIds } });
//     res.status(200).json({ records: absent });
//   }catch(err){
//     res.status(500).json({message:"Error", error:err.message});
//   }
// };

// // ---------------- SUMMARY ----------------
// exports.getAttendanceSummary = async (req,res)=>{
//   try{
//     const attendance = await Attendance.find();

//     const isToday = date => {
//       const t = new Date();
//       return date.getDate()===t.getDate() && date.getMonth()===t.getMonth() && date.getFullYear()===t.getFullYear();
//     };

//     const isThisWeek = date => {
//       const t = new Date();
//       const firstDay = new Date(t.setDate(t.getDate()-t.getDay()));
//       const lastDay = new Date(t.setDate(t.getDate()-t.getDay()+6));
//       return date>=firstDay && date<=lastDay;
//     };

//     const isThisMonth = date => {
//       const t = new Date();
//       return date.getMonth()===t.getMonth() && date.getFullYear()===t.getFullYear();
//     };

//     const isHalfDay = h => h>=4.5 && h<9;
//     const isFullDay = h => h>=9;
//     const getHours = att => Number(att.totalHours || 0);

//     const todayAttendance = attendance.filter(a=>isToday(a.checkInTime));
//     const todayHalf = todayAttendance.filter(a=>isHalfDay(getHours(a))).length;
//     const todayFull = todayAttendance.filter(a=>isFullDay(getHours(a))).length;
//     const todayWorking = todayFull + todayHalf*0.5;

//     const weekAttendance = attendance.filter(a=>isThisWeek(a.checkInTime));
//     const weekHalf = weekAttendance.filter(a=>isHalfDay(getHours(a))).length;
//     const weekFull = weekAttendance.filter(a=>isFullDay(getHours(a))).length;
//     const weekWorking = weekFull + weekHalf*0.5;

//     const monthAttendance = attendance.filter(a=>isThisMonth(a.checkInTime));
//     const monthHalf = monthAttendance.filter(a=>isHalfDay(getHours(a))).length;
//     const monthFull = monthAttendance.filter(a=>isFullDay(getHours(a))).length;
//     const monthWorking = monthFull + monthHalf*0.5;

//     res.status(200).json({
//       success:true,
//       today:{ present: todayAttendance.length, halfDay: todayHalf, fullDay: todayFull, workingDays: todayWorking },
//       weekly:{ present: weekAttendance.length, halfDay: weekHalf, fullDay: weekFull, workingDays: weekWorking },
//       monthly:{ present: monthAttendance.length, halfDay: monthHalf, fullDay: monthFull, workingDays: monthWorking }
//     });
//   }catch(err){
//     res.status(500).json({message:"Error", error:err.message});
//   }
// };

const Attendance = require("../models/Attendance");
const Employee = require("../models/Employee");
// const Shift = require("../models/Shift"); // Assuming Shift model exists
const Location = require("../models/Location");
const { logActivity } = require("./userActivity.controller");


// Constants
const ONSITE_RADIUS_M = 50; // 50 meters

// Haversine distance function
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // meters
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

exports.checkIn = async (req, res) => {
  try {
    const { employeeId, employeeEmail, latitude, longitude, reason } = req.body;

    // Required fields check
    if (!employeeId || !employeeEmail || !latitude || !longitude) {
      return res.status(400).json({ message: "Employee ID, email, and location are required" });
    }

    // Get employee with assigned location
    const employee = await Employee.findOne({ employeeId }).populate("location");
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const assignedLocation = employee.location;
    if (!assignedLocation) {
      return res.status(404).json({ message: "No location assigned to employee" });
    }

    // Calculate distance
    const distance = haversineDistance(
      assignedLocation.latitude,
      assignedLocation.longitude,
      latitude,
      longitude
    );

    const onsite = distance <= ONSITE_RADIUS_M;

    // Check if already checked in today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const existingCheckIn = await Attendance.findOne({
      employeeId,
      checkInTime: { $gte: startOfToday },
      status: "checked-in",
    });

    if (existingCheckIn) {
      const checkInH = new Date(existingCheckIn.checkInTime).getHours();
      const nowH = new Date().getHours();

      // If previous check-in was in the morning (< 13:00) and now it is afternoon/evening (>= 14:00)
      // This means they forgot to check out of the first half of a brake shift.
      if (checkInH < 13 && nowH >= 14) {
        const autoCheckOutTime = new Date(existingCheckIn.checkInTime.getTime() + 6 * 60 * 60 * 1000); // Assume 6 hours
        existingCheckIn.checkOutTime = autoCheckOutTime;
        existingCheckIn.totalHours = 6;
        existingCheckIn.status = "checked-out";
        existingCheckIn.reason = "Auto-checkout (missing first half checkout)";
        await existingCheckIn.save();
      } else {
        return res.status(400).json({ message: "Already checked-in for today" });
      }
    }

    // Save attendance record
    const attendanceData = {
      employeeId,
      employeeEmail,
      checkInTime: new Date(),
      latitude,
      longitude,
      distance,
      onsite,
      officeName: assignedLocation.name,
      status: "checked-in",
    };

    // ✅ Store reason only if provided
    if (reason) {
      attendanceData.reason = reason.trim();
    }

    const attendance = await Attendance.create(attendanceData);

    // ✅ Add employee name to response (not to database)
    const employeeName = employee.name || employeeEmail.split('@')[0];

    res.status(200).json({
      message: onsite
        ? `✅ Welcome to the office, ${employeeName}! Check-in successful (Inside assigned location: ${distance}m away)`
        : `✅ Check-in successful, ${employeeName} (Outside assigned location: ${distance}m away)`,
      attendance,
      employeeName: employeeName, // ✅ Return employee name
    });
  } catch (err) {
    console.error("Check-in error:", err);
    res.status(500).json({ message: "Check-In failed", error: err.message });
  }
};

// exports.checkOut = async (req, res) => {
//   try {
//     const { employeeId, latitude, longitude, reason } = req.body;
//     if (!employeeId || latitude == null || longitude == null) {
//       return res.status(400).json({ message: "Employee ID and location are required" });
//     }

//     // 1️⃣ Get Employee with assigned location
//     const employee = await Employee.findOne({ employeeId }).populate("location");
//     if (!employee) {
//       return res.status(404).json({ message: "Employee not found" });
//     }

//     const assignedLocation = employee.location;
//     if (!assignedLocation) {
//       return res.status(404).json({ message: "No location assigned to employee" });
//     }

//     // 2️⃣ Calculate distance between employee and assigned location
//     const distance = haversineDistance(
//       assignedLocation.latitude,
//       assignedLocation.longitude,
//       latitude,
//       longitude
//     );

//     const onsite = distance <= ONSITE_RADIUS_M;

//     // 3️⃣ Find today's check-in
//     const startOfToday = new Date();
//     startOfToday.setHours(0, 0, 0, 0);

//     const existingCheckIn = await Attendance.findOne({
//       employeeId,
//       checkInTime: { $gte: startOfToday },
//       status: "checked-in",
//     });

//     if (!existingCheckIn) {
//       return res.status(400).json({ message: "No check-in found for today" });
//     }

//     // 4️⃣ Calculate total hours
//     const checkOutTime = new Date();
//     const checkInTime = new Date(existingCheckIn.checkInTime);
//     const totalHours = ((checkOutTime - checkInTime) / (1000 * 60 * 60)).toFixed(2);

//     // 5️⃣ Update attendance record
//     const updateData = {
//       checkOutTime,
//       totalHours,
//       status: "checked-out",
//       latitude,
//       longitude,
//       distance,
//       onsite,
//     };

//     if (!onsite) {
//       updateData.reason = reason || "No reason provided";
//     }

//     const attendance = await Attendance.findByIdAndUpdate(
//       existingCheckIn._id,
//       updateData,
//       { new: true }
//     );

//     // ✅ Add employee name to response
//     const employeeName = employee.name || "Employee";

//     // ✅ Log checkout activity
//     await logActivity({
//       userId: employeeId,
//       userName: employeeName,
//       userEmail: employee.email || "",
//       userRole: "employee",
//       action: "logout",
//       actionDetails: `Employee checked out after ${totalHours} hours`,
//       ipAddress: req.ip || req.connection.remoteAddress,
//       metadata: {
//         checkInTime: checkInTime,
//         checkOutTime: checkOutTime,
//         totalHours: totalHours,
//         location: assignedLocation.name,
//         onsite: onsite,
//         distance: distance
//       },
//     });

//     res.status(200).json({
//       message: onsite
//         ? `✅ Goodbye, ${employeeName}! Check-out successful. Total hours: ${totalHours} (Inside assigned location: ${distance}m away)`
//         : `✅ Goodbye, ${employeeName}! Check-out successful. Total hours: ${totalHours} (Outside assigned location: ${distance}m away)`,
//       attendance,
//       employeeName: employeeName, // ✅ Return employee name
//       totalHours,
//     });
//   } catch (err) {
//     console.error("Check-out error:", err);
//     res.status(500).json({ message: "Check-Out failed", error: err.message });
//   }
// };



exports.checkOut = async (req, res) => {
  try {

    const {
      employeeId,
      latitude,
      longitude,
      reason,
    } = req.body;

    if (
      !employeeId ||
      latitude == null ||
      longitude == null
    ) {
      return res.status(400).json({
        message:
          "Employee ID and location are required",
      });
    }

    // =========================
    // GET EMPLOYEE
    // =========================

    const employee = await Employee.findOne({
      employeeId,
    }).populate("location");

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    const assignedLocation = employee.location;

    if (!assignedLocation) {
      return res.status(404).json({
        message:
          "No location assigned to employee",
      });
    }

    // =========================
    // CALCULATE DISTANCE
    // =========================

    const distance = haversineDistance(
      assignedLocation.latitude,
      assignedLocation.longitude,
      latitude,
      longitude
    );

    const onsite =
      distance <= ONSITE_RADIUS_M;

    // =========================
    // FIND TODAY ATTENDANCE
    // =========================

    const startOfToday = new Date();

    startOfToday.setHours(0, 0, 0, 0);

    const existingCheckIn =
      await Attendance.findOne({
        employeeId,
        checkInTime: {
          $gte: startOfToday,
        },
        status: {
          $in: [
            "checked-in",
            "on-break",
          ],
        },
      });

    if (!existingCheckIn) {
      return res.status(400).json({
        message:
          "No active check-in found for today",
      });
    }

    // =========================
    // AUTO CLOSE ACTIVE BREAK
    // =========================

    const activeBreak =
      existingCheckIn.breaks.find(
        (b) => b.breakIn && !b.breakOut
      );

    if (activeBreak) {

      activeBreak.breakOut =
        new Date();

      const breakMinutes =
        (activeBreak.breakOut -
          activeBreak.breakIn) /
        (1000 * 60);

      activeBreak.breakMinutes =
        Math.round(breakMinutes);
    }

    // =========================
    // TOTAL BREAK MINUTES
    // =========================

    existingCheckIn.totalBreakMinutes =
      existingCheckIn.breaks.reduce(
        (sum, b) =>
          sum + (b.breakMinutes || 0),
        0
      );

    // =========================
    // TIME CALCULATIONS
    // =========================

    const checkOutTime = new Date();

    const checkInTime = new Date(
      existingCheckIn.checkInTime
    );

    // Presence Hours
    const totalHours =
      (checkOutTime - checkInTime) /
      (1000 * 60 * 60);

    // Working Hours
    const workingHours =
      totalHours -
      (existingCheckIn.totalBreakMinutes /
        60);

    // OT Hours
    const otHours =
      workingHours >
      existingCheckIn.assignedShiftHours
        ? workingHours -
          existingCheckIn.assignedShiftHours
        : 0;

    // Hourly Rate
    const hourlyRate =
      existingCheckIn.basicSalary /
      existingCheckIn.workingDays /
      existingCheckIn.assignedShiftHours;

    // OT Rate
    const otRate =
      hourlyRate *
      existingCheckIn.otMultiplier;

    // OT Amount
    const otAmount =
      otHours * otRate;

    // =========================
    // UPDATE DATA
    // =========================

    existingCheckIn.checkOutTime =
      checkOutTime;

    existingCheckIn.totalHours =
      totalHours.toFixed(2);

    existingCheckIn.workingHours =
      workingHours.toFixed(2);

    existingCheckIn.otHours =
      otHours.toFixed(2);

    existingCheckIn.hourlyRate =
      hourlyRate.toFixed(2);

    existingCheckIn.otRate =
      otRate.toFixed(2);

    existingCheckIn.otAmount =
      otAmount.toFixed(2);

    existingCheckIn.status =
      "checked-out";

    existingCheckIn.latitude =
      latitude;

    existingCheckIn.longitude =
      longitude;

    existingCheckIn.distance =
      distance;

    existingCheckIn.onsite =
      onsite;

    if (!onsite) {
      existingCheckIn.reason =
        reason || "No reason provided";
    }

    await existingCheckIn.save();

    // =========================
    // EMPLOYEE NAME
    // =========================

    const employeeName =
      employee.name || "Employee";

    // =========================
    // ACTIVITY LOG
    // =========================

    await logActivity({
      userId: employeeId,

      userName: employeeName,

      userEmail:
        employee.email || "",

      userRole: "employee",

      action: "logout",

      actionDetails:
        `Employee checked out after ${workingHours.toFixed(2)} working hours`,

      ipAddress:
        req.ip ||
        req.connection.remoteAddress,

      metadata: {
        checkInTime,
        checkOutTime,

        totalHours:
          totalHours.toFixed(2),

        workingHours:
          workingHours.toFixed(2),

        totalBreakMinutes:
          existingCheckIn.totalBreakMinutes,

        otHours:
          otHours.toFixed(2),

        otAmount:
          otAmount.toFixed(2),

        location:
          assignedLocation.name,

        onsite,

        distance,
      },
    });

    // =========================
    // RESPONSE
    // =========================

    res.status(200).json({
      message: onsite
        ? `✅ Goodbye, ${employeeName}! Check-out successful`
        : `✅ Goodbye, ${employeeName}! Check-out successful (Outside office location)`,

      employeeName,

      attendance: existingCheckIn,

      summary: {
        totalHours:
          totalHours.toFixed(2),

        breakMinutes:
          existingCheckIn.totalBreakMinutes,

        workingHours:
          workingHours.toFixed(2),

        otHours:
          otHours.toFixed(2),

        otAmount:
          otAmount.toFixed(2),
      },
    });

  } catch (err) {

    console.error(
      "Check-out error:",
      err
    );

    res.status(500).json({
      message: "Check-Out failed",
      error: err.message,
    });

  }
};



// =========================
// BREAK-IN
// =========================

exports.breakIn = async (req, res) => {
  try {

    const { employeeId, reason } = req.body;

    if (!employeeId) {
      return res.status(400).json({
        message: "Employee ID is required",
      });
    }

    // Today's attendance
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      employeeId,
      checkInTime: { $gte: startOfToday },
      status: { $in: ["checked-in", "on-break"] },
    });

    if (!attendance) {
      return res.status(404).json({
        message: "No active attendance found",
      });
    }

    // Check already on break
    const activeBreak = attendance.breaks.find(
      (b) => b.breakIn && !b.breakOut
    );

    if (activeBreak) {
      return res.status(400).json({
        message: "Already on break",
      });
    }

    // Add new break
    attendance.breaks.push({
      breakIn: new Date(),
      reason: reason || "Break",
    });

    attendance.status = "on-break";

    await attendance.save();

    res.status(200).json({
      message: "Break started successfully",
      attendance,
    });

  } catch (err) {

    console.error("Break-In Error:", err);

    res.status(500).json({
      message: "Break-In failed",
      error: err.message,
    });

  }
};



// =========================
// BREAK-OUT
// =========================

exports.breakOut = async (req, res) => {
  try {

    const { employeeId } = req.body;

    if (!employeeId) {
      return res.status(400).json({
        message: "Employee ID is required",
      });
    }

    // Today's attendance
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      employeeId,
      checkInTime: { $gte: startOfToday },
    });

    if (!attendance) {
      return res.status(404).json({
        message: "Attendance not found",
      });
    }

    // Find active break
    const activeBreak = attendance.breaks.find(
      (b) => b.breakIn && !b.breakOut
    );

    if (!activeBreak) {
      return res.status(400).json({
        message: "No active break found",
      });
    }

    // Break Out Time
    activeBreak.breakOut = new Date();

    // Calculate break minutes
    const breakMinutes =
      (activeBreak.breakOut - activeBreak.breakIn)
      / (1000 * 60);

    activeBreak.breakMinutes =
      Math.round(breakMinutes);

    // Total Break Minutes
    attendance.totalBreakMinutes =
      attendance.breaks.reduce(
        (sum, b) => sum + (b.breakMinutes || 0),
        0
      );

    attendance.status = "checked-in";

    await attendance.save();

    res.status(200).json({
      message: "Break ended successfully",
      breakMinutes: activeBreak.breakMinutes,
      totalBreakMinutes: attendance.totalBreakMinutes,
      attendance,
    });

  } catch (err) {

    console.error("Break-Out Error:", err);

    res.status(500).json({
      message: "Break-Out failed",
      error: err.message,
    });

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

    // ✅ Get employee name separately
    const employee = await Employee.findOne({ employeeId });
    const employeeName = employee ? employee.name : null;

    res.status(200).json({
      message: "Employee attendance fetched successfully",
      records,
      employeeName: employeeName, // ✅ Return employee name
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
// exports.getAllAttendance = async (req, res) => {
//   try {
//     const { employeeId, fromDate, toDate } = req.query;

//     let filter = {};

//     // 🔹 Employee Filter
//     if (employeeId) {
//       filter.employeeId = employeeId;
//     }

//     // 🔹 Date Filter
//     if (fromDate && toDate) {
//       filter.checkInTime = {
//         $gte: new Date(fromDate),
//         $lte: new Date(toDate + "T23:59:59"),
//       };
//     }

//     // 🔹 Fetch with Filter
//     const records = await Attendance.find(filter).sort({ checkInTime: -1 });

//     res.status(200).json({
//       message: "Attendance records fetched successfully",
//       records,
//     });
//   } catch (err) {
//     console.error("Get All Attendance Error:", err);
//     res.status(500).json({
//       message: "Failed to fetch attendance",
//       error: err.message,
//     });
//   }
// };

// ---------------- All Attendance ----------------
exports.getAllAttendance = async (req, res) => {
  try {
    const { employeeId, fromDate, toDate, month, year, monthNum } = req.query;

    let filter = {};

    // 🔹 Employee Filter
    if (employeeId) {
      filter.employeeId = employeeId;
    }

    // 🔹 Month Filter (NEW)
    if (month) {
      // month format: "2026-04"
      const [yearStr, monthStr] = month.split('-');
      const startDate = new Date(parseInt(yearStr), parseInt(monthStr) - 1, 1);
      const endDate = new Date(parseInt(yearStr), parseInt(monthStr), 0);
      endDate.setHours(23, 59, 59, 999);
      
      filter.checkInTime = {
        $gte: startDate,
        $lte: endDate
      };
    }
    // 🔹 Alternative month filter using year and monthNum
    else if (year && monthNum) {
      const startDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(monthNum), 0);
      endDate.setHours(23, 59, 59, 999);
      
      filter.checkInTime = {
        $gte: startDate,
        $lte: endDate
      };
    }
    // 🔹 Date Range Filter
    else if (fromDate && toDate) {
      filter.checkInTime = {
        $gte: new Date(fromDate),
        $lte: new Date(toDate + "T23:59:59"),
      };
    }
    // 🔹 Single Date Filter (fromDate only)
    else if (fromDate) {
      const startDate = new Date(fromDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(fromDate);
      endDate.setHours(23, 59, 59, 999);
      
      filter.checkInTime = {
        $gte: startDate,
        $lte: endDate
      };
    }

    // 🔹 Fetch with Filter
    const records = await Attendance.find(filter).sort({ checkInTime: -1 });

    res.status(200).json({
      message: "Attendance records fetched successfully",
      records,
    });
  } catch (err) {
    console.error("Get All Attendance Error:", err);
    res.status(500).json({
      message: "Failed to fetch attendance",
      error: err.message,
    });
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

    // Employees who are NOT present today AND are ACTIVE
    const absentEmployees = await Employee.find({
      employeeId: { $nin: presentEmployeeIds },
      status: { $ne: 'inactive' } // ✅ Filter out inactive
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
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // 1. Get all attendance for today
    const activeAttendance = await Attendance.find({
      checkInTime: { $gte: todayStart, $lte: todayEnd },
    }).lean();

    // 2. Get all shifts to map employee -> startTime
    const allShifts = await Shift.find({}).lean();

    // Map: employeeId -> shiftStartTime (e.g., "09:30")
    // If multiple shifts exist for same emp, pick relevant one (assuming 1 active shift per employee for now)
    const shiftMap = {};
    allShifts.forEach((s) => {
      shiftMap[s.employeeId] = s.startTime;
    });

    const lateRecords = [];

    // 3. Filter latecomers
    for (const record of activeAttendance) {
      const empShiftStart = shiftMap[record.employeeId];
      if (!empShiftStart) continue; // Skip if no shift found (or handle as default 10am?)

      // Parse shift time
      const [h, m] = empShiftStart.split(":").map(Number);
      const shiftDate = new Date(record.checkInTime);
      shiftDate.setHours(h, m, 0, 0);

      // Add 5 mins grace period
      const graceTime = new Date(shiftDate.getTime() + 5 * 60000);

      if (record.checkInTime > graceTime) {
        // Calculate raw minutes late
        const diffMs = record.checkInTime - shiftDate;
        const diffMins = Math.floor(diffMs / 60000);

        lateRecords.push({
          ...record,
          shiftStart: empShiftStart,
          actualCheckIn: record.checkInTime,
          lateByMinutes: diffMins,
        });
      }
    }

    res.status(200).json({
      message: "Late attendance fetched successfully",
      records: lateRecords,
    });
  } catch (err) {
    console.error("Get Late Attendance Error:", err);
    res.status(500).json({
      message: "Failed to fetch late attendance",
      error: err.message,
    });
  }
};

// ---------------- Attendance Summary ----------------
exports.getAttendanceSummary = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // 1️⃣ Count all ACTIVE employees
    const totalEmployees = await Employee.countDocuments({ status: { $ne: 'inactive' } });
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

exports.updateAttendance = async (req, res) => {
  try {
    const { attendanceId, employeeId, date, checkInTime, checkOutTime, hours, reason, comment } = req.body;

    // If attendanceId is provided, we update the existing record
    if (attendanceId) {
      // Find the existing record to maintain any fields not being updated, though we'll directly update what's passed
      const updateData = {
        updatedAt: new Date()
      };

      if (hours !== undefined) updateData.totalHours = parseFloat(hours) || 0;
      if (reason !== undefined) updateData.reason = reason;
      if (comment !== undefined) updateData.comment = comment;
      
      // Update checkInTime and checkOutTime if provided
      if (checkInTime) {
        updateData.checkInTime = new Date(checkInTime);
      }
      if (checkOutTime) {
        updateData.checkOutTime = new Date(checkOutTime);
      }

      const updatedAttendance = await Attendance.findByIdAndUpdate(
        attendanceId,
        updateData,
        { new: true }
      );

      if (!updatedAttendance) {
        return res.status(404).json({
          success: false,
          message: 'Attendance record not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Attendance updated successfully',
        data: updatedAttendance
      });
    } 
    
    // If no attendanceId, but we have employeeId, checkInTime, etc. - Create a missing record
    else if (employeeId && checkInTime) {
      // Find employee to get email/name
      const Employee = require("../models/Employee");
      const employee = await Employee.findOne({ employeeId });
      
      const newAttendance = await Attendance.create({
        employeeId: employeeId,
        employeeEmail: employee ? employee.email : "",
        name: employee ? employee.name : "",
        checkInTime: new Date(checkInTime),
        checkOutTime: checkOutTime ? new Date(checkOutTime) : null,
        totalHours: parseFloat(hours) || 0,
        reason: reason || "",
        comment: comment || "",
        status: checkOutTime ? "checked-out" : "checked-in",
        // Default other fields appropriate for manual entry
        onsite: reason === "Onsite",
        distance: 0
      });

      return res.status(201).json({
        success: true,
        message: 'Missing attendance record created successfully',
        data: newAttendance
      });
    } 
    
    // Invalid request
    else {
      return res.status(400).json({
        success: false,
        message: 'Provide either attendanceId for update, or employeeId and checkInTime for creation'
      });
    }

  } catch (error) {
    console.error('Error updating/creating attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// ✅ Monthly Absence Summary
exports.getMonthlyAbsenceSummary = async (req, res) => {
  try {
    const year = new Date().getFullYear();
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const monthlyData = [];

    // Get all attendance for the current year to minimize queries
    const startYear = new Date(year, 0, 1);
    const endYear = new Date(year, 11, 31, 23, 59, 59);

    // Aggregate attendance per month
    const attendanceByMonth = await Attendance.aggregate([
      {
        $match: {
          checkInTime: { $gte: startYear, $lte: endYear }
        }
      },
      {
        $group: {
          _id: { $month: "$checkInTime" },
          count: { $sum: 1 }
        }
      }
    ]);

    const attMap = {};
    attendanceByMonth.forEach(a => attMap[a._id] = a.count);

    const totalEmployees = await Employee.countDocuments({ status: { $ne: 'inactive' } });

    for (let i = 0; i < 12; i++) {
      const monthIndex = i + 1; // 1-based for aggregation
      const startOfMonth = new Date(year, i, 1);
      const endOfMonth = new Date(year, i + 1, 0);

      // Skip future months
      if (startOfMonth > new Date()) {
        monthlyData.push({ month: months[i], absent: 0 });
        continue;
      }

      // Calculate working days (excluding Sundays) 
      let workingDays = 0;
      let d = new Date(startOfMonth);
      const now = new Date();
      const effectiveEnd = (endOfMonth > now) ? now : endOfMonth;

      while (d <= effectiveEnd) {
        if (d.getDay() !== 0) workingDays++;
        d.setDate(d.getDate() + 1);
      }

      const expectedAttendance = totalEmployees * workingDays;
      const presentCount = attMap[monthIndex] || 0;
      const absentCount = Math.max(expectedAttendance - presentCount, 0);

      monthlyData.push({ month: months[i], absent: absentCount });
    }

    res.status(200).json({
      message: "Monthly absence summary fetched",
      data: monthlyData
    });
  } catch (err) {
    console.error("Monthly Absence Error:", err);
    res.status(500).json({ message: "Failed to fetch monthly absence", error: err.message });
  }
};