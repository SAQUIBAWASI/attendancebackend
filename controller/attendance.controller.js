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
const Location = require("../models/Location");

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
      return res.status(400).json({ message: "Already checked-in for today" });
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

    res.status(200).json({message: `✅ Check-In successful (${onsite ? "Inside" : "Outside"} assigned location: ${distance}m away)`,
      attendance,});
  } catch (err) {
    console.error("Check-in error:", err);
    res.status(500).json({ message: "Check-In failed", error: err.message });
  }
};


exports.checkOut = async (req, res) => {
  try {
    const { employeeId, latitude, longitude, reason } = req.body;
if (!employeeId || latitude == null || longitude == null) {
  return res.status(400).json({ message: "Employee ID, email, and location are required" });
}


    // 1️⃣ Get Employee with assigned location
    const employee = await Employee.findOne({ employeeId }).populate("location");
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const assignedLocation = employee.location;
    if (!assignedLocation) {
      return res.status(404).json({ message: "No location assigned to employee" });
    }

    // 2️⃣ Calculate distance between employee and assigned location
    const distance = haversineDistance(
      assignedLocation.latitude,
      assignedLocation.longitude,
      latitude,
      longitude
    );

    const onsite = distance <= ONSITE_RADIUS_M;

    // 3️⃣ Find today's check-in
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const existingCheckIn = await Attendance.findOne({
      employeeId,
      checkInTime: { $gte: startOfToday },
      status: "checked-in",
    });

    if (!existingCheckIn) {
      return res.status(400).json({ message: "No check-in found for today" });
    }

    // 4️⃣ Calculate total hours
    const checkOutTime = new Date();
    const checkInTime = new Date(existingCheckIn.checkInTime);
    const totalHours = ((checkOutTime - checkInTime) / (1000 * 60 * 60)).toFixed(2);

    // 5️⃣ Update attendance record
    const updateData = {
      checkOutTime,
      totalHours,
      status: "checked-out",
      latitude,
      longitude,
      distance,
      onsite,
    };

    if (!onsite) {
      updateData.reason = reason || "No reason provided";
    }

    const attendance = await Attendance.findByIdAndUpdate(
      existingCheckIn._id,
      updateData,
      { new: true }
    );

    res.status(200).json({
      message: onsite
        ? `✅ Check-Out successful (Inside assigned location: ${distance}m away)`
        : `✅ Check-Out successful (Outside assigned location: ${distance}m away)`,
      attendance,
    });
  } catch (err) {
    console.error("Check-out error:", err);
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