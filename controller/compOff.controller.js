// const CompOff = require("../models/CompOff");
// const Leave = require("../models/Leave");
// const { logActivity } = require("./userActivity.controller");
// const Notification = require("../models/Notification");

// // ✅ Add Comp-off (from leave conversion)
// exports.addCompOff = async (req, res) => {
//   try {
//     console.log("📩 Received comp-off data:", req.body);

//     const { 
//       employeeId, 
//       employeeName, 
//       originalLeaveId, 
//       workDate, 
//       reason,
//       approvedBy 
//     } = req.body;

//     // Validation
//     if (!employeeId || !employeeName || !originalLeaveId || !workDate) {
//       return res.status(400).json({ 
//         error: "Missing required fields: employeeId, employeeName, originalLeaveId, workDate" 
//       });
//     }

//     // Check if leave exists
//     const leave = await Leave.findById(originalLeaveId);
//     if (!leave) {
//       return res.status(404).json({ error: "Original leave not found" });
//     }

//     // Check if already converted
//     if (leave.isConvertedToCompOff) {
//       return res.status(400).json({ error: "Leave already converted to comp-off" });
//     }

//     // Create comp-off
//     const compOff = new CompOff({
//       employeeId,
//       employeeName,
//       originalLeaveId,
//       workDate,
//       reason: reason || `Comp-off for leave taken from ${new Date(leave.startDate).toLocaleDateString()} to ${new Date(leave.endDate).toLocaleDateString()}`,
//       status: "approved",
//       convertedFromLeave: true,
//       approvedBy: approvedBy || "Admin",
//       approvedDate: new Date()
//     });

//     await compOff.save();

//     // Update the original leave
//     leave.isConvertedToCompOff = true;
//     leave.compOffId = compOff._id;
//     leave.convertedDate = new Date();
//     await leave.save();

//     // Log activity
//     await logActivity({
//       userId: employeeId,
//       userName: employeeName,
//       userEmail: "",
//       userRole: "employee",
//       action: "comp_off_created",
//       actionDetails: `Leave converted to comp-off for working on ${new Date(workDate).toLocaleDateString()}`,
//       metadata: {
//         compOffId: compOff._id,
//         originalLeaveId,
//         workDate,
//         leaveDetails: {
//           startDate: leave.startDate,
//           endDate: leave.endDate,
//           days: leave.days
//         }
//       }
//     });

//     // Notify employee
//     await Notification.create({
//       userId: employeeId,
//       role: "employee",
//       title: "Comp-off Created",
//       message: `Your leave has been converted to comp-off for working on ${new Date(workDate).toLocaleDateString()}`,
//       type: "comp_off"
//     });

//     res.status(201).json({
//       message: "Comp-off created successfully",
//       compOff,
//       leave
//     });

//   } catch (error) {
//     console.error("❌ Error creating comp-off:", error);
//     res.status(500).json({ error: error.message });
//   }
// };

// // ✅ Get all comp-offs
// exports.getCompOffs = async (req, res) => {
//   try {
//     const { employeeId, status } = req.query;
    
//     let filter = {};
//     if (employeeId) filter.employeeId = employeeId;
//     if (status) filter.status = status;

//     const compOffs = await CompOff.find(filter).sort({ createdAt: -1 });
//     res.json(compOffs);
//   } catch (error) {
//     console.error("❌ Error fetching comp-offs:", error);
//     res.status(500).json({ error: error.message });
//   }
// };

// // ✅ Get comp-offs by employee
// exports.getCompOffsByEmployee = async (req, res) => {
//   try {
//     const { employeeId } = req.params;
    
//     const compOffs = await CompOff.find({ employeeId }).sort({ createdAt: -1 });
    
//     res.json({
//       success: true,
//       records: compOffs
//     });
//   } catch (error) {
//     console.error("❌ Error fetching employee comp-offs:", error);
//     res.status(500).json({ error: error.message });
//   }
// };

// // ✅ Update comp-off status
// exports.updateCompOffStatus = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status, approvedBy } = req.body;

//     if (!["approved", "rejected"].includes(status)) {
//       return res.status(400).json({ error: "Invalid status" });
//     }

//     const compOff = await CompOff.findById(id);
//     if (!compOff) {
//       return res.status(404).json({ error: "Comp-off not found" });
//     }

//     compOff.status = status;
//     compOff.approvedBy = approvedBy || "Admin";
//     compOff.approvedDate = new Date();

//     await compOff.save();

//     // If rejected, update the original leave
//     if (status === "rejected" && compOff.originalLeaveId) {
//       await Leave.findByIdAndUpdate(compOff.originalLeaveId, {
//         isConvertedToCompOff: false,
//         compOffId: null,
//         convertedDate: null
//       });
//     }

//     res.json(compOff);
//   } catch (error) {
//     console.error("❌ Error updating comp-off:", error);
//     res.status(500).json({ error: error.message });
//   }
// };

// // ✅ Delete comp-off
// exports.deleteCompOff = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const compOff = await CompOff.findById(id);
//     if (!compOff) {
//       return res.status(404).json({ error: "Comp-off not found" });
//     }

//     // Update the original leave
//     if (compOff.originalLeaveId) {
//       await Leave.findByIdAndUpdate(compOff.originalLeaveId, {
//         isConvertedToCompOff: false,
//         compOffId: null,
//         convertedDate: null
//       });
//     }

//     await CompOff.findByIdAndDelete(id);

//     res.json({ message: "Comp-off deleted successfully" });
//   } catch (error) {
//     console.error("❌ Error deleting comp-off:", error);
//     res.status(500).json({ error: error.message });
//   }
// };


const CompOff = require("../models/CompOff");
const CompOffRequest = require("../models/CompOffRequest"); // ✅ New model import
const Leave = require("../models/Leave");
const { logActivity } = require("./userActivity.controller");
const Notification = require("../models/Notification");
const Admin = require("../models/Admin");
const CompOffSettings = require("../models/CompOffSettings"); // ✅ New model import


// ============ COMP-OFF FUNCTIONS ============

// ✅ Add Comp-off (from leave conversion)
exports.addCompOff = async (req, res) => {
  try {
    console.log("📩 Received comp-off data:", req.body);

    const { 
      employeeId, 
      employeeName, 
      originalLeaveId, 
      workDate, 
      reason,
      approvedBy 
    } = req.body;

    // Validation
    if (!employeeId || !employeeName || !originalLeaveId || !workDate) {
      return res.status(400).json({ 
        error: "Missing required fields: employeeId, employeeName, originalLeaveId, workDate" 
      });
    }

    // Check if leave exists
    const leave = await Leave.findById(originalLeaveId);
    if (!leave) {
      return res.status(404).json({ error: "Original leave not found" });
    }

    // Check if already converted
    if (leave.isConvertedToCompOff) {
      return res.status(400).json({ error: "Leave already converted to comp-off" });
    }

    // Create comp-off
    const compOff = new CompOff({
      employeeId,
      employeeName,
      originalLeaveId,
      workDate,
      reason: reason || `Comp-off for leave taken from ${new Date(leave.startDate).toLocaleDateString()} to ${new Date(leave.endDate).toLocaleDateString()}`,
      status: "approved",
      convertedFromLeave: true,
      approvedBy: approvedBy || "Admin",
      approvedDate: new Date()
    });

    await compOff.save();

    // Update the original leave
    leave.isConvertedToCompOff = true;
    leave.compOffId = compOff._id;
    leave.convertedDate = new Date();
    await leave.save();

    // Log activity
    await logActivity({
      userId: employeeId,
      userName: employeeName,
      userEmail: "",
      userRole: "employee",
      action: "comp_off_created",
      actionDetails: `Leave converted to comp-off for working on ${new Date(workDate).toLocaleDateString()}`,
      metadata: {
        compOffId: compOff._id,
        originalLeaveId,
        workDate,
        leaveDetails: {
          startDate: leave.startDate,
          endDate: leave.endDate,
          days: leave.days
        }
      }
    });

    // Notify employee
    await Notification.create({
      userId: employeeId,
      role: "employee",
      title: "Comp-off Created",
      message: `Your leave has been converted to comp-off for working on ${new Date(workDate).toLocaleDateString()}`,
      type: "comp_off"
    });

    res.status(201).json({
      message: "Comp-off created successfully",
      compOff,
      leave
    });

  } catch (error) {
    console.error("❌ Error creating comp-off:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get all comp-offs
exports.getCompOffs = async (req, res) => {
  try {
    const { employeeId, status } = req.query;
    
    let filter = {};
    if (employeeId) filter.employeeId = employeeId;
    if (status) filter.status = status;

    const compOffs = await CompOff.find(filter).sort({ createdAt: -1 });
    res.json(compOffs);
  } catch (error) {
    console.error("❌ Error fetching comp-offs:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get comp-offs by employee
exports.getCompOffsByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    const compOffs = await CompOff.find({ employeeId }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      records: compOffs
    });
  } catch (error) {
    console.error("❌ Error fetching employee comp-offs:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Update comp-off status
exports.updateCompOffStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, approvedBy } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const compOff = await CompOff.findById(id);
    if (!compOff) {
      return res.status(404).json({ error: "Comp-off not found" });
    }

    compOff.status = status;
    compOff.approvedBy = approvedBy || "Admin";
    compOff.approvedDate = new Date();

    await compOff.save();

    // If rejected, update the original leave
    if (status === "rejected" && compOff.originalLeaveId) {
      await Leave.findByIdAndUpdate(compOff.originalLeaveId, {
        isConvertedToCompOff: false,
        compOffId: null,
        convertedDate: null
      });
    }

    res.json(compOff);
  } catch (error) {
    console.error("❌ Error updating comp-off:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Delete comp-off
exports.deleteCompOff = async (req, res) => {
  try {
    const { id } = req.params;

    const compOff = await CompOff.findById(id);
    if (!compOff) {
      return res.status(404).json({ error: "Comp-off not found" });
    }

    // Update the original leave
    if (compOff.originalLeaveId) {
      await Leave.findByIdAndUpdate(compOff.originalLeaveId, {
        isConvertedToCompOff: false,
        compOffId: null,
        convertedDate: null
      });
    }

    await CompOff.findByIdAndDelete(id);

    res.json({ message: "Comp-off deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting comp-off:", error);
    res.status(500).json({ error: error.message });
  }
};

// ============ COMP-OFF REQUEST FUNCTIONS ============

// // ✅ Create comp-off request (Employee)
// exports.createCompOffRequest = async (req, res) => {
//   try {
//     console.log("📩 Received comp-off request:", req.body);

//     const { 
//       employeeId, 
//       employeeName, 
//       originalLeaveId,
//       workDate, 
//       reason 
//     } = req.body;

//     // Validation
//     if (!employeeId || !employeeName || !originalLeaveId || !workDate) {
//       return res.status(400).json({ 
//         error: "Missing required fields: employeeId, employeeName, originalLeaveId, workDate" 
//       });
//     }

//     // Check if leave exists
//     const leave = await Leave.findById(originalLeaveId);
//     if (!leave) {
//       return res.status(404).json({ error: "Leave not found" });
//     }

//     // Check if already requested for this leave
//     const existingRequest = await CompOffRequest.findOne({
//       employeeId,
//       originalLeaveId,
//       status: "pending"
//     });

//     if (existingRequest) {
//       return res.status(400).json({ error: "You already have a pending request for this leave" });
//     }

//     const compOffRequest = new CompOffRequest({
//       employeeId,
//       employeeName,
//       originalLeaveId,
//       workDate,
//       reason: reason || "Comp-off request",
//       status: "pending"
//     });

//     await compOffRequest.save();

//     // Notify admins
//     const admins = await Admin.find({ role: { $regex: /^admin$/i } });
//     for (const admin of admins) {
//       await Notification.create({
//         userId: admin.email,
//         role: "admin",
//         title: "New Comp-off Request",
//         message: `${employeeName} requested comp-off for ${new Date(workDate).toLocaleDateString()}`,
//         type: "comp_off_request",
//         metadata: {
//           requestId: compOffRequest._id,
//           employeeId,
//           leaveId: originalLeaveId
//         }
//       });
//     }

//     res.status(201).json({
//       message: "Comp-off request submitted successfully",
//       compOffRequest
//     });

//   } catch (error) {
//     console.error("❌ Error creating comp-off request:", error);
//     res.status(500).json({ error: error.message });
//   }
// };



/**
 * ✅ Create comp-off request (Employee)
 */

exports.createCompOffRequest = async (req, res) => {
  try {
    console.log("📩 Received comp-off request:", req.body);

    const {
      employeeId,
      employeeName,
      originalLeaveId,
      workDate,
      reason
    } = req.body;

    // ✅ Validation
    if (!employeeId || !employeeName || !originalLeaveId || !workDate) {
      return res.status(400).json({
        error:
          "Missing required fields: employeeId, employeeName, originalLeaveId, workDate"
      });
    }

    // ✅ Check leave exists
    const leave = await Leave.findById(originalLeaveId);

    if (!leave) {
      return res.status(404).json({
        error: "Leave not found"
      });
    }

    // ✅ Check Comp-Off Settings
    const compOffSetting = await CompOffSettings.findOne({
      status: "active"
    }).sort({ createdAt: -1 });

    if (!compOffSetting) {
      return res.status(400).json({
        error: "Comp-Off is not active by admin"
      });
    }

    // ✅ Validity Check
    const today = new Date();

    const validityFrom = new Date(
      compOffSetting.validityFrom
    );

    const validityTo = new Date(
      compOffSetting.validityTo
    );

    if (today < validityFrom || today > validityTo) {

      // Auto expire
      compOffSetting.status = "expired";
      await compOffSetting.save();

      return res.status(400).json({
        error: "Comp-Off validity expired"
      });
    }

    // ✅ Check remaining comp-off
    if (compOffSetting.totalCompOff <= 0) {
      return res.status(400).json({
        error: "No Comp-Off balance available"
      });
    }

    // ✅ Check pending request
    const existingRequest = await CompOffRequest.findOne({
      employeeId,
      originalLeaveId,
      status: "pending"
    });

    if (existingRequest) {
      return res.status(400).json({
        error:
          "You already have a pending request for this leave"
      });
    }

    // ✅ Create request
    const compOffRequest = new CompOffRequest({
      employeeId,
      employeeName,
      originalLeaveId,
      workDate,
      reason: reason || "Comp-off request",
      status: "pending"
    });

    await compOffRequest.save();

    // ✅ Reduce comp-off count
    compOffSetting.totalCompOff =
      compOffSetting.totalCompOff - 1;

    await compOffSetting.save();

    // ✅ Notify admins
    const admins = await Admin.find({
      role: { $regex: /^admin$/i }
    });

    for (const admin of admins) {
      await Notification.create({
        userId: admin.email,
        role: "admin",
        title: "New Comp-off Request",
        message: `${employeeName} requested comp-off for ${new Date(
          workDate
        ).toLocaleDateString()}`,
        type: "comp_off_request",
        metadata: {
          requestId: compOffRequest._id,
          employeeId,
          leaveId: originalLeaveId
        }
      });
    }

    res.status(201).json({
      success: true,
      message: "Comp-off request submitted successfully",
      remainingCompOff: compOffSetting.totalCompOff,
      compOffRequest
    });

  } catch (error) {
    console.error(
      "❌ Error creating comp-off request:",
      error
    );

    res.status(500).json({
      error: error.message
    });
  }
};

// ✅ Get all comp-off requests (Admin)
exports.getCompOffRequests = async (req, res) => {
  try {
    const { status, employeeId } = req.query;
    
    let filter = {};
    if (status) filter.status = status;
    if (employeeId) filter.employeeId = employeeId;

    const requests = await CompOffRequest.find(filter)
      .populate('originalLeaveId')
      .sort({ createdAt: -1 });
      
    res.json(requests);
  } catch (error) {
    console.error("❌ Error fetching comp-off requests:", error);
    res.status(500).json({ error: error.message });
  }
};

// // ✅ Get employee's comp-off requests
// exports.getEmployeeCompOffRequests = async (req, res) => {
//   try {
//     const { employeeId } = req.params;
    
//     const requests = await CompOffRequest.find({ employeeId })
//       .populate('originalLeaveId')
//       .sort({ createdAt: -1 });
    
//     res.json({
//       success: true,
//       records: requests
//     });
//   } catch (error) {
//     console.error("❌ Error fetching employee comp-off requests:", error);
//     res.status(500).json({ error: error.message });
//   }
// };



/**
 * ✅ Get employee's comp-off requests
 */

exports.getEmployeeCompOffRequests = async (req, res) => {
  try {
    const { employeeId } = req.params;

    // ✅ Get employee requests
    const requests = await CompOffRequest.find({
      employeeId
    })
      .populate("originalLeaveId")
      .sort({ createdAt: -1 });

    // ✅ Get active comp-off settings
    const compOffSetting =
      await CompOffSettings.findOne({
        status: "active"
      }).sort({ createdAt: -1 });

    // ✅ Total comp-off from settings
    const totalCompOff =
      compOffSetting?.totalCompOff || 0;

    // ✅ Used comp-off count
    const usedCompOffCount = requests.filter(
      (item) =>
        item.status === "approved" ||
        item.status === "pending"
    ).length;

    // ✅ Remaining comp-off count
    const remainingCompOffCount =
      totalCompOff - usedCompOffCount;

    // ✅ Get validity dates from settings
    const validityFrom = compOffSetting?.validityFrom || null;
    const validityTo = compOffSetting?.validityTo || null;

    // ✅ Check if validity period is still active
    const now = new Date();
    let isValid = false;
    
    if (validityFrom && validityTo) {
      const fromDate = new Date(validityFrom);
      const toDate = new Date(validityTo);
      // Set time to end of day for toDate
      toDate.setHours(23, 59, 59, 999);
      
      if (now >= fromDate && now <= toDate) {
        isValid = true;
      }
    }

    res.json({
      success: true,
      totalCompOff,
      usedCompOffCount,
      remainingCompOffCount: remainingCompOffCount > 0 ? remainingCompOffCount : 0,
      validityFrom: validityFrom,
      validityTo: validityTo,
      isValidPeriod: isValid,
      status: compOffSetting?.status || "inactive",
      records: requests
    });

  } catch (error) {
    console.error(
      "❌ Error fetching employee comp-off requests:",
      error
    );

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
// ✅ Approve comp-off request
exports.approveCompOffRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { approvedBy } = req.body;

    const request = await CompOffRequest.findById(id).populate('originalLeaveId');
    if (!request) {
      return res.status(404).json({ error: "Comp-off request not found" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ error: "Request already processed" });
    }

    // Create comp-off
    const compOff = new CompOff({
      employeeId: request.employeeId,
      employeeName: request.employeeName,
      originalLeaveId: request.originalLeaveId._id,
      workDate: request.workDate,
      reason: request.reason,
      status: "approved",
      convertedFromLeave: true,
      approvedBy: approvedBy || "Admin",
      approvedDate: new Date()
    });

    await compOff.save();

    // Update the original leave
    if (request.originalLeaveId) {
      request.originalLeaveId.isConvertedToCompOff = true;
      request.originalLeaveId.compOffId = compOff._id;
      request.originalLeaveId.convertedDate = new Date();
      await request.originalLeaveId.save();
    }

    // Update request
    request.status = "approved";
    request.approvedBy = approvedBy || "Admin";
    request.approvedDate = new Date();
    request.convertedToCompOff = true;
    request.compOffId = compOff._id;
    await request.save();

    // Notify employee
    await Notification.create({
      userId: request.employeeId,
      role: "employee",
      title: "Comp-off Request Approved",
      message: `Your comp-off request for ${new Date(request.workDate).toLocaleDateString()} has been approved`,
      type: "comp_off_approved"
    });

    res.json({
      message: "Comp-off request approved successfully",
      request,
      compOff
    });

  } catch (error) {
    console.error("❌ Error approving comp-off request:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Reject comp-off request
exports.rejectCompOffRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { approvedBy, rejectionReason } = req.body;

    const request = await CompOffRequest.findById(id);
    if (!request) {
      return res.status(404).json({ error: "Comp-off request not found" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ error: "Request already processed" });
    }

    request.status = "rejected";
    request.approvedBy = approvedBy || "Admin";
    request.approvedDate = new Date();
    await request.save();

    // Notify employee
    await Notification.create({
      userId: request.employeeId,
      role: "employee",
      title: "Comp-off Request Rejected",
      message: `Your comp-off request for ${new Date(request.workDate).toLocaleDateString()} was rejected${rejectionReason ? `: ${rejectionReason}` : ''}`,
      type: "comp_off_rejected"
    });

    res.json({
      message: "Comp-off request rejected",
      request
    });

  } catch (error) {
    console.error("❌ Error rejecting comp-off request:", error);
    res.status(500).json({ error: error.message });
  }
};
// ✅ UPDATE comp-off (Edit count and reason)
exports.updateCompOff = async (req, res) => {
  try {
    const { id } = req.params;
    const { count, reason, updatedBy } = req.body;  // ✅ count bhi add karo

    console.log("📩 Updating comp-off:", { id, count, reason });

    const compOff = await CompOff.findById(id);
    if (!compOff) {
      return res.status(404).json({ error: "Comp-off not found" });
    }

    // ✅ Count update bhi add karo
    if (count !== undefined && count !== null) {
      compOff.count = count;
    }
    if (reason !== undefined) {
      compOff.reason = reason;
    }
    compOff.updatedBy = updatedBy || "Admin";
    compOff.updatedAt = new Date();

    await compOff.save();

    res.json({
      success: true,
      message: "Comp-off updated successfully",
      compOff
    });

  } catch (error) {
    console.error("❌ Error updating comp-off:", error);
    res.status(500).json({ error: error.message });
  }
};



/**
 * 📌 Add Comp-Off Settings
 */

exports.addCompOffSettings = async (req, res) => {
  try {
    const {
      totalCompOff,
      validityFrom,
      validityTo
    } = req.body;

    const compOff = new CompOffSettings({
      totalCompOff,
      validityFrom,
      validityTo,
      status: "active"
    });

    await compOff.save();

    res.status(201).json({
      success: true,
      message: "Comp-Off settings added successfully",
      data: compOff
    });

  } catch (error) {
    console.error("❌ Error adding comp-off settings:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


/**
 * 📌 Get All Comp-Off Settings
 */

exports.getAllCompOffSettings = async (req, res) => {
  try {

    const data = await CompOffSettings.find()
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: data.length,
      data
    });

  } catch (error) {
    console.error("❌ Error fetching comp-off settings:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};



/**
 * 📌 Update Comp-Off Settings
 */

exports.updateCompOffSettings = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      totalCompOff,
      validityFrom,
      validityTo,
      status
    } = req.body;

    const compOff = await CompOffSettings.findById(id);

    if (!compOff) {
      return res.status(404).json({
        success: false,
        message: "Comp-Off settings not found"
      });
    }

    // ✅ Update fields
    if (totalCompOff !== undefined) {
      compOff.totalCompOff = totalCompOff;
    }

    if (validityFrom) {
      compOff.validityFrom = validityFrom;
    }

    if (validityTo) {
      compOff.validityTo = validityTo;
    }

    if (status) {
      compOff.status = status;
    }

    await compOff.save();

    res.status(200).json({
      success: true,
      message: "Comp-Off settings updated successfully",
      data: compOff
    });

  } catch (error) {
    console.error("❌ Error updating comp-off settings:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};



/**
 * 📌 Delete Comp-Off Settings
 */

exports.deleteCompOffSettings = async (req, res) => {
  try {
    const { id } = req.params;

    const compOff = await CompOffSettings.findById(id);

    if (!compOff) {
      return res.status(404).json({
        success: false,
        message: "Comp-Off settings not found"
      });
    }

    await CompOffSettings.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Comp-Off settings deleted successfully"
    });

  } catch (error) {
    console.error("❌ Error deleting comp-off settings:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};