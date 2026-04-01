const MedicalCertificate = require("../models/MedicalCertificate");

exports.uploadCertificate = async (req, res) => {
  try {
    const { employeeId, employeeName, candidateId, candidateName, registrationDate, expiryDate } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No document uploaded" });
    }

    const documentUrl = `/uploads/medical-certificates/${req.file.filename}`;

    const newCertificate = new MedicalCertificate({
      employeeId,
      employeeName,
      candidateId,
      candidateName,
      registrationDate,
      expiryDate,
      documentUrl,
    });

    await newCertificate.save();

    res.status(201).json({
      success: true,
      message: "Medical certificate uploaded successfully",
      data: newCertificate,
    });
  } catch (error) {
    console.error("Upload Medical Certificate Error:", error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

exports.getEmployeeCertificates = async (req, res) => {
  try {
    const { employeeId } = req.params; 

    // ✅ Safety Check: If ID is missing or "undefined", return empty array
    if (!employeeId || employeeId === "undefined" || employeeId === "null" || employeeId === "") {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }
    
    // Find where either employeeId matches OR candidateId matches
    const mongoose = require("mongoose");
    const queryConditions = [{ employeeId: employeeId }];
    
    // Only search candidateId if the passed ID is actually a valid 24-character hex ObjectId
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(employeeId);
    if (isObjectId) {
      queryConditions.push({ candidateId: employeeId });
    }

    const certificates = await MedicalCertificate.find({
      $or: queryConditions
    }).sort({ uploadedAt: -1 });

    res.status(200).json({
      success: true,
      data: certificates,
    });
  } catch (error) {
    console.error("Get Employee Certificates Error:", error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

exports.getAllCertificates = async (req, res) => {
  try {
    const certificates = await MedicalCertificate.find().sort({ uploadedAt: -1 });

    res.status(200).json({
      success: true,
      data: certificates,
    });
  } catch (error) {
    console.error("Get All Certificates Error:", error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

const Notification = require("../models/Notification");

exports.sendReminder = async (req, res) => {
  try {
    const { recipientId, message } = req.body;

    if (!recipientId || !message) {
      return res.status(400).json({ success: false, message: "Recipient ID and message are required" });
    }

    // Align with Attendance Backend Notification model
    const newNotification = new Notification({
      userId: recipientId,
      role: "employee", // Default for medical reminders
      title: "Medical Certificate Re-upload",
      message,
      type: "medical_reminder"
    });

    await newNotification.save();

    res.status(201).json({
      success: true,
      message: "Reminder sent successfully",
      data: newNotification,
    });
  } catch (error) {
    console.error("Send Reminder Error:", error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const { recipientId } = req.params;

    if (!recipientId) {
      return res.status(400).json({ success: false, message: "Recipient ID is required" });
    }

    // Search by either userId OR recipientId to be safe across models
    const notifications = await Notification.find({ 
      $or: [{ userId: recipientId }, { recipientId: recipientId }] 
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error("Get Notifications Error:", error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};
