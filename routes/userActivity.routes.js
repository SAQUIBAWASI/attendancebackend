const express = require("express");
const router = express.Router();
const userActivityController = require("../controller/userActivity.controller");

// ✅ Get all activities with filtering and pagination
router.get("/all", userActivityController.getAllActivities);

// ✅ Get activities for a specific user
router.get("/user/:userId", userActivityController.getActivitiesByUser);

// ✅ Get activity statistics
router.get("/stats", userActivityController.getActivityStats);

// ✅ Manually create an activity log
router.post("/log", userActivityController.createActivity);

module.exports = router;
