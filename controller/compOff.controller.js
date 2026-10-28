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
    const { status, rejectedReason, approvedBy } = req.body;

    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be "approved" or "rejected"'
      });
    }

    let extraDayReq = await ExtraDayCompOff.findById(id);
    let compOffReq = await CompOffRequest.findById(id).populate('originalLeaveId');

    if (!extraDayReq && !compOffReq) {
      return res.status(404).json({
        success: false,
        error: 'Comp-off request not found'
      });
    }

    const currentStatus = (extraDayReq ? extraDayReq.status : compOffReq.status);
    if (currentStatus !== 'pending') {
      return res.status(400).json({
        success: false,
        error: `Request is already ${currentStatus}`
      });
    }

    const finalApprovedBy = approvedBy || req.admin?.name || 'Admin';
    const now = new Date();

    if (status === 'approved') {
      // 1. Process CompOffRequest if present
      let compOffRecord = null;
      if (compOffReq) {
        compOffReq.status = "approved";
        compOffReq.approvedBy = finalApprovedBy;
        compOffReq.approvedDate = now;
        compOffReq.convertedToCompOff = true;

        // ✅ FIX: Extract Leave Date (22 Oct)
        const actualLeaveDate = compOffReq.leaveDetails?.startDate || compOffReq.leaveDate || compOffReq.workDate;

        compOffRecord = new CompOff({
          employeeId: compOffReq.employeeId,
          employeeName: compOffReq.employeeName,
          originalLeaveId: compOffReq.originalLeaveId?._id || null,
          workDate: compOffReq.workDate,
          leaveDate: actualLeaveDate, // ✅ Save Leave Date
          reason: compOffReq.reason,
          status: "approved",
          convertedFromLeave: !!compOffReq.originalLeaveId,
          approvedBy: finalApprovedBy,
          approvedDate: now
        });
        await compOffRecord.save();
        compOffReq.compOffId = compOffRecord._id;

        if (compOffReq.originalLeaveId) {
          await Leave.findByIdAndUpdate(compOffReq.originalLeaveId._id, {
            isConvertedToCompOff: true,
            compOffId: compOffRecord._id,
            convertedDate: now
          });
        }
        await compOffReq.save();
      }

      // 2. Process ExtraDayCompOff if present
      const empId = (extraDayReq && extraDayReq.employeeId) || (compOffReq && compOffReq.employeeId);
      const leaveDate = (extraDayReq && (extraDayReq.leaveDetails?.startDate || extraDayReq.extraDayDate)) ||
                        (compOffReq && (compOffReq.leaveDetails?.startDate || compOffReq.workDate || compOffReq.extraDayDate)) ||
                        now;

      if (extraDayReq) {
        extraDayReq.status = 'approved';
        extraDayReq.approvedBy = finalApprovedBy;
        extraDayReq.approvedAt = now;
        extraDayReq.convertedToCompOff = true;
        extraDayReq.workDate = new Date(leaveDate);

        if (!compOffRecord) {
          compOffRecord = new CompOff({
            employeeId: extraDayReq.employeeId,
            employeeName: extraDayReq.employeeName,
            workDate: extraDayReq.workDate,
            leaveDate: leaveDate, // ✅ Save Leave Date
            reason: extraDayReq.reason,
            status: "approved",
            convertedFromLeave: !!extraDayReq.leaveDetails,
            approvedBy: finalApprovedBy,
            approvedDate: now
          });
          await compOffRecord.save();
        }
      }

      // 3. Mark/create attendance if applicable (Comp-off day)
      try {
        const employee = await Employee.findOne({ employeeId: empId });
        if (employee) {
          const leaveDateObj = new Date(leaveDate);
          leaveDateObj.setHours(0, 0, 0, 0);

          let checkInTime = new Date(leaveDateObj);
          let checkOutTime = new Date(leaveDateObj);
          let shiftHours = employee.shiftHours || 8;

          try {
            const shift = await Shift.findOne({
              'employeeAssignment.employeeId': empId
            });
            if (shift && shift.employeeAssignment?.selectedTimeRange) {
              const times = shift.employeeAssignment.selectedTimeRange.split(' - ');
              if (times.length === 2) {
                const startParts = times[0].trim().match(/(\d+):(\d+)\s*(AM|PM)/i);
                if (startParts) {
                  let startHour = parseInt(startParts[1]);
                  const startMinute = parseInt(startParts[2]);
                  const startAmPm = startParts[3].toUpperCase();
                  if (startAmPm === 'PM' && startHour !== 12) startHour += 12;
                  if (startAmPm === 'AM' && startHour === 12) startHour = 0;
                  checkInTime.setHours(startHour, startMinute, 0, 0);
                }
                const endParts = times[1].trim().match(/(\d+):(\d+)\s*(AM|PM)/i);
                if (endParts) {
                  let endHour = parseInt(endParts[1]);
                  const endMinute = parseInt(endParts[2]);
                  const endAmPm = endParts[3].toUpperCase();
                  if (endAmPm === 'PM' && endHour !== 12) endHour += 12;
                  if (endAmPm === 'AM' && endHour === 12) endHour = 0;
                  if (endHour < checkInTime.getHours()) {
                    checkOutTime.setDate(checkOutTime.getDate() + 1);
                  }
                  checkOutTime.setHours(endHour, endMinute, 0, 0);
                }
                const diffMs = checkOutTime - checkInTime;
                shiftHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
              }
            }
          } catch (shiftErr) {
            checkInTime.setHours(10, 0, 0, 0);
            checkOutTime.setHours(19, 0, 0, 0);
            shiftHours = employee.shiftHours || 8;
          }

          const existingAttendance = await Attendance.findOne({
            employeeId: empId,
            checkInTime: {
              $gte: new Date(leaveDateObj),
              $lt: new Date(leaveDateObj.getTime() + 24 * 60 * 60 * 1000)
            }
          });

          if (existingAttendance) {
            existingAttendance.status = 'comp-off';
            existingAttendance.checkInTime = checkInTime;
            existingAttendance.checkOutTime = checkOutTime;
            existingAttendance.totalHours = shiftHours;
            existingAttendance.workingHours = shiftHours;
            existingAttendance.assignedShiftHours = shiftHours;
            existingAttendance.otHours = 0;
            existingAttendance.reason = `Comp-off (Approved on ${now.toLocaleDateString()})`;
            existingAttendance.isCompOff = true;
            existingAttendance.compOffRequestId = id;
            existingAttendance.updatedAt = now;
            await existingAttendance.save();
            if (extraDayReq) extraDayReq.attendanceId = existingAttendance._id;
          } else {
            const attendance = new Attendance({
              employeeId: empId,
              employeeEmail: employee.email || '',
              checkInTime,
              checkOutTime,
              status: 'comp-off',
              totalBreakMinutes: 0,
              totalHours: shiftHours,
              workingHours: shiftHours,
              assignedShiftHours: shiftHours,
              otHours: 0,
              basicSalary: employee.salaryPerMonth || 0,
              workingDays: employee.workingDays || 26,
              otMultiplier: 2,
              hourlyRate: (employee.salaryPerMonth || 0) / ((employee.workingDays || 26) * (employee.shiftHours || 8)),
              officeName: 'Comp-off',
              reason: `Comp-off (Approved on ${now.toLocaleDateString()})`,
              comment: `Comp-off approved`,
              breaks: [],
              isCompOff: true,
              compOffRequestId: id
            });
            await attendance.save();
            if (extraDayReq) extraDayReq.attendanceId = attendance._id;
          }
        }
      } catch (attErr) {
        console.warn('⚠️ Attendance update (non-critical):', attErr.message);
      }

      if (extraDayReq) await extraDayReq.save();

      // 4. Notify employee
      try {
        await Notification.create({
          userId: empId,
          role: "employee",
          title: "Comp-off Request Approved",
          message: `Your comp-off request for ${new Date(leaveDate).toLocaleDateString()} has been approved`,
          type: "comp_off_approved"
        });
      } catch (notifErr) {
        console.warn('⚠️ Notification error (non-critical):', notifErr.message);
      }

    } else if (status === 'rejected') {
      const reason = rejectedReason || req.body.rejectionReason || '';
      if (compOffReq) {
        compOffReq.status = 'rejected';
        compOffReq.approvedBy = finalApprovedBy;
        compOffReq.approvedDate = now;
        compOffReq.rejectionReason = reason;
        await compOffReq.save();
      }
      if (extraDayReq) {
        extraDayReq.status = 'rejected';
        extraDayReq.rejectedReason = reason;
        extraDayReq.updatedAt = now;
        await extraDayReq.save();
      }

      const empId = (extraDayReq && extraDayReq.employeeId) || (compOffReq && compOffReq.employeeId);
      const leaveDate = (extraDayReq && (extraDayReq.leaveDetails?.startDate || extraDayReq.extraDayDate)) ||
                        (compOffReq && (compOffReq.workDate || compOffReq.extraDayDate)) ||
                        now;
      try {
        await Notification.create({
          userId: empId,
          role: "employee",
          title: "Comp-off Request Rejected",
          message: `Your comp-off request for ${new Date(leaveDate).toLocaleDateString()} was rejected${reason ? `: ${reason}` : ''}`,
          type: "comp_off_rejected"
        });
      } catch (notifErr) {
        console.warn('⚠️ Notification error (non-critical):', notifErr.message);
      }
    }

    const updatedData = extraDayReq || compOffReq;

    res.status(200).json({
      success: true,
      message: `Comp-off request ${status} successfully`,
      data: updatedData
    });

  } catch (error) {
    console.error('Error in updateCompOffStatus:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
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

    // ✅ YAHAN FIX HAI: Leave Date nikaal kar CompOff mein save karo
    const actualLeaveDate = request.leaveDetails?.startDate || request.leaveDate || request.workDate;

    // Create comp-off
    const compOff = new CompOff({
      employeeId: request.employeeId,
      employeeName: request.employeeName,
      originalLeaveId: request.originalLeaveId?._id || null,
      workDate: request.workDate,
      leaveDate: actualLeaveDate, // ✅ Save Leave Date (22 Oct)
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
      message: `Your comp-off request for ${new Date(actualLeaveDate).toLocaleDateString()} has been approved`,
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
    if (!employeeId) return res.status(400).json({ success: false, error: "Employee ID required" });

    const cleanEmpId = String(employeeId).trim();

    const employee = await Employee.findOne({
      $or: [
        { employeeId: cleanEmpId },
        { employeeId: { $regex: new RegExp(`^${cleanEmpId}$`, "i") } },
        ...(mongoose.Types.ObjectId.isValid(cleanEmpId) ? [{ _id: cleanEmpId }] : [])
      ]
    });

    if (!employee) return res.status(404).json({ success: false, error: "Employee not found" });

    const empId = employee.employeeId;
    
    // ❌ Yahan se fallbackWeekOffDay hataya gaya hai taaki bina matlab ke extra din na aayein
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

    // Fetch active holidays
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

    // Fetch assigned week-offs from WeekOff collection
    const allWeekOffRecords = await WeekOff.find({}).lean();
    const assignedWeekOffDates = new Set();

    allWeekOffRecords.forEach(rec => {
      const isForThisEmp = rec.selectAllEmployees || (Array.isArray(rec.selectedEmployees) && rec.selectedEmployees.some(e => String(e.employeeId) === empId));
      if (!isForThisEmp) return;

      if (Array.isArray(rec.specificDates)) {
        rec.specificDates.forEach(d => assignedWeekOffDates.add(d));
      }

      const curYear = new Date().getFullYear();
      const curMonth = new Date().getMonth() + 1;
      for (let mOffset = -3; mOffset <= 1; mOffset++) {
        const d = new Date(curYear, curMonth - 1 + mOffset, 1);
        const yr = d.getFullYear();
        const mo = d.getMonth() + 1;
        const mStr = `${yr}-${String(mo).padStart(2, "0")}`;
        const daysInMonth = new Date(yr, mo, 0).getDate();

        if (Array.isArray(rec.selectedMonths) && rec.selectedMonths.length > 0 && !rec.selectedMonths.includes(mStr)) continue;

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

    const dailyMap = new Map();
    attendanceRecords.forEach(rec => {
      if (!rec.checkInTime) return;
      const d = new Date(rec.checkInTime);
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      
      if (!dailyMap.has(dateKey)) dailyMap.set(dateKey, []);
      dailyMap.get(dateKey).push(rec);
    });

    const compOffRequests = await CompOffRequest.find({ employeeId: empId }).lean();
    const requestByWorkDate = new Map();
    compOffRequests.forEach(r => {
      const d = r.workDate || r.extraDayDate;
      if (d) {
        const dateObj = new Date(d);
        const reqDateKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
        requestByWorkDate.set(reqDateKey, r);
      }
    });

    const extraDays = [];

    for (const [dateKey, recs] of dailyMap.entries()) {
      const dateObj = new Date(dateKey + 'T00:00:00');

      // ✅ FIX: SIRF WeekOff collection aur Holiday collection check hoga
      const isAssignedWeekOff = assignedWeekOffDates.has(dateKey);
      const isHoliday = holidayMap.has(dateKey);
      const holidayName = holidayMap.get(dateKey);

      if (!isAssignedWeekOff && !isHoliday) continue;

      let totalHours = 0;
      recs.forEach(rec => {
        let h = 0;
        if (rec.totalHours && rec.totalHours > 0) h = parseFloat(rec.totalHours);
        else if (rec.checkInTime && rec.checkOutTime) h = (new Date(rec.checkOutTime) - new Date(rec.checkInTime)) / (1000 * 60 * 60);
        else if (rec.checkInTime) h = parseFloat(rec.assignedShiftHours) || 8;
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

      const parts = dateKey.split('-').map(Number);
      const expiryDate = new Date(parts[0], parts[1] - 1 + 1, 15, 23, 59, 59, 999);
      const isExpired = today > expiryDate;

      if (isExpired && requestStatus === "available") {
        requestStatus = "expired";
        status = "expired";
      }

      let workType = "";
      if (isHoliday && isAssignedWeekOff) workType = `Holiday & Week-off Work (${holidayName})`;
      else if (isHoliday) workType = `Holiday Work (${holidayName})`;
      else if (isAssignedWeekOff) workType = `Week-off Work`;

      const validTillFormatted = expiryDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

      extraDays.push({
        date: dateKey,
        day: dateObj.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' }),
        workType,
        totalHours: Number(totalHours.toFixed(2)),
        extraHours: Number((totalHours - 8 > 0 ? totalHours - 8 : 0).toFixed(2)),
        status,
        requestStatus,
        isExpired,
        validTillFormatted
      });
    }

    extraDays.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({ success: true, count: extraDays.length, extraDays });
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