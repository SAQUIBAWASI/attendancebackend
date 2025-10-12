const express = require('express');
const router = express.Router();
const { 
  markAttendance, 
  getAttendance,
  getEmployeeAttendance 
} = require('../controller/attendance.controller');

// ✅ Mark attendance
router.post('/', markAttendance);

// ✅ Get specific attendance record
router.get('/:employeeId/:date', getAttendance);

// ✅ Get all attendance for an employee
router.get('/employee/:employeeId', getEmployeeAttendance);

module.exports = router;