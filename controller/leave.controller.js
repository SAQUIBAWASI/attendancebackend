const Leave = require("../models/Leave");
const { logActivity } = require("./userActivity.controller");
const Notification = require("../models/Notification"); // ✅ Import Notification Model
const { sendPushToUser } = require("./notification.controller"); // ✅ Import Push Helper
const Admin = require("../models/Admin"); // ✅ Import Admin Model

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

    // ✅ Log leave application activity
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

    // 🔔 NOTIFY ADMINS
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
      // Send Push
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
// leave.controller.js mein getLeaves function update karo
exports.getLeaves = async (req, res) => {
  try {
    const { status, employeeId } = req.query;

    let filter = {};

    // ✅ Status filter add karo
    if (status) {
      filter.status = status;
    }

    // ✅ Employee filter
    if (employeeId) {
      filter.employeeId = employeeId;
    }

    console.log("🔍 Leaves Filter:", filter);

    const leaves = await Leave.find(filter).sort({ createdAt: -1 });

    res.json(leaves);
  } catch (error) {
    console.error("❌ Error fetching leaves:", error);
    res.status(500).json({ message: error.message });
  }
};



exports.getPendingLeaves = async (req, res) => {
  try {
    // Find leaves where status is "pending", newest first
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
  try {
    const { id } = req.params;
    const { status, adminName, adminEmail } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const leave = await Leave.findByIdAndUpdate(
      id,
      { status, approvedDate: new Date() },
      { new: true }
    );

    if (!leave) {
      return res.status(404).json({ message: "Leave not found" });
    }

    // ✅ Log leave approval/rejection activity
    const action = status === "approved" ? "leave_approve" : "leave_reject";
    const actionDetails = `${status === "approved" ? "Approved" : "Rejected"} ${leave.leaveType} for ${leave.employeeName} (${new Date(leave.startDate).toLocaleDateString()} to ${new Date(leave.endDate).toLocaleDateString()})`;

    await logActivity({
      userId: adminEmail || "admin", // Use admin email or default
      userName: adminName || "Admin",
      userEmail: adminEmail || "",
      userRole: "admin",
      action,
      actionDetails,
      metadata: {
        leaveId: leave._id,
        employeeId: leave.employeeId,
        employeeName: leave.employeeName,
        leaveType: leave.leaveType,
        startDate: leave.startDate,
        endDate: leave.endDate,
        days: leave.days,
        status,
      },
    });

    // 🔔 NOTIFY EMPLOYEE
    await Notification.create({
      userId: leave.employeeId,
      role: "employee",
      title: `Leave ${status === "approved" ? "Approved" : "Rejected"}`,
      message: `Your ${leave.leaveType} request has been ${status}.`,
      type: "leave"
    });

    sendPushToUser(leave.employeeId, {
      title: `Leave ${status}`,
      body: `Your leave request was ${status} by Admin.`,
      url: "/employee/leaves"
    });

    res.status(200).json({ message: `Leave ${status}`, leave });
  } catch (error) {
    console.error("❌ Error updating leave status:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// Controller to get leaves of a specific employee
exports.getLeavesByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;

    if (!employeeId) {
      return res.status(400).json({ message: "Employee ID is required" });
    }

    // Find leaves for the given employee, sorted by creation date descending
    const leaves = await Leave.find({ employeeId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      records: leaves, // returning as "records" similar to your frontend response
    });
  } catch (error) {
    console.error("❌ Error fetching employee leaves:", error);
    res.status(500).json({ message: "Server error" });
  }
};

