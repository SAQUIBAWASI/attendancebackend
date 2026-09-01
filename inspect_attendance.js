require("dotenv").config();
const mongoose = require("mongoose");
const Employee = require("C:/Users/Ingran/Desktop/Saquiba Files/AD/attendancebackend/models/Employee");
const Attendance = require("C:/Users/Ingran/Desktop/Saquiba Files/AD/attendancebackend/models/Attendance");
const Shift = require("C:/Users/Ingran/Desktop/Saquiba Files/AD/attendancebackend/models/Shift");

const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/attendanceDB";

async function run() {
  await mongoose.connect(mongoUri, { dbName: "attendanceDB" });
  console.log("Connected to MongoDB.");

  const month = 8;
  const year = 2026;
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);

  // Get active employees
  const employees = await Employee.find({ status: "active" }).lean();
  console.log(`Found ${employees.length} active employees.`);

  // Get attendance records
  const attendanceRecords = await Attendance.find({
    createdAt: { $gte: startDate, $lte: endDate }
  }).lean();
  console.log(`Found ${attendanceRecords.length} attendance records for Aug 2026.`);

  // Get active shifts
  const shifts = await Shift.find({ isActive: true }).lean();

  for (const employee of employees) {
    const employeeId = String(employee.employeeId);
    const employeeMongoId = String(employee._id);

    const empAtt = attendanceRecords.filter(
      (a) => String(a.employeeId) === employeeId
    );

    if (empAtt.length === 0) continue;

    // Find shift
    const employeeShifts = shifts.filter(
      (shift) =>
        String(shift.employeeAssignment?.employeeId) === employeeId ||
        String(shift.employeeId) === employeeId
    );
    const defaultShift = employeeShifts[0] || null;

    let lateComingDays = 0;
    const checkedLateDates = new Set();

    empAtt.forEach((attendance) => {
      if (!attendance.checkInTime) return;

      const checkIn = new Date(attendance.checkInTime);
      const dateKey = `${checkIn.getFullYear()}-${String(checkIn.getMonth() + 1).padStart(2, "0")}-${String(checkIn.getDate()).padStart(2, "0")}`;

      if (checkedLateDates.has(dateKey)) return;
      checkedLateDates.add(dateKey);

      let selectedShift = defaultShift;
      const matchingShifts = employeeShifts
        .filter((shift) => {
          const effectiveFrom = shift.employeeAssignment?.effectiveFrom;
          if (!effectiveFrom) return false;
          return new Date(effectiveFrom) <= checkIn;
        })
        .sort((a, b) => {
          const dateA = new Date(a.employeeAssignment?.effectiveFrom || 0);
          const dateB = new Date(b.employeeAssignment?.effectiveFrom || 0);
          return dateB - dateA;
        });

      if (matchingShifts.length) {
        selectedShift = matchingShifts[0];
      }

      let startTime = null;
      if (selectedShift) {
        startTime = selectedShift.employeeAssignment?.startTime || selectedShift.timeSlots?.[0]?.startTime || selectedShift.startTime || null;
      }

      if (!startTime) return;

      const timeParts = String(startTime).split(":").map(Number);
      const shiftStart = new Date(checkIn);
      shiftStart.setHours(timeParts[0], timeParts[1], 0, 0);

      if (checkIn > shiftStart) {
        lateComingDays++;
        const lateMin = Math.floor((checkIn - shiftStart) / 60000);
        console.log(`  [LATE] Employee: ${employee.name} (${employeeId}) on ${dateKey} Checkin: ${checkIn.toISOString()} ShiftStart: ${shiftStart.toISOString()} (Late by ${lateMin} min)`);
      }
    });

    if (lateComingDays > 0) {
      console.log(`Employee: ${employee.name} (${employeeId}) has ${lateComingDays} late coming days.`);
    }
  }

  await mongoose.disconnect();
}

run().catch(console.error);