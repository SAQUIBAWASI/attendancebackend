// ═══════════════════════════════════════════════════════════════════════
// NEW: Revenue Target Routes
// File: routes/revenueTargetRoutes.js
// ═══════════════════════════════════════════════════════════════════════
const express = require("express");
const router = express.Router();

const {
  getRevenueTarget,
  saveRevenueTarget,
  updateRevenueTarget,
  updateAchievedByMonth,
  getAllRevenueTargets,
  deleteRevenueTarget,
} = require("../controller/revenueTargetController");

router.get("/revenue-target", getRevenueTarget);
router.post("/save-revenue-target", saveRevenueTarget);
router.put("/update-revenue-target/:id", updateRevenueTarget);
router.patch("/update-target-achieved", updateAchievedByMonth);
router.get("/all-revenue-targets", getAllRevenueTargets);
router.delete("/revenue-target/:id", deleteRevenueTarget);

module.exports = router;