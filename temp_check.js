const mongoose = require("mongoose");
const Attendance = require("./models/Attendance");
const Employee = require("./models/Employee");
const Shift = require("./models/Shift");
const fs = require("fs");

async function checkData() {
  await mongoose.connect("mongodb+srv://saquiba:saquiba123@cluster0.hrgeeif.mongodb.net/attendanceDB?retryWrites=true&w=majority&appName=attendance");

  const emp = await Employee.findOne({ name: /Sanam Srinu/i });
  console.log("Employee:", emp ? emp.name : "Not Found");
  
  if (emp) {
    const attendances = await Attendance.find({ employeeId: emp.employeeId, checkInTime: { $gte: new Date('2026-05-01') } }).sort({ checkInTime: 1 });
    console.log("Attendances for May:");
    attendances.forEach(a => {
      console.log(`- ${a.checkInTime.toISOString()} to ${a.checkOutTime ? a.checkOutTime.toISOString() : 'NULL'} | Hours: ${a.totalHours} | Shift: ${a.shiftCode || 'N/A'}`);
    });
  }

  const shifts = await Shift.find({});
  console.log("Shifts:");
  shifts.forEach(s => console.log(`- ${s.name} (${s.startTime} to ${s.endTime})`));

  process.exit(0);
}

checkData().catch(console.error);
