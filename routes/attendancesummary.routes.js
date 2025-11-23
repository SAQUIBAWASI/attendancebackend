const express = require("express");
const router = express.Router();

const {
  saveSummary,
  getSummary,
  calculateSummary
} = require("../controller/attendanceSummary.controller");

// router.post("/save", saveSummary);
// router.get("/get", getSummary);
router.get("/getattendancesummary", calculateSummary);


// module.exports = router;

// const express = require("express");
// const router = express.Router();

// const {
//   saveSummary,
//   getSummary,
//   calculateSummary
// } = require("../controller/attendanceSummary.controller");

router.post("/save", saveSummary);
router.get("/get", getSummary);

// Main API (works for admin + employee filtered)
//router.get("/getattendancesummary", getattendancesummary);

// Optional: Separate employee-only API
//router.get("/getattendancesummary/:employeeId", calculateSummary);

module.exports = router;
