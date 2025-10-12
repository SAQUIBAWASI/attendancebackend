const express = require('express');
const router = express.Router();
const { 
  markAttendance, 
  getAttendance,
  getEmployeeAttendance, 
  getAllAttendance
} = require('../controller/attendance.controller');

// ✅ Mark attendance
router.post('/add-attendance', markAttendance);
router.get('/allattendance', getAllAttendance);


// ✅ Get specific attendance record
router.get('/:employeeId/:date', getAttendance);

// ✅ Get all attendance for an employee
router.get('/employee/:employeeId', getEmployeeAttendance);

module.exports = router;