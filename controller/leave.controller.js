const Leave = require("../models/Leave");

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

    res.status(201).json({ message: "Leave added successfully", leave: newLeave });
  } catch (error) {
    console.error("❌ Error adding leave:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get all leaves
exports.getLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find().sort({ createdAt: -1 });
    res.status(200).json(leaves);
  } catch (error) {
    console.error("❌ Error fetching leaves:", error);
    res.status(500).json({ message: "Server error" });
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

// ✅ Update leave status (approve / reject)
exports.updateLeaveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

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

