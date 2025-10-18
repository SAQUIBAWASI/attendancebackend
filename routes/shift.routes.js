const express = require("express");
const router = express.Router();
const {
  assignShift,
  getAllShifts,
  getShiftById,
  updateShift,
  deleteShift,
} = require("../controller/shift.controller");

// POST -> Assign new shift
router.post("/assign", assignShift);

// GET -> Get all shifts (admin)
router.get("/all", getAllShifts);

// ✅ GET -> Get shift by employeeId (for employee dashboard)
router.get("/employee/:employeeId", async (req, res) => {
  try {
    const Shift = require("../models/Shift");
    const shift = await Shift.findOne({ employeeId: req.params.employeeId });
    if (!shift) {
      return res.status(404).json({ message: "Shift not assigned yet" });
    }
    res.status(200).json(shift);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET -> Get one shift by ID (admin)
router.get("/:id", getShiftById);

// PUT -> Update shift
router.put("/:id", updateShift);

// DELETE -> Delete shift
router.delete("/:id", deleteShift);

module.exports = router;
