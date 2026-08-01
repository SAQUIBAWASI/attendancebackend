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
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();



// ✅ CUSTOM UPLOAD DIRECTORY - /uploads/attendanceimage
const uploadDir = path.join(__dirname, "../uploads/attendanceimage");

// Ensure upload directories exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ Storage configuration with custom path
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `attendance-${uniqueSuffix}${ext}`);
  },
});

// File filter - only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

// Multer upload instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter,
});

// ❌ REMOVE multer completely
// const multer = require("multer");
// const storage = multer.diskStorage({...});
// const upload = multer({ storage });

// ✅ Clean checkin & checkout WITHOUT multer
router.post("/checkin",   upload.single("image"), attendanceController.checkIn);
router.post("/checkout",   upload.single("image"), attendanceController.checkOut);

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


router.post("/checkinwithqr", attendanceController.checkInForQR);


module.exports = router;
