// const Shift = require("../models/Shift");

// // ✅ Assign new shift
// exports.assignShift = async (req, res) => {
//   try {
//     const { employeeId, employeeName, shiftType, startTime, endTime } = req.body;

//     if (!employeeId || !employeeName || !shiftType || !startTime || !endTime) {
//       return res.status(400).json({ message: "All fields are required" });
//     }

//     const newShift = new Shift({
//       employeeId,
//       employeeName,
//       shiftType,
//       startTime,
//       endTime,
//     });

//     await newShift.save();
//     res.status(201).json({ message: "Shift assigned successfully", shift: newShift });
//   } catch (error) {
//     console.error("Error assigning shift:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // ✅ Get all shifts
// exports.getAllShifts = async (req, res) => {
//   try {
//     const shifts = await Shift.find().sort({ createdAt: -1 });
//     res.status(200).json(shifts);
//   } catch (error) {
//     console.error("Error fetching shifts:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // ✅ Get shift by ID
// exports.getShiftById = async (req, res) => {
//   try {
//     const shift = await Shift.findById(req.params.id);
//     if (!shift) return res.status(404).json({ message: "Shift not found" });
//     res.status(200).json(shift);
//   } catch (error) {
//     console.error("Error fetching shift:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // ✅ Update shift
// exports.updateShift = async (req, res) => {
//   try {
//     const updatedShift = await Shift.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//       runValidators: true,
//     });
//     if (!updatedShift) return res.status(404).json({ message: "Shift not found" });
//     res.status(200).json({ message: "Shift updated successfully", shift: updatedShift });
//   } catch (error) {
//     console.error("Error updating shift:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // ✅ Delete shift
// exports.deleteShift = async (req, res) => {
//   try {
//     const deleted = await Shift.findByIdAndDelete(req.params.id);
//     if (!deleted) return res.status(404).json({ message: "Shift not found" });
//     res.status(200).json({ message: "Shift deleted successfully" });
//   } catch (error) {
//     console.error("Error deleting shift:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };


const Shift = require("../models/Shift");

console.log("✅ Shift Controller Loaded");

// ✅ 1. CREATE MASTER SHIFT (E, F, G... भी create कर सकते हैं)
exports.createMasterShift = async (req, res) => {
  try {
    console.log("📝 CREATE MASTER SHIFT REQUEST:", req.body);
    
    const { shiftType, shiftName } = req.body;

    if (!shiftType || !shiftName) {
      return res.status(400).json({ 
        success: false,
        message: "Shift Type and Name are required" 
      });
    }

    // Check if shift type already exists
    const existingShift = await Shift.findOne({ 
      shiftType: shiftType.toUpperCase(),
      isMasterShift: true
    });

    if (existingShift) {
      return res.status(400).json({ 
        success: false,
        message: `Shift ${shiftType} already exists.` 
      });
    }

    // Dynamic time slots based on shift type
    const getTimeSlotsForShift = (type) => {
      const slotConfigs = {
        "A": [
          { slotId: "A1", timeRange: "06:00 - 14:00", description: "Morning 6 to 2" },
          { slotId: "A2", timeRange: "07:00 - 15:00", description: "Morning 7 to 3" },
          { slotId: "A3", timeRange: "08:00 - 16:00", description: "Morning 8 to 4" },
          { slotId: "A4", timeRange: "09:00 - 21:00", description: "Morning 9 to 9" },
          { slotId: "A5", timeRange: "10:00 - 18:00", description: "Morning 10 to 6" },
          { slotId: "A6", timeRange: "10:00 - 19:00", description: "Morning 10 to 7" },
          { slotId: "A7", timeRange: "10:00 - 20:00", description: "Morning 10 to 8" },
          { slotId: "A8", timeRange: "10:00 - 21:00", description: "Morning 10 to 9" },
        ],
        "B": [
          { slotId: "B1", timeRange: "14:00 - 22:00", description: "Evening 2 to 10" },
          { slotId: "B2", timeRange: "15:00 - 23:00", description: "Evening 3 to 11" },
          { slotId: "B3", timeRange: "16:00 - 00:00", description: "Evening 4 to 12" }
        ],
        "C": [
          { slotId: "C1", timeRange: "22:00 - 06:00", description: "Night 10 to 6" },
          { slotId: "C2", timeRange: "23:00 - 07:00", description: "Night 11 to 7" },
          { slotId: "C3", timeRange: "00:00 - 08:00", description: "Night 12 to 8" }
        ],
        "D": [
          { slotId: "D1", timeRange: "09:00 - 18:00", description: "General 9 to 6" },
          { slotId: "D2", timeRange: "10:00 - 19:00", description: "General 10 to 7" }
        ],
        "E": [
          { slotId: "E1", timeRange: "08:00 - 20:00", description: "Extended 8 to 8" },
          { slotId: "E2", timeRange: "09:00 - 21:00", description: "Extended 9 to 9" },
          { slotId: "E3", timeRange: "10:00 - 22:00", description: "Extended 10 to 10" }
        ],
        "F": [
          { slotId: "F1", timeRange: "12:00 - 20:00", description: "Flexi 12 to 8" },
          { slotId: "F2", timeRange: "13:00 - 21:00", description: "Flexi 1 to 9" },
          { slotId: "F3", timeRange: "14:00 - 22:00", description: "Flexi 2 to 10" }
        ],
        "G": [
          { slotId: "G1", timeRange: "10:00 - 19:00", description: "General 10 to 7" },
          { slotId: "G2", timeRange: "11:00 - 20:00", description: "General 11 to 8" }
        ],
        "H": [
          { slotId: "H1", timeRange: "07:00 - 19:00", description: "Hospital 7 to 7" },
          { slotId: "H2", timeRange: "08:00 - 20:00", description: "Hospital 8 to 8" }
        ]
      };
      
      return slotConfigs[type] || [
        { slotId: `${type}1`, timeRange: "09:00 - 18:00", description: "Standard timing" },
        { slotId: `${type}2`, timeRange: "10:00 - 19:00", description: "Alternate timing" }
      ];
    };

    const newShift = new Shift({
      shiftType: shiftType.toUpperCase(),
      shiftName,
      timeSlots: getTimeSlotsForShift(shiftType.toUpperCase()),
      isMasterShift: true,
      isActive: true
    });

    await newShift.save();
    
    console.log("✅ MASTER SHIFT CREATED:", newShift);
    
    res.status(201).json({ 
      success: true,
      message: "Shift created successfully", 
      data: newShift 
    });
  } catch (error) {
    console.error("❌ CREATE SHIFT ERROR:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error",
      error: error.message 
    });
  }
};

// ✅ 2. GET ALL MASTER SHIFTS
exports.getMasterShifts = async (req, res) => {
  try {
    console.log("📝 GET MASTER SHIFTS REQUEST");
    
    const masterShifts = await Shift.find({ 
      isMasterShift: true,
      isActive: true
    }).sort({ shiftType: 1 });

    console.log("✅ FOUND MASTER SHIFTS:", masterShifts.length);
    
    res.status(200).json({ 
      success: true,
      data: masterShifts
    });
  } catch (error) {
    console.error("❌ GET MASTER SHIFTS ERROR:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error"
    });
  }
};

// ✅ 3. GET ALL EMPLOYEE ASSIGNMENTS (Legacy + New data)
exports.getEmployeeAssignments = async (req, res) => {
  try {
    console.log("📝 GET EMPLOYEE ASSIGNMENTS REQUEST");
    
    // New assignments (with employeeAssignment field)
    const newAssignments = await Shift.find({ 
      isMasterShift: false,
      isActive: true,
      "employeeAssignment.employeeId": { $exists: true }
    });
    
    // Legacy assignments (old format)
    const legacyAssignments = await Shift.find({ 
      employeeId: { $exists: true, $ne: null },
      isMasterShift: { $exists: false }
    });
    
    // Convert legacy to new format
    const convertedLegacy = legacyAssignments.map(legacy => {
      return {
        ...legacy.toObject(),
        isMasterShift: false,
        employeeAssignment: {
          employeeId: legacy.employeeId,
          employeeName: legacy.employeeName,
          selectedTimeRange: legacy.startTime && legacy.endTime ? `${legacy.startTime} - ${legacy.endTime}` : "Not specified",
          selectedDescription: `Legacy shift ${legacy.shiftType}`,
          startTime: legacy.startTime,
          endTime: legacy.endTime,
          assignedDate: legacy.createdAt
        }
      };
    });
    
    const allAssignments = [...newAssignments, ...convertedLegacy];
    
    console.log("✅ FOUND ASSIGNMENTS:", allAssignments.length);
    
    res.status(200).json({ 
      success: true,
      data: allAssignments
    });
  } catch (error) {
    console.error("❌ GET ASSIGNMENTS ERROR:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error"
    });
  }
};

// ✅ 4. ASSIGN SHIFT TO EMPLOYEE
exports.assignShiftToEmployee = async (req, res) => {
  try {
    console.log("📝 ASSIGN SHIFT REQUEST:", req.body);
    
    const { employeeId, employeeName, shiftType, selectedSlotId, selectedTimeRange, selectedDescription } = req.body;

    if (!employeeId || !employeeName || !shiftType) {
      return res.status(400).json({ 
        success: false,
        message: "Employee ID, Name and Shift Type are required" 
      });
    }

    // Check if employee already has a shift (new format)
    const existingNewAssignment = await Shift.findOne({ 
      "employeeAssignment.employeeId": employeeId,
      isActive: true 
    });
    
    // Check if employee already has a shift (legacy format)
    const existingLegacyAssignment = await Shift.findOne({ 
      employeeId: employeeId,
      isMasterShift: { $exists: false }
    });
    
    if (existingNewAssignment || existingLegacyAssignment) {
      return res.status(400).json({ 
        success: false,
        message: "This employee already has a shift assigned" 
      });
    }

    // Get master shift for details
    const masterShift = await Shift.findOne({ 
      shiftType: shiftType.toUpperCase(),
      isMasterShift: true
    });

    let timeRange = selectedTimeRange || "Not specified";
    let description = selectedDescription || "No description";
    
    // If master shift exists, use its time slots
    if (masterShift && selectedSlotId) {
      const selectedSlot = masterShift.timeSlots.find(slot => slot.slotId === selectedSlotId);
      if (selectedSlot) {
        timeRange = selectedSlot.timeRange;
        description = selectedSlot.description;
      }
    }

    // Create new assignment document
    const newAssignment = new Shift({
      shiftType: shiftType.toUpperCase(),
      shiftName: masterShift?.shiftName || shiftType,
      timeSlots: masterShift?.timeSlots || [],
      employeeAssignment: {
        employeeId: employeeId.trim(),
        employeeName: employeeName.trim(),
        selectedSlotId: selectedSlotId || null,
        selectedTimeRange: timeRange,
        selectedDescription: description,
        assignedDate: new Date()
      },
      isMasterShift: false,
      isActive: true
    });

    await newAssignment.save();
    
    console.log("✅ SHIFT ASSIGNED:", newAssignment);
    
    res.status(201).json({ 
      success: true,
      message: "Shift assigned successfully", 
      data: newAssignment 
    });
  } catch (error) {
    console.error("❌ ASSIGN SHIFT ERROR:", error);
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false,
        message: "This employee already has a shift assigned" 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: "Server error"
    });
  }
};

// ✅ 5. UPDATE ASSIGNMENT
exports.updateAssignment = async (req, res) => {
  try {
    console.log("📝 UPDATE ASSIGNMENT REQUEST - ID:", req.params.id);
    console.log("📝 UPDATE DATA:", req.body);
    
    const { id } = req.params;
    const { employeeName, shiftType, selectedSlotId, selectedTimeRange, selectedDescription } = req.body;

    // Find the assignment
    const assignment = await Shift.findById(id);
    if (!assignment) {
      return res.status(404).json({ 
        success: false,
        message: "Assignment not found" 
      });
    }

    // Get master shift for details
    const masterShift = await Shift.findOne({ 
      shiftType: shiftType.toUpperCase(),
      isMasterShift: true
    });

    // Update assignment
    if (assignment.employeeAssignment) {
      // New format
      assignment.employeeAssignment.employeeName = employeeName || assignment.employeeAssignment.employeeName;
      assignment.shiftType = shiftType.toUpperCase();
      assignment.shiftName = masterShift?.shiftName || shiftType;
      
      if (selectedSlotId) {
        assignment.employeeAssignment.selectedSlotId = selectedSlotId;
        assignment.employeeAssignment.selectedTimeRange = selectedTimeRange || assignment.employeeAssignment.selectedTimeRange;
        assignment.employeeAssignment.selectedDescription = selectedDescription || assignment.employeeAssignment.selectedDescription;
      }
    } else {
      // Legacy format
      assignment.employeeName = employeeName || assignment.employeeName;
      assignment.shiftType = shiftType.toUpperCase();
    }

    await assignment.save();
    
    console.log("✅ ASSIGNMENT UPDATED:", assignment);
    
    res.status(200).json({ 
      success: true,
      message: "Assignment updated successfully", 
      data: assignment 
    });
  } catch (error) {
    console.error("❌ UPDATE ASSIGNMENT ERROR:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error"
    });
  }
};

// ✅ 6. GET EMPLOYEES BY SHIFT TYPE (Legacy + New)
exports.getEmployeesByShiftType = async (req, res) => {
  try {
    const { shiftType } = req.params;
    
    console.log("📝 GET EMPLOYEES FOR SHIFT:", shiftType);
    
    // New assignments
    const newEmployees = await Shift.find({ 
      shiftType: shiftType.toUpperCase(),
      isMasterShift: false,
      isActive: true
    });
    
    // Legacy assignments
    const legacyEmployees = await Shift.find({ 
      shiftType: shiftType.toUpperCase(),
      employeeId: { $exists: true },
      isMasterShift: { $exists: false }
    });
    
    const allEmployees = [...newEmployees, ...legacyEmployees];
    
    const masterShift = await Shift.findOne({ 
      shiftType: shiftType.toUpperCase(),
      isMasterShift: true
    });

    res.status(200).json({ 
      success: true,
      data: {
        shiftType,
        shiftName: masterShift?.shiftName || shiftType,
        employees: allEmployees,
        totalEmployees: allEmployees.length
      }
    });
  } catch (error) {
    console.error("❌ GET EMPLOYEES ERROR:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error"
    });
  }
};

// ✅ 7. MIGRATE LEGACY DATA (Optional)
exports.migrateLegacyData = async (req, res) => {
  try {
    console.log("📝 MIGRATING LEGACY DATA");
    
    const legacyData = await Shift.find({ 
      employeeId: { $exists: true },
      isMasterShift: { $exists: false }
    });
    
    let migratedCount = 0;
    
    for (const legacy of legacyData) {
      // Check if already migrated
      const existing = await Shift.findOne({
        "employeeAssignment.employeeId": legacy.employeeId
      });
      
      if (!existing) {
        const masterShift = await Shift.findOne({
          shiftType: legacy.shiftType,
          isMasterShift: true
        });
        
        const migratedDoc = new Shift({
          shiftType: legacy.shiftType,
          shiftName: masterShift?.shiftName || legacy.shiftType,
          timeSlots: masterShift?.timeSlots || [],
          employeeAssignment: {
            employeeId: legacy.employeeId,
            employeeName: legacy.employeeName,
            selectedTimeRange: legacy.startTime && legacy.endTime ? `${legacy.startTime} - ${legacy.endTime}` : "Not specified",
            selectedDescription: `Migrated from legacy system`,
            startTime: legacy.startTime,
            endTime: legacy.endTime,
            assignedDate: legacy.createdAt
          },
          isMasterShift: false,
          isActive: true,
          createdAt: legacy.createdAt,
          updatedAt: new Date()
        });
        
        await migratedDoc.save();
        migratedCount++;
      }
    }
    
    console.log(`✅ MIGRATED ${migratedCount} LEGACY RECORDS`);
    
    res.status(200).json({ 
      success: true,
      message: `Migrated ${migratedCount} legacy records`,
      migratedCount
    });
  } catch (error) {
    console.error("❌ MIGRATION ERROR:", error);
    res.status(500).json({ 
      success: false,
      message: "Migration failed"
    });
  }
};

// ✅ 8. DELETE MASTER SHIFT
exports.deleteMasterShift = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("🗑️ DELETE MASTER SHIFT ID:", id);

    const deletedShift = await Shift.findOneAndDelete({
      _id: id,
      isMasterShift: true
    });

    if (!deletedShift) {
      return res.status(404).json({
        success: false,
        message: "Master shift not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Master shift deleted successfully"
    });
  } catch (error) {
    console.error("❌ DELETE MASTER SHIFT ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// ✅ 9. DELETE ASSIGNMENT
exports.deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("🗑️ DELETE ASSIGNMENT ID:", id);

    const deletedAssignment = await Shift.findOneAndDelete({
      _id: id,
      isMasterShift: false
    });

    if (!deletedAssignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Assignment deleted successfully"
    });
  } catch (error) {
    console.error("❌ DELETE ASSIGNMENT ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// ✅ 10. GET SHIFT FOR SPECIFIC EMPLOYEE (Employee Dashboard)
// controller/shift.controller.js में नीचे ये function add करें
// controller/shift.controller.js के अंत में ये function add करें

// ✅ 10. GET SHIFT FOR SPECIFIC EMPLOYEE (Employee Dashboard) - NEW FUNCTION
exports.getShiftForEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    console.log("📝 GET SHIFT FOR EMPLOYEE:", employeeId);
    
    if (!employeeId) {
      return res.status(400).json({ 
        success: false,
        message: "Employee ID is required" 
      });
    }

    // Find employee shift in new format
    let employeeShift = await Shift.findOne({ 
      "employeeAssignment.employeeId": employeeId,
      isActive: true,
      isMasterShift: false
    });

    console.log("🔍 Found shift in new format:", employeeShift ? "Yes" : "No");

    // If not found, check legacy format
    if (!employeeShift) {
      employeeShift = await Shift.findOne({ 
        employeeId: employeeId,
        isMasterShift: { $exists: false }
      });
      console.log("🔍 Found shift in legacy format:", employeeShift ? "Yes" : "No");
    }

    if (!employeeShift) {
      return res.status(404).json({ 
        success: false,
        message: "No shift assigned to this employee",
        data: null
      });
    }

    // Prepare response based on format
    let responseData = {
      _id: employeeShift._id,
      shiftType: employeeShift.shiftType,
      shiftName: employeeShift.shiftName || `Shift ${employeeShift.shiftType}`,
      isAssigned: true
    };

    // New format (with employeeAssignment)
    if (employeeShift.employeeAssignment) {
      const timeRange = employeeShift.employeeAssignment.selectedTimeRange || "10:00 - 19:00";
      const [startTime, endTime] = timeRange.split(" - ");
      
      responseData.startTime = startTime ? startTime.trim() : "10:00";
      responseData.endTime = endTime ? endTime.trim() : "19:00";
      responseData.timeRange = timeRange;
      responseData.description = employeeShift.employeeAssignment.selectedDescription || "Shift timing";
      responseData.assignedDate = employeeShift.employeeAssignment.assignedDate;
    } 
    // Legacy format
    else if (employeeShift.startTime && employeeShift.endTime) {
      responseData.startTime = employeeShift.startTime;
      responseData.endTime = employeeShift.endTime;
      responseData.timeRange = `${employeeShift.startTime} - ${employeeShift.endTime}`;
      responseData.description = "Legacy shift assignment";
      responseData.assignedDate = employeeShift.createdAt;
    }
    // Default
    else {
      responseData.startTime = "10:00";
      responseData.endTime = "19:00";
      responseData.timeRange = "10:00 - 19:00";
      responseData.description = "Shift timing";
      responseData.assignedDate = employeeShift.createdAt;
    }

    console.log("✅ Sending response for employee:", employeeId);

    res.status(200).json({ 
      success: true,
      data: responseData
    });
    
  } catch (error) {
    console.error("❌ GET SHIFT FOR EMPLOYEE ERROR:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error",
      error: error.message 
    });
  }
};