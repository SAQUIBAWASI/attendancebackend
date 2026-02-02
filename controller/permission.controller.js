const Permission = require("../models/Permission");
const Employee = require("../models/Employee");
const Location = require("../models/Location");
const Notification = require("../models/Notification"); // ✅ Import Notification
const { sendPushToUser } = require("./notification.controller"); // ✅ Import Push Helper
const Admin = require("../models/Admin"); // ✅ Import Admin for notifying admins

// Helper: Haversine Distance
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in meters
};

/**
 * EMPLOYEE → SEND PERMISSION REQUEST
 */
exports.createPermission = async (req, res) => {
  try {
    const { employeeId, employeeName, reason, duration } = req.body;

    const permission = await Permission.create({
      employeeId,
      employeeName,
      reason,
      duration,
    });

    // 🔔 NOTIFY ADMINS
    const admins = await Admin.find({ role: "admin" });
    for (const admin of admins) {
      await Notification.create({
        userId: admin.email,
        role: "admin",
        title: "New Permission Request",
        message: `${employeeName} requested permission for ${duration} mins. Reason: ${reason}`,
        type: "permission"
      });
      // Send Push
      sendPushToUser(admin.email, { 
        title: "Permission Request", 
        body: `${employeeName} needs permission for ${duration} mins`,
        url: "/admin/permissions"
      });
    }

    res.status(201).json({
      message: "Permission request sent",
      data: permission,
    });
  } catch (error) {
    console.error("Create Permission Error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

/**
 * ADMIN → GET ALL PERMISSION REQUESTS
 */
exports.getAllPermissions = async (req, res) => {
  try {
    const permissions = await Permission.find().sort({ createdAt: -1 });
    res.json(permissions);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * ADMIN → APPROVE PERMISSION
 */
exports.approvePermission = async (req, res) => {
  try {
    const permission = await Permission.findById(req.params.id);

    if (!permission)
      return res.status(404).json({ message: "Permission not found" });

    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + permission.duration * 60000);

    permission.status = "APPROVED";
    permission.startTime = startTime;
    permission.endTime = endTime;

    await permission.save();

    // 🔔 NOTIFY EMPLOYEE
    await Notification.create({
      userId: permission.employeeId,
      role: "employee",
      title: "Permission Approved",
      message: `Your permission request for ${permission.duration} mins has been APPROVED. You must return by ${endTime.toLocaleTimeString()}.`,
      type: "permission"
    });

    sendPushToUser(permission.employeeId, {
      title: "Permission Approved",
      body: `Your request was approved. Return by ${endTime.toLocaleTimeString()}`,
      url: "/employee/permissions"
    });

    res.json({
      message: "Permission approved",
      data: permission,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * EMPLOYEE → BACK TO DUTY
 */
exports.backToDuty = async (req, res) => {
  try {
    const { id } = req.params;
    const { lat, lng } = req.body;

    const permission = await Permission.findById(id);
    if (!permission) {
      return res.status(404).json({ message: "Permission not found" });
    }

    if (permission.status !== "APPROVED") {
      return res.status(400).json({ message: "Permission is not active/approved" });
    }

    // Validate Location Logic
    const employee = await Employee.findOne({ employeeId: permission.employeeId }).populate("location");
    let distance = -1;
    let isInside = false;

    if (employee && employee.location) {
      const assignedLat = employee.location.latitude;
      const assignedLng = employee.location.longitude;
      distance = getDistance(lat, lng, assignedLat, assignedLng);

      // Assuming 100 meters tolerance
      if (distance <= 100) {
        isInside = true;
      }
    }

    permission.returnedAt = new Date();
    permission.returnLocation = { lat, lng };
    permission.status = "COMPLETED";

    await permission.save();

    // 🔔 NOTIFY ADMIN (Optional: Employee is back)
    const admins = await Admin.find({ role: "admin" });
    for (const admin of admins) {
       await Notification.create({
        userId: admin.email,
        role: "admin",
        title: "Employee Back on Duty",
        message: `${permission.employeeName} returned from permission.`,
        type: "permission"
      });
    }

    res.json({
      message: "Back to duty successful",
      data: permission,
      locationCheck: {
        distance: distance !== -1 ? `${Math.round(distance)}m` : "No assigned location",
        isInside
      }
    });

  } catch (error) {
    console.error("Back to Duty Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * EMPLOYEE → GET MY PERMISSIONS
 */
exports.getEmployeePermissions = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const permissions = await Permission.find({ employeeId }).sort({ createdAt: -1 });
    res.json(permissions);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
