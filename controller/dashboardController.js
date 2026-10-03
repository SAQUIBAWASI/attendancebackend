const mongoose = require("mongoose");
const Employee = require("../models/Employee");
const Attendance = require("../models/Attendance");
const Shift = require("../models/Shift");
const Leave = require("../models/Leave");


// ======================================================
// GET TOP PERFORMERS
// ======================================================

const getTopPerformers = async (req, res) => {
  try {
    const now = new Date();

    const month =
      Number(req.query.month) || now.getMonth() + 1;

    const year =
      Number(req.query.year) || now.getFullYear();

    const startDate = new Date(year, month - 1, 1);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(year, month, 0);
    endDate.setHours(23, 59, 59, 999);

    const totalDays = new Date(year, month, 0).getDate();

    const employees = await Employee.find({ status: "active" }).lean();

    if (!employees.length) {
      return res.status(200).json({
        success: true,
        month,
        year,
        totalEmployees: 0,
        performers: [],
      });
    }

    const attendanceRecords = await Attendance.find({
      createdAt: { $gte: startDate, $lte: endDate },
    }).lean();

    const shifts = await Shift.find({ isActive: true }).lean();

    const performers = employees.map((employee) => {

      const employeeId = String(employee.employeeId);

      const employeeAttendance = attendanceRecords.filter(
        (attendance) => String(attendance.employeeId) === employeeId
      );

      let shiftHours = Number(employee.shiftHours);
      if (!shiftHours || shiftHours <= 0) {
        shiftHours = 8;
      }

      let weekOffCount = Number(employee.weekOffCount) || 0;
      weekOffCount = Math.min(Math.max(weekOffCount, 0), totalDays);

      const expectedWorkingDays = Math.max(totalDays - weekOffCount, 0);

      const presentDates = new Set();

      employeeAttendance.forEach((attendance) => {
        if (
          attendance.checkInTime ||
          attendance.checkOutTime ||
          attendance.status === "checked-in" ||
          attendance.status === "checked-out" ||
          attendance.status === "on-break"
        ) {
          const attendanceDate = new Date(
            attendance.checkInTime ||
            attendance.checkOutTime ||
            attendance.createdAt
          );

          const dateKey = `${attendanceDate.getFullYear()}-${String(
            attendanceDate.getMonth() + 1
          ).padStart(2, "0")}-${String(
            attendanceDate.getDate()
          ).padStart(2, "0")}`;

          presentDates.add(dateKey);
        }
      });

      const presentDays = presentDates.size;

      const absentDays = Math.max(expectedWorkingDays - presentDays, 0);

      let workingDaysScore = 0;
      if (expectedWorkingDays > 0) {
        workingDaysScore = (presentDays / expectedWorkingDays) * 100;
      }
      workingDaysScore = Math.min(Math.max(workingDaysScore, 0), 100);

      let actualWorkingHours = 0;
      employeeAttendance.forEach((attendance) => {
        actualWorkingHours += Number(attendance.workingHours) || 0;
      });

      const expectedWorkingHours = expectedWorkingDays * shiftHours;

      let workingHoursScore = 0;
      if (expectedWorkingHours > 0) {
        workingHoursScore = (actualWorkingHours / expectedWorkingHours) * 100;
      }
      workingHoursScore = Math.min(Math.max(workingHoursScore, 0), 100);

      const employeeShifts = shifts.filter(
        (shift) =>
          String(shift.employeeAssignment?.employeeId) === employeeId ||
          String(shift.employeeId) === employeeId
      );

      const getShiftTimes = (shift) => {
        let startTime = null;
        let endTime = null;

        if (!shift) return { startTime, endTime };

        startTime = shift.employeeAssignment?.startTime || null;
        endTime = shift.employeeAssignment?.endTime || null;

        if (!startTime) startTime = shift.timeSlots?.[0]?.startTime || null;
        if (!endTime) endTime = shift.timeSlots?.[0]?.endTime || null;

        if (!startTime) startTime = shift.startTime || null;
        if (!endTime) endTime = shift.endTime || null;

        return { startTime, endTime };
      };

      const defaultShift = employeeShifts[0] || null;
      const defaultShiftTimes = getShiftTimes(defaultShift);

      let lateComingDays = 0;
      const lateComingDetails = [];
      const checkedLateDates = new Set();

      employeeAttendance.forEach((attendance) => {
        if (!attendance.checkInTime) return;

        const checkIn = new Date(attendance.checkInTime);

        const dateKey = `${checkIn.getFullYear()}-${String(
          checkIn.getMonth() + 1
        ).padStart(2, "0")}-${String(checkIn.getDate()).padStart(2, "0")}`;

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

        const { startTime, endTime } = getShiftTimes(selectedShift);

        if (!startTime) return;

        const timeParts = String(startTime).split(":").map(Number);
        if (
          timeParts.length < 2 ||
          Number.isNaN(timeParts[0]) ||
          Number.isNaN(timeParts[1])
        ) return;

        const shiftStart = new Date(checkIn);
        shiftStart.setHours(timeParts[0], timeParts[1], 0, 0);

        const graceTime = new Date(shiftStart.getTime() + 5 * 60 * 1000);

        if (checkIn > shiftStart) {
          lateComingDays++;

          const lateByMinutes = Math.floor((checkIn - shiftStart) / 60000);

          lateComingDetails.push({
            date: dateKey,
            shiftType: selectedShift?.shiftType || employee.shiftType || null,
            shiftName: selectedShift?.shiftName || null,
            shiftStartTime: startTime,
            shiftEndTime: endTime,
            shiftStart: shiftStart.toISOString(),
            graceTime: graceTime.toISOString(),
            checkInTime: checkIn.toISOString(),
            lateByMinutes,
          });
        }
      });

      let lateComingScore = 100;
      if (expectedWorkingDays > 0) {
        lateComingScore =
          ((expectedWorkingDays - lateComingDays) / expectedWorkingDays) * 100;
      }
      lateComingScore = Math.max(0, Math.min(lateComingScore, 100));

      const totalScore = lateComingScore + workingDaysScore + workingHoursScore;
      const performancePercentage = totalScore / 3;

      return {
        employeeId: employee._id,
        employeeCode: employee.employeeId,
        name: employee.name,
        email: employee.email,
        department: employee.department,
        shiftType: employee.shiftType,
        shiftHours,
        shiftStartTime: defaultShiftTimes.startTime,
        shiftEndTime: defaultShiftTimes.endTime,
        month,
        year,
        totalDays,
        weekOffCount,
        expectedWorkingDays,
        presentDays,
        absentDays,
        lateComingDays,
        lateComingDetails,
        expectedWorkingHours: Number(expectedWorkingHours.toFixed(2)),
        actualWorkingHours: Number(actualWorkingHours.toFixed(2)),
        lateComingScore: Number(lateComingScore.toFixed(2)),
        workingDaysScore: Number(workingDaysScore.toFixed(2)),
        workingHoursScore: Number(workingHoursScore.toFixed(2)),
        totalScore: Number(totalScore.toFixed(2)),
        performancePercentage: Number(performancePercentage.toFixed(2)),
      };
    });

    performers.sort((a, b) => {
      if (b.performancePercentage !== a.performancePercentage) {
        return b.performancePercentage - a.performancePercentage;
      }
      if (b.presentDays !== a.presentDays) {
        return b.presentDays - a.presentDays;
      }
      if (b.actualWorkingHours !== a.actualWorkingHours) {
        return b.actualWorkingHours - a.actualWorkingHours;
      }
      return a.lateComingDays - b.lateComingDays;
    });

    const topPerformers = performers.slice(0, 5);

    return res.status(200).json({
      success: true,
      month,
      year,
      totalEmployees: employees.length,
      performers: topPerformers,
    });

  } catch (error) {
    console.error("Top Performers Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to calculate top performers",
      error: error.message,
    });
  }
};


// ======================================================
// GET ALL PERFORMERS
// ======================================================

const getAllPerformers = async (req, res) => {
  try {
    const now = new Date();
    const month = Number(req.query.month) || now.getMonth() + 1;
    const year = Number(req.query.year) || now.getFullYear();

    const startDate = new Date(year, month - 1, 1);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(year, month, 0);
    endDate.setHours(23, 59, 59, 999);

    const totalDays = new Date(year, month, 0).getDate();

    const employees = await Employee.find({ status: "active" }).lean();

    if (!employees.length) {
      return res.status(200).json({
        success: true,
        month,
        year,
        totalEmployees: 0,
        performers: [],
      });
    }

    const attendanceRecords = await Attendance.find({
      createdAt: { $gte: startDate, $lte: endDate },
    }).lean();

    const shifts = await Shift.find({ isActive: true }).lean();

    const performers = employees.map((employee) => {

      const employeeId = String(employee.employeeId);

      const employeeAttendance = attendanceRecords.filter(
        (attendance) => String(attendance.employeeId) === employeeId
      );

      let shiftHours = Number(employee.shiftHours);
      if (!shiftHours || shiftHours <= 0) shiftHours = 8;

      let weekOffCount = Number(employee.weekOffCount) || 0;
      weekOffCount = Math.min(Math.max(weekOffCount, 0), totalDays);

      const expectedWorkingDays = Math.max(totalDays - weekOffCount, 0);

      const presentDates = new Set();

      employeeAttendance.forEach((attendance) => {
        if (
          attendance.checkInTime ||
          attendance.checkOutTime ||
          attendance.status === "checked-in" ||
          attendance.status === "checked-out" ||
          attendance.status === "on-break"
        ) {
          const attendanceDate = new Date(
            attendance.checkInTime ||
            attendance.checkOutTime ||
            attendance.createdAt
          );

          const dateKey = `${attendanceDate.getFullYear()}-${String(
            attendanceDate.getMonth() + 1
          ).padStart(2, "0")}-${String(attendanceDate.getDate()).padStart(2, "0")}`;

          presentDates.add(dateKey);
        }
      });

      const presentDays = presentDates.size;

      const absentDays = Math.max(expectedWorkingDays - presentDays, 0);

      let workingDaysScore = 0;
      if (expectedWorkingDays > 0) {
        workingDaysScore = (presentDays / expectedWorkingDays) * 100;
      }
      workingDaysScore = Math.min(Math.max(workingDaysScore, 0), 100);

      let actualWorkingHours = 0;
      employeeAttendance.forEach((attendance) => {
        actualWorkingHours += Number(attendance.workingHours) || 0;
      });

      const expectedWorkingHours = expectedWorkingDays * shiftHours;

      let workingHoursScore = 0;
      if (expectedWorkingHours > 0) {
        workingHoursScore = (actualWorkingHours / expectedWorkingHours) * 100;
      }
      workingHoursScore = Math.min(Math.max(workingHoursScore, 0), 100);

      const employeeShifts = shifts.filter(
        (shift) =>
          String(shift.employeeAssignment?.employeeId) === employeeId ||
          String(shift.employeeId) === employeeId
      );

      const getShiftTimes = (shift) => {
        let startTime = null;
        let endTime = null;
        if (!shift) return { startTime, endTime };

        startTime = shift.employeeAssignment?.startTime || null;
        endTime = shift.employeeAssignment?.endTime || null;

        if (!startTime) startTime = shift.timeSlots?.[0]?.startTime || null;
        if (!endTime) endTime = shift.timeSlots?.[0]?.endTime || null;

        if (!startTime) startTime = shift.startTime || null;
        if (!endTime) endTime = shift.endTime || null;

        return { startTime, endTime };
      };

      const defaultShift = employeeShifts[0] || null;
      const defaultShiftTimes = getShiftTimes(defaultShift);

      let lateComingDays = 0;
      const lateComingDetails = [];
      const checkedLateDates = new Set();

      employeeAttendance.forEach((attendance) => {
        if (!attendance.checkInTime) return;

        const checkIn = new Date(attendance.checkInTime);

        const dateKey = `${checkIn.getFullYear()}-${String(
          checkIn.getMonth() + 1
        ).padStart(2, "0")}-${String(checkIn.getDate()).padStart(2, "0")}`;

        if (checkedLateDates.has(dateKey)) return;
        checkedLateDates.add(dateKey);

        let selectedShift = defaultShift;

        const matchingShift = employeeShifts
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

        if (matchingShift.length > 0) {
          selectedShift = matchingShift[0];
        }

        const { startTime, endTime } = getShiftTimes(selectedShift);

        if (!startTime) return;

        const timeParts = String(startTime).split(":").map(Number);
        if (
          timeParts.length < 2 ||
          Number.isNaN(timeParts[0]) ||
          Number.isNaN(timeParts[1])
        ) return;

        const shiftStart = new Date(checkIn);
        shiftStart.setHours(timeParts[0], timeParts[1], 0, 0);

        const graceTime = new Date(shiftStart.getTime() + 5 * 60 * 1000);

        if (checkIn > shiftStart) {
          lateComingDays++;

          const lateByMinutes = Math.floor((checkIn - shiftStart) / 60000);

          lateComingDetails.push({
            date: dateKey,
            shiftType: selectedShift?.shiftType || employee.shiftType || null,
            shiftName: selectedShift?.shiftName || null,
            shiftStartTime: startTime,
            shiftEndTime: endTime,
            shiftStart: shiftStart.toISOString(),
            graceTime: graceTime.toISOString(),
            checkInTime: checkIn.toISOString(),
            lateByMinutes,
          });
        }
      });

      let lateComingScore = 100;
      if (expectedWorkingDays > 0) {
        lateComingScore =
          ((expectedWorkingDays - lateComingDays) / expectedWorkingDays) * 100;
      }
      lateComingScore = Math.max(0, Math.min(lateComingScore, 100));

      const totalScore = lateComingScore + workingDaysScore + workingHoursScore;
      const performancePercentage = totalScore / 3;

      return {
        employeeId: employee._id,
        employeeCode: employee.employeeId,
        name: employee.name,
        email: employee.email,
        department: employee.department,
        shiftType: employee.shiftType,
        shiftHours,
        shiftStartTime: defaultShiftTimes.startTime,
        shiftEndTime: defaultShiftTimes.endTime,
        month,
        year,
        totalDays,
        weekOffCount,
        expectedWorkingDays,
        presentDays,
        absentDays,
        lateComingDays,
        lateComingDetails,
        expectedWorkingHours: Number(expectedWorkingHours.toFixed(2)),
        actualWorkingHours: Number(actualWorkingHours.toFixed(2)),
        lateComingScore: Number(lateComingScore.toFixed(2)),
        workingDaysScore: Number(workingDaysScore.toFixed(2)),
        workingHoursScore: Number(workingHoursScore.toFixed(2)),
        totalScore: Number(totalScore.toFixed(2)),
        performancePercentage: Number(performancePercentage.toFixed(2)),
      };
    });

    performers.sort((a, b) => {
      if (b.performancePercentage !== a.performancePercentage) {
        return b.performancePercentage - a.performancePercentage;
      }
      if (b.presentDays !== a.presentDays) {
        return b.presentDays - a.presentDays;
      }
      if (b.actualWorkingHours !== a.actualWorkingHours) {
        return b.actualWorkingHours - a.actualWorkingHours;
      }
      return a.lateComingDays - b.lateComingDays;
    });

    return res.status(200).json({
      success: true,
      month,
      year,
      totalEmployees: employees.length,
      performers,
    });

  } catch (error) {
    console.error("Get All Performers Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get all performers",
      error: error.message,
    });
  }
};


// ======================================================
// DEPARTMENT PERFORMANCE (helper — summary me use hoga)
// ======================================================

const calculateDepartmentPerformance = (employees, attendanceRecords, shifts, month, year) => {
  const totalDays = new Date(year, month, 0).getDate();

  const departmentMap = {};

  employees.forEach((employee) => {
    const department = employee.department || "Other";
    if (!departmentMap[department]) {
      departmentMap[department] = [];
    }
    departmentMap[department].push(employee);
  });

  const departmentPerformance = Object.entries(departmentMap).map(
    ([departmentName, departmentEmployees]) => {

      let totalDepartmentScore = 0;
      const totalDepartmentEmployees = departmentEmployees.length;
      let totalPresentDays = 0;
      let totalExpectedDays = 0;
      let totalActualHours = 0;
      let totalExpectedHours = 0;
      let totalLateDays = 0;

      departmentEmployees.forEach((employee) => {

        const employeeId = String(employee.employeeId);

        const employeeAttendance = attendanceRecords.filter(
          (attendance) => String(attendance.employeeId) === employeeId
        );

        const shiftHours = Number(employee.shiftHours) > 0
          ? Number(employee.shiftHours)
          : 8;

        let weekOffCount = Number(employee.weekOffCount) || 0;
        weekOffCount = Math.min(Math.max(weekOffCount, 0), totalDays);

        const expectedWorkingDays = Math.max(totalDays - weekOffCount, 0);

        const presentDates = new Set();

        employeeAttendance.forEach((attendance) => {
          if (attendance.checkInTime || attendance.checkOutTime) {
            const date = new Date(
              attendance.checkInTime || attendance.checkOutTime
            );
            const dateKey = `${date.getFullYear()}-${String(
              date.getMonth() + 1
            ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
            presentDates.add(dateKey);
          }
        });

        const presentDays = presentDates.size;

        let workingDaysScore = 0;
        if (expectedWorkingDays > 0) {
          workingDaysScore = (presentDays / expectedWorkingDays) * 100;
        }
        workingDaysScore = Math.min(workingDaysScore, 100);

        let actualWorkingHours = 0;
        employeeAttendance.forEach((attendance) => {
          actualWorkingHours += Number(attendance.workingHours) || 0;
        });

        const expectedWorkingHours = expectedWorkingDays * shiftHours;

        let workingHoursScore = 0;
        if (expectedWorkingHours > 0) {
          workingHoursScore = (actualWorkingHours / expectedWorkingHours) * 100;
        }
        workingHoursScore = Math.min(workingHoursScore, 100);

        const employeeShift = shifts.find(
          (shift) =>
            String(shift.employeeAssignment?.employeeId) === employeeId ||
            String(shift.employeeId) === employeeId
        );

        let shiftStartTime = null;
        if (employeeShift) {
          shiftStartTime =
            employeeShift.employeeAssignment?.startTime ||
            employeeShift.startTime ||
            null;
        }

        let lateComingDays = 0;
        if (shiftStartTime) {
          employeeAttendance.forEach((attendance) => {
            if (!attendance.checkInTime) return;

            const checkIn = new Date(attendance.checkInTime);
            const timeParts = shiftStartTime.split(":").map(Number);

            const shiftStart = new Date(checkIn);
            shiftStart.setHours(timeParts[0] || 0, timeParts[1] || 0, 0, 0);

            if (checkIn > shiftStart) lateComingDays++;
          });
        }

        let lateComingScore = 100;
        if (expectedWorkingDays > 0) {
          lateComingScore =
            ((expectedWorkingDays - lateComingDays) / expectedWorkingDays) * 100;
        }
        lateComingScore = Math.max(0, Math.min(lateComingScore, 100));

        const employeeTotalScore =
          lateComingScore + workingDaysScore + workingHoursScore;

        const employeePercentage = employeeTotalScore / 3;

        totalDepartmentScore += employeePercentage;
        totalPresentDays += presentDays;
        totalExpectedDays += expectedWorkingDays;
        totalActualHours += actualWorkingHours;
        totalExpectedHours += expectedWorkingHours;
        totalLateDays += lateComingDays;
      });

      const departmentRate = totalDepartmentEmployees > 0
        ? totalDepartmentScore / totalDepartmentEmployees
        : 0;

      let color = "#10b981";
      if (departmentRate >= 90) color = "#10b981";
      else if (departmentRate >= 75) color = "#34d399";
      else if (departmentRate >= 60) color = "#facc15";
      else color = "#f97316";

      return {
        name: departmentName,
        rate: Number(departmentRate.toFixed(2)),
        color,
        employeeCount: totalDepartmentEmployees,
        presentDays: totalPresentDays,
        expectedWorkingDays: totalExpectedDays,
        actualWorkingHours: Number(totalActualHours.toFixed(2)),
        expectedWorkingHours: Number(totalExpectedHours.toFixed(2)),
        lateComingDays: totalLateDays,
      };
    }
  );

  departmentPerformance.sort((a, b) => b.rate - a.rate);
  return departmentPerformance;
};


// ======================================================
// GET DEPARTMENT PERFORMANCE (route ke liye — standalone)
// ======================================================

const getDepartmentPerformance = async (req, res) => {
  try {
    const now = new Date();
    const month = Number(req.query.month) || now.getMonth() + 1;
    const year = Number(req.query.year) || now.getFullYear();

    const startDate = new Date(year, month - 1, 1);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(year, month, 0);
    endDate.setHours(23, 59, 59, 999);

    const employees = await Employee.find({ status: "active" }).lean();

    const attendanceRecords = await Attendance.find({
      createdAt: { $gte: startDate, $lte: endDate },
    }).lean();

    const shifts = await Shift.find({ isActive: true }).lean();

    const departmentPerformance = calculateDepartmentPerformance(
      employees,
      attendanceRecords,
      shifts,
      month,
      year
    );

    return res.status(200).json({
      success: true,
      month,
      year,
      departmentPerformance,
    });

  } catch (error) {
    console.error("Department Performance Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to calculate department performance",
      error: error.message,
    });
  }
};


// ======================================================
// GET ALL DEPARTMENTS
// ======================================================

const getAllDepartment = async (req, res) => {
  try {
    const departments = await Employee.distinct("department", {
      status: "active",
      department: { $exists: true, $ne: "", $ne: null },
    });

    const allDepartments = departments.filter(Boolean).sort((a, b) => a.localeCompare(b));

    return res.status(200).json({
      success: true,
      totalDepartments: allDepartments.length,
      departments: allDepartments,
    });

  } catch (error) {
    console.error("Get All Departments Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get departments",
      error: error.message,
    });
  }
};


// ======================================================
// GET EMPLOYEE PERFORMANCE
// ======================================================

const getEmployeePerformance = async (req, res) => {
  try {
    const { employeeId } = req.params;
    if (!employeeId) {
      return res.status(400).json({ success: false, message: "Employee ID is required" });
    }

    const now = new Date();
    const month = Number(req.query.month) || now.getMonth() + 1;
    const year = Number(req.query.year) || now.getFullYear();

    const startDate = new Date(year, month - 1, 1);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(year, month, 0);
    endDate.setHours(23, 59, 59, 999);

    const totalDays = new Date(year, month, 0).getDate();

    let employee = null;
    if (mongoose.Types.ObjectId.isValid(employeeId)) {
      employee = await Employee.findById(employeeId).lean();
    }
    if (!employee) {
      employee = await Employee.findOne({ employeeId }).lean();
    }
    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    const attendanceRecords = await Attendance.find({
      createdAt: { $gte: startDate, $lte: endDate },
    }).lean();

    const shifts = await Shift.find({ isActive: true }).lean();

    const employeeCode = String(employee.employeeId);
    const employeeMongoId = String(employee._id);

    const employeeAttendance = attendanceRecords.filter((attendance) => {
      const attendanceEmployeeId = String(attendance.employeeId);
      return (
        attendanceEmployeeId === employeeCode ||
        attendanceEmployeeId === employeeMongoId
      );
    });

    let shiftHours = Number(employee.shiftHours);
    if (!shiftHours || shiftHours <= 0) shiftHours = 8;

    let weekOffCount = Number(employee.weekOffCount) || 0;
    weekOffCount = Math.min(Math.max(weekOffCount, 0), totalDays);

    const expectedWorkingDays = Math.max(totalDays - weekOffCount, 0);

    const presentDates = new Set();

    employeeAttendance.forEach((attendance) => {
      if (
        attendance.checkInTime ||
        attendance.checkOutTime ||
        attendance.status === "checked-in" ||
        attendance.status === "checked-out" ||
        attendance.status === "on-break"
      ) {
        const attendanceDate = new Date(
          attendance.checkInTime ||
          attendance.checkOutTime ||
          attendance.createdAt
        );

        const dateKey = `${attendanceDate.getFullYear()}-${String(
          attendanceDate.getMonth() + 1
        ).padStart(2, "0")}-${String(attendanceDate.getDate()).padStart(2, "0")}`;

        presentDates.add(dateKey);
      }
    });

    const presentDays = presentDates.size;
    const absentDays = Math.max(expectedWorkingDays - presentDays, 0);

    let workingDaysScore = 0;
    if (expectedWorkingDays > 0) {
      workingDaysScore = (presentDays / expectedWorkingDays) * 100;
    }
    workingDaysScore = Math.min(Math.max(workingDaysScore, 0), 100);

    let actualWorkingHours = 0;
    employeeAttendance.forEach((attendance) => {
      actualWorkingHours += Number(attendance.workingHours) || 0;
    });

    const expectedWorkingHours = expectedWorkingDays * shiftHours;

    let workingHoursScore = 0;
    if (expectedWorkingHours > 0) {
      workingHoursScore = (actualWorkingHours / expectedWorkingHours) * 100;
    }
    workingHoursScore = Math.min(Math.max(workingHoursScore, 0), 100);

    const employeeShift = shifts.find((shift) => {
      const assignedEmployee = String(shift.employeeAssignment?.employeeId);
      const shiftEmployee = String(shift.employeeId);
      return (
        assignedEmployee === employeeCode ||
        assignedEmployee === employeeMongoId ||
        shiftEmployee === employeeCode ||
        shiftEmployee === employeeMongoId
      );
    });

    let shiftStartTime = null;
    if (employeeShift) {
      shiftStartTime =
        employeeShift.employeeAssignment?.startTime ||
        employeeShift.startTime ||
        null;
    }

    let lateComingDays = 0;
    const checkedLateDates = new Set();

    if (shiftStartTime) {
      employeeAttendance.forEach((attendance) => {
        if (!attendance.checkInTime) return;

        const checkIn = new Date(attendance.checkInTime);

        const dateKey = `${checkIn.getFullYear()}-${String(
          checkIn.getMonth() + 1
        ).padStart(2, "0")}-${String(checkIn.getDate()).padStart(2, "0")}`;

        if (checkedLateDates.has(dateKey)) return;
        checkedLateDates.add(dateKey);

        const timeParts = String(shiftStartTime).split(":").map(Number);

        const shiftStart = new Date(checkIn);
        shiftStart.setHours(timeParts[0] || 0, timeParts[1] || 0, 0, 0);

        if (checkIn > shiftStart) lateComingDays++;
      });
    }

    let lateComingScore = 100;
    if (expectedWorkingDays > 0) {
      lateComingScore =
        ((expectedWorkingDays - lateComingDays) / expectedWorkingDays) * 100;
    }
    lateComingScore = Math.max(0, Math.min(lateComingScore, 100));

    const totalScore = lateComingScore + workingDaysScore + workingHoursScore;
    const performancePercentage = totalScore / 3;

    return res.status(200).json({
      success: true,
      employee: {
        employeeId: employee._id,
        employeeCode: employee.employeeId,
        name: employee.name,
        email: employee.email,
        department: employee.department,
      },
      month,
      year,
      totalDays,
      weekOffCount,
      expectedWorkingDays,
      presentDays,
      absentDays,
      lateComingDays,
      expectedWorkingHours: Number(expectedWorkingHours.toFixed(2)),
      actualWorkingHours: Number(actualWorkingHours.toFixed(2)),
      lateComingScore: Number(lateComingScore.toFixed(2)),
      workingDaysScore: Number(workingDaysScore.toFixed(2)),
      workingHoursScore: Number(workingHoursScore.toFixed(2)),
      totalScore: Number(totalScore.toFixed(2)),
      performancePercentage: Number(performancePercentage.toFixed(2)),
      shiftType: employee.shiftType,
      shiftHours,
      shiftStartTime,
    });

  } catch (error) {
    console.error("Get Employee Performance Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch employee performance",
      error: error.message,
    });
  }
};


// ======================================================
// ✅ COMBINED DASHBOARD SUMMARY — ek hi API me SAB data
// ======================================================

const getDashboardSummary = async (req, res) => {
  try {
    const now = new Date();
    const month = Number(req.query.month) || now.getMonth() + 1;
    const year = Number(req.query.year) || now.getFullYear();

    // Month range (Date objects — Attendance ke liye)
    const startOfMonth = new Date(year, month - 1, 1);
    startOfMonth.setHours(0, 0, 0, 0);
    const endOfMonth = new Date(year, month, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    const totalDays = new Date(year, month, 0).getDate();

    // ─── PARALLEL FETCH ALL DATA ───
    const [
      employees,
      masterShifts,
      assignments,
      attendanceRecords,
      leaves,
      allActiveShifts
    ] = await Promise.all([
      Employee.find({ status: "active" }).lean(),
      Shift.find({ isMasterShift: true, isActive: true }).lean(),
      Shift.find({
        isMasterShift: false,
        isActive: true,
        "employeeAssignment.employeeId": { $exists: true }
      }).lean(),
      Attendance.find({
        createdAt: { $gte: startOfMonth, $lte: endOfMonth }
      }).lean(),
      // ✅ SIMPLE: Saari leaves laao (jaise /leaves/leaves endpoint me hota hai)
      Leave.find({}).sort({ createdAt: -1 }).lean(),
      Shift.find({ isActive: true }).lean()
    ]);

    console.log(`✅ [SUMMARY] Leaves fetched: ${leaves.length}`);

    // ─── HELPER: date key ───
    const toDateKey = (d) => {
      if (!d) return "";
      const date = new Date(d);
      if (isNaN(date.getTime())) return "";
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    };

    // ─── HELPER: employee shift timing ───
    const getEmployeeShift = (employeeId) => {
      const assignment = assignments.find(
        (a) => String(a.employeeAssignment?.employeeId) === String(employeeId)
      );
      if (!assignment) return { start: "09:00", end: "18:00", grace: 5 };

      const master = masterShifts.find((m) => m.shiftType === assignment.shiftType);
      if (!master || !master.timeSlots?.length) {
        return { start: "09:00", end: "18:00", grace: 5 };
      }

      const slot = master.timeSlots[0];
      const [start, end] = (slot.timeRange || "").split("-").map((s) => s.trim());
      return {
        start: start || "09:00",
        end: end || "18:00",
        grace: master.graceMinutes ?? 5
      };
    };

    // ─── LATEST WORKING DATE ───
    const monthAttendance = attendanceRecords.filter((r) => r.checkInTime);
    const uniqueDates = Array.from(
      new Set(monthAttendance.map((r) => toDateKey(r.checkInTime)))
    ).sort();
    const latestDate =
      uniqueDates.length > 0
        ? uniqueDates[uniqueDates.length - 1]
        : toDateKey(new Date());

    // ─── TODAY COUNTS ───
    const todayRecords = attendanceRecords.filter(
      (r) => r.checkInTime && toDateKey(r.checkInTime) === latestDate
    );

    const presentIds = new Set(
      todayRecords.map((r) =>
        String(
          typeof r.employeeId === "object"
            ? r.employeeId.employeeId || r.employeeId._id
            : r.employeeId
        )
      )
    );

    const onTimeIds = new Set();
    const lateIds = new Set();
    const forgotCheckoutIds = new Set();

    todayRecords.forEach((r) => {
      const empId = String(
        typeof r.employeeId === "object"
          ? r.employeeId.employeeId || r.employeeId._id
          : r.employeeId
      );
      const shift = getEmployeeShift(empId);
      const checkIn = new Date(r.checkInTime);

      const match = shift.start.match(/(\d{1,2}):(\d{2})/);
      const [sh, sm] = match ? match.slice(1).map(Number) : [9, 0];

      const shiftStart = new Date(checkIn);
      shiftStart.setHours(sh, sm, 0, 0);
      const graceTime = new Date(shiftStart.getTime() + (shift.grace || 5) * 60000);

      if (checkIn <= graceTime) onTimeIds.add(empId);
      else lateIds.add(empId);

      if (!r.checkOutTime) forgotCheckoutIds.add(empId);
    });

    const totalEmployees = employees.length;

    // ─── ON LEAVE TODAY ───
    const onLeaveIds = new Set();
    const targetDate = new Date(latestDate);
    targetDate.setHours(0, 0, 0, 0);

    leaves.forEach((l) => {
      if (l.status !== "approved" && l.status !== "manager_approved") return;

      const start = new Date(l.startDate || l.date);
      const end = new Date(l.endDate || l.startDate || l.date);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      if (targetDate >= start && targetDate <= end) {
        onLeaveIds.add(
          String(
            typeof l.employeeId === "object"
              ? l.employeeId.employeeId || l.employeeId._id
              : l.employeeId
          )
        );
      }
    });

    // ─── BIRTHDAYS TODAY ───
    const today = new Date();
    const todayMD = `${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const birthdaysToday = employees
      .filter((e) => {
        if (!e.dateOfBirth) return false;
        const d = new Date(e.dateOfBirth);
        const md = `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        return md === todayMD;
      })
      .map((e) => ({
        employeeId: e.employeeId,
        name: e.name,
        email: e.email
      }));

    // ─── MONTHLY TREND (12 months of the year) ───
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year, 11, 31, 23, 59, 59);

    const [allAttendanceForYear, allLeavesForYear] = await Promise.all([
      Attendance.find({
        createdAt: { $gte: yearStart, $lte: yearEnd }
      }).lean(),
      // ✅ Simple: saari approved leaves laao
      Leave.find({
        status: { $in: ["approved", "manager_approved"] }
      }).lean()
    ]);

    const monthlyTrend = [];
    for (let m = 0; m < 12; m++) {
      const daysInMonth = new Date(year, m + 1, 0).getDate();
      let workingDays = 0;
      for (let d = 1; d <= daysInMonth; d++) {
        if (new Date(year, m, d).getDay() !== 0) workingDays++;
      }

      const totalPossible = totalEmployees * Math.max(workingDays, 1);
      const present = allAttendanceForYear.filter((r) => {
        if (!r.checkInTime) return false;
        const d = new Date(r.checkInTime);
        return d.getFullYear() === year && d.getMonth() === m;
      }).length;

      const rate = totalPossible > 0 ? Math.min(100, Math.round((present / totalPossible) * 100)) : 0;

      // ✅ Simple month filter
      const monthLeaves = allLeavesForYear.filter((l) => {
        const d = new Date(l.startDate || l.date);
        return d.getFullYear() === year && d.getMonth() === m;
      });

      const leaveDetailMap = {};
      let totalLeaveDays = 0;
      monthLeaves.forEach((l) => {
        const name = l.employeeName || "Unknown";
        const days = l.days || 1;
        totalLeaveDays += days;
        leaveDetailMap[name] = (leaveDetailMap[name] || 0) + days;
      });

      monthlyTrend.push({
        month: monthNames[m],
        rate,
        leavesCount: monthLeaves.length,
        leavesDays: totalLeaveDays,
        leaveDetails: Object.entries(leaveDetailMap)
          .map(([name, days]) => ({ name, days }))
          .sort((a, b) => b.days - a.days)
      });
    }

    // ─── HEATMAP GRID ───
    const firstDay = new Date(year, month - 1, 1).getDay();
    const firstDayIndex = firstDay === 0 ? 6 : firstDay - 1;
    const daysInMonth = new Date(year, month, 0).getDate();
    const heatmapGrid = [];
    let dayCounter = 1;

    for (let w = 0; w < 5; w++) {
      const week = [];
      for (let d = 0; d < 7; d++) {
        const idx = w * 7 + d;
        if (idx < firstDayIndex || dayCounter > daysInMonth) {
          week.push({ day: null, rate: 0 });
        } else {
          const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(dayCounter).padStart(2, "0")}`;
          const pres = new Set(
            attendanceRecords
              .filter((r) => r.checkInTime && toDateKey(r.checkInTime) === dateStr)
              .map((r) =>
                String(
                  typeof r.employeeId === "object"
                    ? r.employeeId.employeeId || r.employeeId._id
                    : r.employeeId
                )
              )
          ).size;
          const rate = totalEmployees > 0 ? (pres / totalEmployees) * 100 : 0;
          week.push({ day: dayCounter, rate, dateStr });
          dayCounter++;
        }
      }
      heatmapGrid.push(week);
    }

    // ─── ✅ TOP PERFORMERS ───
    const performersData = employees.map((employee) => {
      const employeeId = String(employee.employeeId);
      const employeeAttendance = attendanceRecords.filter(
        (attendance) => String(attendance.employeeId) === employeeId
      );

      let shiftHours = Number(employee.shiftHours);
      if (!shiftHours || shiftHours <= 0) shiftHours = 8;

      let weekOffCount = Number(employee.weekOffCount) || 0;
      weekOffCount = Math.min(Math.max(weekOffCount, 0), totalDays);

      const expectedWorkingDays = Math.max(totalDays - weekOffCount, 0);

      const presentDates = new Set();
      employeeAttendance.forEach((attendance) => {
        if (
          attendance.checkInTime ||
          attendance.checkOutTime ||
          attendance.status === "checked-in" ||
          attendance.status === "checked-out" ||
          attendance.status === "on-break"
        ) {
          const attendanceDate = new Date(
            attendance.checkInTime ||
            attendance.checkOutTime ||
            attendance.createdAt
          );
          const dateKey = toDateKey(attendanceDate);
          presentDates.add(dateKey);
        }
      });

      const presentDays = presentDates.size;
      const absentDays = Math.max(expectedWorkingDays - presentDays, 0);

      let workingDaysScore = 0;
      if (expectedWorkingDays > 0) {
        workingDaysScore = (presentDays / expectedWorkingDays) * 100;
      }
      workingDaysScore = Math.min(Math.max(workingDaysScore, 0), 100);

      let actualWorkingHours = 0;
      employeeAttendance.forEach((attendance) => {
        actualWorkingHours += Number(attendance.workingHours) || 0;
      });

      const expectedWorkingHours = expectedWorkingDays * shiftHours;

      let workingHoursScore = 0;
      if (expectedWorkingHours > 0) {
        workingHoursScore = (actualWorkingHours / expectedWorkingHours) * 100;
      }
      workingHoursScore = Math.min(Math.max(workingHoursScore, 0), 100);

      const employeeShifts = allActiveShifts.filter(
        (shift) =>
          String(shift.employeeAssignment?.employeeId) === employeeId ||
          String(shift.employeeId) === employeeId
      );

      const defaultShift = employeeShifts[0] || null;
      let defaultStartTime =
        defaultShift?.employeeAssignment?.startTime ||
        defaultShift?.timeSlots?.[0]?.startTime ||
        defaultShift?.startTime ||
        null;

      let lateComingDays = 0;
      const checkedLateDates = new Set();

      if (defaultStartTime) {
        employeeAttendance.forEach((attendance) => {
          if (!attendance.checkInTime) return;

          const checkIn = new Date(attendance.checkInTime);
          const dateKey = toDateKey(checkIn);
          if (checkedLateDates.has(dateKey)) return;
          checkedLateDates.add(dateKey);

          const timeParts = String(defaultStartTime).split(":").map(Number);
          const shiftStart = new Date(checkIn);
          shiftStart.setHours(timeParts[0] || 0, timeParts[1] || 0, 0, 0);

          if (checkIn > shiftStart) lateComingDays++;
        });
      }

      let lateComingScore = 100;
      if (expectedWorkingDays > 0) {
        lateComingScore =
          ((expectedWorkingDays - lateComingDays) / expectedWorkingDays) * 100;
      }
      lateComingScore = Math.max(0, Math.min(lateComingScore, 100));

      const totalScore = lateComingScore + workingDaysScore + workingHoursScore;
      const performancePercentage = totalScore / 3;

      return {
        employeeId: employee._id,
        employeeCode: employee.employeeId,
        name: employee.name,
        email: employee.email,
        department: employee.department,
        shiftType: employee.shiftType,
        shiftHours,
        month,
        year,
        totalDays,
        weekOffCount,
        expectedWorkingDays,
        presentDays,
        absentDays,
        lateComingDays,
        expectedWorkingHours: Number(expectedWorkingHours.toFixed(2)),
        actualWorkingHours: Number(actualWorkingHours.toFixed(2)),
        lateComingScore: Number(lateComingScore.toFixed(2)),
        workingDaysScore: Number(workingDaysScore.toFixed(2)),
        workingHoursScore: Number(workingHoursScore.toFixed(2)),
        totalScore: Number(totalScore.toFixed(2)),
        performancePercentage: Number(performancePercentage.toFixed(2)),
      };
    });

    performersData.sort((a, b) => {
      if (b.performancePercentage !== a.performancePercentage) {
        return b.performancePercentage - a.performancePercentage;
      }
      if (b.presentDays !== a.presentDays) {
        return b.presentDays - a.presentDays;
      }
      if (b.actualWorkingHours !== a.actualWorkingHours) {
        return b.actualWorkingHours - a.actualWorkingHours;
      }
      return a.lateComingDays - b.lateComingDays;
    });

    const topPerformers = performersData.slice(0, 5);

    // ─── ✅ DEPARTMENT PERFORMANCE ───
    const departmentPerformance = calculateDepartmentPerformance(
      employees,
      attendanceRecords,
      allActiveShifts,
      month,
      year
    );

    // ─── RESPONSE ───
    return res.status(200).json({
      success: true,
      data: {
        stats: {
          totalEmployees,
          presentToday: presentIds.size,
          absentToday: Math.max(0, totalEmployees - presentIds.size),
          lateToday: lateIds.size,
          onTimeToday: onTimeIds.size,
          onLeaveToday: onLeaveIds.size,
          forgotCheckoutToday: forgotCheckoutIds.size,
          latestDate
        },
        employees,
        masterShifts,
        assignments,
        attendance: attendanceRecords,
        leaves,
        birthdaysToday,
        monthlyTrend,
        heatmapGrid,
        topPerformers,
        departmentPerformance
      }
    });
  } catch (error) {
    console.error("❌ Dashboard summary error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get dashboard summary",
      error: error.message
    });
  }
};


// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  getTopPerformers,
  getAllPerformers,
  getDepartmentPerformance,
  getEmployeePerformance,
  getAllDepartment,
  getDashboardSummary,
};