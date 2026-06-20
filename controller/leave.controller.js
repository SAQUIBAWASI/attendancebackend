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
const Attendance = require("../models/Attendance");
const Shift = require("../models/Shift");


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

// ✅ Update leave status (Approve/Reject/Convert)
exports.updateLeaveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminName, adminEmail, adminRole, isConvertedToCompOff, compOffId } = req.body;

    const updateData = { 
      updatedAt: new Date() 
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

    const leave = await Leave.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!leave) {
      return res.status(404).json({ message: "Leave not found" });
    }

    // If this is not a comp-off conversion, log and notify
    if (status && !isConvertedToCompOff) {
      // Log leave approval/rejection activity
      const action = status === "approved" ? "leave_approve" : (status === "manager_approved" ? "manager_approve" : "leave_reject");
      const statusDisplay = status === "manager_approved" ? "Manager Approved" : (status === "approved" ? "Approved" : "Rejected");
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

      // Notify employee
      await Notification.create({
        userId: leave.employeeId,
        role: "employee",
        title: `Leave ${statusDisplay}`,
        message: `Your ${leave.leaveType} request has been ${status === 'manager_approved' ? 'approved by manager' : status}.`,
        type: "leave"
      });

      sendPushToUser(leave.employeeId, {
        title: `Leave ${statusDisplay}`,
        body: `Your leave request was ${status === 'manager_approved' ? 'approved by manager' : status}.`,
        url: "/employee/leaves"
      });
    }

    res.status(200).json({ 
      message: status ? `Leave ${status}` : 'Leave updated', 
      leave 
    });
  } catch (error) {
    console.error("❌ Error updating leave status:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get leaves by employee
exports.getLeavesByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;

    if (!employeeId) {
      return res.status(400).json({ message: "Employee ID is required" });
    }

    const leaves = await Leave.find({ employeeId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      records: leaves,
    });
  } catch (error) {
    console.error("❌ Error fetching employee leaves:", error);
    res.status(500).json({ message: "Server error" });
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
// 2. GET ALL REQUESTS - Get all comp-off requests with filters
// ============================================
exports.getAllExtraDayCompOffRequests = async (req, res) => {
  try {
    const { 
      employeeId, 
      month, 
      status,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    let filter = {};

    // Filter by employeeId
    if (employeeId) {
      filter.employeeId = employeeId;
    }

    // Filter by status
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      filter.status = status;
    }

    // Filter by month
    if (month) {
      const [year, monthNum] = month.split('-').map(Number);
      const startDate = new Date(year, monthNum - 1, 1);
      const endDate = new Date(year, monthNum, 0, 23, 59, 59);
      filter.createdAt = { $gte: startDate, $lte: endDate };
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Sorting
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get requests with pagination
    const requests = await ExtraDayCompOff.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    // Get total count
    const totalCount = await ExtraDayCompOff.countDocuments(filter);

    // Get counts by status
    const statusCounts = await ExtraDayCompOff.aggregate([
      { $match: filter },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const counts = {
      total: totalCount,
      pending: 0,
      approved: 0,
      rejected: 0
    };

    statusCounts.forEach(item => {
      if (item._id === 'pending') counts.pending = item.count;
      else if (item._id === 'approved') counts.approved = item.count;
      else if (item._id === 'rejected') counts.rejected = item.count;
    });

    res.status(200).json({
      success: true,
      requests: requests,
      counts: counts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitNum)
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




exports.getCompOffRequestsByEmployeeId = async (req, res) => {
  try {
    const { employeeId } = req.params;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        error: 'Employee ID is required'
      });
    }

    const requests = await ExtraDayCompOff.find({ employeeId: employeeId })
      .sort({ createdAt: -1 });

    // Counts by status
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
// 4. UPDATE COMP-OFF STATUS (APPROVE/REJECT) WITH ATTENDANCE - FIXED
// ============================================
exports.updateCompOffStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectedReason } = req.body;

    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be "approved" or "rejected"'
      });
    }

    const request = await ExtraDayCompOff.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Comp-off request not found'
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: `Request is already ${request.status}`
      });
    }

    request.status = status;
    request.updatedAt = new Date();

    if (status === 'approved') {
      request.approvedBy = req.admin?.name || 'Admin';
      request.approvedAt = new Date();
      request.convertedToCompOff = true;
      
      // USE LEAVE DATE - NOT EXTRA DAY DATE
      const leaveDate = request.leaveDetails?.startDate || request.extraDayDate || new Date();
      request.workDate = new Date(leaveDate);

      try {
        const employee = await Employee.findOne({ employeeId: request.employeeId });
        
        if (employee) {
          const leaveDateObj = new Date(leaveDate);
          leaveDateObj.setHours(0, 0, 0, 0);
          
          // ============================================
          // GET SHIFT TIMINGS FROM SHIFT SCHEMA
          // ============================================
          let checkInTime = new Date(leaveDateObj);
          let checkOutTime = new Date(leaveDateObj);
          let shiftHours = employee.shiftHours || 8;
          
          try {
            // Find shift for this employee
            const shift = await Shift.findOne({
              'employeeAssignment.employeeId': request.employeeId
            });
            
            if (shift && shift.employeeAssignment && shift.employeeAssignment.selectedTimeRange) {
              const timeRange = shift.employeeAssignment.selectedTimeRange; // "10:00 AM - 07:00 PM"
              const times = timeRange.split(' - ');
              
              if (times.length === 2) {
                const startTimeStr = times[0].trim(); // "10:00 AM"
                const endTimeStr = times[1].trim(); // "07:00 PM"
                
                // Parse start time
                const startParts = startTimeStr.match(/(\d+):(\d+)\s*(AM|PM)/);
                if (startParts) {
                  let startHour = parseInt(startParts[1]);
                  const startMinute = parseInt(startParts[2]);
                  const startAmPm = startParts[3];
                  
                  if (startAmPm === 'PM' && startHour !== 12) startHour += 12;
                  if (startAmPm === 'AM' && startHour === 12) startHour = 0;
                  
                  checkInTime = new Date(leaveDateObj);
                  checkInTime.setHours(startHour, startMinute, 0, 0);
                }
                
                // Parse end time
                const endParts = endTimeStr.match(/(\d+):(\d+)\s*(AM|PM)/);
                if (endParts) {
                  let endHour = parseInt(endParts[1]);
                  const endMinute = parseInt(endParts[2]);
                  const endAmPm = endParts[3];
                  
                  if (endAmPm === 'PM' && endHour !== 12) endHour += 12;
                  if (endAmPm === 'AM' && endHour === 12) endHour = 0;
                  
                  // If end time is before start time, add a day
                  if (endHour < startHour || (endHour === startHour && endMinute < startMinute)) {
                    checkOutTime = new Date(leaveDateObj);
                    checkOutTime.setDate(checkOutTime.getDate() + 1);
                  } else {
                    checkOutTime = new Date(leaveDateObj);
                  }
                  checkOutTime.setHours(endHour, endMinute, 0, 0);
                }
                
                // Calculate shift hours
                const diffMs = checkOutTime - checkInTime;
                shiftHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
              }
            }
          } catch (shiftError) {
            console.error('Error fetching shift:', shiftError);
            // Fallback to default timings
            checkInTime = new Date(leaveDateObj);
            checkInTime.setHours(10, 0, 0, 0); // 10:00 AM
            checkOutTime = new Date(leaveDateObj);
            checkOutTime.setHours(19, 0, 0, 0); // 07:00 PM
            shiftHours = employee.shiftHours || 8;
          }
          
          // Check if attendance already exists for this leave date
          const existingAttendance = await Attendance.findOne({
            employeeId: request.employeeId,
            checkInTime: {
              $gte: new Date(leaveDateObj),
              $lt: new Date(leaveDateObj.getTime() + 24 * 60 * 60 * 1000)
            }
          });

          if (existingAttendance) {
            // Update existing attendance to comp-off
            existingAttendance.status = 'comp-off';
            existingAttendance.checkInTime = checkInTime;
            existingAttendance.checkOutTime = checkOutTime;
            existingAttendance.totalHours = shiftHours || employee.shiftHours || 0;
            existingAttendance.workingHours = shiftHours || employee.shiftHours || 0;
            existingAttendance.assignedShiftHours = shiftHours || employee.shiftHours || 0;
            existingAttendance.otHours = 0;
            existingAttendance.reason = `Comp-off (Approved on ${new Date().toLocaleDateString()}) - Against ${request.leaveDetails?.leaveType || 'Leave'}`;
            existingAttendance.isCompOff = true;
            existingAttendance.compOffRequestId = request._id;
            existingAttendance.updatedAt = new Date();
            
            await existingAttendance.save();
            request.attendanceId = existingAttendance._id;
          } else {
            // Create new attendance record for leave date with shift timings
            const attendanceData = {
              employeeId: request.employeeId,
              employeeEmail: employee.email || '',
              checkInTime: checkInTime,
              checkOutTime: checkOutTime,
              status: 'comp-off',
              totalBreakMinutes: 0,
              totalHours: shiftHours || employee.shiftHours || 0,
              workingHours: shiftHours || employee.shiftHours || 0,
              assignedShiftHours: shiftHours || employee.shiftHours || 0,
              otHours: 0,
              basicSalary: employee.salaryPerMonth || 0,
              workingDays: employee.workingDays || 26,
              otMultiplier: 2,
              hourlyRate: (employee.salaryPerMonth || 0) / ((employee.workingDays || 26) * (employee.shiftHours || 8)),
              otRate: 0,
              otAmount: 0,
              latitude: 0,
              longitude: 0,
              distance: 0,
              onsite: false,
              officeName: 'Comp-off',
              reason: `Comp-off (Approved on ${new Date().toLocaleDateString()}) - Against ${request.leaveDetails?.leaveType || 'Leave'}`,
              comment: `Comp-off approved for leave: ${request.leaveDetails?.leaveType || 'Leave'} from ${request.leaveDetails?.startDate ? new Date(request.leaveDetails.startDate).toLocaleDateString() : ''} to ${request.leaveDetails?.endDate ? new Date(request.leaveDetails.endDate).toLocaleDateString() : ''} (Extra day: ${request.extraDayDetails?.day || request.extraDayDate})`,
              breaks: [],
              isCompOff: true,
              compOffRequestId: request._id
            };

            const attendance = new Attendance(attendanceData);
            await attendance.save();
            request.attendanceId = attendance._id;
          }
        }
      } catch (attendanceError) {
        console.error('Error creating/updating attendance for comp-off:', attendanceError);
      }

    } else if (status === 'rejected') {
      if (rejectedReason) {
        request.rejectedReason = rejectedReason;
      }
    }

    await request.save();

    const updatedRequest = await ExtraDayCompOff.findById(id);

    res.status(200).json({
      success: true,
      message: `Comp-off request ${status} successfully`,
      data: updatedRequest
    });

  } catch (error) {
    console.error('Error in updateCompOffStatus:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
};