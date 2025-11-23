const Attendance = require("../models/Attendance");
const AttendanceSummary = require("../models/AttendanceSummary");
const Employee = require("../models/Employee");
const Leave = require("../models/Leave");

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

    // Fetch all attendance records with filters
    const attendanceRecords = await Attendance.find(query).sort({ checkInTime: -1 });
    
    // Fetch all employees
    const employees = await Employee.find({});

    // Fetch approved leaves for the period
    let leaveQuery = {};
    if (fromDate && toDate) {
      leaveQuery = {
        status: 'approved',
        $or: [
          { startDate: { $gte: new Date(fromDate), $lte: new Date(toDate) } },
          { endDate: { $gte: new Date(fromDate), $lte: new Date(toDate) } }
        ]
      };
    } else if (month) {
      const [year, monthNum] = month.split('-');
      const startDate = new Date(year, monthNum - 1, 1);
      const endDate = new Date(year, monthNum, 0, 23, 59, 59);
      
      leaveQuery = {
        status: 'approved',
        $or: [
          { startDate: { $gte: startDate, $lte: endDate } },
          { endDate: { $gte: startDate, $lte: endDate } }
        ]
      };
    }

    const approvedLeaves = await Leave.find(leaveQuery);

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
          // Salary calculation fields
          shiftHours: employee?.shiftHours || 8,
          salaryPerMonth: employee?.salaryPerMonth || 30000,
          weekOffPerMonth: employee?.weekOffPerMonth || 0,
          calculatedSalary: 0,
          workingDays: 0,
          halfDays: 0,
          approvedLeaves: 0
        };
      }

      const emp = summaryMap[id];

      // Count present days only if check-in exists
      if (rec.checkInTime) {
        emp.presentDays += 1;
      }

      // Late calculation - check if check-in after 10:00 AM
      const checkIn = new Date(rec.checkInTime);
      const hours = checkIn.getHours();
      const minutes = checkIn.getMinutes();
      if (hours > 10 || (hours === 10 && minutes > 0)) {
        emp.lateDays += 1;
      }

      // Onsite days
      if (rec.onsite) {
        emp.onsiteDays += 1;
      }

      // ✅ Calculate leaves based on totalHours
      const totalHours = rec.totalHours || 0;
      
      if (totalHours > 0) {
        if (totalHours < 4) {
          // Less than 4 hours = Full day leave
          emp.fullDayLeaves += 1;
        } else if (totalHours >= 4 && totalHours < 8) {
          // 4 hours or more but less than 8 hours = Half day leave
          emp.halfDayLeaves += 1;
        }
        // 8 hours or more = Full day work (no leave)
      } else {
        // If no hours recorded and no checkout, consider as full day leave
        if (!rec.checkOutTime) {
          emp.fullDayLeaves += 1;
        }
      }
    });

    // Count approved leaves for each employee
    approvedLeaves.forEach((leave) => {
      const employee = employees.find(
        (e) => e.employeeId === leave.employeeId || e._id.toString() === leave.employeeId
      );
      
      if (employee && summaryMap[employee.employeeId]) {
        summaryMap[employee.employeeId].approvedLeaves += leave.days || 1;
      }
    });

    // Calculate total working days and salary
    Object.values(summaryMap).forEach((emp) => {
      // Calculate total days in month
      const [monthName, year] = emp.month.split(' ');
      const monthIndex = new Date(Date.parse(monthName + " 1, " + year)).getMonth();
      const totalDaysInMonth = new Date(year, monthIndex + 1, 0).getDate();
      
      // Calculate total working days in month (excluding weekends and week offs)
      let totalWorkingDaysInMonth = 0;
      for (let day = 1; day <= totalDaysInMonth; day++) {
        const currentDate = new Date(year, monthIndex, day);
        const dayOfWeek = currentDate.getDay();
        // Count only weekdays (1-5 = Monday to Friday)
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
          totalWorkingDaysInMonth++;
        }
      }

      // Adjust for week offs per month
      totalWorkingDaysInMonth = Math.max(totalWorkingDaysInMonth - emp.weekOffPerMonth, 0);

      // Calculate actual working days (present - leaves from attendance)
      emp.workingDays = emp.presentDays - emp.fullDayLeaves - emp.halfDayLeaves;
      
      // Adjust for approved leaves
      const totalLeaves = emp.approvedLeaves + emp.fullDayLeaves;
      emp.workingDays = Math.max(emp.workingDays - emp.approvedLeaves, 0);

      emp.halfDays = emp.halfDayLeaves;
      
      // Calculate total working days for display (with half days as 0.5)
      emp.totalWorkingDays = emp.workingDays + (emp.halfDays * 0.5);
      emp.totalWorkingDays = Math.max(emp.totalWorkingDays, 0);

      // Calculate salary based on working days
      const dailySalary = emp.salaryPerMonth / totalWorkingDaysInMonth;
      
      // Calculate effective working days (full days + half days as 0.5)
      const effectiveWorkingDays = emp.workingDays + (emp.halfDays * 0.5);
      
      // Calculate final salary (considering total working days in month)
      emp.calculatedSalary = Math.round((effectiveWorkingDays / totalWorkingDaysInMonth) * emp.salaryPerMonth);
      
      // Ensure salary doesn't exceed monthly salary and is not negative
      emp.calculatedSalary = Math.max(0, Math.min(emp.calculatedSalary, emp.salaryPerMonth));
    });

    const employeeSummary = Object.values(summaryMap);

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

//     // Fetch attendance records
//     const attendanceRecords = await Attendance.find(query).sort({ checkInTime: -1 });
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

//     // Calculate totals and salary
//     Object.values(summaryMap).forEach((emp) => {
//       emp.workingDays = emp.presentDays - emp.fullDayLeaves - emp.halfDayLeaves;
//       emp.halfDays = emp.halfDayLeaves;
//       emp.totalWorkingDays = emp.presentDays - (emp.fullDayLeaves + emp.halfDayLeaves / 2);
//       emp.totalWorkingDays = Math.max(emp.totalWorkingDays, 0);

//       const totalWorkingDaysInMonth = 22;
//       const dailySalary = emp.salaryPerMonth / totalWorkingDaysInMonth;

//       const effectiveWorkingDays = emp.workingDays + (emp.halfDays * 0.5);
//       emp.calculatedSalary = Math.round(effectiveWorkingDays * dailySalary);
//       emp.calculatedSalary = Math.min(emp.calculatedSalary, emp.salaryPerMonth);
//     });

//     // Convert summary to array
//     let employeeSummary = Object.values(summaryMap);

//     // ⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐
//     // ⭐ ADDING YOUR REQUESTED FILTER HERE ⭐
//     // ⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐
//     const employeeId = req.query.employeeId;

//     if (employeeId) {
//       employeeSummary = employeeSummary.filter(
//         (e) => e.employeeId == employeeId
//       );
//     }
//     // ⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐

//     // Final Response
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
