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

// Routes
router.post("/checkin", upload.single("photo"), attendanceController.checkIn);
router.post("/checkout", upload.single("photo"), attendanceController.checkOut);
router.get("/allattendance", attendanceController.getAllAttendance);
router.get("/myattendance/:employeeId", attendanceController.getEmployeeAttendance);
router.get("/todaysattendance", attendanceController.getTodayAttendance);
router.get("/lateattendance", attendanceController.getLateAttendance);




module.exports = router;
