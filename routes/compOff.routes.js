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
  updateCompOff,  // ✅ Import added
  deleteCompOff,
  
  // Comp-off request routes
  createCompOffRequest,
  getCompOffRequests,
  getEmployeeCompOffRequests,
  approveCompOffRequest,
  rejectCompOffRequest,
  getAllCompOffSettings,
  addCompOffSettings
} = require("../controller/compOff.controller");

// ============ COMP-OFF ROUTES ============
router.post("/comp-offs", addCompOff);
router.get("/comp-offs", getCompOffs);
router.get("/comp-offs/employee/:employeeId", getCompOffsByEmployee);
router.put("/comp-offs/:id", updateCompOffStatus);
router.put("/comp-offs/update/:id", updateCompOff);  // ✅ Update route
router.delete("/comp-offs/:id", deleteCompOff);

// ============ COMP-OFF REQUESTS ROUTES ============
router.post("/comp-off-requests", createCompOffRequest);
router.get("/comp-off-requests/employee/:employeeId", getEmployeeCompOffRequests);
router.get("/comp-off-requests", getCompOffRequests);
router.put("/comp-off-requests/:id/approve", approveCompOffRequest);
router.put("/comp-off-requests/:id/reject", rejectCompOffRequest);


// 📌 Add Comp-Off Settings
router.post("/add-comp-off-settings", addCompOffSettings);

// 📌 Get All Comp-Off Settings
router.get("/get-all-comp-off-settings", getAllCompOffSettings);


module.exports = router;