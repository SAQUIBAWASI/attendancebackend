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
const TaskNotification = require("../models/TaskNotification");
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

      // Frontend se department name aayega (String)
      department,
      assignedTo,

      priority,
      frequency,
      submitDate,
      remark,
      subtasks = [],
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

    // Parse assignedTo
    if (typeof assignedTo === "string") {
      try {
        assignedTo = JSON.parse(assignedTo);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "assignedTo must be a valid array",
        });
      }
    }

    // Parse frequency (array)
    if (typeof frequency === "string") {
      try {
        frequency = JSON.parse(frequency);
      } catch (error) {
        frequency = ['One Time'];
      }
    }
    if (!frequency || !Array.isArray(frequency) || frequency.length === 0) {
      frequency = ['One Time'];
    }

    // Parse subtasks
    if (typeof subtasks === "string") {
      try {
        subtasks = JSON.parse(subtasks);
      } catch (error) {
        subtasks = [];
      }
    }

    // Parse attachments
    if (typeof attachments === "string") {
      try {
        attachments = JSON.parse(attachments);
      } catch (error) {
        attachments = [];
      }
    }

    // Parse employeeUpdates
    if (typeof employeeUpdates === "string") {
      try {
        employeeUpdates = JSON.parse(employeeUpdates);
      } catch (error) {
        employeeUpdates = [];
      }
    }

    // Parse expenses
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

    if (!taskName || !title || !description) {
      return res.status(400).json({
        success: false,
        message: "taskName, title and description are required",
      });
    }

    if (!department) {
      return res.status(400).json({
        success: false,
        message: "department is required",
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

    // If assignedTo is provided, use those employees
    if (assignedTo && assignedTo.length > 0) {
      // Validate employees exist and are active
      const validEmployees = await Employee.find({
        _id: { $in: assignedTo },
        status: "active",
        department: department, // String se compare
      }).select("_id");

      if (validEmployees.length !== assignedTo.length) {
        return res.status(400).json({
          success: false,
          message: "Some employee ids are invalid, inactive, or not in the selected department",
        });
      }
      employeeIds = assignedTo;
    } else {
      // If no employees selected, get all active from department
      const employees = await Employee.find({
        department: department, // String se compare
        status: "active",
      }).select("_id");

      if (employees.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No active employees found in selected department",
        });
      }
      employeeIds = employees.map((emp) => emp._id);
    }

    // ============================================
    // PROCESS SUBTASKS
    // ============================================

    const processedSubtasks = subtasks.map(subtask => ({
      name: subtask.name || '',
      description: subtask.description || '',
      status: subtask.status || 'Pending',
      priority: subtask.priority || 'Medium',
      submitDate: subtask.submitDate ? new Date(subtask.submitDate) : null,
      submittedDate: subtask.status === 'Completed' ? new Date() : null,
      _id: subtask._id || new mongoose.Types.ObjectId().toString()
    }));

    // ============================================
    // CREATE TASK
    // ============================================

    const taskData = {
      taskName,
      title,
      description,
      projectId: projectId || null,
      createdBy,
      createdByType,
      assignType: "DEPARTMENT",
      assignedTo: employeeIds,
      department: department, // String
      priority: priority || "Medium",
      frequency: frequency,
      submitDate: submitDate ? new Date(submitDate) : null,
      voiceNote,
      remark,
      subtasks: processedSubtasks,
      attachments,
      employeeUpdates,
      expenses,
      progress: 0,
      status: "Pending"
    };

    // Calculate initial progress from subtasks
    if (processedSubtasks.length > 0) {
      const completed = processedSubtasks.filter(s => s.status === 'Completed').length;
      taskData.progress = Math.round((completed / processedSubtasks.length) * 100);
    }

    const task = await Task.create(taskData);

    // ============================================
    // SEND NOTIFICATIONS TO ASSIGNED EMPLOYEES
    // ============================================
    
    if (employeeIds.length > 0) {
      const sender = await Employee.findById(createdBy).select("name");
      const senderName = sender ? sender.name : 'Admin';
      
      const submitDateStr = submitDate ? ` by ${new Date(submitDate).toLocaleDateString()}` : '';
      const priorityStr = priority ? ` (${priority} priority)` : '';
      const freqStr = frequency && frequency.length > 0 ? ` (${frequency.join(', ')})` : '';
      
      const notifications = employeeIds.map((empId) => ({
        recipient: empId,
        sender: createdBy,
        type: 'task_assigned',
        message: `📋 New task assigned: "${taskName}"${priorityStr}${freqStr}. Please complete it${submitDateStr}.`,
        taskId: task._id,
        isRead: false,
        createdAt: new Date()
      }));

      if (notifications.length > 0) {
        await TaskNotification.insertMany(notifications);
        console.log(`✅ ${notifications.length} notifications sent for task: ${taskName}`);
      }
    }

    // ============================================
    // POPULATE DATA
    // ============================================

    const populatedTask = await Task.findById(task._id)
      .populate("projectId", "projectName status")
      .populate("assignedTo", "fullName email employeeId")
      .populate("employeeUpdates.employeeId", "fullName email")
      .populate("expenses.addedBy", "fullName email");

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
      .populate("createdBy", "name email phone employeeId")
      .populate("assignedTo", "name email department profileImage employeeId")
      .populate("employeeUpdates.employeeId", "name email employeeId phone")  // ✅ FIX: employeeUpdates populate
      .populate("expenses.addedBy", "name email employeeId")  // ✅ FIX: expenses.addedBy populate
      .populate("reportedIssues.employeeId", "name email employeeId")  // ✅ FIX: reportedIssues populate
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
// UPDATE TASK
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
      submitDate,
      remark,
      subtasks,
      attachments,
      employeeUpdates,
      expenses,
      status,
      progress
    } = req.body;

    // Check if task exists
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Parse frequency
    if (typeof frequency === "string") {
      try {
        frequency = JSON.parse(frequency);
      } catch (error) {
        frequency = ['One Time'];
      }
    }

    // Parse subtasks
    if (typeof subtasks === "string") {
      try {
        subtasks = JSON.parse(subtasks);
      } catch (error) {
        subtasks = [];
      }
    }

    // Parse assignedTo
    if (assignType === "INDIVIDUAL" && typeof assignedTo === "string") {
      try {
        assignedTo = JSON.parse(assignedTo);
      } catch (error) {
        assignedTo = [];
      }
    }

    // Parse attachments
    if (typeof attachments === "string") {
      try {
        attachments = JSON.parse(attachments);
      } catch (error) {
        attachments = [];
      }
    }

    // Parse employeeUpdates
    if (typeof employeeUpdates === "string") {
      try {
        employeeUpdates = JSON.parse(employeeUpdates);
      } catch (error) {
        employeeUpdates = [];
      }
    }

    // Parse expenses
    if (typeof expenses === "string") {
      try {
        expenses = JSON.parse(expenses);
      } catch (error) {
        expenses = [];
      }
    }

    // Process subtasks - auto-set submittedDate when status changes to Completed
    const processedSubtasks = subtasks.map(subtask => {
      const processed = { ...subtask };
      
      // If status is Completed and no submittedDate, set it
      if (processed.status === 'Completed' && !processed.submittedDate) {
        processed.submittedDate = new Date();
      }
      
      // If status changes from Completed to something else, keep submittedDate
      return processed;
    });

    // Prepare update data
    const updateData = {
      taskName: taskName || task.taskName,
      title: title || task.title,
      description: description || task.description,
      projectId: projectId || task.projectId,
      assignType: assignType || task.assignType,
      assignedTo: assignedTo || task.assignedTo,
      department: department || task.department,
      priority: priority || task.priority,
      frequency: frequency || task.frequency,
      submitDate: submitDate ? new Date(submitDate) : task.submitDate,
      remark: remark !== undefined ? remark : task.remark,
      subtasks: processedSubtasks || task.subtasks,
      attachments: attachments || task.attachments,
      employeeUpdates: employeeUpdates || task.employeeUpdates,
      expenses: expenses || task.expenses,
      status: status || task.status,
      updatedAt: new Date()
    };

    // Calculate progress from subtasks
    if (processedSubtasks && processedSubtasks.length > 0) {
      const completed = processedSubtasks.filter(s => s.status === 'Completed').length;
      updateData.progress = Math.round((completed / processedSubtasks.length) * 100);
    } else if (progress !== undefined) {
      updateData.progress = progress;
    }

    // Check if overdue
    if (updateData.status !== 'Completed' && updateData.status !== 'Rejected' && updateData.submitDate) {
      const now = new Date();
      const submitDateObj = new Date(updateData.submitDate);
      if (now > submitDateObj) {
        updateData.status = 'Overdue';
      }
    }

    // Update task
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate("projectId", "projectName status")
    .populate("assignedTo", "fullName email employeeId")
    .populate("employeeUpdates.employeeId", "fullName email")
    .populate("expenses.addedBy", "fullName email");

    return res.status(200).json({
      success: true,
      message: "Task updated successfully",
      task: updatedTask,
    });

  } catch (error) {
    console.error("Update Task Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
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

    console.log("========================================");
    console.log("📌 GET MY ASSIGNED TASKS STARTED");
    console.log(`📌 Employee ID: ${employeeId}`);
    console.log("========================================");

    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      console.log("❌ Invalid employee ID");
      return res.status(400).json({
        success: false,
        message: "Invalid employee ID"
      });
    }

    const tasks = await Task.find({
      assignedTo: employeeId
    })
      .populate("createdBy", "name email employeeId phone")
      .populate("assignedTo", "name email employeeId phone")
      .populate("employeeUpdates.employeeId", "name email employeeId phone")
      .populate("expenses.addedBy", "name email employeeId phone")
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${tasks.length} tasks for employee`);
    console.log("========================================");

    return res.status(200).json({
      success: true,
      count: tasks.length,
      tasks
    });

  } catch (error) {
    console.error("❌ Get Assigned Tasks Error:", error);
    console.error(error.stack);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};



// ============================================
// UPDATE TASK BY EMPLOYEE (FIXED - FINAL)
// ============================================
exports.updateTaskByEmployee = async (req, res) => {
  try {
    console.log("========================================");
    console.log("📌 UPDATE TASK BY EMPLOYEE STARTED");
    console.log("========================================");
    
    const { taskId, employeeId } = req.params;
    console.log(`📌 Task ID: ${taskId}`);
    console.log(`📌 Employee ID: ${employeeId}`);

    let {
      updateText,
      progress,
      remark,
      expenses = [],
      subtasks = [],
      status
    } = req.body;

    console.log("📌 Request Body:");
    console.log(`   - updateText: ${updateText}`);
    console.log(`   - progress: ${progress}`);
    console.log(`   - remark: ${remark}`);
    console.log(`   - status: ${status}`);
    console.log(`   - expenses: ${JSON.stringify(expenses)}`);
    console.log(`   - subtasks: ${JSON.stringify(subtasks)}`);

    // ============================================
    // VALIDATION
    // ============================================

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      console.log("❌ Invalid taskId");
      return res.status(400).json({
        success: false,
        message: "Invalid taskId"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      console.log("❌ Invalid employeeId");
      return res.status(400).json({
        success: false,
        message: "Invalid employeeId"
      });
    }

    const task = await Task.findById(taskId);

    if (!task) {
      console.log("❌ Task not found");
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    console.log("✅ Task found:", task.taskName);
    console.log(`   - Current Status: ${task.status}`);
    console.log(`   - Current Progress: ${task.progress}`);
    console.log(`   - Assigned To: ${task.assignedTo.length} employees`);

    // ============================================
    // CHECK ASSIGNED EMPLOYEE
    // ============================================

    const isAssigned = task.assignedTo.some(
      (id) => id.toString() === employeeId
    );

    if (!isAssigned) {
      console.log("❌ Employee not assigned to this task");
      return res.status(403).json({
        success: false,
        message: "Employee is not assigned to this task"
      });
    }

    console.log("✅ Employee is assigned to this task");

    // ============================================
    // PARSE EXPENSES
    // ============================================

    if (typeof expenses === "string") {
      try {
        expenses = JSON.parse(expenses);
        console.log("📌 Expenses parsed from string");
      } catch (error) {
        expenses = [];
        console.log("⚠️ Expenses parse failed, using empty array");
      }
    }

    // ============================================
    // PARSE SUBTASKS
    // ============================================

    if (typeof subtasks === "string") {
      try {
        subtasks = JSON.parse(subtasks);
        console.log("📌 Subtasks parsed from string");
      } catch (error) {
        subtasks = [];
        console.log("⚠️ Subtasks parse failed, using empty array");
      }
    }

    // ============================================
    // PROCESS SUBTASKS - Employee-wise tracking
    // ============================================

    if (Array.isArray(subtasks) && subtasks.length > 0) {
      console.log("📌 Processing Subtasks...");
      console.log(`   - Total subtasks: ${subtasks.length}`);
      
      // ─── ✅ FIX: employeeSubtaskProgress ko PRESERVE karo ───
      if (!task.employeeSubtaskProgress) {
        task.employeeSubtaskProgress = {};
        console.log("📌 Created new employeeSubtaskProgress (first time)");
      } else {
        console.log("📌 Existing employeeSubtaskProgress FOUND, preserving...");
        console.log(`   - Current entries: ${JSON.stringify(Object.keys(task.employeeSubtaskProgress))}`);
      }

      // ─── Get all assigned employees ───
      const assignedEmployeeIds = task.assignedTo.map(id => id.toString());
      console.log(`📌 Assigned Employee IDs: ${JSON.stringify(assignedEmployeeIds)}`);

      // ─── ✅ FIX: Initialize ONLY if not exists (preserve existing data!) ───
      assignedEmployeeIds.forEach(empId => {
        if (!task.employeeSubtaskProgress[empId]) {
          task.employeeSubtaskProgress[empId] = {
            subtaskStatus: {},
            progress: 0
          };
          console.log(`📌 Initialized NEW progress for employee: ${empId}`);
        } else {
          const empProgress = task.employeeSubtaskProgress[empId];
          console.log(`📌 PRESERVED existing progress for employee: ${empId}`);
          console.log(`   - Current progress: ${empProgress.progress}%`);
          console.log(`   - Subtasks: ${Object.keys(empProgress.subtaskStatus).length}`);
        }
      });

      // ─── ✅ CRITICAL FIX: employeeId ko String mein convert karo ───
      const currentEmployeeId = employeeId.toString();
      console.log(`📌 Current Employee ID (from params): ${currentEmployeeId}`);

      // ─── Update subtask status for this employee ───
      subtasks.forEach(updatedSubtask => {
        const subtaskId = updatedSubtask._id;
        const subtaskStatus = updatedSubtask.status || 'Pending';
        
        console.log(`📌 Updating subtask ${subtaskId} -> ${subtaskStatus}`);
        
        // ✅ CRITICAL: Ensure employee entry exists for current employee
        if (!task.employeeSubtaskProgress[currentEmployeeId]) {
          task.employeeSubtaskProgress[currentEmployeeId] = {
            subtaskStatus: {},
            progress: 0
          };
          console.log(`📌 Created NEW entry for employee: ${currentEmployeeId}`);
        }
        
        // ✅ Update this employee's status
        task.employeeSubtaskProgress[currentEmployeeId].subtaskStatus[subtaskId] = {
          status: subtaskStatus,
          updatedAt: new Date()
        };
        
        console.log(`   - Employee ${currentEmployeeId} marked subtask as ${subtaskStatus}`);
        console.log(`   - Updated data:`, JSON.stringify(task.employeeSubtaskProgress[currentEmployeeId]));

        // ─── Update main subtask status ───
        const existingSubtask = task.subtasks.find(
          (s) => s._id.toString() === subtaskId
        );

        if (existingSubtask) {
          console.log(`   - Found existing subtask: ${existingSubtask.name}`);
          
          // ─── Check status for ALL employees ───
          let allCompleted = true;
          let anyCompleted = false;
          let allHaveStatus = true;
          
          assignedEmployeeIds.forEach(empId => {
            const empProgress = task.employeeSubtaskProgress[empId];
            const status = empProgress?.subtaskStatus[subtaskId]?.status;
            
            console.log(`      Employee ${empId}: status = ${status || 'undefined'}`);
            
            if (!status) {
              allHaveStatus = false;
            } else if (status === 'Completed') {
              anyCompleted = true;
            } else {
              allCompleted = false;
            }
          });

          // ─── Update subtask status ───
          if (allCompleted && assignedEmployeeIds.length > 0 && allHaveStatus) {
            if (existingSubtask.status !== 'Completed') {
              existingSubtask.status = 'Completed';
              existingSubtask.submittedDate = new Date().toISOString();
              console.log(`   ✅ ALL employees completed! Subtask marked as Completed`);
            }
          } else if (anyCompleted) {
            if (existingSubtask.status !== 'Completed') {
              existingSubtask.status = 'In Progress';
              console.log(`   ⏳ Some employees completed. Subtask marked as In Progress`);
            }
          } else {
            if (existingSubtask.status !== 'Completed') {
              existingSubtask.status = 'Pending';
              console.log(`   ⏸️ No one completed. Subtask marked as Pending`);
            }
          }
        }
      });

      // ─── Calculate each employee's progress ───
      console.log("📌 Calculating each employee's progress...");
      
      assignedEmployeeIds.forEach(empId => {
        const empProgress = task.employeeSubtaskProgress[empId];
        if (empProgress) {
          const subtaskKeys = Object.keys(empProgress.subtaskStatus);
          if (subtaskKeys.length > 0) {
            const completed = subtaskKeys.filter(
              key => empProgress.subtaskStatus[key].status === 'Completed'
            ).length;
            empProgress.progress = Math.round((completed / subtaskKeys.length) * 100);
            console.log(`   - Employee ${empId}: ${empProgress.progress}% (${completed}/${subtaskKeys.length} completed)`);
          } else {
            empProgress.progress = 0;
            console.log(`   - Employee ${empId}: 0% (no subtasks)`);
          }
        }
      });

      // ─── Calculate overall progress ───
      let totalEmployeeProgress = 0;
      let completedEmployees = 0;

      assignedEmployeeIds.forEach(empId => {
        const empProgress = task.employeeSubtaskProgress[empId];
        if (empProgress) {
          totalEmployeeProgress += empProgress.progress;
          if (empProgress.progress >= 100) {
            completedEmployees++;
          }
        }
      });

      let averageProgress = 0;
      if (assignedEmployeeIds.length > 0) {
        averageProgress = Math.round(totalEmployeeProgress / assignedEmployeeIds.length);
      }
      
      const allCompleted = completedEmployees === assignedEmployeeIds.length && assignedEmployeeIds.length > 0;

      console.log(`📌 Overall Progress Calculation:`);
      console.log(`   - Total Progress Sum: ${totalEmployeeProgress}`);
      console.log(`   - Total Employees: ${assignedEmployeeIds.length}`);
      console.log(`   - Average Progress: ${averageProgress}%`);
      console.log(`   - Completed Employees: ${completedEmployees}`);
      console.log(`   - All Completed: ${allCompleted}`);

      task.progress = averageProgress;

      if (allCompleted) {
        task.status = "Completed";
        task.progress = 100;
        console.log(`✅ Task status set to: Completed (from subtasks)`);
      } else if (averageProgress > 0) {
        task.status = "In Progress";
        console.log(`✅ Task status set to: In Progress (from subtasks)`);
      } else {
        task.status = "Pending";
        console.log(`✅ Task status set to: Pending (from subtasks)`);
      }
    } else {
      console.log("📌 No subtasks to process");
      
      // ─── ✅ FIX: For tasks WITHOUT subtasks, use status from frontend ───
      if (status) {
        console.log(`📌 Setting status from frontend: ${status}`);
        task.status = status;
        
        // If status is "Completed", set progress to 100%
        if (status === 'Completed') {
          task.progress = 100;
          console.log(`📌 Progress set to 100% because status is Completed`);
        } else if (progress !== undefined && progress !== null) {
          // If progress is sent from frontend, use it
          task.progress = Number(progress);
          console.log(`📌 Progress set from frontend: ${task.progress}`);
        }
      } else if (progress !== undefined && progress !== null) {
        // If only progress is sent (no status), update progress
        task.progress = Number(progress);
        console.log(`📌 Progress set from frontend: ${task.progress}`);
        
        // Update status based on progress
        if (task.progress >= 100) {
          task.status = "Completed";
          console.log(`📌 Status set to Completed because progress is 100%`);
        } else if (task.progress > 0) {
          task.status = "In Progress";
          console.log(`📌 Status set to In Progress because progress > 0`);
        } else {
          task.status = "Pending";
          console.log(`📌 Status set to Pending because progress is 0`);
        }
      }
    }

    // ============================================
    // ATTACHMENTS UPLOAD
    // ============================================

    let uploadedAttachments = [];

    if (req.files && req.files.length > 0) {
      uploadedAttachments = req.files.map((file) => ({
        fileName: file.originalname,
        fileUrl: file.path.replace(/\\/g, "/"),
      }));
      console.log(`📌 Uploaded ${uploadedAttachments.length} attachments`);
    }

    // ============================================
    // EMPLOYEE UPDATE ENTRY
    // ============================================

    task.employeeUpdates.push({
      employeeId,
      updateText: updateText || "",
      progress: task.progress || 0,
      remark: remark || "",
      attachments: uploadedAttachments,
      updatedAt: new Date(),
    });
    
    console.log(`📌 Added employee update entry for ${employeeId}`);

    // ============================================
    // ADD EXPENSES
    // ============================================

    if (Array.isArray(expenses) && expenses.length > 0) {
      expenses.forEach((expense) => {
        task.expenses.push({
          location: {
            address: expense.location?.address || "",
            latitude: expense.location?.latitude || 0,
            longitude: expense.location?.longitude || 0,
          },
          distance: Number(expense.distance) || 0,
          expenseAmount: Number(expense.expenseAmount) || 0,
          description: expense.description || "",
          receiptImage: expense.receiptImage || null,
          expenseDate: expense.expenseDate || new Date(),
          addedBy: employeeId,
          approvalStatus: "Pending",
        });
      });
      console.log(`📌 Added ${expenses.length} expenses`);
    }

    // ============================================
    // CHECK FOR OVERDUE
    // ============================================

    if (task.submitDate && task.status !== 'Completed' && task.status !== 'Rejected') {
      const now = new Date();
      const submitDate = new Date(task.submitDate);
      if (now > submitDate) {
        task.status = 'Overdue';
        console.log(`⚠️ Task marked as Overdue`);
      }
    }

    // ─── ✅ CRITICAL FIX: Mark employeeSubtaskProgress as modified ───
    if (task.employeeSubtaskProgress) {
      task.markModified('employeeSubtaskProgress');
      console.log("📌 Marked employeeSubtaskProgress as modified");
    }

    console.log("📌 Saving task with data:");
    console.log(`   - Status: ${task.status}`);
    console.log(`   - Progress: ${task.progress}`);
    console.log(`   - employeeSubtaskProgress: ${JSON.stringify(task.employeeSubtaskProgress, null, 2)}`);
    
    await task.save();
    console.log(`✅ Task saved successfully`);

    // ============================================
    // POPULATE UPDATED TASK
    // ============================================

    const updatedTask = await Task.findById(taskId)
      .populate("assignedTo", "name email employeeId phone")
      .populate("createdBy", "name email employeeId phone")
      .populate("employeeUpdates.employeeId", "name email employeeId phone")
      .populate("expenses.addedBy", "name email employeeId phone");

    console.log("========================================");
    console.log(`✅ FINAL RESULT:`);
    console.log(`   - Status: ${updatedTask.status}`);
    console.log(`   - Progress: ${updatedTask.progress}%`);
    console.log(`   - Subtasks: ${updatedTask.subtasks?.length || 0}`);
    console.log(`   - Employee Progress Data: ${JSON.stringify(updatedTask.employeeSubtaskProgress, null, 2)}`);
    console.log("========================================");

    return res.status(200).json({
      success: true,
      message: "Task updated successfully",
      task: updatedTask,
    });

  } catch (error) {
    console.error("❌ Update Task By Employee Error:", error);
    console.error(error.stack);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// ─── Helper function to format date time ───
function formatDateTime(date) {
  return new Date(date).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}



// ============================================
// GET MY CREATED TASKS (EMPLOYEE)
// ============================================
exports.getMyCreatedTasks = async (req, res) => {
  try {
    const { employeeId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid employeeId",
      });
    }

    const tasks = await Task.find({
      createdBy: employeeId,
      createdByType: "employee",
    })
      .populate(
        "assignedTo",
        "fullName email employeeId"
      )
      .populate(
        "department",
        "departmentName"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });

  } catch (error) {
    console.error(
      "Get My Created Tasks Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};




// ============================================
// GET MY TODAY'S TASKS (Employee)
// ============================================
exports.getMyTodayTasks = async (req, res) => {
  try {
    const { employeeId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid employee ID"
      });
    }

    // ─── Today's date range ───
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // ─── Get all tasks for this employee ───
    const tasks = await Task.find({
      $or: [
        // Tasks assigned to this employee
        { assignedTo: employeeId },
        // Tasks created by this employee
        { 
          createdBy: employeeId,
          createdByType: "employee"
        }
      ]
    })
      .populate("createdBy", "fullName email employeeId")
      .populate("assignedTo", "fullName email employeeId")
      .populate("projectId", "projectName status")
      .populate("department", "departmentName")
      .populate("employeeUpdates.employeeId", "fullName email")
      .populate("expenses.addedBy", "fullName email")
      .sort({ createdAt: -1 });

    // ─── Filter: Today's tasks OR Daily frequency active tasks ───
    const todayTasks = tasks.filter(task => {
      const createdAt = new Date(task.createdAt);
      const isToday = createdAt >= todayStart && createdAt <= todayEnd;
      
      // Task is today's task if:
      // 1. Created today, OR
      // 2. Has Daily frequency and is active (Pending/In Progress)
      const isDailyActive = task.frequency && 
                           task.frequency.includes('Daily') && 
                           ['Pending', 'In Progress'].includes(task.status);
      
      return isToday || isDailyActive;
    });

    // ─── Calculate stats ───
    const stats = {
      total: todayTasks.length,
      pending: todayTasks.filter(t => t.status === 'Pending').length,
      inProgress: todayTasks.filter(t => t.status === 'In Progress').length,
      completed: todayTasks.filter(t => t.status === 'Completed').length,
      overdue: todayTasks.filter(t => t.status === 'Overdue').length,
      rejected: todayTasks.filter(t => t.status === 'Rejected').length,
      highPriority: todayTasks.filter(t => t.priority === 'Critical' || t.priority === 'High').length,
      mediumPriority: todayTasks.filter(t => t.priority === 'Medium').length,
      lowPriority: todayTasks.filter(t => t.priority === 'Low').length,
      assignedToMe: todayTasks.filter(t => 
        t.assignedTo && t.assignedTo.some(emp => emp._id.toString() === employeeId)
      ).length,
      createdByMe: todayTasks.filter(t => 
        t.createdBy && t.createdBy._id.toString() === employeeId
      ).length,
      dailyTasks: todayTasks.filter(t => 
        t.frequency && t.frequency.includes('Daily')
      ).length,
      withSubtasks: todayTasks.filter(t => t.subtasks && t.subtasks.length > 0).length,
      withAttachments: todayTasks.filter(t => t.attachments && t.attachments.length > 0).length,
    };

    return res.status(200).json({
      success: true,
      date: todayStart.toISOString(),
      dateFormatted: todayStart.toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      stats,
      tasks: todayTasks
    });

  } catch (error) {
    console.error("Get My Today Tasks Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};



// ============================================
// REPORT TASK ISSUE
// ============================================
exports.reportTaskIssue = async (req, res) => {
  try {
    const { taskId, employeeId } = req.params;

    const {
      issueTitle,
      issueDescription,
      priority,
    } = req.body;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    const isAssigned = task.assignedTo.some(
      (id) => id.toString() === employeeId
    );

    if (!isAssigned) {
      return res.status(403).json({
        success: false,
        message:
          "You are not assigned to this task",
      });
    }

    task.reportedIssues.push({
      employeeId,
      issueTitle,
      issueDescription,
      priority: priority || "Medium",
    });

    await task.save();

    return res.status(200).json({
      success: true,
      message: "Issue reported successfully",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// ============================================
// GET ALL REPORTED ISSUES
// ============================================
exports.getAllReportedIssues = async (req, res) => {
  try {
    const tasks = await Task.find({
      reportedIssues: {
        $exists: true,
        $ne: [],
      },
    })
      .populate(
        "reportedIssues.employeeId",
        "fullName email employeeId"
      )
      .sort({ createdAt: -1 });

    const reportedIssues = [];

    tasks.forEach((task) => {
      task.reportedIssues.forEach((issue) => {
        reportedIssues.push({
          taskId: task._id,
          taskName: task.taskName,
          title: task.title,
          priority: task.priority,
          taskStatus: task.status,
          dueDate: task.dueDate,

          issue: {
            issueId: issue._id,
            employee: issue.employeeId,
            issueTitle: issue.issueTitle,
            issueDescription: issue.issueDescription,
            priority: issue.priority,
            status: issue.status,
            reportedAt: issue.reportedAt,
          },
        });
      });
    });

    return res.status(200).json({
      success: true,
      count: reportedIssues.length,
      issues: reportedIssues,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ============================================
// GET MY REPORTED ISSUES
// ============================================
exports.getMyReportedIssues = async (req, res) => {
  try {
    const { employeeId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid employeeId",
      });
    }

    const tasks = await Task.find({
      "reportedIssues.employeeId": employeeId,
    })
      .populate(
        "reportedIssues.employeeId",
        "fullName email employeeId"
      )
      .sort({ createdAt: -1 });

    const issues = [];

    tasks.forEach((task) => {
      task.reportedIssues.forEach((issue) => {
        if (
          issue.employeeId &&
          issue.employeeId._id.toString() === employeeId
        ) {
          issues.push({
            taskId: task._id,
            taskName: task.taskName,
            title: task.title,
            taskPriority: task.priority,
            taskStatus: task.status,
            dueDate: task.dueDate,

            issueId: issue._id,
            issueTitle: issue.issueTitle,
            issueDescription: issue.issueDescription,
            issuePriority: issue.priority,
            issueStatus: issue.status,
            reportedAt: issue.reportedAt,
          });
        }
      });
    });

    return res.status(200).json({
      success: true,
      count: issues.length,
      issues,
    });

  } catch (error) {
    console.error(
      "Get My Reported Issues Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// ============================================
// UPDATE REPORTED ISSUE
// ============================================
exports.updateReportedIssue = async (req, res) => {
  try {
    const { taskId, issueId } = req.params;
    const { status, priority } = req.body;

    // Find the task
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Find the issue in the task's reportedIssues array
    const issueIndex = task.reportedIssues.findIndex(
      (issue) => issue._id.toString() === issueId
    );

    if (issueIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found in this task',
      });
    }

    // Update the issue
    if (status) {
      task.reportedIssues[issueIndex].status = status;
    }
    if (priority) {
      task.reportedIssues[issueIndex].priority = priority;
    }

    // IMPORTANT: Set validateModifiedOnly to true to skip validation for unchanged fields
    // This prevents the department field validation error
    await task.save({ validateModifiedOnly: true });

    // Return the updated issue
    const updatedIssue = task.reportedIssues[issueIndex];

    return res.status(200).json({
      success: true,
      message: 'Issue updated successfully',
      issue: {
        issueId: updatedIssue._id,
        issueTitle: updatedIssue.issueTitle,
        issueDescription: updatedIssue.issueDescription,
        priority: updatedIssue.priority,
        status: updatedIssue.status,
        reportedAt: updatedIssue.reportedAt,
      },
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================
// DELETE REPORTED ISSUE
// ============================================
exports.deleteReportedIssue = async (req, res) => {
  try {
    const { taskId, issueId } = req.params;

    // Find the task
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Find the issue in the task's reportedIssues array
    const issueIndex = task.reportedIssues.findIndex(
      (issue) => issue._id.toString() === issueId
    );

    if (issueIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found in this task',
      });
    }

    // Remove the issue from the array
    task.reportedIssues.splice(issueIndex, 1);

    // Save the task with validateModifiedOnly to skip validation for unchanged fields
    await task.save({ validateModifiedOnly: true });

    return res.status(200).json({
      success: true,
      message: 'Issue deleted successfully',
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ============================================
// ADMIN DASHBOARD
// ============================================
exports.getAdminDashboard = async (req, res) => {
  try {
    // Get total employees
    const totalEmployees = await Employee.countDocuments({ status: 'active' });

    // Get total tasks
    const totalTasks = await Task.countDocuments();

    // Get pending tasks
    const pendingTasks = await Task.countDocuments({
      status: "Pending",
    });

    // Get in progress tasks
    const inProgressTasks = await Task.countDocuments({
      status: "In Progress",
    });

    // Get completed tasks
    const completedTasks = await Task.countDocuments({
      status: "Completed",
    });

    // Get overdue tasks
    const overdueTasks = await Task.countDocuments({
      status: "Overdue",
    });

    // Calculate completion rate
    const completionRate = totalTasks > 0 
      ? Math.round((completedTasks / totalTasks) * 100) 
      : 0;

    // Get total reported issues
    const totalIssues = await Task.aggregate([
      {
        $project: {
          issueCount: {
            $size: {
              $ifNull: ["$reportedIssues", []]
            }
          }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$issueCount" }
        }
      }
    ]);

    // Get total expenses
    const totalExpenses = await Task.aggregate([
      { $unwind: "$expenses" },
      {
        $group: {
          _id: null,
          totalAmount: {
            $sum: "$expenses.expenseAmount"
          }
        }
      }
    ]);

    // ─── FIXED: Populate assignedTo with employee details ───
    const recentActivities = await Task.find()
      .sort({ updatedAt: -1 })
      .limit(5)
      .populate({
        path: 'assignedTo',
        select: 'name email employeeId department profileImage'
      })
      .populate({
        path: 'createdBy',
        select: 'name email employeeId'
      })
      .lean();

    // Format recent activities with proper user names
    const formattedActivities = recentActivities.map(task => {
      // Get user from assignedTo or createdBy
      let userName = 'Unknown';
      let userAvatar = 'U';
      
      // Check if assignedTo has employees
      if (task.assignedTo && task.assignedTo.length > 0) {
        const firstAssigned = task.assignedTo[0];
        if (firstAssigned && firstAssigned.name) {
          userName = firstAssigned.name;
          userAvatar = userName.charAt(0).toUpperCase();
        }
      } 
      // If no assignedTo, check createdBy
      else if (task.createdBy && task.createdBy.name) {
        userName = task.createdBy.name;
        userAvatar = userName.charAt(0).toUpperCase();
      }
      
      let action = 'updated task';
      if (task.status === 'Completed') action = 'completed task';
      else if (task.status === 'Pending') action = 'created task';
      else if (task.status === 'In Progress') action = 'started task';
      
      return {
        user: userName,
        action: action,
        task: task.taskName || task.title || 'Task',
        time: formatTimeAgo(task.updatedAt),
        avatar: userAvatar
      };
    });

    // Get task distribution for chart
    const taskDistribution = [
      { label: 'Completed', value: completedTasks, bg: 'bg-emerald-500' },
      { label: 'In Progress', value: inProgressTasks, bg: 'bg-blue-500' },
      { label: 'Pending', value: pendingTasks, bg: 'bg-amber-500' },
      { label: 'Overdue', value: overdueTasks, bg: 'bg-rose-500' },
    ];

    // Get weekly trend (last 7 days)
    const weeklyTrend = await getWeeklyTaskTrend();

    return res.status(200).json({
      success: true,
      dashboard: {
        totalEmployees,
        totalTasks,
        pendingTasks,
        inProgressTasks,
        completedTasks,
        overdueTasks,
        completionRate,
        totalReportedIssues: totalIssues[0]?.total || 0,
        totalExpenses: totalExpenses[0]?.totalAmount || 0,
        recentActivities: formattedActivities,
        taskDistribution,
        weeklyTrend
      },
    });

  } catch (error) {
    console.error('Dashboard Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Helper function to format time ago
function formatTimeAgo(date) {
  const now = new Date();
  const diff = Math.floor((now - new Date(date)) / 1000); // seconds

  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hour${Math.floor(diff / 3600) > 1 ? 's' : ''} ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} day${Math.floor(diff / 86400) > 1 ? 's' : ''} ago`;
  return `${Math.floor(diff / 604800)} week${Math.floor(diff / 604800) > 1 ? 's' : ''} ago`;
}

// Helper function to get weekly task trend
async function getWeeklyTaskTrend() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - 6);
  weekStart.setHours(0, 0, 0, 0);

  const weeklyData = await Task.aggregate([
    {
      $match: {
        createdAt: { $gte: weekStart }
      }
    },
    {
      $group: {
        _id: {
          $dayOfWeek: '$createdAt'
        },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { '_id': 1 }
    }
  ]);

  // Map day numbers to names (MongoDB dayOfWeek: 1=Sunday, 2=Monday, ..., 7=Saturday)
  const dayMap = {
    1: 'Sun',
    2: 'Mon',
    3: 'Tue',
    4: 'Wed',
    5: 'Thu',
    6: 'Fri',
    7: 'Sat'
  };

  const trend = days.map(day => {
    // Find matching day in weeklyData
    const dayIndex = Object.keys(dayMap).find(key => dayMap[key] === day);
    const data = weeklyData.find(d => d._id === parseInt(dayIndex));
    return { day, tasks: data ? data.count : 0 };
  });

  return trend;
}



// ============================================
// EMPLOYEE DASHBOARD
// ============================================
exports.getEmployeeDashboard = async (req, res) => {
  try {
    const { employeeId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid employeeId",
      });
    }

    // ── Get all tasks assigned to this employee ──
    const allTasks = await Task.find({
      assignedTo: employeeId,
    })
    .populate('projectId', 'projectName')
    .sort({ dueDate: 1 });

    // ── Stats ──
    const totalAssignedTasks = allTasks.length;
    
    const pendingTasks = allTasks.filter(t => t.status === 'Pending').length;
    const inProgressTasks = allTasks.filter(t => t.status === 'In Progress').length;
    const completedTasks = allTasks.filter(t => t.status === 'Completed').length;
    const overdueTasks = allTasks.filter(t => t.status === 'Overdue').length;
    const rejectedTasks = allTasks.filter(t => t.status === 'Rejected').length;

    // ── Completion Rate ──
    const completionRate = totalAssignedTasks > 0 
      ? Math.round((completedTasks / totalAssignedTasks) * 100) 
      : 0;

    // ── Upcoming Deadlines (not completed, sorted by due date) ──
    const upcomingTasks = allTasks
      .filter(t => t.dueDate && t.status !== 'Completed' && t.status !== 'Rejected')
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5)
      .map(t => ({
        _id: t._id,
        title: t.title || t.taskName,
        taskName: t.taskName,
        description: t.description,
        dueDate: t.dueDate,
        status: t.status,
        priority: t.priority,
        progress: t.progress,
        projectId: t.projectId,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt
      }));

    // ── Recently Completed (last 5) ──
    const recentlyCompleted = allTasks
      .filter(t => t.status === 'Completed')
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 5)
      .map(t => ({
        _id: t._id,
        title: t.title || t.taskName,
        taskName: t.taskName,
        description: t.description,
        dueDate: t.dueDate,
        status: t.status,
        priority: t.priority,
        progress: t.progress,
        projectId: t.projectId,
        completedAt: t.updatedAt,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt
      }));

    // ── Priority Breakdown ──
    const priorityBreakdown = {
      Critical: allTasks.filter(t => t.priority === 'Critical').length,
      High: allTasks.filter(t => t.priority === 'High').length,
      Medium: allTasks.filter(t => t.priority === 'Medium').length,
      Low: allTasks.filter(t => t.priority === 'Low').length,
    };

    // ── Quick Stats ──
    const activeTasks = inProgressTasks + pendingTasks;

    // ── My Created Tasks ──
    const myCreatedTasks = await Task.countDocuments({
      createdBy: employeeId,
      createdByType: 'employee'
    });

    // ── My Reported Issues ──
    const reportedIssues = await Task.aggregate([
      {
        $project: {
          issueCount: {
            $size: {
              $filter: {
                input: "$reportedIssues",
                as: "issue",
                cond: {
                  $eq: [
                    "$$issue.employeeId",
                    new mongoose.Types.ObjectId(employeeId)
                  ]
                }
              }
            }
          }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$issueCount" }
        }
      }
    ]);

    // ── My Expenses ──
    const myExpenses = await Task.aggregate([
      {
        $unwind: "$expenses"
      },
      {
        $match: {
          "expenses.addedBy": new mongoose.Types.ObjectId(employeeId)
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: {
            $sum: "$expenses.expenseAmount"
          }
        }
      }
    ]);

    // ── Return response ──
    return res.status(200).json({
      success: true,
      dashboard: {
        // Stats
        totalAssignedTasks,
        pendingTasks,
        inProgressTasks,
        completedTasks,
        overdueTasks,
        rejectedTasks,
        completionRate,
        activeTasks,
        
        // Priority Breakdown
        priorityBreakdown,
        
        // Lists
        upcomingTasks,
        recentlyCompleted,
        
        // Additional
        myCreatedTasks,
        myReportedIssues: reportedIssues[0]?.total || 0,
        myExpenses: myExpenses[0]?.totalAmount || 0,
      }
    });

  } catch (error) {
    console.error('Employee Dashboard Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch dashboard data'
    });
  }
};



// ──────────────────────────────────────────────
// 1. GET ALL NOTIFICATIONS (Admin)
// ──────────────────────────────────────────────
exports.getAllNotifications = async (req, res) => {
  try {
    const { limit = 50, skip = 0 } = req.query;

    const notifications = await TaskNotification.find()
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .populate('recipient', 'name email employeeId')
      .populate('sender', 'name email')
      .populate('taskId', 'taskName title status');

    const total = await TaskNotification.countDocuments();

    return res.status(200).json({
      success: true,
      notifications,
      total,
      limit: parseInt(limit),
      skip: parseInt(skip)
    });

  } catch (error) {
    console.error("Get All Notifications Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ──────────────────────────────────────────────
// 2. GET NOTIFICATIONS BY EMPLOYEE ID
// ──────────────────────────────────────────────
exports.getNotificationsByEmployeeId = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { limit = 50, skip = 0 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid employeeId",
      });
    }

    // Check if employee exists
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const notifications = await TaskNotification.find({ recipient: employeeId })
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .populate('sender', 'name email')
      .populate('taskId', 'taskName title status priority');

    const total = await TaskNotification.countDocuments({ recipient: employeeId });

    return res.status(200).json({
      success: true,
      employee: {
        id: employee._id,
        name: employee.name,
        email: employee.email,
        employeeId: employee.employeeId
      },
      notifications,
      total,
      limit: parseInt(limit),
      skip: parseInt(skip)
    });

  } catch (error) {
    console.error("Get Notifications By Employee Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ──────────────────────────────────────────────
// 3. DELETE NOTIFICATION
// ──────────────────────────────────────────────
exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const { employeeId } = req.query; // Optional: check if employee owns this notification

    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notificationId",
      });
    }

    // Build query
    const query = { _id: notificationId };
    if (employeeId) {
      query.recipient = employeeId;
    }

    const notification = await TaskNotification.findOneAndDelete(query);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
      notification
    });

  } catch (error) {
    console.error("Delete Notification Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
