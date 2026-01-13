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


const express = require("express");
const router = express.Router();

console.log("✅ Shift Routes Loaded");

// POST - Create master shift
router.post("/create", async (req, res) => {
  console.log("🟢 POST /create called");
  try {
    const controller = require("../controller/shift.controller");
    return await controller.createMasterShift(req, res);
  } catch (error) {
    console.error("POST /create error:", error);
    return res.status(500).json({ success: false, message: "Route error", error: error.message });
  }
});

// GET - All master shifts
router.get("/master", async (req, res) => {
  console.log("🟢 GET /master called");
  try {
    const controller = require("../controller/shift.controller");
    return await controller.getMasterShifts(req, res);
  } catch (error) {
    console.error("GET /master error:", error);
    return res.status(500).json({ success: false, message: "Route error" });
  }
});

// GET - All employee assignments
router.get("/assignments", async (req, res) => {
  console.log("🟢 GET /assignments called");
  try {
    const controller = require("../controller/shift.controller");
    return await controller.getEmployeeAssignments(req, res);
  } catch (error) {
    console.error("GET /assignments error:", error);
    return res.status(500).json({ success: false, message: "Route error" });
  }
});

// POST - Assign shift to employee
router.post("/assign", async (req, res) => {
  console.log("🟢 POST /assign called");
  try {
    const controller = require("../controller/shift.controller");
    return await controller.assignShiftToEmployee(req, res);
  } catch (error) {
    console.error("POST /assign error:", error);
    return res.status(500).json({ success: false, message: "Route error", error: error.message });
  }
});

// PUT - Update assignment
router.put("/assignments/:id", async (req, res) => {
  console.log("🟢 PUT /assignments/:id called - ID:", req.params.id);
  try {
    const controller = require("../controller/shift.controller");
    return await controller.updateAssignment(req, res);
  } catch (error) {
    console.error("PUT error:", error);
    return res.status(500).json({ success: false, message: "Route error", error: error.message });
  }
});

// DELETE - Delete master shift
router.delete("/master/:id", async (req, res) => {
  console.log("🟢 DELETE /master/:id called - ID:", req.params.id);
  try {
    const controller = require("../controller/shift.controller");
    return await controller.deleteMasterShift(req, res);
  } catch (error) {
    console.error("DELETE master error:", error);
    return res.status(500).json({ success: false, message: "Route error", error: error.message });
  }
});

// DELETE - Delete assignment
router.delete("/assignments/:id", async (req, res) => {
  console.log("🟢 DELETE /assignments/:id called - ID:", req.params.id);
  try {
    const controller = require("../controller/shift.controller");
    return await controller.deleteAssignment(req, res);
  } catch (error) {
    console.error("DELETE assignment error:", error);
    return res.status(500).json({ success: false, message: "Route error", error: error.message });
  }
});

// GET - Employees by shift type
router.get("/type/:shiftType/employees", async (req, res) => {
  console.log("🟢 GET /type/:shiftType/employees called");
  try {
    const controller = require("../controller/shift.controller");
    return await controller.getEmployeesByShiftType(req, res);
  } catch (error) {
    console.error("GET employees error:", error);
    return res.status(500).json({ success: false, message: "Route error", error: error.message });
  }
});

module.exports = router;