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

// GET -> Get all shifts
router.get("/all", getAllShifts);

// GET -> Get one shift by ID
router.get("/:id", getShiftById);

// PUT -> Update shift
router.put("/:id", updateShift);

// DELETE -> Delete shift
router.delete("/:id", deleteShift);

module.exports = router;
