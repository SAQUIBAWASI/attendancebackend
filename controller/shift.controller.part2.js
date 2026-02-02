
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
    
    // ✅ Filter out inactive employees
    const activeEmployees = await Promise.all(allEmployees.map(async (assignment) => {
        const empId = assignment.employeeAssignment?.employeeId || assignment.employeeId;
        if (!empId) return null;
        const emp = await Employee.findOne({ employeeId: empId });
        return emp && emp.status !== 'inactive' ? assignment : null;
    }));
    
    const validEmployees = activeEmployees.filter(a => a !== null);
    
    const masterShift = await Shift.findOne({ 
      shiftType: shiftType.toUpperCase(),
      isMasterShift: true
    });

    res.status(200).json({ 
      success: true,
      data: {
        shiftType,
        shiftName: masterShift?.shiftName || shiftType,
        isBrakeShift: masterShift?.isBrakeShift || false, // ✅ Include isBrakeShift
        employees: validEmployees,
        totalEmployees: validEmployees.length
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

// ✅ NEW: GET EMPLOYEE COUNT BY SHIFT TYPE
exports.getEmployeeCountByShift = async (req, res) => {
  try {
    console.log("📝 GET EMPLOYEE COUNT BY SHIFT REQUEST");
    
    // Get all master shifts
    const masterShifts = await Shift.find({ 
      isMasterShift: true,
      isActive: true
    }).sort({ shiftType: 1 });
    
    // Get employee counts for each shift type
    const shiftCounts = await Promise.all(
      masterShifts.map(async (shift) => {
        // New format assignments
        const newAssignmentShifts = await Shift.find({
          shiftType: shift.shiftType,
          isMasterShift: false,
          isActive: true,
          "employeeAssignment.employeeId": { $exists: true }
        });
        
        // Filter out inactive employees
        const activeNewShifts = await Promise.all(newAssignmentShifts.map(async (s) => {
           const emp = await Employee.findOne({ employeeId: s.employeeAssignment.employeeId });
           return emp && emp.status !== 'inactive' ? s : null;
        }));
        const newCount = activeNewShifts.filter(s => s !== null).length;
        
        // Legacy format assignments
        const legacyAssignmentShifts = await Shift.find({
          shiftType: shift.shiftType,
          employeeId: { $exists: true },
          isMasterShift: { $exists: false }
        });

        const activeLegacyShifts = await Promise.all(legacyAssignmentShifts.map(async (s) => {
           const emp = await Employee.findOne({ employeeId: s.employeeId });
           return emp && emp.status !== 'inactive' ? s : null;
        }));
        const legacyCount = activeLegacyShifts.filter(s => s !== null).length;
        
        // Format time display for brake shift
        let timeDisplay = "";
        if (shift.isBrakeShift && shift.timeSlots.length > 1) {
          timeDisplay = `${shift.timeSlots[0].timeRange} - ${shift.timeSlots[1].timeRange}`;
        } else if (shift.timeSlots.length > 0) {
          timeDisplay = shift.timeSlots[0].timeRange;
        }
        
        return {
          shiftType: shift.shiftType,
          shiftName: shift.shiftName,
          isBrakeShift: shift.isBrakeShift || false, // ✅ Include isBrakeShift
          totalEmployees: newCount + legacyCount,
          timeSlot: timeDisplay || "Not specified"
        };
      })
    );
    
    // Also include legacy shifts that don't have master shift
    const legacyShiftTypes = await Shift.distinct("shiftType", {
      employeeId: { $exists: true },
      isMasterShift: { $exists: false }
    });
    
    for (const shiftType of legacyShiftTypes) {
      if (!shiftCounts.find(s => s.shiftType === shiftType)) {
        const legacyCount = await Shift.countDocuments({
          shiftType: shiftType,
          employeeId: { $exists: true },
          isMasterShift: { $exists: false }
        });
        
        shiftCounts.push({
          shiftType: shiftType,
          shiftName: `Shift ${shiftType} (Legacy)`,
          isBrakeShift: false,
          totalEmployees: legacyCount,
          timeSlot: "Legacy timing"
        });
      }
    }
    
    res.status(200).json({ 
      success: true,
      data: shiftCounts.sort((a, b) => a.shiftType.localeCompare(b.shiftType))
    });
  } catch (error) {
    console.error("❌ GET EMPLOYEE COUNT ERROR:", error);
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
          isBrakeShift: masterShift?.isBrakeShift || false, // ✅ Include isBrakeShift
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
      isBrakeShift: employeeShift.isBrakeShift || false, // ✅ Include isBrakeShift
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

// ✅ 11. CREATE DEFAULT SHIFTS (A-D) + BRAKE SHIFT
exports.createDefaultShifts = async (req, res) => {
  try {
    console.log("📝 CREATING DEFAULT SHIFTS A-D + BRAKE SHIFT");
    
    const defaultShifts = [
      {
        shiftType: "A",
        shiftName: "Morning Shift",
        timeSlots: [{ slotId: "A1", timeRange: "06:00 - 14:00", description: "Morning 6 to 2" }],
        isBrakeShift: false
      },
      {
        shiftType: "B",
        shiftName: "Evening Shift",
        timeSlots: [{ slotId: "B1", timeRange: "14:00 - 22:00", description: "Evening 2 to 10" }],
        isBrakeShift: false
      },
      {
        shiftType: "C",
        shiftName: "Night Shift",
        timeSlots: [{ slotId: "C1", timeRange: "22:00 - 06:00", description: "Night 10 to 6" }],
        isBrakeShift: false
      },
      {
        shiftType: "D",
        shiftName: "General Shift",
        timeSlots: [{ slotId: "D1", timeRange: "09:00 - 18:00", description: "General 9 to 6" }],
        isBrakeShift: false
      },
      {
        shiftType: "BR", // ✅ BRAKE SHIFT
        shiftName: "Brake Shift",
        timeSlots: [
          { slotId: "BR1", timeRange: "07:00 - 13:00", description: "First shift before break" },
          { slotId: "BR2", timeRange: "17:00 - 21:30", description: "Second shift after break" }
        ],
        isBrakeShift: true
      }
    ];
    
    let createdCount = 0;
    
    for (const shiftData of defaultShifts) {
      // Check if shift already exists
      const existingShift = await Shift.findOne({ 
        shiftType: shiftData.shiftType,
        isMasterShift: true,
        isBrakeShift: shiftData.isBrakeShift || false
      });
      
      if (!existingShift) {
        const newShift = new Shift({
          shiftType: shiftData.shiftType,
          shiftName: shiftData.shiftName,
          timeSlots: shiftData.timeSlots,
          isBrakeShift: shiftData.isBrakeShift || false,
          isMasterShift: true,
          isActive: true
        });
        
        await newShift.save();
        createdCount++;
        console.log(`✅ Created ${shiftData.isBrakeShift ? 'brake ' : ''}shift: ${shiftData.shiftType}`);
      }
    }
    
    res.status(200).json({ 
      success: true,
      message: `Created ${createdCount} default shifts`,
      createdCount
    });
  } catch (error) {
    console.error("❌ CREATE DEFAULT SHIFTS ERROR:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error"
    });
  }
};

// ✅ 12. GET SHIFT DETAILS WITH PROPER TIME DISPLAY
exports.getShiftDetails = async (req, res) => {
  try {
    const { shiftType } = req.params;
    
    const shift = await Shift.findOne({ 
      shiftType: shiftType.toUpperCase(),
      isMasterShift: true
    });
    
    if (!shift) {
      return res.status(404).json({
        success: false,
        message: "Shift not found"
      });
    }
    
    // Format time display for brake shift
    let timeDisplay = "";
    if (shift.isBrakeShift && shift.timeSlots.length > 1) {
      timeDisplay = `${shift.timeSlots[0].timeRange} - ${shift.timeSlots[1].timeRange}`;
    } else if (shift.timeSlots.length > 0) {
      timeDisplay = shift.timeSlots[0].timeRange;
    }
    
    res.status(200).json({
      success: true,
      data: {
        ...shift.toObject(),
        timeDisplay: timeDisplay
      }
    });
  } catch (error) {
    console.error("❌ GET SHIFT DETAILS ERROR:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error"
    });
  }
};
