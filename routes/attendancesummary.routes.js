const express = require("express");
const router = express.Router();

const {
  saveSummary,
  getSummary,
  calculateSummary
} = require("../controller/attendanceSummary.controller");

router.post("/save", saveSummary);
router.get("/get", getSummary);
router.get("/getattendancesummary", calculateSummary);


module.exports = router;
