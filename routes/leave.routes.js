// const express = require("express");
// const router = express.Router();
// const {
//   addLeave,
//   getLeaves,
//   updateLeaveStatus,
//   getPendingLeaves,
//   getLeavesByEmployee,
// } = require("../controller/leave.controller");

// // ✅ Add Leave
// router.post("/add-leave", addLeave);

// // ✅ Get All Leaves
// router.get("/leaves", getLeaves);
// router.get("/employeeleaves/:employeeId", getLeavesByEmployee);
// router.get("/pendingleaves", getPendingLeaves);


// // ✅ Approve / Reject
// router.put("/updateleaves/:id", updateLeaveStatus);

// module.exports = router;



const express = require("express");
const router = express.Router();
const {
  addLeave,
  getLeaves,
  updateLeaveStatus,
  getPendingLeaves,
  getLeavesByEmployee,
  getLeavesWithStatus,
  getOnLeaveToday, // ✅ New function
  getLeaveBalances,
} = require("../controller/leave.controller");

// ✅ Leaves Today (NEW)
router.get("/on-leave-today", getOnLeaveToday);

// ✅ Add Leave
router.post("/add-leave", addLeave);

// ✅ Get All Leaves
router.get("/leaves", getLeaves);
router.get("/employeeleaves/:employeeId", getLeavesByEmployee);
router.get("/pendingleaves", getPendingLeaves);
router.get("/leaves-with-status", getLeavesWithStatus);  // ✅ New route
router.get("/balances/:employeeId", getLeaveBalances);

// ✅ Approve / Reject / Update
router.put("/updateleaves/:id", updateLeaveStatus);

module.exports = router;