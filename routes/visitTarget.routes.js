const express = require("express");
const router = express.Router();
const {
  setTarget,
  getAllTargets,
  getEmployeeTarget,
  deleteTarget,
} = require("../controller/visitTarget.controller");

// Assign / update a target
router.post("/set", setTarget);

// Get all targets (optionally filter by ?month=YYYY-MM)
router.get("/all", getAllTargets);

// Get one employee's target for a month (?employeeId=...&month=...)
router.get("/employee", getEmployeeTarget);

// Delete a target by ID
router.delete("/delete/:id", deleteTarget);

module.exports = router;