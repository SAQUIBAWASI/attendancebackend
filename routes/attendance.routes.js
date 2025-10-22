const express = require("express");
const multer = require("multer");
const attendanceController = require("../controller/attendance.controller");

const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// ✅ Correct route order
router.post("/checkin", upload.single("photo"), attendanceController.checkIn);
router.post("/checkout", upload.single("photo"), attendanceController.checkOut);

// 👇 Employee-specific route FIRST
router.get("/myattendance/:employeeId", attendanceController.getEmployeeAttendance);

// 👇 Then admin/global routes
router.get("/allattendance", attendanceController.getAllAttendance);
router.get("/todaysattendance", attendanceController.getTodayAttendance);
router.get("/lateattendance", attendanceController.getLateAttendance);
router.get("/summary", attendanceController.getAttendanceSummary);

module.exports = router;
