// const express = require("express");
// const router = express.Router();

// const {
//   saveSummary,
//   getSummary,
//   calculateSummary
// } = require("../controller/attendanceSummary.controller");

// // router.post("/save", saveSummary);
// // router.get("/get", getSummary);
// router.get("/getattendancesummary", calculateSummary);


// // module.exports = router;

// // const express = require("express");
// // const router = express.Router();

// // const {
// //   saveSummary,
// //   getSummary,
// //   calculateSummary
// // } = require("../controller/attendanceSummary.controller");

// router.post("/save", saveSummary);
// router.get("/get", getSummary);

// // Main API (works for admin + employee filtered)
// //router.get("/getattendancesummary", getattendancesummary);

// // Optional: Separate employee-only API
// //router.get("/getattendancesummary/:employeeId", calculateSummary);

// module.exports = router;


const express = require("express");
const router = express.Router();

const {
  saveSummary,
  getSummary,
  calculateSummary,
  getAllAttendance,
  updateAttendance,
  getEmployeeDetails,
  getSalaries
} = require("../controller/attendanceSummary.controller");

// 📊 Attendance Summary Routes
router.post("/save", saveSummary);
router.get("/get", getSummary);
router.post("/calculate", calculateSummary);

// 👥 Employee Details Routes
router.get("/employee-details", getEmployeeDetails);

// 📝 Attendance Records Routes
router.get("/allattendance", getAllAttendance);
router.put("/update", updateAttendance);

router.get("/getsalaries", getSalaries);


// // Optional: Separate employee-only API
router.get("/get/:employeeId", calculateSummary);
router.get("/getsalaries/:employeeId", calculateSummary);
module.exports = router;