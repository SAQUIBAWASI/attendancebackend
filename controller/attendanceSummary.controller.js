const Attendance = require("../models/Attendance");
const AttendanceSummary = require("../models/AttendanceSummary");
const Employee = require("../models/Employee");

/**
 * 📌 Save Attendance Summary
 */
exports.saveSummary = async (req, res) => {
  try {
    const { summaries, fromDate, toDate, month } = req.body;

    if (!summaries || !Array.isArray(summaries)) {
      return res.status(400).json({ message: "Invalid summary data" });
    }

    // Remove old data for same month (optional)
    if (month) {
      await AttendanceSummary.deleteMany({ month });
    }

    const insertData = summaries.map((s) => ({
      ...s,
      fromDate,
      toDate,
      month,
    }));

    await AttendanceSummary.insertMany(insertData);

    res.json({
      message: "Summary saved successfully",
      count: insertData.length,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * 📌 Get Summary for Payroll
 */
exports.getSummary = async (req, res) => {
  try {
    const { month } = req.query;

    const filter = month ? { month } : {};

    const data = await AttendanceSummary.find(filter);

    res.json({
      count: data.length,
      summary: data,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// exports.calculateSummary = async (req, res) => {
//   try {
//     const { fromDate, toDate, month } = req.body;

//     // Build query based on filters
//     let query = {};
    
//     if (fromDate && toDate) {
//       query.checkInTime = {
//         $gte: new Date(fromDate),
//         $lte: new Date(toDate)
//       };
//     } else if (month) {
//       const [year, monthNum] = month.split('-');
//       const startDate = new Date(year, monthNum - 1, 1);
//       const endDate = new Date(year, monthNum, 0, 23, 59, 59);
      
//       query.checkInTime = {
//         $gte: startDate,
//         $lte: endDate
//       };
//     }

//     // Fetch all attendance records with filters
//     const attendanceRecords = await Attendance.find(query).sort({ checkInTime: -1 });
    
//     // Fetch all employees
//     const employees = await Employee.find({});

//     // Generate summary
//     const summaryMap = {};

//     attendanceRecords.forEach((rec) => {
//       const id = rec.employeeId;
//       const checkInDate = new Date(rec.checkInTime);
//       const monthYear = checkInDate.toLocaleString('en-IN', { 
//         month: 'long', 
//         year: 'numeric' 
//       });

//       const employee = employees.find(
//         (e) => e.employeeId === id || e._id.toString() === id || e.empId === id
//       );

//       if (!summaryMap[id]) {
//         summaryMap[id] = {
//           employeeId: id,
//           name: employee?.name || employee?.fullName || "N/A",
//           presentDays: 0,
//           lateDays: 0,
//           onsiteDays: 0,
//           halfDayLeaves: 0,
//           fullDayLeaves: 0,
//           totalWorkingDays: 0,
//           month: monthYear,
//           // Salary calculation fields
//           shiftHours: employee?.shiftHours || 8,
//           salaryPerMonth: employee?.salaryPerMonth || 30000,
//           calculatedSalary: 0,
//           workingDays: 0,
//           halfDays: 0
//         };
//       }

//       const emp = summaryMap[id];

//       if (rec.checkInTime) emp.presentDays += 1;

//       const checkIn = new Date(rec.checkInTime);
//       const hours = checkIn.getHours();
//       const minutes = checkIn.getMinutes();

//       // Late if check-in after 10:00 AM
//       if (hours > 10 || (hours === 10 && minutes > 0)) emp.lateDays += 1;

//       if (rec.onsite) emp.onsiteDays += 1;

//       if (rec.checkInTime && rec.checkOutTime) {
//         const checkOut = new Date(rec.checkOutTime);
//         const diffHrs = (checkOut - checkIn) / (1000 * 60 * 60);

//         if (diffHrs < 4) {
//           emp.fullDayLeaves += 1;
//         } else if (diffHrs < 8.8) {
//           emp.halfDayLeaves += 1;
//         }
//       }
//     });

//     // Calculate total working days and salary
//     Object.values(summaryMap).forEach((emp) => {
//       // Calculate working days (full days worked)
//       emp.workingDays = emp.presentDays - emp.fullDayLeaves - emp.halfDayLeaves;
//       emp.halfDays = emp.halfDayLeaves;
      
//       // Calculate total working days for display (with half days as 0.5)
//       emp.totalWorkingDays = emp.presentDays - (emp.fullDayLeaves + emp.halfDayLeaves / 2);
//       emp.totalWorkingDays = Math.max(emp.totalWorkingDays, 0);

//       // Calculate salary based on working days
//       const totalWorkingDaysInMonth = 22; // Standard working days in a month
//       const dailySalary = emp.salaryPerMonth / totalWorkingDaysInMonth;
      
//       // Calculate effective working days (full days + half days as 0.5)
//       const effectiveWorkingDays = emp.workingDays + (emp.halfDays * 0.5);
      
//       // Calculate final salary
//       emp.calculatedSalary = Math.round(effectiveWorkingDays * dailySalary);
      
//       // Ensure salary doesn't exceed monthly salary
//       emp.calculatedSalary = Math.min(emp.calculatedSalary, emp.salaryPerMonth);
//     });

//     const employeeSummary = Object.values(summaryMap);

//     res.json({
//       success: true,
//       summary: employeeSummary,
//       totalRecords: employeeSummary.length
//     });

//   } catch (error) {
//     console.error('Error calculating summary:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error calculating attendance summary',
//       error: error.message
//     });
//   }
// };

exports.calculateSummary = async (req, res) => {
  try {
    const { fromDate, toDate, month } = req.body;

    // Build query based on filters
    let query = {};
    
    if (fromDate && toDate) {
      query.checkInTime = {
        $gte: new Date(fromDate),
        $lte: new Date(toDate)
      };
    } else if (month) {
      const [year, monthNum] = month.split('-');
      const startDate = new Date(year, monthNum - 1, 1);
      const endDate = new Date(year, monthNum, 0, 23, 59, 59);
      
      query.checkInTime = {
        $gte: startDate,
        $lte: endDate
      };
    }

    // Fetch attendance records
    const attendanceRecords = await Attendance.find(query).sort({ checkInTime: -1 });
    const employees = await Employee.find({});

    // Generate summary
    const summaryMap = {};

    attendanceRecords.forEach((rec) => {
      const id = rec.employeeId;
      const checkInDate = new Date(rec.checkInTime);
      const monthYear = checkInDate.toLocaleString('en-IN', { 
        month: 'long', 
        year: 'numeric' 
      });

      const employee = employees.find(
        (e) => e.employeeId === id || e._id.toString() === id || e.empId === id
      );

      if (!summaryMap[id]) {
        summaryMap[id] = {
          employeeId: id,
          name: employee?.name || employee?.fullName || "N/A",
          presentDays: 0,
          lateDays: 0,
          onsiteDays: 0,
          halfDayLeaves: 0,
          fullDayLeaves: 0,
          totalWorkingDays: 0,
          month: monthYear,
          shiftHours: employee?.shiftHours || 8,
          salaryPerMonth: employee?.salaryPerMonth || 30000,
          calculatedSalary: 0,
          workingDays: 0,
          halfDays: 0
        };
      }

      const emp = summaryMap[id];

      if (rec.checkInTime) emp.presentDays += 1;

      const checkIn = new Date(rec.checkInTime);
      const hours = checkIn.getHours();
      const minutes = checkIn.getMinutes();

      if (hours > 10 || (hours === 10 && minutes > 0)) emp.lateDays += 1;

      if (rec.onsite) emp.onsiteDays += 1;

      if (rec.checkInTime && rec.checkOutTime) {
        const checkOut = new Date(rec.checkOutTime);
        const diffHrs = (checkOut - checkIn) / (1000 * 60 * 60);

        if (diffHrs < 4) {
          emp.fullDayLeaves += 1;
        } else if (diffHrs < 8.8) {
          emp.halfDayLeaves += 1;
        }
      }
    });

    // Calculate totals and salary
    Object.values(summaryMap).forEach((emp) => {
      emp.workingDays = emp.presentDays - emp.fullDayLeaves - emp.halfDayLeaves;
      emp.halfDays = emp.halfDayLeaves;
      emp.totalWorkingDays = emp.presentDays - (emp.fullDayLeaves + emp.halfDayLeaves / 2);
      emp.totalWorkingDays = Math.max(emp.totalWorkingDays, 0);

      const totalWorkingDaysInMonth = 22;
      const dailySalary = emp.salaryPerMonth / totalWorkingDaysInMonth;

      const effectiveWorkingDays = emp.workingDays + (emp.halfDays * 0.5);
      emp.calculatedSalary = Math.round(effectiveWorkingDays * dailySalary);
      emp.calculatedSalary = Math.min(emp.calculatedSalary, emp.salaryPerMonth);
    });

    // Convert summary to array
    let employeeSummary = Object.values(summaryMap);

    // ⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐
    // ⭐ ADDING YOUR REQUESTED FILTER HERE ⭐
    // ⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐
    const employeeId = req.query.employeeId;

    if (employeeId) {
      employeeSummary = employeeSummary.filter(
        (e) => e.employeeId == employeeId
      );
    }
    // ⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐

    // Final Response
    res.json({
      success: true,
      summary: employeeSummary,
      totalRecords: employeeSummary.length
    });

  } catch (error) {
    console.error('Error calculating summary:', error);
    res.status(500).json({
      success: false,
      message: 'Error calculating attendance summary',
      error: error.message
    });
  }
};
