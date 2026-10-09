// const express = require("express");
// const router = express.Router();
// const {
//   addCompOff,
//   getCompOffs,
//   getCompOffsByEmployee,
//   updateCompOffStatus,
//   deleteCompOff
// } = require("../controller/compOff.controller");

// // ✅ Add Comp-off (from leave conversion)
// router.post("/comp-offs", addCompOff);

// // ✅ Get All Comp-offs
// router.get("/comp-offs", getCompOffs);

// // ✅ Get Comp-offs by Employee
// router.get("/comp-offs/employee/:employeeId", getCompOffsByEmployee);

// // ✅ Update Comp-off Status
// router.put("/comp-offs/:id", updateCompOffStatus);

// // ✅ Delete Comp-off
// router.delete("/comp-offs/:id", deleteCompOff);

// module.exports = router;


const express = require("express");
const router = express.Router();
const {
  // Comp-off routes
  addCompOff,
  getCompOffs,
  getCompOffsByEmployee,
  updateCompOffStatus,
  updateCompOff,
  deleteCompOff,
  
  // Comp-off request routes
  createCompOffRequest,
  getCompOffRequests,
  getEmployeeCompOffRequests,
  approveCompOffRequest,
  rejectCompOffRequest,

  // ✅ NEW: Extra worked days
  getExtraWorkedDays,

  // Comp-off settings
  getAllCompOffSettings,
  addCompOffSettings,
  updateCompOffSettings,
  deleteCompOffSettings
} = require("../controller/compOff.controller");

// ============ COMP-OFF ROUTES ============
router.post("/comp-offs", addCompOff);
router.get("/comp-offs", getCompOffs);
router.get("/comp-offs/employee/:employeeId", getCompOffsByEmployee);
router.put("/comp-offs/:id", updateCompOffStatus);
router.put("/comp-offs/update/:id", updateCompOff);
router.delete("/comp-offs/:id", deleteCompOff);

// ============ COMP-OFF REQUESTS ROUTES ============
router.post("/comp-off-requests", createCompOffRequest);
router.get("/comp-off-requests/employee/:employeeId", getEmployeeCompOffRequests);
router.get("/comp-off-requests", getCompOffRequests);
router.put("/comp-off-requests/:id/approve", approveCompOffRequest);
router.put("/comp-off-requests/:id/reject", rejectCompOffRequest);

// ✅ NEW: Extra worked days (week-off / holiday work)
router.get("/extra-worked-days/:employeeId", getExtraWorkedDays);

// 📌 Comp-Off Settings
router.post("/add-comp-off-settings", addCompOffSettings);
router.get("/get-all-comp-off-settings", getAllCompOffSettings);
router.put("/update-comp-off-settings/:id", updateCompOffSettings);
router.delete("/delete-comp-off-settings/:id", deleteCompOffSettings);

module.exports = router;