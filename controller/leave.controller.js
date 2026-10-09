// const Leave = require("../models/Leave");
// const { logActivity } = require("./userActivity.controller");
// const Notification = require("../models/Notification"); // ✅ Import Notification Model
// const { sendPushToUser } = require("./notification.controller"); // ✅ Import Push Helper
// const Admin = require("../models/Admin"); // ✅ Import Admin Model

// // ✅ Add new leave
// exports.addLeave = async (req, res) => {
//   try {
//     console.log("📩 Received body:", req.body);

//     const { employeeId, employeeName, leaveType, startDate, endDate, reason, days } = req.body;

//     if (!employeeId || !employeeName || !leaveType || !startDate || !endDate || !reason) {
//       return res.status(400).json({ message: "All fields are required" });
//     }

//     const newLeave = new Leave({
//       employeeId,
//       employeeName,
//       leaveType,
//       startDate,
//       endDate,
//       reason,
//       days,
//       status: "pending",
//     });

//     await newLeave.save();

//     console.log("✅ Leave saved successfully:", newLeave);

//     // ✅ Log leave application activity
//     await logActivity({
//       userId: employeeId,
//       userName: employeeName,
//       userEmail: "", 
//       userRole: "employee",
//       action: "leave_apply",
//       actionDetails: `Applied for ${leaveType} from ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()} (${days} days)`,
//       metadata: {
//         leaveId: newLeave._id,
//         leaveType,
//         startDate,
//         endDate,
//         days,
//         reason,
//       },
//     });

//     // 🔔 NOTIFY ADMINS
//     console.log("🔔 Creating Leave Notification...");
//     const admins = await Admin.find({ role: { $regex: /^admin$/i } });
//     console.log(`🔔 Found ${admins.length} admins to notify`);
//     for (const admin of admins) {
//       console.log(`🔔 Notifying admin: ${admin.email}`);
//       await Notification.create({
//         userId: admin.email,
//         role: "admin",
//         title: "New Leave Request",
//         message: `${employeeName} applied for ${leaveType} (${days} days)`,
//         type: "leave"
//       });
//       // Send Push
//       sendPushToUser(admin.email, { 
//         title: "New Leave Request", 
//         body: `${employeeName} requested ${leaveType}`,
//         url: "/admin/leaves"
//       });
//     }

//     res.status(201).json({ message: "Leave added successfully", leave: newLeave });
//   } catch (error) {
//     console.error("❌ Error adding leave:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // ✅ Get all leaves
// // leave.controller.js mein getLeaves function update karo
// exports.getLeaves = async (req, res) => {
//   try {
//     const { status, employeeId } = req.query;

//     let filter = {};

//     // ✅ Status filter add karo
//     if (status) {
//       filter.status = status;
//     }

//     // ✅ Employee filter
//     if (employeeId) {
//       filter.employeeId = employeeId;
//     }

//     console.log("🔍 Leaves Filter:", filter);

//     const leaves = await Leave.find(filter).sort({ createdAt: -1 });

//     res.json(leaves);
//   } catch (error) {
//     console.error("❌ Error fetching leaves:", error);
//     res.status(500).json({ message: error.message });
//   }
// };



// exports.getPendingLeaves = async (req, res) => {
//   try {
//     // Find leaves where status is "pending", newest first
//     const pendingLeaves = await Leave.find({ status: "pending" }).sort({ createdAt: -1 });

//     res.status(200).json({
//       message: "Pending leave requests fetched successfully",
//       records: pendingLeaves,
//     });
//   } catch (error) {
//     console.error("❌ Error fetching pending leaves:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// exports.updateLeaveStatus = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status, adminName, adminEmail } = req.body;

//     if (!["approved", "rejected"].includes(status)) {
//       return res.status(400).json({ message: "Invalid status" });
//     }

//     const leave = await Leave.findByIdAndUpdate(
//       id,
//       { status, approvedDate: new Date() },
//       { new: true }
//     );

//     if (!leave) {
//       return res.status(404).json({ message: "Leave not found" });
//     }

//     // ✅ Log leave approval/rejection activity
//     const action = status === "approved" ? "leave_approve" : "leave_reject";
//     const actionDetails = `${status === "approved" ? "Approved" : "Rejected"} ${leave.leaveType} for ${leave.employeeName} (${new Date(leave.startDate).toLocaleDateString()} to ${new Date(leave.endDate).toLocaleDateString()})`;

//     await logActivity({
//       userId: adminEmail || "admin", // Use admin email or default
//       userName: adminName || "Admin",
//       userEmail: adminEmail || "",
//       userRole: "admin",
//       action,
//       actionDetails,
//       metadata: {
//         leaveId: leave._id,
//         employeeId: leave.employeeId,
//         employeeName: leave.employeeName,
//         leaveType: leave.leaveType,
//         startDate: leave.startDate,
//         endDate: leave.endDate,
//         days: leave.days,
//         status,
//       },
//     });

//     // 🔔 NOTIFY EMPLOYEE
//     await Notification.create({
//       userId: leave.employeeId,
//       role: "employee",
//       title: `Leave ${status === "approved" ? "Approved" : "Rejected"}`,
//       message: `Your ${leave.leaveType} request has been ${status}.`,
//       type: "leave"
//     });

//     sendPushToUser(leave.employeeId, {
//       title: `Leave ${status}`,
//       body: `Your leave request was ${status} by Admin.`,
//       url: "/employee/leaves"
//     });

//     res.status(200).json({ message: `Leave ${status}`, leave });
//   } catch (error) {
//     console.error("❌ Error updating leave status:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };


// // Controller to get leaves of a specific employee
// exports.getLeavesByEmployee = async (req, res) => {
//   try {
//     const { employeeId } = req.params;

//     if (!employeeId) {
//       return res.status(400).json({ message: "Employee ID is required" });
//     }

//     // Find leaves for the given employee, sorted by creation date descending
//     const leaves = await Leave.find({ employeeId }).sort({ createdAt: -1 });

//     res.status(200).json({
//       success: true,
//       records: leaves, // returning as "records" similar to your frontend response
//     });
//   } catch (error) {
//     console.error("❌ Error fetching employee leaves:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };



const Leave = require("../models/Leave");
const { logActivity } = require("./userActivity.controller");
const Notification = require("../models/Notification");
const { sendPushToUser } = require("./notification.controller");
const Admin = require("../models/Admin");
const CompOff = require("../models/CompOff"); // ✅ Add this
const Employee = require("../models/Employee"); // ✅ Employee for balances
const ExtraDayCompOff = require('../models/ExtraDayCompOff');
const CompOffRequest = require('../models/CompOffRequest');
const Attendance = require("../models/Attendance");
const Shift = require("../models/Shift");
const { sendToToken } = require("../services/notificationService"); // 👈 ADD (agar already nahi hai)


// ✅ Get leave balances
exports.getLeaveBalances = async (req, res) => {
  try {
    const { employeeId } = req.params;
    if (!employeeId) return res.status(400).json({ message: "Employee ID is required" });

    const employee = await Employee.findOne({ employeeId });
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    const approvedLeaves = await Leave.find({
      employeeId,
      status: { $in: ["approved", "manager_approved"] }
    });

    let usedCL = 0, usedSL = 0, usedEL = 0;

    approvedLeaves.forEach(leave => {
      const leaveType = leave.leaveType ? leave.leaveType.toLowerCase() : "";
      const startDate = new Date(leave.startDate);
      const leaveMonth = startDate.getMonth() + 1;
      const leaveYear = startDate.getFullYear();

      if (leaveYear === currentYear && leaveMonth === currentMonth) {
        if (leaveType === "casual" || leaveType === "casual leave" || leaveType === "cl") usedCL += leave.days;
        else if (leaveType === "sick" || leaveType === "sick leave" || leaveType === "sl") usedSL += leave.days;
      }

      if (leaveType === "earned" || leaveType === "earned leave" || leaveType === "el") usedEL += leave.days;
    });

    let totalEL = employee.maxEL !== undefined ? employee.maxEL : 0;
    let totalCL = employee.maxCL !== undefined ? employee.maxCL : 0;
    let totalSL = employee.maxSL !== undefined ? employee.maxSL : 0;

    res.json({
      success: true,
      balances: {
        CL: { total: totalCL, used: usedCL, available: Math.max(0, totalCL - usedCL) },
        SL: { total: totalSL, used: usedSL, available: Math.max(0, totalSL - usedSL) },
        EL: { total: totalEL, used: usedEL, available: Math.max(0, totalEL - usedEL) }
      }
    });
  } catch (error) {
    console.error("❌ Error in getLeaveBalances:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// ✅ Add new leave
exports.addLeave = async (req, res) => {
  try {
    console.log("📩 Received body:", req.body);

    const { employeeId, employeeName, leaveType, startDate, endDate, reason, days } = req.body;

    if (!employeeId || !employeeName || !leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newLeave = new Leave({
      employeeId,
      employeeName,
      leaveType,
      startDate,
      endDate,
      reason,
      days,
      status: "pending",
    });

    await newLeave.save();

    console.log("✅ Leave saved successfully:", newLeave);

    await logActivity({
      userId: employeeId,
      userName: employeeName,
      userEmail: "", 
      userRole: "employee",
      action: "leave_apply",
      actionDetails: `Applied for ${leaveType} from ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()} (${days} days)`,
      metadata: {
        leaveId: newLeave._id,
        leaveType,
        startDate,
        endDate,
        days,
        reason,
      },
    });

    // Notify admins
    console.log("🔔 Creating Leave Notification...");
    const admins = await Admin.find({ role: { $regex: /^admin$/i } });
    console.log(`🔔 Found ${admins.length} admins to notify`);
    for (const admin of admins) {
      console.log(`🔔 Notifying admin: ${admin.email}`);
      await Notification.create({
        userId: admin.email,
        role: "admin",
        title: "New Leave Request",
        message: `${employeeName} applied for ${leaveType} (${days} days)`,
        type: "leave"
      });
      sendPushToUser(admin.email, { 
        title: "New Leave Request", 
        body: `${employeeName} requested ${leaveType}`,
        url: "/admin/leaves"
      });
    }

    res.status(201).json({ message: "Leave added successfully", leave: newLeave });
  } catch (error) {
    console.error("❌ Error adding leave:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get all leaves
exports.getLeaves = async (req, res) => {
  try {
    const { status, employeeId } = req.query;

    let filter = {};
    if (status) filter.status = status;
    if (employeeId) filter.employeeId = employeeId;

    console.log("🔍 Leaves Filter:", filter);

    const leaves = await Leave.find(filter).sort({ createdAt: -1 });
    res.json(leaves);
  } catch (error) {
    console.error("❌ Error fetching leaves:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get leaves with comp-off status
exports.getLeavesWithStatus = async (req, res) => {
  try {
    const leaves = await Leave.find().sort({ createdAt: -1 });
    
    // Fetch all comp-offs to mark converted leaves
    const compOffs = await CompOff.find({ convertedFromLeave: true });
    
    const convertedLeaveIds = new Set(
      compOffs.map(co => co.originalLeaveId?.toString())
    );
    
    const leavesWithStatus = leaves.map(leave => ({
      ...leave.toObject(),
      isConvertedToCompOff: convertedLeaveIds.has(leave._id.toString())
    }));

    res.json(leavesWithStatus);
  } catch (error) {
    console.error("❌ Error fetching leaves with status:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get pending leaves
exports.getPendingLeaves = async (req, res) => {
  try {
    const pendingLeaves = await Leave.find({ status: "pending" }).sort({ createdAt: -1 });

    res.status(200).json({
      message: "Pending leave requests fetched successfully",
      records: pendingLeaves,
    });
  } catch (error) {
    console.error("❌ Error fetching pending leaves:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.updateLeaveStatus = async (req, res) => {
  console.log("\n========================================");
  console.log("📋 [LEAVE-UPDATE] Request received at:", new Date().toISOString());

  try {
    const { id } = req.params;
    const { status, adminName, adminEmail, adminRole, isConvertedToCompOff, compOffId } = req.body;

    console.log("📥 [LEAVE-UPDATE] Payload:", {
      leaveId: id,
      status: status || null,
      adminName: adminName || null,
      adminEmail: adminEmail || null,
      isConvertedToCompOff: isConvertedToCompOff ?? null,
      compOffId: compOffId || null,
    });

    const updateData = {
      updatedAt: new Date(),
    };

    if (status) {
      updateData.status = status;
      updateData.approvedDate = new Date();
      updateData.approvedBy = adminName;
      updateData.approvedByRole = adminRole || "Admin";
    }

    // Add comp-off fields if provided
    if (isConvertedToCompOff !== undefined) {
      updateData.isConvertedToCompOff = isConvertedToCompOff;
    }
    if (compOffId) {
      updateData.compOffId = compOffId;
    }
    if (isConvertedToCompOff) {
      updateData.convertedDate = new Date();
    }

    const leave = await Leave.findByIdAndUpdate(id, updateData, { new: true });

    if (!leave) {
      console.log("❌ [LEAVE-UPDATE] Leave not found:", id);
      return res.status(404).json({ message: "Leave not found" });
    }

    console.log("✅ [LEAVE-UPDATE] Leave updated:", {
      leaveId: leave._id,
      employeeId: leave.employeeId,
      employeeName: leave.employeeName,
      leaveType: leave.leaveType,
      newStatus: leave.status,
    });

    // If this is not a comp-off conversion, log and notify
    if (status && !isConvertedToCompOff) {
      // Log leave approval/rejection activity
      const action =
        status === "approved"
          ? "leave_approve"
          : status === "manager_approved"
          ? "manager_approve"
          : "leave_reject";
      const statusDisplay =
        status === "manager_approved"
          ? "Manager Approved"
          : status === "approved"
          ? "Approved"
          : "Rejected";
      const actionDetails = `${statusDisplay} ${leave.leaveType} for ${leave.employeeName}`;

      await logActivity({
        userId: adminEmail || "admin",
        userName: adminName || "Admin",
        userEmail: adminEmail || "",
        userRole: adminRole || "admin",
        action,
        actionDetails,
        metadata: {
          leaveId: leave._id,
          employeeId: leave.employeeId,
          employeeName: leave.employeeName,
          leaveType: leave.leaveType,
          status,
        },
      });

      console.log("📝 [LEAVE-UPDATE] Activity logged:", actionDetails);

      // ✅ In-app Notification (existing)
      await Notification.create({
        userId: leave.employeeId,
        role: "employee",
        title: `Leave ${statusDisplay}`,
        message: `Your ${leave.leaveType} request has been ${
          status === "manager_approved" ? "approved by manager" : status
        }.`,
        type: "leave",
      });

      console.log("🔔 [LEAVE-UPDATE] In-app notification created");

      // ========================================
      // 📤 FCM PUSH NOTIFICATION — to employee
      // ========================================
      const employee = await Employee.findOne({ employeeId: leave.employeeId });
      const tokenToUse = employee?.fcmToken || null;

      console.log("🔔 [FCM] Employee found:", employee ? employee.name : "NO");
      console.log("🔔 [FCM] Token available:", tokenToUse ? `${tokenToUse.substring(0, 20)}...` : "NO");

      if (tokenToUse) {
        const title = `Leave ${statusDisplay}`;
        const body = `Your ${leave.leaveType} request has been ${
          status === "manager_approved" ? "approved by manager" : status
        }.`;

        console.log("📤 [FCM] Sending leave-status push...");
        console.log("📤 [FCM] Title:", title);
        console.log("📤 [FCM] Body:", body);

        try {
          const result = await sendToToken({
            token: tokenToUse,
            title,
            body,
            data: {
              type: "LEAVE_STATUS_UPDATE",
              leaveId: String(leave._id),
              employeeId: String(leave.employeeId),
              status: String(status),
              leaveType: String(leave.leaveType),
              timestamp: new Date().toISOString(),
            },
          });

          if (result.success) {
            console.log("✅ [FCM] LEAVE STATUS PUSH SENT. MessageId:", result.messageId);
          } else {
            console.error(
              "❌ [FCM] LEAVE STATUS PUSH FAILED. Code:",
              result.code,
              "| Error:",
              result.error
            );

            // 🧹 Invalid token — clear from DB
            if (
              result.code === "messaging/registration-token-not-registered" ||
              result.error === "NotRegistered" ||
              result.code === "messaging/invalid-registration-token"
            ) {
              console.log("🧹 [FCM] Invalid token — clearing from DB");
              employee.fcmToken = null;
              employee.isFcmTokenStored = false;
              employee.fcmUpdatedAt = new Date();
              await employee.save();
            }
          }
        } catch (e) {
          console.error("❌ [FCM] LEAVE STATUS PUSH EXCEPTION:", e.message);
        }
      } else {
        console.log("⚠️ [FCM] No token available — skipping leave-status push");
      }
    } else {
      console.log("⏭️ [LEAVE-UPDATE] Skipping notification (comp-off conversion or no status)");
    }

    console.log("📨 [LEAVE-UPDATE] Sending response");
    console.log("========================================\n");

    // ✅ RESPONSE — original jaisa, kuch change nahi
    res.status(200).json({
      message: status ? `Leave ${status}` : "Leave updated",
      leave,
    });
  } catch (error) {
    console.error("❌ [LEAVE-UPDATE] EXCEPTION:", error);
    console.log("========================================\n");
    res.status(500).json({ message: "Server error" });
  }
};

/* 🔧 SAFE DATE → "YYYY-MM-DD" (Date object OR string dono handle) */
const toDateStr = (val) => {
  if (!val) return null;
  try {
    if (val instanceof Date) return val.toISOString().split("T")[0];
    const str = String(val);
    if (str.includes("T")) return str.split("T")[0];
    const d = new Date(str);
    if (!isNaN(d.getTime())) return d.toISOString().split("T")[0];
    return str.slice(0, 10);
  } catch (e) {
    return null;
  }
};

// ✅ Get leaves by employee (with stats + month/year filter)
exports.getLeavesByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    if (!employeeId) {
      return res.status(400).json({ success: false, message: "Employee ID is required" });
    }

    console.log("🚀 getLeavesByEmployee called for:", employeeId);

    /* 🗓️ QUERY PARAMS */
    const today = new Date();
    const qMonth = req.query.month ? parseInt(req.query.month, 10) : null;
    const qYear  = req.query.year  ? parseInt(req.query.year, 10)  : null;

    const selectedMonth =
      qMonth && qMonth >= 1 && qMonth <= 12 ? qMonth : today.getMonth() + 1;
    const selectedYear =
      qYear && qYear > 2000 ? qYear : today.getFullYear();

    const monthStartStr = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-01`;
    const lastDay = new Date(selectedYear, selectedMonth, 0).getDate();
    const monthEndStr = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

    console.log("🗓️ Filter:", { selectedMonth, selectedYear, monthStartStr, monthEndStr });

    /* 1️⃣ EMPLOYEE */
    const employee = await Employee.findOne({ employeeId }).lean();
    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    const weekOffPerMonth   = employee.weekOffPerMonth || 0;
    const totalAssignedDays = employee.assignedWorkingDays || 26;

    /* 2️⃣ LEAVES */
    const allLeaves = await Leave.find({ employeeId }).sort({ createdAt: -1 }).lean();
    console.log("📋 Total leaves in DB:", allLeaves.length);

    const leaves = allLeaves.filter((l) => {
      const startStr = toDateStr(l.startDate);
      const endStr   = toDateStr(l.endDate || l.startDate);
      if (!startStr || !endStr) return false;
      return startStr <= monthEndStr && endStr >= monthStartStr;
    });
    console.log("📋 Leaves after filter:", leaves.length);

    /* 3️⃣ ATTENDANCE */
    const allAttendance = await Attendance.find({
      $or: [{ employeeId }, { "employeeId.employeeId": employeeId }],
    }).lean();

    console.log("📅 Total attendance in DB:", allAttendance.length);
    if (allAttendance[0]) {
      console.log("📅 Sample checkInTime:", allAttendance[0].checkInTime,
                  "| type:", typeof allAttendance[0].checkInTime,
                  "| isDate:", allAttendance[0].checkInTime instanceof Date);
    }

    const attendance = allAttendance.filter((a) => {
      const dStr = toDateStr(a.checkInTime || a.date || a.attendanceDate);
      if (!dStr) return false;
      return dStr >= monthStartStr && dStr <= monthEndStr;
    });

    console.log("📅 Attendance after filter:", attendance.length);

    /* 4️⃣ PRESENT DAYS — unique dates */
    const presentDaysSet = new Set();
    attendance.forEach((a) => {
      const dStr = toDateStr(a.checkInTime || a.date || a.attendanceDate);
      if (dStr) presentDaysSet.add(dStr);
    });
    const presentDays = presentDaysSet.size;
    console.log("✅ Present days:", presentDays, "→", [...presentDaysSet]);

    /* 5️⃣ EXTRA DAYS WORKED */
    let extraDaysWorked = attendance.filter(
      (a) =>
        a.isExtraDay === true ||
        a.isWeekOff === true ||
        a.isHolidayWork === true ||
        a.workType === "Week-off Work" ||
        a.workType === "Holiday Work"
    ).length;

    if (extraDaysWorked === 0 && presentDays > totalAssignedDays) {
      extraDaysWorked = presentDays - totalAssignedDays;
    }

    /* 6️⃣ LEAVES STATS */
    const totalLeaves     = leaves.length;
    const approvedLeaves  = leaves.filter((l) => l.status === "approved").length;
    const pendingLeaves   = leaves.filter((l) => l.status === "pending").length;
    const rejectedLeaves  = leaves.filter((l) => l.status === "rejected").length;

    const casualLeaves    = leaves.filter((l) => l.leaveType === "casual").length;
    const sickLeaves      = leaves.filter((l) => l.leaveType === "sick").length;
    const earnedLeaves    = leaves.filter((l) => l.leaveType === "earned").length;
    const compOffLeaves   = leaves.filter((l) => l.leaveType === "compoff").length;

    /* 7️⃣ ABSENT */
    const absentDays = Math.max(totalAssignedDays - presentDays - approvedLeaves, 0);

    console.log("📊 Stats:", {
      totalLeaves, approvedLeaves, pendingLeaves, rejectedLeaves,
      presentDays, absentDays, extraDaysWorked,
    });

    /* ─────────────── RESPONSE ─────────────── */
    return res.status(200).json({
      success: true,

      filter: {
        month: selectedMonth,
        year: selectedYear,
        monthStart: monthStartStr,
        monthEnd: monthEndStr,
      },

      stats: {
        totalLeaves,
        approvedLeaves,
        pendingLeaves,
        rejectedLeaves,
        casualLeaves,
        sickLeaves,
        earnedLeaves,
        compOffLeaves,

        weekOffPerMonth,
        totalAssignedDays,
        presentDays,
        absentDays,
        extraDaysWorked,
      },

      records: leaves,
    });
  } catch (error) {
    console.error("❌ Error fetching employee leaves:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
// 🏠 Get employees on approved leave today

exports.getOnLeaveToday = async (req, res) => {
  try {
    // Determine today in local time instead of UTC to avoid timezone issues
    const now = new Date();
    // Assuming IST for most usage, or server local time
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const today = `${year}-${month}-${day}`;
    
    const { department } = req.query;
    
    // Check multiple casing variants to be safe
    const matchStage = {
      status: { $in: ["approved", "manager_approved", "Approved", "Manager_Approved"] },
      startDate: { $lte: today },
      endDate: { $gte: today }
    };

    const onLeaveToday = await Leave.aggregate([
      {
        $match: matchStage
      },
      {
        $lookup: {
          from: "employees",
          localField: "employeeId",
          foreignField: "employeeId",
          as: "employeeData"
        }
      },
      {
        $unwind: {
          path: "$employeeData",
          preserveNullAndEmptyArrays: false // Only show if we can confirm the employee
        }
      },
      {
        $match: department ? {
          "employeeData.department": { $regex: new RegExp(`^${department.trim()}$`, 'i') }
        } : {}
      },
      {
        $project: {
          _id: 1,
          employeeId: 1,
          employeeName: { $ifNull: ["$employeeData.name", "$employeeName"] },
          department: "$employeeData.department",
          role: "$employeeData.role",
          email: "$employeeData.email",
          leaveType: 1,
          startDate: 1,
          endDate: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      message: onLeaveToday.length > 0 ? "Employees on leave fetched successfully" : "No one on leave today",
      data: onLeaveToday
    });
  } catch (error) {
    console.error("Aggregation on-leave-today error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};



// ============================================
// 1. REQUEST COMP-OFF - Create new comp-off request
// ============================================
exports.requestExtraDayCompOff = async (req, res) => {
  try {
    const {
      employeeId,
      employeeName,
      extraDayDate,
      extraDayDetails,
      leaveId,
      leaveDetails,
      reason
    } = req.body;

    // Validation
    if (!employeeId || !extraDayDate || !reason) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: employeeId, extraDayDate, reason'
      });
    }

    // Check if already requested for this extra day
    const existingRequest = await ExtraDayCompOff.findOne({
      employeeId: employeeId,
      extraDayDate: new Date(extraDayDate),
      status: { $in: ['pending', 'approved'] }
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        error: 'You have already requested comp-off for this extra day'
      });
    }

    // Check limit - max 5 active comp-offs per employee
    const activeCount = await ExtraDayCompOff.countDocuments({
      employeeId: employeeId,
      status: { $in: ['pending', 'approved'] }
    });

    if (activeCount >= 5) {
      return res.status(400).json({
        success: false,
        error: 'You have reached the maximum limit of 5 comp-off requests'
      });
    }

    // Create comp-off request
    const compOffRequest = new ExtraDayCompOff({
      employeeId,
      employeeName,
      extraDayDate: new Date(extraDayDate),
      extraDayDetails: extraDayDetails || {},
      leaveId: leaveId || null,
      leaveDetails: leaveDetails || {},
      reason,
      status: 'pending'
    });

    await compOffRequest.save();

    res.status(201).json({
      success: true,
      message: 'Comp-off request submitted successfully',
      data: compOffRequest
    });

  } catch (error) {
    console.error('Error in requestExtraDayCompOff:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
};

// ============================================
// 2. GET ALL REQUESTS - Get all comp-off requests with filters (Unified CompOffRequest & ExtraDayCompOff)
// ============================================
exports.getAllExtraDayCompOffRequests = async (req, res) => {
  try {
    const { 
      employeeId, 
      month, 
      status,
      search,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // 1. Fetch from both collections in parallel
    const [extraDayRequests, compOffRequests] = await Promise.all([
      ExtraDayCompOff.find().lean().catch(e => { console.warn("ExtraDayCompOff find error:", e.message); return []; }),
      CompOffRequest.find().populate('originalLeaveId').lean().catch(e => { console.warn("CompOffRequest find error:", e.message); return []; })
    ]);

    const normalizedMap = new Map();

    // Helper: Normalize ExtraDayCompOff
    const normalizeExtraDay = (doc) => {
      const extraDayStr = doc.extraDayDate ? new Date(doc.extraDayDate).toDateString() : (doc.extraDayDetails?.day || "");
      return {
        _id: String(doc._id),
        employeeId: doc.employeeId || "",
        employeeName: doc.employeeName || "",
        extraDayDate: doc.extraDayDate || doc.workDate,
        extraDayDetails: doc.extraDayDetails || {
          day: extraDayStr,
          date: doc.extraDayDate || doc.workDate,
          totalHours: doc.extraDayDetails?.totalHours || 8,
          extraHours: doc.extraDayDetails?.extraHours || 0
        },
        leaveId: doc.leaveId || null,
        leaveDetails: doc.leaveDetails || null,
        workDate: doc.workDate || doc.extraDayDate,
        reason: doc.reason || "",
        count: 1,
        status: doc.status || "pending",
        approvedBy: doc.approvedBy || null,
        approvedAt: doc.approvedAt || null,
        rejectedReason: doc.rejectedReason || null,
        convertedToCompOff: !!doc.convertedToCompOff,
        createdAt: doc.createdAt || new Date(),
        updatedAt: doc.updatedAt || new Date(),
        source: "ExtraDayCompOff"
      };
    };

    // Helper: Normalize CompOffRequest
    const normalizeCompOffReq = (doc) => {
      const workDateStr = doc.workDate ? (typeof doc.workDate === 'string' ? doc.workDate : new Date(doc.workDate).toISOString().slice(0, 10)) : "";
      const extraDayObj = doc.extraDayDetails || {
        day: workDateStr,
        date: doc.workDate,
        totalHours: 8,
        extraHours: 0,
        workType: "Week-off Work"
      };
      return {
        _id: String(doc._id),
        employeeId: doc.employeeId || "",
        employeeName: doc.employeeName || "",
        extraDayDate: doc.extraDayDate || doc.workDate,
        extraDayDetails: extraDayObj,
        leaveId: doc.originalLeaveId?._id || doc.leaveId || null,
        leaveDetails: doc.leaveDetails || (doc.originalLeaveId ? {
          leaveType: doc.originalLeaveId.leaveType,
          startDate: doc.originalLeaveId.startDate,
          endDate: doc.originalLeaveId.endDate,
          days: doc.originalLeaveId.days,
          reason: doc.originalLeaveId.reason,
          status: doc.originalLeaveId.status
        } : null),
        workDate: doc.workDate || doc.extraDayDate,
        reason: doc.reason || "",
        count: doc.count || 1,
        status: doc.status || "pending",
        approvedBy: doc.approvedBy || null,
        approvedAt: doc.approvedDate || doc.approvedAt || null,
        rejectedReason: doc.rejectionReason || doc.rejectedReason || null,
        convertedToCompOff: !!doc.convertedToCompOff,
        createdAt: doc.createdAt || new Date(),
        updatedAt: doc.updatedAt || new Date(),
        source: "CompOffRequest"
      };
    };

    // Load ExtraDayCompOff records first
    extraDayRequests.forEach(item => {
      const norm = normalizeExtraDay(item);
      normalizedMap.set(norm._id, norm);
    });

    // Merge CompOffRequest records (newer or updates take precedence)
    compOffRequests.forEach(item => {
      const norm = normalizeCompOffReq(item);
      normalizedMap.set(norm._id, norm);
    });

    const toDateKey = (val) => {
      if (!val) return "";
      if (typeof val === "string") {
        if (val.includes("T")) return val.split("T")[0];
        return val.slice(0, 10);
      }
      if (val instanceof Date && !isNaN(val)) {
        try { return val.toISOString().slice(0, 10); } catch (e) { return ""; }
      }
      return "";
    };

    // Deduplicate by employeeId + date key so legacy duplicates don't show twice
    const dedupeByKey = new Map();
    Array.from(normalizedMap.values()).forEach(item => {
      const datePart = toDateKey(item.workDate || item.extraDayDate);
      const dedupeKey = item.employeeId && datePart 
        ? `${item.employeeId.trim().toUpperCase()}_${datePart}`
        : item._id;
      
      const existing = dedupeByKey.get(dedupeKey);
      if (!existing) {
        dedupeByKey.set(dedupeKey, item);
      } else {
        if (existing.status !== 'pending' && item.status === 'pending') {
          dedupeByKey.set(dedupeKey, item);
        } else if (item.source === 'CompOffRequest') {
          dedupeByKey.set(dedupeKey, item);
        }
      }
    });

    let allRecords = Array.from(dedupeByKey.values());

    // 2. Filter by employeeId
    if (employeeId) {
      const targetEmp = String(employeeId).trim().toLowerCase();
      allRecords = allRecords.filter(r => (r.employeeId || "").toLowerCase() === targetEmp);
    }

    // 3. Filter by month (matches createdAt, workDate, or extraDayDate)
    if (month) {
      const [year, monthNum] = month.split('-').map(Number);
      const padMonth = String(monthNum).padStart(2, '0');
      const monthPrefix = `${year}-${padMonth}`;

      allRecords = allRecords.filter(r => {
        if (r.createdAt) {
          const cd = new Date(r.createdAt);
          if (!isNaN(cd) && cd.getFullYear() === year && cd.getMonth() + 1 === monthNum) return true;
        }
        if (r.workDate) {
          if (typeof r.workDate === 'string' && r.workDate.startsWith(monthPrefix)) return true;
          const wd = new Date(r.workDate);
          if (!isNaN(wd) && wd.getFullYear() === year && wd.getMonth() + 1 === monthNum) return true;
        }
        if (r.extraDayDate) {
          if (typeof r.extraDayDate === 'string' && r.extraDayDate.startsWith(monthPrefix)) return true;
          const ed = new Date(r.extraDayDate);
          if (!isNaN(ed) && ed.getFullYear() === year && ed.getMonth() + 1 === monthNum) return true;
        }
        return false;
      });
    }

    // 4. Filter by search term
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      allRecords = allRecords.filter(r => 
        (r.employeeName && r.employeeName.toLowerCase().includes(q)) ||
        (r.employeeId && r.employeeId.toLowerCase().includes(q)) ||
        (r.reason && r.reason.toLowerCase().includes(q)) ||
        (r.extraDayDetails?.day && String(r.extraDayDetails.day).toLowerCase().includes(q))
      );
    }

    // 5. Accurate counts for current filters (before status filtering)
    const counts = {
      total: allRecords.length,
      pending: allRecords.filter(r => r.status === 'pending').length,
      approved: allRecords.filter(r => r.status === 'approved').length,
      rejected: allRecords.filter(r => r.status === 'rejected').length
    };

    // 6. Filter by status
    let filteredRecords = allRecords;
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      filteredRecords = allRecords.filter(r => r.status === status);
    }

    // 7. Sort
    filteredRecords.sort((a, b) => {
      const dateA = new Date(a[sortBy] || a.createdAt || 0).getTime();
      const dateB = new Date(b[sortBy] || b.createdAt || 0).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    // 8. Pagination
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;
    const totalCount = filteredRecords.length;
    const paginatedRequests = filteredRecords.slice(skip, skip + limitNum);

    res.status(200).json({
      success: true,
      requests: paginatedRequests,
      counts: counts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitNum) || 1
      }
    });

  } catch (error) {
    console.error('Error in getAllExtraDayCompOffRequests:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
};

// ============================================
// 3. GET COMP-OFF REQUESTS BY EMPLOYEE ID
// ============================================
exports.getCompOffRequestsByEmployeeId = async (req, res) => {
  try {
    const { employeeId } = req.params;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        error: 'Employee ID is required'
      });
    }

    const cleanEmpId = String(employeeId).trim();
    const [extraDayReqs, compOffReqs] = await Promise.all([
      ExtraDayCompOff.find({
        $or: [
          { employeeId: cleanEmpId },
          { employeeId: { $regex: new RegExp(`^${cleanEmpId}$`, "i") } }
        ]
      }).lean().catch(() => []),
      CompOffRequest.find({
        $or: [
          { employeeId: cleanEmpId },
          { employeeId: { $regex: new RegExp(`^${cleanEmpId}$`, "i") } }
        ]
      }).populate('originalLeaveId').lean().catch(() => [])
    ]);

    const map = new Map();
    extraDayReqs.forEach(r => map.set(String(r._id), r));
    compOffReqs.forEach(r => map.set(String(r._id), {
      _id: r._id,
      employeeId: r.employeeId,
      employeeName: r.employeeName,
      extraDayDate: r.extraDayDate || r.workDate,
      extraDayDetails: r.extraDayDetails,
      leaveDetails: r.leaveDetails || (r.originalLeaveId ? {
        leaveType: r.originalLeaveId.leaveType,
        startDate: r.originalLeaveId.startDate,
        endDate: r.originalLeaveId.endDate,
        days: r.originalLeaveId.days,
        reason: r.originalLeaveId.reason,
        status: r.originalLeaveId.status
      } : null),
      workDate: r.workDate,
      reason: r.reason,
      status: r.status,
      approvedBy: r.approvedBy,
      approvedAt: r.approvedDate,
      rejectedReason: r.rejectionReason,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt
    }));

    const requests = Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    );

    const counts = {
      total: requests.length,
      pending: requests.filter(r => r.status === 'pending').length,
      approved: requests.filter(r => r.status === 'approved').length,
      rejected: requests.filter(r => r.status === 'rejected').length
    };

    res.status(200).json({
      success: true,
      requests: requests,
      counts: counts
    });

  } catch (error) {
    console.error('Error in getCompOffRequestsByEmployeeId:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
};

// ============================================
// 4. UPDATE COMP-OFF STATUS (APPROVE/REJECT) - UNIFIED WITH ATTENDANCE & COMPOFF
// ============================================
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

        compOffRecord = new CompOff({
          employeeId: compOffReq.employeeId,
          employeeName: compOffReq.employeeName,
          originalLeaveId: compOffReq.originalLeaveId?._id || null,
          workDate: compOffReq.workDate,
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
                        (compOffReq && (compOffReq.workDate || compOffReq.extraDayDate)) ||
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
            reason: extraDayReq.reason,
            status: "approved",
            convertedFromLeave: !!extraDayReq.leaveDetails,
            approvedBy: finalApprovedBy,
            approvedDate: now
          });
          await compOffRecord.save();
        }
      }

      // 3. Mark/create attendance if applicable
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