const express = require("express");
const router = express.Router();
const {
  addLeave,
  getLeaves,
  updateLeaveStatus,
  getPendingLeaves,
  getLeavesByEmployee,
} = require("../controller/leave.controller");

// ✅ Add Leave
router.post("/add-leave", addLeave);

// ✅ Get All Leaves
router.get("/leaves", getLeaves);
router.get("/employeeleaves/:employeeId", getLeavesByEmployee);
router.get("/pendingleaves", getPendingLeaves);


// ✅ Approve / Reject
router.put("/updateleaves/:id", updateLeaveStatus);

module.exports = router;
