const Task = require("../models/Task");
const Employee = require("../models/Employee");
const mongoose = require("mongoose");

// ============================================
// 1. CREATE TASK (Employee)
// ============================================
exports.createTask = async (req, res) => {
  try {
    const {
      taskName,
      title,
      description,
      createdBy,
      createdByType = "employee",
      assignType,
      assignedTo,
      department,
      priority,
      deadlineType,
      deadlineValue,
    } = req.body;

    // Validation
    if (!taskName || !title || !description || !assignType) {
      return res.status(400).json({
        success: false,
        message: "taskName, title, description, and assignType are required"
      });
    }

    // Employee can only assign to SELF or INDIVIDUAL (if they have permission)
    if (!["SELF", "INDIVIDUAL"].includes(assignType)) {
      return res.status(403).json({
        success: false,
        message: "Employees can only create tasks for SELF or INDIVIDUAL assignment"
      });
    }

    let employeeIds = [];

    if (assignType === "SELF") {
      if (!createdBy) {
        return res.status(400).json({
          success: false,
          message: "createdBy is required for SELF assignment"
        });
      }
      
      // Verify employee exists
      const employee = await Employee.findById(createdBy);
      if (!employee || employee.status !== "active") {
        return res.status(400).json({
          success: false,
          message: "Employee not found or inactive"
        });
      }
      
      employeeIds = [createdBy];
    } 
    else if (assignType === "INDIVIDUAL") {
      if (!assignedTo || assignedTo.length === 0) {
        return res.status(400).json({
          success: false,
          message: "assignedTo is required for INDIVIDUAL assignment type"
        });
      }

      // Validate all employee IDs exist and are active
      const validEmployees = await Employee.find({
        _id: { $in: assignedTo },
        status: "active"
      }).select("_id");

      if (validEmployees.length !== assignedTo.length) {
        return res.status(400).json({
          success: false,
          message: "Some employees are invalid or inactive"
        });
      }

      // Check if employee has permission to assign to others
      // (Optional: Add permission check here if needed)
      employeeIds = assignedTo;
    }

    // Calculate due date
    let dueDate = new Date();
    
    if (deadlineType === "Days") {
      dueDate.setDate(dueDate.getDate() + Number(deadlineValue));
    } else if (deadlineType === "Week") {
      dueDate.setDate(dueDate.getDate() + Number(deadlineValue) * 7);
    } else if (deadlineType === "Month") {
      dueDate.setMonth(dueDate.getMonth() + Number(deadlineValue));
    } else if (deadlineType === "Custom") {
      if (!deadlineValue) {
        return res.status(400).json({
          success: false,
          message: "Custom deadline requires deadlineValue"
        });
      }
      dueDate = new Date(deadlineValue);
    } else {
      dueDate.setDate(dueDate.getDate() + 7);
    }

    // Create task
    const task = await Task.create({
      taskName,
      title,
      description,
      createdBy,
      createdByType: "employee",
      assignType,
      assignedTo: employeeIds,
      department: department || null,
      priority: priority || "Medium",
      deadlineType: deadlineType || "Days",
      deadlineValue: deadlineValue || 7,
      dueDate,
      status: "Pending",
      progress: 0
    });

    // Populate details
    const populatedTask = await Task.findById(task._id)
      .populate("createdBy", "fullName email department")
      .populate("assignedTo", "fullName email department");

    return res.status(201).json({
      success: true,
      message: `Task created and assigned to ${employeeIds.length} employee(s)`,
      task: populatedTask,
      assignedCount: employeeIds.length
    });

  } catch (error) {
    console.error("Create Task Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// 2. GET MY TASKS (Employee)
// ============================================
exports.getMyTasks = async (req, res) => {
  try {
    const { employeeId } = req.query;
    const {
      status,
      priority,
      assignType,
      search,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc"
    } = req.query;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: "employeeId is required"
      });
    }

    // Verify employee exists
    const employee = await Employee.findById(employeeId);
    if (!employee || employee.status !== "active") {
      return res.status(404).json({
        success: false,
        message: "Employee not found or inactive"
      });
    }

    // Build filter - tasks assigned to this employee
    let filter = {
      assignedTo: employeeId
    };

    if (status) {
      filter.status = status;
    }

    if (priority) {
      filter.priority = priority;
    }

    if (assignType) {
      filter.assignType = assignType;
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

    // Get total count
    const totalTasks = await Task.countDocuments(filter);

    // Get tasks
    const tasks = await Task.find(filter)
      .populate("createdBy", "fullName email department profileImage")
      .populate("assignedTo", "fullName email department profileImage")
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNumber);

    // Calculate stats for my tasks
    const stats = {
      total: totalTasks,
      pending: await Task.countDocuments({ ...filter, status: "Pending" }),
      inProgress: await Task.countDocuments({ ...filter, status: "In Progress" }),
      completed: await Task.countDocuments({ ...filter, status: "Completed" }),
      rejected: await Task.countDocuments({ ...filter, status: "Rejected" }),
      overdue: await Task.countDocuments({ 
        ...filter, 
        dueDate: { $lt: new Date() },
        status: { $ne: "Completed" }
      }),
      highPriority: await Task.countDocuments({ 
        ...filter, 
        priority: { $in: ["High", "Critical"] }
      })
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
    console.error("Get My Tasks Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// 3. GET TASK BY ID (Employee)
// ============================================
exports.getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeId } = req.query;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID"
      });
    }

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: "employeeId is required"
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

    // Check if task is assigned to this employee
    if (!task.assignedTo.includes(employeeId) && task.createdBy.toString() !== employeeId) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to view this task"
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
// 4. UPDATE TASK STATUS (Employee)
// ============================================
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeId, status, comments } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID"
      });
    }

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: "employeeId is required"
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "status is required"
      });
    }

    // Validate status
    const validStatuses = ["Pending", "In Progress", "Completed", "Rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`
      });
    }

    // Check if task exists and is assigned to this employee
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    if (!task.assignedTo.includes(employeeId)) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to update this task"
      });
    }

    // Update status
    const updateData = { status };
    
    // If status is Completed, automatically set progress to 100%
    if (status === "Completed") {
      updateData.progress = 100;
    }

    // If status is Rejected, set progress to 0
    if (status === "Rejected") {
      updateData.progress = 0;
    }

    // Add activity log (optional - you can create a separate model for this)
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate("createdBy", "fullName email")
    .populate("assignedTo", "fullName email");

    return res.status(200).json({
      success: true,
      message: `Task status updated to ${status}`,
      task: updatedTask
    });

  } catch (error) {
    console.error("Update Status Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// 5. UPDATE TASK PROGRESS (Employee)
// ============================================
exports.updateProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeId, progress } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID"
      });
    }

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: "employeeId is required"
      });
    }

    if (progress === undefined || progress === null) {
      return res.status(400).json({
        success: false,
        message: "progress is required"
      });
    }

    // Validate progress (0-100)
    if (progress < 0 || progress > 100) {
      return res.status(400).json({
        success: false,
        message: "Progress must be between 0 and 100"
      });
    }

    // Check if task exists and is assigned to this employee
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    if (!task.assignedTo.includes(employeeId)) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to update this task"
      });
    }

    // Update progress
    const updateData = { progress: Number(progress) };

    // Auto-update status based on progress
    if (progress === 0) {
      updateData.status = "Pending";
    } else if (progress > 0 && progress < 100) {
      updateData.status = "In Progress";
    } else if (progress === 100) {
      updateData.status = "Completed";
    }

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate("createdBy", "fullName email")
    .populate("assignedTo", "fullName email");

    return res.status(200).json({
      success: true,
      message: `Task progress updated to ${progress}%`,
      task: updatedTask
    });

  } catch (error) {
    console.error("Update Progress Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// 6. GET OVERDUE TASKS (Employee)
// ============================================
exports.getOverdueTasks = async (req, res) => {
  try {
    const { employeeId, priority, search } = req.query;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: "employeeId is required"
      });
    }

    const currentDate = new Date();

    let filter = {
      assignedTo: employeeId,
      dueDate: { $lt: currentDate },
      status: { $ne: "Completed" }
    };

    if (priority) {
      filter.priority = priority;
    }

    if (search) {
      filter.$or = [
        { taskName: { $regex: search, $options: "i" } },
        { title: { $regex: search, $options: "i" } }
      ];
    }

    const overdueTasks = await Task.find(filter)
      .populate("createdBy", "fullName email")
      .populate("assignedTo", "fullName email")
      .sort({ dueDate: 1 });

    // Calculate days overdue and severity
    const tasksWithDetails = overdueTasks.map(task => {
      const daysOverdue = Math.ceil(
        (currentDate - new Date(task.dueDate)) / (1000 * 60 * 60 * 24)
      );

      let severity = "Low";
      if (daysOverdue > 30) severity = "Critical";
      else if (daysOverdue > 15) severity = "High";
      else if (daysOverdue > 7) severity = "Medium";

      return {
        ...task.toObject(),
        daysOverdue,
        severity
      };
    });

    return res.status(200).json({
      success: true,
      count: tasksWithDetails.length,
      tasks: tasksWithDetails
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
// 7. GET TASK STATISTICS (Employee)
// ============================================
exports.getMyTaskStats = async (req, res) => {
  try {
    const { employeeId, startDate, endDate } = req.query;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: "employeeId is required"
      });
    }

    // Verify employee exists
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found"
      });
    }

    // Build filter
    let filter = { assignedTo: employeeId };
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Get all tasks
    const tasks = await Task.find(filter);

    // Comprehensive statistics
    const stats = {
      employee: {
        id: employee._id,
        fullName: employee.fullName,
        email: employee.email,
        department: employee.department
      },

      overview: {
        total: tasks.length,
        completed: tasks.filter(t => t.status === "Completed").length,
        inProgress: tasks.filter(t => t.status === "In Progress").length,
        pending: tasks.filter(t => t.status === "Pending").length,
        rejected: tasks.filter(t => t.status === "Rejected").length,
        overdue: tasks.filter(t => {
          return t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "Completed";
        }).length
      },

      performance: {
        completionRate: tasks.length > 0 ? 
          Math.round((tasks.filter(t => t.status === "Completed").length / tasks.length) * 100) : 0,
        averageProgress: tasks.length > 0 ? 
          Math.round(tasks.reduce((acc, t) => acc + t.progress, 0) / tasks.length) : 0,
        totalTasksCompleted: tasks.filter(t => t.status === "Completed").length,
        totalTasksRejected: tasks.filter(t => t.status === "Rejected").length
      },

      priority: {
        low: tasks.filter(t => t.priority === "Low").length,
        medium: tasks.filter(t => t.priority === "Medium").length,
        high: tasks.filter(t => t.priority === "High").length,
        critical: tasks.filter(t => t.priority === "Critical").length
      },

      progress: {
        notStarted: tasks.filter(t => t.progress === 0).length,
        inProgress: tasks.filter(t => t.progress > 0 && t.progress < 100).length,
        completed: tasks.filter(t => t.progress === 100).length,
        average: tasks.length > 0 ? 
          Math.round(tasks.reduce((acc, t) => acc + t.progress, 0) / tasks.length) : 0
      },

      timeline: {
        thisWeek: tasks.filter(t => {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return new Date(t.createdAt) >= weekAgo;
        }).length,
        thisMonth: tasks.filter(t => {
          const monthAgo = new Date();
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return new Date(t.createdAt) >= monthAgo;
        }).length,
        overdue: tasks.filter(t => {
          return t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "Completed";
        }).length
      },

      recentActivity: tasks
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 5)
        .map(t => ({
          taskName: t.taskName,
          status: t.status,
          progress: t.progress,
          updatedAt: t.updatedAt
        }))
    };

    return res.status(200).json({
      success: true,
      stats
    });

  } catch (error) {
    console.error("Get My Task Stats Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// 8. FILTER TASKS BY STATUS AND PRIORITY (Employee)
// ============================================
exports.filterMyTasks = async (req, res) => {
  try {
    const { employeeId } = req.query;
    const {
      status,
      priority,
      department,
      assignType,
      search,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc"
    } = req.query;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: "employeeId is required"
      });
    }

    // Build filter
    let filter = { assignedTo: employeeId };

    if (status) {
      // Support multiple status values separated by comma
      const statuses = status.split(",");
      if (statuses.length > 1) {
        filter.status = { $in: statuses };
      } else {
        filter.status = status;
      }
    }

    if (priority) {
      const priorities = priority.split(",");
      if (priorities.length > 1) {
        filter.priority = { $in: priorities };
      } else {
        filter.priority = priority;
      }
    }

    if (department) {
      filter.department = department;
    }

    if (assignType) {
      filter.assignType = assignType;
    }

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

    // Get tasks
    const totalTasks = await Task.countDocuments(filter);
    const tasks = await Task.find(filter)
      .populate("createdBy", "fullName email")
      .populate("assignedTo", "fullName email")
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNumber);

    return res.status(200).json({
      success: true,
      filters: { status, priority, department, assignType, search },
      tasks,
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(totalTasks / limitNumber),
        totalItems: totalTasks,
        itemsPerPage: limitNumber
      }
    });

  } catch (error) {
    console.error("Filter My Tasks Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// 9. GET TASK SUMMARY (Employee Dashboard)
// ============================================
exports.getTaskSummary = async (req, res) => {
  try {
    const { employeeId } = req.query;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: "employeeId is required"
      });
    }

    // Get all tasks for this employee
    const tasks = await Task.find({ assignedTo: employeeId });

    const currentDate = new Date();

    // Summary data
    const summary = {
      total: tasks.length,
      byStatus: {
        pending: tasks.filter(t => t.status === "Pending").length,
        inProgress: tasks.filter(t => t.status === "In Progress").length,
        completed: tasks.filter(t => t.status === "Completed").length,
        rejected: tasks.filter(t => t.status === "Rejected").length,
        overdue: tasks.filter(t => 
          t.status !== "Completed" && 
          t.dueDate && 
          new Date(t.dueDate) < currentDate
        ).length
      },
      byPriority: {
        low: tasks.filter(t => t.priority === "Low").length,
        medium: tasks.filter(t => t.priority === "Medium").length,
        high: tasks.filter(t => t.priority === "High").length,
        critical: tasks.filter(t => t.priority === "Critical").length
      },
      upcoming: tasks
        .filter(t => 
          t.status !== "Completed" && 
          t.status !== "Rejected" &&
          t.dueDate && 
          new Date(t.dueDate) >= currentDate
        )
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        .slice(0, 5)
        .map(t => ({
          _id: t._id,
          taskName: t.taskName,
          title: t.title,
          dueDate: t.dueDate,
          priority: t.priority,
          progress: t.progress
        })),
      recentTasks: tasks
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
        .map(t => ({
          _id: t._id,
          taskName: t.taskName,
          title: t.title,
          status: t.status,
          priority: t.priority,
          progress: t.progress,
          createdAt: t.createdAt
        }))
    };

    return res.status(200).json({
      success: true,
      summary
    });

  } catch (error) {
    console.error("Get Task Summary Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// 10. BULK UPDATE MY TASKS (Employee)
// ============================================
exports.bulkUpdateMyTasks = async (req, res) => {
  try {
    const { employeeId, taskIds, status, progress } = req.body;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: "employeeId is required"
      });
    }

    if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "taskIds array is required"
      });
    }

    // Build update object
    let updateData = {};
    if (status) {
      const validStatuses = ["Pending", "In Progress", "Completed", "Rejected"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`
        });
      }
      updateData.status = status;
      if (status === "Completed") updateData.progress = 100;
      if (status === "Rejected") updateData.progress = 0;
    }

    if (progress !== undefined) {
      if (progress < 0 || progress > 100) {
        return res.status(400).json({
          success: false,
          message: "Progress must be between 0 and 100"
        });
      }
      updateData.progress = Number(progress);
      
      // Auto-update status based on progress
      if (progress === 0 && !status) updateData.status = "Pending";
      else if (progress > 0 && progress < 100 && !status) updateData.status = "In Progress";
      else if (progress === 100 && !status) updateData.status = "Completed";
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one field (status or progress) is required for update"
      });
    }

    // Update tasks - ensure they belong to this employee
    const result = await Task.updateMany(
      { 
        _id: { $in: taskIds },
        assignedTo: employeeId
      },
      updateData
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "No tasks found for this employee with the provided IDs"
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
    console.error("Bulk Update My Tasks Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};