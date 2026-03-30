const express = require("express");
const router = express.Router();
const attendanceEditRequestController = require("../controller/attendanceEditRequest.controller");

// ➕ Submit a new request
router.post("/create", attendanceEditRequestController.createRequest);

// 📋 Get all requests (for admin)
router.get("/all", attendanceEditRequestController.getAllRequests);

// 🔍 Get requests for a specific employee
router.get("/employee/:employeeId", attendanceEditRequestController.getRequestsByEmployee);

// ✅ Update request status (Admin)
router.put("/update-status/:id", attendanceEditRequestController.updateRequestStatus);

module.exports = router;
