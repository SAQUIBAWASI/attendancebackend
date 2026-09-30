// routes/timelyPlanRoutes.js
const express = require("express");
const router = express.Router();
const {
  createTimelyPlan,
  getAllTimelyPlans,
  getTimelyPlanById,
  updateTimelyPlan,
  deleteTimelyPlan,
  toggleTimelyPlanStatus,
} = require("../controller/timelyPlanController");

// CRUD Routes
router.post("/addtimelyplan", createTimelyPlan);
router.get("/getalltimelyplans", getAllTimelyPlans);
router.get("/getsingleplan/:id", getTimelyPlanById);
router.put("/updatetimelyplan/:id", updateTimelyPlan);
router.delete("/deletetimelyplan/:id", deleteTimelyPlan);
router.put("/toggle-status/:id", toggleTimelyPlanStatus);

module.exports = router;