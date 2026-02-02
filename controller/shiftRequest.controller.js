const ShiftRequest = require("../models/ShiftRequest");
const Notification = require("../models/Notification");
const { sendPushToUser } = require("./notification.controller");
const Admin = require("../models/Admin");

// ✅ Create Shift Request (Employee)
exports.createShiftRequest = async (req, res) => {
  try {
    const { employeeId, employeeName, currentShift, requestedShiftType, reason } = req.body;

    if (!employeeId || !requestedShiftType || !reason) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newRequest = await ShiftRequest.create({
      employeeId,
      employeeName,
      currentShift,
      requestedShiftType,
      reason,
    });

    // 🔔 Notify Admins
    const admins = await Admin.find({ role: "admin" });
    for (const admin of admins) {
      await Notification.create({
        userId: admin.email,
        role: "admin",
        title: "New Shift Request",
        message: `${employeeName} requested shift change to ${requestedShiftType}`,
        type: "shift"
      });
      sendPushToUser(admin.email, {
        title: "Shift Change Request",
        body: `${employeeName} wants to change to Shift ${requestedShiftType}`,
        url: "/admin/shift-requests"
      });
    }

    res.status(201).json({ message: "Shift request submitted", request: newRequest });
  } catch (error) {
    console.error("Error creating shift request:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get All Requests (Admin)
exports.getAllShiftRequests = async (req, res) => {
  try {
    const requests = await ShiftRequest.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get Employee Requests (Employee)
exports.getEmployeeShiftRequests = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const requests = await ShiftRequest.find({ employeeId }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Update Status (Admin)
exports.updateShiftRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminComment } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const request = await ShiftRequest.findByIdAndUpdate(
      id,
      { status, adminComment },
      { new: true }
    );

    if (!request) return res.status(404).json({ message: "Request not found" });

    // 🔔 Notify Employee
    await Notification.create({
      userId: request.employeeId,
      role: "employee",
      title: `Shift Request ${status}`,
      message: `Your request to change to Shift ${request.requestedShiftType} was ${status}`,
      type: "shift"
    });
    
    sendPushToUser(request.employeeId, {
      title: `Shift Request ${status}`,
      body: `Your shift change request was ${status}`,
      url: "/employee/shifts"
    });

    res.json({ message: `Request ${status}`, request });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
