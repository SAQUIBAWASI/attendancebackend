const CompOff = require("../models/CompOff");
const CompOffRequest = require("../models/CompOffRequest");
const Leave = require("../models/Leave");
const { logActivity } = require("./userActivity.controller");
const Notification = require("../models/Notification");
const Admin = require("../models/Admin");
const CompOffSettings = require("../models/CompOffSettings");
const Attendance = require("../models/Attendance");
const Employee = require("../models/Employee");
const Holiday = require("../models/Holiday");
const WeekOff = require("../models/WeekOff");
const mongoose = require("mongoose");

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_MAP = {
  sunday: 0, sun: 0,
  monday: 1, mon: 1,
  tuesday: 2, tue: 2,
  wednesday: 3, wed: 3,
  thursday: 4, thu: 4,
  friday: 5, fri: 5,
  saturday: 6, sat: 6
};

const resolveDayName = (dayName) => {
  if (!dayName) return "sunday";
  return String(dayName).trim().toLowerCase();
};


// ============ COMP-OFF FUNCTIONS ============

// ✅ Add Comp-off (from leave conversion)
exports.addCompOff = async (req, res) => {
  try {
    console.log("📩 Received comp-off data:", req.body);

    const { 
      employeeId, 
      employeeName, 
      originalLeaveId, 
      workDate, 
      reason,
      approvedBy 
    } = req.body;

    // Validation
    if (!employeeId || !employeeName || !originalLeaveId || !workDate) {
      return res.status(400).json({ 
        error: "Missing required fields: employeeId, employeeName, originalLeaveId, workDate" 
      });
    }

    // Check if leave exists
    const leave = await Leave.findById(originalLeaveId);
    if (!leave) {
      return res.status(404).json({ error: "Original leave not found" });
    }

    // Check if already converted
    if (leave.isConvertedToCompOff) {
      return res.status(400).json({ error: "Leave already converted to comp-off" });
    }

    // Create comp-off
    const compOff = new CompOff({
      employeeId,
      employeeName,
      originalLeaveId,
      workDate,
      reason: reason || `Comp-off for leave taken from ${new Date(leave.startDate).toLocaleDateString()} to ${new Date(leave.endDate).toLocaleDateString()}`,
      status: "approved",
      convertedFromLeave: true,
      approvedBy: approvedBy || "Admin",
      approvedDate: new Date()
    });

    await compOff.save();

    // Update the original leave
    leave.isConvertedToCompOff = true;
    leave.compOffId = compOff._id;
    leave.convertedDate = new Date();
    await leave.save();

    // Log activity
    await logActivity({
      userId: employeeId,
      userName: employeeName,
      userEmail: "",
      userRole: "employee",
      action: "comp_off_created",
      actionDetails: `Leave converted to comp-off for working on ${new Date(workDate).toLocaleDateString()}`,
      metadata: {
        compOffId: compOff._id,
        originalLeaveId,
        workDate,
        leaveDetails: {
          startDate: leave.startDate,
          endDate: leave.endDate,
          days: leave.days
        }
      }
    });

    // Notify employee
    await Notification.create({
      userId: employeeId,
      role: "employee",
      title: "Comp-off Created",
      message: `Your leave has been converted to comp-off for working on ${new Date(workDate).toLocaleDateString()}`,
      type: "comp_off"
    });

    res.status(201).json({
      message: "Comp-off created successfully",
      compOff,
      leave
    });

  } catch (error) {
    console.error("❌ Error creating comp-off:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get all comp-offs
exports.getCompOffs = async (req, res) => {
  try {
    const { employeeId, status } = req.query;
    
    let filter = {};
    if (employeeId) filter.employeeId = employeeId;
    if (status) filter.status = status;

    const compOffs = await CompOff.find(filter).sort({ createdAt: -1 });
    res.json(compOffs);
  } catch (error) {
    console.error("❌ Error fetching comp-offs:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get comp-offs by employee
exports.getCompOffsByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    const compOffs = await CompOff.find({ employeeId }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      records: compOffs
    });
  } catch (error) {
    console.error("❌ Error fetching employee comp-offs:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Update comp-off status
exports.updateCompOffStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, approvedBy } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const compOff = await CompOff.findById(id);
    if (!compOff) {
      return res.status(404).json({ error: "Comp-off not found" });
    }

    compOff.status = status;
    compOff.approvedBy = approvedBy || "Admin";
    compOff.approvedDate = new Date();

    await compOff.save();

    // If rejected, update the original leave
    if (status === "rejected" && compOff.originalLeaveId) {
      await Leave.findByIdAndUpdate(compOff.originalLeaveId, {
        isConvertedToCompOff: false,
        compOffId: null,
        convertedDate: null
      });
    }

    res.json(compOff);
  } catch (error) {
    console.error("❌ Error updating comp-off:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Delete comp-off
exports.deleteCompOff = async (req, res) => {
  try {
    const { id } = req.params;

    const compOff = await CompOff.findById(id);
    if (!compOff) {
      return res.status(404).json({ error: "Comp-off not found" });
    }

    // Update the original leave
    if (compOff.originalLeaveId) {
      await Leave.findByIdAndUpdate(compOff.originalLeaveId, {
        isConvertedToCompOff: false,
        compOffId: null,
        convertedDate: null
      });
    }

    await CompOff.findByIdAndDelete(id);

    res.json({ message: "Comp-off deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting comp-off:", error);
    res.status(500).json({ error: error.message });
  }
};

// ============ COMP-OFF REQUEST FUNCTIONS ============

/**
 * ✅ Create comp-off request (Employee)
 * Ab bina leave ke bhi request ja sakti hai (fresh comp-off)
 */
exports.createCompOffRequest = async (req, res) => {
  try {
    console.log("📩 Received comp-off request:", req.body);

    const {
      employeeId,
      employeeName,
      originalLeaveId,
      workDate,
      reason,
      extraDayDate,
      extraDayDetails,
      leaveId,
      leaveDetails
    } = req.body;

    // ✅ Determine actual work date (workDate ya extraDayDate)
    const actualWorkDate = workDate || extraDayDate;

    // ✅ Validation — sirf employeeId, employeeName, workDate zaroori
    if (!employeeId || !employeeName || !actualWorkDate) {
      return res.status(400).json({
        error: "Missing required fields: employeeId, employeeName, workDate/extraDayDate"
      });
    }

    // ✅ Agar leave hai toh check karo
    let leave = null;
    const actualLeaveId = originalLeaveId || leaveId;
    if (actualLeaveId) {
      leave = await Leave.findById(actualLeaveId);
      if (!leave) {
        return res.status(404).json({ error: "Leave not found" });
      }
    }

    const today = new Date();

    // ✅ Check Comp-Off Settings (if active admin setting exists, decrement it)
    const compOffSetting = await CompOffSettings.findOne({
      status: "active"
    }).sort({ createdAt: -1 });

    if (compOffSetting) {
      const validityFrom = compOffSetting.validityFrom ? new Date(compOffSetting.validityFrom) : null;
      const validityTo = compOffSetting.validityTo ? new Date(compOffSetting.validityTo) : null;
      if (validityTo) validityTo.setHours(23, 59, 59, 999);

      if ((validityFrom && today < validityFrom) || (validityTo && today > validityTo)) {
        compOffSetting.status = "expired";
        await compOffSetting.save();
      }
    }

    // ✅ Check duplicate pending request for same employee + same workDate
    const existingRequest = await CompOffRequest.findOne({
      employeeId,
      $or: [
        { workDate: actualWorkDate },
        { extraDayDate: actualWorkDate }
      ],
      status: "pending"
    });

    if (existingRequest) {
      return res.status(400).json({
        error: "You already have a pending request for this work date"
      });
    }

    // ✅ Calculate valid till — 15th of next month
    const workDateObj = new Date(actualWorkDate);
    const validTill = new Date(
      workDateObj.getFullYear(),
      workDateObj.getMonth() + 1,
      15,
      23, 59, 59, 999
    );

    // Validate that employee cannot claim an already expired extra day
    if (today > validTill) {
      return res.status(400).json({
        error: "Comp-off claim for this extra worked day has expired (valid till 15th of the following month)."
      });
    }

    // ✅ Create request
    const compOffRequest = new CompOffRequest({
      employeeId,
      employeeName,
      originalLeaveId: actualLeaveId || null,
      extraDayDate: extraDayDate || actualWorkDate,
      extraDayDetails: extraDayDetails || {
        date: actualWorkDate,
        day: new Date(actualWorkDate).toLocaleDateString('en-US', {
          weekday: 'long', day: 'numeric', month: 'short', year: 'numeric'
        }),
        totalHours: 8,
        extraHours: 0,
        workType: "Week-off Work"
      },
      leaveDetails: leaveDetails || (leave ? {
        leaveType: leave.leaveType,
        startDate: leave.startDate,
        endDate: leave.endDate,
        days: leave.days,
        reason: leave.reason,
        status: leave.status
      } : null),
      workDate: actualWorkDate,
      reason: reason || "Comp-off request",
      status: "pending",
      validTill: validTill
    });

    await compOffRequest.save();

    // ✅ Sync to ExtraDayCompOff with same _id (so all admin views see the request)
    try {
      const ExtraDayCompOff = require("../models/ExtraDayCompOff");
      const edDate = actualWorkDate ? new Date(actualWorkDate) : new Date();
      await ExtraDayCompOff.findOneAndUpdate(
        { _id: compOffRequest._id },
        {
          _id: compOffRequest._id,
          employeeId: employee.employeeId,
          employeeName: employee.name,
          extraDayDate: edDate,
          extraDayDetails: extraDayDetails || {
            day: actualWorkDate,
            date: edDate,
            totalHours: 8,
            extraHours: 0
          },
          leaveId: actualLeaveId || null,
          leaveDetails: leaveDetails || (leave ? {
            leaveType: leave.leaveType,
            startDate: leave.startDate,
            endDate: leave.endDate,
            days: leave.days,
            reason: leave.reason,
            status: leave.status
          } : null),
          reason: reason || "Comp-off request",
          status: "pending",
          workDate: edDate
        },
        { upsert: true, new: true }
      );
    } catch (syncErr) {
      console.warn("⚠️ Sync to ExtraDayCompOff (non-critical):", syncErr.message);
    }

    // ✅ Reduce comp-off count if active setting exists
    if (compOffSetting && compOffSetting.status === "active" && compOffSetting.totalCompOff > 0) {
      compOffSetting.totalCompOff = compOffSetting.totalCompOff - 1;
      await compOffSetting.save();
    }

    // ✅ Notify admins (non-critical)
    try {
      const admins = await Admin.find({
        role: { $regex: /^admin$/i }
      });

      for (const admin of admins) {
        await Notification.create({
          userId: admin.email,
          role: "admin",
          title: "New Comp-off Request",
          message: `${employeeName} requested comp-off for ${new Date(actualWorkDate).toLocaleDateString()}`,
          type: "comp_off_request",
          metadata: {
            requestId: compOffRequest._id,
            employeeId,
            leaveId: actualLeaveId || null
          }
        });
      }
    } catch (notifErr) {
      console.warn("⚠️ Notification error (non-critical):", notifErr.message);
    }

    res.status(201).json({
      success: true,
      message: "Comp-off request submitted successfully",
      remainingCompOff: compOffSetting?.totalCompOff || 0,
      compOffRequest
    });

  } catch (error) {
    console.error("❌ Error creating comp-off request:", error);
    res.status(500).json({
      error: error.message
    });
  }
};

// ✅ Get all comp-off requests (Admin)
exports.getCompOffRequests = async (req, res) => {
  try {
    const { status, employeeId } = req.query;
    
    let filter = {};
    if (status && status !== 'all') filter.status = status;
    if (employeeId) filter.employeeId = employeeId;

    const requests = await CompOffRequest.find(filter)
      .populate('originalLeaveId')
      .sort({ createdAt: -1 });
      
    res.json(requests);
  } catch (error) {
    console.error("❌ Error fetching comp-off requests:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * ✅ Get employee's comp-off requests (with clean response)
 */
exports.getEmployeeCompOffRequests = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const requests = await CompOffRequest.find({ employeeId })
      .populate("originalLeaveId")
      .sort({ createdAt: -1 });

    const compOffSetting = await CompOffSettings.findOne({
      status: "active"
    }).sort({ createdAt: -1 });

    const totalCompOff = compOffSetting?.totalCompOff || 0;
    const usedCompOffCount = requests.filter(
      (item) => item.status === "approved" || item.status === "pending"
    ).length;
    const remainingCompOffCount = totalCompOff - usedCompOffCount;

    const validityFrom = compOffSetting?.validityFrom || null;
    const validityTo = compOffSetting?.validityTo || null;

    const now = new Date();
    let isValid = false;
    if (validityFrom && validityTo) {
      const fromDate = new Date(validityFrom);
      const toDate = new Date(validityTo);
      toDate.setHours(23, 59, 59, 999);
      if (now >= fromDate && now <= toDate) {
        isValid = true;
      }
    }

    // ✅ Frontend ke liye data clean karo
    const cleanedRecords = requests.map((req) => {
      const reqObj = req.toObject();
      const workDate = reqObj.workDate || reqObj.extraDayDate;

      return {
        _id: reqObj._id,
        employeeId: reqObj.employeeId,
        employeeName: reqObj.employeeName,
        workDate: workDate,
        leaveDate: reqObj.leaveDetails?.startDate || workDate,
        extraDayDate: reqObj.extraDayDate || workDate,
        extraDayDetails: reqObj.extraDayDetails || {
          date: workDate,
          workType: "Week-off Work",
          totalHours: 8
        },
        leaveDetails: reqObj.leaveDetails || null,
        count: reqObj.count || 1,
        reason: reqObj.reason || "-",
        status: reqObj.status,
        approvedBy: reqObj.approvedBy || null,
        approvedDate: reqObj.approvedDate || null,
        rejectionReason: reqObj.rejectionReason || "",
        createdAt: reqObj.createdAt,
        validTill: reqObj.validTill || null
      };
    });

    res.json({
      success: true,
      totalCompOff,
      usedCompOffCount,
      remainingCompOffCount: remainingCompOffCount > 0 ? remainingCompOffCount : 0,
      validityFrom,
      validityTo,
      isValidPeriod: isValid,
      status: compOffSetting?.status || "inactive",
      records: cleanedRecords
    });

  } catch (error) {
    console.error("❌ Error fetching employee comp-off requests:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ✅ Approve comp-off request
exports.approveCompOffRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { approvedBy } = req.body;

    const request = await CompOffRequest.findById(id).populate('originalLeaveId');
    if (!request) {
      return res.status(404).json({ error: "Comp-off request not found" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ error: "Request already processed" });
    }

    // Create comp-off
    const compOff = new CompOff({
      employeeId: request.employeeId,
      employeeName: request.employeeName,
      originalLeaveId: request.originalLeaveId?._id || null,
      workDate: request.workDate,
      reason: request.reason,
      status: "approved",
      convertedFromLeave: !!request.originalLeaveId,
      approvedBy: approvedBy || "Admin",
      approvedDate: new Date()
    });

    await compOff.save();

    // Update the original leave (agar hai)
    if (request.originalLeaveId) {
      request.originalLeaveId.isConvertedToCompOff = true;
      request.originalLeaveId.compOffId = compOff._id;
      request.originalLeaveId.convertedDate = new Date();
      await request.originalLeaveId.save();
    }

    // Update request
    request.status = "approved";
    request.approvedBy = approvedBy || "Admin";
    request.approvedDate = new Date();
    request.convertedToCompOff = true;
    request.compOffId = compOff._id;
    await request.save();

    // Sync to ExtraDayCompOff if exists
    try {
      const ExtraDayCompOff = require("../models/ExtraDayCompOff");
      await ExtraDayCompOff.findByIdAndUpdate(id, {
        status: "approved",
        approvedBy: approvedBy || "Admin",
        approvedAt: new Date(),
        convertedToCompOff: true
      });
    } catch (syncErr) {
      console.warn("⚠️ Sync approve to ExtraDayCompOff (non-critical):", syncErr.message);
    }

    // Notify employee
    await Notification.create({
      userId: request.employeeId,
      role: "employee",
      title: "Comp-off Request Approved",
      message: `Your comp-off request for ${new Date(request.workDate).toLocaleDateString()} has been approved`,
      type: "comp_off_approved"
    });

    res.json({
      message: "Comp-off request approved successfully",
      request,
      compOff
    });

  } catch (error) {
    console.error("❌ Error approving comp-off request:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Reject comp-off request
exports.rejectCompOffRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { approvedBy, rejectionReason } = req.body;

    const request = await CompOffRequest.findById(id);
    if (!request) {
      return res.status(404).json({ error: "Comp-off request not found" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ error: "Request already processed" });
    }

    request.status = "rejected";
    request.approvedBy = approvedBy || "Admin";
    request.approvedDate = new Date();
    request.rejectionReason = rejectionReason || "";
    await request.save();

    // Sync to ExtraDayCompOff if exists
    try {
      const ExtraDayCompOff = require("../models/ExtraDayCompOff");
      await ExtraDayCompOff.findByIdAndUpdate(id, {
        status: "rejected",
        approvedBy: approvedBy || "Admin",
        rejectedReason: rejectionReason || ""
      });
    } catch (syncErr) {
      console.warn("⚠️ Sync reject to ExtraDayCompOff (non-critical):", syncErr.message);
    }

    // Notify employee
    await Notification.create({
      userId: request.employeeId,
      role: "employee",
      title: "Comp-off Request Rejected",
      message: `Your comp-off request for ${new Date(request.workDate).toLocaleDateString()} was rejected${rejectionReason ? `: ${rejectionReason}` : ''}`,
      type: "comp_off_rejected"
    });

    res.json({
      message: "Comp-off request rejected",
      request
    });

  } catch (error) {
    console.error("❌ Error rejecting comp-off request:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ UPDATE comp-off (Edit count and reason)
exports.updateCompOff = async (req, res) => {
  try {
    const { id } = req.params;
    const { count, reason, updatedBy } = req.body;

    console.log("📩 Updating comp-off:", { id, count, reason });

    const compOff = await CompOff.findById(id);
    if (!compOff) {
      return res.status(404).json({ error: "Comp-off not found" });
    }

    if (count !== undefined && count !== null) {
      compOff.count = count;
    }
    if (reason !== undefined) {
      compOff.reason = reason;
    }
    compOff.updatedBy = updatedBy || "Admin";
    compOff.updatedAt = new Date();

    await compOff.save();

    res.json({
      success: true,
      message: "Comp-off updated successfully",
      compOff
    });

  } catch (error) {
    console.error("❌ Error updating comp-off:", error);
    res.status(500).json({ error: error.message });
  }
};

// ============ ✅ NEW: EXTRA WORKED DAYS ============

/**
 * ✅ Get extra worked days for employee
 * Week-off day pe kaam kiya ho ya holiday pe — wo din return karega
 * Har din ki expiry 15th of next month
 */
exports.getExtraWorkedDays = async (req, res) => {
  try {
    const { employeeId } = req.params;

    if (!employeeId) {
      return res.status(400).json({ success: false, error: "Employee ID required" });
    }

    const cleanEmpId = String(employeeId).trim();

    // 1. Employee lookup (flexible: employeeId or _id)
    const employee = await Employee.findOne({
      $or: [
        { employeeId: cleanEmpId },
        { employeeId: { $regex: new RegExp(`^${cleanEmpId}$`, "i") } },
        ...(mongoose.Types.ObjectId.isValid(cleanEmpId) ? [{ _id: cleanEmpId }] : [])
      ]
    });

    if (!employee) {
      return res.status(404).json({ success: false, error: "Employee not found" });
    }

    const empId = employee.employeeId;
    const fallbackWeekOffDay = employee.weekOffDay || "Sunday";
    const fallbackWeekOffDayNum = DAY_NAMES.indexOf(fallbackWeekOffDay) !== -1 ? DAY_NAMES.indexOf(fallbackWeekOffDay) : 0;

    // 2. Last 3 months attendance fetch
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    threeMonthsAgo.setHours(0, 0, 0, 0);

    const attendanceRecords = await Attendance.find({
      $or: [
        { employeeId: empId },
        { employeeId: cleanEmpId },
        ...(employee._id ? [{ employee: employee._id }] : [])
      ],
      checkInTime: { $gte: threeMonthsAgo }
    }).sort({ checkInTime: -1 }).lean();

    // 3. Fetch active holidays
    const holidays = await Holiday.find({ isActive: { $ne: false } }).lean();
    const holidayMap = new Map();
    holidays.forEach(h => {
      let cur = new Date(h.fromDate);
      const end = new Date(h.toDate || h.fromDate);
      while (cur <= end) {
        holidayMap.set(cur.toISOString().slice(0, 10), h.name);
        cur.setDate(cur.getDate() + 1);
      }
    });

    // 4. Fetch assigned week-offs from WeekOff collection
    const allWeekOffRecords = await WeekOff.find({}).lean();
    const assignedWeekOffDates = new Set();

    allWeekOffRecords.forEach(rec => {
      const isForThisEmp = rec.selectAllEmployees || (Array.isArray(rec.selectedEmployees) && rec.selectedEmployees.some(e => String(e.employeeId) === empId));
      if (!isForThisEmp) return;

      if (Array.isArray(rec.specificDates)) {
        rec.specificDates.forEach(d => assignedWeekOffDates.add(d));
      }

      // Check weekly / weekwise patterns across the last 3 months
      const curYear = new Date().getFullYear();
      const curMonth = new Date().getMonth() + 1;
      for (let mOffset = -3; mOffset <= 1; mOffset++) {
        const d = new Date(curYear, curMonth - 1 + mOffset, 1);
        const yr = d.getFullYear();
        const mo = d.getMonth() + 1;
        const mStr = `${yr}-${String(mo).padStart(2, "0")}`;
        const daysInMonth = new Date(yr, mo, 0).getDate();

        if (Array.isArray(rec.selectedMonths) && rec.selectedMonths.length > 0 && !rec.selectedMonths.includes(mStr)) {
          continue;
        }

        if ((rec.selectionMode === "weekly" || !rec.selectionMode) && Array.isArray(rec.weekOffDays)) {
          rec.weekOffDays.forEach(dayName => {
            const targetDay = DAY_MAP[resolveDayName(dayName)];
            if (targetDay === undefined) return;
            for (let day = 1; day <= daysInMonth; day++) {
              const checkD = new Date(yr, mo - 1, day);
              if (checkD.getDay() === targetDay) {
                assignedWeekOffDates.add(`${yr}-${String(mo).padStart(2, "0")}-${String(day).padStart(2, "0")}`);
              }
            }
          });
        }

        if (rec.selectionMode === "weekwise" && Array.isArray(rec.weekwiseSelection)) {
          rec.weekwiseSelection.forEach(({ week, day }) => {
            const targetDay = DAY_MAP[resolveDayName(day)];
            if (targetDay === undefined) return;
            const firstDayOfMonth = new Date(yr, mo - 1, 1);
            const offset = (targetDay - firstDayOfMonth.getDay() + 7) % 7;
            const dayNum = 1 + offset + (week - 1) * 7;
            if (dayNum >= 1 && dayNum <= daysInMonth) {
              assignedWeekOffDates.add(`${yr}-${String(mo).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`);
            }
          });
        }
      }
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Group attendances by date (YYYY-MM-DD)
    const dailyMap = new Map();
    attendanceRecords.forEach(rec => {
      if (!rec.checkInTime) return;
      const dateKey = new Date(rec.checkInTime).toISOString().split('T')[0];
      if (!dailyMap.has(dateKey)) dailyMap.set(dateKey, []);
      dailyMap.get(dateKey).push(rec);
    });

    // Fetch existing comp-off requests
    const compOffRequests = await CompOffRequest.find({ employeeId: empId }).lean();
    const requestByWorkDate = new Map();
    compOffRequests.forEach(r => {
      const d = r.workDate || r.extraDayDate;
      if (d) requestByWorkDate.set(d, r);
    });

    const extraDays = [];

    for (const [dateKey, recs] of dailyMap.entries()) {
      const dateObj = new Date(dateKey + 'T00:00:00');
      const dayOfWeek = dateObj.getDay();

      const isSunday = (dayOfWeek === 0);
      const isEmployeeWeekOffDay = (dayOfWeek === fallbackWeekOffDayNum);
      const isAssignedWeekOff = assignedWeekOffDates.has(dateKey);
      const isWeekOff = isSunday || isEmployeeWeekOffDay || isAssignedWeekOff;
      const isHoliday = holidayMap.has(dateKey);
      const holidayName = holidayMap.get(dateKey);

      if (!isWeekOff && !isHoliday) continue;

      let totalHours = 0;
      recs.forEach(rec => {
        let h = 0;
        if (rec.totalHours && rec.totalHours > 0) {
          h = parseFloat(rec.totalHours);
        } else if (rec.checkInTime && rec.checkOutTime) {
          h = (new Date(rec.checkOutTime) - new Date(rec.checkInTime)) / (1000 * 60 * 60);
        } else if (rec.checkInTime) {
          h = parseFloat(rec.assignedShiftHours) || 8;
        }
        totalHours += h;
      });

      if (totalHours <= 0) continue;

      const existingRequest = requestByWorkDate.get(dateKey);
      let requestStatus = "available";
      let status = "active";

      if (existingRequest) {
        if (existingRequest.status === "approved") {
          requestStatus = "approved";
          status = "used";
        } else if (existingRequest.status === "pending") {
          requestStatus = "pending";
          status = "pending";
        } else if (existingRequest.status === "rejected") {
          requestStatus = "rejected";
          status = "active";
        }
      }

      // Expiry check: 15th of next month at 23:59:59.999
      const parts = dateKey.split('-').map(Number);
      const workYear = parts[0];
      const workMonth = parts[1] - 1;
      const expiryDate = new Date(workYear, workMonth + 1, 15, 23, 59, 59, 999);
      const isExpired = today > expiryDate;

      if (isExpired && requestStatus === "available") {
        requestStatus = "expired";
        status = "expired";
      }

      let workType = "Week-off Work";
      if (isHoliday && isWeekOff) {
        workType = `Holiday & Week-off Work (${holidayName})`;
      } else if (isHoliday) {
        workType = `Holiday Work (${holidayName})`;
      }

      const validTillFormatted = expiryDate.toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric'
      });

      extraDays.push({
        date: dateKey,
        day: dateObj.toLocaleDateString('en-US', {
          weekday: 'long', day: 'numeric', month: 'short', year: 'numeric'
        }),
        workType,
        totalHours: Number(totalHours.toFixed(2)),
        extraHours: Number((totalHours - 8 > 0 ? totalHours - 8 : 0).toFixed(2)),
        status,
        requestStatus,
        isExpired,
        validTillFormatted
      });
    }

    // Sort by date descending
    extraDays.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      success: true,
      count: extraDays.length,
      extraDays
    });

  } catch (error) {
    console.error("❌ Error fetching extra worked days:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};



// ============ COMP-OFF SETTINGS ============

exports.addCompOffSettings = async (req, res) => {
  try {
    const { totalCompOff, validityFrom, validityTo } = req.body;

    const compOff = new CompOffSettings({
      totalCompOff,
      validityFrom,
      validityTo,
      status: "active"
    });

    await compOff.save();

    res.status(201).json({
      success: true,
      message: "Comp-Off settings added successfully",
      data: compOff
    });

  } catch (error) {
    console.error("❌ Error adding comp-off settings:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getAllCompOffSettings = async (req, res) => {
  try {
    const data = await CompOffSettings.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: data.length,
      data
    });
  } catch (error) {
    console.error("❌ Error fetching comp-off settings:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateCompOffSettings = async (req, res) => {
  try {
    const { id } = req.params;
    const { totalCompOff, validityFrom, validityTo, status } = req.body;

    const compOff = await CompOffSettings.findById(id);
    if (!compOff) {
      return res.status(404).json({
        success: false,
        message: "Comp-Off settings not found"
      });
    }

    if (totalCompOff !== undefined) compOff.totalCompOff = totalCompOff;
    if (validityFrom) compOff.validityFrom = validityFrom;
    if (validityTo) compOff.validityTo = validityTo;
    if (status) compOff.status = status;

    await compOff.save();

    res.status(200).json({
      success: true,
      message: "Comp-Off settings updated successfully",
      data: compOff
    });
  } catch (error) {
    console.error("❌ Error updating comp-off settings:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.deleteCompOffSettings = async (req, res) => {
  try {
    const { id } = req.params;

    const compOff = await CompOffSettings.findById(id);
    if (!compOff) {
      return res.status(404).json({
        success: false,
        message: "Comp-Off settings not found"
      });
    }

    await CompOffSettings.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Comp-Off settings deleted successfully"
    });
  } catch (error) {
    console.error("❌ Error deleting comp-off settings:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};