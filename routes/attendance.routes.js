const express = require("express");
const router = express.Router();
const { markAttendance } = require("../controller/attendance.controller");

// POST attendance
router.post("/mark", markAttendance);

module.exports = router;
