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