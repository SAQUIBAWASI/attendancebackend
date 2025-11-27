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
      updateData.comment = reason;
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
 * 📌 Get Saved Summary
 */
exports.getSummary = async (req, res) => {
  try {
    const { month, fromDate, toDate, employeeId } = req.query;

    let filter = {};
    if (month) filter.month = month;
    if (fromDate && toDate) {
      filter.fromDate = fromDate;
      filter.toDate = toDate;
    }
    if (employeeId) filter.employeeId = employeeId;

    const data = await AttendanceSummary.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: data.length,
      summary: data
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
 * 📌 Calculate Summary from Raw Data
 */
exports.calculateSummary = async (req, res) => {
  try {
    const { fromDate, toDate, month } = req.body;

    let query = {};
    let summaryMonth = month;

    // 🔍 Date range or month filter
    if (fromDate && toDate) {
      query.checkInTime = {
        $gte: new Date(fromDate),
        $lte: new Date(toDate + "T23:59:59.999Z")
      };

      if (!month) {
        const f = new Date(fromDate);
        summaryMonth = `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, "0")}`;
      }
    } else if (month) {
      const [year, m] = month.split("-");
      const start = new Date(year, m - 1, 1);
      const end = new Date(year, m, 0, 23, 59, 59, 999);

      query.checkInTime = { $gte: start, $lte: end };
    }

    console.log("🔍 Summary Query:", query);

    // 🟦 Fetch attendance + employees
    const attendanceRecords = await Attendance.find(query).sort({ checkInTime: -1 });
    const employees = await Employee.find({});

    console.log("📊 Attendance found:", attendanceRecords.length);
    console.log("👥 Employees found:", employees.length);

    // Constants - EXACT THRESHOLDS AS PER REQUIREMENT
    const FULL_DAY_THRESHOLD = 8.80; // 8.81+ hours = Full Day
    const HALF_DAY_THRESHOLD = 4;    // 4 to 8.80 hours = Half Day

    const calculateDayType = (hrs) => {
      const h = parseFloat(hrs) || 0;

      if (h > FULL_DAY_THRESHOLD) {
        return "full"; // 8.81, 8.82, 8.9, 9.0, etc. = FULL DAY
      } else if (h >= HALF_DAY_THRESHOLD) {
        return "half"; // 4.0 to 8.80 = HALF DAY
      } else {
        return "full_leave"; // 4.0 se kam = FULL LEAVE
      }
    };

    const summaryMap = {};
    const processedDates = {};

    attendanceRecords.forEach((rec) => {
      if (!rec.employeeId || !rec.checkInTime) return;

      const employeeId = rec.employeeId;
      const checkInDate = new Date(rec.checkInTime);
      const dateKey = checkInDate.toISOString().split("T")[0];

      const finalMonth =
        summaryMonth ||
        `${checkInDate.getFullYear()}-${String(checkInDate.getMonth() + 1).padStart(2, "0")}`;

      // 🟪 Initialize employee summary
      if (!summaryMap[employeeId]) {
        const emp = employees.find((e) => e.employeeId === employeeId) || {};

        summaryMap[employeeId] = {
          employeeId,
          name: emp.name || `Employee ${employeeId}`,
          month: finalMonth,
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

      // ⏩ Skip duplicate date
      if (processedDates[employeeId].has(dateKey)) return;
      processedDates[employeeId].add(dateKey);

      // ⏱ Hours calculation
      let hours = 0;
      if (rec.totalHours !== undefined) {
        hours = parseFloat(rec.totalHours);
      } else if (rec.checkOutTime) {
        hours =
          (new Date(rec.checkOutTime) - new Date(rec.checkInTime)) /
          (1000 * 60 * 60);
      }

      // 📌 Day type with EXACT logic
      const type = calculateDayType(hours);
      
      console.log(`📊 Employee ${employeeId} - Hours: ${hours.toFixed(2)}, Type: ${type}`);

      if (type === "full") {
        summaryMap[employeeId].presentDays += 1;
        summaryMap[employeeId].totalWorkingDays += 1;
        console.log(`✅ ${employeeId}: ${hours} hours = FULL DAY`);
      } else if (type === "half") {
        summaryMap[employeeId].halfDayWorking += 1;
        summaryMap[employeeId].totalWorkingDays += 0.5;
        console.log(`🟡 ${employeeId}: ${hours} hours = HALF DAY`);
      } else if (type === "full_leave") {
        summaryMap[employeeId].fullDayNotWorking += 1;
        console.log(`🔴 ${employeeId}: ${hours} hours = FULL LEAVE`);
      }

      // ⏰ Late check–in
      const hour = checkInDate.getHours();
      const minute = checkInDate.getMinutes();
      if (hour > 10 || (hour === 10 && minute > 0)) {
        summaryMap[employeeId].lateDays += 1;
      }

      // 🏢 ONSITE DAYS FIXED — only if onsite == true
      if (rec.onsite === true) {
        summaryMap[employeeId].onsiteDays += 1;
        console.log(`🏢 Onsite counted for ${employeeId} on ${dateKey}`);
      }

      summaryMap[employeeId].totalRecords += 1;
    });

    // 💰 Salary Calculation
    Object.values(summaryMap).forEach((emp) => {
      const baseSalary = 30000;
      const workingDaysInMonth = 30;

      const dailyRate = baseSalary / workingDaysInMonth;

      emp.workingDays = emp.presentDays;
      emp.totalWorkingDays = emp.presentDays + emp.halfDayWorking * 0.5;

      emp.calculatedSalary = Math.round(emp.totalWorkingDays * dailyRate);
    });

    const finalSummary = Object.values(summaryMap);

    console.log("📈 Summary generated for:", finalSummary.length);

    res.json({
      success: true,
      summary: finalSummary,
      totalEmployees: finalSummary.length
    });
  } catch (error) {
    console.error("❌ Summary error:", error);
    res.status(500).json({
      success: false,
      message: "Error calculating summary",
      error: error.message
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
 * 📌 Get Salaries with WeekOff Calculation - COMPLETELY FIXED VERSION
 */
exports.getSalaries = async (req, res) => {
  try {
    let { month } = req.query;

    if (!month) {
      const today = new Date();
      const y = today.getFullYear();
      const m = String(today.getMonth() + 1).padStart(2, "0");
      month = `${y}-${m}`;
    }

    const [year, m] = month.split("-");
    const start = new Date(year, m - 1, 1);
    const end = new Date(year, m, 0, 23, 59, 59, 999);

    const employees = await Employee.find({});
    const attendanceSummary = await AttendanceSummary.find({ month });

    const leaves = await Leave.find({
      $or: [
        { startDate: { $gte: start, $lte: end } },
        { endDate: { $gte: start, $lte: end } },
        {
          $and: [
            { startDate: { $lte: start } },
            { endDate: { $gte: end } }
          ]
        }
      ]
    });

    const salaryMap = {};

    employees.forEach((emp) => {

      const empSummary = attendanceSummary.find(
        (summary) => summary.employeeId === emp.employeeId
      );

      const empLeaves = leaves.filter(
        (leave) => leave.employeeId === emp.employeeId
      );

      // -------- LEAVE CALCULATION (FIXED, NO EXTRA DAY) --------
      const leaveTypes = {};
      let totalLeaves = 0;

      empLeaves.forEach((leave) => {
        const type = leave.leaveType?.toUpperCase() || "OTHER";
        if (!leaveTypes[type]) leaveTypes[type] = 0;

        const leaveStart = new Date(leave.startDate);
        const leaveEnd = new Date(leave.endDate || leave.startDate);

        const overlapStart = leaveStart < start ? start : leaveStart;
        const overlapEnd = leaveEnd > end ? end : leaveEnd;

        if (overlapStart <= overlapEnd) {
          const diffTime = overlapEnd - overlapStart;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          leaveTypes[type] += diffDays;
          totalLeaves += diffDays;
        }
      });

      // -------- ATTENDANCE ----------
      const presentDays = empSummary?.presentDays || 0;
      const halfDayWorking = empSummary?.halfDayWorking || 0;

      // --------*** USE EMPLOYEE’S OWN WEEKOFF ***--------
      const weekOffPerMonth = emp.weekOffPerMonth || 0;

      // -------- SALARY ----------
      const salaryPerMonth = emp.salaryPerMonth || 0;
      const dailyRate = salaryPerMonth / 30;

      // -------- PAID DAYS FORMULA ----------
      const paidDays = Math.max(
        0,
        presentDays + halfDayWorking * 0.5 + weekOffPerMonth - totalLeaves
      );

      const calculatedSalary = Math.round(paidDays * dailyRate);

      salaryMap[emp.employeeId] = {
        employeeId: emp.employeeId,
        name: emp.name,
        month,

        presentDays,
        halfDayWorking,
        weekOffs: weekOffPerMonth,

        totalLeaves,
        leaveTypes,

        salaryPerMonth,
        salaryPerDay: dailyRate.toFixed(2),
        paidDays,
        calculatedSalary,

        _debug: {
          presentDays,
          halfDayWorking,
          weekOffPerMonth,
          totalLeaves,
          paidDays
        }
      };
    });

    res.json({
      success: true,
      salaries: Object.values(salaryMap),
      totalEmployees: Object.values(salaryMap).length,
    });

  } catch (error) {
    console.error("❌ Salary error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
