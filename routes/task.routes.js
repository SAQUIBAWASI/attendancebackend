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
  exportTaskReport,
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getMyAssignedTasks,
  updateTaskByEmployee
} = require("../controller/taskController");

// ✅ Admin APIs



const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadPath = "uploads/voice-notes";

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    cb(
      null,
      `voice-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "audio/mpeg",
    "audio/mp3",
    "audio/wav",
    "audio/webm",
    "audio/ogg",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only audio files are allowed"), false);
  }
};

const uploadVoiceNote = multer({
  storage,
  fileFilter,
});


// 1. Create Task
router.post("/createtask",   uploadVoiceNote.single("voiceNote"),   createTask);

// 2. Get All Tasks with Filters
router.get("/getalltasks", getAllTasks);

// 3. Get Task by ID
router.get("/singletask/:id", getTaskById);

// 4. Update Task
router.put("/updatetask/:id",   uploadVoiceNote.single("voiceNote"),  updateTask);

// 5. Delete Task
router.delete("/deletetask/:id", deleteTask);

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


router.post("/createproject", createProject);

router.get("/getallprojects", getAllProjects);

router.get("/getsingleproject/:id", getProjectById);

router.put("/updateproject/:id", updateProject);

router.delete("/delete/:id", deleteProject);

router.get("/my-assigned-tasks/:employeeId", getMyAssignedTasks);
router.put("/employee/update-task/:taskId/:employeeId", updateTaskByEmployee);


module.exports = router;