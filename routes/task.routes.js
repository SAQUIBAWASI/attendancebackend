// const express = require("express");

// const router = express.Router();

// const {
//     createTask,
//     getAllTasks,
//     getMyTasks,
//     updateStatus,
//     updateProgress,
//     deleteTask
// } = require("../controller/taskController");

// router.post("/create", createTask);

// router.get("/", getAllTasks);

// router.get("/my-tasks", getMyTasks);

// router.patch("/:id/status", updateStatus);

// router.patch("/:id/progress", updateProgress);

// router.delete("/:id", deleteTask);

// module.exports = router;


// const express = require("express");
// const router = express.Router();

// const {
//   createTask,
//   getAllTasks,
//   getTaskById,
//   getMyTasks,
//   updateTask,
//   updateStatus,
//   updateProgress,
//   deleteTask,
// } = require("../controller/taskController");

// router.post("/create", createTask);

// router.get("/", getAllTasks);

// router.get("/my-tasks", getMyTasks);

// router.get("/:id", getTaskById);

// router.put("/:id", updateTask);

// router.patch("/:id/status", updateStatus);

// router.patch("/:id/progress", updateProgress);

// router.delete("/:id", deleteTask);

// module.exports = router;


// routes/taskRoutes.js
const express = require("express");
const router = express.Router();

const {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
  bulkUpdateStatus,
  getDepartmentTasks,
  getTaskStats,
  getOverdueTasks,
  exportTaskReport
} = require("../controller/taskController");

// ✅ Admin APIs

// 1. Create Task
router.post("/create", createTask);

// 2. Get All Tasks with Filters
router.get("/", getAllTasks);

// 3. Get Task by ID
router.get("/:id", getTaskById);

// 4. Update Task
router.put("/:id", updateTask);

// 5. Delete Task
router.delete("/:id", deleteTask);

// 6. Bulk Update Status
router.patch("/bulk-status", bulkUpdateStatus);

// 7. Get Department Wise Tasks
router.get("/department/:department", getDepartmentTasks);

// 8. Get Task Statistics
router.get("/stats", getTaskStats);

// 9. Get Overdue Tasks
router.get("/overdue", getOverdueTasks);

// 10. Export Task Report
router.get("/export/report", exportTaskReport);

module.exports = router;