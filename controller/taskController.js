// const Task = require("../models/Task");
// const Employee = require("../models/Employee");

// // CREATE TASK
// exports.createTask = async (req, res) => {
// try {
// const {
// taskName,
// title,
// description,
// createdBy,
// createdByType,
// assignType,
// assignedTo,
// department,
// priority,
// deadlineType,
// deadlineValue,
// } = req.body;

// ```
// let employeeIds = [];

// if (assignType === "ALL") {
//   const employees = await Employee.find({
//     status: "active",
//   });

//   employeeIds = employees.map((emp) => emp._id);
// }

// else if (assignType === "DEPARTMENT") {
//   const employees = await Employee.find({
//     department,
//   });

//   employeeIds = employees.map((emp) => emp._id);
// }

// else if (assignType === "INDIVIDUAL") {
//   employeeIds = assignedTo;
// }

// else if (assignType === "SELF") {
//   employeeIds = [createdBy];
// }

// let dueDate = new Date();

// if (deadlineType === "Days") {
//   dueDate.setDate(
//     dueDate.getDate() + Number(deadlineValue)
//   );
// }

// if (deadlineType === "Week") {
//   dueDate.setDate(
//     dueDate.getDate() + Number(deadlineValue) * 7
//   );
// }

// if (deadlineType === "Month") {
//   dueDate.setMonth(
//     dueDate.getMonth() + Number(deadlineValue)
//   );
// }

// const task = await Task.create({
//   taskName,
//   title,
//   description,
//   createdBy,
//   createdByType,
//   assignType,
//   assignedTo: employeeIds,
//   department,
//   priority,
//   deadlineType,
//   deadlineValue,
//   dueDate,
// });

// res.status(201).json({
//   success: true,
//   message: "Task Created Successfully",
//   task,
// });
// ```

// } catch (error) {
// console.log(error);

// ```
// res.status(500).json({
//   success: false,
//   message: error.message,
// });
// ```

// }
// };

// // GET ALL TASKS
// exports.getAllTasks = async (req, res) => {
// try {
// const tasks = await Task.find()
// .sort({ createdAt: -1 });

// ```
// res.status(200).json({
//   success: true,
//   count: tasks.length,
//   tasks,
// });
// ```

// } catch (error) {
// res.status(500).json({
// success: false,
// message: error.message,
// });
// }
// };

// // GET TASK BY ID
// exports.getTaskById = async (req, res) => {
// try {
// const task = await Task.findById(req.params.id);

// ```
// if (!task) {
//   return res.status(404).json({
//     success: false,
//     message: "Task Not Found",
//   });
// }

// res.status(200).json({
//   success: true,
//   task,
// });
// ```

// } catch (error) {
// res.status(500).json({
// success: false,
// message: error.message,
// });
// }
// };

// // GET MY TASKS
// exports.getMyTasks = async (req, res) => {
// try {

// ```
// const { employeeId } = req.query;

// const tasks = await Task.find({
//   assignedTo: employeeId,
// });

// res.status(200).json({
//   success: true,
//   count: tasks.length,
//   tasks,
// });
// ```

// } catch (error) {
// res.status(500).json({
// success: false,
// message: error.message,
// });
// }
// };

// // UPDATE TASK
// exports.updateTask = async (req, res) => {
// try {

// ```
// const task = await Task.findByIdAndUpdate(
//   req.params.id,
//   req.body,
//   {
//     new: true,
//   }
// );

// res.status(200).json({
//   success: true,
//   message: "Task Updated Successfully",
//   task,
// });
// ```

// } catch (error) {
// res.status(500).json({
// success: false,
// message: error.message,
// });
// }
// };

// // UPDATE STATUS
// exports.updateStatus = async (req, res) => {
// try {

// ```
// const task = await Task.findByIdAndUpdate(
//   req.params.id,
//   {
//     status: req.body.status,
//   },
//   {
//     new: true,
//   }
// );

// res.status(200).json({
//   success: true,
//   message: "Task Status Updated",
//   task,
// });
// ```

// } catch (error) {
// res.status(500).json({
// success: false,
// message: error.message,
// });
// }
// };

// // UPDATE PROGRESS
// exports.updateProgress = async (req, res) => {
// try {

// ```
// const task = await Task.findByIdAndUpdate(
//   req.params.id,
//   {
//     progress: req.body.progress,
//   },
//   {
//     new: true,
//   }
// );

// res.status(200).json({
//   success: true,
//   message: "Task Progress Updated",
//   task,
// });
// ```

// } catch (error) {
// res.status(500).json({
// success: false,
// message: error.message,
// });
// }
// };

// // DELETE TASK
// exports.deleteTask = async (req, res) => {
// try {

// ```
// await Task.findByIdAndDelete(
//   req.params.id
// );

// res.status(200).json({
//   success: true,
//   message: "Task Deleted Successfully",
// });
// ```

// } catch (error) {
// res.status(500).json({
// success: false,
// message: error.message,
// });
// }
// };


// const Task = require("../models/Task");
// const Employee = require("../models/Employee");

// // CREATE TASK
// exports.createTask = async (req, res) => {
//   try {
//     const {
//       taskName,
//       title,
//       description,
//       createdBy,
//       createdByType,
//       assignType,
//       assignedTo,
//       department,
//       priority,
//       deadlineType,
//       deadlineValue,
//     } = req.body;

//     let employeeIds = [];

//     if (assignType === "ALL") {
//       const employees = await Employee.find({
//         status: "active",
//       });

//       employeeIds = employees.map((emp) => emp._id);
//     } else if (assignType === "DEPARTMENT") {
//       const employees = await Employee.find({
//         department,
//       });

//       employeeIds = employees.map((emp) => emp._id);
//     } else if (assignType === "INDIVIDUAL") {
//       employeeIds = assignedTo;
//     } else if (assignType === "SELF") {
//       employeeIds = [createdBy];
//     }

//     let dueDate = new Date();

//     if (deadlineType === "Days") {
//       dueDate.setDate(
//         dueDate.getDate() + Number(deadlineValue)
//       );
//     }

//     if (deadlineType === "Week") {
//       dueDate.setDate(
//         dueDate.getDate() + Number(deadlineValue) * 7
//       );
//     }

//     if (deadlineType === "Month") {
//       dueDate.setMonth(
//         dueDate.getMonth() + Number(deadlineValue)
//       );
//     }

//     const task = await Task.create({
//       taskName,
//       title,
//       description,
//       createdBy,
//       createdByType,
//       assignType,
//       assignedTo: employeeIds,
//       department,
//       priority,
//       deadlineType,
//       deadlineValue,
//       dueDate,
//     });

//     return res.status(201).json({
//       success: true,
//       message: "Task Created Successfully",
//       task,
//     });
//   } catch (error) {
//     console.log("Create Task Error:", error);

//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// // GET ALL TASKS
// exports.getAllTasks = async (req, res) => {
//   try {
//     const tasks = await Task.find().sort({
//       createdAt: -1,
//     });

//     return res.status(200).json({
//       success: true,
//       count: tasks.length,
//       tasks,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// // GET TASK BY ID
// exports.getTaskById = async (req, res) => {
//   try {
//     const task = await Task.findById(req.params.id);

//     if (!task) {
//       return res.status(404).json({
//         success: false,
//         message: "Task Not Found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       task,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// // GET MY TASKS
// exports.getMyTasks = async (req, res) => {
//   try {
//     const { employeeId } = req.query;

//     const tasks = await Task.find({
//       assignedTo: employeeId,
//     });

//     return res.status(200).json({
//       success: true,
//       count: tasks.length,
//       tasks,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// // UPDATE TASK
// exports.updateTask = async (req, res) => {
//   try {
//     const task = await Task.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       {
//         new: true,
//         runValidators: true,
//       }
//     );

//     if (!task) {
//       return res.status(404).json({
//         success: false,
//         message: "Task Not Found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Task Updated Successfully",
//       task,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// // UPDATE STATUS
// exports.updateStatus = async (req, res) => {
//   try {
//     const task = await Task.findByIdAndUpdate(
//       req.params.id,
//       {
//         status: req.body.status,
//       },
//       {
//         new: true,
//       }
//     );

//     if (!task) {
//       return res.status(404).json({
//         success: false,
//         message: "Task Not Found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Task Status Updated Successfully",
//       task,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// // UPDATE PROGRESS
// exports.updateProgress = async (req, res) => {
//   try {
//     const task = await Task.findByIdAndUpdate(
//       req.params.id,
//       {
//         progress: req.body.progress,
//       },
//       {
//         new: true,
//       }
//     );

//     if (!task) {
//       return res.status(404).json({
//         success: false,
//         message: "Task Not Found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Task Progress Updated Successfully",
//       task,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// // DELETE TASK
// exports.deleteTask = async (req, res) => {
//   try {
//     const task = await Task.findByIdAndDelete(
//       req.params.id
//     );

//     if (!task) {
//       return res.status(404).json({
//         success: false,
//         message: "Task Not Found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Task Deleted Successfully",
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };


// taskController.js - Admin APIs

const Task = require("../models/Task");
const Employee = require("../models/Employee");
const Admin = require("../models/Admin");
const Department = require("../models/Department");
const Project = require("../models/Project");
const mongoose = require("mongoose");

// ============================================
// CREATE TASK
// ============================================
exports.createTask = async (req, res) => {
  try {
    let {
      taskName,
      title,
      description,
      projectId,
      createdBy,
      createdByType = "admin",

      assignType,
      assignedTo,
      department,

      priority,
      frequency,

      deadlineType,
      deadlineValue,

      remark,

      attachments = [],
      employeeUpdates = [],
      expenses = []
    } = req.body;

    // ============================================
    // VOICE NOTE (MULTER)
    // ============================================

    let voiceNote = null;

    if (req.file) {
      voiceNote = req.file.path.replace(/\\/g, "/");
    }

    // ============================================
    // PARSE FORM-DATA ARRAYS
    // ============================================

    if (
      assignType === "INDIVIDUAL" &&
      typeof assignedTo === "string"
    ) {
      try {
        assignedTo = JSON.parse(assignedTo);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "assignedTo must be a valid array",
        });
      }
    }

    if (typeof attachments === "string") {
      try {
        attachments = JSON.parse(attachments);
      } catch (error) {
        attachments = [];
      }
    }

    if (typeof employeeUpdates === "string") {
      try {
        employeeUpdates = JSON.parse(employeeUpdates);
      } catch (error) {
        employeeUpdates = [];
      }
    }

    if (typeof expenses === "string") {
      try {
        expenses = JSON.parse(expenses);
      } catch (error) {
        expenses = [];
      }
    }

    // ============================================
    // VALIDATION
    // ============================================

    if (
      !taskName ||
      !title ||
      !description ||
      !assignType
    ) {
      return res.status(400).json({
        success: false,
        message:
          "taskName, title, description and assignType are required",
      });
    }

    // ============================================
    // PROJECT VALIDATION (OPTIONAL)
    // ============================================

    if (projectId) {
      const project = await Project.findById(projectId);

      if (!project) {
        return res.status(404).json({
          success: false,
          message: "Project not found",
        });
      }
    }

    let employeeIds = [];

    // ============================================
    // ASSIGNMENT LOGIC
    // ============================================

    if (assignType === "ALL") {
      const employees = await Employee.find({
        status: "active",
      }).select("_id");

      if (employees.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No active employees found",
        });
      }

      employeeIds = employees.map((emp) => emp._id);
    }

    else if (assignType === "DEPARTMENT") {
      if (!department) {
        return res.status(400).json({
          success: false,
          message:
            "department is required when assignType is DEPARTMENT",
        });
      }

      const employees = await Employee.find({
        department,
        status: "active",
      }).select("_id");

      if (employees.length === 0) {
        return res.status(400).json({
          success: false,
          message:
            "No active employees found in selected department",
        });
      }

      employeeIds = employees.map((emp) => emp._id);
    }

    else if (assignType === "INDIVIDUAL") {
      if (!assignedTo || assignedTo.length === 0) {
        return res.status(400).json({
          success: false,
          message:
            "assignedTo is required when assignType is INDIVIDUAL",
        });
      }

      const validEmployees = await Employee.find({
        _id: { $in: assignedTo },
        status: "active",
      }).select("_id");

      if (validEmployees.length !== assignedTo.length) {
        return res.status(400).json({
          success: false,
          message:
            "Some employee ids are invalid or inactive",
        });
      }

      employeeIds = assignedTo;
    }

    else if (assignType === "SELF") {
      if (!createdBy) {
        return res.status(400).json({
          success: false,
          message:
            "createdBy is required when assignType is SELF",
        });
      }

      employeeIds = [createdBy];
    }

    else {
      return res.status(400).json({
        success: false,
        message:
          "Invalid assignType. Use ALL, DEPARTMENT, INDIVIDUAL or SELF",
      });
    }

    // ============================================
    // DUE DATE LOGIC
    // ============================================

    let dueDate = null;

    if (deadlineType) {
      dueDate = new Date();

      if (deadlineType === "Days") {
        dueDate.setDate(
          dueDate.getDate() + Number(deadlineValue || 1)
        );
      }

      else if (deadlineType === "Week") {
        dueDate.setDate(
          dueDate.getDate() +
          Number(deadlineValue || 1) * 7
        );
      }

      else if (deadlineType === "Month") {
        dueDate.setMonth(
          dueDate.getMonth() +
          Number(deadlineValue || 1)
        );
      }

      else if (deadlineType === "Custom") {
        dueDate = new Date(deadlineValue);
      }
    }

    // ============================================
    // CREATE TASK
    // ============================================

    const task = await Task.create({
      taskName,
      title,
      description,

      projectId: projectId || null,

      createdBy,
      createdByType,

      assignType,

      assignedTo: employeeIds,

      department:
        assignType === "DEPARTMENT"
          ? department
          : null,

      priority: priority || "Medium",

      frequency: frequency || "One Time",

      deadlineType,
      deadlineValue,

      dueDate,

      voiceNote,

      remark,

      attachments,

      employeeUpdates,

      expenses,

      progress: 0,

      status: "Pending",
    });

    // ============================================
    // POPULATE DATA
    // ============================================

    const populatedTask = await Task.findById(task._id)
      .populate(
        "projectId",
        "projectName status"
      )
      .populate(
        "assignedTo",
        "fullName email employeeId"
      )
      .populate(
        "employeeUpdates.employeeId",
        "fullName email"
      )
      .populate(
        "expenses.addedBy",
        "fullName email"
      );

    return res.status(201).json({
      success: true,
      message: `Task assigned to ${employeeIds.length} employee(s) successfully`,
      assignedCount: employeeIds.length,
      task: populatedTask,
    });

  } catch (error) {
    console.error("Create Task Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// ============================================
// 2. GET ALL TASKS WITH FILTERS (Admin)
// ============================================
exports.getAllTasks = async (req, res) => {
  try {
    const {
      status,
      priority,
      department,
      assignType,
      createdBy,
      search,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc"
    } = req.query;

    // Build filter object
    let filter = {};

    if (status) {
      filter.status = status;
    }

    if (priority) {
      filter.priority = priority;
    }

    if (department) {
      filter.department = department;
    }

    if (assignType) {
      filter.assignType = assignType;
    }

    if (createdBy) {
      filter.createdBy = createdBy;
    }

    // Search functionality
    if (search) {
      filter.$or = [
        { taskName: { $regex: search, $options: "i" } },
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    // Pagination
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Sorting
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Get total count for pagination
    const totalTasks = await Task.countDocuments(filter);

    // Get tasks with pagination and population
    const tasks = await Task.find(filter)
      .populate("createdBy", "fullName email profileImage")
      .populate("assignedTo", "fullName email department profileImage")
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNumber);

    // Calculate statistics
    const stats = {
      total: totalTasks,
      pending: await Task.countDocuments({ ...filter, status: "Pending" }),
      inProgress: await Task.countDocuments({ ...filter, status: "In Progress" }),
      completed: await Task.countDocuments({ ...filter, status: "Completed" }),
      rejected: await Task.countDocuments({ ...filter, status: "Rejected" }),
      overdue: await Task.countDocuments({ ...filter, status: "Overdue" })
    };

    return res.status(200).json({
      success: true,
      tasks,
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(totalTasks / limitNumber),
        totalItems: totalTasks,
        itemsPerPage: limitNumber
      },
      stats
    });

  } catch (error) {
    console.error("Get All Tasks Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// 3. GET TASK BY ID (Admin)
// ============================================
exports.getTaskById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID"
      });
    }

    const task = await Task.findById(id)
      .populate("createdBy", "fullName email department profileImage")
      .populate("assignedTo", "fullName email department profileImage");

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    return res.status(200).json({
      success: true,
      task
    });

  } catch (error) {
    console.error("Get Task By ID Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// UPDATE TASK (Admin)
// ============================================
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;

    let {
      taskName,
      title,
      description,

      projectId,

      assignType,
      assignedTo,
      department,

      priority,
      frequency,

      deadlineType,
      deadlineValue,

      status,
      progress,

      remark,

      attachments,
      employeeUpdates,
      expenses
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID"
      });
    }

    const existingTask = await Task.findById(id);

    if (!existingTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    // ============================================
    // VOICE NOTE (MULTER)
    // ============================================

    let voiceNote;

    if (req.file) {
      voiceNote = req.file.path.replace(/\\/g, "/");
    }

    // ============================================
    // PARSE ARRAYS
    // ============================================

    if (
      assignType === "INDIVIDUAL" &&
      typeof assignedTo === "string"
    ) {
      assignedTo = JSON.parse(assignedTo);
    }

    if (
      attachments &&
      typeof attachments === "string"
    ) {
      attachments = JSON.parse(attachments);
    }

    if (
      employeeUpdates &&
      typeof employeeUpdates === "string"
    ) {
      employeeUpdates = JSON.parse(employeeUpdates);
    }

    if (
      expenses &&
      typeof expenses === "string"
    ) {
      expenses = JSON.parse(expenses);
    }

    // ============================================
    // UPDATE DATA
    // ============================================

    let updateData = {};

    if (taskName) updateData.taskName = taskName;
    if (title) updateData.title = title;
    if (description) updateData.description = description;

    if (projectId) updateData.projectId = projectId;

    if (priority) updateData.priority = priority;
    if (frequency) updateData.frequency = frequency;

    if (status) updateData.status = status;

    if (progress !== undefined) {
      updateData.progress = progress;
    }

    if (remark !== undefined) {
      updateData.remark = remark;
    }

    if (voiceNote) {
      updateData.voiceNote = voiceNote;
    }

    if (attachments) {
      updateData.attachments = attachments;
    }

    if (employeeUpdates) {
      updateData.employeeUpdates = employeeUpdates;
    }

    if (expenses) {
      updateData.expenses = expenses;
    }

    // ============================================
    // PROJECT VALIDATION
    // ============================================

    if (projectId) {
      const project = await Project.findById(projectId);

      if (!project) {
        return res.status(404).json({
          success: false,
          message: "Project not found"
        });
      }
    }

    // ============================================
    // ASSIGNMENT LOGIC
    // ============================================

    if (assignType) {
      updateData.assignType = assignType;

      let employeeIds = [];

      if (assignType === "ALL") {
        const employees = await Employee.find({
          status: "active"
        }).select("_id");

        employeeIds = employees.map(
          (emp) => emp._id
        );

        updateData.department = null;
      }

      else if (assignType === "DEPARTMENT") {
        if (!department) {
          return res.status(400).json({
            success: false,
            message:
              "Department is required for DEPARTMENT assignment type"
          });
        }

        const employees = await Employee.find({
          department,
          status: "active"
        }).select("_id");

        employeeIds = employees.map(
          (emp) => emp._id
        );

        updateData.department = department;
      }

      else if (assignType === "INDIVIDUAL") {
        if (
          !assignedTo ||
          assignedTo.length === 0
        ) {
          return res.status(400).json({
            success: false,
            message:
              "assignedTo is required for INDIVIDUAL assignment type"
          });
        }

        const validEmployees =
          await Employee.find({
            _id: { $in: assignedTo }
          }).select("_id");

        if (
          validEmployees.length !==
          assignedTo.length
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Some employee ids are invalid"
          });
        }

        employeeIds = assignedTo;

        updateData.department = null;
      }

      else if (assignType === "SELF") {
        employeeIds = [
          existingTask.createdBy
        ];

        updateData.department = null;
      }

      updateData.assignedTo = employeeIds;
    }

    // ============================================
    // DEADLINE LOGIC
    // ============================================

    if (deadlineType || deadlineValue) {
      const finalDeadlineType =
        deadlineType ||
        existingTask.deadlineType;

      const finalDeadlineValue =
        deadlineValue ||
        existingTask.deadlineValue;

      let dueDate = new Date();

      if (finalDeadlineType === "Days") {
        dueDate.setDate(
          dueDate.getDate() +
            Number(finalDeadlineValue)
        );
      }

      else if (
        finalDeadlineType === "Week"
      ) {
        dueDate.setDate(
          dueDate.getDate() +
            Number(finalDeadlineValue) * 7
        );
      }

      else if (
        finalDeadlineType === "Month"
      ) {
        dueDate.setMonth(
          dueDate.getMonth() +
            Number(finalDeadlineValue)
        );
      }

      else if (
        finalDeadlineType === "Custom"
      ) {
        dueDate = new Date(
          finalDeadlineValue
        );
      }

      updateData.deadlineType =
        finalDeadlineType;

      updateData.deadlineValue =
        finalDeadlineValue;

      updateData.dueDate = dueDate;
    }

    // ============================================
    // UPDATE TASK
    // ============================================

    const updatedTask =
      await Task.findByIdAndUpdate(
        id,
        updateData,
        {
          new: true,
          runValidators: true
        }
      )
        .populate(
          "projectId",
          "projectName status"
        )
        .populate(
          "assignedTo",
          "fullName email employeeId"
        )
        .populate(
          "employeeUpdates.employeeId",
          "fullName email"
        )
        .populate(
          "expenses.addedBy",
          "fullName email"
        );

    return res.status(200).json({
      success: true,
      message: "Task updated successfully",
      task: updatedTask
    });

  } catch (error) {
    console.error(
      "Update Task Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
// ============================================
// 5. DELETE TASK (Admin)
// ============================================
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID"
      });
    }

    const task = await Task.findByIdAndDelete(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully",
      deletedTask: {
        id: task._id,
        taskName: task.taskName
      }
    });

  } catch (error) {
    console.error("Delete Task Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// 6. BULK UPDATE STATUS (Admin)
// ============================================
exports.bulkUpdateStatus = async (req, res) => {
  try {
    const { taskIds, status } = req.body;

    if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "taskIds array is required"
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "status is required"
      });
    }

    // Validate status
    const validStatuses = ["Pending", "In Progress", "Completed", "Rejected", "Overdue"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`
      });
    }

    // Validate all task IDs
    const invalidIds = taskIds.filter(id => !mongoose.Types.ObjectId.isValid(id));
    if (invalidIds.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid task IDs: ${invalidIds.join(", ")}`
      });
    }

    // Update multiple tasks
    const result = await Task.updateMany(
      { _id: { $in: taskIds } },
      { 
        status,
        ...(status === "Completed" && { progress: 100 })
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "No tasks found with the provided IDs"
      });
    }

    return res.status(200).json({
      success: true,
      message: `${result.modifiedCount} tasks updated successfully`,
      data: {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount
      }
    });

  } catch (error) {
    console.error("Bulk Update Status Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// 7. GET DEPARTMENT WISE TASKS (Admin)
// ============================================
exports.getDepartmentTasks = async (req, res) => {
  try {
    const { department } = req.params;
    const { status, priority } = req.query;

    if (!department) {
      return res.status(400).json({
        success: false,
        message: "Department name is required"
      });
    }

    // Build filter
    let filter = { 
      department: department,
      assignType: { $in: ["DEPARTMENT", "ALL"] }
    };

    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const tasks = await Task.find(filter)
      .populate("createdBy", "fullName email")
      .populate("assignedTo", "fullName email")
      .sort({ createdAt: -1 });

    // Department statistics
    const stats = {
      total: tasks.length,
      pending: tasks.filter(t => t.status === "Pending").length,
      inProgress: tasks.filter(t => t.status === "In Progress").length,
      completed: tasks.filter(t => t.status === "Completed").length,
      rejected: tasks.filter(t => t.status === "Rejected").length,
      overdue: tasks.filter(t => t.status === "Overdue").length,
      highPriority: tasks.filter(t => t.priority === "High" || t.priority === "Critical").length,
      averageProgress: tasks.reduce((acc, t) => acc + t.progress, 0) / (tasks.length || 1)
    };

    // Get department employees
    const employees = await Employee.find({
      department: department,
      status: "active"
    }).select("fullName email");

    return res.status(200).json({
      success: true,
      department,
      stats,
      employees: {
        count: employees.length,
        list: employees
      },
      tasks
    });

  } catch (error) {
    console.error("Get Department Tasks Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// 8. GET TASK STATISTICS & REPORTS (Admin)
// ============================================
exports.getTaskStats = async (req, res) => {
  try {
    const { department, startDate, endDate } = req.query;

    // Build filter
    let filter = {};
    
    if (department) {
      filter.department = department;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Get all tasks with filter
    const tasks = await Task.find(filter);

    // Comprehensive statistics
    const stats = {
      // Overview
      overview: {
        total: tasks.length,
        assignedEmployees: await Employee.countDocuments({ status: "active" }),
        departments: [...new Set(tasks.map(t => t.department).filter(Boolean))].length
      },

      // Status breakdown
      statusBreakdown: {
        pending: tasks.filter(t => t.status === "Pending").length,
        inProgress: tasks.filter(t => t.status === "In Progress").length,
        completed: tasks.filter(t => t.status === "Completed").length,
        rejected: tasks.filter(t => t.status === "Rejected").length,
        overdue: tasks.filter(t => t.status === "Overdue").length
      },

      // Priority breakdown
      priorityBreakdown: {
        low: tasks.filter(t => t.priority === "Low").length,
        medium: tasks.filter(t => t.priority === "Medium").length,
        high: tasks.filter(t => t.priority === "High").length,
        critical: tasks.filter(t => t.priority === "Critical").length
      },

      // Assignment type breakdown
      assignmentBreakdown: {
        all: tasks.filter(t => t.assignType === "ALL").length,
        department: tasks.filter(t => t.assignType === "DEPARTMENT").length,
        individual: tasks.filter(t => t.assignType === "INDIVIDUAL").length,
        self: tasks.filter(t => t.assignType === "SELF").length
      },

      // Progress metrics
      progress: {
        average: tasks.reduce((acc, t) => acc + t.progress, 0) / (tasks.length || 1),
        completed: tasks.filter(t => t.progress === 100).length,
        notStarted: tasks.filter(t => t.progress === 0).length
      },

      // Time metrics
      timeMetrics: {
        overdue: tasks.filter(t => {
          return t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "Completed";
        }).length,
        dueToday: tasks.filter(t => {
          const today = new Date();
          return t.dueDate && 
            new Date(t.dueDate).toDateString() === today.toDateString();
        }).length,
        dueThisWeek: tasks.filter(t => {
          const today = new Date();
          const weekLater = new Date(today);
          weekLater.setDate(weekLater.getDate() + 7);
          return t.dueDate && 
            new Date(t.dueDate) >= today &&
            new Date(t.dueDate) <= weekLater;
        }).length
      },

      // Department-wise breakdown (if no department filter)
      ...(!department && {
        departmentBreakdown: await getDepartmentBreakdown()
      }),

      // Date range
      dateRange: {
        startDate: startDate || null,
        endDate: endDate || null,
        totalDays: startDate && endDate ? 
          Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) : null
      }
    };

    return res.status(200).json({
      success: true,
      stats
    });

  } catch (error) {
    console.error("Get Task Stats Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// Helper function for department breakdown
// ============================================
async function getDepartmentBreakdown() {
  const departments = await Task.aggregate([
    {
      $group: {
        _id: "$department",
        total: { $sum: 1 },
        completed: {
          $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] }
        },
        pending: {
          $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] }
        },
        inProgress: {
          $sum: { $cond: [{ $eq: ["$status", "In Progress"] }, 1, 0] }
        },
        avgProgress: { $avg: "$progress" }
      }
    },
    {
      $project: {
        department: "$_id",
        total: 1,
        completed: 1,
        pending: 1,
        inProgress: 1,
        completionRate: {
          $multiply: [
            { $divide: ["$completed", "$total"] },
            100
          ]
        },
        avgProgress: { $round: ["$avgProgress", 2] }
      }
    },
    {
      $sort: { total: -1 }
    }
  ]);

  return departments.filter(d => d.department !== null);
}

// ============================================
// 9. GET OVERDUE TASKS (Admin)
// ============================================
exports.getOverdueTasks = async (req, res) => {
  try {
    const { department, priority } = req.query;
    const currentDate = new Date();

    let filter = {
      dueDate: { $lt: currentDate },
      status: { $ne: "Completed" }
    };

    if (department) filter.department = department;
    if (priority) filter.priority = priority;

    const overdueTasks = await Task.find(filter)
      .populate("createdBy", "fullName email")
      .populate("assignedTo", "fullName email department")
      .sort({ dueDate: 1 }); // Oldest first

    // Calculate days overdue
    const tasksWithDelay = overdueTasks.map(task => {
      const daysOverdue = Math.ceil(
        (currentDate - new Date(task.dueDate)) / (1000 * 60 * 60 * 24)
      );
      return {
        ...task.toObject(),
        daysOverdue
      };
    });

    return res.status(200).json({
      success: true,
      count: tasksWithDelay.length,
      tasks: tasksWithDelay
    });

  } catch (error) {
    console.error("Get Overdue Tasks Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// 10. EXPORT TASK REPORT (Admin)
// ============================================
exports.exportTaskReport = async (req, res) => {
  try {
    const { department, status, startDate, endDate } = req.query;

    // Build filter
    let filter = {};
    if (department) filter.department = department;
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const tasks = await Task.find(filter)
      .populate("createdBy", "fullName email")
      .populate("assignedTo", "fullName email department")
      .sort({ createdAt: -1 });

    // Format data for export
    const reportData = tasks.map(task => ({
      TaskName: task.taskName,
      Title: task.title,
      Description: task.description,
      Priority: task.priority,
      Status: task.status,
      Progress: `${task.progress}%`,
      Department: task.department || "N/A",
      AssignedTo: task.assignedTo.map(e => e.fullName).join(", "),
      CreatedBy: task.createdBy?.fullName || "Unknown",
      CreatedAt: new Date(task.createdAt).toLocaleDateString(),
      DueDate: task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "N/A",
      DaysOverdue: task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "Completed" ?
        Math.ceil((new Date() - new Date(task.dueDate)) / (1000 * 60 * 60 * 24)) : 0
    }));

    return res.status(200).json({
      success: true,
      report: {
        generatedAt: new Date().toISOString(),
        totalTasks: reportData.length,
        filters: { department, status, startDate, endDate },
        data: reportData
      }
    });

  } catch (error) {
    console.error("Export Task Report Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};




// =========================
// Create Project
// =========================
exports.createProject = async (req, res) => {
    try {
        const {
            projectName,
            description,
            department,
            startDate,
            endDate,
            projectManager,
            teamMembers,
            status,
            createdBy,
            createdByType
        } = req.body;

        const project = await Project.create({
            projectName,
            description,
            department,
            startDate,
            endDate,
            projectManager,
            teamMembers,
            status,
            createdBy,
            createdByType
        });

        return res.status(201).json({
            success: true,
            message: "Project created successfully",
            data: project
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// =========================
// Get All Projects
// =========================
exports.getAllProjects = async (req, res) => {
    try {

        const projects = await Project.find()
            .populate("department")
            .populate("projectManager")
            .populate("teamMembers")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: projects.length,
            data: projects
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// =========================
// Get Single Project
// =========================
exports.getProjectById = async (req, res) => {
    try {

        const project = await Project.findById(req.params.id)
            .populate("department")
            .populate("projectManager")
            .populate("teamMembers");

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: project
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// =========================
// Update Project
// =========================
exports.updateProject = async (req, res) => {
    try {

        const project = await Project.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        )
            .populate("department")
            .populate("projectManager")
            .populate("teamMembers");

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Project updated successfully",
            data: project
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// =========================
// Delete Project
// =========================
exports.deleteProject = async (req, res) => {
    try {

        const project = await Project.findByIdAndDelete(req.params.id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Project deleted successfully"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};



// ============================================
// GET MY ASSIGNED TASKS (Employee)
// ============================================
exports.getMyAssignedTasks = async (req, res) => {
  try {
    const { employeeId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid employee ID"
      });
    }

    const tasks = await Task.find({
      assignedTo: employeeId
    })
      .populate(
        "createdBy",
        "fullName email"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: tasks.length,
      tasks
    });

  } catch (error) {
    console.error("Get Assigned Tasks Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};



// ============================================
// UPDATE TASK BY EMPLOYEE
// ============================================
exports.updateTaskByEmployee = async (req, res) => {
  try {
    const { taskId, employeeId } = req.params;

    const {
      updateText,
      progress,
      remark
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid taskId"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid employeeId"
      });
    }

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    // Check employee assigned
    const isAssigned = task.assignedTo.some(
      (id) => id.toString() === employeeId
    );

    if (!isAssigned) {
      return res.status(403).json({
        success: false,
        message: "Employee is not assigned to this task"
      });
    }

    task.employeeUpdates.push({
      employeeId,
      updateText,
      progress: progress || 0,
      remark: remark || "",
      updatedAt: new Date()
    });

    // Update task progress
    if (progress !== undefined) {
      task.progress = progress;

      if (Number(progress) >= 100) {
        task.status = "Completed";
      } else if (Number(progress) > 0) {
        task.status = "In Progress";
      }
    }

    await task.save();

    const updatedTask = await Task.findById(taskId)
      .populate(
        "employeeUpdates.employeeId",
        "fullName email employeeId"
      );

    return res.status(200).json({
      success: true,
      message: "Task updated successfully",
      task: updatedTask
    });

  } catch (error) {
    console.error(
      "Update Task By Employee Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};