const Leave = require("../models/Leave");

// ✅ Add new leave
exports.addLeave = async (req, res) => {
  try {
    const { employeeId, leaveType, startDate, endDate, reason, days } = req.body;

    if (!employeeId || !leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newLeave = new Leave({
      employeeId,
      leaveType,
      startDate,
      endDate,
      reason,
      days,
      status: "pending",
    });

    await newLeave.save();
    res.status(201).json({ message: "Leave added successfully", leave: newLeave });
  } catch (error) {
    console.error("❌ Error adding leave:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get all leaves
exports.getLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find().populate("employeeId", "name email");
    res.status(200).json(leaves);
  } catch (error) {
    console.error("❌ Error fetching leaves:", error);
    res.status(500).json({ message: "Server error" });
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

    const leave = await Leave.findByIdAndUpdate(id, { status }, { new: true });

    if (!leave) {
      return res.status(404).json({ message: "Leave not found" });
    }

    res.status(200).json({ message: `Leave ${status}`, leave });
  } catch (error) {
    console.error("❌ Error updating leave status:", error);
    res.status(500).json({ message: "Server error" });
  }
};
