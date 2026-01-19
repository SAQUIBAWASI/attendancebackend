// const express = require("express");
// const router = express.Router();
// const {
//   assignShift,
//   getAllShifts,
//   getShiftById,
//   updateShift,
//   deleteShift,
// } = require("../controller/shift.controller");

// // POST -> Assign new shift
// router.post("/assign", assignShift);

// // GET -> Get all shifts (admin)
// router.get("/all", getAllShifts);

// // ✅ GET -> Get shift by employeeId (for employee dashboard)
// router.get("/employee/:employeeId", async (req, res) => {
//   try {
//     const Shift = require("../models/Shift");
//     const shift = await Shift.findOne({ employeeId: req.params.employeeId });
//     if (!shift) {
//       return res.status(404).json({ message: "Shift not assigned yet" });
//     }
//     res.status(200).json(shift);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // GET -> Get one shift by ID (admin)
// router.get("/:id", getShiftById);

// // PUT -> Update shift
// router.put("/:id", updateShift);

// // DELETE -> Delete shift
// router.delete("/:id", deleteShift);

// module.exports = router;


// routes/shift.routes.js
const express = require("express");
const router = express.Router();
const shiftController = require("../controller/shift.controller");

console.log("✅ Shift Routes Loaded");

// ✅ Master Shifts
router.post("/create", shiftController.createMasterShift);
router.get("/master", shiftController.getMasterShifts);
router.delete("/master/:id", shiftController.deleteMasterShift);

// ✅ Employee Assignments
router.get("/assignments", shiftController.getEmployeeAssignments);
router.post("/assign", shiftController.assignShiftToEmployee);
router.put("/assignments/:id", shiftController.updateAssignment);
router.delete("/assignments/:id", shiftController.deleteAssignment);

// ✅ Employee Dashboard
router.get("/employee/:employeeId", shiftController.getShiftForEmployee);

// ✅ Shift Type based
router.get("/type/:shiftType/employees", shiftController.getEmployeesByShiftType);



// GET - Get shift for specific employee (Employee Dashboard)
router.get("/employee/:employeeId", async (req, res) => {
  console.log("🟢 GET /employee/:employeeId called - ID:", req.params.employeeId);
  try {
    const controller = require("../controller/shift.controller");
    return await controller.getShiftForEmployee(req, res);
  } catch (error) {
    console.error("GET /employee/:employeeId error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Route error", 
      error: error.message 
    });
  }
});

module.exports = router;

module.exports = router;