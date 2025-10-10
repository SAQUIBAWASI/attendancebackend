const express = require("express");
const router = express.Router();
const { addLeave, getLeaves, updateLeaveStatus } = require("../controller/leave.controller");

// ✅ Add Leave
router.post("/add-leave", addLeave);

// ✅ Get All Leaves
router.get("/leaves", getLeaves);

// ✅ Update (Approve / Reject)
router.put("/leaves/:id", updateLeaveStatus);

module.exports = router;
