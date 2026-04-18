// const Attendance = require("../models/Attendance");
// const AttendanceSummary = require("../models/AttendanceSummary");
// const Employee = require("../models/Employee");
// const Leave = require("../models/Leave");
// const Shift = require("../models/Shift");

// /**
//  * 📌 Save Attendance Summary
//  */
// exports.saveSummary = async (req, res) => {
//   try {
//     const { summaries, fromDate, toDate, month } = req.body;

//     if (!summaries || !Array.isArray(summaries)) {
//       return res.status(400).json({ message: "Invalid summary data" });
//     }

//     // Remove old data for same month (optional)
//     if (month) {
//       await AttendanceSummary.deleteMany({ month });
//     }

//     const insertData = summaries.map((s) => ({
//       ...s,
//       fromDate,
//       toDate,
//       month,
//     }));

//     await AttendanceSummary.insertMany(insertData);

//     res.json({
//       message: "Summary saved successfully",
//       count: insertData.length,
//     });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// /**
//  * 📌 Get Summary for Payroll
//  */
// exports.getSummary = async (req, res) => {
//   try {
//     const { month } = req.query;

//     const filter = month ? { month } : {};

//     const data = await AttendanceSummary.find(filter);

//     res.json({
//       count: data.length,
//       summary: data,
//     });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };


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

//     // Fetch approved leaves for the period
//     let leaveQuery = {};
//     if (fromDate && toDate) {
//       leaveQuery = {
//         status: 'approved',
//         $or: [
//           { startDate: { $gte: new Date(fromDate), $lte: new Date(toDate) } },
//           { endDate: { $gte: new Date(fromDate), $lte: new Date(toDate) } }
//         ]
//       };
//     } else if (month) {
//       const [year, monthNum] = month.split('-');
//       const startDate = new Date(year, monthNum - 1, 1);
//       const endDate = new Date(year, monthNum, 0, 23, 59, 59);

//       leaveQuery = {
//         status: 'approved',
//         $or: [
//           { startDate: { $gte: startDate, $lte: endDate } },
//           { endDate: { $gte: startDate, $lte: endDate } }
//         ]
//       };
//     }

//     const approvedLeaves = await Leave.find(leaveQuery);

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
//           weekOffPerMonth: employee?.weekOffPerMonth || 0,
//           calculatedSalary: 0,
//           workingDays: 0,
//           halfDays: 0,
//           approvedLeaves: 0
//         };
//       }

//       const emp = summaryMap[id];

//       // Count present days only if check-in exists
//       if (rec.checkInTime) {
//         emp.presentDays += 1;
//       }

//       // Late calculation - check if check-in after 10:00 AM
//       const checkIn = new Date(rec.checkInTime);
//       const hours = checkIn.getHours();
//       const minutes = checkIn.getMinutes();
//       if (hours > 10 || (hours === 10 && minutes > 0)) {
//         emp.lateDays += 1;
//       }

//       // Onsite days
//       if (rec.onsite) {
//         emp.onsiteDays += 1;
//       }

//       // ✅ Calculate leaves based on totalHours
//       const totalHours = rec.totalHours || 0;

//       if (totalHours > 0) {
//         if (totalHours < 4) {
//           // Less than 4 hours = Full day leave
//           emp.fullDayLeaves += 1;
//         } else if (totalHours >= 4 && totalHours < 8) {
//           // 4 hours or more but less than 8 hours = Half day leave
//           emp.halfDayLeaves += 1;
//         }
//         // 8 hours or more = Full day work (no leave)
//       } else {
//         // If no hours recorded and no checkout, consider as full day leave
//         if (!rec.checkOutTime) {
//           emp.fullDayLeaves += 1;
//         }
//       }
//     });

//     // Count approved leaves for each employee
//     approvedLeaves.forEach((leave) => {
//       const employee = employees.find(
//         (e) => e.employeeId === leave.employeeId || e._id.toString() === leave.employeeId
//       );

//       if (employee && summaryMap[employee.employeeId]) {
//         summaryMap[employee.employeeId].approvedLeaves += leave.days || 1;
//       }
//     });

//     // Calculate total working days and salary
//     Object.values(summaryMap).forEach((emp) => {
//       // Calculate total days in month
//       const [monthName, year] = emp.month.split(' ');
//       const monthIndex = new Date(Date.parse(monthName + " 1, " + year)).getMonth();
//       const totalDaysInMonth = new Date(year, monthIndex + 1, 0).getDate();

//       // Calculate total working days in month (excluding weekends and week offs)
//       let totalWorkingDaysInMonth = 0;
//       for (let day = 1; day <= totalDaysInMonth; day++) {
//         const currentDate = new Date(year, monthIndex, day);
//         const dayOfWeek = currentDate.getDay();
//         // Count only weekdays (1-5 = Monday to Friday)
//         if (dayOfWeek >= 1 && dayOfWeek <= 5) {
//           totalWorkingDaysInMonth++;
//         }
//       }

//       // Adjust for week offs per month
//       totalWorkingDaysInMonth = Math.max(totalWorkingDaysInMonth - emp.weekOffPerMonth, 0);

//       // Calculate actual working days (present - leaves from attendance)
//       emp.workingDays = emp.presentDays - emp.fullDayLeaves - emp.halfDayLeaves;

//       // Adjust for approved leaves
//       const totalLeaves = emp.approvedLeaves + emp.fullDayLeaves;
//       emp.workingDays = Math.max(emp.workingDays - emp.approvedLeaves, 0);

//       emp.halfDays = emp.halfDayLeaves;

//       // Calculate total working days for display (with half days as 0.5)
//       emp.totalWorkingDays = emp.workingDays + (emp.halfDays * 0.5);
//       emp.totalWorkingDays = Math.max(emp.totalWorkingDays, 0);

//       // Calculate salary based on working days
//       const dailySalary = emp.salaryPerMonth / totalWorkingDaysInMonth;

//       // Calculate effective working days (full days + half days as 0.5)
//       const effectiveWorkingDays = emp.workingDays + (emp.halfDays * 0.5);

//       // Calculate final salary (considering total working days in month)
//       emp.calculatedSalary = Math.round((effectiveWorkingDays / totalWorkingDaysInMonth) * emp.salaryPerMonth);

//       // Ensure salary doesn't exceed monthly salary and is not negative
//       emp.calculatedSalary = Math.max(0, Math.min(emp.calculatedSalary, emp.salaryPerMonth));
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
// // exports.calculateSummary = async (req, res) => {
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


// const Attendance = require("../models/Attendance");
// const AttendanceSummary = require("../models/AttendanceSummary");
// const Employee = require("../models/Employee");
// const Leave = require("../models/Leave");

// /**
//  * 📌 Get All Attendance Records with Filters
//  */
// exports.getAllAttendance = async (req, res) => {
//   try {
//     const { fromDate, toDate, month, employeeId } = req.query;

//     let query = {};

//     // Date range filter
//     if (fromDate && toDate) {
//       query.checkInTime = {
//         $gte: new Date(fromDate),
//         $lte: new Date(toDate + 'T23:59:59.999Z')
//       };
//     }

//     // Month filter
//     if (month) {
//       const [year, monthNum] = month.split('-');
//       const startDate = new Date(year, monthNum - 1, 1);
//       const endDate = new Date(year, monthNum, 0, 23, 59, 59, 999);

//       query.checkInTime = {
//         $gte: startDate,
//         $lte: endDate
//       };
//     }

//     // Employee filter
//     if (employeeId) {
//       query.employeeId = employeeId;
//     }

//     const records = await Attendance.find(query)
//       .sort({ checkInTime: -1 })
//       .lean();

//     res.json({
//       success: true,
//       records: records,
//       count: records.length
//     });

//   } catch (error) {
//     console.error('❌ Error fetching attendance:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching attendance records',
//       error: error.message
//     });
//   }
// };

// /**
//  * 📌 Update Attendance Record (Hours, Region, Comment) - FIXED VERSION
//  */
// exports.updateAttendance = async (req, res) => {
//   try {
//     const { attendanceId, hours, region, reason } = req.body;

//     console.log('📝 Update request received:', { attendanceId, hours, region, reason });

//     if (!attendanceId) {
//       return res.status(400).json({
//         success: false,
//         message: 'Attendance ID is required'
//       });
//     }

//     if (hours === undefined && !region && !reason) {
//       return res.status(400).json({
//         success: false,
//         message: 'At least one field (hours, region, or reason) is required to update'
//       });
//     }

//     const updateData = {};
//     if (hours !== undefined) updateData.totalHours = parseFloat(hours);
//     if (region !== undefined) updateData.region = region;
//     if (reason !== undefined) {
//       updateData.reason = reason;
//       updateData.comment = reason; // Also update comment field for compatibility
//     }

//     // Recalculate day type based on new hours
//     if (hours !== undefined) {
//       const calculatedDayType = calculateDayType(parseFloat(hours));
//       updateData.dayType = calculatedDayType;
//     }

//     console.log('🔄 Update data:', updateData);

//     const updatedRecord = await Attendance.findByIdAndUpdate(
//       attendanceId,
//       updateData,
//       { new: true, runValidators: true }
//     );

//     if (!updatedRecord) {
//       return res.status(404).json({
//         success: false,
//         message: 'Attendance record not found'
//       });
//     }

//     console.log('✅ Attendance record updated:', {
//       id: attendanceId,
//       hours: hours,
//       region: region,
//       reason: reason,
//       dayType: updatedRecord.dayType
//     });

//     res.json({
//       success: true,
//       message: 'Attendance record updated successfully',
//       record: updatedRecord
//     });

//   } catch (error) {
//     console.error('❌ Error updating attendance:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error updating attendance record',
//       error: error.message
//     });
//   }
// };

// /**
//  * 📌 Save Attendance Summary
//  */
// exports.saveSummary = async (req, res) => {
//   try {
//     const { summaries, fromDate, toDate, month } = req.body;

//     if (!summaries || !Array.isArray(summaries)) {
//       return res.status(400).json({ 
//         success: false,
//         message: "Invalid summary data" 
//       });
//     }

//     console.log('💾 Saving summary for:', {
//       month,
//       fromDate,
//       toDate,
//       employeeCount: summaries.length
//     });

//     // Remove existing summaries for the same period
//     let deleteQuery = {};
//     if (month) {
//       deleteQuery.month = month;
//     } else if (fromDate && toDate) {
//       deleteQuery.fromDate = fromDate;
//       deleteQuery.toDate = toDate;
//     }

//     if (Object.keys(deleteQuery).length > 0) {
//       await AttendanceSummary.deleteMany(deleteQuery);
//       console.log('🗑️ Cleared existing summaries for period');
//     }

//     // Prepare data for insertion
//     const insertData = summaries.map((summary) => ({
//       employeeId: summary.employeeId,
//       name: summary.name,
//       month: summary.month,
//       presentDays: summary.presentDays || 0,
//       lateDays: summary.lateDays || 0,
//       onsiteDays: summary.onsiteDays || 0,
//       halfDayLeaves: summary.halfDayLeaves || 0,
//       fullDayLeaves: summary.fullDayLeaves || 0,
//       totalWorkingDays: summary.totalWorkingDays || 0,
//       fromDate: fromDate || null,
//       toDate: toDate || null,
//       calculatedSalary: summary.calculatedSalary || 0,
//       workingDays: summary.workingDays || 0,
//       createdAt: new Date()
//     }));

//     const result = await AttendanceSummary.insertMany(insertData);

//     console.log('✅ Summary saved successfully:', result.length, 'records');

//     res.json({
//       success: true,
//       message: "Summary saved successfully",
//       count: result.length,
//       data: result
//     });

//   } catch (err) {
//     console.error('❌ Error saving summary:', err);
//     res.status(500).json({ 
//       success: false,
//       message: err.message 
//     });
//   }
// };

// /**
//  * 📌 Get Saved Summary
//  */
// exports.getSummary = async (req, res) => {
//   try {
//     const { month, fromDate, toDate, employeeId } = req.query;

//     let filter = {};
//     if (month) filter.month = month;
//     if (fromDate && toDate) {
//       filter.fromDate = fromDate;
//       filter.toDate = toDate;
//     }
//     if (employeeId) filter.employeeId = employeeId;

//     const data = await AttendanceSummary.find(filter).sort({ createdAt: -1 });

//     res.json({
//       success: true,
//       count: data.length,
//       summary: data
//     });
//   } catch (err) {
//     console.error('❌ Error fetching summary:', err);
//     res.status(500).json({ 
//       success: false,
//       message: err.message 
//     });
//   }
// };

// /**
//  * 📌 Calculate Summary from Raw Data
//  */
// exports.calculateSummary = async (req, res) => {
//   try {
//     const { fromDate, toDate, month } = req.body;

//     let query = {};
//     let summaryMonth = month;

//     // 🔍 Date range or month filter
//     if (fromDate && toDate) {
//       query.checkInTime = {
//         $gte: new Date(fromDate),
//         $lte: new Date(toDate + "T23:59:59.999Z")
//       };

//       if (!month) {
//         const f = new Date(fromDate);
//         summaryMonth = `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, "0")}`;
//       }
//     } else if (month) {
//       const [year, m] = month.split("-");
//       const start = new Date(year, m - 1, 1);
//       const end = new Date(year, m, 0, 23, 59, 59, 999);

//       query.checkInTime = { $gte: start, $lte: end };
//     }

//     console.log("🔍 Summary Query:", query);

//     // 🟦 Fetch attendance + employees
//     const attendanceRecords = await Attendance.find(query).sort({ checkInTime: -1 });
//     const employees = await Employee.find({});

//     console.log("📊 Attendance found:", attendanceRecords.length);
//     console.log("👥 Employees found:", employees.length);

//     // Constants
//     const FULL_DAY_HOURS = 9;
//     const HALF_DAY_THRESHOLD = 8.80;
//     const FULL_DAY_LEAVE_THRESHOLD = 4;

//     const calculateDayType = (hrs) => {
//       const h = parseFloat(hrs) || 0;

//       if (h >= FULL_DAY_HOURS) return "full";
//       if (h >= HALF_DAY_THRESHOLD) return "half";
//       if (h >= FULL_DAY_LEAVE_THRESHOLD) return "half";
//       return "full_leave";
//     };

//     const summaryMap = {};
//     const processedDates = {};

//     attendanceRecords.forEach((rec) => {
//       if (!rec.employeeId || !rec.checkInTime) return;

//       const employeeId = rec.employeeId;
//       const checkInDate = new Date(rec.checkInTime);
//       const dateKey = checkInDate.toISOString().split("T")[0];

//       const finalMonth =
//         summaryMonth ||
//         `${checkInDate.getFullYear()}-${String(checkInDate.getMonth() + 1).padStart(2, "0")}`;

//       // 🟪 Initialize employee summary
//       if (!summaryMap[employeeId]) {
//         const emp = employees.find((e) => e.employeeId === employeeId) || {};

//         summaryMap[employeeId] = {
//           employeeId,
//           name: emp.name || `Employee ${employeeId}`,
//           month: finalMonth,
//           presentDays: 0,
//           lateDays: 0,
//           onsiteDays: 0,
//           halfDayLeaves: 0,
//           fullDayLeaves: 0,
//           totalWorkingDays: 0,
//           workingDays: 0,
//           calculatedSalary: 0,
//           totalRecords: 0
//         };

//         processedDates[employeeId] = new Set();
//       }

//       // ⏩ Skip duplicate date
//       if (processedDates[employeeId].has(dateKey)) return;
//       processedDates[employeeId].add(dateKey);

//       // ⏱ Hours calculation
//       let hours = 0;
//       if (rec.totalHours !== undefined) {
//         hours = parseFloat(rec.totalHours);
//       } else if (rec.checkOutTime) {
//         hours =
//           (new Date(rec.checkOutTime) - new Date(rec.checkInTime)) /
//           (1000 * 60 * 60);
//       }

//       // 📌 Day type
//       const type = calculateDayType(hours);

//       if (type === "full") {
//         summaryMap[employeeId].presentDays += 1;
//         summaryMap[employeeId].totalWorkingDays += 1;
//       } else if (type === "half") {
//         summaryMap[employeeId].halfDayLeaves += 1;
//         summaryMap[employeeId].totalWorkingDays += 0.5;
//       } else if (type === "full_leave") {
//         summaryMap[employeeId].fullDayLeaves += 1;
//       }

//       // ⏰ Late check–in
//       const hour = checkInDate.getHours();
//       const minute = checkInDate.getMinutes();
//       if (hour > 10 || (hour === 10 && minute > 0)) {
//         summaryMap[employeeId].lateDays += 1;
//       }

//       // 🏢 ONSITE DAYS FIXED — only if onsite == true
//       if (rec.onsite === true) {
//         summaryMap[employeeId].onsiteDays += 1;
//         console.log(`🏢 Onsite counted for ${employeeId} on ${dateKey}`);
//       }

//       summaryMap[employeeId].totalRecords += 1;
//     });

//     // 💰 Salary Calculation
//     Object.values(summaryMap).forEach((emp) => {
//       const baseSalary = 30000;
//       const workingDaysInMonth = 26;

//       const dailyRate = baseSalary / workingDaysInMonth;

//       emp.workingDays = emp.presentDays;
//       emp.totalWorkingDays = emp.presentDays + emp.halfDayLeaves * 0.5;

//       emp.calculatedSalary = Math.round(emp.totalWorkingDays * dailyRate);
//     });

//     const finalSummary = Object.values(summaryMap);

//     console.log("📈 Summary generated for:", finalSummary.length);

//     res.json({
//       success: true,
//       summary: finalSummary,
//       totalEmployees: finalSummary.length
//     });
//   } catch (error) {
//     console.error("❌ Summary error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error calculating summary",
//       error: error.message
//     });
//   }
// };


// /**
//  * 📌 Get Employee Details for Specific Employee
//  */
// exports.getEmployeeDetails = async (req, res) => {
//   try {
//     const { employeeId, fromDate, toDate, month } = req.query;

//     if (!employeeId) {
//       return res.status(400).json({
//         success: false,
//         message: 'Employee ID is required'
//       });
//     }

//     console.log('🔍 Fetching details for employee:', employeeId, { fromDate, toDate, month });

//     let query = { employeeId };

//     // Date range filter
//     if (fromDate && toDate) {
//       query.checkInTime = {
//         $gte: new Date(fromDate),
//         $lte: new Date(toDate + 'T23:59:59.999Z')
//       };
//     }

//     // Month filter
//     if (month) {
//       const [year, monthNum] = month.split('-');
//       const startDate = new Date(year, monthNum - 1, 1);
//       const endDate = new Date(year, monthNum, 0, 23, 59, 59, 999);

//       query.checkInTime = {
//         $gte: startDate,
//         $lte: endDate
//       };
//     }

//     const details = await Attendance.find(query)
//       .sort({ checkInTime: -1 })
//       .lean();

//     console.log('📋 Details found:', details.length);

//     // Log onsite records for debugging
//     const onsiteRecords = details.filter(rec => rec.region === "Onsite" || rec.region === "onsite");
//     console.log('🏢 Onsite records in details:', onsiteRecords.length);

//     // Get employee info
//     const employee = await Employee.findOne({ employeeId });

//     res.json({
//       success: true,
//       employee: employee || { employeeId, name: 'Unknown' },
//       details: details,
//       count: details.length
//     });

//   } catch (error) {
//     console.error('❌ Error fetching employee details:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching employee details',
//       error: error.message
//     });
//   }
// };

// // Helper function for day type calculation
// function calculateDayType(hours) {
//   const FULL_DAY_HOURS = 9;
//   const HALF_DAY_THRESHOLD = 8.80;
//   const FULL_DAY_LEAVE_THRESHOLD = 4;

//   const numericHours = parseFloat(hours) || 0;

//   if (numericHours >= FULL_DAY_HOURS) {
//     return "full";
//   } else if (numericHours >= HALF_DAY_THRESHOLD) {
//     return "half";
//   } else if (numericHours >= FULL_DAY_LEAVE_THRESHOLD) {
//     return "half";
//   } else {
//     return "full_leave";
//   }
// }




// exports.getSalaries = async (req, res) => {
//   try {
//     let { month } = req.query;

//     // If no month → use current month
//     if (!month) {
//       const today = new Date();
//       const y = today.getFullYear();
//       const m = String(today.getMonth() + 1).padStart(2, "0");
//       month = `${y}-${m}`;
//     }

//     const [year, m] = month.split("-");
//     const start = new Date(year, m - 1, 1);
//     const end = new Date(year, m, 0, 23, 59, 59, 999);

//     // EMPLOYEES
//     const employees = await Employee.find({});

//     // ATTENDANCE
//     const attendanceRecords = await Attendance.find({
//       checkInTime: { $gte: start, $lte: end }
//     });

//     // LEAVES
//     const leaves = await Leave.find({
//       date: { $gte: start, $lte: end }
//     });

//     const FULL_DAY_HOURS = 9;
//     const HALF_DAY_THRESHOLD = 8.8;
//     const FULL_DAY_LEAVE_THRESHOLD = 4;

//     const calculateDayType = (hrs) => {
//       const h = parseFloat(hrs) || 0;
//       if (h >= FULL_DAY_HOURS) return "full";
//       if (h >= HALF_DAY_THRESHOLD) return "half";
//       if (h >= FULL_DAY_LEAVE_THRESHOLD) return "half";
//       return "full_leave";
//     };

//     const salaryMap = {};
//     const processedDates = {};

//     // INITIALIZE EMPLOYEE OBJECTS
//     employees.forEach((e) => {
//       salaryMap[e.employeeId] = {
//         employeeId: e.employeeId,
//         name: e.name,
//         month,

//         presentDays: 0,
//         halfDayLeaves: 0,
//         fullDayLeaves: 0,

//         onsiteDays: 0,
//         weekOffs: e.weekOffPerMonth || 0,

//         totalLeaves: 0,
//         leaveTypes: {},

//         salaryPerMonth: e.salaryPerMonth || 0,
//         salaryPerDay: e.salaryPerDay || (e.salaryPerMonth ? e.salaryPerMonth / 26 : 0),
//         calculatedSalary: 0
//       };

//       processedDates[e.employeeId] = new Set();
//     });

//     // PROCESS ATTENDANCE
//     attendanceRecords.forEach((rec) => {
//       if (!rec.employeeId || !rec.checkInTime) return;
//       const empId = rec.employeeId;
//       if (!salaryMap[empId]) return;

//       const checkInDate = new Date(rec.checkInTime);
//       const dateKey = checkInDate.toISOString().split("T")[0];

//       if (processedDates[empId].has(dateKey)) return;
//       processedDates[empId].add(dateKey);

//       let hours = 0;
//       if (rec.totalHours !== undefined) hours = parseFloat(rec.totalHours);
//       else if (rec.checkOutTime) {
//         hours = (new Date(rec.checkOutTime) - new Date(rec.checkInTime)) / (1000 * 60 * 60);
//       }

//       const type = calculateDayType(hours);

//       if (type === "full") salaryMap[empId].presentDays += 1;
//       else if (type === "half") salaryMap[empId].halfDayLeaves += 1;
//       else salaryMap[empId].fullDayLeaves += 1;

//       if (rec.onsite === true) salaryMap[empId].onsiteDays += 1;
//     });

//     // PROCESS LEAVES WITH TYPES
//     leaves.forEach((l) => {
//       const empId = l.employeeId;
//       if (!salaryMap[empId]) return;

//       const type = l.leaveType?.toLowerCase() || "unknown";

//       if (!salaryMap[empId].leaveTypes[type]) {
//         salaryMap[empId].leaveTypes[type] = 0;
//       }
//       salaryMap[empId].leaveTypes[type] += 1;

//       salaryMap[empId].totalLeaves += 1;

//       if (type === "full") salaryMap[empId].fullDayLeaves += 1;
//       if (type === "half") salaryMap[empId].halfDayLeaves += 1;
//     });

//     // SALARY CALCULATION
//     Object.values(salaryMap).forEach((emp) => {
//       const paidDays = emp.presentDays + emp.halfDayLeaves * 0.5;
//       emp.calculatedSalary = Math.round(paidDays * emp.salaryPerDay);
//     });

//     res.json({
//       success: true,
//       salaries: Object.values(salaryMap),
//       totalEmployees: Object.values(salaryMap).length
//     });

//   } catch (error) {
//     console.error("❌ Salary error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error calculating salaries",
//       error: error.message
//     });
//   }
// };


// const Attendance = require("../models/Attendance");
// const AttendanceSummary = require("../models/AttendanceSummary");
// const Employee = require("../models/Employee");
// const Leave = require("../models/Leave");

// // ✅ YEHI ADD KARNA HAI - Calculate Day Type Function
// const calculateDayType = (hours) => {
//   const h = parseFloat(hours) || 0;

//   // Same logic as in calculateSummary
//   const FULL_DAY_THRESHOLD = 8.80;
//   const HALF_DAY_THRESHOLD = 4;

//   if (h > FULL_DAY_THRESHOLD) {
//     return "full";
//   } else if (h >= HALF_DAY_THRESHOLD) {
//     return "half";
//   } else {
//     return "full_leave";
//   }
// };


// /**
//  * 📌 Get All Attendance Records with Filters
//  */
// exports.getAllAttendance = async (req, res) => {
//   try {
//     const { fromDate, toDate, month, employeeId } = req.query;

//     let query = {};

//     // Date range filter
//     if (fromDate && toDate) {
//       query.checkInTime = {
//         $gte: new Date(fromDate),
//         $lte: new Date(toDate + 'T23:59:59.999Z')
//       };
//     }
//     // ✅ Reason count (INSIDE LOOP)
// // if (rec.reason) {
// //   const reason = rec.reason.toLowerCase();

// //   if (reason.includes("onsite")) {
// //     summaryMap[employeeId].reasonCount.onsite += 1;
// //   } else if (reason.includes("field")) {
// //     summaryMap[employeeId].reasonCount.fieldWork += 1;
// //   } else if (
// //     reason.includes("work from home") ||
// //     reason.includes("wfh")
// //   ) {
// //     summaryMap[employeeId].reasonCount.workFromHome += 1;
// //   }
// // }


//     // Month filter
//     if (month) {
//       const [year, monthNum] = month.split('-');
//       const startDate = new Date(year, monthNum - 1, 1);
//       const endDate = new Date(year, monthNum, 0, 23, 59, 59, 999);

//       query.checkInTime = {
//         $gte: startDate,
//         $lte: endDate
//       };
//     }

//     // Employee filter
//     if (employeeId) {
//       query.employeeId = employeeId;
//     }

//     const records = await Attendance.find(query)
//       .sort({ checkInTime: -1 })
//       .lean();

//     res.json({
//       success: true,
//       records: records,
//       count: records.length
//     });

//   } catch (error) {
//     console.error('❌ Error fetching attendance:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching attendance records',
//       error: error.message
//     });
//   }
// };





// /**
//  * 📌 Update Attendance Record (Hours, Region, Comment) - FIXED VERSION
//  */
// exports.updateAttendance = async (req, res) => {
//   try {
//     const { attendanceId, hours, region, reason } = req.body;

//     console.log('📝 Update request received:', { attendanceId, hours, region, reason });

//     if (!attendanceId) {
//       return res.status(400).json({
//         success: false,
//         message: 'Attendance ID is required'
//       });
//     }

//     if (hours === undefined && !region && !reason) {
//       return res.status(400).json({
//         success: false,
//         message: 'At least one field (hours, region, or reason) is required to update'
//       });
//     }

//     const updateData = {};
//     if (hours !== undefined) updateData.totalHours = parseFloat(hours);
//     if (region !== undefined) updateData.region = region;
//     if (reason !== undefined) {
//       updateData.reason = reason;
//       updateData.comment = reason; // Also update comment field for compatibility
//     }

//     // Recalculate day type based on new hours
//     if (hours !== undefined) {
//       const calculatedDayType = calculateDayType(parseFloat(hours));
//       updateData.dayType = calculatedDayType;
//     }

//     console.log('🔄 Update data:', updateData);

//     const updatedRecord = await Attendance.findByIdAndUpdate(
//       attendanceId,
//       updateData,
//       { new: true, runValidators: true }
//     );

//     if (!updatedRecord) {
//       return res.status(404).json({
//         success: false,
//         message: 'Attendance record not found'
//       });
//     }

//     console.log('✅ Attendance record updated:', {
//       id: attendanceId,
//       hours: hours,
//       region: region,
//       reason: reason,
//       dayType: updatedRecord.dayType
//     });

//     // 🔥 AUTO RECALCULATE SUMMARY FOR THAT MONTH
// const d = new Date(updatedRecord.checkInTime);
// const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

// console.log("🔁 Auto recalculating summary for:", month);

// // Delete old summary of that month
// await AttendanceSummary.deleteMany({ month });

// // Recalculate summary
// await exports.calculateSummary(
//   { body: { month } },
//   { json: () => {} } // dummy response
// );

//     res.json({
//       success: true,
//       message: 'Attendance record updated successfully',
//       record: updatedRecord
//     });

//   } catch (error) {
//     console.error('❌ Error updating attendance:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error updating attendance record',
//       error: error.message
//     });
//   }
// };




// /**
//  * 📌 Save Attendance Summary
//  */
// exports.saveSummary = async (req, res) => {
//   try {
//     const { summaries, fromDate, toDate, month } = req.body;

//     if (!summaries || !Array.isArray(summaries)) {
//       return res.status(400).json({ 
//         success: false,
//         message: "Invalid summary data" 
//       });
//     }

//     console.log('💾 Saving summary for:', {
//       month,
//       fromDate,
//       toDate,
//       employeeCount: summaries.length
//     });

//     // Remove existing summaries for the same period
//     let deleteQuery = {};
//     if (month) {
//       deleteQuery.month = month;
//     } else if (fromDate && toDate) {
//       deleteQuery.fromDate = fromDate;
//       deleteQuery.toDate = toDate;
//     }

//     if (Object.keys(deleteQuery).length > 0) {
//       await AttendanceSummary.deleteMany(deleteQuery);
//       console.log('🗑️ Cleared existing summaries for period');
//     }

//     // Prepare data for insertion with updated field names
//     const insertData = summaries.map((summary) => ({
//       employeeId: summary.employeeId,
//       name: summary.name,
//       month: summary.month,
//       presentDays: summary.presentDays || 0,
//       lateDays: summary.lateDays || 0,
//       onsiteDays: summary.onsiteDays || 0,
//       halfDayWorking: summary.halfDayWorking || summary.halfDayLeaves || 0,
//       fullDayNotWorking: summary.fullDayNotWorking || summary.fullDayLeaves || 0,
//       totalWorkingDays: summary.totalWorkingDays || 0,
//       fromDate: fromDate || null,
//       toDate: toDate || null,
//       calculatedSalary: summary.calculatedSalary || 0,
//       workingDays: summary.workingDays || 0,
//       overTimeHours: summary.overTimeHours || 0,
// onsiteYesDays: summary.onsiteYesDays || 0,
// onsiteNoDays: summary.onsiteNoDays || 0,
// reasonCount: summary.reasonCount || {
//   onsite: 0,
//   fieldWork: 0,
//   workFromHome: 0
// },

//       createdAt: new Date()
//     }));

//     const result = await AttendanceSummary.insertMany(insertData);

//     console.log('✅ Summary saved successfully:', result.length, 'records');

//     res.json({
//       success: true,
//       message: "Summary saved successfully",
//       count: result.length,
//       data: result
//     });

//   } catch (err) {
//     console.error('❌ Error saving summary:', err);
//     res.status(500).json({ 
//       success: false,
//       message: err.message 
//     });
//   }
// };

// /**
//  * 📌 Get Saved Summary - ✅ FIXED: Auto-correct wrong data
//  */
// exports.getSummary = async (req, res) => {
//   try {
//     const { month, fromDate, toDate, employeeId } = req.query;

//     console.log("📥 GetSummary API Called with:", { month, fromDate, toDate, employeeId });

//     let filter = {};

//     // Date range filter
//     if (fromDate && toDate) {
//       filter.createdAt = {
//         $gte: new Date(fromDate),
//         $lte: new Date(toDate + "T23:59:59.999Z")
//       };
//     }

//     // Month filter
//     if (month) {
//       filter.month = month;
//     }

//     // Employee filter
//     if (employeeId) {
//       filter.employeeId = employeeId;
//     }

//     console.log("🔍 Database Filter:", filter);

//     let data = await AttendanceSummary.find(filter).sort({ createdAt: -1 });

//     console.log("✅ Found records:", data.length);

//     // ✅ FIXED: Auto-correct wrong data for current month
//     const today = new Date();
//     const currentYear = today.getFullYear();
//     const currentMonth = today.getMonth() + 1;
//     const currentDay = today.getDate();

//     const correctedData = data.map(summary => {
//       if (summary.month) {
//         const [year, monthNum] = summary.month.split('-').map(Number);

//         // Only correct if current month
//         if (year === currentYear && monthNum === currentMonth) {
//           const summaryObj = summary.toObject(); // Convert to plain object

//           // Get corrected values
//           const correctedPresent = Math.min(summary.presentDays, currentDay);
//           const correctedLate = Math.min(summary.lateDays, currentDay);
//           const correctedOnsite = Math.min(summary.onsiteDays, currentDay);
//           const correctedHalf = Math.min(summary.halfDayWorking, currentDay);
//           const correctedFullLeave = Math.min(summary.fullDayNotWorking, currentDay);
//           const correctedTotal = correctedPresent + (correctedHalf * 0.5);

//           console.log(`🔧 Auto-correcting ${summary.employeeId}: present ${summary.presentDays} → ${correctedPresent}`);

//           return {
//             ...summaryObj,
//             presentDays: correctedPresent,
//             lateDays: correctedLate,
//             onsiteDays: correctedOnsite,
//             halfDayWorking: correctedHalf,
//             fullDayNotWorking: correctedFullLeave,
//             totalWorkingDays: correctedTotal
//           };
//         }
//       }
//       return summary;
//     });

//     // Check if any correction happened
//     const wasCorrected = JSON.stringify(data) !== JSON.stringify(correctedData);
//     if (wasCorrected) {
//       console.log("🔄 Summary data auto-corrected for current month");
//     }

//     res.json({
//       success: true,
//       count: correctedData.length,
//       summary: correctedData,
//       note: wasCorrected ? "Data auto-corrected for current month" : "Data is correct"
//     });
//   } catch (err) {
//     console.error('❌ Error fetching summary:', err);
//     res.status(500).json({ 
//       success: false,
//       message: err.message 
//     });
//   }
// };

// /**
//  * 📌 Calculate Summary from Raw Data - COMPLETELY FIXED VERSION (November-December Separate)
//  */
// exports.calculateSummary = async (req, res) => {
//   try {
//     const { fromDate, toDate, month } = req.body;

//     let query = {};

//     console.log("📥 CalculateSummary called with:", { month, fromDate, toDate });

//     // 🔍 Use a separate variable for processed month
//     let processedMonth = month;

//     // 🔍 STRICT MONTH FILTERING
//     if (processedMonth) {
//       const [year, m] = processedMonth.split("-");
//       const start = new Date(year, m - 1, 1);

//       // Month ka exact last day
//       let end = new Date(year, m, 0, 23, 59, 59, 999);

//       // Agar current month hai, toh sirf aaj tak
//       const today = new Date();
//       const currentYear = today.getFullYear();
//       const currentMonth = today.getMonth() + 1;

//       if (parseInt(year) === currentYear && parseInt(m) === currentMonth) {
//         end = new Date(today);
//         end.setHours(23, 59, 59, 999);
//         console.log("✅ Current month detected. Limiting to today:", end);
//       }

//       query.checkInTime = { $gte: start, $lte: end };
//       console.log("📅 STRICT Month filter applied:", processedMonth, "from", start, "to", end);

//     } else if (fromDate && toDate) {
//       query.checkInTime = {
//         $gte: new Date(fromDate),
//         $lte: new Date(toDate + "T23:59:59.999Z")
//       };
//       console.log("📅 Date range filter applied:", fromDate, toDate);

//       // If no month but date range, calculate month from fromDate
//       if (fromDate) {
//         const date = new Date(fromDate);
//         processedMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
//       }
//     } else {
//       // Default: current month
//       const today = new Date();
//       const start = new Date(today.getFullYear(), today.getMonth(), 1);
//       const end = new Date(today);
//       end.setHours(23, 59, 59, 999);

//       query.checkInTime = { $gte: start, $lte: end };
//       processedMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
//       console.log("📅 No filter, using current month:", processedMonth);
//     }

//     console.log("🔍 MongoDB Query:", JSON.stringify(query));
//     console.log("📆 Processing month:", processedMonth);

//     // 🟦 Fetch attendance + employees
//     const attendanceRecords = await Attendance.find(query).sort({ checkInTime: -1 });
//     const employees = await Employee.find({});

//     console.log("📊 Attendance records found:", attendanceRecords.length);
//     console.log("👥 Employees found:", employees.length);

//     // DEBUG: Check months in fetched records
//     if (attendanceRecords.length > 0) {
//       const monthsInRecords = [...new Set(attendanceRecords.map(rec => {
//         const d = new Date(rec.checkInTime);
//         return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
//       }))];
//       console.log("📆 Months found in attendance records:", monthsInRecords);
//     }

//     // Constants
//     const FULL_DAY_THRESHOLD = 8.80;
//     const HALF_DAY_THRESHOLD = 4;

//     const calculateDayType = (hrs) => {
//       const h = parseFloat(hrs) || 0;

//       if (h > FULL_DAY_THRESHOLD) {
//         return "full";
//       } else if (h >= HALF_DAY_THRESHOLD) {
//         return "half";
//       } else {
//         return "full_leave";
//       }
//     };

//     const summaryMap = {};
//     const processedDates = {};

//     // 🔴 MAIN FIX: Strict month filtering during processing
//     attendanceRecords.forEach((rec) => {
//       if (!rec.employeeId || !rec.checkInTime) return;

//       const employeeId = rec.employeeId;
//       const checkInDate = new Date(rec.checkInTime);
//       const dateKey = checkInDate.toISOString().split("T")[0];

//       // ✅ STRICT CHECK: Record का month processedMonth से match होना चाहिए
//       const recordMonth = `${checkInDate.getFullYear()}-${String(checkInDate.getMonth() + 1).padStart(2, "0")}`;

//       if (processedMonth && recordMonth !== processedMonth) {
//         // Skip records from different months
//         console.log(`⏩ SKIPPING: ${employeeId} - Record from ${recordMonth}, but processing ${processedMonth}`);
//         return;
//       }

//       // Future date check
//       const today = new Date();
//       if (checkInDate > today) {
//         console.log(`⏭️ Skipping future date: ${employeeId} - ${checkInDate}`);
//         return;
//       }

//       // Initialize summary
//       if (!summaryMap[employeeId]) {
//         const emp = employees.find((e) => e.employeeId === employeeId) || {};

//         summaryMap[employeeId] = {
//   employeeId,
//   name: emp.name || `Employee ${employeeId}`,
//   month: processedMonth,

//   presentDays: 0,
//   lateDays: 0,
//   onsiteDays: 0,

//   onsiteYesDays: 0,
//   onsiteNoDays: 0,

//   reasonCount: {
//     onsite: 0,
//     fieldWork: 0,
//     workFromHome: 0
//   },

//   halfDayWorking: 0,
//   fullDayNotWorking: 0,
//   totalWorkingDays: 0,

//   overTimeHours: 0, // 👈 NEW

//   workingDays: 0,
//   calculatedSalary: 0,
//   totalRecords: 0
// };


//         processedDates[employeeId] = new Set();
//       }

//       // Skip duplicate date
//       if (processedDates[employeeId].has(dateKey)) {
//         console.log(`⏩ Skipping duplicate date for ${employeeId}: ${dateKey}`);
//         return;
//       }
//       processedDates[employeeId].add(dateKey);

//       // Hours calculation
//       let hours = 0;
//       if (rec.totalHours !== undefined) {
//         hours = parseFloat(rec.totalHours);
//       } else if (rec.checkOutTime) {
//         hours = (new Date(rec.checkOutTime) - new Date(rec.checkInTime)) / (1000 * 60 * 60);
//       }

//     const STANDARD_HOURS = 9;
// const extraHours = Math.max(hours - STANDARD_HOURS, 0);

// // OT accumulate
// summaryMap[employeeId].overTimeHours += Number(extraHours.toFixed(2));


//       // Day type
//       const type = calculateDayType(hours);

//       console.log(`📊 ${employeeId} - ${dateKey}: ${hours.toFixed(2)}h = ${type}`);

//       if (type === "full") {
//         summaryMap[employeeId].presentDays += 1;
//         summaryMap[employeeId].totalWorkingDays += 1;
//       } else if (type === "half") {
//         summaryMap[employeeId].halfDayWorking += 1;
//         summaryMap[employeeId].totalWorkingDays += 0.5;
//       } else if (type === "full_leave") {
//         summaryMap[employeeId].fullDayNotWorking += 1;
//       }

//       // Late check-in
//       const hour = checkInDate.getHours();
//       const minute = checkInDate.getMinutes();
//       if (hour > 10 || (hour === 10 && minute > 0)) {
//         summaryMap[employeeId].lateDays += 1;
//       }

//       // Onsite days
//      if (rec.onsite === true) {
//   summaryMap[employeeId].onsiteDays += 1;
//   summaryMap[employeeId].onsiteYesDays += 1;
// } else {
//   summaryMap[employeeId].onsiteNoDays += 1;
// }


//       summaryMap[employeeId].totalRecords += 1;
//     });

//     const summaryArray = Object.values(summaryMap);

//     console.log("📋 Summary calculated for", processedMonth + ":", summaryArray.length, "employees");

//     // Current month adjustment
//     if (processedMonth) {
//       const now = new Date();
//       const [selectedYear, selectedMonth] = processedMonth.split('-').map(Number);
//       const currentYear = now.getFullYear();
//       const currentMonth = now.getMonth() + 1;
//       const currentDay = now.getDate();

//       if (selectedYear === currentYear && selectedMonth === currentMonth) {
//         console.log("✅ Adjusting for current month, max days:", currentDay);

//         summaryArray.forEach(emp => {
//           const correctedPresent = Math.min(emp.presentDays, currentDay);
//           const correctedLate = Math.min(emp.lateDays, currentDay);
//           const correctedOnsite = Math.min(emp.onsiteDays, currentDay);
//           const correctedHalf = Math.min(emp.halfDayWorking, currentDay);
//           const correctedFullLeave = Math.min(emp.fullDayNotWorking, currentDay);
//           const correctedTotal = correctedPresent + (correctedHalf * 0.5);

//           emp.presentDays = correctedPresent;
//           emp.lateDays = correctedLate;
//           emp.onsiteDays = correctedOnsite;
//           emp.halfDayWorking = correctedHalf;
//           emp.fullDayNotWorking = correctedFullLeave;
//           emp.totalWorkingDays = correctedTotal;
//         });
//       }
//     }

//     // ✅ SAVE TO DATABASE (ONLY for this month)
//     if (summaryArray.length > 0 && processedMonth) {
//       // Delete ONLY summaries for this specific month
//       const deleteFilter = { month: processedMonth };

//       console.log("🗑️ Deleting existing summaries for:", processedMonth);

//       const deleteResult = await AttendanceSummary.deleteMany(deleteFilter);
//       console.log(`🗑️ Deleted ${deleteResult.deletedCount} existing summaries for ${processedMonth}`);

//       // Save new summaries with CORRECT month
//       const summariesToSave = summaryArray.map(summary => ({
//         ...summary,
//         month: processedMonth, // Ensure month is saved correctly
//         fromDate: fromDate || null,
//         toDate: toDate || null,
//         calculatedAt: new Date(),
//         createdAt: new Date()
//       }));

//       const savedSummaries = await AttendanceSummary.insertMany(summariesToSave);
//       console.log(`💾 Saved ${savedSummaries.length} summaries for ${processedMonth}`);

//       // Verify what was saved
//       const verifyData = await AttendanceSummary.find({ month: processedMonth });
//       console.log(`✅ Verification: ${verifyData.length} records now in DB for ${processedMonth}`);
//     }

//     res.json({
//       success: true,
//       count: summaryArray.length,
//       summary: summaryArray,
//       month: processedMonth,
//       message: `Summary calculated and saved successfully for ${processedMonth}`
//     });

//   } catch (err) {
//     console.error('❌ Error calculating summary:', err);
//     res.status(500).json({ 
//       success: false,
//       message: err.message 
//     });
//   }
// };

// /**
//  * 📌 Get Employee Details for Specific Employee
//  */
// exports.getEmployeeDetails = async (req, res) => {
//   try {
//     const { employeeId, fromDate, toDate, month } = req.query;

//     if (!employeeId) {
//       return res.status(400).json({
//         success: false,
//         message: 'Employee ID is required'
//       });
//     }

//     console.log('🔍 Fetching details for employee:', employeeId, { fromDate, toDate, month });

//     let query = { employeeId };

//     // Date range filter
//     if (fromDate && toDate) {
//       query.checkInTime = {
//         $gte: new Date(fromDate),
//         $lte: new Date(toDate + 'T23:59:59.999Z')
//       };
//     }

//     // Month filter
//     if (month) {
//       const [year, monthNum] = month.split('-');
//       const startDate = new Date(year, monthNum - 1, 1);
//       const endDate = new Date(year, monthNum, 0, 23, 59, 59, 999);

//       query.checkInTime = {
//         $gte: startDate,
//         $lte: endDate
//       };
//     }

//     const details = await Attendance.find(query)
//       .sort({ checkInTime: -1 })
//       .lean();

//     console.log('📋 Details found:', details.length);

//     // Get employee info
//     const employee = await Employee.findOne({ employeeId });

//     res.json({
//       success: true,
//       employee: employee || { employeeId, name: 'Unknown' },
//       details: details,
//       count: details.length
//     });

//   } catch (error) {
//     console.error('❌ Error fetching employee details:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching employee details',
//       error: error.message
//     });
//   }
// };

// /**
//  * 📌 Fix Wrong Summary Data (Without Deleting) - ✅ NEW FUNCTION ADDED
//  */
// exports.fixSummaryData = async (req, res) => {
//   try {
//     const { month } = req.body;

//     if (!month) {
//       return res.status(400).json({
//         success: false,
//         message: "Month is required (e.g., 2025-12)"
//       });
//     }

//     const today = new Date();
//     const currentYear = today.getFullYear();
//     const currentMonth = today.getMonth() + 1;
//     const currentDay = today.getDate();

//     const [year, monthNum] = month.split('-').map(Number);

//     console.log(`🔧 Fixing summary data for ${month}, current day: ${currentDay}`);

//     let updateCount = 0;

//     if (year === currentYear && monthNum === currentMonth) {
//       // Current month hai - limit to current day
//       const summaries = await AttendanceSummary.find({ month });

//       for (const summary of summaries) {
//         // Calculate new correct values
//         const correctedPresent = Math.min(summary.presentDays, currentDay);
//         const correctedLate = Math.min(summary.lateDays, currentDay);
//         const correctedOnsite = Math.min(summary.onsiteDays, currentDay);
//         const correctedHalf = Math.min(summary.halfDayWorking, currentDay);
//         const correctedFullLeave = Math.min(summary.fullDayNotWorking, currentDay);
//         const correctedTotal = correctedPresent + (correctedHalf * 0.5);

//         // Update if needed
//         if (summary.presentDays !== correctedPresent || 
//             summary.lateDays !== correctedLate ||
//             summary.totalWorkingDays !== correctedTotal) {

//           await AttendanceSummary.findByIdAndUpdate(
//             summary._id,
//             {
//               presentDays: correctedPresent,
//               lateDays: correctedLate,
//               onsiteDays: correctedOnsite,
//               halfDayWorking: correctedHalf,
//               fullDayNotWorking: correctedFullLeave,
//               totalWorkingDays: correctedTotal
//             }
//           );

//           updateCount++;
//           console.log(`✅ Fixed ${summary.employeeId}: present ${summary.presentDays} → ${correctedPresent} days`);
//         }
//       }
//     } else {
//       // Past month hai - kuch mat karo
//       console.log(`ℹ️ ${month} is past month, no fix needed`);
//     }

//     res.json({
//       success: true,
//       message: `Fixed ${updateCount} summary records for ${month}`,
//       fixedCount: updateCount
//     });

//   } catch (error) {
//     console.error('❌ Error fixing summary:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error fixing summary data',
//       error: error.message
//     });
//   }
// };

// /**
//  * 📌 Get Salaries - ULTIMATE FIX (No Data Deletion)
//  */
// exports.getSalaries = async (req, res) => {
//   try {
//     let { month } = req.query;

//     if (!month) {
//       const today = new Date();
//       month = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
//     }

//     month = month.trim(); // ✅ IMPORTANT

//     const [year, monthNum] = month.split("-").map(Number);
//     const start = new Date(year, monthNum - 1, 1);
//     const end = new Date(year, monthNum, 0, 23, 59, 59, 999);

//     // 1️⃣ Employees
//     const employees = await Employee.find({});

//     // 2️⃣ Attendance (STRICT month)
//     const attendanceSummaries = await AttendanceSummary.find({ month });

//     // ✅ MAP attendance by employeeId
//     const attendanceMap = {};
//     attendanceSummaries.forEach(a => {
//       attendanceMap[String(a.employeeId)] = a;
//     });

//     // 3️⃣ Approved leaves (display only)
//     const allLeaves = await Leave.find({ status: "approved" });

//     const monthLeaves = allLeaves.filter(leave => {
//       const leaveStart = new Date(leave.startDate);
//       const leaveEnd = new Date(leave.endDate || leave.startDate);
//       return leaveStart <= end && leaveEnd >= start;
//     });

//     const leavesByEmployee = {};
//     monthLeaves.forEach(l => {
//       if (!leavesByEmployee[l.employeeId]) {
//         leavesByEmployee[l.employeeId] = [];
//       }
//       leavesByEmployee[l.employeeId].push(l);
//     });

//     // 4️⃣ Salary calculation
//     const salaryMap = {};

//     employees.forEach(emp => {

//       // ✅ CORRECT attendance for selected month
//       const empAttendance = attendanceMap[String(emp.employeeId)];

//       const weekOffs = emp.weekOffPerMonth || 0;
//       const salaryPerMonth = emp.salaryPerMonth || 0;
//       const dailyRate = salaryPerMonth / 30;

//       const totalWorkingDays = empAttendance?.totalWorkingDays || 0;

//       // ❌ No paid leave policy
//       const paidDays = Math.max(0, totalWorkingDays + weekOffs);

//       const calculatedSalary = Math.round(paidDays * dailyRate);

//       const empLeaves = leavesByEmployee[emp.employeeId] || [];
//       let totalLeaveDays = 0;
//       const leaveTypes = {};

//       empLeaves.forEach(leave => {
//         const type = leave.leaveType?.toUpperCase() || "UNKNOWN";
//         leaveTypes[type] = (leaveTypes[type] || 0) + 1;
//         totalLeaveDays += 1;
//       });

//       salaryMap[emp.employeeId] = {
//         employeeId: emp.employeeId,
//         name: emp.name,
//         month,

//         presentDays: empAttendance?.presentDays || 0,
//         halfDayWorking: empAttendance?.halfDayWorking || 0,
//         totalWorkingDays,

//         weekOffs,

//         totalLeaves: totalLeaveDays,
//         leaveTypes: totalLeaveDays ? leaveTypes : "No Leaves",

//         salaryPerMonth,
//         salaryPerDay: Number(dailyRate.toFixed(2)),
//         paidDays,
//         calculatedSalary,
//         calculatedSalaryDisplay: `₹${calculatedSalary}`
//       };
//     });

//     res.json({
//       success: true,
//       month,
//       salaries: Object.values(salaryMap)
//     });

//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// };


// /**
//  * 📌 Check Month Data - Diagnostic Function
//  */
// exports.checkMonthData = async (req, res) => {
//   try {
//     const { month1, month2 } = req.query;

//     console.log(`🔍 Checking data for months: ${month1} and ${month2}`);

//     // Get summaries for both months
//     const summaries1 = await AttendanceSummary.find({ month: month1 });
//     const summaries2 = await AttendanceSummary.find({ month: month2 });

//     // Get leaves for both months
//     const [year1, monthNum1] = month1.split("-").map(Number);
//     const start1 = new Date(year1, monthNum1 - 1, 1);
//     const end1 = new Date(year1, monthNum1, 0, 23, 59, 59, 999);

//     const [year2, monthNum2] = month2.split("-").map(Number);
//     const start2 = new Date(year2, monthNum2 - 1, 1);
//     const end2 = new Date(year2, monthNum2, 0, 23, 59, 59, 999);

//     const leaves1 = await Leave.find({
//       status: 'approved',
//       $or: [
//         { startDate: { $gte: start1, $lte: end1 } },
//         { endDate: { $gte: start1, $lte: end1 } },
//         { $and: [
//             { startDate: { $lte: start1 } },
//             { endDate: { $gte: end1 } }
//           ]
//         }
//       ]
//     });

//     const leaves2 = await Leave.find({
//       status: 'approved',
//       $or: [
//         { startDate: { $gte: start2, $lte: end2 } },
//         { endDate: { $gte: start2, $lte: end2 } },
//         { $and: [
//             { startDate: { $lte: start2 } },
//             { endDate: { $gte: end2 } }
//           ]
//         }
//       ]
//     });

//     // Find employees with data in both months
//     const employees = await Employee.find({});
//     const crossMonthEmployees = [];

//     employees.forEach(emp => {
//       const inMonth1 = summaries1.find(s => s.employeeId === emp.employeeId);
//       const inMonth2 = summaries2.find(s => s.employeeId === emp.employeeId);
//       const leavesIn1 = leaves1.filter(l => l.employeeId === emp.employeeId);
//       const leavesIn2 = leaves2.filter(l => l.employeeId === emp.employeeId);

//       if (inMonth1 && inMonth2) {
//         crossMonthEmployees.push({
//           employeeId: emp.employeeId,
//           name: emp.name,
//           [month1]: {
//             presentDays: inMonth1.presentDays,
//             totalWorkingDays: inMonth1.totalWorkingDays,
//             leaves: leavesIn1.length
//           },
//           [month2]: {
//             presentDays: inMonth2.presentDays,
//             totalWorkingDays: inMonth2.totalWorkingDays,
//             leaves: leavesIn2.length
//           }
//         });
//       }
//     });

//     res.json({
//       success: true,
//       months: { month1, month2 },
//       summaries: {
//         [month1]: summaries1.length,
//         [month2]: summaries2.length
//       },
//       leaves: {
//         [month1]: leaves1.length,
//         [month2]: leaves2.length
//       },
//       crossMonthEmployees: crossMonthEmployees.length > 0 ? crossMonthEmployees : "No cross-month data found",
//       note: "This is diagnostic only - no data changed"
//     });

//   } catch (error) {
//     console.error('❌ Check error:', error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// const Attendance = require("../models/Attendance");
// const AttendanceSummary = require("../models/AttendanceSummary");
// const Employee = require("../models/Employee");
// const Leave = require("../models/Leave");

// // ✅ YEHI ADD KARNA HAI - Calculate Day Type Function
// const calculateDayType = (hours) => {
//   const h = parseFloat(hours) || 0;

//   // Same logic as in calculateSummary
//   const FULL_DAY_THRESHOLD = 8.80;
//   const HALF_DAY_THRESHOLD = 4;

//   if (h > FULL_DAY_THRESHOLD) {
//     return "full";
//   } else if (h >= HALF_DAY_THRESHOLD) {
//     return "half";
//   } else {
//     return "full_leave";
//   }
// };

// // ✅ HELPER FUNCTION: Calculate dynamic weekoffs (Sundays) for any month
// const calculateWeekOffsForMonth = (year, month) => {
//   const monthNum = parseInt(month) - 1; // JavaScript में 0-based month
//   const daysInMonth = new Date(year, monthNum + 1, 0).getDate();

//   let sundayCount = 0;
//   for (let day = 1; day <= daysInMonth; day++) {
//     const currentDate = new Date(year, monthNum, day);
//     if (currentDate.getDay() === 0) { // 0 = Sunday
//       sundayCount++;
//     }
//   }

//   return {
//     weekOffs: sundayCount,
//     daysInMonth: daysInMonth,
//     monthName: new Date(year, monthNum, 1).toLocaleString('default', { month: 'long' }),
//     year: year
//   };
// };

// /**
//  * 📌 Get All Attendance Records with Filters
//  */
// exports.getAllAttendance = async (req, res) => {
//   try {
//     const { fromDate, toDate, month, employeeId } = req.query;

//     let query = {};

//     // Date range filter
//     if (fromDate && toDate) {
//       query.checkInTime = {
//         $gte: new Date(fromDate),
//         $lte: new Date(toDate + 'T23:59:59.999Z')
//       };
//     }

//     // Month filter
//     if (month) {
//       const [year, monthNum] = month.split('-');
//       const startDate = new Date(year, monthNum - 1, 1);
//       const endDate = new Date(year, monthNum, 0, 23, 59, 59, 999);

//       query.checkInTime = {
//         $gte: startDate,
//         $lte: endDate
//       };
//     }

//     // Employee filter
//     if (employeeId) {
//       query.employeeId = employeeId;
//     }

//     const records = await Attendance.find(query)
//       .sort({ checkInTime: -1 })
//       .lean();

//     res.json({
//       success: true,
//       records: records,
//       count: records.length
//     });

//   } catch (error) {
//     console.error('❌ Error fetching attendance:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching attendance records',
//       error: error.message
//     });
//   }
// };

// /**
//  * 📌 Update Attendance Record (Hours, Region, Comment) - FIXED VERSION
//  */
// exports.updateAttendance = async (req, res) => {
//   try {
//     const { attendanceId, hours, region, reason } = req.body;

//     console.log('📝 Update request received:', { attendanceId, hours, region, reason });

//     if (!attendanceId) {
//       return res.status(400).json({
//         success: false,
//         message: 'Attendance ID is required'
//       });
//     }

//     if (hours === undefined && !region && !reason) {
//       return res.status(400).json({
//         success: false,
//         message: 'At least one field (hours, region, or reason) is required to update'
//       });
//     }

//     const updateData = {};
//     if (hours !== undefined) updateData.totalHours = parseFloat(hours);
//     if (region !== undefined) updateData.region = region;
//     if (reason !== undefined) {
//       updateData.reason = reason;
//       updateData.comment = reason; // Also update comment field for compatibility
//     }

//     // Recalculate day type based on new hours
//     if (hours !== undefined) {
//       const calculatedDayType = calculateDayType(parseFloat(hours));
//       updateData.dayType = calculatedDayType;
//     }

//     console.log('🔄 Update data:', updateData);

//     const updatedRecord = await Attendance.findByIdAndUpdate(
//       attendanceId,
//       updateData,
//       { new: true, runValidators: true }
//     );

//     if (!updatedRecord) {
//       return res.status(404).json({
//         success: false,
//         message: 'Attendance record not found'
//       });
//     }

//     console.log('✅ Attendance record updated:', {
//       id: attendanceId,
//       hours: hours,
//       region: region,
//       reason: reason,
//       dayType: updatedRecord.dayType
//     });

//     // 🔥 AUTO RECALCULATE SUMMARY FOR THAT MONTH
//     const d = new Date(updatedRecord.checkInTime);
//     const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

//     console.log("🔁 Auto recalculating summary for:", month);

//     // Delete old summary of that month
//     await AttendanceSummary.deleteMany({ month });

//     // Recalculate summary
//     await exports.calculateSummary(
//       { body: { month } },
//       { json: () => {} } // dummy response
//     );

//     res.json({
//       success: true,
//       message: 'Attendance record updated successfully',
//       record: updatedRecord
//     });

//   } catch (error) {
//     console.error('❌ Error updating attendance:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error updating attendance record',
//       error: error.message
//     });
//   }
// };

// /**
//  * 📌 Save Attendance Summary
//  */
// exports.saveSummary = async (req, res) => {
//   try {
//     const { summaries, fromDate, toDate, month } = req.body;

//     if (!summaries || !Array.isArray(summaries)) {
//       return res.status(400).json({ 
//         success: false,
//         message: "Invalid summary data" 
//       });
//     }

//     console.log('💾 Saving summary for:', {
//       month,
//       fromDate,
//       toDate,
//       employeeCount: summaries.length
//     });

//     // Remove existing summaries for the same period
//     let deleteQuery = {};
//     if (month) {
//       deleteQuery.month = month;
//     } else if (fromDate && toDate) {
//       deleteQuery.fromDate = fromDate;
//       deleteQuery.toDate = toDate;
//     }

//     if (Object.keys(deleteQuery).length > 0) {
//       await AttendanceSummary.deleteMany(deleteQuery);
//       console.log('🗑️ Cleared existing summaries for period');
//     }

//     // Prepare data for insertion with updated field names
//     const insertData = summaries.map((summary) => ({
//       employeeId: summary.employeeId,
//       name: summary.name,
//       month: summary.month,
//       presentDays: summary.presentDays || 0,
//       lateDays: summary.lateDays || 0,
//       onsiteDays: summary.onsiteDays || 0,
//       halfDayWorking: summary.halfDayWorking || summary.halfDayLeaves || 0,
//       fullDayNotWorking: summary.fullDayNotWorking || summary.fullDayLeaves || 0,
//       totalWorkingDays: summary.totalWorkingDays || 0,
//       fromDate: fromDate || null,
//       toDate: toDate || null,
//       calculatedSalary: summary.calculatedSalary || 0,
//       workingDays: summary.workingDays || 0,
//       overTimeHours: summary.overTimeHours || 0,
//       onsiteYesDays: summary.onsiteYesDays || 0,
//       onsiteNoDays: summary.onsiteNoDays || 0,
//       reasonCount: summary.reasonCount || {
//         onsite: 0,
//         fieldWork: 0,
//         workFromHome: 0
//       },
//       createdAt: new Date()
//     }));

//     const result = await AttendanceSummary.insertMany(insertData);

//     console.log('✅ Summary saved successfully:', result.length, 'records');

//     res.json({
//       success: true,
//       message: "Summary saved successfully",
//       count: result.length,
//       data: result
//     });

//   } catch (err) {
//     console.error('❌ Error saving summary:', err);
//     res.status(500).json({ 
//       success: false,
//       message: err.message 
//     });
//   }
// };

// /**
//  * 📌 Get Saved Summary - ✅ FIXED: Auto-correct wrong data
//  */
// exports.getSummary = async (req, res) => {
//   try {
//     const { month, fromDate, toDate, employeeId } = req.query;

//     console.log("📥 GetSummary API Called with:", { month, fromDate, toDate, employeeId });

//     let filter = {};

//     // Date range filter
//     if (fromDate && toDate) {
//       filter.createdAt = {
//         $gte: new Date(fromDate),
//         $lte: new Date(toDate + "T23:59:59.999Z")
//       };
//     }

//     // Month filter
//     if (month) {
//       filter.month = month;
//     }

//     // Employee filter
//     if (employeeId) {
//       filter.employeeId = employeeId;
//     }

//     console.log("🔍 Database Filter:", filter);

//     let data = await AttendanceSummary.find(filter).sort({ createdAt: -1 });

//     console.log("✅ Found records:", data.length);

//     // ✅ FIXED: Auto-correct wrong data for current month
//     const today = new Date();
//     const currentYear = today.getFullYear();
//     const currentMonth = today.getMonth() + 1;
//     const currentDay = today.getDate();

//     const correctedData = data.map(summary => {
//       if (summary.month) {
//         const [year, monthNum] = summary.month.split('-').map(Number);

//         // Only correct if current month
//         if (year === currentYear && monthNum === currentMonth) {
//           const summaryObj = summary.toObject(); // Convert to plain object

//           // Get corrected values
//           const correctedPresent = Math.min(summary.presentDays, currentDay);
//           const correctedLate = Math.min(summary.lateDays, currentDay);
//           const correctedOnsite = Math.min(summary.onsiteDays, currentDay);
//           const correctedHalf = Math.min(summary.halfDayWorking, currentDay);
//           const correctedFullLeave = Math.min(summary.fullDayNotWorking, currentDay);
//           const correctedTotal = correctedPresent + (correctedHalf * 0.5);

//           console.log(`🔧 Auto-correcting ${summary.employeeId}: present ${summary.presentDays} → ${correctedPresent}`);

//           return {
//             ...summaryObj,
//             presentDays: correctedPresent,
//             lateDays: correctedLate,
//             onsiteDays: correctedOnsite,
//             halfDayWorking: correctedHalf,
//             fullDayNotWorking: correctedFullLeave,
//             totalWorkingDays: correctedTotal
//           };
//         }
//       }
//       return summary;
//     });

//     // Check if any correction happened
//     const wasCorrected = JSON.stringify(data) !== JSON.stringify(correctedData);
//     if (wasCorrected) {
//       console.log("🔄 Summary data auto-corrected for current month");
//     }

//     res.json({
//       success: true,
//       count: correctedData.length,
//       summary: correctedData,
//       note: wasCorrected ? "Data auto-corrected for current month" : "Data is correct"
//     });
//   } catch (err) {
//     console.error('❌ Error fetching summary:', err);
//     res.status(500).json({ 
//       success: false,
//       message: err.message 
//     });
//   }
// };

// /**
//  * 📌 Calculate Summary from Raw Data - COMPLETELY FIXED VERSION (November-December Separate)
//  */
// exports.calculateSummary = async (req, res) => {
//   try {
//     const { fromDate, toDate, month } = req.body;

//     let query = {};

//     console.log("📥 CalculateSummary called with:", { month, fromDate, toDate });

//     // 🔍 Use a separate variable for processed month
//     let processedMonth = month;

//     // 🔍 STRICT MONTH FILTERING
//     if (processedMonth) {
//       const [year, m] = processedMonth.split("-");
//       const start = new Date(year, m - 1, 1);

//       // Month ka exact last day
//       let end = new Date(year, m, 0, 23, 59, 59, 999);

//       // Agar current month hai, toh sirf aaj tak
//       const today = new Date();
//       const currentYear = today.getFullYear();
//       const currentMonth = today.getMonth() + 1;

//       if (parseInt(year) === currentYear && parseInt(m) === currentMonth) {
//         end = new Date(today);
//         end.setHours(23, 59, 59, 999);
//         console.log("✅ Current month detected. Limiting to today:", end);
//       }

//       query.checkInTime = { $gte: start, $lte: end };
//       console.log("📅 STRICT Month filter applied:", processedMonth, "from", start, "to", end);

//     } else if (fromDate && toDate) {
//       query.checkInTime = {
//         $gte: new Date(fromDate),
//         $lte: new Date(toDate + "T23:59:59.999Z")
//       };
//       console.log("📅 Date range filter applied:", fromDate, toDate);

//       // If no month but date range, calculate month from fromDate
//       if (fromDate) {
//         const date = new Date(fromDate);
//         processedMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
//       }
//     } else {
//       // Default: current month
//       const today = new Date();
//       const start = new Date(today.getFullYear(), today.getMonth(), 1);
//       const end = new Date(today);
//       end.setHours(23, 59, 59, 999);

//       query.checkInTime = { $gte: start, $lte: end };
//       processedMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
//       console.log("📅 No filter, using current month:", processedMonth);
//     }

//     console.log("🔍 MongoDB Query:", JSON.stringify(query));
//     console.log("📆 Processing month:", processedMonth);

//     // 🟦 Fetch attendance + employees
//     const attendanceRecords = await Attendance.find(query).sort({ checkInTime: -1 });
//     const employees = await Employee.find({});

//     console.log("📊 Attendance records found:", attendanceRecords.length);
//     console.log("👥 Employees found:", employees.length);

//     // DEBUG: Check months in fetched records
//     if (attendanceRecords.length > 0) {
//       const monthsInRecords = [...new Set(attendanceRecords.map(rec => {
//         const d = new Date(rec.checkInTime);
//         return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
//       }))];
//       console.log("📆 Months found in attendance records:", monthsInRecords);
//     }

//     // Constants
//     const FULL_DAY_THRESHOLD = 8.80;
//     const HALF_DAY_THRESHOLD = 4;

//     const calculateDayType = (hrs) => {
//       const h = parseFloat(hrs) || 0;

//       if (h > FULL_DAY_THRESHOLD) {
//         return "full";
//       } else if (h >= HALF_DAY_THRESHOLD) {
//         return "half";
//       } else {
//         return "full_leave";
//       }
//     };

//     const summaryMap = {};
//     const processedDates = {};

//     // 🔴 MAIN FIX: Strict month filtering during processing
//     attendanceRecords.forEach((rec) => {
//       if (!rec.employeeId || !rec.checkInTime) return;

//       const employeeId = rec.employeeId;
//       const checkInDate = new Date(rec.checkInTime);
//       const dateKey = checkInDate.toISOString().split("T")[0];

//       // ✅ STRICT CHECK: Record का month processedMonth से match होना चाहिए
//       const recordMonth = `${checkInDate.getFullYear()}-${String(checkInDate.getMonth() + 1).padStart(2, "0")}`;

//       if (processedMonth && recordMonth !== processedMonth) {
//         // Skip records from different months
//         console.log(`⏩ SKIPPING: ${employeeId} - Record from ${recordMonth}, but processing ${processedMonth}`);
//         return;
//       }

//       // Future date check
//       const today = new Date();
//       if (checkInDate > today) {
//         console.log(`⏭️ Skipping future date: ${employeeId} - ${checkInDate}`);
//         return;
//       }

//       // Initialize summary
//       if (!summaryMap[employeeId]) {
//         const emp = employees.find((e) => e.employeeId === employeeId) || {};

//         summaryMap[employeeId] = {
//           employeeId,
//           name: emp.name || `Employee ${employeeId}`,
//           month: processedMonth,

//           presentDays: 0,
//           lateDays: 0,
//           onsiteDays: 0,

//           onsiteYesDays: 0,
//           onsiteNoDays: 0,

//           reasonCount: {
//             onsite: 0,
//             fieldWork: 0,
//             workFromHome: 0
//           },

//           halfDayWorking: 0,
//           fullDayNotWorking: 0,
//           totalWorkingDays: 0,

//           overTimeHours: 0,

//           workingDays: 0,
//           calculatedSalary: 0,
//           totalRecords: 0
//         };

//         processedDates[employeeId] = new Set();
//       }

//       // Skip duplicate date
//       if (processedDates[employeeId].has(dateKey)) {
//         console.log(`⏩ Skipping duplicate date for ${employeeId}: ${dateKey}`);
//         return;
//       }
//       processedDates[employeeId].add(dateKey);

//       // Hours calculation
//       let hours = 0;
//       if (rec.totalHours !== undefined) {
//         hours = parseFloat(rec.totalHours);
//       } else if (rec.checkOutTime) {
//         hours = (new Date(rec.checkOutTime) - new Date(rec.checkInTime)) / (1000 * 60 * 60);
//       }

//       const STANDARD_HOURS = 9;
//       const extraHours = Math.max(hours - STANDARD_HOURS, 0);

//       // OT accumulate
//       summaryMap[employeeId].overTimeHours += Number(extraHours.toFixed(2));

//       // Day type
//       const type = calculateDayType(hours);

//       console.log(`📊 ${employeeId} - ${dateKey}: ${hours.toFixed(2)}h = ${type}`);

//       if (type === "full") {
//         summaryMap[employeeId].presentDays += 1;
//         summaryMap[employeeId].totalWorkingDays += 1;
//       } else if (type === "half") {
//         summaryMap[employeeId].halfDayWorking += 1;
//         summaryMap[employeeId].totalWorkingDays += 0.5;
//       } else if (type === "full_leave") {
//         summaryMap[employeeId].fullDayNotWorking += 1;
//       }

//       // Late check-in
//       const hour = checkInDate.getHours();
//       const minute = checkInDate.getMinutes();
//       if (hour > 10 || (hour === 10 && minute > 0)) {
//         summaryMap[employeeId].lateDays += 1;
//       }

//       // Onsite days
//       if (rec.onsite === true) {
//         summaryMap[employeeId].onsiteDays += 1;
//         summaryMap[employeeId].onsiteYesDays += 1;
//       } else {
//         summaryMap[employeeId].onsiteNoDays += 1;
//       }

//       summaryMap[employeeId].totalRecords += 1;
//     });

//     const summaryArray = Object.values(summaryMap);

//     console.log("📋 Summary calculated for", processedMonth + ":", summaryArray.length, "employees");

//     // Current month adjustment
//     if (processedMonth) {
//       const now = new Date();
//       const [selectedYear, selectedMonth] = processedMonth.split('-').map(Number);
//       const currentYear = now.getFullYear();
//       const currentMonth = now.getMonth() + 1;
//       const currentDay = now.getDate();

//       if (selectedYear === currentYear && selectedMonth === currentMonth) {
//         console.log("✅ Adjusting for current month, max days:", currentDay);

//         summaryArray.forEach(emp => {
//           const correctedPresent = Math.min(emp.presentDays, currentDay);
//           const correctedLate = Math.min(emp.lateDays, currentDay);
//           const correctedOnsite = Math.min(emp.onsiteDays, currentDay);
//           const correctedHalf = Math.min(emp.halfDayWorking, currentDay);
//           const correctedFullLeave = Math.min(emp.fullDayNotWorking, currentDay);
//           const correctedTotal = correctedPresent + (correctedHalf * 0.5);

//           emp.presentDays = correctedPresent;
//           emp.lateDays = correctedLate;
//           emp.onsiteDays = correctedOnsite;
//           emp.halfDayWorking = correctedHalf;
//           emp.fullDayNotWorking = correctedFullLeave;
//           emp.totalWorkingDays = correctedTotal;
//         });
//       }
//     }

//     // ✅ SAVE TO DATABASE (ONLY for this month)
//     if (summaryArray.length > 0 && processedMonth) {
//       // Delete ONLY summaries for this specific month
//       const deleteFilter = { month: processedMonth };

//       console.log("🗑️ Deleting existing summaries for:", processedMonth);

//       const deleteResult = await AttendanceSummary.deleteMany(deleteFilter);
//       console.log(`🗑️ Deleted ${deleteResult.deletedCount} existing summaries for ${processedMonth}`);

//       // Save new summaries with CORRECT month
//       const summariesToSave = summaryArray.map(summary => ({
//         ...summary,
//         month: processedMonth, // Ensure month is saved correctly
//         fromDate: fromDate || null,
//         toDate: toDate || null,
//         calculatedAt: new Date(),
//         createdAt: new Date()
//       }));

//       const savedSummaries = await AttendanceSummary.insertMany(summariesToSave);
//       console.log(`💾 Saved ${savedSummaries.length} summaries for ${processedMonth}`);

//       // Verify what was saved
//       const verifyData = await AttendanceSummary.find({ month: processedMonth });
//       console.log(`✅ Verification: ${verifyData.length} records now in DB for ${processedMonth}`);
//     }

//     res.json({
//       success: true,
//       count: summaryArray.length,
//       summary: summaryArray,
//       month: processedMonth,
//       message: `Summary calculated and saved successfully for ${processedMonth}`
//     });

//   } catch (err) {
//     console.error('❌ Error calculating summary:', err);
//     res.status(500).json({ 
//       success: false,
//       message: err.message 
//     });
//   }
// };

// /**
//  * 📌 Get Employee Details for Specific Employee
//  */
// exports.getEmployeeDetails = async (req, res) => {
//   try {
//     const { employeeId, fromDate, toDate, month } = req.query;

//     if (!employeeId) {
//       return res.status(400).json({
//         success: false,
//         message: 'Employee ID is required'
//       });
//     }

//     console.log('🔍 Fetching details for employee:', employeeId, { fromDate, toDate, month });

//     let query = { employeeId };

//     // Date range filter
//     if (fromDate && toDate) {
//       query.checkInTime = {
//         $gte: new Date(fromDate),
//         $lte: new Date(toDate + 'T23:59:59.999Z')
//       };
//     }

//     // Month filter
//     if (month) {
//       const [year, monthNum] = month.split('-');
//       const startDate = new Date(year, monthNum - 1, 1);
//       const endDate = new Date(year, monthNum, 0, 23, 59, 59, 999);

//       query.checkInTime = {
//         $gte: startDate,
//         $lte: endDate
//       };
//     }

//     const details = await Attendance.find(query)
//       .sort({ checkInTime: -1 })
//       .lean();

//     console.log('📋 Details found:', details.length);

//     // Get employee info
//     const employee = await Employee.findOne({ employeeId });

//     res.json({
//       success: true,
//       employee: employee || { employeeId, name: 'Unknown' },
//       details: details,
//       count: details.length
//     });

//   } catch (error) {
//     console.error('❌ Error fetching employee details:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching employee details',
//       error: error.message
//     });
//   }
// };

// /**
//  * 📌 Fix Wrong Summary Data (Without Deleting) - ✅ NEW FUNCTION ADDED
//  */
// exports.fixSummaryData = async (req, res) => {
//   try {
//     const { month } = req.body;

//     if (!month) {
//       return res.status(400).json({
//         success: false,
//         message: "Month is required (e.g., 2025-12)"
//       });
//     }

//     const today = new Date();
//     const currentYear = today.getFullYear();
//     const currentMonth = today.getMonth() + 1;
//     const currentDay = today.getDate();

//     const [year, monthNum] = month.split('-').map(Number);

//     console.log(`🔧 Fixing summary data for ${month}, current day: ${currentDay}`);

//     let updateCount = 0;

//     if (year === currentYear && monthNum === currentMonth) {
//       // Current month hai - limit to current day
//       const summaries = await AttendanceSummary.find({ month });

//       for (const summary of summaries) {
//         // Calculate new correct values
//         const correctedPresent = Math.min(summary.presentDays, currentDay);
//         const correctedLate = Math.min(summary.lateDays, currentDay);
//         const correctedOnsite = Math.min(summary.onsiteDays, currentDay);
//         const correctedHalf = Math.min(summary.halfDayWorking, currentDay);
//         const correctedFullLeave = Math.min(summary.fullDayNotWorking, currentDay);
//         const correctedTotal = correctedPresent + (correctedHalf * 0.5);

//         // Update if needed
//         if (summary.presentDays !== correctedPresent || 
//             summary.lateDays !== correctedLate ||
//             summary.totalWorkingDays !== correctedTotal) {

//           await AttendanceSummary.findByIdAndUpdate(
//             summary._id,
//             {
//               presentDays: correctedPresent,
//               lateDays: correctedLate,
//               onsiteDays: correctedOnsite,
//               halfDayWorking: correctedHalf,
//               fullDayNotWorking: correctedFullLeave,
//               totalWorkingDays: correctedTotal
//             }
//           );

//           updateCount++;
//           console.log(`✅ Fixed ${summary.employeeId}: present ${summary.presentDays} → ${correctedPresent} days`);
//         }
//       }
//     } else {
//       // Past month hai - kuch mat karo
//       console.log(`ℹ️ ${month} is past month, no fix needed`);
//     }

//     res.json({
//       success: true,
//       message: `Fixed ${updateCount} summary records for ${month}`,
//       fixedCount: updateCount
//     });

//   } catch (error) {
//     console.error('❌ Error fixing summary:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error fixing summary data',
//       error: error.message
//     });
//   }
// };

// /**
//  * 📌 Get Salaries - ULTIMATE FIX (No Data Deletion)
//  */
// /**
//  * 📌 Get Salaries - CORRECTED VERSION (Calculate based on actual month days)
//  */
// /**
//  * 📌 Get Salaries - SIMPLE DYNAMIC CALCULATION (No model changes)
//  */
// /**
//  * 📌 Get Salaries - DYNAMIC WEEKOFF CALCULATION (SIMPLE VERSION)
//  */
// exports.getSalaries = async (req, res) => {
//   try {
//     let { month } = req.query;

//     // Agar month empty hai toh current month use karein
//     if (!month || month.trim() === "") {
//       const today = new Date();
//       month = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
//     }

//     month = month.trim();
//     console.log(`💰 Processing salaries for month: "${month}"`);

//     const [year, monthNum] = month.split("-").map(Number);

//     // Validate month
//     if (isNaN(year) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid month format. Use YYYY-MM"
//       });
//     }

//     const start = new Date(year, monthNum - 1, 1);
//     const end = new Date(year, monthNum, 0, 23, 59, 59, 999);

//     // ✅ DYNAMIC: Calculate actual days and weekoffs for this month
//     const { weekOffs: dynamicWeekOffs, daysInMonth } = calculateWeekOffsForMonth(year, monthNum);

//     console.log(`📅 ${month}: ${daysInMonth} days, ${dynamicWeekOffs} Sundays (Weekoffs)`);

//     // 1️⃣ Employees
//     const employees = await Employee.find({});
//     console.log(`👥 Total employees: ${employees.length}`);

//     // 2️⃣ Attendance for SPECIFIC month
//     const attendanceSummaries = await AttendanceSummary.find({ month });
//     console.log(`📊 Attendance summaries for ${month}: ${attendanceSummaries.length}`);

//     // ✅ MAP attendance by employeeId
//     const attendanceMap = {};
//     attendanceSummaries.forEach(a => {
//       attendanceMap[String(a.employeeId)] = a;
//     });

//     // 3️⃣ Approved leaves for this month
//     const allLeaves = await Leave.find({ status: "approved" });

//     const monthLeaves = allLeaves.filter(leave => {
//       const leaveStart = new Date(leave.startDate);
//       const leaveEnd = new Date(leave.endDate || leave.startDate);
//       return leaveStart <= end && leaveEnd >= start;
//     });

//     console.log(`🍃 Approved leaves for ${month}: ${monthLeaves.length}`);

//     const leavesByEmployee = {};
//     monthLeaves.forEach(l => {
//       if (!leavesByEmployee[l.employeeId]) {
//         leavesByEmployee[l.employeeId] = [];
//       }
//       leavesByEmployee[l.employeeId].push(l);
//     });

//     // 4️⃣ Salary calculation - DYNAMIC VERSION (SIMPLE)
//     const salaryMap = {};

//     employees.forEach(emp => {
//       // ✅ USE DYNAMIC WEEKOFFS FOR EVERYONE (Ignore database weekOffPerMonth)
//       const weekOffs = dynamicWeekOffs; // सभी को same weekoffs मिलेंगे (month के based)

//       // ✅ CORRECT attendance for selected month
//       const empAttendance = attendanceMap[String(emp.employeeId)];

//       const salaryPerMonth = emp.salaryPerMonth || 0;

//       // ✅ CORRECT DAILY RATE: Monthly salary divided by ACTUAL days in month
//       const dailyRate = salaryPerMonth / daysInMonth;

//       // Agar attendance nahi hai is month ke liye, toh 0 consider karein
//       const presentDays = empAttendance?.presentDays || 0;
//       const halfDays = empAttendance?.halfDayWorking || 0;
//       const effectiveWorkingDays = presentDays + (halfDays * 0.5);

//       // ✅ CORRECT CALCULATION: (Working days + WeekOffs) * Daily rate
//       const paidDays = Math.max(0, effectiveWorkingDays + weekOffs);
//       const calculatedSalary = Math.round(paidDays * dailyRate);

//       const empLeaves = leavesByEmployee[emp.employeeId] || [];
//       let totalLeaveDays = 0;
//       const leaveTypes = {};

//       empLeaves.forEach(leave => {
//         const type = leave.leaveType?.toUpperCase() || "UNKNOWN";
//         leaveTypes[type] = (leaveTypes[type] || 0) + 1;
//         totalLeaveDays += 1;
//       });

//       salaryMap[emp.employeeId] = {
//         employeeId: emp.employeeId,
//         name: emp.name,
//         month: month,

//         // Attendance data
//         presentDays: presentDays,
//         halfDayWorking: halfDays,
//         fullDayNotWorking: empAttendance?.fullDayNotWorking || 0,
//         totalWorkingDays: effectiveWorkingDays,

//         // ✅ WeekOffs - DYNAMIC (same for all employees this month)
//         weekOffs: weekOffs,
//         weekOffSource: "dynamic", // Always dynamic calculation
//         weekOffDay: "Sunday", // Default Sunday

//         // Leaves
//         totalLeaves: totalLeaveDays,
//         leaveTypes: totalLeaveDays > 0 ? leaveTypes : "No Leaves",

//         // Salary info
//         salaryPerMonth: salaryPerMonth,
//         salaryPerDay: Number(dailyRate.toFixed(2)),
//         paidDays: paidDays,
//         calculatedSalary: calculatedSalary,
//         calculatedSalaryDisplay: `₹${calculatedSalary}`,

//         // Month info
//         monthDays: daysInMonth,
//         monthName: `${year}-${String(monthNum).padStart(2, '0')}`,
//         weekOffsInfo: `${weekOffs} Sundays in ${month}`
//       };
//     });

//     res.json({
//       success: true,
//       month: month,
//       monthDays: daysInMonth,
//       weekOffsInMonth: dynamicWeekOffs,
//       salaries: Object.values(salaryMap),
//       count: Object.values(salaryMap).length,
//       note: `Dynamic calculation: ${daysInMonth} days, ${dynamicWeekOffs} weekoffs in ${month}`
//     });

//   } catch (error) {
//     console.error("❌ Error in getSalaries:", error);
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// };

// /**
//  * 📌 Check Month Data - Diagnostic Function
//  */
// exports.checkMonthData = async (req, res) => {
//   try {
//     const { month1, month2 } = req.query;

//     console.log(`🔍 Checking data for months: ${month1} and ${month2}`);

//     // Get summaries for both months
//     const summaries1 = await AttendanceSummary.find({ month: month1 });
//     const summaries2 = await AttendanceSummary.find({ month: month2 });

//     // Get leaves for both months
//     const [year1, monthNum1] = month1.split("-").map(Number);
//     const start1 = new Date(year1, monthNum1 - 1, 1);
//     const end1 = new Date(year1, monthNum1, 0, 23, 59, 59, 999);

//     const [year2, monthNum2] = month2.split("-").map(Number);
//     const start2 = new Date(year2, monthNum2 - 1, 1);
//     const end2 = new Date(year2, monthNum2, 0, 23, 59, 59, 999);

//     const leaves1 = await Leave.find({
//       status: 'approved',
//       $or: [
//         { startDate: { $gte: start1, $lte: end1 } },
//         { endDate: { $gte: start1, $lte: end1 } },
//         { $and: [
//             { startDate: { $lte: start1 } },
//             { endDate: { $gte: end1 } }
//           ]
//         }
//       ]
//     });

//     const leaves2 = await Leave.find({
//       status: 'approved',
//       $or: [
//         { startDate: { $gte: start2, $lte: end2 } },
//         { endDate: { $gte: start2, $lte: end2 } },
//         { $and: [
//             { startDate: { $lte: start2 } },
//             { endDate: { $gte: end2 } }
//           ]
//         }
//       ]
//     });

//     // Find employees with data in both months
//     const employees = await Employee.find({});
//     const crossMonthEmployees = [];

//     employees.forEach(emp => {
//       const inMonth1 = summaries1.find(s => s.employeeId === emp.employeeId);
//       const inMonth2 = summaries2.find(s => s.employeeId === emp.employeeId);
//       const leavesIn1 = leaves1.filter(l => l.employeeId === emp.employeeId);
//       const leavesIn2 = leaves2.filter(l => l.employeeId === emp.employeeId);

//       if (inMonth1 && inMonth2) {
//         crossMonthEmployees.push({
//           employeeId: emp.employeeId,
//           name: emp.name,
//           [month1]: {
//             presentDays: inMonth1.presentDays,
//             totalWorkingDays: inMonth1.totalWorkingDays,
//             leaves: leavesIn1.length
//           },
//           [month2]: {
//             presentDays: inMonth2.presentDays,
//             totalWorkingDays: inMonth2.totalWorkingDays,
//             leaves: leavesIn2.length
//           }
//         });
//       }
//     });

//     res.json({
//       success: true,
//       months: { month1, month2 },
//       summaries: {
//         [month1]: summaries1.length,
//         [month2]: summaries2.length
//       },
//       leaves: {
//         [month1]: leaves1.length,
//         [month2]: leaves2.length
//       },
//       crossMonthEmployees: crossMonthEmployees.length > 0 ? crossMonthEmployees : "No cross-month data found",
//       note: "This is diagnostic only - no data changed"
//     });

//   } catch (error) {
//     console.error('❌ Check error:', error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// const Attendance = require("../models/Attendance");
// const AttendanceSummary = require("../models/AttendanceSummary");
// const Employee = require("../models/Employee");
// const Leave = require("../models/Leave");

// // ✅ YEHI ADD KARNA HAI - Calculate Day Type Function
// const calculateDayType = (hours) => {
//   const h = parseFloat(hours) || 0;

//   // Same logic as in calculateSummary
//   const FULL_DAY_THRESHOLD = 8.80;
//   const HALF_DAY_THRESHOLD = 4;

//   if (h > FULL_DAY_THRESHOLD) {
//     return "full";
//   } else if (h >= HALF_DAY_THRESHOLD) {
//     return "half";
//   } else {
//     return "full_leave";
//   }
// };

// // ✅ HELPER FUNCTION: Calculate dynamic weekoffs for specific day - CORRECTED VERSION
// const calculateWeekOffsForDay = (year, month, targetDay) => {
//   // targetDay: 0=Sunday, 1=Monday, ..., 6=Saturday
//   // month: 1-12 (January = 1, December = 12)

//   const monthIndex = month - 1; // JavaScript month: 0-11
//   const daysInMonth = new Date(year, month, 0).getDate();

//   console.log(`🔢 calculateWeekOffsForDay(${year}, ${month}, ${targetDay}) - Days in month: ${daysInMonth}`);

//   let count = 0;
//   for (let day = 1; day <= daysInMonth; day++) {
//     const currentDate = new Date(year, monthIndex, day);
//     if (currentDate.getDay() === targetDay) {
//       count++;
//     }
//   }

//   console.log(`📊 ${year}-${month.toString().padStart(2, '0')}: ${count} days with day=${targetDay}`);

//   return count;
// };

// // ✅ HELPER: Get day name from number
// const getDayName = (dayNum) => {
//   const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
//   return days[dayNum] || 'Sunday';
// };

// // ✅ EMPLOYEE WEEKOFF MAPPING - TUMHARE ACTUAL DATA KE ACCORDING
// const EMPLOYEE_WEEKOFF_MAP = {
//   // ✅ Sunday weekoff wale employees (5 Sundays in Nov 2025)
//   'EMP001': { weekOffDay: 'Sunday', dayNum: 0, weekOffType: '0+4', weekOffPerMonth: 4 },
//   'EMP002': { weekOffDay: 'Sunday', dayNum: 0, weekOffType: '0+4', weekOffPerMonth: 4 },
//   'EMP003': { weekOffDay: 'Sunday', dayNum: 0, weekOffType: '0+4', weekOffPerMonth: 4 },
//   'EMP004': { weekOffDay: 'Sunday', dayNum: 0, weekOffType: '0+4', weekOffPerMonth: 4 },
//   'EMP005': { weekOffDay: 'Sunday', dayNum: 0, weekOffType: '0+4', weekOffPerMonth: 4 },
//   'EMP008': { weekOffDay: 'Sunday', dayNum: 0, weekOffType: '0+4', weekOffPerMonth: 4 },

//   // ❌ Kisi aur din weekoff wale employees (Unka count wahi rahega)
//   'EMP006': { weekOffDay: 'Tuesday', dayNum: 2, weekOffType: '0+2', weekOffPerMonth: 2 }, // Example: 2 Tuesdays in Nov 2025
//   'EMP007': { weekOffDay: 'Friday', dayNum: 5, weekOffType: '0+4', weekOffPerMonth: 4 },  // Example: 4 Fridays in Nov 2025

//   // Add all your employees here with their ACTUAL weekoff days
//   // Default Sunday if not specified
// };

// /**
//  * 📌 Get All Attendance Records with Filters
//  */
// exports.getAllAttendance = async (req, res) => {
//   try {
//     const { fromDate, toDate, month, employeeId } = req.query;

//     let query = {};

//     // Date range filter
//     if (fromDate && toDate) {
//       query.checkInTime = {
//         $gte: new Date(fromDate),
//         $lte: new Date(toDate + 'T23:59:59.999Z')
//       };
//     }

//     // Month filter
//     if (month) {
//       const [year, monthNum] = month.split('-');
//       const startDate = new Date(year, monthNum - 1, 1);
//       const endDate = new Date(year, monthNum, 0, 23, 59, 59, 999);

//       query.checkInTime = {
//         $gte: startDate,
//         $lte: endDate
//       };
//     }

//     // Employee filter
//     if (employeeId) {
//       query.employeeId = employeeId;
//     }

//     const records = await Attendance.find(query)
//       .sort({ checkInTime: -1 })
//       .lean();

//     res.json({
//       success: true,
//       records: records,
//       count: records.length
//     });

//   } catch (error) {
//     console.error('❌ Error fetching attendance:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching attendance records',
//       error: error.message
//     });
//   }
// };

// /**
//  * 📌 Update Attendance Record (Hours, Region, Comment) - FIXED VERSION
//  */
// exports.updateAttendance = async (req, res) => {
//   try {
//     const { attendanceId, hours, region, reason, employeeId, date, checkInTime, checkOutTime, comment } = req.body;

//     console.log('📝 Update request received:', { attendanceId, hours, region, reason, employeeId, date, checkInTime, checkOutTime });

//     let updatedRecord;
//     let targetDate;

//     // ✅ CASE 1: Update Existing Record
//     if (attendanceId) {
//       const updateData = {};
//       if (hours !== undefined) updateData.totalHours = parseFloat(hours);
//       if (region !== undefined) updateData.region = region;
//       if (reason !== undefined) updateData.reason = reason;
//       if (comment !== undefined) updateData.comment = comment;

//       // Handle time updates
//       if (checkInTime) updateData.checkInTime = new Date(checkInTime);
//       if (checkOutTime) updateData.checkOutTime = new Date(checkOutTime);

//       // Recalculate total hours if times are provided
//       if (checkInTime && checkOutTime) {
//         const start = new Date(checkInTime);
//         const end = new Date(checkOutTime);
//         const diffMs = end - start;
//         const diffHours = diffMs / (1000 * 60 * 60);
//         updateData.totalHours = parseFloat(diffHours.toFixed(2));
//         updateData.status = "checked-out";
//       }

//       // Recalculate day type based on new hours
//       if (updateData.totalHours !== undefined) {
//         const calculatedDayType = calculateDayType(updateData.totalHours);
//         updateData.dayType = calculatedDayType;
//       }

//       updatedRecord = await Attendance.findByIdAndUpdate(
//         attendanceId,
//         updateData,
//         { new: true, runValidators: true }
//       );

//       if (!updatedRecord) {
//         return res.status(404).json({
//           success: false,
//           message: 'Attendance record not found'
//         });
//       }

//       targetDate = updatedRecord.checkInTime;
//     }
//     // ✅ CASE 2: Create New Record (Missing Day)
//     else if (employeeId && date && checkInTime) {
//       if (!checkInTime) {
//         return res.status(400).json({ success: false, message: "Check-in time is required for new record" });
//       }

//       const newCheckIn = new Date(checkInTime);
//       const newCheckOut = checkOutTime ? new Date(checkOutTime) : null;
//       let totalHours = 0;

//       if (newCheckOut) {
//         const diffMs = newCheckOut - newCheckIn;
//         totalHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
//       } else if (hours) {
//         totalHours = parseFloat(hours);
//       }

//       updatedRecord = await Attendance.create({
//         employeeId,
//         checkInTime: newCheckIn,
//         checkOutTime: newCheckOut,
//         totalHours: totalHours,
//         reason: reason || "Onsite",
//         comment: comment || "Admin created",
//         status: newCheckOut ? "checked-out" : "checked-in",
//         onsite: reason === "Onsite", // Default assumption
//         dayType: calculateDayType(totalHours)
//       });

//       targetDate = newCheckIn;
//     else {
//       console.log("❌ Missing required fields for update/create:");
//       console.log("attendanceId:", attendanceId);
//       console.log("employeeId:", employeeId);
//       console.log("date:", date);
//       console.log("checkInTime:", checkInTime);
      
//        return res.status(400).json({
//         success: false,
//         message: 'DEBUG: Attendance ID OR (Employee ID + Date + Check-In) is required'
//       });
//     }

//     console.log('✅ Attendance record saved:', updatedRecord);

//     // 🔥 AUTO RECALCULATE SUMMARY FOR THAT MONTH
//     const d = new Date(targetDate);
//     const monthForSummary = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

//     console.log("🔁 Auto recalculating summary for:", monthForSummary);

//     // Delete old summary of that month
//     await AttendanceSummary.deleteMany({ month: monthForSummary });

//     // Recalculate summary
//     await exports.calculateSummary(
//       { body: { month: monthForSummary } },
//       { json: () => { } } // dummy response
//     );

//     res.json({
//       success: true,
//       message: 'Attendance record updated successfully',
//       record: updatedRecord
//     });

//   } catch (error) {
//     console.error('❌ Error updating attendance:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error updating attendance record',
//       error: error.message
//     });
//   }
// };

// /**
//  * 📌 Save Attendance Summary
//  */
// exports.saveSummary = async (req, res) => {
//   try {
//     const { summaries, fromDate, toDate, month } = req.body;

//     if (!summaries || !Array.isArray(summaries)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid summary data"
//       });
//     }

//     console.log('💾 Saving summary for:', {
//       month,
//       fromDate,
//       toDate,
//       employeeCount: summaries.length
//     });

//     // Remove existing summaries for the same period
//     let deleteQuery = {};
//     if (month) {
//       deleteQuery.month = month;
//     } else if (fromDate && toDate) {
//       deleteQuery.fromDate = fromDate;
//       deleteQuery.toDate = toDate;
//     }

//     if (Object.keys(deleteQuery).length > 0) {
//       await AttendanceSummary.deleteMany(deleteQuery);
//       console.log('🗑️ Cleared existing summaries for period');
//     }

//     // Prepare data for insertion with updated field names
//     const insertData = summaries.map((summary) => ({
//       employeeId: summary.employeeId,
//       name: summary.name,
//       month: summary.month,
//       presentDays: summary.presentDays || 0,
//       lateDays: summary.lateDays || 0,
//       onsiteDays: summary.onsiteDays || 0,
//       halfDayWorking: summary.halfDayWorking || summary.halfDayLeaves || 0,
//       fullDayNotWorking: summary.fullDayNotWorking || summary.fullDayLeaves || 0,
//       totalWorkingDays: summary.totalWorkingDays || 0,
//       fromDate: fromDate || null,
//       toDate: toDate || null,
//       calculatedSalary: summary.calculatedSalary || 0,
//       workingDays: summary.workingDays || 0,
//       overTimeHours: summary.overTimeHours || 0,
//       onsiteYesDays: summary.onsiteYesDays || 0,
//       onsiteNoDays: summary.onsiteNoDays || 0,
//       reasonCount: summary.reasonCount || {
//         onsite: 0,
//         fieldWork: 0,
//         workFromHome: 0
//       },
//       extraWork: summary.extraWork || {
//         extraDays: 0,
//         extraHours: 0,
//         bonus: 0,
//         deductions: 0,
//         reason: ""
//       },
//       createdAt: new Date()
//     }));

//     const result = await AttendanceSummary.insertMany(insertData);

//     console.log('✅ Summary saved successfully:', result.length, 'records');

//     res.json({
//       success: true,
//       message: "Summary saved successfully",
//       count: result.length,
//       data: result
//     });

//   } catch (err) {
//     console.error('❌ Error saving summary:', err);
//     res.status(500).json({
//       success: false,
//       message: err.message
//     });
//   }
// };

// /**
//  * 📌 Get Saved Summary - ✅ FIXED: Auto-correct wrong data
//  */
// exports.getSummary = async (req, res) => {
//   try {
//     const { month, fromDate, toDate, employeeId } = req.query;

//     console.log("📥 GetSummary API Called with:", { month, fromDate, toDate, employeeId });

//     let filter = {};

//     // Date range filter
//     if (fromDate && toDate) {
//       filter.createdAt = {
//         $gte: new Date(fromDate),
//         $lte: new Date(toDate + "T23:59:59.999Z")
//       };
//     }

//     // Month filter
//     if (month) {
//       filter.month = month;
//     }

//     // Employee filter
//     if (employeeId) {
//       filter.employeeId = employeeId;
//     }

//     console.log("🔍 Database Filter:", filter);

//     let data = await AttendanceSummary.find(filter).sort({ createdAt: -1 });

//     console.log("✅ Found records:", data.length);

//     // ✅ FIXED: Auto-correct wrong data for current month (DISABLED TO RESPECT MANUAL EDITS)
//     const today = new Date();
//     // const currentYear = today.getFullYear();
//     // const currentMonth = today.getMonth() + 1;
//     // const currentDay = today.getDate();

//     const correctedData = data.map(summary => {
//       /* 
//       // ❌ DISABLE AUTO-CORRECT: Use DB values as truth (User edits are priority)
//       if (summary.month) {
//         const [year, monthNum] = summary.month.split('-').map(Number);

//         // Only correct if current month
//         if (year === currentYear && monthNum === currentMonth) {
//           const summaryObj = summary.toObject(); // Convert to plain object

//           // Get corrected values
//           const correctedPresent = Math.min(summary.presentDays, currentDay);
//           const correctedLate = Math.min(summary.lateDays, currentDay);
//           const correctedOnsite = Math.min(summary.onsiteDays, currentDay);
//           const correctedHalf = Math.min(summary.halfDayWorking, currentDay);
//           const correctedFullLeave = Math.min(summary.fullDayNotWorking, currentDay);
//           const correctedTotal = correctedPresent + (correctedHalf * 0.5);

//           return {
//             ...summaryObj,
//             presentDays: correctedPresent,
//             lateDays: correctedLate,
//             onsiteDays: correctedOnsite,
//             halfDayWorking: correctedHalf,
//             fullDayNotWorking: correctedFullLeave,
//             totalWorkingDays: correctedTotal
//           };
//         }
//       }
//       */
//       return summary;
//     });

//     res.json({
//       success: true,
//       count: data.length, // data.length is correct
//       summary: data,      // Return raw DB data
//       note: "Data from DB (Manual edits respected)"
//     });
//   } catch (err) {
//     console.error('❌ Error fetching summary:', err);
//     res.status(500).json({
//       success: false,
//       message: err.message
//     });
//   }
// };

// /**
//  * 📌 Calculate Summary from Raw Data - COMPLETELY FIXED VERSION (November-December Separate)
//  */
// exports.calculateSummary = async (req, res) => {
//   try {
//     const { fromDate, toDate, month } = req.body;

//     let query = {};

//     console.log("📥 CalculateSummary called with:", { month, fromDate, toDate });

//     // 🔍 Use a separate variable for processed month
//     let processedMonth = month;

//     // 🔍 STRICT MONTH FILTERING
//     if (processedMonth) {
//       const [year, m] = processedMonth.split("-");
//       const start = new Date(year, m - 1, 1);

//       // Month ka exact last day
//       let end = new Date(year, m, 0, 23, 59, 59, 999);

//       // Agar current month hai, toh sirf aaj tak
//       const today = new Date();
//       const currentYear = today.getFullYear();
//       const currentMonth = today.getMonth() + 1;

//       if (parseInt(year) === currentYear && parseInt(m) === currentMonth) {
//         end = new Date(today);
//         end.setHours(23, 59, 59, 999);
//         console.log("✅ Current month detected. Limiting to today:", end);
//       }

//       query.checkInTime = { $gte: start, $lte: end };
//       console.log("📅 STRICT Month filter applied:", processedMonth, "from", start, "to", end);

//     } else if (fromDate && toDate) {
//       query.checkInTime = {
//         $gte: new Date(fromDate),
//         $lte: new Date(toDate + "T23:59:59.999Z")
//       };
//       console.log("📅 Date range filter applied:", fromDate, toDate);

//       // If no month but date range, calculate month from fromDate
//       if (fromDate) {
//         const date = new Date(fromDate);
//         processedMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
//       }
//     } else {
//       // Default: current month
//       const today = new Date();
//       const start = new Date(today.getFullYear(), today.getMonth(), 1);
//       const end = new Date(today);
//       end.setHours(23, 59, 59, 999);

//       query.checkInTime = { $gte: start, $lte: end };
//       processedMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
//       console.log("📅 No filter, using current month:", processedMonth);
//     }

//     console.log("🔍 MongoDB Query:", JSON.stringify(query));
//     console.log("📆 Processing month:", processedMonth);

//     // 🟦 Fetch attendance + employees
//     const attendanceRecords = await Attendance.find(query).sort({ checkInTime: -1 });
//     const employees = await Employee.find({});

//     console.log("📊 Attendance records found:", attendanceRecords.length);
//     console.log("👥 Employees found:", employees.length);

//     // DEBUG: Check months in fetched records
//     if (attendanceRecords.length > 0) {
//       const monthsInRecords = [...new Set(attendanceRecords.map(rec => {
//         const d = new Date(rec.checkInTime);
//         return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
//       }))];
//       console.log("📆 Months found in attendance records:", monthsInRecords);
//     }

//     // Constants
//     const FULL_DAY_THRESHOLD = 8.80;
//     const HALF_DAY_THRESHOLD = 4;

//     const calculateDayType = (hrs) => {
//       const h = parseFloat(hrs) || 0;

//       if (h > FULL_DAY_THRESHOLD) {
//         return "full";
//       } else if (h >= HALF_DAY_THRESHOLD) {
//         return "half";
//       } else {
//         return "full_leave";
//       }
//     };

//     const summaryMap = {};
//     const processedDates = {};

//     // 🔴 MAIN FIX: Strict month filtering during processing
//     attendanceRecords.forEach((rec) => {
//       if (!rec.employeeId || !rec.checkInTime) return;

//       const employeeId = rec.employeeId;
//       const checkInDate = new Date(rec.checkInTime);
//       const dateKey = checkInDate.toISOString().split("T")[0];

//       // ✅ STRICT CHECK: Record का month processedMonth से match होना चाहिए
//       const recordMonth = `${checkInDate.getFullYear()}-${String(checkInDate.getMonth() + 1).padStart(2, "0")}`;

//       if (processedMonth && recordMonth !== processedMonth) {
//         // Skip records from different months
//         console.log(`⏩ SKIPPING: ${employeeId} - Record from ${recordMonth}, but processing ${processedMonth}`);
//         return;
//       }

//       // Future date check
//       const today = new Date();
//       if (checkInDate > today) {
//         console.log(`⏭️ Skipping future date: ${employeeId} - ${checkInDate}`);
//         return;
//       }

//       // Initialize summary
//       if (!summaryMap[employeeId]) {
//         const emp = employees.find((e) => e.employeeId === employeeId) || {};

//         summaryMap[employeeId] = {
//           employeeId,
//           name: emp.name || `Employee ${employeeId}`,
//           month: processedMonth,

//           presentDays: 0,
//           lateDays: 0,
//           onsiteDays: 0,

//           onsiteYesDays: 0,
//           onsiteNoDays: 0,

//           reasonCount: {
//             onsite: 0,
//             fieldWork: 0,
//             workFromHome: 0
//           },

//           halfDayWorking: 0,
//           fullDayNotWorking: 0,
//           totalWorkingDays: 0,

//           overTimeHours: 0,

//           workingDays: 0,
//           calculatedSalary: 0,
//           totalRecords: 0
//         };

//         processedDates[employeeId] = new Set();
//       }

//       // Skip duplicate date
//       if (processedDates[employeeId].has(dateKey)) {
//         console.log(`⏩ Skipping duplicate date for ${employeeId}: ${dateKey}`);
//         return;
//       }
//       processedDates[employeeId].add(dateKey);

//       // Hours calculation
//       let hours = 0;
//       if (rec.totalHours !== undefined) {
//         hours = parseFloat(rec.totalHours);
//       } else if (rec.checkOutTime) {
//         hours = (new Date(rec.checkOutTime) - new Date(rec.checkInTime)) / (1000 * 60 * 60);
//       }

//       const STANDARD_HOURS = 9;
//       const extraHours = Math.max(hours - STANDARD_HOURS, 0);

//       // OT accumulate
//       summaryMap[employeeId].overTimeHours += Number(extraHours.toFixed(2));

//       // Day type
//       const type = calculateDayType(hours);

//       console.log(`📊 ${employeeId} - ${dateKey}: ${hours.toFixed(2)}h = ${type}`);

//       if (type === "full") {
//         summaryMap[employeeId].presentDays += 1;
//         summaryMap[employeeId].totalWorkingDays += 1;
//       } else if (type === "half") {
//         summaryMap[employeeId].halfDayWorking += 1;
//         summaryMap[employeeId].totalWorkingDays += 0.5;
//       } else if (type === "full_leave") {
//         summaryMap[employeeId].fullDayNotWorking += 1;
//       }

//       // Late check-in
//       const hour = checkInDate.getHours();
//       const minute = checkInDate.getMinutes();
//       if (hour > 10 || (hour === 10 && minute > 0)) {
//         summaryMap[employeeId].lateDays += 1;
//       }

//       // Onsite days
//       if (rec.onsite === true) {
//         summaryMap[employeeId].onsiteDays += 1;
//         summaryMap[employeeId].onsiteYesDays += 1;
//       } else {
//         summaryMap[employeeId].onsiteNoDays += 1;
//       }

//       summaryMap[employeeId].totalRecords += 1;
//     });

//     const summaryArray = Object.values(summaryMap);

//     console.log("📋 Summary calculated for", processedMonth + ":", summaryArray.length, "employees");

//     // Current month adjustment
//     if (processedMonth) {
//       const now = new Date();
//       const [selectedYear, selectedMonth] = processedMonth.split('-').map(Number);
//       const currentYear = now.getFullYear();
//       const currentMonth = now.getMonth() + 1;
//       const currentDay = now.getDate();

//       if (selectedYear === currentYear && selectedMonth === currentMonth) {
//         console.log("✅ Adjusting for current month, max days:", currentDay);

//         summaryArray.forEach(emp => {
//           const correctedPresent = Math.min(emp.presentDays, currentDay);
//           const correctedLate = Math.min(emp.lateDays, currentDay);
//           const correctedOnsite = Math.min(emp.onsiteDays, currentDay);
//           const correctedHalf = Math.min(emp.halfDayWorking, currentDay);
//           const correctedFullLeave = Math.min(emp.fullDayNotWorking, currentDay);
//           const correctedTotal = correctedPresent + (correctedHalf * 0.5);

//           emp.presentDays = correctedPresent;
//           emp.lateDays = correctedLate;
//           emp.onsiteDays = correctedOnsite;
//           emp.halfDayWorking = correctedHalf;
//           emp.fullDayNotWorking = correctedFullLeave;
//           emp.totalWorkingDays = correctedTotal;
//         });
//       }
//     }

//     // ✅ PRESERVE MANUAL EDITS (Extra Work)
//     // Before deleting, fetch existing summaries to keep 'extraWork' and specific manual overrides
//     let existingSummariesMap = {};
//     if (processedMonth) {
//       const existingData = await AttendanceSummary.find({ month: processedMonth });
//       existingData.forEach(doc => {
//         existingSummariesMap[doc.employeeId] = doc;
//       });
//       console.log(`💾 Preserving edits for ${existingData.length} employees`);
//     }

//     // ✅ SAVE TO DATABASE (ONLY for this month)
//     if (summaryArray.length > 0 && processedMonth) {
//       // Delete ONLY summaries for this specific month
//       const deleteFilter = { month: processedMonth };

//       console.log("🗑️ Deleting existing summaries for:", processedMonth);

//       const deleteResult = await AttendanceSummary.deleteMany(deleteFilter);
//       console.log(`🗑️ Deleted ${deleteResult.deletedCount} existing summaries for ${processedMonth}`);

//       // Save new summaries with CORRECT month
//       const summariesToSave = summaryArray.map(summary => {
//         const existing = existingSummariesMap[summary.employeeId];

//         // Merge preserved data
//         let preservedExtraWork = existing?.extraWork || {};

//         return {
//           ...summary,
//           month: processedMonth,
//           extraWork: preservedExtraWork, // ✅ Restore extra work
//           // potentially restore calculatedSalary if we want to lock it, 
//           // but better to let it re-calculate based on new days + preserved extra
//           // calculatedSalary: existing?.calculatedSalary || summary.calculatedSalary, 
//           fromDate: fromDate || null,
//           toDate: toDate || null,
//           calculatedAt: new Date(),
//           createdAt: new Date()
//         };
//       });

//       const savedSummaries = await AttendanceSummary.insertMany(summariesToSave);
//       console.log(`💾 Saved ${savedSummaries.length} summaries for ${processedMonth}`);

//       // Verify what was saved
//       const verifyData = await AttendanceSummary.find({ month: processedMonth });
//       console.log(`✅ Verification: ${verifyData.length} records now in DB for ${processedMonth}`);
//     }

//     res.json({
//       success: true,
//       count: summaryArray.length,
//       summary: summaryArray,
//       month: processedMonth,
//       message: `Summary calculated and saved successfully for ${processedMonth}`
//     });

//   } catch (err) {
//     console.error('❌ Error calculating summary:', err);
//     res.status(500).json({
//       success: false,
//       message: err.message
//     });
//   }
// };

// /**
//  * 📌 Get Employee Details for Specific Employee
//  */
// exports.getEmployeeDetails = async (req, res) => {
//   try {
//     const { employeeId, fromDate, toDate, month } = req.query;

//     if (!employeeId) {
//       return res.status(400).json({
//         success: false,
//         message: 'Employee ID is required'
//       });
//     }

//     console.log('🔍 Fetching details for employee:', employeeId, { fromDate, toDate, month });

//     let query = { employeeId };

//     // Date range filter
//     if (fromDate && toDate) {
//       query.checkInTime = {
//         $gte: new Date(fromDate),
//         $lte: new Date(toDate + 'T23:59:59.999Z')
//       };
//     }

//     // Month filter
//     if (month) {
//       const [year, monthNum] = month.split('-');
//       const startDate = new Date(year, monthNum - 1, 1);
//       const endDate = new Date(year, monthNum, 0, 23, 59, 59, 999);

//       query.checkInTime = {
//         $gte: startDate,
//         $lte: endDate
//       };
//     }

//     const details = await Attendance.find(query)
//       .sort({ checkInTime: -1 })
//       .lean();

//     console.log('📋 Details found:', details.length);

//     // Get employee info
//     const employee = await Employee.findOne({ employeeId });

//     res.json({
//       success: true,
//       employee: employee || { employeeId, name: 'Unknown' },
//       details: details,
//       count: details.length
//     });

//   } catch (error) {
//     console.error('❌ Error fetching employee details:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching employee details',
//       error: error.message
//     });
//   }
// };

// /**
//  * 📌 Fix Wrong Summary Data (Without Deleting) - ✅ NEW FUNCTION ADDED
//  */
// exports.fixSummaryData = async (req, res) => {
//   try {
//     const { month } = req.body;

//     if (!month) {
//       return res.status(400).json({
//         success: false,
//         message: "Month is required (e.g., 2025-12)"
//       });
//     }

//     const today = new Date();
//     const currentYear = today.getFullYear();
//     const currentMonth = today.getMonth() + 1;
//     const currentDay = today.getDate();

//     const [year, monthNum] = month.split('-').map(Number);

//     console.log(`🔧 Fixing summary data for ${month}, current day: ${currentDay}`);

//     let updateCount = 0;

//     if (year === currentYear && monthNum === currentMonth) {
//       // Current month hai - limit to current day
//       const summaries = await AttendanceSummary.find({ month });

//       for (const summary of summaries) {
//         // Calculate new correct values
//         const correctedPresent = Math.min(summary.presentDays, currentDay);
//         const correctedLate = Math.min(summary.lateDays, currentDay);
//         const correctedOnsite = Math.min(summary.onsiteDays, currentDay);
//         const correctedHalf = Math.min(summary.halfDayWorking, currentDay);
//         const correctedFullLeave = Math.min(summary.fullDayNotWorking, currentDay);
//         const correctedTotal = correctedPresent + (correctedHalf * 0.5);

//         // Update if needed
//         if (summary.presentDays !== correctedPresent ||
//           summary.lateDays !== correctedLate ||
//           summary.totalWorkingDays !== correctedTotal) {

//           await AttendanceSummary.findByIdAndUpdate(
//             summary._id,
//             {
//               presentDays: correctedPresent,
//               lateDays: correctedLate,
//               onsiteDays: correctedOnsite,
//               halfDayWorking: correctedHalf,
//               fullDayNotWorking: correctedFullLeave,
//               totalWorkingDays: correctedTotal
//             }
//           );

//           updateCount++;
//           console.log(`✅ Fixed ${summary.employeeId}: present ${summary.presentDays} → ${correctedPresent} days`);
//         }
//       }
//     } else {
//       // Past month hai - kuch mat karo
//       console.log(`ℹ️ ${month} is past month, no fix needed`);
//     }

//     res.json({
//       success: true,
//       message: `Fixed ${updateCount} summary records for ${month}`,
//       fixedCount: updateCount
//     });

//   } catch (error) {
//     console.error('❌ Error fixing summary:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error fixing summary data',
//       error: error.message
//     });
//   }
// };


// /**
//  * 📌 Get Salaries - WITH EMPLOYEE-SPECIFIC WEEKOFF CALCULATION - UPDATED VERSION
//  */
// exports.getSalaries = async (req, res) => {
//   try {
//     let { month } = req.query;

//     if (!month || month.trim() === "") {
//       const today = new Date();
//       month = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
//     }

//     month = month.trim();
//     console.log(`💰 Processing salaries for month: "${month}"`);

//     const [year, monthNum] = month.split("-").map(Number);

//     if (isNaN(year) || isNaN(monthNum)) {
//       return res.status(400).json({ success: false, message: "Invalid month" });
//     }

//     const start = new Date(year, monthNum - 1, 1);
//     const end = new Date(year, monthNum, 0, 23, 59, 59, 999);
//     const daysInMonth = new Date(year, monthNum, 0).getDate();

//     const employees = await Employee.find({});
//     const attendanceSummaries = await AttendanceSummary.find({ month });

//     // Fetch all approved leaves that might overlap with the month
//     // More robust query for string dates
//     const allApprovedLeaves = await Leave.find({
//       status: "approved",
//       $or: [
//         { startDate: { $regex: `^${month}` } },
//         { endDate: { $regex: `^${month}` } }
//       ]
//     });

//     console.log(`🔍 DEBUG: Found ${attendanceSummaries.length} summaries for month ${month}`);
//     if (attendanceSummaries.length > 0) {
//       const sample = attendanceSummaries[0];
//       console.log(`🔍 DEBUG SAMPLE (${sample.employeeId}): calculatedSalary=${sample.calculatedSalary}, extraWork=${JSON.stringify(sample.extraWork)}`);
//     }

//     const attendanceMap = {};
//     attendanceSummaries.forEach(a => {
//       attendanceMap[a.employeeId] = a;
//     });

//     const sundaysInMonth = calculateWeekOffsForDay(year, monthNum, 0);

//     const salaryMap = {};

//     employees.forEach(emp => {
//       let weekOffDay = emp.weekOffDay || "Sunday";
//       const dayMap = {
//         Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3,
//         Thursday: 4, Friday: 5, Saturday: 6
//       };
//       const weekOffDayNum = dayMap[weekOffDay] ?? 0;

//       let weekOffs = 0;
//       let weekOffSource = "default";

//       // ✅ UPDATED LOGIC - WeekOffType ke hisaab se
//       if (emp.weekOffType === '0+2') {
//         // Fixed 2 days
//         weekOffs = 2;
//         weekOffSource = "0+2_fixed";
//       }
//       else if (emp.weekOffType === '0+4') {
//         // Fixed 4 days
//         weekOffs = 4;
//         weekOffSource = "0+4_fixed";
//       }
//       else if (emp.weekOffType === 'manual') {
//         // Manual value
//         weekOffs = emp.weekOffPerMonth || 4;
//         weekOffSource = "manual";
//       }
//       // Legacy support for old data
//       else if (emp.weekOffPerMonth === 4 && weekOffDay === "Sunday") {
//         // ✅ 4 Sunday → 5 only if 5 Sundays exist
//         weekOffs = sundaysInMonth === 5 ? 5 : 4;
//         weekOffSource = "0+4_sunday_auto";
//       }
//       else if (emp.weekOffPerMonth === 2) {
//         // ❌ NEVER increase
//         weekOffs = 2;
//         weekOffSource = "0+2_fixed_no_increment";
//       }
//       else if (typeof emp.weekOffPerMonth === "number") {
//         // Any other fixed value
//         weekOffs = emp.weekOffPerMonth;
//         weekOffSource = "fixed_from_db";
//       }
//       else {
//         // Fully dynamic (fallback)
//         weekOffs = calculateWeekOffsForDay(year, monthNum, weekOffDayNum);
//         weekOffSource = "dynamic";
//       }

//       const empAttendance = attendanceMap[emp.employeeId];
//       const presentDays = empAttendance?.presentDays || 0;
//       const halfDays = empAttendance?.halfDayWorking || 0;
//       const effectiveWorkingDays = presentDays + (halfDays * 0.5);

//       const salaryPerMonth = emp.salaryPerMonth || 0;
//       const dailyRate = salaryPerMonth / daysInMonth;

//       // === NEW: LEAVE CALCULATION ===
//       // 1. Filter leaves for this month and employee
//       const empLeaves = allApprovedLeaves.filter(l => l.employeeId === emp.employeeId);

//       let paidLeaveDays = 0;
//       empLeaves.forEach(leave => {
//         // Parse dates
//         const leaveStart = new Date(leave.startDate);
//         const leaveEnd = new Date(leave.endDate);

//         // Count days in current month
//         const overlapStart = new Date(Math.max(leaveStart, start));
//         const overlapEnd = new Date(Math.min(leaveEnd, end));

//         if (overlapStart <= overlapEnd) {
//           const diffTime = Math.abs(overlapEnd - overlapStart);
//           const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

//           // Only paid leaves
//           if (["CL", "EL", "COFF", "Casual Leave", "Earned Leave", "Comp Off"].includes(leave.leaveType)) {
//             paidLeaveDays += diffDays;
//           }
//         }
//       });

//       const paidDays = effectiveWorkingDays + weekOffs + paidLeaveDays;

//       // ✅ CHECK FOR STORED PAYROLL DATA
//       const storedExtraWork = empAttendance?.extraWork || {
//         extraDays: 0,
//         extraHours: 0,
//         bonus: 0,
//         deductions: 0,
//         reason: ""
//       };

//       // Base calculated salary from attendance (including leaves)
//       let calculatedSalary = Math.round(paidDays * dailyRate);

//       // Add Extras if they exist
//       if (storedExtraWork) {
//         const extraDaysAmount = (storedExtraWork.extraDays || 0) * dailyRate;
//         const bonus = storedExtraWork.bonus || 0;
//         const deductions = storedExtraWork.deductions || 0;

//         calculatedSalary = Math.round(calculatedSalary + extraDaysAmount + bonus - deductions);
//       }

//       // If manual overwrite exists and it's higher/different? 
//       // User request: "mere edit ko bhi backend se lao"
//       // If we have a stored calculatedSalary which implies manual edit, maybe prefer it?
//       // But usually we want Dynamic Base + Fixed Extras. 
//       // The logic above (Dynamic Base + Saved Extras) is best for ongoing month.
//       // If stored salary is preferred (frozen):
//       if (empAttendance?.calculatedSalary) {
//         // Optionally prefer the stored one if it was manually "Saved"
//         calculatedSalary = empAttendance.calculatedSalary;
//       }

//       salaryMap[emp.employeeId] = {
//         employeeId: emp.employeeId,
//         name: emp.name,
//         month,
//         presentDays,
//         extraWork: storedExtraWork, // ✅ Return extra work details
//         halfDayWorking: halfDays,
//         totalWorkingDays: effectiveWorkingDays,
//         weekOffs,
//         weekOffDay,
//         weekOffType: emp.weekOffType || (emp.weekOffPerMonth === 2 ? '0+2' : '0+4'),
//         weekOffSource,
//         salaryPerMonth,
//         salaryPerDay: Number(dailyRate.toFixed(2)),
//         paidDays,
//         calculatedSalary,
//         calculatedSalaryDisplay: `₹${calculatedSalary}`,
//         monthDays: daysInMonth
//       };
//     });

//     res.json({
//       success: true,
//       month,
//       salaries: Object.values(salaryMap),
//       count: Object.values(salaryMap).length,
//       monthDays: daysInMonth, // ✅ Return total days in month
//       note: "0+2: 2 days | 0+4: 4 days | Manual: user defined"
//     });

//   } catch (error) {
//     console.error("❌ Error in getSalaries:", error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// };


// /**
//  * 📌 Update Employee WeekOff Configuration - ENHANCED VERSION
//  */
// exports.updateWeekOffConfig = async (req, res) => {
//   try {
//     const { employeeId, weekOffDay, weekOffPerMonth, weekOffType } = req.body;

//     if (!employeeId || !weekOffDay) {
//       return res.status(400).json({
//         success: false,
//         message: "Employee ID and WeekOff Day are required"
//       });
//     }

//     // Day name to number mapping
//     const dayMap = {
//       'Sunday': 0,
//       'Monday': 1,
//       'Tuesday': 2,
//       'Wednesday': 3,
//       'Thursday': 4,
//       'Friday': 5,
//       'Saturday': 6
//     };

//     if (!dayMap.hasOwnProperty(weekOffDay)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid weekoff day. Use: Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday"
//       });
//     }

//     const updateData = {
//       weekOffDay
//     };

//     // ✅ NEW LOGIC: weekOffType ke hisaab se weekOffPerMonth set karo
//     if (weekOffType === '0+2') {
//       updateData.weekOffPerMonth = 2;
//       updateData.weekOffType = '0+2';
//     }
//     else if (weekOffType === '0+4') {
//       updateData.weekOffPerMonth = 4;
//       updateData.weekOffType = '0+4';
//     }
//     else if (weekOffType === 'manual') {
//       // Agar manual value di gayi hai to use karo
//       if (typeof weekOffPerMonth === "number" && weekOffPerMonth > 0) {
//         updateData.weekOffPerMonth = weekOffPerMonth;
//         updateData.weekOffType = 'manual';
//       } else {
//         // Manual select kiya lekin value nahi di, to 4 by default
//         updateData.weekOffPerMonth = 4;
//         updateData.weekOffType = '0+4';
//       }
//     }
//     else if (typeof weekOffPerMonth === "number" && weekOffPerMonth > 0) {
//       // Old format support
//       updateData.weekOffPerMonth = weekOffPerMonth;
//       updateData.weekOffType = weekOffPerMonth === 2 ? '0+2' : '0+4';
//     }
//     else {
//       // Kuch nahi select kiya, to default 4
//       updateData.weekOffPerMonth = 4;
//       updateData.weekOffType = '0+4';
//     }

//     // Update the hardcoded mapping
//     EMPLOYEE_WEEKOFF_MAP[employeeId] = {
//       weekOffDay: weekOffDay,
//       dayNum: dayMap[weekOffDay],
//       weekOffPerMonth: updateData.weekOffPerMonth,
//       weekOffType: updateData.weekOffType
//     };

//     const updatedEmp = await Employee.findOneAndUpdate(
//       { employeeId },
//       updateData,
//       { new: true }
//     );

//     if (!updatedEmp) {
//       return res.status(404).json({
//         success: false,
//         message: "Employee not found"
//       });
//     }



//     console.log(`✅ Updated weekoff for ${employeeId}: ${weekOffDay}, type: ${updateData.weekOffType}, days: ${updateData.weekOffPerMonth}`);

//     res.json({
//       success: true,
//       message: `WeekOff updated for ${employeeId}`,
//       config: EMPLOYEE_WEEKOFF_MAP[employeeId],
//       updatedEmp: updatedEmp
//     });

//   } catch (error) {
//     console.error('❌ Error updating weekoff config:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error updating weekoff configuration',
//       error: error.message
//     });
//   }
// };

// /**
//  * 📌 Get WeekOff Configuration
//  */
// exports.getWeekOffConfig = async (req, res) => {
//   try {
//     res.json({
//       success: true,
//       config: EMPLOYEE_WEEKOFF_MAP,
//       count: Object.keys(EMPLOYEE_WEEKOFF_MAP).length,
//       note: "Current employee weekoff configuration"
//     });
//   } catch (error) {
//     console.error('❌ Error getting weekoff config:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching weekoff configuration',
//       error: error.message
//     });
//   }
// };

// /**
//  * 📌 Check Month Data - Diagnostic Function
//  */
// exports.checkMonthData = async (req, res) => {
//   try {
//     const { month1, month2 } = req.query;

//     console.log(`🔍 Checking data for months: ${month1} and ${month2}`);

//     // Get summaries for both months
//     const summaries1 = await AttendanceSummary.find({ month: month1 });
//     const summaries2 = await AttendanceSummary.find({ month: month2 });

//     // Get leaves for both months
//     const [year1, monthNum1] = month1.split("-").map(Number);
//     const start1 = new Date(year1, monthNum1 - 1, 1);
//     const end1 = new Date(year1, monthNum1, 0, 23, 59, 59, 999);

//     const [year2, monthNum2] = month2.split("-").map(Number);
//     const start2 = new Date(year2, monthNum2 - 1, 1);
//     const end2 = new Date(year2, monthNum2, 0, 23, 59, 59, 999);

//     const leaves1 = await Leave.find({
//       status: 'approved',
//       $or: [
//         { startDate: { $gte: start1, $lte: end1 } },
//         { endDate: { $gte: start1, $lte: end1 } },
//         {
//           $and: [
//             { startDate: { $lte: start1 } },
//             { endDate: { $gte: end1 } }
//           ]
//         }
//       ]
//     });

//     const leaves2 = await Leave.find({
//       status: 'approved',
//       $or: [
//         { startDate: { $gte: start2, $lte: end2 } },
//         { endDate: { $gte: start2, $lte: end2 } },
//         {
//           $and: [
//             { startDate: { $lte: start2 } },
//             { endDate: { $gte: end2 } }
//           ]
//         }
//       ]
//     });

//     // Find employees with data in both months
//     const employees = await Employee.find({});
//     const crossMonthEmployees = [];

//     employees.forEach(emp => {
//       const inMonth1 = summaries1.find(s => s.employeeId === emp.employeeId);
//       const inMonth2 = summaries2.find(s => s.employeeId === emp.employeeId);
//       const leavesIn1 = leaves1.filter(l => l.employeeId === emp.employeeId);
//       const leavesIn2 = leaves2.filter(l => l.employeeId === emp.employeeId);

//       if (inMonth1 && inMonth2) {
//         crossMonthEmployees.push({
//           employeeId: emp.employeeId,
//           name: emp.name,
//           [month1]: {
//             presentDays: inMonth1.presentDays,
//             totalWorkingDays: inMonth1.totalWorkingDays,
//             leaves: leavesIn1.length
//           },
//           [month2]: {
//             presentDays: inMonth2.presentDays,
//             totalWorkingDays: inMonth2.totalWorkingDays,
//             leaves: leavesIn2.length
//           }
//         });
//       }
//     });

//     res.json({
//       success: true,
//       months: { month1, month2 },
//       summaries: {
//         [month1]: summaries1.length,
//         [month2]: summaries2.length
//       },
//       leaves: {
//         [month1]: leaves1.length,
//         [month2]: leaves2.length
//       },
//       crossMonthEmployees: crossMonthEmployees.length > 0 ? crossMonthEmployees : "No cross-month data found",
//       note: "This is diagnostic only - no data changed"
//     });

//   } catch (error) {
//     console.error('❌ Check error:', error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// };


// // ============================================================================
// // 🚀 DYNAMIC SHIFT LOGIC IMPLEMENTATION (Added by Assistant)
// // ============================================================================

// /**
//  * 🛠️ Helper: Get Default Shift Time
//  */
// const getDefaultShiftTime = (shiftType) => {
//   switch (shiftType) {
//     case "Morning": return { start: "06:00", end: "15:00" }; // 9 hours
//     case "Evening": return { start: "14:00", end: "23:00" }; // 9 hours
//     case "Night": return { start: "22:00", end: "07:00" }; // 9 hours
//     case "General": return { start: "10:00", end: "19:00" }; // 9 hours
//     default: return { start: "10:00", end: "19:00" };
//   }
// };

// /**
//  * 🛠️ Helper: Get Employee Shift
//  */
// const getEmployeeShift = (employeeId, shiftsData, masterShifts) => {
//   if (!shiftsData || !masterShifts) return null;

//   // Find assigned shift
//   let assignedShift = shiftsData.find(
//     (s) =>
//       s.employeeAssignment &&
//       (s.employeeAssignment.employeeId === employeeId || s.employeeAssignment.employeeId === String(employeeId))
//   );

//   let startTime = "10:00";
//   let endTime = "19:00";
//   let shiftName = "General";
//   let shiftType = "General";

//   if (assignedShift && assignedShift.employeeAssignment) {
//     shiftName = assignedShift.shiftName;
//     shiftType = assignedShift.shiftType;

//     const empAssign = assignedShift.employeeAssignment;

//     if (empAssign.startTime && empAssign.endTime) {
//       startTime = empAssign.startTime;
//       endTime = empAssign.endTime;
//     } else if (empAssign.selectedTimeRange) {
//       // Parse "10:00 - 19:00"
//       const parts = empAssign.selectedTimeRange.split("-").map(p => p.trim());
//       if (parts.length === 2) {
//         startTime = parts[0];
//         endTime = parts[1];
//       }
//     }
//   }

//   // Calculate Duration
//   let duration = 9;
//   if (startTime && endTime) {
//     const start = new Date(`2000-01-01T${startTime}`);
//     const end = new Date(`2000-01-01T${endTime}`);
//     if (end < start) end.setDate(end.getDate() + 1); // Cross midnight

//     const diff = (end - start) / (1000 * 60 * 60);
//     duration = Number(diff.toFixed(2));
//   }

//   return {
//     name: shiftName,
//     type: shiftType,
//     startTime: startTime,
//     endTime: endTime,
//     duration: duration
//   };
// };

// /**
//  * 🛠️ Helper: Calculate Day Type
//  */
// const calculateShiftDayType = (hours, shiftDuration) => {
//   const h = parseFloat(hours) || 0;

//   // 🟢 SHORT SHIFTS (3 - 6 Hours)
//   if (shiftDuration >= 3 && shiftDuration <= 6) {
//     if (h < 2.25) return "full_leave";
//     if (h >= 2.25 && h <= 3.49) return "half";  // Use <= 3.49 for strict compliance
//     return "full"; // 3.5+
//   }

//   // 🟣 STANDARD SHIFTS (8 - 12 Hours)
//   // Note: What about 7 hours? Assuming standard logic applies or falls through.
//   // User specified 8-12. Let's make the fallback standard.
//   else {
//     if (h < 4.5) return "full_leave";
//     if (h >= 4.5 && h <= 8.79) return "half"; // Use <= 8.79
//     return "full"; // 8.8+
//   }
// };

// /**
//  * 🛠️ Helper: Calculate Overtime (Based on Shift End Time)
//  */
// const calculateShiftOT = (checkOutTime, shiftEndTimeStr, checkInTime) => {
//   if (!checkOutTime || !shiftEndTimeStr) return 0;

//   const checkOut = new Date(checkOutTime);
//   const checkIn = new Date(checkInTime);

//   // Construct Shift End Date
//   // We assume Shift End is on the same day as CheckIn, UNLESS it crosses midnight or is earlier than checkin?
//   // Safer approach: Construct shift start/end based on CheckIn Date

//   // Parse Shift End Time
//   const [endH, endM] = shiftEndTimeStr.split(":").map(Number);

//   let shiftEnd = new Date(checkIn); // Start with CheckIn Date
//   shiftEnd.setHours(endH, endM, 0, 0);

//   // Handle crossing midnight
//   // If Shift End is "earlier" than CheckIn time (e.g. CheckIn 20:00, Shift End 05:00), add 1 day
//   // But wait, if shift is 14:00-23:00 and user checks in 13:50. shiftEnd is 23:00 same day.
//   // If shift is 22:00-07:00 and user checks in 21:50. shiftEnd is 07:00 NEXT day.

//   // Heuristic: If shiftEnd is significantly before checkIn (more than 12 hours?), it's probably next day.
//   // Actually, we should rely on the shift's generic duration or type.
//   // Let's use duration from getEmployeeShift if possible, but here we just have strings.

//   // Simple check: If checkOut is *after* strict shiftEnd, it's OT.
//   // But we need the correct shiftEnd Date.

//   // If CheckOut is before ShiftEnd (same day assumption), diff is negative -> 0 OT.
//   // If CheckOut is after ShiftEnd, diff is positive.

//   // Special case: Night shift.
//   // If checkIn is PM and shiftEnd is AM, shiftEnd is tomorrow.
//   if (checkIn.getHours() > 12 && endH < 12) {
//     shiftEnd.setDate(shiftEnd.getDate() + 1);
//   }

//   // Calculate difference in hours
//   const diffMs = checkOut - shiftEnd;
//   if (diffMs > 0) {
//     return Number((diffMs / (1000 * 60 * 60)).toFixed(2));
//   }

//   return 0;
// };


// /**
//  * 📌 Calculate Summary from Raw Data (DYNAMIC VERSION)
//  * Overwrites previous definition
//  */
// exports.calculateSummary = async (req, res) => {
//   try {
//     const { fromDate, toDate, month } = req.body;

//     console.log("📥 Dynamic CalculateSummary called with:", { month, fromDate, toDate });

//     let query = {};
//     let processedMonth = month;

//     // Filter Logic
//     if (fromDate && toDate) {
//       query.checkInTime = {
//         $gte: new Date(fromDate),
//         $lte: new Date(toDate + "T23:59:59.999Z")
//       };
//       if (!month) {
//         const d = new Date(fromDate);
//         processedMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
//       }
//     } else if (month) {
//       const [year, m] = month.split("-");
//       const start = new Date(year, m - 1, 1);
//       const end = new Date(year, m, 0, 23, 59, 59, 999);

//       const today = new Date();
//       if (parseInt(year) === today.getFullYear() && parseInt(m) === (today.getMonth() + 1)) {
//         end.setHours(23, 59, 59, 999);
//       }
//       query.checkInTime = { $gte: start, $lte: end };
//     } else {
//       const today = new Date();
//       const start = new Date(today.getFullYear(), today.getMonth(), 1);
//       const end = new Date(today);
//       end.setHours(23, 59, 59, 999);
//       query.checkInTime = { $gte: start, $lte: end };
//       processedMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
//     }

//     // Fetch Data
//     const attendanceRecords = await Attendance.find(query).sort({ checkInTime: -1 });
//     const employees = await Employee.find({});
//     const allShifts = await Shift.find({});
//     const masterShifts = allShifts.filter(s => s.isMasterShift);

//     const summaryMap = {};
//     const processedDates = {};

//     attendanceRecords.forEach((rec) => {
//       if (!rec.employeeId || !rec.checkInTime) return;
//       const employeeId = rec.employeeId;
//       const checkInDate = new Date(rec.checkInTime);
//       const dateKey = checkInDate.toISOString().split("T")[0];

//       const recordMonth = `${checkInDate.getFullYear()}-${String(checkInDate.getMonth() + 1).padStart(2, "0")}`;
//       if (processedMonth && recordMonth !== processedMonth) return;

//       if (checkInDate > new Date()) return;

//       if (!summaryMap[employeeId]) {
//         const emp = employees.find(e => e.employeeId === employeeId) || {};
//         const shiftInfo = getEmployeeShift(employeeId, allShifts, masterShifts);

//         summaryMap[employeeId] = {
//           employeeId,
//           name: emp.name || `Employee ${employeeId}`,
//           month: processedMonth,
//           presentDays: 0,
//           lateDays: 0,
//           onsiteDays: 0,
//           halfDayWorking: 0,
//           fullDayNotWorking: 0,
//           totalWorkingDays: 0,
//           overTimeHours: 0,
//           onsiteYesDays: 0,
//           onsiteNoDays: 0,
//           shiftName: shiftInfo.name,
//           shiftDuration: shiftInfo.duration,
//           shiftStartTime: shiftInfo.startTime, // Store for late check
//           shiftEndTime: shiftInfo.endTime,     // Store for OT check
//           salaryPerMonth: emp.salaryPerMonth || 0,
//           calculatedSalary: 0,
//           workingDays: 0,
//           reasonCount: { onsite: 0, fieldWork: 0, workFromHome: 0 }
//         };
//         processedDates[employeeId] = new Set();
//       }

//       if (processedDates[employeeId].has(dateKey)) return;
//       processedDates[employeeId].add(dateKey);

//       const empSum = summaryMap[employeeId];

//       // 1. Calculate Hours
//       let hours = 0;
//       if (rec.totalHours !== undefined) {
//         hours = parseFloat(rec.totalHours);
//       } else if (rec.checkOutTime) {
//         hours = (new Date(rec.checkOutTime) - new Date(rec.checkInTime)) / (1000 * 60 * 60);
//       }

//       // 2. Determine Day Type (Hours based)
//       const type = calculateShiftDayType(hours, empSum.shiftDuration);

//       let isWorkingDay = false;

//       if (type === "full") {
//         empSum.presentDays += 1;
//         isWorkingDay = true;
//         empSum.totalWorkingDays += 1;
//       } else if (type === "half") {
//         empSum.halfDayWorking += 1;
//         isWorkingDay = false; // Half day logic handled separately? 
//         // Wait, backend totalWorkingDays adds 0.5.
//         empSum.totalWorkingDays += 0.5;
//       } else {
//         empSum.fullDayNotWorking += 1;
//       }

//       // 3. Calculate OT (Based on Shift End Time if available)
//       if (empSum.shiftEndTime && rec.checkOutTime) {
//         const ot = calculateShiftOT(rec.checkOutTime, empSum.shiftEndTime, rec.checkInTime);
//         empSum.overTimeHours += ot;
//       } else if (type !== "full_leave") {
//         // Fallback: Duration based if no shift times (legacy logic)
//         const ot = Math.max(hours - empSum.shiftDuration, 0);
//         // Only add if explicitly calculated differently? 
//         // If we have strict shift times, we used the block above.
//         // If we don't, we assume 0 or legacy.
//         // Let's stick to strict shift end time OT as requested.
//       }

//       // 4. Late Check (Based on Shift Start Time)
//       if (empSum.shiftStartTime) {
//         const [startH, startM] = empSum.shiftStartTime.split(":").map(Number);
//         const checkInH = checkInDate.getHours();
//         const checkInM = checkInDate.getMinutes();

//         // Late if CheckIn > StartTime
//         if (checkInH > startH || (checkInH === startH && checkInM > startM)) {
//           empSum.lateDays += 1;
//         }
//       } else {
//         // Legacy Default 10:00 AM
//         const h = checkInDate.getHours();
//         const m = checkInDate.getMinutes();
//         if (h > 10 || (h === 10 && m > 0)) {
//           empSum.lateDays += 1;
//         }
//       }

//       // 5. Onsite
//       if (rec.onsite) {
//         empSum.onsiteDays += 1;
//         empSum.onsiteYesDays += 1;
//         empSum.reasonCount.onsite += 1;

//         // SPECIAL LOGIC: If Onsite and NOT already Full Day Present, add to working days?
//         // User's image shows Working Days 7.5 when Present is 0 but Onsite is 8.
//         // This implies Onsite counts as a working day even if hours are low (Full Leave).
//         // Let's implement: If (DayType == "full_leave" AND Onsite == true) -> Consider it working?

//         if (type === "full_leave") {
//           // It was counted as NotWorking above. 
//           // We should effectively convert it to "Present" for working days count calculation?
//           // Or explicitly add 1 to totalWorkingDays?
//           empSum.totalWorkingDays += 1;
//           // Do we valid salary for this? likely yes.
//         }
//         // If "half", it added 0.5. Should Onsite make it 1.0? 
//         // Assuming Onsite overrides hour shortage.
//         else if (type === "half") {
//           empSum.totalWorkingDays += 0.5; // Add remaining 0.5 to make it 1?
//         }

//       } else {
//         empSum.onsiteNoDays += 1;

//         // ✅ Track specific reasons for non-onsite records
//         if (rec.reason === "Work From Home") {
//           empSum.reasonCount.workFromHome += 1;
//         } else if (rec.reason === "Field Work") {
//           empSum.reasonCount.fieldWork += 1;
//         }
//       }
//     });

//     // Convert to Array
//     const summaryArray = Object.values(summaryMap);

//     // Save to DB
//     if (summaryArray.length > 0 && processedMonth) {
//       await AttendanceSummary.deleteMany({ month: processedMonth });

//       const summariesToSave = summaryArray.map(s => ({
//         ...s,
//         month: processedMonth,
//         calculatedAt: new Date(),
//         createdAt: new Date()
//       }));

//       await AttendanceSummary.insertMany(summariesToSave);
//       console.log(`✅ Saved ${summariesToSave.length} summaries for ${processedMonth}`);
//     }

//     res.json({
//       success: true,
//       summary: summaryArray,
//       month: processedMonth
//     });

//   } catch (err) {
//     console.error("❌ Error in calculating summary:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };


// /**
//  * 📌 Update Attendance Record (Dynamic Update)
//  * Overwrites previous definition
//  */
// exports.updateAttendance = async (req, res) => {
//   try {
//     const { attendanceId, hours, region, reason } = req.body;

//     if (!attendanceId) return res.status(400).json({ success: false, message: "ID required" });

//     const updateData = {};
//     if (hours !== undefined) updateData.totalHours = parseFloat(hours);
//     if (region !== undefined) updateData.region = region;
//     if (reason !== undefined) {
//       updateData.reason = reason;
//       updateData.comment = reason;
//     }

//     // Recalculate Day Type dynamically if hours changed
//     if (hours !== undefined) {
//       // Need to fetch employee shift for this?
//       // For simplicity, we fetch the record first
//       const record = await Attendance.findById(attendanceId);
//       if (record) {
//         const allShifts = await Shift.find({});
//         const masterShifts = allShifts.filter(s => s.isMasterShift);
//         const shiftInfo = getEmployeeShift(record.employeeId, allShifts, masterShifts);

//         updateData.dayType = calculateShiftDayType(parseFloat(hours), shiftInfo.duration);
//       }
//     }

//     const updatedRecord = await Attendance.findByIdAndUpdate(attendanceId, updateData, { new: true });

//     // Auto Recalculate Summary
//     if (updatedRecord) {
//       const d = new Date(updatedRecord.checkInTime);
//       const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

//       // Call the NEW calculateSummary logic if needed
//     }

//     res.json({
//       success: true,
//       message: "Updated successfully",
//       record: updatedRecord
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// /**
//  * 📌 Update Payroll Details (Bonus, Deductions, etc.) - ✅ NEW FUNCTION
//  */
// exports.updatePayrollDetails = async (req, res) => {
//   try {
//     const { employeeId, month, calculatedSalary, extraWork, presentDays, workingDays, halfDayWorking, fullDayNotWorking, weekOffDays, holidays } = req.body;

//     if (!employeeId || !month) {
//       return res.status(400).json({
//         success: false,
//         message: "Employee ID and Month are required"
//       });
//     }

//     console.log(`💰 Updating payroll for ${employeeId} (${month})`, extraWork);

//     // Find ALL existing summaries (to handle duplicates)
//     const summaries = await AttendanceSummary.find({ employeeId, month });
//     let summary;

//     if (summaries.length === 0) {
//       // If no summary exists (rare if attendance exists), create one
//       summary = new AttendanceSummary({
//         employeeId,
//         month,
//         presentDays: presentDays || 0,
//         totalWorkingDays: workingDays || 0, // Approximate
//         calculatedSalary: calculatedSalary || 0
//       });
//     } else if (summaries.length === 1) {
//       summary = summaries[0];
//     } else {
//       // ⚠️ DUPLICATES FOUND - Merge and Clean
//       console.warn(`⚠️ Found ${summaries.length} duplicate summaries for ${employeeId} - ${month}. Merging...`);

//       // Sort by last updated (createdAt as proxy)
//       summaries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

//       summary = summaries[0]; // Keep the newest one

//       // Delete others
//       const idsToDelete = summaries.slice(1).map(s => s._id);
//       await AttendanceSummary.deleteMany({ _id: { $in: idsToDelete } });
//       console.log(`🗑️ Deleted ${idsToDelete.length} duplicates.`);
//     }

//     // Update fields
//     if (calculatedSalary !== undefined) summary.calculatedSalary = calculatedSalary;
//     if (extraWork) {
//       console.log(`📝 Saving extraWork for ${employeeId}:`, JSON.stringify(extraWork));
//       summary.extraWork = extraWork;
//     }

//     // Also update day counts if provided (allowing manual override of days)
//     if (presentDays !== undefined) summary.presentDays = presentDays;
//     if (workingDays !== undefined) summary.workingDays = workingDays; // legacy field
//     if (workingDays !== undefined) summary.totalWorkingDays = workingDays;
//     if (halfDayWorking !== undefined) summary.halfDayWorking = halfDayWorking;
//     if (fullDayNotWorking !== undefined) summary.fullDayNotWorking = fullDayNotWorking;
//     if (weekOffDays !== undefined) summary.weekOffDays = weekOffDays;
//     if (holidays !== undefined) summary.holidays = holidays;

//     const savedSummary = await summary.save();
//     console.log(`✅ MongoDB Save Result for ${employeeId}:`, JSON.stringify(savedSummary.extraWork));

//     res.json({
//       success: true,
//       message: "Payroll details updated successfully",
//       summary: savedSummary
//     });

//   } catch (error) {
//     console.error("❌ Error updating payroll:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error updating payroll details",
//       error: error.message
//     });
//   }
// };


// const Attendance = require("../models/Attendance");
// const AttendanceSummary = require("../models/AttendanceSummary");
// const Employee = require("../models/Employee");
// const Leave = require("../models/Leave");
// // const Shift = require("../models/Shift"); // Shift model import karna mat bhoolna

// // ✅ YEHI ADD KARNA HAI - Calculate Day Type Function
// const calculateDayType = (hours) => {
//   const h = parseFloat(hours) || 0;

//   // Same logic as in calculateSummary
//   const FULL_DAY_THRESHOLD = 8.80;
//   const HALF_DAY_THRESHOLD = 4;

//   if (h > FULL_DAY_THRESHOLD) {
//     return "full";
//   } else if (h >= HALF_DAY_THRESHOLD) {
//     return "half";
//   } else {
//     return "full_leave";
//   }
// };

// // ✅ HELPER FUNCTION: Calculate dynamic weekoffs for specific day - CORRECTED VERSION
// const calculateWeekOffsForDay = (year, month, targetDay) => {
//   // targetDay: 0=Sunday, 1=Monday, ..., 6=Saturday
//   // month: 1-12 (January = 1, December = 12)

//   const monthIndex = month - 1; // JavaScript month: 0-11
//   const daysInMonth = new Date(year, month, 0).getDate();

//   console.log(`🔢 calculateWeekOffsForDay(${year}, ${month}, ${targetDay}) - Days in month: ${daysInMonth}`);

//   let count = 0;
//   for (let day = 1; day <= daysInMonth; day++) {
//     const currentDate = new Date(year, monthIndex, day);
//     if (currentDate.getDay() === targetDay) {
//       count++;
//     }
//   }

//   console.log(`📊 ${year}-${month.toString().padStart(2, '0')}: ${count} days with day=${targetDay}`);

//   return count;
// };

// // ✅ HELPER: Get day name from number
// const getDayName = (dayNum) => {
//   const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
//   return days[dayNum] || 'Sunday';
// };

// // ✅ EMPLOYEE WEEKOFF MAPPING - TUMHARE ACTUAL DATA KE ACCORDING
// const EMPLOYEE_WEEKOFF_MAP = {
//   // ✅ Sunday weekoff wale employees (5 Sundays in Nov 2025)
//   'EMP001': { weekOffDay: 'Sunday', dayNum: 0, weekOffType: '0+4', weekOffPerMonth: 4 },
//   'EMP002': { weekOffDay: 'Sunday', dayNum: 0, weekOffType: '0+4', weekOffPerMonth: 4 },
//   'EMP003': { weekOffDay: 'Sunday', dayNum: 0, weekOffType: '0+4', weekOffPerMonth: 4 },
//   'EMP004': { weekOffDay: 'Sunday', dayNum: 0, weekOffType: '0+4', weekOffPerMonth: 4 },
//   'EMP005': { weekOffDay: 'Sunday', dayNum: 0, weekOffType: '0+4', weekOffPerMonth: 4 },
//   'EMP008': { weekOffDay: 'Sunday', dayNum: 0, weekOffType: '0+4', weekOffPerMonth: 4 },

//   // ❌ Kisi aur din weekoff wale employees (Unka count wahi rahega)
//   'EMP006': { weekOffDay: 'Tuesday', dayNum: 2, weekOffType: '0+2', weekOffPerMonth: 2 }, // Example: 2 Tuesdays in Nov 2025
//   'EMP007': { weekOffDay: 'Friday', dayNum: 5, weekOffType: '0+4', weekOffPerMonth: 4 },  // Example: 4 Fridays in Nov 2025

//   // Add all your employees here with their ACTUAL weekoff days
//   // Default Sunday if not specified
// };

// /**
//  * 📌 Get All Attendance Records with Filters
//  */
// exports.getAllAttendance = async (req, res) => {
//   try {
//     const { fromDate, toDate, month, employeeId } = req.query;

//     let query = {};

//     // Date range filter
//     if (fromDate && toDate) {
//       query.checkInTime = {
//         $gte: new Date(fromDate),
//         $lte: new Date(toDate + 'T23:59:59.999Z')
//       };
//     }

//     // Month filter
//     if (month) {
//       const [year, monthNum] = month.split('-');
//       const startDate = new Date(year, monthNum - 1, 1);
//       const endDate = new Date(year, monthNum, 0, 23, 59, 59, 999);

//       query.checkInTime = {
//         $gte: startDate,
//         $lte: endDate
//       };
//     }

//     // Employee filter
//     if (employeeId) {
//       query.employeeId = employeeId;
//     }

//     const records = await Attendance.find(query)
//       .sort({ checkInTime: -1 })
//       .lean();

//     res.json({
//       success: true,
//       records: records,
//       count: records.length
//     });

//   } catch (error) {
//     console.error('❌ Error fetching attendance:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching attendance records',
//       error: error.message
//     });
//   }
// };

// /**
//  * 📌 Update Attendance Record (Hours, Region, Comment) - FIXED VERSION
//  */
// exports.updateAttendance = async (req, res) => {
//   try {
//     const { attendanceId, hours, region, reason, employeeId, date, checkInTime, checkOutTime, comment } = req.body;

//     console.log('📝 Update request received:', { attendanceId, hours, region, reason, employeeId, date, checkInTime, checkOutTime });

//     let updatedRecord;
//     let targetDate;

//     // ✅ CASE 1: Update Existing Record
//     if (attendanceId) {
//       const updateData = {};
//       if (hours !== undefined) updateData.totalHours = parseFloat(hours);
//       if (region !== undefined) updateData.region = region;
//       if (reason !== undefined) updateData.reason = reason;
//       if (comment !== undefined) updateData.comment = comment;

//       // Handle time updates
//       if (checkInTime) updateData.checkInTime = new Date(checkInTime);
//       if (checkOutTime) updateData.checkOutTime = new Date(checkOutTime);

//       // Recalculate total hours if times are provided
//       if (checkInTime && checkOutTime) {
//         const start = new Date(checkInTime);
//         const end = new Date(checkOutTime);
//         const diffMs = end - start;
//         const diffHours = diffMs / (1000 * 60 * 60);
//         updateData.totalHours = parseFloat(diffHours.toFixed(2));
//         updateData.status = "checked-out";
//       }

//       // Recalculate day type based on new hours
//       if (updateData.totalHours !== undefined) {
//         const calculatedDayType = calculateDayType(updateData.totalHours);
//         updateData.dayType = calculatedDayType;
//       }

//       updatedRecord = await Attendance.findByIdAndUpdate(
//         attendanceId,
//         updateData,
//         { new: true, runValidators: true }
//       );

//       if (!updatedRecord) {
//         return res.status(404).json({
//           success: false,
//           message: 'Attendance record not found'
//         });
//       }

//       targetDate = updatedRecord.checkInTime;
//     }
//     // ✅ CASE 2: Create New Record (Missing Day)
//     else if (employeeId && date && checkInTime) {
//       if (!checkInTime) {
//         return res.status(400).json({ success: false, message: "Check-in time is required for new record" });
//       }

//       const newCheckIn = new Date(checkInTime);
//       const newCheckOut = checkOutTime ? new Date(checkOutTime) : null;
//       let totalHours = 0;

//       if (newCheckOut) {
//         const diffMs = newCheckOut - newCheckIn;
//         totalHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
//       } else if (hours) {
//         totalHours = parseFloat(hours);
//       }

//       updatedRecord = await Attendance.create({
//         employeeId,
//         checkInTime: newCheckIn,
//         checkOutTime: newCheckOut,
//         totalHours: totalHours,
//         reason: reason || "Onsite",
//         comment: comment || "Admin created",
//         status: newCheckOut ? "checked-out" : "checked-in",
//         onsite: reason === "Onsite", // Default assumption
//         dayType: calculateDayType(totalHours)
//       });

//       targetDate = newCheckIn;
//     } else { // <-- YAHAN PEHLE '}' THA JISKE KAARAN ERROR AA RAHA THA
//       console.log("❌ Missing required fields for update/create:");
//       console.log("attendanceId:", attendanceId);
//       console.log("employeeId:", employeeId);
//       console.log("date:", date);
//       console.log("checkInTime:", checkInTime);
      
//       return res.status(400).json({
//         success: false,
//         message: 'Attendance ID OR (Employee ID + Date + Check-In) is required'
//       });
//     }

//     console.log('✅ Attendance record saved:', updatedRecord);

//     // 🔥 AUTO RECALCULATE SUMMARY FOR THAT MONTH
//     const d = new Date(targetDate);
//     const monthForSummary = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

//     console.log("🔁 Auto recalculating summary for:", monthForSummary);

//     // Delete old summary of that month
//     await AttendanceSummary.deleteMany({ month: monthForSummary });

//     // Recalculate summary
//     await exports.calculateSummary(
//       { body: { month: monthForSummary } },
//       { json: () => { } } // dummy response
//     );

//     res.json({
//       success: true,
//       message: 'Attendance record updated successfully',
//       record: updatedRecord
//     });

//   } catch (error) {
//     console.error('❌ Error updating attendance:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error updating attendance record',
//       error: error.message
//     });
//   }
// };

// /**
//  * 📌 Save Attendance Summary
//  */
// exports.saveSummary = async (req, res) => {
//   try {
//     const { summaries, fromDate, toDate, month } = req.body;

//     if (!summaries || !Array.isArray(summaries)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid summary data"
//       });
//     }

//     console.log('💾 Saving summary for:', {
//       month,
//       fromDate,
//       toDate,
//       employeeCount: summaries.length
//     });

//     // Remove existing summaries for the same period
//     let deleteQuery = {};
//     if (month) {
//       deleteQuery.month = month;
//     } else if (fromDate && toDate) {
//       deleteQuery.fromDate = fromDate;
//       deleteQuery.toDate = toDate;
//     }

//     if (Object.keys(deleteQuery).length > 0) {
//       await AttendanceSummary.deleteMany(deleteQuery);
//       console.log('🗑️ Cleared existing summaries for period');
//     }

//     // Prepare data for insertion with updated field names
//     const insertData = summaries.map((summary) => ({
//       employeeId: summary.employeeId,
//       name: summary.name,
//       month: summary.month,
//       presentDays: summary.presentDays || 0,
//       lateDays: summary.lateDays || 0,
//       onsiteDays: summary.onsiteDays || 0,
//       halfDayWorking: summary.halfDayWorking || summary.halfDayLeaves || 0,
//       fullDayNotWorking: summary.fullDayNotWorking || summary.fullDayLeaves || 0,
//       totalWorkingDays: summary.totalWorkingDays || 0,
//       fromDate: fromDate || null,
//       toDate: toDate || null,
//       calculatedSalary: summary.calculatedSalary || 0,
//       workingDays: summary.workingDays || 0,
//       overTimeHours: summary.overTimeHours || 0,
//       onsiteYesDays: summary.onsiteYesDays || 0,
//       onsiteNoDays: summary.onsiteNoDays || 0,
//       reasonCount: summary.reasonCount || {
//         onsite: 0,
//         fieldWork: 0,
//         workFromHome: 0
//       },
//       extraWork: summary.extraWork || {
//         extraDays: 0,
//         extraHours: 0,
//         bonus: 0,
//         deductions: 0,
//         reason: ""
//       },
//       createdAt: new Date()
//     }));

//     const result = await AttendanceSummary.insertMany(insertData);

//     console.log('✅ Summary saved successfully:', result.length, 'records');

//     res.json({
//       success: true,
//       message: "Summary saved successfully",
//       count: result.length,
//       data: result
//     });

//   } catch (err) {
//     console.error('❌ Error saving summary:', err);
//     res.status(500).json({
//       success: false,
//       message: err.message
//     });
//   }
// };

// /**
//  * 📌 Get Saved Summary - ✅ FIXED: Auto-correct wrong data
//  */
// exports.getSummary = async (req, res) => {
//   try {
//     const { month, fromDate, toDate, employeeId } = req.query;

//     console.log("📥 GetSummary API Called with:", { month, fromDate, toDate, employeeId });

//     let filter = {};

//     // Date range filter
//     if (fromDate && toDate) {
//       filter.createdAt = {
//         $gte: new Date(fromDate),
//         $lte: new Date(toDate + "T23:59:59.999Z")
//       };
//     }

//     // Month filter
//     if (month) {
//       filter.month = month;
//     }

//     // Employee filter
//     if (employeeId) {
//       filter.employeeId = employeeId;
//     }

//     console.log("🔍 Database Filter:", filter);

//     let data = await AttendanceSummary.find(filter).sort({ createdAt: -1 });

//     console.log("✅ Found records:", data.length);

//     // ✅ FIXED: Auto-correct wrong data for current month (DISABLED TO RESPECT MANUAL EDITS)
//     const today = new Date();
//     // const currentYear = today.getFullYear();
//     // const currentMonth = today.getMonth() + 1;
//     // const currentDay = today.getDate();

//     const correctedData = data.map(summary => {
//       /* 
//       // ❌ DISABLE AUTO-CORRECT: Use DB values as truth (User edits are priority)
//       if (summary.month) {
//         const [year, monthNum] = summary.month.split('-').map(Number);

//         // Only correct if current month
//         if (year === currentYear && monthNum === currentMonth) {
//           const summaryObj = summary.toObject(); // Convert to plain object

//           // Get corrected values
//           const correctedPresent = Math.min(summary.presentDays, currentDay);
//           const correctedLate = Math.min(summary.lateDays, currentDay);
//           const correctedOnsite = Math.min(summary.onsiteDays, currentDay);
//           const correctedHalf = Math.min(summary.halfDayWorking, currentDay);
//           const correctedFullLeave = Math.min(summary.fullDayNotWorking, currentDay);
//           const correctedTotal = correctedPresent + (correctedHalf * 0.5);

//           return {
//             ...summaryObj,
//             presentDays: correctedPresent,
//             lateDays: correctedLate,
//             onsiteDays: correctedOnsite,
//             halfDayWorking: correctedHalf,
//             fullDayNotWorking: correctedFullLeave,
//             totalWorkingDays: correctedTotal
//           };
//         }
//       }
//       */
//       return summary;
//     });

//     res.json({
//       success: true,
//       count: data.length, // data.length is correct
//       summary: data,      // Return raw DB data
//       note: "Data from DB (Manual edits respected)"
//     });
//   } catch (err) {
//     console.error('❌ Error fetching summary:', err);
//     res.status(500).json({
//       success: false,
//       message: err.message
//     });
//   }
// };

// /**
//  * 📌 Calculate Summary from Raw Data - COMPLETELY FIXED VERSION (November-December Separate)
//  */
// exports.calculateSummaryLegacy = async (req, res) => {
//   try {
//     const { fromDate, toDate, month } = req.body;

//     let query = {};

//     console.log("📥 CalculateSummaryLegacy called with:", { month, fromDate, toDate });

//     // 🔍 Use a separate variable for processed month
//     let processedMonth = month;

//     // 🔍 STRICT MONTH FILTERING
//     if (processedMonth) {
//       const [year, m] = processedMonth.split("-");
//       const start = new Date(year, m - 1, 1);

//       // Month ka exact last day
//       let end = new Date(year, m, 0, 23, 59, 59, 999);

//       // Agar current month hai, toh sirf aaj tak
//       const today = new Date();
//       const currentYear = today.getFullYear();
//       const currentMonth = today.getMonth() + 1;

//       if (parseInt(year) === currentYear && parseInt(m) === currentMonth) {
//         end = new Date(today);
//         end.setHours(23, 59, 59, 999);
//         console.log("✅ Current month detected. Limiting to today:", end);
//       }

//       query.checkInTime = { $gte: start, $lte: end };
//       console.log("📅 STRICT Month filter applied:", processedMonth, "from", start, "to", end);

//     } else if (fromDate && toDate) {
//       query.checkInTime = {
//         $gte: new Date(fromDate),
//         $lte: new Date(toDate + "T23:59:59.999Z")
//       };
//       console.log("📅 Date range filter applied:", fromDate, toDate);

//       // If no month but date range, calculate month from fromDate
//       if (fromDate) {
//         const date = new Date(fromDate);
//         processedMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
//       }
//     } else {
//       // Default: current month
//       const today = new Date();
//       const start = new Date(today.getFullYear(), today.getMonth(), 1);
//       const end = new Date(today);
//       end.setHours(23, 59, 59, 999);

//       query.checkInTime = { $gte: start, $lte: end };
//       processedMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
//       console.log("📅 No filter, using current month:", processedMonth);
//     }

//     console.log("🔍 MongoDB Query:", JSON.stringify(query));
//     console.log("📆 Processing month:", processedMonth);

//     // 🟦 Fetch attendance + employees
//     const attendanceRecords = await Attendance.find(query).sort({ checkInTime: -1 });
//     const employees = await Employee.find({});

//     console.log("📊 Attendance records found:", attendanceRecords.length);
//     console.log("👥 Employees found:", employees.length);

//     // DEBUG: Check months in fetched records
//     if (attendanceRecords.length > 0) {
//       const monthsInRecords = [...new Set(attendanceRecords.map(rec => {
//         const d = new Date(rec.checkInTime);
//         return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
//       }))];
//       console.log("📆 Months found in attendance records:", monthsInRecords);
//     }

//     // Constants
//     const FULL_DAY_THRESHOLD = 8.80;
//     const HALF_DAY_THRESHOLD = 4;

//     const calculateDayType = (hrs) => {
//       const h = parseFloat(hrs) || 0;

//       if (h > FULL_DAY_THRESHOLD) {
//         return "full";
//       } else if (h >= HALF_DAY_THRESHOLD) {
//         return "half";
//       } else {
//         return "full_leave";
//       }
//     };

//     const summaryMap = {};
//     const processedDates = {};

//     // 🔴 MAIN FIX: Strict month filtering during processing
//     attendanceRecords.forEach((rec) => {
//       if (!rec.employeeId || !rec.checkInTime) return;

//       const employeeId = rec.employeeId;
//       const checkInDate = new Date(rec.checkInTime);
//       const dateKey = checkInDate.toISOString().split("T")[0];

//       // ✅ STRICT CHECK: Record का month processedMonth से match होना चाहिए
//       const recordMonth = `${checkInDate.getFullYear()}-${String(checkInDate.getMonth() + 1).padStart(2, "0")}`;

//       if (processedMonth && recordMonth !== processedMonth) {
//         // Skip records from different months
//         console.log(`⏩ SKIPPING: ${employeeId} - Record from ${recordMonth}, but processing ${processedMonth}`);
//         return;
//       }

//       // Future date check
//       const today = new Date();
//       if (checkInDate > today) {
//         console.log(`⏭️ Skipping future date: ${employeeId} - ${checkInDate}`);
//         return;
//       }

//       // Initialize summary
//       if (!summaryMap[employeeId]) {
//         const emp = employees.find((e) => e.employeeId === employeeId) || {};

//         summaryMap[employeeId] = {
//           employeeId,
//           name: emp.name || `Employee ${employeeId}`,
//           month: processedMonth,

//           presentDays: 0,
//           lateDays: 0,
//           onsiteDays: 0,

//           onsiteYesDays: 0,
//           onsiteNoDays: 0,

//           reasonCount: {
//             onsite: 0,
//             fieldWork: 0,
//             workFromHome: 0
//           },

//           halfDayWorking: 0,
//           fullDayNotWorking: 0,
//           totalWorkingDays: 0,

//           overTimeHours: 0,

//           workingDays: 0,
//           calculatedSalary: 0,
//           totalRecords: 0
//         };

//         processedDates[employeeId] = new Set();
//       }

//       // Skip duplicate date
//       if (processedDates[employeeId].has(dateKey)) {
//         console.log(`⏩ Skipping duplicate date for ${employeeId}: ${dateKey}`);
//         return;
//       }
//       processedDates[employeeId].add(dateKey);

//       // Hours calculation
//       let hours = 0;
//       if (rec.totalHours !== undefined) {
//         hours = parseFloat(rec.totalHours);
//       } else if (rec.checkOutTime) {
//         hours = (new Date(rec.checkOutTime) - new Date(rec.checkInTime)) / (1000 * 60 * 60);
//       }

//       const STANDARD_HOURS = 9;
//       const extraHours = Math.max(hours - STANDARD_HOURS, 0);

//       // OT accumulate
//       summaryMap[employeeId].overTimeHours += Number(extraHours.toFixed(2));

//       // Day type
//       const type = calculateDayType(hours);

//       console.log(`📊 ${employeeId} - ${dateKey}: ${hours.toFixed(2)}h = ${type}`);

//       if (type === "full") {
//         summaryMap[employeeId].presentDays += 1;
//         summaryMap[employeeId].totalWorkingDays += 1;
//       } else if (type === "half") {
//         summaryMap[employeeId].halfDayWorking += 1;
//         summaryMap[employeeId].totalWorkingDays += 0.5;
//       } else if (type === "full_leave") {
//         summaryMap[employeeId].fullDayNotWorking += 1;
//       }

//       // Late check-in
//       const hour = checkInDate.getHours();
//       const minute = checkInDate.getMinutes();
//       if (hour > 10 || (hour === 10 && minute > 0)) {
//         summaryMap[employeeId].lateDays += 1;
//       }

//       // Onsite days
//       if (rec.onsite === true) {
//         summaryMap[employeeId].onsiteDays += 1;
//         summaryMap[employeeId].onsiteYesDays += 1;
//       } else {
//         summaryMap[employeeId].onsiteNoDays += 1;
//       }

//       summaryMap[employeeId].totalRecords += 1;
//     });

//     const summaryArray = Object.values(summaryMap);

//     console.log("📋 Summary calculated for", processedMonth + ":", summaryArray.length, "employees");

//     // Current month adjustment
//     if (processedMonth) {
//       const now = new Date();
//       const [selectedYear, selectedMonth] = processedMonth.split('-').map(Number);
//       const currentYear = now.getFullYear();
//       const currentMonth = now.getMonth() + 1;
//       const currentDay = now.getDate();

//       if (selectedYear === currentYear && selectedMonth === currentMonth) {
//         console.log("✅ Adjusting for current month, max days:", currentDay);

//         summaryArray.forEach(emp => {
//           const correctedPresent = Math.min(emp.presentDays, currentDay);
//           const correctedLate = Math.min(emp.lateDays, currentDay);
//           const correctedOnsite = Math.min(emp.onsiteDays, currentDay);
//           const correctedHalf = Math.min(emp.halfDayWorking, currentDay);
//           const correctedFullLeave = Math.min(emp.fullDayNotWorking, currentDay);
//           const correctedTotal = correctedPresent + (correctedHalf * 0.5);

//           emp.presentDays = correctedPresent;
//           emp.lateDays = correctedLate;
//           emp.onsiteDays = correctedOnsite;
//           emp.halfDayWorking = correctedHalf;
//           emp.fullDayNotWorking = correctedFullLeave;
//           emp.totalWorkingDays = correctedTotal;
//         });
//       }
//     }

//     // ✅ PRESERVE MANUAL EDITS (Extra Work)
//     // Before deleting, fetch existing summaries to keep 'extraWork' and specific manual overrides
//     let existingSummariesMap = {};
//     if (processedMonth) {
//       const existingData = await AttendanceSummary.find({ month: processedMonth });
//       existingData.forEach(doc => {
//         existingSummariesMap[doc.employeeId] = doc;
//       });
//       console.log(`💾 Preserving edits for ${existingData.length} employees`);
//     }

//     // ✅ SAVE TO DATABASE (ONLY for this month)
//     if (summaryArray.length > 0 && processedMonth) {
//       // Delete ONLY summaries for this specific month
//       const deleteFilter = { month: processedMonth };

//       console.log("🗑️ Deleting existing summaries for:", processedMonth);

//       const deleteResult = await AttendanceSummary.deleteMany(deleteFilter);
//       console.log(`🗑️ Deleted ${deleteResult.deletedCount} existing summaries for ${processedMonth}`);

//       // Save new summaries with CORRECT month
//       const summariesToSave = summaryArray.map(summary => {
//         const existing = existingSummariesMap[summary.employeeId];

//         // Merge preserved data
//         let preservedExtraWork = existing?.extraWork || {};

//         return {
//           ...summary,
//           month: processedMonth,
//           extraWork: preservedExtraWork, // ✅ Restore extra work
//           // potentially restore calculatedSalary if we want to lock it, 
//           // but better to let it re-calculate based on new days + preserved extra
//           // calculatedSalary: existing?.calculatedSalary || summary.calculatedSalary, 
//           fromDate: fromDate || null,
//           toDate: toDate || null,
//           calculatedAt: new Date(),
//           createdAt: new Date()
//         };
//       });

//       const savedSummaries = await AttendanceSummary.insertMany(summariesToSave);
//       console.log(`💾 Saved ${savedSummaries.length} summaries for ${processedMonth}`);

//       // Verify what was saved
//       const verifyData = await AttendanceSummary.find({ month: processedMonth });
//       console.log(`✅ Verification: ${verifyData.length} records now in DB for ${processedMonth}`);
//     }

//     res.json({
//       success: true,
//       count: summaryArray.length,
//       summary: summaryArray,
//       month: processedMonth,
//       message: `Summary calculated and saved successfully for ${processedMonth}`
//     });

//   } catch (err) {
//     console.error('❌ Error calculating summary:', err);
//     res.status(500).json({
//       success: false,
//       message: err.message
//     });
//   }
// };

// /**
//  * 📌 Get Employee Details for Specific Employee
//  */
// exports.getEmployeeDetails = async (req, res) => {
//   try {
//     const { employeeId, fromDate, toDate, month } = req.query;

//     if (!employeeId) {
//       return res.status(400).json({
//         success: false,
//         message: 'Employee ID is required'
//       });
//     }

//     console.log('🔍 Fetching details for employee:', employeeId, { fromDate, toDate, month });

//     let query = { employeeId };

//     // Date range filter
//     if (fromDate && toDate) {
//       query.checkInTime = {
//         $gte: new Date(fromDate),
//         $lte: new Date(toDate + 'T23:59:59.999Z')
//       };
//     }

//     // Month filter
//     if (month) {
//       const [year, monthNum] = month.split('-');
//       const startDate = new Date(year, monthNum - 1, 1);
//       const endDate = new Date(year, monthNum, 0, 23, 59, 59, 999);

//       query.checkInTime = {
//         $gte: startDate,
//         $lte: endDate
//       };
//     }

//     const details = await Attendance.find(query)
//       .sort({ checkInTime: -1 })
//       .lean();

//     console.log('📋 Details found:', details.length);

//     // Get employee info
//     const employee = await Employee.findOne({ employeeId });

//     res.json({
//       success: true,
//       employee: employee || { employeeId, name: 'Unknown' },
//       details: details,
//       count: details.length
//     });

//   } catch (error) {
//     console.error('❌ Error fetching employee details:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching employee details',
//       error: error.message
//     });
//   }
// };

// /**
//  * 📌 Fix Wrong Summary Data (Without Deleting) - ✅ NEW FUNCTION ADDED
//  */
// exports.fixSummaryData = async (req, res) => {
//   try {
//     const { month } = req.body;

//     if (!month) {
//       return res.status(400).json({
//         success: false,
//         message: "Month is required (e.g., 2025-12)"
//       });
//     }

//     const today = new Date();
//     const currentYear = today.getFullYear();
//     const currentMonth = today.getMonth() + 1;
//     const currentDay = today.getDate();

//     const [year, monthNum] = month.split('-').map(Number);

//     console.log(`🔧 Fixing summary data for ${month}, current day: ${currentDay}`);

//     let updateCount = 0;

//     if (year === currentYear && monthNum === currentMonth) {
//       // Current month hai - limit to current day
//       const summaries = await AttendanceSummary.find({ month });

//       for (const summary of summaries) {
//         // Calculate new correct values
//         const correctedPresent = Math.min(summary.presentDays, currentDay);
//         const correctedLate = Math.min(summary.lateDays, currentDay);
//         const correctedOnsite = Math.min(summary.onsiteDays, currentDay);
//         const correctedHalf = Math.min(summary.halfDayWorking, currentDay);
//         const correctedFullLeave = Math.min(summary.fullDayNotWorking, currentDay);
//         const correctedTotal = correctedPresent + (correctedHalf * 0.5);

//         // Update if needed
//         if (summary.presentDays !== correctedPresent ||
//           summary.lateDays !== correctedLate ||
//           summary.totalWorkingDays !== correctedTotal) {

//           await AttendanceSummary.findByIdAndUpdate(
//             summary._id,
//             {
//               presentDays: correctedPresent,
//               lateDays: correctedLate,
//               onsiteDays: correctedOnsite,
//               halfDayWorking: correctedHalf,
//               fullDayNotWorking: correctedFullLeave,
//               totalWorkingDays: correctedTotal
//             }
//           );

//           updateCount++;
//           console.log(`✅ Fixed ${summary.employeeId}: present ${summary.presentDays} → ${correctedPresent} days`);
//         }
//       }
//     } else {
//       // Past month hai - kuch mat karo
//       console.log(`ℹ️ ${month} is past month, no fix needed`);
//     }

//     res.json({
//       success: true,
//       message: `Fixed ${updateCount} summary records for ${month}`,
//       fixedCount: updateCount
//     });

//   } catch (error) {
//     console.error('❌ Error fixing summary:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error fixing summary data',
//       error: error.message
//     });
//   }
// };


// /**
//  * 📌 Get Salaries - WITH EMPLOYEE-SPECIFIC WEEKOFF CALCULATION - UPDATED VERSION
//  */
// exports.getSalaries = async (req, res) => {
//   try {
//     let { month } = req.query;

//     if (!month || month.trim() === "") {
//       const today = new Date();
//       month = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
//     }

//     month = month.trim();
//     console.log(`💰 Processing salaries for month: "${month}"`);

//     const [year, monthNum] = month.split("-").map(Number);

//     if (isNaN(year) || isNaN(monthNum)) {
//       return res.status(400).json({ success: false, message: "Invalid month" });
//     }

//     const start = new Date(year, monthNum - 1, 1);
//     const end = new Date(year, monthNum, 0, 23, 59, 59, 999);
//     const daysInMonth = new Date(year, monthNum, 0).getDate();

//     const employees = await Employee.find({});
//     const attendanceSummaries = await AttendanceSummary.find({ month });

//     // Fetch all approved leaves that might overlap with the month
//     // More robust query for string dates
//     const allApprovedLeaves = await Leave.find({
//       status: "approved",
//       $or: [
//         { startDate: { $regex: `^${month}` } },
//         { endDate: { $regex: `^${month}` } }
//       ]
//     });

//     console.log(`🔍 DEBUG: Found ${attendanceSummaries.length} summaries for month ${month}`);
//     if (attendanceSummaries.length > 0) {
//       const sample = attendanceSummaries[0];
//       console.log(`🔍 DEBUG SAMPLE (${sample.employeeId}): calculatedSalary=${sample.calculatedSalary}, extraWork=${JSON.stringify(sample.extraWork)}`);
//     }

//     const attendanceMap = {};
//     attendanceSummaries.forEach(a => {
//       attendanceMap[a.employeeId] = a;
//     });

//     const sundaysInMonth = calculateWeekOffsForDay(year, monthNum, 0);

//     const salaryMap = {};

//     employees.forEach(emp => {
//       let weekOffDay = emp.weekOffDay || "Sunday";
//       const dayMap = {
//         Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3,
//         Thursday: 4, Friday: 5, Saturday: 6
//       };
//       const weekOffDayNum = dayMap[weekOffDay] ?? 0;

//       let weekOffs = 0;
//       let weekOffSource = "default";

//       // ✅ UPDATED LOGIC - WeekOffType ke hisaab se
//       if (emp.weekOffType === '0+2') {
//         // Fixed 2 days
//         weekOffs = 2;
//         weekOffSource = "0+2_fixed";
//       }
//       else if (emp.weekOffType === '0+4') {
//         // Fixed 4 days
//         weekOffs = 4;
//         weekOffSource = "0+4_fixed";
//       }
//       else if (emp.weekOffType === 'manual') {
//         // Manual value
//         weekOffs = emp.weekOffPerMonth || 4;
//         weekOffSource = "manual";
//       }
//       // Legacy support for old data
//       else if (emp.weekOffPerMonth === 4 && weekOffDay === "Sunday") {
//         // ✅ 4 Sunday → 5 only if 5 Sundays exist
//         weekOffs = sundaysInMonth === 5 ? 5 : 4;
//         weekOffSource = "0+4_sunday_auto";
//       }
//       else if (emp.weekOffPerMonth === 2) {
//         // ❌ NEVER increase
//         weekOffs = 2;
//         weekOffSource = "0+2_fixed_no_increment";
//       }
//       else if (typeof emp.weekOffPerMonth === "number") {
//         // Any other fixed value
//         weekOffs = emp.weekOffPerMonth;
//         weekOffSource = "fixed_from_db";
//       }
//       else {
//         // Fully dynamic (fallback)
//         weekOffs = calculateWeekOffsForDay(year, monthNum, weekOffDayNum);
//         weekOffSource = "dynamic";
//       }

//       const empAttendance = attendanceMap[emp.employeeId];
//       const presentDays = empAttendance?.presentDays || 0;
//       const halfDays = empAttendance?.halfDayWorking || 0;
//       const effectiveWorkingDays = presentDays + (halfDays * 0.5);

//       const salaryPerMonth = emp.salaryPerMonth || 0;
//       const dailyRate = salaryPerMonth / daysInMonth;

//       // === NEW: LEAVE CALCULATION ===
//       // 1. Filter leaves for this month and employee
//       const empLeaves = allApprovedLeaves.filter(l => l.employeeId === emp.employeeId);

//       let paidLeaveDays = 0;
//       empLeaves.forEach(leave => {
//         // Parse dates
//         const leaveStart = new Date(leave.startDate);
//         const leaveEnd = new Date(leave.endDate);

//         // Count days in current month
//         const overlapStart = new Date(Math.max(leaveStart, start));
//         const overlapEnd = new Date(Math.min(leaveEnd, end));

//         if (overlapStart <= overlapEnd) {
//           const diffTime = Math.abs(overlapEnd - overlapStart);
//           const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

//           // Only paid leaves
//           if (["CL", "EL", "COFF", "Casual Leave", "Earned Leave", "Comp Off"].includes(leave.leaveType)) {
//             paidLeaveDays += diffDays;
//           }
//         }
//       });

//       const paidDays = effectiveWorkingDays + weekOffs + paidLeaveDays;

//       // ✅ CHECK FOR STORED PAYROLL DATA
//       const storedExtraWork = empAttendance?.extraWork || {
//         extraDays: 0,
//         extraHours: 0,
//         bonus: 0,
//         deductions: 0,
//         reason: ""
//       };

//       // Base calculated salary from attendance (including leaves)
//       let calculatedSalary = Math.round(paidDays * dailyRate);

//       // Add Extras if they exist
//       if (storedExtraWork) {
//         const extraDaysAmount = (storedExtraWork.extraDays || 0) * dailyRate;
//         const bonus = storedExtraWork.bonus || 0;
//         const deductions = storedExtraWork.deductions || 0;

//         calculatedSalary = Math.round(calculatedSalary + extraDaysAmount + bonus - deductions);
//       }

//       // If manual overwrite exists and it's higher/different? 
//       // User request: "mere edit ko bhi backend se lao"
//       // If we have a stored calculatedSalary which implies manual edit, maybe prefer it?
//       // But usually we want Dynamic Base + Fixed Extras. 
//       // The logic above (Dynamic Base + Saved Extras) is best for ongoing month.
//       // If stored salary is preferred (frozen):
//       if (empAttendance?.calculatedSalary) {
//         // Optionally prefer the stored one if it was manually "Saved"
//         calculatedSalary = empAttendance.calculatedSalary;
//       }

//       salaryMap[emp.employeeId] = {
//         employeeId: emp.employeeId,
//         name: emp.name,
//         month,
//         presentDays,
//         extraWork: storedExtraWork, // ✅ Return extra work details
//         halfDayWorking: halfDays,
//         totalWorkingDays: effectiveWorkingDays,
//         weekOffs,
//         weekOffDay,
//         weekOffType: emp.weekOffType || (emp.weekOffPerMonth === 2 ? '0+2' : '0+4'),
//         weekOffSource,
//         salaryPerMonth,
//         salaryPerDay: Number(dailyRate.toFixed(2)),
//         paidDays,
//         calculatedSalary,
//         calculatedSalaryDisplay: `₹${calculatedSalary}`,
//         monthDays: daysInMonth
//       };
//     });

//     res.json({
//       success: true,
//       month,
//       salaries: Object.values(salaryMap),
//       count: Object.values(salaryMap).length,
//       monthDays: daysInMonth, // ✅ Return total days in month
//       note: "0+2: 2 days | 0+4: 4 days | Manual: user defined"
//     });

//   } catch (error) {
//     console.error("❌ Error in getSalaries:", error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// };


// /**
//  * 📌 Update Employee WeekOff Configuration - ENHANCED VERSION
//  */
// exports.updateWeekOffConfig = async (req, res) => {
//   try {
//     const { employeeId, weekOffDay, weekOffPerMonth, weekOffType } = req.body;

//     if (!employeeId || !weekOffDay) {
//       return res.status(400).json({
//         success: false,
//         message: "Employee ID and WeekOff Day are required"
//       });
//     }

//     // Day name to number mapping
//     const dayMap = {
//       'Sunday': 0,
//       'Monday': 1,
//       'Tuesday': 2,
//       'Wednesday': 3,
//       'Thursday': 4,
//       'Friday': 5,
//       'Saturday': 6
//     };

//     if (!dayMap.hasOwnProperty(weekOffDay)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid weekoff day. Use: Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday"
//       });
//     }

//     const updateData = {
//       weekOffDay
//     };

//     // ✅ NEW LOGIC: weekOffType ke hisaab se weekOffPerMonth set karo
//     if (weekOffType === '0+2') {
//       updateData.weekOffPerMonth = 2;
//       updateData.weekOffType = '0+2';
//     }
//     else if (weekOffType === '0+4') {
//       updateData.weekOffPerMonth = 4;
//       updateData.weekOffType = '0+4';
//     }
//     else if (weekOffType === 'manual') {
//       // Agar manual value di gayi hai to use karo
//       if (typeof weekOffPerMonth === "number" && weekOffPerMonth > 0) {
//         updateData.weekOffPerMonth = weekOffPerMonth;
//         updateData.weekOffType = 'manual';
//       } else {
//         // Manual select kiya lekin value nahi di, to 4 by default
//         updateData.weekOffPerMonth = 4;
//         updateData.weekOffType = '0+4';
//       }
//     }
//     else if (typeof weekOffPerMonth === "number" && weekOffPerMonth > 0) {
//       // Old format support
//       updateData.weekOffPerMonth = weekOffPerMonth;
//       updateData.weekOffType = weekOffPerMonth === 2 ? '0+2' : '0+4';
//     }
//     else {
//       // Kuch nahi select kiya, to default 4
//       updateData.weekOffPerMonth = 4;
//       updateData.weekOffType = '0+4';
//     }

//     // Update the hardcoded mapping
//     EMPLOYEE_WEEKOFF_MAP[employeeId] = {
//       weekOffDay: weekOffDay,
//       dayNum: dayMap[weekOffDay],
//       weekOffPerMonth: updateData.weekOffPerMonth,
//       weekOffType: updateData.weekOffType
//     };

//     const updatedEmp = await Employee.findOneAndUpdate(
//       { employeeId },
//       updateData,
//       { new: true }
//     );

//     if (!updatedEmp) {
//       return res.status(404).json({
//         success: false,
//         message: "Employee not found"
//       });
//     }



//     console.log(`✅ Updated weekoff for ${employeeId}: ${weekOffDay}, type: ${updateData.weekOffType}, days: ${updateData.weekOffPerMonth}`);

//     res.json({
//       success: true,
//       message: `WeekOff updated for ${employeeId}`,
//       config: EMPLOYEE_WEEKOFF_MAP[employeeId],
//       updatedEmp: updatedEmp
//     });

//   } catch (error) {
//     console.error('❌ Error updating weekoff config:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error updating weekoff configuration',
//       error: error.message
//     });
//   }
// };

// /**
//  * 📌 Get WeekOff Configuration
//  */
// exports.getWeekOffConfig = async (req, res) => {
//   try {
//     res.json({
//       success: true,
//       config: EMPLOYEE_WEEKOFF_MAP,
//       count: Object.keys(EMPLOYEE_WEEKOFF_MAP).length,
//       note: "Current employee weekoff configuration"
//     });
//   } catch (error) {
//     console.error('❌ Error getting weekoff config:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching weekoff configuration',
//       error: error.message
//     });
//   }
// };

// /**
//  * 📌 Check Month Data - Diagnostic Function
//  */
// exports.checkMonthData = async (req, res) => {
//   try {
//     const { month1, month2 } = req.query;

//     console.log(`🔍 Checking data for months: ${month1} and ${month2}`);

//     // Get summaries for both months
//     const summaries1 = await AttendanceSummary.find({ month: month1 });
//     const summaries2 = await AttendanceSummary.find({ month: month2 });

//     // Get leaves for both months
//     const [year1, monthNum1] = month1.split("-").map(Number);
//     const start1 = new Date(year1, monthNum1 - 1, 1);
//     const end1 = new Date(year1, monthNum1, 0, 23, 59, 59, 999);

//     const [year2, monthNum2] = month2.split("-").map(Number);
//     const start2 = new Date(year2, monthNum2 - 1, 1);
//     const end2 = new Date(year2, monthNum2, 0, 23, 59, 59, 999);

//     const leaves1 = await Leave.find({
//       status: 'approved',
//       $or: [
//         { startDate: { $gte: start1, $lte: end1 } },
//         { endDate: { $gte: start1, $lte: end1 } },
//         {
//           $and: [
//             { startDate: { $lte: start1 } },
//             { endDate: { $gte: end1 } }
//           ]
//         }
//       ]
//     });

//     const leaves2 = await Leave.find({
//       status: 'approved',
//       $or: [
//         { startDate: { $gte: start2, $lte: end2 } },
//         { endDate: { $gte: start2, $lte: end2 } },
//         {
//           $and: [
//             { startDate: { $lte: start2 } },
//             { endDate: { $gte: end2 } }
//           ]
//         }
//       ]
//     });

//     // Find employees with data in both months
//     const employees = await Employee.find({});
//     const crossMonthEmployees = [];

//     employees.forEach(emp => {
//       const inMonth1 = summaries1.find(s => s.employeeId === emp.employeeId);
//       const inMonth2 = summaries2.find(s => s.employeeId === emp.employeeId);
//       const leavesIn1 = leaves1.filter(l => l.employeeId === emp.employeeId);
//       const leavesIn2 = leaves2.filter(l => l.employeeId === emp.employeeId);

//       if (inMonth1 && inMonth2) {
//         crossMonthEmployees.push({
//           employeeId: emp.employeeId,
//           name: emp.name,
//           [month1]: {
//             presentDays: inMonth1.presentDays,
//             totalWorkingDays: inMonth1.totalWorkingDays,
//             leaves: leavesIn1.length
//           },
//           [month2]: {
//             presentDays: inMonth2.presentDays,
//             totalWorkingDays: inMonth2.totalWorkingDays,
//             leaves: leavesIn2.length
//           }
//         });
//       }
//     });

//     res.json({
//       success: true,
//       months: { month1, month2 },
//       summaries: {
//         [month1]: summaries1.length,
//         [month2]: summaries2.length
//       },
//       leaves: {
//         [month1]: leaves1.length,
//         [month2]: leaves2.length
//       },
//       crossMonthEmployees: crossMonthEmployees.length > 0 ? crossMonthEmployees : "No cross-month data found",
//       note: "This is diagnostic only - no data changed"
//     });

//   } catch (error) {
//     console.error('❌ Check error:', error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// };


// // ============================================================================
// // 🚀 DYNAMIC SHIFT LOGIC IMPLEMENTATION (Added by Assistant)
// // ============================================================================

// /**
//  * 🛠️ Helper: Get Default Shift Time
//  */
// const getDefaultShiftTime = (shiftType) => {
//   switch (shiftType) {
//     case "Morning": return { start: "06:00", end: "15:00" }; // 9 hours
//     case "Evening": return { start: "14:00", end: "23:00" }; // 9 hours
//     case "Night": return { start: "22:00", end: "07:00" }; // 9 hours
//     case "General": return { start: "10:00", end: "19:00" }; // 9 hours
//     default: return { start: "10:00", end: "19:00" };
//   }
// };

// /**
//  * 🛠️ Helper: Get Employee Shift
//  */
// const getEmployeeShift = (employeeId, shiftsData, masterShifts) => {
//   if (!shiftsData || !masterShifts) return null;

//   // Find assigned shift
//   let assignedShift = shiftsData.find(
//     (s) =>
//       s.employeeAssignment &&
//       (s.employeeAssignment.employeeId === employeeId || s.employeeAssignment.employeeId === String(employeeId))
//   );

//   let startTime = "10:00";
//   let endTime = "19:00";
//   let shiftName = "General";
//   let shiftType = "General";

//   if (assignedShift && assignedShift.employeeAssignment) {
//     shiftName = assignedShift.shiftName;
//     shiftType = assignedShift.shiftType;

//     const empAssign = assignedShift.employeeAssignment;

//     if (empAssign.startTime && empAssign.endTime) {
//       startTime = empAssign.startTime;
//       endTime = empAssign.endTime;
//     } else if (empAssign.selectedTimeRange) {
//       // Parse "10:00 - 19:00"
//       const parts = empAssign.selectedTimeRange.split("-").map(p => p.trim());
//       if (parts.length === 2) {
//         startTime = parts[0];
//         endTime = parts[1];
//       }
//     }
//   }

//   // Calculate Duration
//   let duration = 9;
//   if (startTime && endTime) {
//     const start = new Date(`2000-01-01T${startTime}`);
//     const end = new Date(`2000-01-01T${endTime}`);
//     if (end < start) end.setDate(end.getDate() + 1); // Cross midnight

//     const diff = (end - start) / (1000 * 60 * 60);
//     duration = Number(diff.toFixed(2));
//   }

//   return {
//     name: shiftName,
//     type: shiftType,
//     startTime: startTime,
//     endTime: endTime,
//     duration: duration
//   };
// };

// /**
//  * 🛠️ Helper: Calculate Day Type
//  */
// const calculateShiftDayType = (hours, shiftDuration) => {
//   const h = parseFloat(hours) || 0;

//   // 🟢 SHORT SHIFTS (3 - 6 Hours)
//   if (shiftDuration >= 3 && shiftDuration <= 6) {
//     if (h < 2.25) return "full_leave";
//     if (h >= 2.25 && h <= 3.49) return "half";  // Use <= 3.49 for strict compliance
//     return "full"; // 3.5+
//   }

//   // 🟣 STANDARD SHIFTS (8 - 12 Hours)
//   // Note: What about 7 hours? Assuming standard logic applies or falls through.
//   // User specified 8-12. Let's make the fallback standard.
//   else {
//     if (h < 4.5) return "full_leave";
//     if (h >= 4.5 && h <= 8.79) return "half"; // Use <= 8.79
//     return "full"; // 8.8+
//   }
// };

// /**
//  * 🛠️ Helper: Calculate Overtime (Based on Shift End Time)
//  */
// const calculateShiftOT = (checkOutTime, shiftEndTimeStr, checkInTime) => {
//   if (!checkOutTime || !shiftEndTimeStr) return 0;

//   const checkOut = new Date(checkOutTime);
//   const checkIn = new Date(checkInTime);

//   // Construct Shift End Date
//   // We assume Shift End is on the same day as CheckIn, UNLESS it crosses midnight or is earlier than checkin?
//   // Safer approach: Construct shift start/end based on CheckIn Date

//   // Parse Shift End Time
//   const [endH, endM] = shiftEndTimeStr.split(":").map(Number);

//   let shiftEnd = new Date(checkIn); // Start with CheckIn Date
//   shiftEnd.setHours(endH, endM, 0, 0);

//   // Handle crossing midnight
//   // If shiftEnd is significantly before checkIn (more than 12 hours?), it's probably next day.
//   // Actually, we should rely on the shift's generic duration or type.
//   // Let's use duration from getEmployeeShift if possible, but here we just have strings.

//   // Simple check: If checkOut is *after* strict shiftEnd, it's OT.
//   // But we need the correct shiftEnd Date.

//   // If CheckOut is before ShiftEnd (same day assumption), diff is negative -> 0 OT.
//   // If CheckOut is after ShiftEnd, diff is positive.

//   // Special case: Night shift.
//   // If checkIn is PM and shiftEnd is AM, shiftEnd is tomorrow.
//   if (checkIn.getHours() > 12 && endH < 12) {
//     shiftEnd.setDate(shiftEnd.getDate() + 1);
//   }

//   // Calculate difference in hours
//   const diffMs = checkOut - shiftEnd;
//   if (diffMs > 0) {
//     return Number((diffMs / (1000 * 60 * 60)).toFixed(2));
//   }

//   return 0;
// };


// /**
//  * 📌 Calculate Summary from Raw Data (DYNAMIC VERSION)
//  * Overwrites previous definition
//  */
// exports.calculateSummary = async (req, res) => {
//   try {
//     const { fromDate, toDate, month } = req.body;

//     console.log("📥 Dynamic CalculateSummary called with:", { month, fromDate, toDate });

//     let query = {};
//     let processedMonth = month;

//     // Filter Logic
//     if (fromDate && toDate) {
//       query.checkInTime = {
//         $gte: new Date(fromDate),
//         $lte: new Date(toDate + "T23:59:59.999Z")
//       };
//       if (!month) {
//         const d = new Date(fromDate);
//         processedMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
//       }
//     } else if (month) {
//       const [year, m] = month.split("-");
//       const start = new Date(year, m - 1, 1);
//       const end = new Date(year, m, 0, 23, 59, 59, 999);

//       const today = new Date();
//       if (parseInt(year) === today.getFullYear() && parseInt(m) === (today.getMonth() + 1)) {
//         end.setHours(23, 59, 59, 999);
//       }
//       query.checkInTime = { $gte: start, $lte: end };
//     } else {
//       const today = new Date();
//       const start = new Date(today.getFullYear(), today.getMonth(), 1);
//       const end = new Date(today);
//       end.setHours(23, 59, 59, 999);
//       query.checkInTime = { $gte: start, $lte: end };
//       processedMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
//     }

//     // Fetch Data
//     const attendanceRecords = await Attendance.find(query).sort({ checkInTime: -1 });
//     const employees = await Employee.find({});
//     const allShifts = await Shift.find({});
//     const masterShifts = allShifts.filter(s => s.isMasterShift);

//     const summaryMap = {};
//     const processedDates = {};

//     attendanceRecords.forEach((rec) => {
//       if (!rec.employeeId || !rec.checkInTime) return;
//       const employeeId = rec.employeeId;
//       const checkInDate = new Date(rec.checkInTime);
//       const dateKey = checkInDate.toISOString().split("T")[0];

//       const recordMonth = `${checkInDate.getFullYear()}-${String(checkInDate.getMonth() + 1).padStart(2, "0")}`;
//       if (processedMonth && recordMonth !== processedMonth) return;

//       if (checkInDate > new Date()) return;

//       if (!summaryMap[employeeId]) {
//         const emp = employees.find(e => e.employeeId === employeeId) || {};
//         const shiftInfo = getEmployeeShift(employeeId, allShifts, masterShifts);

//         summaryMap[employeeId] = {
//           employeeId,
//           name: emp.name || `Employee ${employeeId}`,
//           month: processedMonth,
//           presentDays: 0,
//           lateDays: 0,
//           onsiteDays: 0,
//           halfDayWorking: 0,
//           fullDayNotWorking: 0,
//           totalWorkingDays: 0,
//           overTimeHours: 0,
//           onsiteYesDays: 0,
//           onsiteNoDays: 0,
//           shiftName: shiftInfo.name,
//           shiftDuration: shiftInfo.duration,
//           shiftStartTime: shiftInfo.startTime, // Store for late check
//           shiftEndTime: shiftInfo.endTime,     // Store for OT check
//           salaryPerMonth: emp.salaryPerMonth || 0,
//           calculatedSalary: 0,
//           workingDays: 0,
//           reasonCount: { onsite: 0, fieldWork: 0, workFromHome: 0 }
//         };
//         processedDates[employeeId] = new Set();
//       }

//       if (processedDates[employeeId].has(dateKey)) return;
//       processedDates[employeeId].add(dateKey);

//       const empSum = summaryMap[employeeId];

//       // 1. Calculate Hours
//       let hours = 0;
//       if (rec.totalHours !== undefined) {
//         hours = parseFloat(rec.totalHours);
//       } else if (rec.checkOutTime) {
//         hours = (new Date(rec.checkOutTime) - new Date(rec.checkInTime)) / (1000 * 60 * 60);
//       }

//       // 2. Determine Day Type (Hours based)
//       const type = calculateShiftDayType(hours, empSum.shiftDuration);

//       let isWorkingDay = false;

//       if (type === "full") {
//         empSum.presentDays += 1;
//         isWorkingDay = true;
//         empSum.totalWorkingDays += 1;
//       } else if (type === "half") {
//         empSum.halfDayWorking += 1;
//         isWorkingDay = false; // Half day logic handled separately? 
//         // Wait, backend totalWorkingDays adds 0.5.
//         empSum.totalWorkingDays += 0.5;
//       } else {
//         empSum.fullDayNotWorking += 1;
//       }

//       // 3. Calculate OT (Based on Shift End Time if available)
//       if (empSum.shiftEndTime && rec.checkOutTime) {
//         const ot = calculateShiftOT(rec.checkOutTime, empSum.shiftEndTime, rec.checkInTime);
//         empSum.overTimeHours += ot;
//       } else if (type !== "full_leave") {
//         // Fallback: Duration based if no shift times (legacy logic)
//         const ot = Math.max(hours - empSum.shiftDuration, 0);
//         // Only add if explicitly calculated differently? 
//         // If we have strict shift times, we used the block above.
//         // If we don't, we assume 0 or legacy.
//         // Let's stick to strict shift end time OT as requested.
//       }

//       // 4. Late Check (Based on Shift Start Time)
//       if (empSum.shiftStartTime) {
//         const [startH, startM] = empSum.shiftStartTime.split(":").map(Number);
//         const checkInH = checkInDate.getHours();
//         const checkInM = checkInDate.getMinutes();

//         // Late if CheckIn > StartTime
//         if (checkInH > startH || (checkInH === startH && checkInM > startM)) {
//           empSum.lateDays += 1;
//         }
//       } else {
//         // Legacy Default 10:00 AM
//         const h = checkInDate.getHours();
//         const m = checkInDate.getMinutes();
//         if (h > 10 || (h === 10 && m > 0)) {
//           empSum.lateDays += 1;
//         }
//       }

//       // 5. Onsite
//       if (rec.onsite) {
//         empSum.onsiteDays += 1;
//         empSum.onsiteYesDays += 1;
//         empSum.reasonCount.onsite += 1;

//         // SPECIAL LOGIC: If Onsite and NOT already Full Day Present, add to working days?
//         // User's image shows Working Days 7.5 when Present is 0 but Onsite is 8.
//         // This implies Onsite counts as a working day even if hours are low (Full Leave).
//         // Let's implement: If (DayType == "full_leave" AND Onsite == true) -> Consider it working?

//         if (type === "full_leave") {
//           // It was counted as NotWorking above. 
//           // We should effectively convert it to "Present" for working days count calculation?
//           // Or explicitly add 1 to totalWorkingDays?
//           empSum.totalWorkingDays += 1;
//           // Do we valid salary for this? likely yes.
//         }
//         // If "half", it added 0.5. Should Onsite make it 1.0? 
//         // Assuming Onsite overrides hour shortage.
//         else if (type === "half") {
//           empSum.totalWorkingDays += 0.5; // Add remaining 0.5 to make it 1?
//         }

//       } else {
//         empSum.onsiteNoDays += 1;

//         // ✅ Track specific reasons for non-onsite records
//         if (rec.reason === "Work From Home") {
//           empSum.reasonCount.workFromHome += 1;
//         } else if (rec.reason === "Field Work") {
//           empSum.reasonCount.fieldWork += 1;
//         }
//       }
//     });

//     // Convert to Array
//     const summaryArray = Object.values(summaryMap);

//     // Save to DB
//     if (summaryArray.length > 0 && processedMonth) {
//       await AttendanceSummary.deleteMany({ month: processedMonth });

//       const summariesToSave = summaryArray.map(s => ({
//         ...s,
//         month: processedMonth,
//         calculatedAt: new Date(),
//         createdAt: new Date()
//       }));

//       await AttendanceSummary.insertMany(summariesToSave);
//       console.log(`✅ Saved ${summariesToSave.length} summaries for ${processedMonth}`);
//     }

//     res.json({
//       success: true,
//       summary: summaryArray,
//       month: processedMonth
//     });

//   } catch (err) {
//     console.error("❌ Error in calculating summary:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };


// /**
//  * 📌 Update Attendance Record (Dynamic Update)
//  * Overwrites previous definition
//  */
// exports.updateAttendanceDynamic = async (req, res) => {
//   try {
//     const { attendanceId, hours, region, reason } = req.body;

//     if (!attendanceId) return res.status(400).json({ success: false, message: "ID required" });

//     const updateData = {};
//     if (hours !== undefined) updateData.totalHours = parseFloat(hours);
//     if (region !== undefined) updateData.region = region;
//     if (reason !== undefined) {
//       updateData.reason = reason;
//       updateData.comment = reason;
//     }

//     // Recalculate Day Type dynamically if hours changed
//     if (hours !== undefined) {
//       // Need to fetch employee shift for this?
//       // For simplicity, we fetch the record first
//       const record = await Attendance.findById(attendanceId);
//       if (record) {
//         const allShifts = await Shift.find({});
//         const masterShifts = allShifts.filter(s => s.isMasterShift);
//         const shiftInfo = getEmployeeShift(record.employeeId, allShifts, masterShifts);

//         updateData.dayType = calculateShiftDayType(parseFloat(hours), shiftInfo.duration);
//       }
//     }

//     const updatedRecord = await Attendance.findByIdAndUpdate(attendanceId, updateData, { new: true });

//     // Auto Recalculate Summary
//     if (updatedRecord) {
//       const d = new Date(updatedRecord.checkInTime);
//       const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

//       // Call the NEW calculateSummary logic if needed
//     }

//     res.json({
//       success: true,
//       message: "Updated successfully",
//       record: updatedRecord
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// /**
//  * 📌 Update Payroll Details (Bonus, Deductions, etc.) - ✅ NEW FUNCTION
//  */
// exports.updatePayrollDetails = async (req, res) => {
//   try {
//     const { employeeId, month, calculatedSalary, extraWork, presentDays, workingDays, halfDayWorking, fullDayNotWorking, weekOffDays, holidays } = req.body;

//     if (!employeeId || !month) {
//       return res.status(400).json({
//         success: false,
//         message: "Employee ID and Month are required"
//       });
//     }

//     console.log(`💰 Updating payroll for ${employeeId} (${month})`, extraWork);

//     // Find ALL existing summaries (to handle duplicates)
//     const summaries = await AttendanceSummary.find({ employeeId, month });
//     let summary;

//     if (summaries.length === 0) {
//       // If no summary exists (rare if attendance exists), create one
//       summary = new AttendanceSummary({
//         employeeId,
//         month,
//         presentDays: presentDays || 0,
//         totalWorkingDays: workingDays || 0, // Approximate
//         calculatedSalary: calculatedSalary || 0
//       });
//     } else if (summaries.length === 1) {
//       summary = summaries[0];
//     } else {
//       // ⚠️ DUPLICATES FOUND - Merge and Clean
//       console.warn(`⚠️ Found ${summaries.length} duplicate summaries for ${employeeId} - ${month}. Merging...`);

//       // Sort by last updated (createdAt as proxy)
//       summaries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

//       summary = summaries[0]; // Keep the newest one

//       // Delete others
//       const idsToDelete = summaries.slice(1).map(s => s._id);
//       await AttendanceSummary.deleteMany({ _id: { $in: idsToDelete } });
//       console.log(`🗑️ Deleted ${idsToDelete.length} duplicates.`);
//     }

//     // Update fields
//     if (calculatedSalary !== undefined) summary.calculatedSalary = calculatedSalary;
//     if (extraWork) {
//       console.log(`📝 Saving extraWork for ${employeeId}:`, JSON.stringify(extraWork));
//       summary.extraWork = extraWork;
//     }

//     // Also update day counts if provided (allowing manual override of days)
//     if (presentDays !== undefined) summary.presentDays = presentDays;
//     if (workingDays !== undefined) summary.workingDays = workingDays; // legacy field
//     if (workingDays !== undefined) summary.totalWorkingDays = workingDays;
//     if (halfDayWorking !== undefined) summary.halfDayWorking = halfDayWorking;
//     if (fullDayNotWorking !== undefined) summary.fullDayNotWorking = fullDayNotWorking;
//     if (weekOffDays !== undefined) summary.weekOffDays = weekOffDays;
//     if (holidays !== undefined) summary.holidays = holidays;

//     const savedSummary = await summary.save();
//     console.log(`✅ MongoDB Save Result for ${employeeId}:`, JSON.stringify(savedSummary.extraWork));

//     res.json({
//       success: true,
//       message: "Payroll details updated successfully",
//       summary: savedSummary
//     });

//   } catch (error) {
//     console.error("❌ Error updating payroll:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error updating payroll details",
//       error: error.message
//     });
//   }
// };


// const Attendance = require("../models/Attendance");
// const AttendanceSummary = require("../models/AttendanceSummary");
// const Employee = require("../models/Employee");
// const Leave = require("../models/Leave");
// const Shift = require("../models/Shift"); // ✅ Uncomment karo

// // ✅ YEHI ADD KARNA HAI - Calculate Day Type Function
// const calculateDayType = (hours) => {
//   const h = parseFloat(hours) || 0;

//   const FULL_DAY_THRESHOLD = 8.80;
//   const HALF_DAY_THRESHOLD = 4;

//   if (h > FULL_DAY_THRESHOLD) {
//     return "full";
//   } else if (h >= HALF_DAY_THRESHOLD) {
//     return "half";
//   } else {
//     return "full_leave";
//   }
// };

// // ✅ HELPER FUNCTION: Calculate dynamic weekoffs for specific day
// const calculateWeekOffsForDay = (year, month, targetDay) => {
//   const monthIndex = month - 1;
//   const daysInMonth = new Date(year, month, 0).getDate();

//   let count = 0;
//   for (let day = 1; day <= daysInMonth; day++) {
//     const currentDate = new Date(year, monthIndex, day);
//     if (currentDate.getDay() === targetDay) {
//       count++;
//     }
//   }
//   return count;
// };

// // ✅ EMPLOYEE WEEKOFF MAPPING
// const EMPLOYEE_WEEKOFF_MAP = {
//   'EMP001': { weekOffDay: 'Sunday', dayNum: 0, weekOffType: '0+4', weekOffPerMonth: 4 },
//   'EMP002': { weekOffDay: 'Sunday', dayNum: 0, weekOffType: '0+4', weekOffPerMonth: 4 },
//   'EMP003': { weekOffDay: 'Sunday', dayNum: 0, weekOffType: '0+4', weekOffPerMonth: 4 },
//   'EMP004': { weekOffDay: 'Sunday', dayNum: 0, weekOffType: '0+4', weekOffPerMonth: 4 },
//   'EMP005': { weekOffDay: 'Sunday', dayNum: 0, weekOffType: '0+4', weekOffPerMonth: 4 },
//   'EMP008': { weekOffDay: 'Sunday', dayNum: 0, weekOffType: '0+4', weekOffPerMonth: 4 },
//   'EMP006': { weekOffDay: 'Tuesday', dayNum: 2, weekOffType: '0+2', weekOffPerMonth: 2 },
//   'EMP007': { weekOffDay: 'Friday', dayNum: 5, weekOffType: '0+4', weekOffPerMonth: 4 },
// };

// /**
//  * 📌 Get All Attendance Records with Filters
//  */
// exports.getAllAttendance = async (req, res) => {
//   try {
//     const { fromDate, toDate, month, employeeId } = req.query;

//     let query = {};

//     if (fromDate && toDate) {
//       query.checkInTime = {
//         $gte: new Date(fromDate),
//         $lte: new Date(toDate + 'T23:59:59.999Z')
//       };
//     }

//     if (month) {
//       const [year, monthNum] = month.split('-');
//       const startDate = new Date(year, monthNum - 1, 1);
//       const endDate = new Date(year, monthNum, 0, 23, 59, 59, 999);

//       query.checkInTime = {
//         $gte: startDate,
//         $lte: endDate
//       };
//     }

//     if (employeeId) {
//       query.employeeId = employeeId;
//     }

//     const records = await Attendance.find(query)
//       .sort({ checkInTime: -1 })
//       .lean();

//     res.json({
//       success: true,
//       records: records,
//       count: records.length
//     });

//   } catch (error) {
//     console.error('❌ Error fetching attendance:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching attendance records',
//       error: error.message
//     });
//   }
// };

// /**
//  * 📌 Update Attendance Record - ✅ FIXED COMMENT FIELD
//  */
// exports.updateAttendance = async (req, res) => {
//   try {
//     const { attendanceId, hours, region, reason, employeeId, date, checkInTime, checkOutTime, comment } = req.body;

//     console.log('📝 Update request received:', { 
//       attendanceId, 
//       hours, 
//       region, 
//       reason, 
//       employeeId, 
//       date, 
//       checkInTime, 
//       checkOutTime,
//       comment // ✅ Comment bhi log karo
//     });

//     let updatedRecord;
//     let targetDate;

//     // ✅ CASE 1: Update Existing Record
//     if (attendanceId) {
//       const updateData = {};
//       if (hours !== undefined) updateData.totalHours = parseFloat(hours);
//       if (region !== undefined) updateData.region = region;
//       if (reason !== undefined) updateData.reason = reason;
//       if (comment !== undefined) updateData.comment = comment; // ✅ YAHAN COMMENT SAVE HO RAHA HAI

//       if (checkInTime) updateData.checkInTime = new Date(checkInTime);
//       if (checkOutTime) updateData.checkOutTime = new Date(checkOutTime);

//       if (checkInTime && checkOutTime) {
//         const start = new Date(checkInTime);
//         const end = new Date(checkOutTime);
//         const diffMs = end - start;
//         const diffHours = diffMs / (1000 * 60 * 60);
//         updateData.totalHours = parseFloat(diffHours.toFixed(2));
//         updateData.status = "checked-out";
//       }

//       if (updateData.totalHours !== undefined) {
//         updateData.dayType = calculateDayType(updateData.totalHours);
//       }

//       updatedRecord = await Attendance.findByIdAndUpdate(
//         attendanceId,
//         updateData,
//         { new: true, runValidators: true }
//       );

//       if (!updatedRecord) {
//         return res.status(404).json({
//           success: false,
//           message: 'Attendance record not found'
//         });
//       }

//       targetDate = updatedRecord.checkInTime;
//     }
//     // ✅ CASE 2: Create New Record
//     else if (employeeId && date && checkInTime) {
//       if (!checkInTime) {
//         return res.status(400).json({ success: false, message: "Check-in time is required for new record" });
//       }

//       const newCheckIn = new Date(checkInTime);
//       const newCheckOut = checkOutTime ? new Date(checkOutTime) : null;
//       let totalHours = 0;

//       if (newCheckOut) {
//         const diffMs = newCheckOut - newCheckIn;
//         totalHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
//       } else if (hours) {
//         totalHours = parseFloat(hours);
//       }

//       updatedRecord = await Attendance.create({
//         employeeId,
//         checkInTime: newCheckIn,
//         checkOutTime: newCheckOut,
//         totalHours: totalHours,
//         reason: reason || "Onsite",
//         comment: comment || "Admin created", // ✅ COMMENT SAVE KARO
//         status: newCheckOut ? "checked-out" : "checked-in",
//         onsite: reason === "Onsite",
//         dayType: calculateDayType(totalHours)
//       });

//       targetDate = newCheckIn;
//     } else {
//       console.log("❌ Missing required fields for update/create:");
//       return res.status(400).json({
//         success: false,
//         message: 'Attendance ID OR (Employee ID + Date + Check-In) is required'
//       });
//     }

//     console.log('✅ Attendance record saved. Comment:', updatedRecord.comment);

//     // 🔥 AUTO RECALCULATE SUMMARY
//     const d = new Date(targetDate);
//     const monthForSummary = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

//     await AttendanceSummary.deleteMany({ month: monthForSummary });
//     await exports.calculateSummary(
//       { body: { month: monthForSummary } },
//       { json: () => { } }
//     );

//     res.json({
//       success: true,
//       message: 'Attendance record updated successfully',
//       record: updatedRecord
//     });

//   } catch (error) {
//     console.error('❌ Error updating attendance:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error updating attendance record',
//       error: error.message
//     });
//   }
// };

// /**
//  * 📌 Save Attendance Summary
//  */
// exports.saveSummary = async (req, res) => {
//   try {
//     const { summaries, fromDate, toDate, month } = req.body;

//     if (!summaries || !Array.isArray(summaries)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid summary data"
//       });
//     }

//     let deleteQuery = {};
//     if (month) {
//       deleteQuery.month = month;
//     } else if (fromDate && toDate) {
//       deleteQuery.fromDate = fromDate;
//       deleteQuery.toDate = toDate;
//     }

//     if (Object.keys(deleteQuery).length > 0) {
//       await AttendanceSummary.deleteMany(deleteQuery);
//     }

//     const insertData = summaries.map((summary) => ({
//       employeeId: summary.employeeId,
//       name: summary.name,
//       month: summary.month,
//       presentDays: summary.presentDays || 0,
//       lateDays: summary.lateDays || 0,
//       onsiteDays: summary.onsiteDays || 0,
//       halfDayWorking: summary.halfDayWorking || summary.halfDayLeaves || 0,
//       fullDayNotWorking: summary.fullDayNotWorking || summary.fullDayLeaves || 0,
//       totalWorkingDays: summary.totalWorkingDays || 0,
//       fromDate: fromDate || null,
//       toDate: toDate || null,
//       calculatedSalary: summary.calculatedSalary || 0,
//       workingDays: summary.workingDays || 0,
//       overTimeHours: summary.overTimeHours || 0,
//       onsiteYesDays: summary.onsiteYesDays || 0,
//       onsiteNoDays: summary.onsiteNoDays || 0,
//       reasonCount: summary.reasonCount || {
//         onsite: 0,
//         fieldWork: 0,
//         workFromHome: 0
//       },
//       extraWork: summary.extraWork || {
//         extraDays: 0,
//         extraHours: 0,
//         bonus: 0,
//         deductions: 0,
//         reason: ""
//       },
//       createdAt: new Date()
//     }));

//     const result = await AttendanceSummary.insertMany(insertData);

//     res.json({
//       success: true,
//       message: "Summary saved successfully",
//       count: result.length,
//       data: result
//     });

//   } catch (err) {
//     console.error('❌ Error saving summary:', err);
//     res.status(500).json({
//       success: false,
//       message: err.message
//     });
//   }
// };

// /**
//  * 📌 Get Saved Summary
//  */
// exports.getSummary = async (req, res) => {
//   try {
//     const { month, fromDate, toDate, employeeId } = req.query;

//     let filter = {};

//     if (fromDate && toDate) {
//       filter.createdAt = {
//         $gte: new Date(fromDate),
//         $lte: new Date(toDate + "T23:59:59.999Z")
//       };
//     }

//     if (month) {
//       filter.month = month;
//     }

//     if (employeeId) {
//       filter.employeeId = employeeId;
//     }

//     let data = await AttendanceSummary.find(filter).sort({ createdAt: -1 });

//     res.json({
//       success: true,
//       count: data.length,
//       summary: data,
//       note: "Data from DB (Manual edits respected)"
//     });
//   } catch (err) {
//     console.error('❌ Error fetching summary:', err);
//     res.status(500).json({
//       success: false,
//       message: err.message
//     });
//   }
// };

// /**
//  * 📌 Get Employee Details for Specific Employee - ✅ COMMENT FIELD INCLUDED
//  */
// exports.getEmployeeDetails = async (req, res) => {
//   try {
//     const { employeeId, fromDate, toDate, month } = req.query;

//     if (!employeeId) {
//       return res.status(400).json({
//         success: false,
//         message: 'Employee ID is required'
//       });
//     }

//     let query = { employeeId };

//     if (fromDate && toDate) {
//       query.checkInTime = {
//         $gte: new Date(fromDate),
//         $lte: new Date(toDate + 'T23:59:59.999Z')
//       };
//     }

//     if (month) {
//       const [year, monthNum] = month.split('-');
//       const startDate = new Date(year, monthNum - 1, 1);
//       const endDate = new Date(year, monthNum, 0, 23, 59, 59, 999);

//       query.checkInTime = {
//         $gte: startDate,
//         $lte: endDate
//       };
//     }

//     const details = await Attendance.find(query)
//       .sort({ checkInTime: 1 }) // ✅ Ascending order (oldest first)
//       .lean();

//     const employee = await Employee.findOne({ employeeId });

//     res.json({
//       success: true,
//       employee: employee || { employeeId, name: 'Unknown' },
//       details: details,
//       count: details.length
//     });

//   } catch (error) {
//     console.error('❌ Error fetching employee details:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching employee details',
//       error: error.message
//     });
//   }
// };

// /**
//  * 📌 Fix Wrong Summary Data
//  */
// exports.fixSummaryData = async (req, res) => {
//   try {
//     const { month } = req.body;

//     if (!month) {
//       return res.status(400).json({
//         success: false,
//         message: "Month is required (e.g., 2025-12)"
//       });
//     }

//     const today = new Date();
//     const currentYear = today.getFullYear();
//     const currentMonth = today.getMonth() + 1;
//     const currentDay = today.getDate();

//     const [year, monthNum] = month.split('-').map(Number);

//     let updateCount = 0;

//     if (year === currentYear && monthNum === currentMonth) {
//       const summaries = await AttendanceSummary.find({ month });

//       for (const summary of summaries) {
//         const correctedPresent = Math.min(summary.presentDays, currentDay);
//         const correctedLate = Math.min(summary.lateDays, currentDay);
//         const correctedOnsite = Math.min(summary.onsiteDays, currentDay);
//         const correctedHalf = Math.min(summary.halfDayWorking, currentDay);
//         const correctedFullLeave = Math.min(summary.fullDayNotWorking, currentDay);
//         const correctedTotal = correctedPresent + (correctedHalf * 0.5);

//         if (summary.presentDays !== correctedPresent ||
//           summary.lateDays !== correctedLate ||
//           summary.totalWorkingDays !== correctedTotal) {

//           await AttendanceSummary.findByIdAndUpdate(
//             summary._id,
//             {
//               presentDays: correctedPresent,
//               lateDays: correctedLate,
//               onsiteDays: correctedOnsite,
//               halfDayWorking: correctedHalf,
//               fullDayNotWorking: correctedFullLeave,
//               totalWorkingDays: correctedTotal
//             }
//           );

//           updateCount++;
//         }
//       }
//     }

//     res.json({
//       success: true,
//       message: `Fixed ${updateCount} summary records for ${month}`,
//       fixedCount: updateCount
//     });

//   } catch (error) {
//     console.error('❌ Error fixing summary:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error fixing summary data',
//       error: error.message
//     });
//   }
// };

// /**
//  * 📌 Get Salaries
//  */
// exports.getSalaries = async (req, res) => {
//   try {
//     let { month } = req.query;

//     if (!month || month.trim() === "") {
//       const today = new Date();
//       month = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
//     }

//     month = month.trim();

//     const [year, monthNum] = month.split("-").map(Number);

//     if (isNaN(year) || isNaN(monthNum)) {
//       return res.status(400).json({ success: false, message: "Invalid month" });
//     }

//     const start = new Date(year, monthNum - 1, 1);
//     const end = new Date(year, monthNum, 0, 23, 59, 59, 999);
//     const daysInMonth = new Date(year, monthNum, 0).getDate();

//     const employees = await Employee.find({});
//     const attendanceSummaries = await AttendanceSummary.find({ month });

//     const allApprovedLeaves = await Leave.find({
//       status: "approved",
//       $or: [
//         { startDate: { $regex: `^${month}` } },
//         { endDate: { $regex: `^${month}` } }
//       ]
//     });

//     const attendanceMap = {};
//     attendanceSummaries.forEach(a => {
//       attendanceMap[a.employeeId] = a;
//     });

//     const sundaysInMonth = calculateWeekOffsForDay(year, monthNum, 0);

//     const salaryMap = {};

//     employees.forEach(emp => {
//       let weekOffDay = emp.weekOffDay || "Sunday";
//       const dayMap = {
//         Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3,
//         Thursday: 4, Friday: 5, Saturday: 6
//       };
//       const weekOffDayNum = dayMap[weekOffDay] ?? 0;

//       let weekOffs = 0;
//       let weekOffSource = "default";

//       if (emp.weekOffType === '0+2') {
//         weekOffs = 2;
//         weekOffSource = "0+2_fixed";
//       }
//       else if (emp.weekOffType === '0+4') {
//         weekOffs = 4;
//         weekOffSource = "0+4_fixed";
//       }
//       else if (emp.weekOffType === 'manual') {
//         weekOffs = emp.weekOffPerMonth || 4;
//         weekOffSource = "manual";
//       }
//       else if (emp.weekOffPerMonth === 4 && weekOffDay === "Sunday") {
//         weekOffs = sundaysInMonth === 5 ? 5 : 4;
//         weekOffSource = "0+4_sunday_auto";
//       }
//       else if (emp.weekOffPerMonth === 2) {
//         weekOffs = 2;
//         weekOffSource = "0+2_fixed_no_increment";
//       }
//       else if (typeof emp.weekOffPerMonth === "number") {
//         weekOffs = emp.weekOffPerMonth;
//         weekOffSource = "fixed_from_db";
//       }
//       else {
//         weekOffs = calculateWeekOffsForDay(year, monthNum, weekOffDayNum);
//         weekOffSource = "dynamic";
//       }

//       const empAttendance = attendanceMap[emp.employeeId];
//       const presentDays = empAttendance?.presentDays || 0;
//       const halfDays = empAttendance?.halfDayWorking || 0;
//       const effectiveWorkingDays = presentDays + (halfDays * 0.5);

//       const salaryPerMonth = emp.salaryPerMonth || 0;
//       const dailyRate = salaryPerMonth / daysInMonth;

//       const empLeaves = allApprovedLeaves.filter(l => l.employeeId === emp.employeeId);

//       let paidLeaveDays = 0;
//       empLeaves.forEach(leave => {
//         const leaveStart = new Date(leave.startDate);
//         const leaveEnd = new Date(leave.endDate);

//         const overlapStart = new Date(Math.max(leaveStart, start));
//         const overlapEnd = new Date(Math.min(leaveEnd, end));

//         if (overlapStart <= overlapEnd) {
//           const diffTime = Math.abs(overlapEnd - overlapStart);
//           const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

//           if (["CL", "EL", "COFF", "Casual Leave", "Earned Leave", "Comp Off"].includes(leave.leaveType)) {
//             paidLeaveDays += diffDays;
//           }
//         }
//       });

//       const paidDays = effectiveWorkingDays + weekOffs + paidLeaveDays;

//       const storedExtraWork = empAttendance?.extraWork || {
//         extraDays: 0,
//         extraHours: 0,
//         bonus: 0,
//         deductions: 0,
//         reason: ""
//       };

//       let calculatedSalary = Math.round(paidDays * dailyRate);

//       if (storedExtraWork) {
//         const extraDaysAmount = (storedExtraWork.extraDays || 0) * dailyRate;
//         const bonus = storedExtraWork.bonus || 0;
//         const deductions = storedExtraWork.deductions || 0;

//         calculatedSalary = Math.round(calculatedSalary + extraDaysAmount + bonus - deductions);
//       }

//       if (empAttendance?.calculatedSalary) {
//         calculatedSalary = empAttendance.calculatedSalary;
//       }

//       salaryMap[emp.employeeId] = {
//         employeeId: emp.employeeId,
//         name: emp.name,
//         month,
//         presentDays,
//         extraWork: storedExtraWork,
//         halfDayWorking: halfDays,
//         totalWorkingDays: effectiveWorkingDays,
//         weekOffs,
//         weekOffDay,
//         weekOffType: emp.weekOffType || (emp.weekOffPerMonth === 2 ? '0+2' : '0+4'),
//         weekOffSource,
//         salaryPerMonth,
//         salaryPerDay: Number(dailyRate.toFixed(2)),
//         paidDays,
//         calculatedSalary,
//         calculatedSalaryDisplay: `₹${calculatedSalary}`,
//         monthDays: daysInMonth
//       };
//     });

//     res.json({
//       success: true,
//       month,
//       salaries: Object.values(salaryMap),
//       count: Object.values(salaryMap).length,
//       monthDays: daysInMonth,
//       note: "0+2: 2 days | 0+4: 4 days | Manual: user defined"
//     });

//   } catch (error) {
//     console.error("❌ Error in getSalaries:", error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// /**
//  * 📌 Update Employee WeekOff Configuration
//  */
// exports.updateWeekOffConfig = async (req, res) => {
//   try {
//     const { employeeId, weekOffDay, weekOffPerMonth, weekOffType } = req.body;

//     if (!employeeId || !weekOffDay) {
//       return res.status(400).json({
//         success: false,
//         message: "Employee ID and WeekOff Day are required"
//       });
//     }

//     const dayMap = {
//       'Sunday': 0,
//       'Monday': 1,
//       'Tuesday': 2,
//       'Wednesday': 3,
//       'Thursday': 4,
//       'Friday': 5,
//       'Saturday': 6
//     };

//     if (!dayMap.hasOwnProperty(weekOffDay)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid weekoff day. Use: Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday"
//       });
//     }

//     const updateData = {
//       weekOffDay
//     };

//     if (weekOffType === '0+2') {
//       updateData.weekOffPerMonth = 2;
//       updateData.weekOffType = '0+2';
//     }
//     else if (weekOffType === '0+4') {
//       updateData.weekOffPerMonth = 4;
//       updateData.weekOffType = '0+4';
//     }
//     else if (weekOffType === 'manual') {
//       if (typeof weekOffPerMonth === "number" && weekOffPerMonth > 0) {
//         updateData.weekOffPerMonth = weekOffPerMonth;
//         updateData.weekOffType = 'manual';
//       } else {
//         updateData.weekOffPerMonth = 4;
//         updateData.weekOffType = '0+4';
//       }
//     }
//     else if (typeof weekOffPerMonth === "number" && weekOffPerMonth > 0) {
//       updateData.weekOffPerMonth = weekOffPerMonth;
//       updateData.weekOffType = weekOffPerMonth === 2 ? '0+2' : '0+4';
//     }
//     else {
//       updateData.weekOffPerMonth = 4;
//       updateData.weekOffType = '0+4';
//     }

//     EMPLOYEE_WEEKOFF_MAP[employeeId] = {
//       weekOffDay: weekOffDay,
//       dayNum: dayMap[weekOffDay],
//       weekOffPerMonth: updateData.weekOffPerMonth,
//       weekOffType: updateData.weekOffType
//     };

//     const updatedEmp = await Employee.findOneAndUpdate(
//       { employeeId },
//       updateData,
//       { new: true }
//     );

//     if (!updatedEmp) {
//       return res.status(404).json({
//         success: false,
//         message: "Employee not found"
//       });
//     }

//     res.json({
//       success: true,
//       message: `WeekOff updated for ${employeeId}`,
//       config: EMPLOYEE_WEEKOFF_MAP[employeeId],
//       updatedEmp: updatedEmp
//     });

//   } catch (error) {
//     console.error('❌ Error updating weekoff config:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error updating weekoff configuration',
//       error: error.message
//     });
//   }
// };

// /**
//  * 📌 Get WeekOff Configuration
//  */
// exports.getWeekOffConfig = async (req, res) => {
//   try {
//     res.json({
//       success: true,
//       config: EMPLOYEE_WEEKOFF_MAP,
//       count: Object.keys(EMPLOYEE_WEEKOFF_MAP).length,
//       note: "Current employee weekoff configuration"
//     });
//   } catch (error) {
//     console.error('❌ Error getting weekoff config:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching weekoff configuration',
//       error: error.message
//     });
//   }
// };

// /**
//  * 📌 Check Month Data - Diagnostic Function
//  */
// exports.checkMonthData = async (req, res) => {
//   try {
//     const { month1, month2 } = req.query;

//     const summaries1 = await AttendanceSummary.find({ month: month1 });
//     const summaries2 = await AttendanceSummary.find({ month: month2 });

//     const [year1, monthNum1] = month1.split("-").map(Number);
//     const start1 = new Date(year1, monthNum1 - 1, 1);
//     const end1 = new Date(year1, monthNum1, 0, 23, 59, 59, 999);

//     const [year2, monthNum2] = month2.split("-").map(Number);
//     const start2 = new Date(year2, monthNum2 - 1, 1);
//     const end2 = new Date(year2, monthNum2, 0, 23, 59, 59, 999);

//     const leaves1 = await Leave.find({
//       status: 'approved',
//       $or: [
//         { startDate: { $gte: start1, $lte: end1 } },
//         { endDate: { $gte: start1, $lte: end1 } },
//         {
//           $and: [
//             { startDate: { $lte: start1 } },
//             { endDate: { $gte: end1 } }
//           ]
//         }
//       ]
//     });

//     const leaves2 = await Leave.find({
//       status: 'approved',
//       $or: [
//         { startDate: { $gte: start2, $lte: end2 } },
//         { endDate: { $gte: start2, $lte: end2 } },
//         {
//           $and: [
//             { startDate: { $lte: start2 } },
//             { endDate: { $gte: end2 } }
//           ]
//         }
//       ]
//     });

//     const employees = await Employee.find({});
//     const crossMonthEmployees = [];

//     employees.forEach(emp => {
//       const inMonth1 = summaries1.find(s => s.employeeId === emp.employeeId);
//       const inMonth2 = summaries2.find(s => s.employeeId === emp.employeeId);
//       const leavesIn1 = leaves1.filter(l => l.employeeId === emp.employeeId);
//       const leavesIn2 = leaves2.filter(l => l.employeeId === emp.employeeId);

//       if (inMonth1 && inMonth2) {
//         crossMonthEmployees.push({
//           employeeId: emp.employeeId,
//           name: emp.name,
//           [month1]: {
//             presentDays: inMonth1.presentDays,
//             totalWorkingDays: inMonth1.totalWorkingDays,
//             leaves: leavesIn1.length
//           },
//           [month2]: {
//             presentDays: inMonth2.presentDays,
//             totalWorkingDays: inMonth2.totalWorkingDays,
//             leaves: leavesIn2.length
//           }
//         });
//       }
//     });

//     res.json({
//       success: true,
//       months: { month1, month2 },
//       summaries: {
//         [month1]: summaries1.length,
//         [month2]: summaries2.length
//       },
//       leaves: {
//         [month1]: leaves1.length,
//         [month2]: leaves2.length
//       },
//       crossMonthEmployees: crossMonthEmployees.length > 0 ? crossMonthEmployees : "No cross-month data found",
//       note: "This is diagnostic only - no data changed"
//     });

//   } catch (error) {
//     console.error('❌ Check error:', error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// // ============================================================================
// // 🚀 DYNAMIC SHIFT LOGIC IMPLEMENTATION
// // ============================================================================

// /**
//  * 🛠️ Helper: Get Default Shift Time
//  */
// const getDefaultShiftTime = (shiftType) => {
//   switch (shiftType) {
//     case "Morning": return { start: "06:00", end: "15:00" };
//     case "Evening": return { start: "14:00", end: "23:00" };
//     case "Night": return { start: "22:00", end: "07:00" };
//     case "General": return { start: "10:00", end: "19:00" };
//     default: return { start: "10:00", end: "19:00" };
//   }
// };

// /**
//  * 🛠️ Helper: Get Employee Shift
//  */
// const getEmployeeShift = (employeeId, shiftsData, masterShifts) => {
//   if (!shiftsData || !masterShifts) return null;

//   let assignedShift = shiftsData.find(
//     (s) =>
//       s.employeeAssignment &&
//       (s.employeeAssignment.employeeId === employeeId || s.employeeAssignment.employeeId === String(employeeId))
//   );

//   let startTime = "10:00";
//   let endTime = "19:00";
//   let shiftName = "General";
//   let shiftType = "General";

//   if (assignedShift && assignedShift.employeeAssignment) {
//     shiftName = assignedShift.shiftName;
//     shiftType = assignedShift.shiftType;

//     const empAssign = assignedShift.employeeAssignment;

//     if (empAssign.startTime && empAssign.endTime) {
//       startTime = empAssign.startTime;
//       endTime = empAssign.endTime;
//     } else if (empAssign.selectedTimeRange) {
//       const parts = empAssign.selectedTimeRange.split("-").map(p => p.trim());
//       if (parts.length === 2) {
//         startTime = parts[0];
//         endTime = parts[1];
//       }
//     }
//   }

//   let duration = 9;
//   if (startTime && endTime) {
//     const start = new Date(`2000-01-01T${startTime}`);
//     const end = new Date(`2000-01-01T${endTime}`);
//     if (end < start) end.setDate(end.getDate() + 1);

//     const diff = (end - start) / (1000 * 60 * 60);
//     duration = Number(diff.toFixed(2));
//   }

//   return {
//     name: shiftName,
//     type: shiftType,
//     startTime: startTime,
//     endTime: endTime,
//     duration: duration
//   };
// };

// /**
//  * 🛠️ Helper: Calculate Day Type
//  */
// const calculateShiftDayType = (hours, shiftDuration) => {
//   const h = parseFloat(hours) || 0;

//   if (shiftDuration >= 3 && shiftDuration <= 6) {
//     if (h < 2.25) return "full_leave";
//     if (h >= 2.25 && h <= 3.49) return "half";
//     return "full";
//   } else {
//     if (h < 4.5) return "full_leave";
//     if (h >= 4.5 && h <= 8.79) return "half";
//     return "full";
//   }
// };

// /**
//  * 🛠️ Helper: Calculate Overtime
//  */
// const calculateShiftOT = (checkOutTime, shiftEndTimeStr, checkInTime) => {
//   if (!checkOutTime || !shiftEndTimeStr) return 0;

//   const checkOut = new Date(checkOutTime);
//   const checkIn = new Date(checkInTime);

//   const [endH, endM] = shiftEndTimeStr.split(":").map(Number);

//   let shiftEnd = new Date(checkIn);
//   shiftEnd.setHours(endH, endM, 0, 0);

//   if (checkIn.getHours() > 12 && endH < 12) {
//     shiftEnd.setDate(shiftEnd.getDate() + 1);
//   }

//   const diffMs = checkOut - shiftEnd;
//   if (diffMs > 0) {
//     return Number((diffMs / (1000 * 60 * 60)).toFixed(2));
//   }

//   return 0;
// };

// /**
//  * 📌 Calculate Summary from Raw Data (DYNAMIC VERSION)
//  */
// exports.calculateSummary = async (req, res) => {
//   try {
//     const { fromDate, toDate, month } = req.body;

//     let query = {};
//     let processedMonth = month;

//     if (fromDate && toDate) {
//       query.checkInTime = {
//         $gte: new Date(fromDate),
//         $lte: new Date(toDate + "T23:59:59.999Z")
//       };
//       if (!month) {
//         const d = new Date(fromDate);
//         processedMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
//       }
//     } else if (month) {
//       const [year, m] = month.split("-");
//       const start = new Date(year, m - 1, 1);
//       const end = new Date(year, m, 0, 23, 59, 59, 999);

//       const today = new Date();
//       if (parseInt(year) === today.getFullYear() && parseInt(m) === (today.getMonth() + 1)) {
//         end.setHours(23, 59, 59, 999);
//       }
//       query.checkInTime = { $gte: start, $lte: end };
//     } else {
//       const today = new Date();
//       const start = new Date(today.getFullYear(), today.getMonth(), 1);
//       const end = new Date(today);
//       end.setHours(23, 59, 59, 999);
//       query.checkInTime = { $gte: start, $lte: end };
//       processedMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
//     }

//     const attendanceRecords = await Attendance.find(query).sort({ checkInTime: -1 });
//     const employees = await Employee.find({});
//     const allShifts = await Shift.find({});
//     const masterShifts = allShifts.filter(s => s.isMasterShift);

//     const summaryMap = {};
//     const processedDates = {};

//     attendanceRecords.forEach((rec) => {
//       if (!rec.employeeId || !rec.checkInTime) return;
//       const employeeId = rec.employeeId;
//       const checkInDate = new Date(rec.checkInTime);
//       const dateKey = checkInDate.toISOString().split("T")[0];

//       const recordMonth = `${checkInDate.getFullYear()}-${String(checkInDate.getMonth() + 1).padStart(2, "0")}`;
//       if (processedMonth && recordMonth !== processedMonth) return;

//       if (checkInDate > new Date()) return;

//       if (!summaryMap[employeeId]) {
//         const emp = employees.find(e => e.employeeId === employeeId) || {};
//         const shiftInfo = getEmployeeShift(employeeId, allShifts, masterShifts);

//         summaryMap[employeeId] = {
//           employeeId,
//           name: emp.name || `Employee ${employeeId}`,
//           month: processedMonth,
//           presentDays: 0,
//           lateDays: 0,
//           onsiteDays: 0,
//           halfDayWorking: 0,
//           fullDayNotWorking: 0,
//           totalWorkingDays: 0,
//           overTimeHours: 0,
//           onsiteYesDays: 0,
//           onsiteNoDays: 0,
//           shiftName: shiftInfo.name,
//           shiftDuration: shiftInfo.duration,
//           shiftStartTime: shiftInfo.startTime,
//           shiftEndTime: shiftInfo.endTime,
//           salaryPerMonth: emp.salaryPerMonth || 0,
//           calculatedSalary: 0,
//           workingDays: 0,
//           reasonCount: { onsite: 0, fieldWork: 0, workFromHome: 0 }
//         };
//         processedDates[employeeId] = new Set();
//       }

//       if (processedDates[employeeId].has(dateKey)) return;
//       processedDates[employeeId].add(dateKey);

//       const empSum = summaryMap[employeeId];

//       let hours = 0;
//       if (rec.totalHours !== undefined) {
//         hours = parseFloat(rec.totalHours);
//       } else if (rec.checkOutTime) {
//         hours = (new Date(rec.checkOutTime) - new Date(rec.checkInTime)) / (1000 * 60 * 60);
//       }

//       const type = calculateShiftDayType(hours, empSum.shiftDuration);

//       if (type === "full") {
//         empSum.presentDays += 1;
//         empSum.totalWorkingDays += 1;
//       } else if (type === "half") {
//         empSum.halfDayWorking += 1;
//         empSum.totalWorkingDays += 0.5;
//       } else {
//         empSum.fullDayNotWorking += 1;
//       }

//       if (empSum.shiftEndTime && rec.checkOutTime) {
//         const ot = calculateShiftOT(rec.checkOutTime, empSum.shiftEndTime, rec.checkInTime);
//         empSum.overTimeHours += ot;
//       }

//       if (empSum.shiftStartTime) {
//         const [startH, startM] = empSum.shiftStartTime.split(":").map(Number);
//         const checkInH = checkInDate.getHours();
//         const checkInM = checkInDate.getMinutes();

//         if (checkInH > startH || (checkInH === startH && checkInM > startM)) {
//           empSum.lateDays += 1;
//         }
//       } else {
//         const h = checkInDate.getHours();
//         const m = checkInDate.getMinutes();
//         if (h > 10 || (h === 10 && m > 0)) {
//           empSum.lateDays += 1;
//         }
//       }

//       if (rec.onsite) {
//         empSum.onsiteDays += 1;
//         empSum.onsiteYesDays += 1;
//         empSum.reasonCount.onsite += 1;

//         if (type === "full_leave") {
//           empSum.totalWorkingDays += 1;
//         } else if (type === "half") {
//           empSum.totalWorkingDays += 0.5;
//         }
//       } else {
//         empSum.onsiteNoDays += 1;

//         if (rec.reason === "Work From Home") {
//           empSum.reasonCount.workFromHome += 1;
//         } else if (rec.reason === "Field Work") {
//           empSum.reasonCount.fieldWork += 1;
//         }
//       }
//     });

//     const summaryArray = Object.values(summaryMap);

//     if (summaryArray.length > 0 && processedMonth) {
//       await AttendanceSummary.deleteMany({ month: processedMonth });

//       const summariesToSave = summaryArray.map(s => ({
//         ...s,
//         month: processedMonth,
//         calculatedAt: new Date(),
//         createdAt: new Date()
//       }));

//       await AttendanceSummary.insertMany(summariesToSave);
//     }

//     res.json({
//       success: true,
//       summary: summaryArray,
//       month: processedMonth
//     });

//   } catch (err) {
//     console.error("❌ Error in calculating summary:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// /**
//  * 📌 Update Attendance Record (Dynamic Update) - ✅ FIXED COMMENT FIELD
//  */
// exports.updateAttendanceDynamic = async (req, res) => {
//   try {
//     const { attendanceId, hours, region, reason, comment } = req.body; // ✅ comment field include kiya

//     if (!attendanceId) return res.status(400).json({ success: false, message: "ID required" });

//     const updateData = {};
//     if (hours !== undefined) updateData.totalHours = parseFloat(hours);
//     if (region !== undefined) updateData.region = region;
//     if (reason !== undefined) updateData.reason = reason;
//     if (comment !== undefined) updateData.comment = comment; // ✅ Alag se comment save karo, reason se overwrite mat karo

//     if (hours !== undefined) {
//       const record = await Attendance.findById(attendanceId);
//       if (record) {
//         const allShifts = await Shift.find({});
//         const masterShifts = allShifts.filter(s => s.isMasterShift);
//         const shiftInfo = getEmployeeShift(record.employeeId, allShifts, masterShifts);

//         updateData.dayType = calculateShiftDayType(parseFloat(hours), shiftInfo.duration);
//       }
//     }

//     const updatedRecord = await Attendance.findByIdAndUpdate(attendanceId, updateData, { new: true });

//     res.json({
//       success: true,
//       message: "Updated successfully",
//       record: updatedRecord
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// /**
//  * 📌 Update Payroll Details
//  */
// exports.updatePayrollDetails = async (req, res) => {
//   try {
//     const { employeeId, month, calculatedSalary, extraWork, presentDays, workingDays, halfDayWorking, fullDayNotWorking, weekOffDays, holidays } = req.body;

//     if (!employeeId || !month) {
//       return res.status(400).json({
//         success: false,
//         message: "Employee ID and Month are required"
//       });
//     }

//     const summaries = await AttendanceSummary.find({ employeeId, month });
//     let summary;

//     if (summaries.length === 0) {
//       summary = new AttendanceSummary({
//         employeeId,
//         month,
//         presentDays: presentDays || 0,
//         totalWorkingDays: workingDays || 0,
//         calculatedSalary: calculatedSalary || 0
//       });
//     } else if (summaries.length === 1) {
//       summary = summaries[0];
//     } else {
//       summaries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
//       summary = summaries[0];
//       const idsToDelete = summaries.slice(1).map(s => s._id);
//       await AttendanceSummary.deleteMany({ _id: { $in: idsToDelete } });
//     }

//     if (calculatedSalary !== undefined) summary.calculatedSalary = calculatedSalary;
//     if (extraWork) {
//       summary.extraWork = extraWork;
//     }

//     if (presentDays !== undefined) summary.presentDays = presentDays;
//     if (workingDays !== undefined) summary.workingDays = workingDays;
//     if (workingDays !== undefined) summary.totalWorkingDays = workingDays;
//     if (halfDayWorking !== undefined) summary.halfDayWorking = halfDayWorking;
//     if (fullDayNotWorking !== undefined) summary.fullDayNotWorking = fullDayNotWorking;
//     if (weekOffDays !== undefined) summary.weekOffDays = weekOffDays;
//     if (holidays !== undefined) summary.holidays = holidays;

//     const savedSummary = await summary.save();

//     res.json({
//       success: true,
//       message: "Payroll details updated successfully",
//       summary: savedSummary
//     });

//   } catch (error) {
//     console.error("❌ Error updating payroll:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error updating payroll details",
//       error: error.message
//     });
//   }
// };


// const Attendance = require("../models/Attendance");
// const AttendanceSummary = require("../models/AttendanceSummary");
// const Employee = require("../models/Employee");
// const Leave = require("../models/Leave");
// const Shift = require("../models/Shift");

// // ✅ YEHI ADD KARNA HAI - Calculate Day Type Function
// const calculateDayType = (hours) => {
//   const h = parseFloat(hours) || 0;

//   const FULL_DAY_THRESHOLD = 8.80;
//   const HALF_DAY_THRESHOLD = 4;

//   if (h > FULL_DAY_THRESHOLD) {
//     return "full";
//   } else if (h >= HALF_DAY_THRESHOLD) {
//     return "half";
//   } else {
//     return "full_leave";
//   }
// };

// // ✅ HELPER FUNCTION: Calculate dynamic weekoffs for specific day
// const calculateWeekOffsForDay = (year, month, targetDay) => {
//   const monthIndex = month - 1;
//   const daysInMonth = new Date(year, month, 0).getDate();

//   let count = 0;
//   for (let day = 1; day <= daysInMonth; day++) {
//     const currentDate = new Date(year, monthIndex, day);
//     if (currentDate.getDay() === targetDay) {
//       count++;
//     }
//   }
//   return count;
// };

// // ✅ EMPLOYEE WEEKOFF MAPPING
// const EMPLOYEE_WEEKOFF_MAP = {
//   'EMP001': { weekOffDay: 'Sunday', dayNum: 0, weekOffType: '0+4', weekOffPerMonth: 4 },
//   'EMP002': { weekOffDay: 'Sunday', dayNum: 0, weekOffType: '0+4', weekOffPerMonth: 4 },
//   'EMP003': { weekOffDay: 'Sunday', dayNum: 0, weekOffType: '0+4', weekOffPerMonth: 4 },
//   'EMP004': { weekOffDay: 'Sunday', dayNum: 0, weekOffType: '0+4', weekOffPerMonth: 4 },
//   'EMP005': { weekOffDay: 'Sunday', dayNum: 0, weekOffType: '0+4', weekOffPerMonth: 4 },
//   'EMP008': { weekOffDay: 'Sunday', dayNum: 0, weekOffType: '0+4', weekOffPerMonth: 4 },
//   'EMP006': { weekOffDay: 'Tuesday', dayNum: 2, weekOffType: '0+2', weekOffPerMonth: 2 },
//   'EMP007': { weekOffDay: 'Friday', dayNum: 5, weekOffType: '0+4', weekOffPerMonth: 4 },
//   // ✅ Subir - 3 working days per week (Tuesday, Wednesday, Thursday)
//   'SUB001': { weekOffDay: 'Sunday', dayNum: 0, weekOffType: '0+4', weekOffPerMonth: 4, workingDaysPerWeek: 3 }
// };

// // ============================================================================
// // 🚀 DYNAMIC SHIFT LOGIC IMPLEMENTATION
// // ============================================================================

// /**
//  * 🛠️ Helper: Get Default Shift Time
//  */
// const getDefaultShiftTime = (shiftType) => {
//   switch (shiftType) {
//     case "Morning": return { start: "06:00", end: "15:00" };
//     case "Evening": return { start: "14:00", end: "23:00" };
//     case "Night": return { start: "22:00", end: "07:00" };
//     case "General": return { start: "10:00", end: "19:00" };
//     default: return { start: "10:00", end: "19:00" };
//   }
// };

// /**
//  * 🛠️ Helper: Get Employee Shift
//  */
// const getEmployeeShift = (employeeId, shiftsData, masterShifts) => {
//   if (!shiftsData || !masterShifts) return null;

//   let assignedShift = shiftsData.find(
//     (s) =>
//       s.employeeAssignment &&
//       (s.employeeAssignment.employeeId === employeeId || s.employeeAssignment.employeeId === String(employeeId))
//   );

//   let startTime = "10:00";
//   let endTime = "19:00";
//   let shiftName = "General";
//   let shiftType = "General";

//   if (assignedShift && assignedShift.employeeAssignment) {
//     shiftName = assignedShift.shiftName;
//     shiftType = assignedShift.shiftType;

//     const empAssign = assignedShift.employeeAssignment;

//     if (empAssign.startTime && empAssign.endTime) {
//       startTime = empAssign.startTime;
//       endTime = empAssign.endTime;
//     } else if (empAssign.selectedTimeRange) {
//       const parts = empAssign.selectedTimeRange.split("-").map(p => p.trim());
//       if (parts.length === 2) {
//         startTime = parts[0];
//         endTime = parts[1];
//       }
//     }
//   }

//   let duration = 9;
//   if (startTime && endTime) {
//     const start = new Date(`2000-01-01T${startTime}`);
//     const end = new Date(`2000-01-01T${endTime}`);
//     if (end < start) end.setDate(end.getDate() + 1);

//     const diff = (end - start) / (1000 * 60 * 60);
//     duration = Number(diff.toFixed(2));
//   }

//   return {
//     name: shiftName,
//     type: shiftType,
//     startTime: startTime,
//     endTime: endTime,
//     duration: duration
//   };
// };

// /**
//  * 🛠️ Helper: Calculate Day Type Based on Shift Duration
//  */
// const calculateShiftDayType = (hours, shiftDuration) => {
//   const h = parseFloat(hours) || 0;

//   // 🟢 SHORT SHIFTS (3 - 6 Hours)
//   if (shiftDuration >= 3 && shiftDuration <= 6) {
//     if (h < 2.25) return "full_leave";
//     if (h >= 2.25 && h <= 3.49) return "half";
//     return "full";
//   }
//   // 🟣 STANDARD SHIFTS (7 - 12 Hours)
//   else {
//     if (h < 4.5) return "full_leave";
//     if (h >= 4.5 && h <= 8.79) return "half";
//     return "full";
//   }
// };

// /**
//  * 🛠️ Helpers: Calculate Overtime (Based on Shift End Time)
//  */
// const calculateShiftOT = (checkOutTime, shiftEndTimeStr, checkInTime) => {
//   if (!checkOutTime || !shiftEndTimeStr) return 0;

//   const checkOut = new Date(checkOutTime);
//   const checkIn = new Date(checkInTime);

//   const [endH, endM] = shiftEndTimeStr.split(":").map(Number);

//   let shiftEnd = new Date(checkIn);
//   shiftEnd.setHours(endH, endM, 0, 0);

//   if (checkIn.getHours() > 12 && endH < 12) {
//     shiftEnd.setDate(shiftEnd.getDate() + 1);
//   }

//   const diffMs = checkOut - shiftEnd;
//   if (diffMs > 0) {
//     return Number((diffMs / (1000 * 60 * 60)).toFixed(2));
//   }

//   return 0;
// };

// /**
//  * 📌 Calculate Summary from Raw Data (DYNAMIC VERSION - SHIFT BASED)
//  */
// exports.calculateSummary = async (req, res) => {
//   try {
//     const { fromDate, toDate, month } = req.body;

//     let query = {};
//     let processedMonth = month;

//     if (fromDate && toDate) {
//       query.checkInTime = {
//         $gte: new Date(fromDate),
//         $lte: new Date(toDate + "T23:59:59.999Z")
//       };
//       if (!month) {
//         const d = new Date(fromDate);
//         processedMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
//       }
//     } else if (month) {
//       const [year, m] = month.split("-");
//       const start = new Date(year, m - 1, 1);
//       const end = new Date(year, m, 0, 23, 59, 59, 999);

//       const today = new Date();
//       if (parseInt(year) === today.getFullYear() && parseInt(m) === (today.getMonth() + 1)) {
//         end.setHours(23, 59, 59, 999);
//       }
//       query.checkInTime = { $gte: start, $lte: end };
//     } else {
//       const today = new Date();
//       const start = new Date(today.getFullYear(), today.getMonth(), 1);
//       const end = new Date(today);
//       end.setHours(23, 59, 59, 999);
//       query.checkInTime = { $gte: start, $lte: end };
//       processedMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
//     }

//     const attendanceRecords = await Attendance.find(query).sort({ checkInTime: -1 });
//     const employees = await Employee.find({});
//     const allShifts = await Shift.find({});
//     const masterShifts = allShifts.filter(s => s.isMasterShift);

//     const summaryMap = {};
//     const processedDates = {};

//     attendanceRecords.forEach((rec) => {
//       if (!rec.employeeId || !rec.checkInTime) return;
//       const employeeId = rec.employeeId;
//       const checkInDate = new Date(rec.checkInTime);
//       const dateKey = checkInDate.toISOString().split("T")[0];

//       const recordMonth = `${checkInDate.getFullYear()}-${String(checkInDate.getMonth() + 1).padStart(2, "0")}`;
//       if (processedMonth && recordMonth !== processedMonth) return;

//       if (checkInDate > new Date()) return;

//       if (!summaryMap[employeeId]) {
//         const emp = employees.find(e => e.employeeId === employeeId) || {};
//         const shiftInfo = getEmployeeShift(employeeId, allShifts, masterShifts);

//         summaryMap[employeeId] = {
//           employeeId,
//           name: emp.name || `Employee ${employeeId}`,
//           month: processedMonth,
//           presentDays: 0,
//           lateDays: 0,
//           onsiteDays: 0,
//           halfDayWorking: 0,
//           fullDayNotWorking: 0,
//           totalWorkingDays: 0,
//           overTimeHours: 0,
//           onsiteYesDays: 0,
//           onsiteNoDays: 0,
//           shiftName: shiftInfo.name,
//           shiftDuration: shiftInfo.duration,
//           shiftStartTime: shiftInfo.startTime,
//           shiftEndTime: shiftInfo.endTime,
//           salaryPerMonth: emp.salaryPerMonth || 0,
//           calculatedSalary: 0,
//           workingDays: 0,
//           reasonCount: { onsite: 0, fieldWork: 0, workFromHome: 0 }
//         };
//         processedDates[employeeId] = new Set();
//       }

//       if (processedDates[employeeId].has(dateKey)) return;
//       processedDates[employeeId].add(dateKey);

//       const empSum = summaryMap[employeeId];

//       let hours = 0;
//       if (rec.totalHours !== undefined) {
//         hours = parseFloat(rec.totalHours);
//       } else if (rec.checkOutTime) {
//         hours = (new Date(rec.checkOutTime) - new Date(rec.checkInTime)) / (1000 * 60 * 60);
//       }

//       // ✅ SHIFT BASED DAY TYPE CALCULATION
//       const type = calculateShiftDayType(hours, empSum.shiftDuration);

//       if (type === "full") {
//         empSum.presentDays += 1;
//         empSum.totalWorkingDays += 1;
//       } else if (type === "half") {
//         empSum.halfDayWorking += 1;
//         empSum.totalWorkingDays += 0.5;
//       } else {
//         empSum.fullDayNotWorking += 1;
//       }

//       // ✅ SHIFT BASED OVERTIME CALCULATION
//       if (empSum.shiftEndTime && rec.checkOutTime) {
//         const ot = calculateShiftOT(rec.checkOutTime, empSum.shiftEndTime, rec.checkInTime);
//         empSum.overTimeHours += ot;
//       }

//       // ✅ SHIFT BASED LATE CHECK CALCULATION
//       if (empSum.shiftStartTime) {
//         const [startH, startM] = empSum.shiftStartTime.split(":").map(Number);
//         const checkInH = checkInDate.getHours();
//         const checkInM = checkInDate.getMinutes();

//         if (checkInH > startH || (checkInH === startH && checkInM > startM)) {
//           empSum.lateDays += 1;
//         }
//       } else {
//         const h = checkInDate.getHours();
//         const m = checkInDate.getMinutes();
//         if (h > 10 || (h === 10 && m > 0)) {
//           empSum.lateDays += 1;
//         }
//       }

//       if (rec.onsite) {
//         empSum.onsiteDays += 1;
//         empSum.onsiteYesDays += 1;
//         empSum.reasonCount.onsite += 1;

//         if (type === "full_leave") {
//           empSum.totalWorkingDays += 1;
//         } else if (type === "half") {
//           empSum.totalWorkingDays += 0.5;
//         }
//       } else {
//         empSum.onsiteNoDays += 1;

//         if (rec.reason === "Work From Home") {
//           empSum.reasonCount.workFromHome += 1;
//         } else if (rec.reason === "Field Work") {
//           empSum.reasonCount.fieldWork += 1;
//         }
//       }
//     });

//     const summaryArray = Object.values(summaryMap);

//     if (summaryArray.length > 0 && processedMonth) {
//       await AttendanceSummary.deleteMany({ month: processedMonth });

//       const summariesToSave = summaryArray.map(s => ({
//         ...s,
//         month: processedMonth,
//         calculatedAt: new Date(),
//         createdAt: new Date()
//       }));

//       await AttendanceSummary.insertMany(summariesToSave);
//     }

//     res.json({
//       success: true,
//       summary: summaryArray,
//       month: processedMonth
//     });

//   } catch (err) {
//     console.error("❌ Error in calculating summary:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// /**
//  * 📌 Get All Attendance Records with Filters
//  */
// exports.getAllAttendance = async (req, res) => {
//   try {
//     const { fromDate, toDate, month, employeeId } = req.query;

//     let query = {};

//     if (fromDate && toDate) {
//       query.checkInTime = {
//         $gte: new Date(fromDate),
//         $lte: new Date(toDate + 'T23:59:59.999Z')
//       };
//     }

//     if (month) {
//       const [year, monthNum] = month.split('-');
//       const startDate = new Date(year, monthNum - 1, 1);
//       const endDate = new Date(year, monthNum, 0, 23, 59, 59, 999);

//       query.checkInTime = {
//         $gte: startDate,
//         $lte: endDate
//       };
//     }

//     if (employeeId) {
//       query.employeeId = employeeId;
//     }

//     const records = await Attendance.find(query)
//       .sort({ checkInTime: -1 })
//       .lean();

//     res.json({
//       success: true,
//       records: records,
//       count: records.length
//     });

//   } catch (error) {
//     console.error('❌ Error fetching attendance:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching attendance records',
//       error: error.message
//     });
//   }
// };

// /**
//  * 📌 Update Attendance Record
//  */
// exports.updateAttendance = async (req, res) => {
//   try {
//     const { attendanceId, hours, region, reason, employeeId, date, checkInTime, checkOutTime, comment } = req.body;

//     console.log('📝 Update request received:', { 
//       attendanceId, 
//       hours, 
//       region, 
//       reason, 
//       employeeId, 
//       date, 
//       checkInTime, 
//       checkOutTime,
//       comment
//     });

//     let updatedRecord;
//     let targetDate;

//     if (attendanceId) {
//       const updateData = {};
//       if (hours !== undefined) updateData.totalHours = parseFloat(hours);
//       if (region !== undefined) updateData.region = region;
//       if (reason !== undefined) updateData.reason = reason;
//       if (comment !== undefined) updateData.comment = comment;

//       if (checkInTime) updateData.checkInTime = new Date(checkInTime);
//       if (checkOutTime) updateData.checkOutTime = new Date(checkOutTime);

//       if (checkInTime && checkOutTime) {
//         const start = new Date(checkInTime);
//         const end = new Date(checkOutTime);
//         const diffMs = end - start;
//         const diffHours = diffMs / (1000 * 60 * 60);
//         updateData.totalHours = parseFloat(diffHours.toFixed(2));
//         updateData.status = "checked-out";
//       }

//       if (updateData.totalHours !== undefined) {
//         const record = await Attendance.findById(attendanceId);
//         if (record) {
//           const allShifts = await Shift.find({});
//           const masterShifts = allShifts.filter(s => s.isMasterShift);
//           const shiftInfo = getEmployeeShift(record.employeeId, allShifts, masterShifts);
//           updateData.dayType = calculateShiftDayType(updateData.totalHours, shiftInfo.duration);
//         }
//       }

//       updatedRecord = await Attendance.findByIdAndUpdate(
//         attendanceId,
//         updateData,
//         { new: true, runValidators: true }
//       );

//       if (!updatedRecord) {
//         return res.status(404).json({
//           success: false,
//           message: 'Attendance record not found'
//         });
//       }

//       targetDate = updatedRecord.checkInTime;
//     }
//     else if (employeeId && date && checkInTime) {
//       if (!checkInTime) {
//         return res.status(400).json({ success: false, message: "Check-in time is required for new record" });
//       }

//       const newCheckIn = new Date(checkInTime);
//       const newCheckOut = checkOutTime ? new Date(checkOutTime) : null;
//       let totalHours = 0;

//       if (newCheckOut) {
//         const diffMs = newCheckOut - newCheckIn;
//         totalHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
//       } else if (hours) {
//         totalHours = parseFloat(hours);
//       }

//       const allShifts = await Shift.find({});
//       const masterShifts = allShifts.filter(s => s.isMasterShift);
//       const shiftInfo = getEmployeeShift(employeeId, allShifts, masterShifts);

//       updatedRecord = await Attendance.create({
//         employeeId,
//         checkInTime: newCheckIn,
//         checkOutTime: newCheckOut,
//         totalHours: totalHours,
//         reason: reason || "Onsite",
//         comment: comment || "Admin created",
//         status: newCheckOut ? "checked-out" : "checked-in",
//         onsite: reason === "Onsite",
//         dayType: calculateShiftDayType(totalHours, shiftInfo.duration)
//       });

//       targetDate = newCheckIn;
//     } else {
//       return res.status(400).json({
//         success: false,
//         message: 'Attendance ID OR (Employee ID + Date + Check-In) is required'
//       });
//     }

//     const d = new Date(targetDate);
//     const monthForSummary = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

//     await AttendanceSummary.deleteMany({ month: monthForSummary });
//     await exports.calculateSummary(
//       { body: { month: monthForSummary } },
//       { json: () => { } }
//     );

//     res.json({
//       success: true,
//       message: 'Attendance record updated successfully',
//       record: updatedRecord
//     });

//   } catch (error) {
//     console.error('❌ Error updating attendance:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error updating attendance record',
//       error: error.message
//     });
//   }
// };

// /**
//  * 📌 Save Attendance Summary
//  */
// exports.saveSummary = async (req, res) => {
//   try {
//     const { summaries, fromDate, toDate, month } = req.body;

//     if (!summaries || !Array.isArray(summaries)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid summary data"
//       });
//     }

//     let deleteQuery = {};
//     if (month) {
//       deleteQuery.month = month;
//     } else if (fromDate && toDate) {
//       deleteQuery.fromDate = fromDate;
//       deleteQuery.toDate = toDate;
//     }

//     if (Object.keys(deleteQuery).length > 0) {
//       await AttendanceSummary.deleteMany(deleteQuery);
//     }

//     const insertData = summaries.map((summary) => ({
//       employeeId: summary.employeeId,
//       name: summary.name,
//       month: summary.month,
//       presentDays: summary.presentDays || 0,
//       lateDays: summary.lateDays || 0,
//       onsiteDays: summary.onsiteDays || 0,
//       halfDayWorking: summary.halfDayWorking || summary.halfDayLeaves || 0,
//       fullDayNotWorking: summary.fullDayNotWorking || summary.fullDayLeaves || 0,
//       totalWorkingDays: summary.totalWorkingDays || 0,
//       fromDate: fromDate || null,
//       toDate: toDate || null,
//       calculatedSalary: summary.calculatedSalary || 0,
//       workingDays: summary.workingDays || 0,
//       overTimeHours: summary.overTimeHours || 0,
//       onsiteYesDays: summary.onsiteYesDays || 0,
//       onsiteNoDays: summary.onsiteNoDays || 0,
//       reasonCount: summary.reasonCount || {
//         onsite: 0,
//         fieldWork: 0,
//         workFromHome: 0
//       },
//       extraWork: summary.extraWork || {
//         extraDays: 0,
//         extraHours: 0,
//         bonus: 0,
//         deductions: 0,
//         reason: ""
//       },
//       createdAt: new Date()
//     }));

//     const result = await AttendanceSummary.insertMany(insertData);

//     res.json({
//       success: true,
//       message: "Summary saved successfully",
//       count: result.length,
//       data: result
//     });

//   } catch (err) {
//     console.error('❌ Error saving summary:', err);
//     res.status(500).json({
//       success: false,
//       message: err.message
//     });
//   }
// };

// /**
//  * 📌 Get Saved Summary
//  */
// exports.getSummary = async (req, res) => {
//   try {
//     const { month, fromDate, toDate, employeeId } = req.query;

//     let filter = {};

//     if (fromDate && toDate) {
//       filter.createdAt = {
//         $gte: new Date(fromDate),
//         $lte: new Date(toDate + "T23:59:59.999Z")
//       };
//     }

//     if (month) {
//       filter.month = month;
//     }

//     if (employeeId) {
//       filter.employeeId = employeeId;
//     }

//     let data = await AttendanceSummary.find(filter).sort({ createdAt: -1 });

//     res.json({
//       success: true,
//       count: data.length,
//       summary: data,
//       note: "Data from DB (Manual edits respected)"
//     });
//   } catch (err) {
//     console.error('❌ Error fetching summary:', err);
//     res.status(500).json({
//       success: false,
//       message: err.message
//     });
//   }
// };

// /**
//  * 📌 Get Employee Details for Specific Employee
//  */
// exports.getEmployeeDetails = async (req, res) => {
//   try {
//     const { employeeId, fromDate, toDate, month } = req.query;

//     if (!employeeId) {
//       return res.status(400).json({
//         success: false,
//         message: 'Employee ID is required'
//       });
//     }

//     let query = { employeeId };

//     if (fromDate && toDate) {
//       query.checkInTime = {
//         $gte: new Date(fromDate),
//         $lte: new Date(toDate + 'T23:59:59.999Z')
//       };
//     }

//     if (month) {
//       const [year, monthNum] = month.split('-');
//       const startDate = new Date(year, monthNum - 1, 1);
//       const endDate = new Date(year, monthNum, 0, 23, 59, 59, 999);

//       query.checkInTime = {
//         $gte: startDate,
//         $lte: endDate
//       };
//     }

//     const details = await Attendance.find(query)
//       .sort({ checkInTime: 1 })
//       .lean();

//     const employee = await Employee.findOne({ employeeId });

//     res.json({
//       success: true,
//       employee: employee || { employeeId, name: 'Unknown' },
//       details: details,
//       count: details.length
//     });

//   } catch (error) {
//     console.error('❌ Error fetching employee details:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching employee details',
//       error: error.message
//     });
//   }
// };

// /**
//  * 📌 Fix Wrong Summary Data
//  */
// exports.fixSummaryData = async (req, res) => {
//   try {
//     const { month } = req.body;

//     if (!month) {
//       return res.status(400).json({
//         success: false,
//         message: "Month is required (e.g., 2025-12)"
//       });
//     }

//     const today = new Date();
//     const currentYear = today.getFullYear();
//     const currentMonth = today.getMonth() + 1;
//     const currentDay = today.getDate();

//     const [year, monthNum] = month.split('-').map(Number);

//     let updateCount = 0;

//     if (year === currentYear && monthNum === currentMonth) {
//       const summaries = await AttendanceSummary.find({ month });

//       for (const summary of summaries) {
//         const correctedPresent = Math.min(summary.presentDays, currentDay);
//         const correctedLate = Math.min(summary.lateDays, currentDay);
//         const correctedOnsite = Math.min(summary.onsiteDays, currentDay);
//         const correctedHalf = Math.min(summary.halfDayWorking, currentDay);
//         const correctedFullLeave = Math.min(summary.fullDayNotWorking, currentDay);
//         const correctedTotal = correctedPresent + (correctedHalf * 0.5);

//         if (summary.presentDays !== correctedPresent ||
//           summary.lateDays !== correctedLate ||
//           summary.totalWorkingDays !== correctedTotal) {

//           await AttendanceSummary.findByIdAndUpdate(
//             summary._id,
//             {
//               presentDays: correctedPresent,
//               lateDays: correctedLate,
//               onsiteDays: correctedOnsite,
//               halfDayWorking: correctedHalf,
//               fullDayNotWorking: correctedFullLeave,
//               totalWorkingDays: correctedTotal
//             }
//           );

//           updateCount++;
//         }
//       }
//     }

//     res.json({
//       success: true,
//       message: `Fixed ${updateCount} summary records for ${month}`,
//       fixedCount: updateCount
//     });

//   } catch (error) {
//     console.error('❌ Error fixing summary:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error fixing summary data',
//       error: error.message
//     });
//   }
// };

// /**
//  * 📌 Get Salaries - WITH SUBIR FIX (15 working days only)
//  */
// exports.getSalaries = async (req, res) => {
//   try {
//     let { month } = req.query;

//     if (!month || month.trim() === "") {
//       const today = new Date();
//       month = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
//     }

//     month = month.trim();

//     const [year, monthNum] = month.split("-").map(Number);

//     if (isNaN(year) || isNaN(monthNum)) {
//       return res.status(400).json({ success: false, message: "Invalid month" });
//     }

//     const start = new Date(year, monthNum - 1, 1);
//     const end = new Date(year, monthNum, 0, 23, 59, 59, 999);
//     const daysInMonth = new Date(year, monthNum, 0).getDate();

//     const employees = await Employee.find({});
//     const attendanceSummaries = await AttendanceSummary.find({ month });

//     const allApprovedLeaves = await Leave.find({
//       status: "approved",
//       $or: [
//         { startDate: { $regex: `^${month}` } },
//         { endDate: { $regex: `^${month}` } }
//       ]
//     });

//     const attendanceMap = {};
//     attendanceSummaries.forEach(a => {
//       attendanceMap[a.employeeId] = a;
//     });

//     const sundaysInMonth = calculateWeekOffsForDay(year, monthNum, 0);

//     const salaryMap = {};

//     employees.forEach(emp => {
//       let weekOffDay = emp.weekOffDay || "Sunday";
//       const dayMap = {
//         Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3,
//         Thursday: 4, Friday: 5, Saturday: 6
//       };
//       const weekOffDayNum = dayMap[weekOffDay] ?? 0;

//       let weekOffs = 0;
//       let weekOffSource = "default";

//       if (emp.weekOffType === '0+2') {
//         weekOffs = 2;
//         weekOffSource = "0+2_fixed";
//       }
//       else if (emp.weekOffType === '0+4') {
//         weekOffs = 4;
//         weekOffSource = "0+4_fixed";
//       }
//       else if (emp.weekOffType === 'manual') {
//         weekOffs = emp.weekOffPerMonth || 4;
//         weekOffSource = "manual";
//       }
//       else if (emp.weekOffPerMonth === 4 && weekOffDay === "Sunday") {
//         weekOffs = sundaysInMonth === 5 ? 5 : 4;
//         weekOffSource = "0+4_sunday_auto";
//       }
//       else if (emp.weekOffPerMonth === 2) {
//         weekOffs = 2;
//         weekOffSource = "0+2_fixed_no_increment";
//       }
//       else if (typeof emp.weekOffPerMonth === "number") {
//         weekOffs = emp.weekOffPerMonth;
//         weekOffSource = "fixed_from_db";
//       }
//       else {
//         weekOffs = calculateWeekOffsForDay(year, monthNum, weekOffDayNum);
//         weekOffSource = "dynamic";
//       }

//       const empAttendance = attendanceMap[emp.employeeId];
//       const presentDays = empAttendance?.presentDays || 0;
//       const halfDays = empAttendance?.halfDayWorking || 0;
//       let effectiveWorkingDays = presentDays + (halfDays * 0.5);

//       // ✅ SUBIR FIX: Maximum 15 working days per month
//       if (emp.employeeId === 'EMP020' && effectiveWorkingDays > 15) {
//         console.log(`⚠️ Subir working days capped: ${effectiveWorkingDays} → 15`);
//         effectiveWorkingDays = 15;
//       }

//       const salaryPerMonth = emp.salaryPerMonth || 0;
//       const dailyRate = salaryPerMonth / daysInMonth;

//       const empLeaves = allApprovedLeaves.filter(l => l.employeeId === emp.employeeId);

//       let paidLeaveDays = 0;
//       empLeaves.forEach(leave => {
//         const leaveStart = new Date(leave.startDate);
//         const leaveEnd = new Date(leave.endDate);

//         const overlapStart = new Date(Math.max(leaveStart, start));
//         const overlapEnd = new Date(Math.min(leaveEnd, end));

//         if (overlapStart <= overlapEnd) {
//           const diffTime = Math.abs(overlapEnd - overlapStart);
//           const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

//           if (["CL", "EL", "COFF", "Casual Leave", "Earned Leave", "Comp Off"].includes(leave.leaveType)) {
//             paidLeaveDays += diffDays;
//           }
//         }
//       });

//       const paidDays = effectiveWorkingDays + weekOffs + paidLeaveDays;

//       const storedExtraWork = empAttendance?.extraWork || {
//         extraDays: 0,
//         extraHours: 0,
//         bonus: 0,
//         deductions: 0,
//         reason: ""
//       };

//       let calculatedSalary = Math.round(paidDays * dailyRate);

//       if (storedExtraWork) {
//         const extraDaysAmount = (storedExtraWork.extraDays || 0) * dailyRate;
//         const bonus = storedExtraWork.bonus || 0;
//         const deductions = storedExtraWork.deductions || 0;

//         calculatedSalary = Math.round(calculatedSalary + extraDaysAmount + bonus - deductions);
//       }

//       if (empAttendance?.calculatedSalary) {
//         calculatedSalary = empAttendance.calculatedSalary;
//       }

//       salaryMap[emp.employeeId] = {
//         employeeId: emp.employeeId,
//         name: emp.name,
//         month,
//         presentDays,
//         extraWork: storedExtraWork,
//         halfDayWorking: halfDays,
//         totalWorkingDays: effectiveWorkingDays,
//         weekOffs,
//         weekOffDay,
//         weekOffType: emp.weekOffType || (emp.weekOffPerMonth === 2 ? '0+2' : '0+4'),
//         weekOffSource,
//         salaryPerMonth,
//         salaryPerDay: Number(dailyRate.toFixed(2)),
//         paidDays,
//         calculatedSalary,
//         calculatedSalaryDisplay: `₹${calculatedSalary}`,
//         monthDays: daysInMonth,
//         // ✅ Subir specific note
//         note: emp.employeeId === 'SUB001' ? 'Capped at 15 working days (3 days/week)' : undefined
//       };
//     });

//     res.json({
//       success: true,
//       month,
//       salaries: Object.values(salaryMap),
//       count: Object.values(salaryMap).length,
//       monthDays: daysInMonth,
//       note: "0+2: 2 days | 0+4: 4 days | Manual: user defined | Subir: 15 days max"
//     });

//   } catch (error) {
//     console.error("❌ Error in getSalaries:", error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// /**
//  * 📌 Update Employee WeekOff Configuration
//  */
// exports.updateWeekOffConfig = async (req, res) => {
//   try {
//     const { employeeId, weekOffDay, weekOffPerMonth, weekOffType } = req.body;

//     if (!employeeId || !weekOffDay) {
//       return res.status(400).json({
//         success: false,
//         message: "Employee ID and WeekOff Day are required"
//       });
//     }

//     const dayMap = {
//       'Sunday': 0,
//       'Monday': 1,
//       'Tuesday': 2,
//       'Wednesday': 3,
//       'Thursday': 4,
//       'Friday': 5,
//       'Saturday': 6
//     };

//     if (!dayMap.hasOwnProperty(weekOffDay)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid weekoff day. Use: Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday"
//       });
//     }

//     const updateData = {
//       weekOffDay
//     };

//     if (weekOffType === '0+2') {
//       updateData.weekOffPerMonth = 2;
//       updateData.weekOffType = '0+2';
//     }
//     else if (weekOffType === '0+4') {
//       updateData.weekOffPerMonth = 4;
//       updateData.weekOffType = '0+4';
//     }
//     else if (weekOffType === 'manual') {
//       if (typeof weekOffPerMonth === "number" && weekOffPerMonth > 0) {
//         updateData.weekOffPerMonth = weekOffPerMonth;
//         updateData.weekOffType = 'manual';
//       } else {
//         updateData.weekOffPerMonth = 4;
//         updateData.weekOffType = '0+4';
//       }
//     }
//     else if (typeof weekOffPerMonth === "number" && weekOffPerMonth > 0) {
//       updateData.weekOffPerMonth = weekOffPerMonth;
//       updateData.weekOffType = weekOffPerMonth === 2 ? '0+2' : '0+4';
//     }
//     else {
//       updateData.weekOffPerMonth = 4;
//       updateData.weekOffType = '0+4';
//     }

//     EMPLOYEE_WEEKOFF_MAP[employeeId] = {
//       weekOffDay: weekOffDay,
//       dayNum: dayMap[weekOffDay],
//       weekOffPerMonth: updateData.weekOffPerMonth,
//       weekOffType: updateData.weekOffType
//     };

//     const updatedEmp = await Employee.findOneAndUpdate(
//       { employeeId },
//       updateData,
//       { new: true }
//     );

//     if (!updatedEmp) {
//       return res.status(404).json({
//         success: false,
//         message: "Employee not found"
//       });
//     }

//     res.json({
//       success: true,
//       message: `WeekOff updated for ${employeeId}`,
//       config: EMPLOYEE_WEEKOFF_MAP[employeeId],
//       updatedEmp: updatedEmp
//     });

//   } catch (error) {
//     console.error('❌ Error updating weekoff config:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error updating weekoff configuration',
//       error: error.message
//     });
//   }
// };

// /**
//  * 📌 Get WeekOff Configurations
//  */
// exports.getWeekOffConfig = async (req, res) => {
//   try {
//     res.json({
//       success: true,
//       config: EMPLOYEE_WEEKOFF_MAP,
//       count: Object.keys(EMPLOYEE_WEEKOFF_MAP).length,
//       note: "Current employee weekoff configuration"
//     });
//   } catch (error) {
//     console.error('❌ Error getting weekoff config:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching weekoff configuration',
//       error: error.message
//     });
//   }
// };

// /**
//  * 📌 Check Month Data - Diagnostic Function
//  */
// exports.checkMonthData = async (req, res) => {
//   try {
//     const { month1, month2 } = req.query;

//     const summaries1 = await AttendanceSummary.find({ month: month1 });
//     const summaries2 = await AttendanceSummary.find({ month: month2 });

//     const [year1, monthNum1] = month1.split("-").map(Number);
//     const start1 = new Date(year1, monthNum1 - 1, 1);
//     const end1 = new Date(year1, monthNum1, 0, 23, 59, 59, 999);

//     const [year2, monthNum2] = month2.split("-").map(Number);
//     const start2 = new Date(year2, monthNum2 - 1, 1);
//     const end2 = new Date(year2, monthNum2, 0, 23, 59, 59, 999);

//     const leaves1 = await Leave.find({
//       status: 'approved',
//       $or: [
//         { startDate: { $gte: start1, $lte: end1 } },
//         { endDate: { $gte: start1, $lte: end1 } },
//         {
//           $and: [
//             { startDate: { $lte: start1 } },
//             { endDate: { $gte: end1 } }
//           ]
//         }
//       ]
//     });

//     const leaves2 = await Leave.find({
//       status: 'approved',
//       $or: [
//         { startDate: { $gte: start2, $lte: end2 } },
//         { endDate: { $gte: start2, $lte: end2 } },
//         {
//           $and: [
//             { startDate: { $lte: start2 } },
//             { endDate: { $gte: end2 } }
//           ]
//         }
//       ]
//     });

//     const employees = await Employee.find({});
//     const crossMonthEmployees = [];

//     employees.forEach(emp => {
//       const inMonth1 = summaries1.find(s => s.employeeId === emp.employeeId);
//       const inMonth2 = summaries2.find(s => s.employeeId === emp.employeeId);
//       const leavesIn1 = leaves1.filter(l => l.employeeId === emp.employeeId);
//       const leavesIn2 = leaves2.filter(l => l.employeeId === emp.employeeId);

//       if (inMonth1 && inMonth2) {
//         crossMonthEmployees.push({
//           employeeId: emp.employeeId,
//           name: emp.name,
//           [month1]: {
//             presentDays: inMonth1.presentDays,
//             totalWorkingDays: inMonth1.totalWorkingDays,
//             leaves: leavesIn1.length
//           },
//           [month2]: {
//             presentDays: inMonth2.presentDays,
//             totalWorkingDays: inMonth2.totalWorkingDays,
//             leaves: leavesIn2.length
//           }
//         });
//       }
//     });

//     res.json({
//       success: true,
//       months: { month1, month2 },
//       summaries: {
//         [month1]: summaries1.length,
//         [month2]: summaries2.length
//       },
//       leaves: {
//         [month1]: leaves1.length,
//         [month2]: leaves2.length
//       },
//       crossMonthEmployees: crossMonthEmployees.length > 0 ? crossMonthEmployees : "No cross-month data found",
//       note: "This is diagnostic only - no data changed"
//     });

//   } catch (error) {
//     console.error('❌ Check error:', error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// /**
//  * 📌 Update Attendance Record (Dynamic Update)
//  */
// exports.updateAttendanceDynamic = async (req, res) => {
//   try {
//     const { attendanceId, hours, region, reason, comment } = req.body;

//     if (!attendanceId) return res.status(400).json({ success: false, message: "ID required" });

//     const updateData = {};
//     if (hours !== undefined) updateData.totalHours = parseFloat(hours);
//     if (region !== undefined) updateData.region = region;
//     if (reason !== undefined) updateData.reason = reason;
//     if (comment !== undefined) updateData.comment = comment;

//     if (hours !== undefined) {
//       const record = await Attendance.findById(attendanceId);
//       if (record) {
//         const allShifts = await Shift.find({});
//         const masterShifts = allShifts.filter(s => s.isMasterShift);
//         const shiftInfo = getEmployeeShift(record.employeeId, allShifts, masterShifts);

//         updateData.dayType = calculateShiftDayType(parseFloat(hours), shiftInfo.duration);
//       }
//     }

//     const updatedRecord = await Attendance.findByIdAndUpdate(attendanceId, updateData, { new: true });

//     res.json({
//       success: true,
//       message: "Updated successfully",
//       record: updatedRecord
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// /**
//  * 📌 Update Payroll Detail
//  */
// exports.updatePayrollDetails = async (req, res) => {
//   try {
//     const { employeeId, month, calculatedSalary, extraWork, presentDays, workingDays, halfDayWorking, fullDayNotWorking, weekOffDays, holidays } = req.body;

//     if (!employeeId || !month) {
//       return res.status(400).json({
//         success: false,
//         message: "Employee ID and Month are required"
//       });
//     }

//     const summaries = await AttendanceSummary.find({ employeeId, month });
//     let summary;

//     if (summaries.length === 0) {
//       summary = new AttendanceSummary({
//         employeeId,
//         month,
//         presentDays: presentDays || 0,
//         totalWorkingDays: workingDays || 0,
//         calculatedSalary: calculatedSalary || 0
//       });
//     } else if (summaries.length === 1) {
//       summary = summaries[0];
//     } else {
//       summaries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
//       summary = summaries[0];
//       const idsToDelete = summaries.slice(1).map(s => s._id);
//       await AttendanceSummary.deleteMany({ _id: { $in: idsToDelete } });
//     }

//     if (calculatedSalary !== undefined) summary.calculatedSalary = calculatedSalary;
//     if (extraWork) {
//       summary.extraWork = extraWork;
//     }

//     if (presentDays !== undefined) summary.presentDays = presentDays;
//     if (workingDays !== undefined) summary.workingDays = workingDays;
//     if (workingDays !== undefined) summary.totalWorkingDays = workingDays;
//     if (halfDayWorking !== undefined) summary.halfDayWorking = halfDayWorking;
//     if (fullDayNotWorking !== undefined) summary.fullDayNotWorking = fullDayNotWorking;
//     if (weekOffDays !== undefined) summary.weekOffDays = weekOffDays;
//     if (holidays !== undefined) summary.holidays = holidays;

//     const savedSummary = await summary.save();

//     res.json({
//       success: true,
//       message: "Payroll details updated successfully",
//       summary: savedSummary
//     });

//   } catch (error) {
//     console.error("❌ Error updating payroll:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error updating payroll details",
//       error: error.message
//     });
//   }
// };


const Attendance = require("../models/Attendance");
const AttendanceSummary = require("../models/AttendanceSummary");
const Employee = require("../models/Employee");
const Leave = require("../models/Leave");
const Shift = require("../models/Shift");

// ✅ EMPLOYEE WEEKOFF MAPPING
const EMPLOYEE_WEEKOFF_MAP = {
  'EMP001': { weekOffDay: 'Sunday', dayNum: 0, weekOffType: '0+4', weekOffPerMonth: 4 },
  'EMP002': { weekOffDay: 'Sunday', dayNum: 0, weekOffType: '0+4', weekOffPerMonth: 4 },
  'EMP003': { weekOffDay: 'Sunday', dayNum: 0, weekOffType: '0+4', weekOffPerMonth: 4 },
  'EMP004': { weekOffDay: 'Sunday', dayNum: 0, weekOffType: '0+4', weekOffPerMonth: 4 },
  'EMP005': { weekOffDay: 'Sunday', dayNum: 0, weekOffType: '0+4', weekOffPerMonth: 4 },
  'EMP008': { weekOffDay: 'Sunday', dayNum: 0, weekOffType: '0+4', weekOffPerMonth: 4 },
  'EMP006': { weekOffDay: 'Tuesday', dayNum: 2, weekOffType: '0+2', weekOffPerMonth: 2 },
  'EMP007': { weekOffDay: 'Friday', dayNum: 5, weekOffType: '0+4', weekOffPerMonth: 4 },
  // ✅ Subir (EMP020) - 3 working days per week, 3 hour shift
  'EMP020': { 
    weekOffDay: 'Sunday', 
    dayNum: 0, 
    weekOffType: '0+4', 
    weekOffPerMonth: 4, 
    workingDaysPerWeek: 3,
    maxWorkingDaysPerMonth: 15
  }
};

// ✅ HELPER FUNCTION: Calculate dynamic weekoffs for specific day
const calculateWeekOffsForDay = (year, month, targetDay) => {
  const monthIndex = month - 1;
  const daysInMonth = new Date(year, month, 0).getDate();

  let count = 0;
  for (let day = 1; day <= daysInMonth; day++) {
    const currentDate = new Date(year, monthIndex, day);
    if (currentDate.getDay() === targetDay) {
      count++;
    }
  }
  return count;
};

// ============================================================================
// 🚀 DYNAMIC SHIFT LOGIC IMPLEMENTATION
// ============================================================================

/**
 * 🛠️ Helper: Get Default Shift Time
 */
const getDefaultShiftTime = (shiftType) => {
  switch (shiftType) {
    case "Morning": return { start: "06:00", end: "15:00" };
    case "Evening": return { start: "14:00", end: "23:00" };
    case "Night": return { start: "22:00", end: "07:00" };
    case "General": return { start: "10:00", end: "19:00" };
    default: return { start: "10:00", end: "19:00" };
  }
};

/**
 * 🛠️ Helper: Get Employee Shift
 */
const getEmployeeShift = (employeeId, shiftsData, masterShifts) => {
  if (!shiftsData || !masterShifts) return null;

  let assignedShift = shiftsData.find(
    (s) =>
      s.employeeAssignment &&
      (s.employeeAssignment.employeeId === employeeId || s.employeeAssignment.employeeId === String(employeeId))
  );

  let startTime = "10:00";
  let endTime = "19:00";
  let shiftName = "General";
  let shiftType = "General";
  let duration = 9;

  if (assignedShift && assignedShift.employeeAssignment) {
    shiftName = assignedShift.shiftName;
    shiftType = assignedShift.shiftType;

    const empAssign = assignedShift.employeeAssignment;

    if (empAssign.startTime && empAssign.endTime) {
      startTime = empAssign.startTime;
      endTime = empAssign.endTime;
    } else if (empAssign.selectedTimeRange) {
      const parts = empAssign.selectedTimeRange.split("-").map(p => p.trim());
      if (parts.length === 2) {
        startTime = parts[0];
        endTime = parts[1];
      }
    }
  }

  // Calculate Duration
  if (startTime && endTime) {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    if (end < start) end.setDate(end.getDate() + 1);

    const diff = (end - start) / (1000 * 60 * 60);
    duration = Number(diff.toFixed(2));
  }

  return {
    name: shiftName,
    type: shiftType,
    startTime: startTime,
    endTime: endTime,
    duration: duration
  };
};

/**
 * ✅ FIXED: Calculate Day Type Based on Shift Duration
 * - Short shifts (3-6 hours): 
 *   - Full Day: 90%+ of shift hours (2.7+ hrs for 3hr shift)
 *   - Half Day: 50%+ of shift hours (1.5+ hrs for 3hr shift)
 *   - Leave: < 50% of shift hours
 * - Standard shifts (7-12 hours):
 *   - Full Day: 8.8+ hours
 *   - Half Day: 4.5-8.79 hours
 *   - Leave: < 4.5 hours
 */
const calculateShiftDayType = (hours, shiftDuration) => {
  const h = parseFloat(hours) || 0;

  // 🟢 SHORT SHIFTS (3 - 6 Hours) - EMP020 ka shift 3 hours hai
  if (shiftDuration >= 3 && shiftDuration <= 6) {
    if (h >= shiftDuration * 0.9) return "full";        // 2.7+ hours for 3hr shift = Full Day
    if (h >= shiftDuration * 0.5) return "half";        // 1.5+ hours for 3hr shift = Half Day
    return "full_leave";                                // < 1.5 hours = Leave
  }
  
  // 🟣 STANDARD SHIFTS (7 - 12 Hours)
  else {
    if (h >= 8.8) return "full";
    if (h >= 4.5) return "half";
    return "full_leave";
  }
};

/**
 * ✅ FIXED: Calculate Overtime
 * - OT = Actual hours worked - Shift duration (only if positive)
 */
const calculateShiftOT = (checkOutTime, shiftEndTimeStr, checkInTime, actualHours, shiftDuration) => {
  // Method 1: If we have actual hours and shift duration, simple subtraction
  if (actualHours && shiftDuration) {
    const ot = Math.max(parseFloat(actualHours) - parseFloat(shiftDuration), 0);
    return Number(ot.toFixed(2));
  }
  
  // Method 2: If we have checkout time and shift end time
  if (!checkOutTime || !shiftEndTimeStr) return 0;

  const checkOut = new Date(checkOutTime);
  const checkIn = new Date(checkInTime);

  const [endH, endM] = shiftEndTimeStr.split(":").map(Number);

  let shiftEnd = new Date(checkIn);
  shiftEnd.setHours(endH, endM, 0, 0);

  // Handle night shifts
  if (checkIn.getHours() > 12 && endH < 12) {
    shiftEnd.setDate(shiftEnd.getDate() + 1);
  }

  const diffMs = checkOut - shiftEnd;
  if (diffMs > 0) {
    return Number((diffMs / (1000 * 60 * 60)).toFixed(2));
  }

  return 0;
};

/**
 * 📌 Get All Attendance Records with Filters
 */
exports.getAllAttendance = async (req, res) => {
  try {
    const { fromDate, toDate, month, employeeId } = req.query;

    let query = {};

    if (fromDate && toDate) {
      query.checkInTime = {
        $gte: new Date(fromDate),
        $lte: new Date(toDate + 'T23:59:59.999Z')
      };
    }

    if (month) {
      const [year, monthNum] = month.split('-');
      const startDate = new Date(year, monthNum - 1, 1);
      const endDate = new Date(year, monthNum, 0, 23, 59, 59, 999);

      query.checkInTime = {
        $gte: startDate,
        $lte: endDate
      };
    }

    if (employeeId) {
      query.employeeId = employeeId;
    }

    const records = await Attendance.find(query)
      .sort({ checkInTime: -1 })
      .lean();

    res.json({
      success: true,
      records: records,
      count: records.length
    });

  } catch (error) {
    console.error('❌ Error fetching attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching attendance records',
      error: error.message
    });
  }
};

/**
 * 📌 Update Attendance Record
 */
exports.updateAttendance = async (req, res) => {
  try {
    const { attendanceId, hours, region, reason, employeeId, date, checkInTime, checkOutTime, comment } = req.body;

    console.log('📝 Update request received:', { 
      attendanceId, 
      hours, 
      region, 
      reason, 
      employeeId, 
      date, 
      checkInTime, 
      checkOutTime,
      comment
    });

    let updatedRecord;
    let targetDate;

    // ✅ CASE 1: Update Existing Record
    if (attendanceId) {
      const updateData = {};
      if (hours !== undefined) updateData.totalHours = parseFloat(hours);
      if (region !== undefined) updateData.region = region;
      if (reason !== undefined) updateData.reason = reason;
      if (comment !== undefined) updateData.comment = comment;

      if (checkInTime) updateData.checkInTime = new Date(checkInTime);
      if (checkOutTime) updateData.checkOutTime = new Date(checkOutTime);

      if (checkInTime && checkOutTime) {
        const start = new Date(checkInTime);
        const end = new Date(checkOutTime);
        const diffMs = end - start;
        const diffHours = diffMs / (1000 * 60 * 60);
        updateData.totalHours = parseFloat(diffHours.toFixed(2));
        updateData.status = "checked-out";
      }

      // ✅ Recalculate day type based on shift
      if (updateData.totalHours !== undefined) {
        const record = await Attendance.findById(attendanceId);
        if (record) {
          const allShifts = await Shift.find({});
          const masterShifts = allShifts.filter(s => s.isMasterShift);
          const shiftInfo = getEmployeeShift(record.employeeId, allShifts, masterShifts);
          updateData.dayType = calculateShiftDayType(updateData.totalHours, shiftInfo.duration);
        }
      }

      updatedRecord = await Attendance.findByIdAndUpdate(
        attendanceId,
        updateData,
        { new: true, runValidators: true }
      );

      if (!updatedRecord) {
        return res.status(404).json({
          success: false,
          message: 'Attendance record not found'
        });
      }

      targetDate = updatedRecord.checkInTime;
    }
    // ✅ CASE 2: Create New Record
    else if (employeeId && date && checkInTime) {
      if (!checkInTime) {
        return res.status(400).json({ success: false, message: "Check-in time is required for new record" });
      }

      const newCheckIn = new Date(checkInTime);
      const newCheckOut = checkOutTime ? new Date(checkOutTime) : null;
      let totalHours = 0;

      if (newCheckOut) {
        const diffMs = newCheckOut - newCheckIn;
        totalHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
      } else if (hours) {
        totalHours = parseFloat(hours);
      }

      // ✅ Get shift info for day type calculation
      const allShifts = await Shift.find({});
      const masterShifts = allShifts.filter(s => s.isMasterShift);
      const shiftInfo = getEmployeeShift(employeeId, allShifts, masterShifts);

      updatedRecord = await Attendance.create({
        employeeId,
        checkInTime: newCheckIn,
        checkOutTime: newCheckOut,
        totalHours: totalHours,
        reason: reason || "Onsite",
        comment: comment || "Admin created",
        status: newCheckOut ? "checked-out" : "checked-in",
        onsite: reason === "Onsite",
        dayType: calculateShiftDayType(totalHours, shiftInfo.duration)
      });

      targetDate = newCheckIn;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Attendance ID OR (Employee ID + Date + Check-In) is required'
      });
    }

    console.log('✅ Attendance record saved. Comment:', updatedRecord.comment);

    // 🔥 AUTO RECALCULATE SUMMARY
    const d = new Date(targetDate);
    const monthForSummary = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

    await AttendanceSummary.deleteMany({ month: monthForSummary });
    await exports.calculateSummary(
      { body: { month: monthForSummary } },
      { json: () => { } }
    );

    res.json({
      success: true,
      message: 'Attendance record updated successfully',
      record: updatedRecord
    });

  } catch (error) {
    console.error('❌ Error updating attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating attendance record',
      error: error.message
    });
  }
};

/**
 * 📌 Calculate Summary from Raw Data (DYNAMIC VERSION - SHIFT BASED)
 */
exports.calculateSummary = async (req, res) => {
  try {
    const { fromDate, toDate, month } = req.body;

    let query = {};
    let processedMonth = month;

    if (fromDate && toDate) {
      query.checkInTime = {
        $gte: new Date(fromDate),
        $lte: new Date(toDate + "T23:59:59.999Z")
      };
      if (!month) {
        const d = new Date(fromDate);
        processedMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      }
    } else if (month) {
      const [year, m] = month.split("-");
      const start = new Date(year, m - 1, 1);
      const end = new Date(year, m, 0, 23, 59, 59, 999);

      const today = new Date();
      if (parseInt(year) === today.getFullYear() && parseInt(m) === (today.getMonth() + 1)) {
        end.setHours(23, 59, 59, 999);
      }
      query.checkInTime = { $gte: start, $lte: end };
    } else {
      const today = new Date();
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end = new Date(today);
      end.setHours(23, 59, 59, 999);
      query.checkInTime = { $gte: start, $lte: end };
      processedMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
    }

    const attendanceRecords = await Attendance.find(query).sort({ checkInTime: -1 });
    const employees = await Employee.find({});
    const allShifts = await Shift.find({});
    const masterShifts = allShifts.filter(s => s.isMasterShift);

    const summaryMap = {};
    const processedDates = {};

    attendanceRecords.forEach((rec) => {
      if (!rec.employeeId || !rec.checkInTime) return;
      const employeeId = rec.employeeId;
      const checkInDate = new Date(rec.checkInTime);
      const dateKey = checkInDate.toISOString().split("T")[0];

      const recordMonth = `${checkInDate.getFullYear()}-${String(checkInDate.getMonth() + 1).padStart(2, "0")}`;
      if (processedMonth && recordMonth !== processedMonth) return;

      if (checkInDate > new Date()) return;

      if (!summaryMap[employeeId]) {
        const emp = employees.find(e => e.employeeId === employeeId) || {};
        const shiftInfo = getEmployeeShift(employeeId, allShifts, masterShifts);

        summaryMap[employeeId] = {
          employeeId,
          name: emp.name || `Employee ${employeeId}`,
          month: processedMonth,
          presentDays: 0,
          lateDays: 0,
          onsiteDays: 0,
          halfDayWorking: 0,
          fullDayNotWorking: 0,
          totalWorkingDays: 0,
          overTimeHours: 0,
          onsiteYesDays: 0,
          onsiteNoDays: 0,
          shiftName: shiftInfo.name,
          shiftDuration: shiftInfo.duration,
          shiftStartTime: shiftInfo.startTime,
          shiftEndTime: shiftInfo.endTime,
          salaryPerMonth: emp.salaryPerMonth || 0,
          calculatedSalary: 0,
          workingDays: 0,
          reasonCount: { onsite: 0, fieldWork: 0, workFromHome: 0 }
        };
        processedDates[employeeId] = new Set();
      }

      if (processedDates[employeeId].has(dateKey)) return;
      processedDates[employeeId].add(dateKey);

      const empSum = summaryMap[employeeId];

      let hours = 0;
      if (rec.totalHours !== undefined) {
        hours = parseFloat(rec.totalHours);
      } else if (rec.checkOutTime) {
        hours = (new Date(rec.checkOutTime) - new Date(rec.checkInTime)) / (1000 * 60 * 60);
      }

      // ✅ SHIFT BASED DAY TYPE CALCULATION
      const type = calculateShiftDayType(hours, empSum.shiftDuration);

      if (type === "full") {
        empSum.presentDays += 1;
        empSum.totalWorkingDays += 1;
      } else if (type === "half") {
        empSum.halfDayWorking += 1;
        empSum.totalWorkingDays += 0.5;
      } else {
        empSum.fullDayNotWorking += 1;
      }

      // ✅ SHIFT BASED OVERTIME CALCULATION
      const ot = calculateShiftOT(
        rec.checkOutTime, 
        empSum.shiftEndTime, 
        rec.checkInTime, 
        hours,
        empSum.shiftDuration
      );
      empSum.overTimeHours += ot;

      // ✅ SHIFT BASED LATE CHECK CALCULATION
      if (empSum.shiftStartTime) {
        const [startH, startM] = empSum.shiftStartTime.split(":").map(Number);
        const checkInH = checkInDate.getHours();
        const checkInM = checkInDate.getMinutes();

        // Add grace period of 5 minutes
        if (checkInH > startH || (checkInH === startH && checkInM > startM + 5)) {
          empSum.lateDays += 1;
        }
      } else {
        const h = checkInDate.getHours();
        const m = checkInDate.getMinutes();
        if (h > 10 || (h === 10 && m > 5)) {
          empSum.lateDays += 1;
        }
      }

      if (rec.onsite) {
        empSum.onsiteDays += 1;
        empSum.onsiteYesDays += 1;
        empSum.reasonCount.onsite += 1;
      } else {
        empSum.onsiteNoDays += 1;

        if (rec.reason === "Work From Home") {
          empSum.reasonCount.workFromHome += 1;
        } else if (rec.reason === "Field Work") {
          empSum.reasonCount.fieldWork += 1;
        }
      }
    });

    const summaryArray = Object.values(summaryMap);

    if (summaryArray.length > 0 && processedMonth) {
      await AttendanceSummary.deleteMany({ month: processedMonth });

      const summariesToSave = summaryArray.map(s => ({
        ...s,
        month: processedMonth,
        calculatedAt: new Date(),
        createdAt: new Date()
      }));

      await AttendanceSummary.insertMany(summariesToSave);
    }

    res.json({
      success: true,
      summary: summaryArray,
      month: processedMonth
    });

  } catch (err) {
    console.error("❌ Error in calculating summary:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * 📌 Save Attendance Summary
 */
exports.saveSummary = async (req, res) => {
  try {
    const { summaries, fromDate, toDate, month } = req.body;

    if (!summaries || !Array.isArray(summaries)) {
      return res.status(400).json({
        success: false,
        message: "Invalid summary data"
      });
    }

    let deleteQuery = {};
    if (month) {
      deleteQuery.month = month;
    } else if (fromDate && toDate) {
      deleteQuery.fromDate = fromDate;
      deleteQuery.toDate = toDate;
    }

    if (Object.keys(deleteQuery).length > 0) {
      await AttendanceSummary.deleteMany(deleteQuery);
    }

    const insertData = summaries.map((summary) => ({
      employeeId: summary.employeeId,
      name: summary.name,
      month: summary.month,
      presentDays: summary.presentDays || 0,
      lateDays: summary.lateDays || 0,
      onsiteDays: summary.onsiteDays || 0,
      halfDayWorking: summary.halfDayWorking || summary.halfDayLeaves || 0,
      fullDayNotWorking: summary.fullDayNotWorking || summary.fullDayLeaves || 0,
      totalWorkingDays: summary.totalWorkingDays || 0,
      fromDate: fromDate || null,
      toDate: toDate || null,
      calculatedSalary: summary.calculatedSalary || 0,
      workingDays: summary.workingDays || 0,
      overTimeHours: summary.overTimeHours || 0,
      onsiteYesDays: summary.onsiteYesDays || 0,
      onsiteNoDays: summary.onsiteNoDays || 0,
      reasonCount: summary.reasonCount || {
        onsite: 0,
        fieldWork: 0,
        workFromHome: 0
      },
      extraWork: summary.extraWork || {
        extraDays: 0,
        extraHours: 0,
        bonus: 0,
        deductions: 0,
        reason: ""
      },
      createdAt: new Date()
    }));

    const result = await AttendanceSummary.insertMany(insertData);

    res.json({
      success: true,
      message: "Summary saved successfully",
      count: result.length,
      data: result
    });

  } catch (err) {
    console.error('❌ Error saving summary:', err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

/**
 * 📌 Get Saved Summary
 */
exports.getSummary = async (req, res) => {
  try {
    const { month, fromDate, toDate, employeeId } = req.query;

    let filter = {};

    if (fromDate && toDate) {
      filter.createdAt = {
        $gte: new Date(fromDate),
        $lte: new Date(toDate + "T23:59:59.999Z")
      };
    }

    if (month) {
      filter.month = month;
    }

    if (employeeId) {
      filter.employeeId = employeeId;
    }

    let data = await AttendanceSummary.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: data.length,
      summary: data,
      note: "Data from DB (Manual edits respected)"
    });
  } catch (err) {
    console.error('❌ Error fetching summary:', err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

/**
 * 📌 Get Employee Details for Specific Employee
 */
exports.getEmployeeDetails = async (req, res) => {
  try {
    const { employeeId, fromDate, toDate, month } = req.query;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID is required'
      });
    }

    let query = { employeeId };

    if (fromDate && toDate) {
      query.checkInTime = {
        $gte: new Date(fromDate),
        $lte: new Date(toDate + 'T23:59:59.999Z')
      };
    }

    if (month) {
      const [year, monthNum] = month.split('-');
      const startDate = new Date(year, monthNum - 1, 1);
      const endDate = new Date(year, monthNum, 0, 23, 59, 59, 999);

      query.checkInTime = {
        $gte: startDate,
        $lte: endDate
      };
    }

    const details = await Attendance.find(query)
      .sort({ checkInTime: 1 })
      .lean();

    const employee = await Employee.findOne({ employeeId });

    res.json({
      success: true,
      employee: employee || { employeeId, name: 'Unknown' },
      details: details,
      count: details.length
    });

  } catch (error) {
    console.error('❌ Error fetching employee details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching employee details',
      error: error.message
    });
  }
};

/**
 * 📌 Fix Wrong Summary Data
 */
exports.fixSummaryData = async (req, res) => {
  try {
    const { month } = req.body;

    if (!month) {
      return res.status(400).json({
        success: false,
        message: "Month is required (e.g., 2025-12)"
      });
    }

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();

    const [year, monthNum] = month.split('-').map(Number);

    let updateCount = 0;

    if (year === currentYear && monthNum === currentMonth) {
      const summaries = await AttendanceSummary.find({ month });

      for (const summary of summaries) {
        const correctedPresent = Math.min(summary.presentDays, currentDay);
        const correctedLate = Math.min(summary.lateDays, currentDay);
        const correctedOnsite = Math.min(summary.onsiteDays, currentDay);
        const correctedHalf = Math.min(summary.halfDayWorking, currentDay);
        const correctedFullLeave = Math.min(summary.fullDayNotWorking, currentDay);
        const correctedTotal = correctedPresent + (correctedHalf * 0.5);

        if (summary.presentDays !== correctedPresent ||
          summary.lateDays !== correctedLate ||
          summary.totalWorkingDays !== correctedTotal) {

          await AttendanceSummary.findByIdAndUpdate(
            summary._id,
            {
              presentDays: correctedPresent,
              lateDays: correctedLate,
              onsiteDays: correctedOnsite,
              halfDayWorking: correctedHalf,
              fullDayNotWorking: correctedFullLeave,
              totalWorkingDays: correctedTotal
            }
          );

          updateCount++;
        }
      }
    }

    res.json({
      success: true,
      message: `Fixed ${updateCount} summary records for ${month}`,
      fixedCount: updateCount
    });

  } catch (error) {
    console.error('❌ Error fixing summary:', error);
    res.status(500).json({
      success: false,
      message: 'Error fixing summary data',
      error: error.message
    });
  }
};

/**
 * 📌 Get Salaries - WITH SUBIR FIX (15 working days max)
 */
// exports.getSalaries = async (req, res) => {
//   try {
//     let { month } = req.query;

//     if (!month || month.trim() === "") {
//       const today = new Date();
//       month = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
//     }

//     month = month.trim();

//     const [year, monthNum] = month.split("-").map(Number);

//     if (isNaN(year) || isNaN(monthNum)) {
//       return res.status(400).json({ success: false, message: "Invalid month" });
//     }

//     const start = new Date(year, monthNum - 1, 1);
//     const end = new Date(year, monthNum, 0, 23, 59, 59, 999);
//     const daysInMonth = new Date(year, monthNum, 0).getDate();

//     const employees = await Employee.find({});
//     const attendanceSummaries = await AttendanceSummary.find({ month });

//     const allApprovedLeaves = await Leave.find({
//       status: "approved",
//       $or: [
//         { startDate: { $regex: `^${month}` } },
//         { endDate: { $regex: `^${month}` } }
//       ]
//     });

//     const attendanceMap = {};
//     attendanceSummaries.forEach(a => {
//       attendanceMap[a.employeeId] = a;
//     });

//     const sundaysInMonth = calculateWeekOffsForDay(year, monthNum, 0);

//     const salaryMap = {};

//     employees.forEach(emp => {
//       let weekOffDay = emp.weekOffDay || "Sunday";
//       const dayMap = {
//         Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3,
//         Thursday: 4, Friday: 5, Saturday: 6
//       };
//       const weekOffDayNum = dayMap[weekOffDay] ?? 0;

//       let weekOffs = 0;
//       let weekOffSource = "default";

//       if (emp.weekOffType === '0+2') {
//         weekOffs = 2;
//         weekOffSource = "0+2_fixed";
//       }
//       else if (emp.weekOffType === '0+4') {
//         weekOffs = 4;
//         weekOffSource = "0+4_fixed";
//       }
//       else if (emp.weekOffType === 'manual') {
//         weekOffs = emp.weekOffPerMonth || 4;
//         weekOffSource = "manual";
//       }
//       else if (emp.weekOffPerMonth === 4 && weekOffDay === "Sunday") {
//         weekOffs = sundaysInMonth === 5 ? 5 : 4;
//         weekOffSource = "0+4_sunday_auto";
//       }
//       else if (emp.weekOffPerMonth === 2) {
//         weekOffs = 2;
//         weekOffSource = "0+2_fixed_no_increment";
//       }
//       else if (typeof emp.weekOffPerMonth === "number") {
//         weekOffs = emp.weekOffPerMonth;
//         weekOffSource = "fixed_from_db";
//       }
//       else {
//         weekOffs = calculateWeekOffsForDay(year, monthNum, weekOffDayNum);
//         weekOffSource = "dynamic";
//       }

//       const empAttendance = attendanceMap[emp.employeeId];
//       const presentDays = empAttendance?.presentDays || 0;
//       const halfDays = empAttendance?.halfDayWorking || 0;
//       let effectiveWorkingDays = presentDays + (halfDays * 0.5);

//       // ✅ SUBIR FIX: Maximum 15 working days per month
//       if (emp.employeeId === 'EMP020' && effectiveWorkingDays > 15) {
//         console.log(`⚠️ Subir working days capped: ${effectiveWorkingDays} → 15`);
//         effectiveWorkingDays = 15;
//       }

//       const salaryPerMonth = emp.salaryPerMonth || 0;
//       const dailyRate = salaryPerMonth / daysInMonth;

//       const empLeaves = allApprovedLeaves.filter(l => l.employeeId === emp.employeeId);

//       let paidLeaveDays = 0;
//       empLeaves.forEach(leave => {
//         const leaveStart = new Date(leave.startDate);
//         const leaveEnd = new Date(leave.endDate);

//         const overlapStart = new Date(Math.max(leaveStart, start));
//         const overlapEnd = new Date(Math.min(leaveEnd, end));

//         if (overlapStart <= overlapEnd) {
//           const diffTime = Math.abs(overlapEnd - overlapStart);
//           const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

//           if (["CL", "EL", "COFF", "Casual Leave", "Earned Leave", "Comp Off"].includes(leave.leaveType)) {
//             paidLeaveDays += diffDays;
//           }
//         }
//       });

//       const paidDays = effectiveWorkingDays + weekOffs + paidLeaveDays;

//       const storedExtraWork = empAttendance?.extraWork || {
//         extraDays: 0,
//         extraHours: 0,
//         bonus: 0,
//         deductions: 0,
//         reason: ""
//       };

//       let calculatedSalary = Math.round(paidDays * dailyRate);

//       if (storedExtraWork) {
//         const extraDaysAmount = (storedExtraWork.extraDays || 0) * dailyRate;
//         const bonus = storedExtraWork.bonus || 0;
//         const deductions = storedExtraWork.deductions || 0;

//         calculatedSalary = Math.round(calculatedSalary + extraDaysAmount + bonus - deductions);
//       }

//       if (empAttendance?.calculatedSalary) {
//         calculatedSalary = empAttendance.calculatedSalary;
//       }

//       salaryMap[emp.employeeId] = {
//         employeeId: emp.employeeId,
//         name: emp.name,
//         month,
//         presentDays,
//         extraWork: storedExtraWork,
//         halfDayWorking: halfDays,
//         totalWorkingDays: effectiveWorkingDays,
//         weekOffs,
//         weekOffDay,
//         weekOffType: emp.weekOffType || (emp.weekOffPerMonth === 2 ? '0+2' : '0+4'),
//         weekOffSource,
//         salaryPerMonth,
//         salaryPerDay: Number(dailyRate.toFixed(2)),
//         paidDays,
//         calculatedSalary,
//         calculatedSalaryDisplay: `₹${calculatedSalary}`,
//         monthDays: daysInMonth,
//         // ✅ Subir specific note
//         note: emp.employeeId === 'EMP020' ? 'Capped at 15 working days (3 days/week)' : undefined
//       };
//     });

//     res.json({
//       success: true,
//       month,
//       salaries: Object.values(salaryMap),
//       count: Object.values(salaryMap).length,
//       monthDays: daysInMonth,
//       note: "0+2: 2 days | 0+4: 4 days | Manual: user defined | Subir: 15 days max"
//     });

//   } catch (error) {
//     console.error("❌ Error in getSalaries:", error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

/**
 * 📌 Get Salaries - ONLY SUBIR FIX, BAKI SAB NORMAL
 */
exports.getSalaries = async (req, res) => {
  try {
    const Holiday = require("../models/Holiday");
    let { month } = req.query;

    if (!month || month.trim() === "") {
      const today = new Date();
      month = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    }

    month = month.trim();

    const [year, monthNum] = month.split("-").map(Number);

    if (isNaN(year) || isNaN(monthNum)) {
      return res.status(400).json({ success: false, message: "Invalid month" });
    }

    const start = new Date(year, monthNum - 1, 1);
    const end = new Date(year, monthNum, 0, 23, 59, 59, 999);
    const daysInMonth = new Date(year, monthNum, 0).getDate();

    const holidays = await Holiday.find({
      $or: [
        { fromDate: { $regex: `^${month}` } },
        { toDate: { $regex: `^${month}` } }
      ]
    });
    
    let holidayDaysInMonth = 0;
    holidays.forEach(h => {
       const startH = new Date(h.fromDate);
       const endH = new Date(h.toDate);
       const overlapStart = new Date(Math.max(startH, start));
       const overlapEnd = new Date(Math.min(endH, end));
       if (overlapStart <= overlapEnd) {
           const diffTime = Math.abs(overlapEnd - overlapStart);
           const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
           holidayDaysInMonth += diffDays;
       }
    });

    const employees = await Employee.find({});
    const attendanceSummaries = await AttendanceSummary.find({ month });

    const allApprovedLeaves = await Leave.find({
      status: "approved",
      $or: [
        { startDate: { $regex: `^${month}` } },
        { endDate: { $regex: `^${month}` } }
      ]
    });

    const attendanceMap = {};
    attendanceSummaries.forEach(a => {
      attendanceMap[a.employeeId] = a;
    });

    const sundaysInMonth = calculateWeekOffsForDay(year, monthNum, 0);

    const salaryMap = {};

    employees.forEach(emp => {
      let weekOffDay = emp.weekOffDay || "Sunday";
      const dayMap = {
        Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3,
        Thursday: 4, Friday: 5, Saturday: 6
      };
      const weekOffDayNum = dayMap[weekOffDay] ?? 0;

      // ============================================
      // ✅ WEEK OFF CALCULATION - NORMAL FOR EVERYONE
      // ============================================
      let weekOffs = 0;
      let weekOffSource = "default";

      if (emp.weekOffType === '0+2') {
        weekOffs = 2;
        weekOffSource = "0+2_fixed";
      }
      else if (emp.weekOffType === '0+4') {
        weekOffs = 4;
        weekOffSource = "0+4_fixed";
      }
      else if (emp.weekOffType === 'manual') {
        weekOffs = emp.weekOffPerMonth || 4;
        weekOffSource = "manual";
      }
      else if (emp.weekOffPerMonth === 4 && weekOffDay === "Sunday") {
        weekOffs = sundaysInMonth === 5 ? 5 : 4;
        weekOffSource = "0+4_sunday_auto";
      }
      else if (emp.weekOffPerMonth === 2) {
        weekOffs = 2;
        weekOffSource = "0+2_fixed_no_increment";
      }
      else if (typeof emp.weekOffPerMonth === "number") {
        weekOffs = emp.weekOffPerMonth;
        weekOffSource = "fixed_from_db";
      }
      else {
        weekOffs = calculateWeekOffsForDay(year, monthNum, weekOffDayNum);
        weekOffSource = "dynamic";
      }

      // ============================================
      // ✅ ATTENDANCE DATA
      // ============================================
      const empAttendance = attendanceMap[emp.employeeId];
      const presentDays = empAttendance?.presentDays || 0;
      const halfDays = empAttendance?.halfDayWorking || 0;
      
      // ✅ Working days calculation (present + half*0.5)
      let effectiveWorkingDays = presentDays + (halfDays * 0.5);

      // ============================================
      // ✅ SALARY CALCULATION
      // ============================================
      const salaryPerMonth = emp.salaryPerMonth || 0;
      const dailyRate = salaryPerMonth / daysInMonth;

      // ✅ LEAVE CALCULATION
      const empLeaves = allApprovedLeaves.filter(l => l.employeeId === emp.employeeId);
      let totalCL = 0, totalSL = 0, totalEL = 0, totalCOFF = 0;
      
      empLeaves.forEach(leave => {
        const leaveStart = new Date(leave.startDate);
        const leaveEnd = new Date(leave.endDate);

        const overlapStart = new Date(Math.max(leaveStart, start));
        const overlapEnd = new Date(Math.min(leaveEnd, end));

        if (overlapStart <= overlapEnd) {
          const diffTime = Math.abs(overlapEnd - overlapStart);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

          if (["Casual Leave", "Casual", "casual", "CL"].includes(leave.leaveType)) {
            totalCL += diffDays;
          } else if (["Sick Leave", "Sick", "sick", "SL"].includes(leave.leaveType)) {
            totalSL += diffDays;
          } else if (["Earned Leave", "Earned", "earned", "EL"].includes(leave.leaveType)) {
            totalEL += diffDays;
          } else if (["Comp Off", "comp off", "COFF"].includes(leave.leaveType)) {
            totalCOFF += diffDays;
          }
        }
      });

      const maxCL = emp.maxCL !== undefined ? emp.maxCL : 1;
      const maxSL = emp.maxSL !== undefined ? emp.maxSL : 1;
      const maxEL = emp.maxEL !== undefined ? emp.maxEL : 12;

      let paidLeaveDays = Math.min(totalCL, maxCL) + Math.min(totalSL, maxSL) + Math.min(totalEL, maxEL) + totalCOFF;

      // ✅ PAID DAYS = Working Days + Week Offs + Paid Leaves + Holidays
      let paidDays = effectiveWorkingDays + weekOffs + paidLeaveDays + holidayDaysInMonth;
      
      // ✅ CAP PAID DAYS TO NOT EXCEED MONTH DAYS
      paidDays = Math.min(paidDays, daysInMonth);

      // ✅ EXTRA WORK / BONUS / DEDUCTIONS
      const storedExtraWork = empAttendance?.extraWork || {
        extraDays: 0,
        extraHours: 0,
        bonus: 0,
        deductions: 0,
        reason: ""
      };

      // ✅ BASE SALARY
      let calculatedSalary = Math.round(paidDays * dailyRate);

      // ✅ ADD EXTRAS
      if (storedExtraWork) {
        const extraDaysAmount = (storedExtraWork.extraDays || 0) * dailyRate;
        const bonus = storedExtraWork.bonus || 0;
        const deductions = storedExtraWork.deductions || 0;

        calculatedSalary = Math.round(calculatedSalary + extraDaysAmount + bonus - deductions);
      }

      // ✅ MANUAL OVERRIDE (if exists)
      if (empAttendance?.calculatedSalary) {
        calculatedSalary = empAttendance.calculatedSalary;
      }

      // ============================================
      // ✅ SPECIAL CASE: ONLY SUBIR (EMP020)
      // ============================================
      if (emp.employeeId === 'EMP020') {
        // ✅ Weekoffs 4 fix karo
        weekOffs = 4;
        weekOffSource = "subir_fixed_4_weekoffs";
        
        // ✅ Working days 15 se upar display mat karo
        const displayWorkingDays = effectiveWorkingDays > 15 ? 15 : effectiveWorkingDays;
        
        // ✅ DAILY RATE
        const subirDailyRate = (emp.salaryPerMonth || 15000) / daysInMonth;
        
        // ✅ SALARY: 15+ days = FULL, else PRO-RATA
        let subirSalary = 0;
        if (effectiveWorkingDays >= 15) {
          subirSalary = emp.salaryPerMonth || 15000; // Full salary
        } else {
          subirSalary = Math.round(effectiveWorkingDays * subirDailyRate); // Pro-rata
        }
        
        // ✅ Override with Subir's calculated salary
        calculatedSalary = subirSalary;
        
        // ✅ Add Subir specific fields
        salaryMap[emp.employeeId] = {
          ...salaryMap[emp.employeeId],
          totalWorkingDays: Number(displayWorkingDays.toFixed(1)),
          weekOffs: weekOffs,
          weekOffSource: weekOffSource,
          paidDays: Number((displayWorkingDays + weekOffs + paidLeaveDays).toFixed(1)),
          calculatedSalary: subirSalary,
          calculatedSalaryDisplay: `₹${subirSalary}`,
          note: effectiveWorkingDays >= 15 
            ? `✅ ${displayWorkingDays} working days + ${weekOffs} weekoffs = Full Salary ₹${emp.salaryPerMonth || 15000}`
            : `⚠️ Only ${effectiveWorkingDays.toFixed(1)} working days. Salary: ${effectiveWorkingDays.toFixed(1)} × ₹${subirDailyRate.toFixed(2)} = ₹${subirSalary}`
        };
      }

      // ✅ FINAL OUTPUT - SAME STRUCTURE FOR EVERYONE
      salaryMap[emp.employeeId] = {
        employeeId: emp.employeeId,
        name: emp.name,
        month,
        presentDays,
        extraWork: storedExtraWork,
        halfDayWorking: halfDays,
        totalWorkingDays: emp.employeeId === 'EMP020' 
          ? (effectiveWorkingDays > 15 ? 15 : Number(effectiveWorkingDays.toFixed(1)))
          : Number(effectiveWorkingDays.toFixed(1)),
        weekOffs,
        weekOffDay,
        weekOffType: emp.weekOffType || (emp.weekOffPerMonth === 2 ? '0+2' : '0+4'),
        weekOffSource,
        salaryPerMonth,
        salaryPerDay: Number(dailyRate.toFixed(2)),
        paidDays: Number(paidDays.toFixed(1)),
        holidays: holidayDaysInMonth,
        calculatedSalary,
        calculatedSalaryDisplay: `₹${calculatedSalary}`,
        monthDays: daysInMonth,
        ...(emp.employeeId === 'EMP020' && { note: salaryMap[emp.employeeId]?.note })
      };
    });

    res.json({
      success: true,
      month,
      salaries: Object.values(salaryMap),
      count: Object.values(salaryMap).length,
      monthDays: daysInMonth,
      note: "Only Subir special calculation. All other employees normal."
    });

  } catch (error) {
    console.error("❌ Error in getSalaries:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * 📌 Update Employee WeekOff Configuration
 */
exports.updateWeekOffConfig = async (req, res) => {
  try {
    const { employeeId, weekOffDay, weekOffPerMonth, weekOffType } = req.body;

    if (!employeeId || !weekOffDay) {
      return res.status(400).json({
        success: false,
        message: "Employee ID and WeekOff Day are required"
      });
    }

    const dayMap = {
      'Sunday': 0,
      'Monday': 1,
      'Tuesday': 2,
      'Wednesday': 3,
      'Thursday': 4,
      'Friday': 5,
      'Saturday': 6
    };

    if (!dayMap.hasOwnProperty(weekOffDay)) {
      return res.status(400).json({
        success: false,
        message: "Invalid weekoff day. Use: Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday"
      });
    }

    const updateData = {
      weekOffDay
    };

    if (weekOffType === '0+2') {
      updateData.weekOffPerMonth = 2;
      updateData.weekOffType = '0+2';
    }
    else if (weekOffType === '0+4') {
      updateData.weekOffPerMonth = 4;
      updateData.weekOffType = '0+4';
    }
    else if (weekOffType === 'manual') {
      if (typeof weekOffPerMonth === "number" && weekOffPerMonth > 0) {
        updateData.weekOffPerMonth = weekOffPerMonth;
        updateData.weekOffType = 'manual';
      } else {
        updateData.weekOffPerMonth = 4;
        updateData.weekOffType = '0+4';
      }
    }
    else if (typeof weekOffPerMonth === "number" && weekOffPerMonth > 0) {
      updateData.weekOffPerMonth = weekOffPerMonth;
      updateData.weekOffType = weekOffPerMonth === 2 ? '0+2' : '0+4';
    }
    else {
      updateData.weekOffPerMonth = 4;
      updateData.weekOffType = '0+4';
    }

    EMPLOYEE_WEEKOFF_MAP[employeeId] = {
      weekOffDay: weekOffDay,
      dayNum: dayMap[weekOffDay],
      weekOffPerMonth: updateData.weekOffPerMonth,
      weekOffType: updateData.weekOffType
    };

    const updatedEmp = await Employee.findOneAndUpdate(
      { employeeId },
      updateData,
      { new: true }
    );

    if (!updatedEmp) {
      return res.status(404).json({
        success: false,
        message: "Employee not found"
      });
    }

    res.json({
      success: true,
      message: `WeekOff updated for ${employeeId}`,
      config: EMPLOYEE_WEEKOFF_MAP[employeeId],
      updatedEmp: updatedEmp
    });

  } catch (error) {
    console.error('❌ Error updating weekoff config:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating weekoff configuration',
      error: error.message
    });
  }
};

/**
 * 📌 Get WeekOff Configuration
 */
exports.getWeekOffConfig = async (req, res) => {
  try {
    res.json({
      success: true,
      config: EMPLOYEE_WEEKOFF_MAP,
      count: Object.keys(EMPLOYEE_WEEKOFF_MAP).length,
      note: "Current employee weekoff configuration"
    });
  } catch (error) {
    console.error('❌ Error getting weekoff config:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching weekoff configuration',
      error: error.message
    });
  }
};

/**
 * 📌 Check Month Data - Diagnostic Function
 */
exports.checkMonthData = async (req, res) => {
  try {
    const { month1, month2 } = req.query;

    const summaries1 = await AttendanceSummary.find({ month: month1 });
    const summaries2 = await AttendanceSummary.find({ month: month2 });

    const [year1, monthNum1] = month1.split("-").map(Number);
    const start1 = new Date(year1, monthNum1 - 1, 1);
    const end1 = new Date(year1, monthNum1, 0, 23, 59, 59, 999);

    const [year2, monthNum2] = month2.split("-").map(Number);
    const start2 = new Date(year2, monthNum2 - 1, 1);
    const end2 = new Date(year2, monthNum2, 0, 23, 59, 59, 999);

    const leaves1 = await Leave.find({
      status: 'approved',
      $or: [
        { startDate: { $gte: start1, $lte: end1 } },
        { endDate: { $gte: start1, $lte: end1 } },
        {
          $and: [
            { startDate: { $lte: start1 } },
            { endDate: { $gte: end1 } }
          ]
        }
      ]
    });

    const leaves2 = await Leave.find({
      status: 'approved',
      $or: [
        { startDate: { $gte: start2, $lte: end2 } },
        { endDate: { $gte: start2, $lte: end2 } },
        {
          $and: [
            { startDate: { $lte: start2 } },
            { endDate: { $gte: end2 } }
          ]
        }
      ]
    });

    const employees = await Employee.find({});
    const crossMonthEmployees = [];

    employees.forEach(emp => {
      const inMonth1 = summaries1.find(s => s.employeeId === emp.employeeId);
      const inMonth2 = summaries2.find(s => s.employeeId === emp.employeeId);
      const leavesIn1 = leaves1.filter(l => l.employeeId === emp.employeeId);
      const leavesIn2 = leaves2.filter(l => l.employeeId === emp.employeeId);

      if (inMonth1 && inMonth2) {
        crossMonthEmployees.push({
          employeeId: emp.employeeId,
          name: emp.name,
          [month1]: {
            presentDays: inMonth1.presentDays,
            totalWorkingDays: inMonth1.totalWorkingDays,
            leaves: leavesIn1.length
          },
          [month2]: {
            presentDays: inMonth2.presentDays,
            totalWorkingDays: inMonth2.totalWorkingDays,
            leaves: leavesIn2.length
          }
        });
      }
    });

    res.json({
      success: true,
      months: { month1, month2 },
      summaries: {
        [month1]: summaries1.length,
        [month2]: summaries2.length
      },
      leaves: {
        [month1]: leaves1.length,
        [month2]: leaves2.length
      },
      crossMonthEmployees: crossMonthEmployees.length > 0 ? crossMonthEmployees : "No cross-month data found",
      note: "This is diagnostic only - no data changed"
    });

  } catch (error) {
    console.error('❌ Check error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * 📌 Update Attendance Record (Dynamic Update)
 */
exports.updateAttendanceDynamic = async (req, res) => {
  try {
    const { attendanceId, hours, region, reason, comment } = req.body;

    if (!attendanceId) return res.status(400).json({ success: false, message: "ID required" });

    const updateData = {};
    if (hours !== undefined) updateData.totalHours = parseFloat(hours);
    if (region !== undefined) updateData.region = region;
    if (reason !== undefined) updateData.reason = reason;
    if (comment !== undefined) updateData.comment = comment;

    if (hours !== undefined) {
      const record = await Attendance.findById(attendanceId);
      if (record) {
        const allShifts = await Shift.find({});
        const masterShifts = allShifts.filter(s => s.isMasterShift);
        const shiftInfo = getEmployeeShift(record.employeeId, allShifts, masterShifts);

        updateData.dayType = calculateShiftDayType(parseFloat(hours), shiftInfo.duration);
      }
    }

    const updatedRecord = await Attendance.findByIdAndUpdate(attendanceId, updateData, { new: true });

    res.json({
      success: true,
      message: "Updated successfully",
      record: updatedRecord
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 📌 Update Payroll Details
 */
exports.updatePayrollDetails = async (req, res) => {
  try {
    const { employeeId, month, calculatedSalary, extraWork, presentDays, workingDays, halfDayWorking, fullDayNotWorking, weekOffDays, holidays } = req.body;

    if (!employeeId || !month) {
      return res.status(400).json({
        success: false,
        message: "Employee ID and Month are required"
      });
    }

    const summaries = await AttendanceSummary.find({ employeeId, month });
    let summary;

    if (summaries.length === 0) {
      summary = new AttendanceSummary({
        employeeId,
        month,
        presentDays: presentDays || 0,
        totalWorkingDays: workingDays || 0,
        calculatedSalary: calculatedSalary || 0
      });
    } else if (summaries.length === 1) {
      summary = summaries[0];
    } else {
      summaries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      summary = summaries[0];
      const idsToDelete = summaries.slice(1).map(s => s._id);
      await AttendanceSummary.deleteMany({ _id: { $in: idsToDelete } });
    }

    if (calculatedSalary !== undefined) summary.calculatedSalary = calculatedSalary;
    if (extraWork) {
      summary.extraWork = extraWork;
    }

    if (presentDays !== undefined) summary.presentDays = presentDays;
    if (workingDays !== undefined) summary.workingDays = workingDays;
    if (workingDays !== undefined) summary.totalWorkingDays = workingDays;
    if (halfDayWorking !== undefined) summary.halfDayWorking = halfDayWorking;
    if (fullDayNotWorking !== undefined) summary.fullDayNotWorking = fullDayNotWorking;
    if (weekOffDays !== undefined) summary.weekOffDays = weekOffDays;
    if (holidays !== undefined) summary.holidays = holidays;

    const savedSummary = await summary.save();

    res.json({
      success: true,
      message: "Payroll details updated successfully",
      summary: savedSummary
    });

  } catch (error) {
    console.error("❌ Error updating payroll:", error);
    res.status(500).json({
      success: false,
      message: "Error updating payroll details",
      error: error.message
    });
  }
};

/**
 * 📌 Get Edited Attendance Records (Regularized)
 */
exports.getEditedAttendanceRecords = async (req, res) => {
  try {
    const { month, date } = req.query;
    let query = {
      $and: [
          { $or: [
            { comment: { $exists: true, $ne: "" } }, 
            { reason: { $exists: true, $nin: ["Onsite", "Work From Home", "No reason provided", "checked-in", ""] } }
          ]}
      ]
    };

    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      query.checkInTime = { $gte: start, $lte: end };
    } else if (month) {
      const [year, monthNum] = month.split('-').map(Number);
      const start = new Date(year, monthNum - 1, 1);
      const end = new Date(year, monthNum, 0, 23, 59, 59, 999);
      query.checkInTime = { $gte: start, $lte: end };
    }

    const records = await Attendance.find(query).sort({ checkInTime: -1 });
    
    res.json({
      success: true,
      data: records,
      count: records.length
    });
  } catch (error) {
    console.error('❌ Error fetching edited records:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching edited records',
      error: error.message
    });
  }
};