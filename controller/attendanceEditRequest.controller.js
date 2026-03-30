const AttendanceEditRequest = require("../models/AttendanceEditRequest");

// Create a new edit request
exports.createRequest = async (req, res) => {
  try {
    const { employeeId, employeeName, selectedDates, comment } = req.body;

    if (!employeeId || !employeeName || !selectedDates || !comment) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const newRequest = new AttendanceEditRequest({
      employeeId,
      employeeName,
      selectedDates,
      comment,
    });

    await newRequest.save();

    res.status(201).json({
      success: true,
      message: "Attendance edit request submitted successfully",
      data: newRequest,
    });
  } catch (error) {
    console.error("Error creating attendance edit request:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Get all requests (for admin)
exports.getAllRequests = async (req, res) => {
  try {
    const requests = await AttendanceEditRequest.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    console.error("Error fetching attendance edit requests:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Get requests by employee ID
exports.getRequestsByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const requests = await AttendanceEditRequest.find({ employeeId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    console.error("Error fetching employee attendance edit requests:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Update request status (Admin action)
exports.updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminComment } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const request = await AttendanceEditRequest.findByIdAndUpdate(
      id,
      { status, adminComment },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    res.status(200).json({
      success: true,
      message: `Request ${status} successfully`,
      data: request,
    });
  } catch (error) {
    console.error("Error updating attendance edit request:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
