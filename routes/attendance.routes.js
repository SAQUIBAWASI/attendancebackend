// const express = require("express");
// const multer = require("multer");
// const attendanceController = require("../controller/attendance.controller");

// const router = express.Router();

// // Multer setup
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, "uploads/"),
//   filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
// });
// const upload = multer({ storage });

// // ✅ Correct route order
// router.post("/checkin", upload.single("photo"), attendanceController.checkIn);
// router.post("/checkout", upload.single("photo"), attendanceController.checkOut);

// // 👇 Employee-specific route FIRST
// router.get("/myattendance/:employeeId", attendanceController.getEmployeeAttendance);

// // 👇 Then admin/global routes
// router.get("/allattendance", attendanceController.getAllAttendance);
// router.get("/today", attendanceController.getTodayAttendanceForEmployee);
// router.get("/lateattendance", attendanceController.getLateAttendance);
// router.get("/summary", attendanceController.getAttendanceSummary);

// module.exports = router;

// const express = require("express");
// const multer = require("multer");
// const attendanceController = require("../controller/attendance.controller");

// const router = express.Router();

// // Multer setup
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, "uploads/"),
//   filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
// });
// const upload = multer({ storage });

// // ✅ Check-in / Check-out
// router.post("/checkin", upload.single("photo"), attendanceController.checkIn);
// router.post("/checkout", upload.single("photo"), attendanceController.checkOut);

// // ✅ Employee-specific route FIRST
// router.get("/myattendance/:employeeId", attendanceController.getEmployeeAttendance);

// // ✅ Admin / global routes
// router.get("/allattendance", attendanceController.getAllAttendance);
// router.get("/today", attendanceController.getTodayAttendance);
// router.get("/lateattendance", attendanceController.getLateAttendance);
// router.get("/absenttoday", attendanceController.getAbsentToday);
// router.get("/summary", attendanceController.getAttendanceSummary);

// module.exports = router;


const express = require("express");
const attendanceController = require("../controller/attendance.controller");

const router = express.Router();

// ❌ REMOVE multer completely
// const multer = require("multer");
// const storage = multer.diskStorage({...});
// const upload = multer({ storage });

// ✅ Clean checkin & checkout WITHOUT multer
router.post("/checkin", attendanceController.checkIn);
router.post("/checkout", attendanceController.checkOut);

router.post("/break-in", attendanceController.breakIn);

router.post("/break-out", attendanceController.breakOut);

// Employee-specific
router.get("/myattendance/:employeeId", attendanceController.getEmployeeAttendance);

// Admin routes
router.get("/allattendance", attendanceController.getAllAttendance);
router.get("/today", attendanceController.getTodayAttendance);
router.get("/lateattendance", attendanceController.getLateAttendance);
router.get("/absenttoday", attendanceController.getAbsentToday);
router.get("/summary", attendanceController.getAttendanceSummary);
router.put("/update", attendanceController.updateAttendance);
router.get("/monthly-absence", attendanceController.getMonthlyAbsenceSummary);
router.get("/extra-days/:employeeId", attendanceController.getMyExtraDays);


module.exports = router;
