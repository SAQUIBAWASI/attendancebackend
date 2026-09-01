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

  const targetNames = [
    "Dara Gowthami",
    "JATTOTH ANIL",
    "GANESH SINGULURI",
    "Saquiba Wasi",
    "Julee Perween"
  ];

  const employees = await Employee.find({
    name: { $in: targetNames }
  }).lean();

  console.log(`Found ${employees.length} target employees.`);

  const shifts = await Shift.find({ isActive: true }).lean();

  for (const employee of employees) {
    const employeeId = String(employee.employeeId);
    console.log(`\nEmployee: ${employee.name} (${employeeId})`);

    const empAtt = await Attendance.find({
      employeeId: employeeId,
      createdAt: { $gte: startDate, $lte: endDate }
    }).lean();

    console.log(`  Found ${empAtt.length} attendance records.`);

    // Find shift
    const employeeShifts = shifts.filter(
      (shift) =>
        String(shift.employeeAssignment?.employeeId) === employeeId ||
        String(shift.employeeId) === employeeId
    );
    console.log(`  Found ${employeeShifts.length} shift assignments.`);
    const defaultShift = employeeShifts[0] || null;
    if (defaultShift) {
      console.log(`  Default shift type: ${defaultShift.shiftType}`);
    }

    let lateDays = 0;
    const checkedDates = new Set();

    empAtt.forEach(rec => {
      if (!rec.checkInTime) return;
      const checkIn = new Date(rec.checkInTime);
      const dateKey = checkIn.toISOString().slice(0, 10);
      if (checkedDates.has(dateKey)) return;
      checkedDates.add(dateKey);

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

      if (!startTime) {
        console.log(`    [NO SHIFT TIMINGS] on ${dateKey} Checkin: ${checkIn.toISOString()}`);
        return;
      }

      const timeParts = String(startTime).split(":").map(Number);
      const shiftStart = new Date(checkIn);
      shiftStart.setHours(timeParts[0], timeParts[1], 0, 0);

      const isLate = checkIn > shiftStart;
      const lateMin = Math.floor((checkIn - shiftStart) / 60000);
      console.log(`    Date: ${dateKey} | CheckIn: ${checkIn.toISOString()} | ShiftStart: ${shiftStart.toISOString()} (${startTime}) | Late: ${isLate} (${lateMin} mins)`);
      if (isLate) lateDays++;
    });

    console.log(`  Total calculated late days: ${lateDays}`);
  }

  await mongoose.disconnect();
}

run().catch(console.error);