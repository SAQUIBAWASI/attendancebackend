const express = require("express");
const router = express.Router();

const {
  createTask,
  getMyTasks,
  getTaskById,
  updateStatus,
  updateProgress,
  getOverdueTasks,
  getMyTaskStats,
  filterMyTasks,
  getTaskSummary,
  bulkUpdateMyTasks
} = require("../controller/employeeTaskController");

// ✅ Employee APIs

// 1. Create Task
router.post("/create", createTask);

// 2. Get My Tasks
router.get("/my-tasks", getMyTasks);

// 3. Get Task by ID
router.get("/:id", getTaskById);

// 4. Update Task Status
router.patch("/:id/status", updateStatus);

// 5. Update Task Progress
router.patch("/:id/progress", updateProgress);

// 6. Get Overdue Tasks
router.get("/overdue", getOverdueTasks);

// 7. Get My Task Statistics
router.get("/stats", getMyTaskStats);

// 8. Filter My Tasks
router.get("/filter", filterMyTasks);

// 9. Get Task Summary (Dashboard)
router.get("/summary", getTaskSummary);

// 10. Bulk Update My Tasks
router.patch("/bulk-update", bulkUpdateMyTasks);

module.exports = router;