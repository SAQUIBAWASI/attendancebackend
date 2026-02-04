const Shift = require("../models/Shift");
const Employee = require("../models/Employee");
const Notification = require("../models/Notification"); // ✅ Import Notification
const { sendPushToUser } = require("./notification.controller"); // ✅ Import Push Helper

console.log("✅ Shift Controller Loaded");

// ✅ 1. CREATE MASTER SHIFT WITH SINGLE TIME SLOT
exports.createMasterShift = async (req, res) => {
  try {
    console.log("📝 CREATE MASTER SHIFT REQUEST:", req.body);
    
    const { shiftType, shiftName, timeSlots, isBrakeShift } = req.body;

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

    // ✅ MODIFIED: Handle Brake Shift or Single Slot
    let finalTimeSlots = [];
    
    if (isBrakeShift) {
      // ✅ SPECIAL HANDLING FOR BRAKE SHIFT
      // Create multiple time slots for brake shift
      finalTimeSlots = [
        {
          slotId: `${shiftType.toUpperCase()}1`,
          timeRange: "07:00 - 13:00",
          description: "First shift with break"
        },
        {
          slotId: `${shiftType.toUpperCase()}2`,
          timeRange: "17:00 - 21:30",
          description: "Second shift after break"
        }
      ];
    } else if (timeSlots && timeSlots.length > 0) {
      // Take only the first time slot
      const firstSlot = timeSlots[0];
      if (firstSlot.timeRange && firstSlot.description) {
        finalTimeSlots = [{
          slotId: `${shiftType.toUpperCase()}1`,
          timeRange: firstSlot.timeRange,
          description: firstSlot.description
        }];
      }
    } else {
      // Default single time slot
      finalTimeSlots = [{
        slotId: `${shiftType.toUpperCase()}1`,
        timeRange: "09:00 - 18:00",
        description: `${shiftName} timing`
      }];
    }

    const newShift = new Shift({
      shiftType: shiftType.toUpperCase(),
      shiftName,
      timeSlots: finalTimeSlots,
      isBrakeShift: isBrakeShift || false, // ✅ New field
      isMasterShift: true,
      isActive: true
    });

    await newShift.save();
    
    console.log("✅ MASTER SHIFT CREATED (Single Slot):", newShift);
    
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

    // ✅ Filter out inactive employees
    const activeAssignments = await Promise.all(allAssignments.map(async (assignment) => {
        const empId = assignment.employeeAssignment?.employeeId || assignment.employeeId;
        if (!empId) return null;
        const emp = await Employee.findOne({ employeeId: empId });
        return emp && emp.status !== 'inactive' ? assignment : null;
    }));
    
    const validAssignments = activeAssignments.filter(a => a !== null);
    
    console.log("✅ FOUND ASSIGNMENTS:", validAssignments.length);
    
    res.status(200).json({ 
      success: true,
      data: validAssignments
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
    
    // If master shift exists, use its time slot
    if (masterShift && masterShift.timeSlots && masterShift.timeSlots.length > 0) {
      if (masterShift.isBrakeShift && masterShift.timeSlots.length > 1) {
        timeRange = `${masterShift.timeSlots[0].timeRange} - ${masterShift.timeSlots[1].timeRange}`;
        description = "Brake shift with afternoon break";
      } else {
        // Regular shift - use the first time slot
        const timeSlot = masterShift.timeSlots[0];
        timeRange = timeSlot.timeRange;
        description = timeSlot.description;
      }
    }

    // Create new assignment document
    const newAssignment = new Shift({
      shiftType: shiftType.toUpperCase(),
      shiftName: masterShift?.shiftName || shiftType,
      timeSlots: masterShift?.timeSlots || [],
      isBrakeShift: masterShift?.isBrakeShift || false, // ✅ Included isBrakeShift field
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

    // 🔔 NOTIFY EMPLOYEE
    await Notification.create({
      userId: employeeId,
      role: "employee",
      title: "New Shift Assigned",
      message: `You have been assigned to Shift ${shiftType} (${timeRange})`,
      type: "attendance"
    });
    
    sendPushToUser(employeeId, {
      title: "Shift Assigned",
      body: `Admin assigned you Shift ${shiftType}`,
      url: "/employee/dashboard"
    });
    
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
      assignment.isBrakeShift = masterShift?.isBrakeShift || false; // ✅ Update isBrakeShift
      
      // ✅ MODIFIED: For brake shift, combine both time slots
      if (masterShift && masterShift.timeSlots && masterShift.timeSlots.length > 0) {
        if (masterShift.isBrakeShift && masterShift.timeSlots.length > 1) {
          assignment.employeeAssignment.selectedTimeRange = `${masterShift.timeSlots[0].timeRange} - ${masterShift.timeSlots[1].timeRange}`;
          assignment.employeeAssignment.selectedDescription = "Brake shift with afternoon break";
        } else {
          // Regular shift - use first time slot
          const timeSlot = masterShift.timeSlots[0];
          assignment.employeeAssignment.selectedTimeRange = timeSlot.timeRange;
          assignment.employeeAssignment.selectedDescription = timeSlot.description;
        }
      }
    } else {
      // Legacy format
      assignment.employeeName = employeeName || assignment.employeeName;
      assignment.shiftType = shiftType.toUpperCase();
    }

    await assignment.save();
    
    console.log("✅ ASSIGNMENT UPDATED:", assignment);

    // 🔔 NOTIFY EMPLOYEE
    const empId = assignment.employeeAssignment?.employeeId || assignment.employeeId;
    if (empId) {
       await Notification.create({
        userId: empId,
        role: "employee",
        title: "Shift Updated",
        message: `Your shift has been changed to Shift ${shiftType}`,
        type: "attendance"
      });
      
      sendPushToUser(empId, {
        title: "Shift Updated",
        body: `Admin updated your shift to ${shiftType}`,
        url: "/employee/dashboard"
      });
    }
    
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
