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
  fixSummaryData,
  getSalaries,
  checkMonthData 
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
router.post("/fix-summary-data", fixSummaryData);

// // Optional: Separate employee-only API
router.get("/get/:employeeId", calculateSummary);
router.get("/getsalaries/:employeeId", calculateSummary);

router.get("/check-month-data", checkMonthData);
module.exports = router;
