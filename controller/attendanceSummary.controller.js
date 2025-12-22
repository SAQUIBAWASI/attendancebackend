// const Attendance = require("../models/Attendance");
// const AttendanceSummary = require("../models/AttendanceSummary");
// const Employee = require("../models/Employee");
// const Leave = require("../models/Leave");

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


const Attendance = require("../models/Attendance");
const AttendanceSummary = require("../models/AttendanceSummary");
const Employee = require("../models/Employee");
const Leave = require("../models/Leave");

// ✅ YEHI ADD KARNA HAI - Calculate Day Type Function
const calculateDayType = (hours) => {
  const h = parseFloat(hours) || 0;
  
  // Same logic as in calculateSummary
  const FULL_DAY_THRESHOLD = 8.80;
  const HALF_DAY_THRESHOLD = 4;

  if (h > FULL_DAY_THRESHOLD) {
    return "full";
  } else if (h >= HALF_DAY_THRESHOLD) {
    return "half";
  } else {
    return "full_leave";
  }
};


/**
 * 📌 Get All Attendance Records with Filters
 */
exports.getAllAttendance = async (req, res) => {
  try {
    const { fromDate, toDate, month, employeeId } = req.query;
    
    let query = {};
    
    // Date range filter
    if (fromDate && toDate) {
      query.checkInTime = {
        $gte: new Date(fromDate),
        $lte: new Date(toDate + 'T23:59:59.999Z')
      };
    }
    
    // Month filter
    if (month) {
      const [year, monthNum] = month.split('-');
      const startDate = new Date(year, monthNum - 1, 1);
      const endDate = new Date(year, monthNum, 0, 23, 59, 59, 999);
      
      query.checkInTime = {
        $gte: startDate,
        $lte: endDate
      };
    }
    
    // Employee filter
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
 * 📌 Update Attendance Record (Hours, Region, Comment) - FIXED VERSION
 */
exports.updateAttendance = async (req, res) => {
  try {
    const { attendanceId, hours, region, reason } = req.body;
    
    console.log('📝 Update request received:', { attendanceId, hours, region, reason });
    
    if (!attendanceId) {
      return res.status(400).json({
        success: false,
        message: 'Attendance ID is required'
      });
    }
    
    if (hours === undefined && !region && !reason) {
      return res.status(400).json({
        success: false,
        message: 'At least one field (hours, region, or reason) is required to update'
      });
    }
    
    const updateData = {};
    if (hours !== undefined) updateData.totalHours = parseFloat(hours);
    if (region !== undefined) updateData.region = region;
    if (reason !== undefined) {
      updateData.reason = reason;
      updateData.comment = reason; // Also update comment field for compatibility
    }
    
    // Recalculate day type based on new hours
    if (hours !== undefined) {
      const calculatedDayType = calculateDayType(parseFloat(hours));
      updateData.dayType = calculatedDayType;
    }
    
    console.log('🔄 Update data:', updateData);
    
    const updatedRecord = await Attendance.findByIdAndUpdate(
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
    
    console.log('✅ Attendance record updated:', {
      id: attendanceId,
      hours: hours,
      region: region,
      reason: reason,
      dayType: updatedRecord.dayType
    });
    
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

    console.log('💾 Saving summary for:', {
      month,
      fromDate,
      toDate,
      employeeCount: summaries.length
    });

    // Remove existing summaries for the same period
    let deleteQuery = {};
    if (month) {
      deleteQuery.month = month;
    } else if (fromDate && toDate) {
      deleteQuery.fromDate = fromDate;
      deleteQuery.toDate = toDate;
    }

    if (Object.keys(deleteQuery).length > 0) {
      await AttendanceSummary.deleteMany(deleteQuery);
      console.log('🗑️ Cleared existing summaries for period');
    }

    // Prepare data for insertion with updated field names
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
      createdAt: new Date()
    }));

    const result = await AttendanceSummary.insertMany(insertData);

    console.log('✅ Summary saved successfully:', result.length, 'records');

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
 * 📌 Get Saved Summary - ✅ FIXED: Auto-correct wrong data
 */
exports.getSummary = async (req, res) => {
  try {
    const { month, fromDate, toDate, employeeId } = req.query;

    console.log("📥 GetSummary API Called with:", { month, fromDate, toDate, employeeId });

    let filter = {};
    
    // Date range filter
    if (fromDate && toDate) {
      filter.createdAt = {
        $gte: new Date(fromDate),
        $lte: new Date(toDate + "T23:59:59.999Z")
      };
    }
    
    // Month filter
    if (month) {
      filter.month = month;
    }
    
    // Employee filter
    if (employeeId) {
      filter.employeeId = employeeId;
    }

    console.log("🔍 Database Filter:", filter);

    let data = await AttendanceSummary.find(filter).sort({ createdAt: -1 });

    console.log("✅ Found records:", data.length);

    // ✅ FIXED: Auto-correct wrong data for current month
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();
    
    const correctedData = data.map(summary => {
      if (summary.month) {
        const [year, monthNum] = summary.month.split('-').map(Number);
        
        // Only correct if current month
        if (year === currentYear && monthNum === currentMonth) {
          const summaryObj = summary.toObject(); // Convert to plain object
          
          // Get corrected values
          const correctedPresent = Math.min(summary.presentDays, currentDay);
          const correctedLate = Math.min(summary.lateDays, currentDay);
          const correctedOnsite = Math.min(summary.onsiteDays, currentDay);
          const correctedHalf = Math.min(summary.halfDayWorking, currentDay);
          const correctedFullLeave = Math.min(summary.fullDayNotWorking, currentDay);
          const correctedTotal = correctedPresent + (correctedHalf * 0.5);
          
          console.log(`🔧 Auto-correcting ${summary.employeeId}: present ${summary.presentDays} → ${correctedPresent}`);
          
          return {
            ...summaryObj,
            presentDays: correctedPresent,
            lateDays: correctedLate,
            onsiteDays: correctedOnsite,
            halfDayWorking: correctedHalf,
            fullDayNotWorking: correctedFullLeave,
            totalWorkingDays: correctedTotal
          };
        }
      }
      return summary;
    });

    // Check if any correction happened
    const wasCorrected = JSON.stringify(data) !== JSON.stringify(correctedData);
    if (wasCorrected) {
      console.log("🔄 Summary data auto-corrected for current month");
    }

    res.json({
      success: true,
      count: correctedData.length,
      summary: correctedData,
      note: wasCorrected ? "Data auto-corrected for current month" : "Data is correct"
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
 * 📌 Calculate Summary from Raw Data - COMPLETELY FIXED VERSION (November-December Separate)
 */
exports.calculateSummary = async (req, res) => {
  try {
    const { fromDate, toDate, month } = req.body;
    
    let query = {};
    
    console.log("📥 CalculateSummary called with:", { month, fromDate, toDate });

    // 🔍 Use a separate variable for processed month
    let processedMonth = month;
    
    // 🔍 STRICT MONTH FILTERING
    if (processedMonth) {
      const [year, m] = processedMonth.split("-");
      const start = new Date(year, m - 1, 1);
      
      // Month ka exact last day
      let end = new Date(year, m, 0, 23, 59, 59, 999);
      
      // Agar current month hai, toh sirf aaj tak
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth() + 1;
      
      if (parseInt(year) === currentYear && parseInt(m) === currentMonth) {
        end = new Date(today);
        end.setHours(23, 59, 59, 999);
        console.log("✅ Current month detected. Limiting to today:", end);
      }
      
      query.checkInTime = { $gte: start, $lte: end };
      console.log("📅 STRICT Month filter applied:", processedMonth, "from", start, "to", end);
      
    } else if (fromDate && toDate) {
      query.checkInTime = {
        $gte: new Date(fromDate),
        $lte: new Date(toDate + "T23:59:59.999Z")
      };
      console.log("📅 Date range filter applied:", fromDate, toDate);
      
      // If no month but date range, calculate month from fromDate
      if (fromDate) {
        const date = new Date(fromDate);
        processedMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      }
    } else {
      // Default: current month
      const today = new Date();
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end = new Date(today);
      end.setHours(23, 59, 59, 999);
      
      query.checkInTime = { $gte: start, $lte: end };
      processedMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
      console.log("📅 No filter, using current month:", processedMonth);
    }

    console.log("🔍 MongoDB Query:", JSON.stringify(query));
    console.log("📆 Processing month:", processedMonth);

    // 🟦 Fetch attendance + employees
    const attendanceRecords = await Attendance.find(query).sort({ checkInTime: -1 });
    const employees = await Employee.find({});

    console.log("📊 Attendance records found:", attendanceRecords.length);
    console.log("👥 Employees found:", employees.length);

    // DEBUG: Check months in fetched records
    if (attendanceRecords.length > 0) {
      const monthsInRecords = [...new Set(attendanceRecords.map(rec => {
        const d = new Date(rec.checkInTime);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      }))];
      console.log("📆 Months found in attendance records:", monthsInRecords);
    }

    // Constants
    const FULL_DAY_THRESHOLD = 8.80;
    const HALF_DAY_THRESHOLD = 4;

    const calculateDayType = (hrs) => {
      const h = parseFloat(hrs) || 0;

      if (h > FULL_DAY_THRESHOLD) {
        return "full";
      } else if (h >= HALF_DAY_THRESHOLD) {
        return "half";
      } else {
        return "full_leave";
      }
    };

    const summaryMap = {};
    const processedDates = {};

    // 🔴 MAIN FIX: Strict month filtering during processing
    attendanceRecords.forEach((rec) => {
      if (!rec.employeeId || !rec.checkInTime) return;

      const employeeId = rec.employeeId;
      const checkInDate = new Date(rec.checkInTime);
      const dateKey = checkInDate.toISOString().split("T")[0];
      
      // ✅ STRICT CHECK: Record का month processedMonth से match होना चाहिए
      const recordMonth = `${checkInDate.getFullYear()}-${String(checkInDate.getMonth() + 1).padStart(2, "0")}`;
      
      if (processedMonth && recordMonth !== processedMonth) {
        // Skip records from different months
        console.log(`⏩ SKIPPING: ${employeeId} - Record from ${recordMonth}, but processing ${processedMonth}`);
        return;
      }

      // Future date check
      const today = new Date();
      if (checkInDate > today) {
        console.log(`⏭️ Skipping future date: ${employeeId} - ${checkInDate}`);
        return;
      }

      // Initialize summary
      if (!summaryMap[employeeId]) {
        const emp = employees.find((e) => e.employeeId === employeeId) || {};

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
          workingDays: 0,
          calculatedSalary: 0,
          totalRecords: 0
        };

        processedDates[employeeId] = new Set();
      }

      // Skip duplicate date
      if (processedDates[employeeId].has(dateKey)) {
        console.log(`⏩ Skipping duplicate date for ${employeeId}: ${dateKey}`);
        return;
      }
      processedDates[employeeId].add(dateKey);

      // Hours calculation
      let hours = 0;
      if (rec.totalHours !== undefined) {
        hours = parseFloat(rec.totalHours);
      } else if (rec.checkOutTime) {
        hours = (new Date(rec.checkOutTime) - new Date(rec.checkInTime)) / (1000 * 60 * 60);
      }

      // Day type
      const type = calculateDayType(hours);
      
      console.log(`📊 ${employeeId} - ${dateKey}: ${hours.toFixed(2)}h = ${type}`);

      if (type === "full") {
        summaryMap[employeeId].presentDays += 1;
        summaryMap[employeeId].totalWorkingDays += 1;
      } else if (type === "half") {
        summaryMap[employeeId].halfDayWorking += 1;
        summaryMap[employeeId].totalWorkingDays += 0.5;
      } else if (type === "full_leave") {
        summaryMap[employeeId].fullDayNotWorking += 1;
      }

      // Late check-in
      const hour = checkInDate.getHours();
      const minute = checkInDate.getMinutes();
      if (hour > 10 || (hour === 10 && minute > 0)) {
        summaryMap[employeeId].lateDays += 1;
      }

      // Onsite days
      if (rec.onsite === true) {
        summaryMap[employeeId].onsiteDays += 1;
      }

      summaryMap[employeeId].totalRecords += 1;
    });

    const summaryArray = Object.values(summaryMap);

    console.log("📋 Summary calculated for", processedMonth + ":", summaryArray.length, "employees");

    // Current month adjustment
    if (processedMonth) {
      const now = new Date();
      const [selectedYear, selectedMonth] = processedMonth.split('-').map(Number);
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;
      const currentDay = now.getDate();
      
      if (selectedYear === currentYear && selectedMonth === currentMonth) {
        console.log("✅ Adjusting for current month, max days:", currentDay);
        
        summaryArray.forEach(emp => {
          const correctedPresent = Math.min(emp.presentDays, currentDay);
          const correctedLate = Math.min(emp.lateDays, currentDay);
          const correctedOnsite = Math.min(emp.onsiteDays, currentDay);
          const correctedHalf = Math.min(emp.halfDayWorking, currentDay);
          const correctedFullLeave = Math.min(emp.fullDayNotWorking, currentDay);
          const correctedTotal = correctedPresent + (correctedHalf * 0.5);
          
          emp.presentDays = correctedPresent;
          emp.lateDays = correctedLate;
          emp.onsiteDays = correctedOnsite;
          emp.halfDayWorking = correctedHalf;
          emp.fullDayNotWorking = correctedFullLeave;
          emp.totalWorkingDays = correctedTotal;
        });
      }
    }

    // ✅ SAVE TO DATABASE (ONLY for this month)
    if (summaryArray.length > 0 && processedMonth) {
      // Delete ONLY summaries for this specific month
      const deleteFilter = { month: processedMonth };
      
      console.log("🗑️ Deleting existing summaries for:", processedMonth);
      
      const deleteResult = await AttendanceSummary.deleteMany(deleteFilter);
      console.log(`🗑️ Deleted ${deleteResult.deletedCount} existing summaries for ${processedMonth}`);

      // Save new summaries with CORRECT month
      const summariesToSave = summaryArray.map(summary => ({
        ...summary,
        month: processedMonth, // Ensure month is saved correctly
        fromDate: fromDate || null,
        toDate: toDate || null,
        calculatedAt: new Date(),
        createdAt: new Date()
      }));

      const savedSummaries = await AttendanceSummary.insertMany(summariesToSave);
      console.log(`💾 Saved ${savedSummaries.length} summaries for ${processedMonth}`);
      
      // Verify what was saved
      const verifyData = await AttendanceSummary.find({ month: processedMonth });
      console.log(`✅ Verification: ${verifyData.length} records now in DB for ${processedMonth}`);
    }

    res.json({
      success: true,
      count: summaryArray.length,
      summary: summaryArray,
      month: processedMonth,
      message: `Summary calculated and saved successfully for ${processedMonth}`
    });

  } catch (err) {
    console.error('❌ Error calculating summary:', err);
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
    
    console.log('🔍 Fetching details for employee:', employeeId, { fromDate, toDate, month });
    
    let query = { employeeId };
    
    // Date range filter
    if (fromDate && toDate) {
      query.checkInTime = {
        $gte: new Date(fromDate),
        $lte: new Date(toDate + 'T23:59:59.999Z')
      };
    }
    
    // Month filter
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
      .sort({ checkInTime: -1 })
      .lean();
    
    console.log('📋 Details found:', details.length);
    
    // Get employee info
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
 * 📌 Fix Wrong Summary Data (Without Deleting) - ✅ NEW FUNCTION ADDED
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
    
    console.log(`🔧 Fixing summary data for ${month}, current day: ${currentDay}`);
    
    let updateCount = 0;
    
    if (year === currentYear && monthNum === currentMonth) {
      // Current month hai - limit to current day
      const summaries = await AttendanceSummary.find({ month });
      
      for (const summary of summaries) {
        // Calculate new correct values
        const correctedPresent = Math.min(summary.presentDays, currentDay);
        const correctedLate = Math.min(summary.lateDays, currentDay);
        const correctedOnsite = Math.min(summary.onsiteDays, currentDay);
        const correctedHalf = Math.min(summary.halfDayWorking, currentDay);
        const correctedFullLeave = Math.min(summary.fullDayNotWorking, currentDay);
        const correctedTotal = correctedPresent + (correctedHalf * 0.5);
        
        // Update if needed
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
          console.log(`✅ Fixed ${summary.employeeId}: present ${summary.presentDays} → ${correctedPresent} days`);
        }
      }
    } else {
      // Past month hai - kuch mat karo
      console.log(`ℹ️ ${month} is past month, no fix needed`);
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
 * 📌 Get Salaries - ULTIMATE FIX (No Data Deletion)
 */
exports.getSalaries = async (req, res) => {
  try {
    let { month } = req.query;

    if (!month) {
      const today = new Date();
      month = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    }

    console.log("=".repeat(60));
    console.log("💰 FINAL SALARY FIX - MONTH:", month);
    console.log("=".repeat(60));

    const [year, monthNum] = month.split("-").map(Number);
    const start = new Date(year, monthNum - 1, 1);
    const end = new Date(year, monthNum, 0, 23, 59, 59, 999);

    console.log(`📅 Salary Period: ${start.toDateString()} to ${end.toDateString()}`);

    // Step 1: Get employees
    const employees = await Employee.find({});
    console.log(`👥 Total Employees: ${employees.length}`);

    // Step 2: Get attendance for REQUESTED MONTH ONLY
    const attendanceSummaries = await AttendanceSummary.find({ month: month });
    console.log(`📊 Attendance records in ${month}: ${attendanceSummaries.length}`);

    // Step 3: SMART LEAVES FILTERING
    // First get ALL approved leaves
    const allLeaves = await Leave.find({ status: 'approved' });
    console.log(`📝 All approved leaves in system: ${allLeaves.length}`);

    // Now filter leaves for THIS MONTH ONLY using JavaScript
    const monthLeaves = allLeaves.filter(leave => {
      const leaveStart = new Date(leave.startDate);
      const leaveEnd = new Date(leave.endDate || leave.startDate);
      
      // Check if leave overlaps with requested month
      return (leaveStart <= end && leaveEnd >= start);
    });

    console.log(`✅ Leaves in ${month}: ${monthLeaves.length}`);

    // Debug: Show leaves by employee
    const leavesByEmployee = {};
    monthLeaves.forEach(leave => {
      if (!leavesByEmployee[leave.employeeId]) {
        leavesByEmployee[leave.employeeId] = [];
      }
      leavesByEmployee[leave.employeeId].push(leave);
    });

    console.log("\n📋 Leaves Distribution:");
    Object.keys(leavesByEmployee).forEach(empId => {
      console.log(`   ${empId}: ${leavesByEmployee[empId].length} leave(s)`);
    });

    // Step 4: Calculate salaries
    const salaryMap = {};

    employees.forEach(emp => {
      console.log(`\n--- Processing: ${emp.employeeId} - ${emp.name} ---`);

      // Get attendance for THIS MONTH
      const empAttendance = attendanceSummaries.find(s => s.employeeId === emp.employeeId);
      
      if (!empAttendance) {
        console.log(`⚠️ No attendance found for ${month}`);
        // Still create entry but with zero attendance
        salaryMap[emp.employeeId] = {
          employeeId: emp.employeeId,
          name: emp.name,
          month: month,
          presentDays: 0,
          halfDayWorking: 0,
          totalWorkingDays: 0,
          weekOffs: emp.weekOffPerMonth || 0,
          totalLeaves: 0,
          leaveTypes: "No Leaves",
          salaryPerMonth: emp.salaryPerMonth || 0,
          salaryPerDay: (emp.salaryPerMonth || 0) / 30,
          paidDays: 0,
          calculatedSalary: 0,
          note: `No attendance data for ${month}`
        };
        return;
      }

      console.log(`📊 Attendance: Present=${empAttendance.presentDays}, Half=${empAttendance.halfDayWorking}, Total=${empAttendance.totalWorkingDays}`);

      // Get leaves for THIS employee in THIS month
      const empLeaves = leavesByEmployee[emp.employeeId] || [];
      console.log(`📝 Leaves in ${month}: ${empLeaves.length}`);

      // Calculate leave days in THIS MONTH
      let totalLeaveDays = 0;
      const leaveTypes = {};

      empLeaves.forEach(leave => {
        const type = leave.leaveType?.toUpperCase() || "UNKNOWN";
        if (!leaveTypes[type]) leaveTypes[type] = 0;

        const leaveStart = new Date(leave.startDate);
        const leaveEnd = new Date(leave.endDate || leave.startDate);

        // Calculate overlap with requested month
        const overlapStart = leaveStart < start ? start : leaveStart;
        const overlapEnd = leaveEnd > end ? end : leaveEnd;

        if (overlapStart <= overlapEnd) {
          const days = Math.floor((overlapEnd - overlapStart) / (1000 * 60 * 60 * 24)) + 1;
          leaveTypes[type] += days;
          totalLeaveDays += days;
          
          console.log(`   📅 ${days} day(s): ${overlapStart.toDateString()} to ${overlapEnd.toDateString()}`);
        }
      });

      // Weekoffs
      const weekOffs = emp.weekOffPerMonth || 0;
      console.log(`📅 Weekoffs: ${weekOffs}`);

      // Salary calculation
      const salaryPerMonth = emp.salaryPerMonth || 0;
      const dailyRate = salaryPerMonth / 30;
      
      const totalWorkingDays = empAttendance.totalWorkingDays || 0;
      const paidDays = Math.max(0, totalWorkingDays + weekOffs - totalLeaveDays);
      const calculatedSalary = Math.round(paidDays * dailyRate);

      console.log(`🧮 Formula: ${totalWorkingDays} (work) + ${weekOffs} (weekoff) - ${totalLeaveDays} (leaves) = ${paidDays} days`);
      console.log(`💰 Salary: ${paidDays} × ₹${dailyRate.toFixed(2)} = ₹${calculatedSalary}`);

      // Store result
      salaryMap[emp.employeeId] = {
        employeeId: emp.employeeId,
        name: emp.name,
        month: month,

        // Attendance
        presentDays: empAttendance.presentDays || 0,
        halfDayWorking: empAttendance.halfDayWorking || 0,
        totalWorkingDays: parseFloat(totalWorkingDays.toFixed(1)),
        workingDays: parseFloat(totalWorkingDays.toFixed(1)),

        // Weekoffs
        weekOffs: weekOffs,
        weekOffDays: weekOffs,

        // Leaves
        totalLeaves: totalLeaveDays,
        leaveTypes: totalLeaveDays > 0 ? leaveTypes : "No Leaves",

        // Salary
        salaryPerMonth: salaryPerMonth,
        salaryPerDay: parseFloat(dailyRate.toFixed(2)),
        paidDays: parseFloat(paidDays.toFixed(2)),
        calculatedSalary: calculatedSalary,

        // Display
        calculatedSalaryDisplay: `₹${calculatedSalary}`,
        salaryPerDayDisplay: `₹${dailyRate.toFixed(2)}/day`,

        // Debug info
        _debug: {
          attendanceMonth: empAttendance.month,
          leavesCount: empLeaves.length,
          leavesInSystem: allLeaves.filter(l => l.employeeId === emp.employeeId).length,
          formula: `${totalWorkingDays} + ${weekOffs} - ${totalLeaveDays}`
        }
      };
    });

    console.log("\n" + "=".repeat(60));
    console.log(`✅ FINISHED: Salaries for ${month}`);
    console.log(`📋 Employees with data: ${Object.keys(salaryMap).length}`);
    console.log("=".repeat(60));

    res.json({
      success: true,
      month: month,
      period: {
        start: start.toISOString(),
        end: end.toISOString()
      },
      dataSummary: {
        totalEmployees: employees.length,
        employeesWithAttendance: attendanceSummaries.length,
        leavesInMonth: monthLeaves.length,
        leavesInSystem: allLeaves.length
      },
      salaries: Object.values(salaryMap),
      totalEmployees: Object.values(salaryMap).length,
      note: `Calculated for ${month} only. No data was deleted.`
    });

  } catch (error) {
    console.error("❌ Salary error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
/**
 * 📌 Check Month Data - Diagnostic Function
 */
exports.checkMonthData = async (req, res) => {
  try {
    const { month1, month2 } = req.query;
    
    console.log(`🔍 Checking data for months: ${month1} and ${month2}`);
    
    // Get summaries for both months
    const summaries1 = await AttendanceSummary.find({ month: month1 });
    const summaries2 = await AttendanceSummary.find({ month: month2 });
    
    // Get leaves for both months
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
        { $and: [
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
        { $and: [
            { startDate: { $lte: start2 } },
            { endDate: { $gte: end2 } }
          ]
        }
      ]
    });
    
    // Find employees with data in both months
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