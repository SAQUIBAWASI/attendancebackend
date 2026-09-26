// const Shift = require("../models/Shift");
// const Employee = require("../models/Employee");
// const Notification = require("../models/Notification"); // ✅ Import Notification
// const { sendPushToUser } = require("./notification.controller"); // ✅ Import Push Helper

// console.log("✅ Shift Controller Loaded");

// // ✅ 1. CREATE MASTER SHIFT WITH SINGLE TIME SLOT
// exports.createMasterShift = async (req, res) => {
//   try {
//     console.log("📝 CREATE MASTER SHIFT REQUEST:", req.body);
    
//     const { shiftType, shiftName, timeSlots, isBrakeShift } = req.body;

//     if (!shiftType || !shiftName) {
//       return res.status(400).json({ 
//         success: false,
//         message: "Shift Type and Name are required" 
//       });
//     }

//     // Check if shift type already exists
//     const existingShift = await Shift.findOne({ 
//       shiftType: shiftType.toUpperCase(),
//       isMasterShift: true
//     });

//     if (existingShift) {
//       return res.status(400).json({ 
//         success: false,
//         message: `Shift ${shiftType} already exists.` 
//       });
//     }

//     // ✅ MODIFIED: Handle Brake Shift or Single Slot
//     let finalTimeSlots = [];
    
//     if (isBrakeShift) {
//       // ✅ SPECIAL HANDLING FOR BRAKE SHIFT
//       // Create multiple time slots for brake shift
//       finalTimeSlots = [
//         {
//           slotId: `${shiftType.toUpperCase()}1`,
//           timeRange: "07:00 - 13:00",
//           description: "First shift with break"
//         },
//         {
//           slotId: `${shiftType.toUpperCase()}2`,
//           timeRange: "17:00 - 21:30",
//           description: "Second shift after break"
//         }
//       ];
//     } else if (timeSlots && timeSlots.length > 0) {
//       // Take only the first time slot
//       const firstSlot = timeSlots[0];
//       if (firstSlot.timeRange && firstSlot.description) {
//         finalTimeSlots = [{
//           slotId: `${shiftType.toUpperCase()}1`,
//           timeRange: firstSlot.timeRange,
//           description: firstSlot.description
//         }];
//       }
//     } else {
//       // Default single time slot
//       finalTimeSlots = [{
//         slotId: `${shiftType.toUpperCase()}1`,
//         timeRange: "09:00 - 18:00",
//         description: `${shiftName} timing`
//       }];
//     }

//     const newShift = new Shift({
//       shiftType: shiftType.toUpperCase(),
//       shiftName,
//       timeSlots: finalTimeSlots,
//       isBrakeShift: isBrakeShift || false, // ✅ New field
//       isMasterShift: true,
//       isActive: true
//     });

//     await newShift.save();
    
//     console.log("✅ MASTER SHIFT CREATED (Single Slot):", newShift);
    
//     res.status(201).json({ 
//       success: true,
//       message: "Shift created successfully", 
//       data: newShift 
//     });
//   } catch (error) {
//     console.error("❌ CREATE SHIFT ERROR:", error);
//     res.status(500).json({ 
//       success: false,
//       message: "Server error",
//       error: error.message 
//     });
//   }
// };

// // ✅ 2. GET ALL MASTER SHIFTS
// exports.getMasterShifts = async (req, res) => {
//   try {
//     console.log("📝 GET MASTER SHIFTS REQUEST");
    
//     const masterShifts = await Shift.find({ 
//       isMasterShift: true,
//       isActive: true
//     }).sort({ shiftType: 1 });

//     console.log("✅ FOUND MASTER SHIFTS:", masterShifts.length);
    
//     res.status(200).json({ 
//       success: true,
//       data: masterShifts
//     });
//   } catch (error) {
//     console.error("❌ GET MASTER SHIFTS ERROR:", error);
//     res.status(500).json({ 
//       success: false,
//       message: "Server error"
//     });
//   }
// };

// // ✅ 3. GET ALL EMPLOYEE ASSIGNMENTS (Legacy + New data)
// exports.getEmployeeAssignments = async (req, res) => {
//   try {
//     console.log("📝 GET EMPLOYEE ASSIGNMENTS REQUEST");
    
//     // New assignments (with employeeAssignment field)
//     const newAssignments = await Shift.find({ 
//       isMasterShift: false,
//       isActive: true,
//       "employeeAssignment.employeeId": { $exists: true }
//     });
    
//     // Legacy assignments (old format)
//     const legacyAssignments = await Shift.find({ 
//       employeeId: { $exists: true, $ne: null },
//       isMasterShift: { $exists: false }
//     });
    
//     // Convert legacy to new format
//     const convertedLegacy = legacyAssignments.map(legacy => {
//       return {
//         ...legacy.toObject(),
//         isMasterShift: false,
//         employeeAssignment: {
//           employeeId: legacy.employeeId,
//           employeeName: legacy.employeeName,
//           selectedTimeRange: legacy.startTime && legacy.endTime ? `${legacy.startTime} - ${legacy.endTime}` : "Not specified",
//           selectedDescription: `Legacy shift ${legacy.shiftType}`,
//           startTime: legacy.startTime,
//           endTime: legacy.endTime,
//           assignedDate: legacy.createdAt
//         }
//       };
//     });
    
//     const allAssignments = [...newAssignments, ...convertedLegacy];

//     // ✅ Filter out inactive employees
//     const activeAssignments = await Promise.all(allAssignments.map(async (assignment) => {
//         const empId = assignment.employeeAssignment?.employeeId || assignment.employeeId;
//         if (!empId) return null;
//         const emp = await Employee.findOne({ employeeId: empId });
//         return emp && emp.status !== 'inactive' ? assignment : null;
//     }));
    
//     const validAssignments = activeAssignments.filter(a => a !== null);
    
//     console.log("✅ FOUND ASSIGNMENTS:", validAssignments.length);
    
//     res.status(200).json({ 
//       success: true,
//       data: validAssignments
//     });
//   } catch (error) {
//     console.error("❌ GET ASSIGNMENTS ERROR:", error);
//     res.status(500).json({ 
//       success: false,
//       message: "Server error"
//     });
//   }
// };

// // ✅ 4. ASSIGN SHIFT TO EMPLOYEE
// exports.assignShiftToEmployee = async (req, res) => {
//   try {
//     console.log("📝 ASSIGN SHIFT REQUEST:", req.body);
    
//     const { employeeId, employeeName, shiftType, selectedSlotId, selectedTimeRange, selectedDescription } = req.body;

//     if (!employeeId || !employeeName || !shiftType) {
//       return res.status(400).json({ 
//         success: false,
//         message: "Employee ID, Name and Shift Type are required" 
//       });
//     }

//     // Check if employee already has a shift (new format)
//     const existingNewAssignment = await Shift.findOne({ 
//       "employeeAssignment.employeeId": employeeId,
//       isActive: true 
//     });
    
//     // Check if employee already has a shift (legacy format)
//     const existingLegacyAssignment = await Shift.findOne({ 
//       employeeId: employeeId,
//       isMasterShift: { $exists: false }
//     });
    
//     if (existingNewAssignment || existingLegacyAssignment) {
//       return res.status(400).json({ 
//         success: false,
//         message: "This employee already has a shift assigned" 
//       });
//     }

//     // Get master shift for details
//     const masterShift = await Shift.findOne({ 
//       shiftType: shiftType.toUpperCase(),
//       isMasterShift: true
//     });

//     let timeRange = selectedTimeRange || "Not specified";
//     let description = selectedDescription || "No description";
    
//     // If master shift exists, use its time slot
//     if (masterShift && masterShift.timeSlots && masterShift.timeSlots.length > 0) {
//       if (masterShift.isBrakeShift && masterShift.timeSlots.length > 1) {
//         timeRange = `${masterShift.timeSlots[0].timeRange} - ${masterShift.timeSlots[1].timeRange}`;
//         description = "Brake shift with afternoon break";
//       } else {
//         // Regular shift - use the first time slot
//         const timeSlot = masterShift.timeSlots[0];
//         timeRange = timeSlot.timeRange;
//         description = timeSlot.description;
//       }
//     }

//     // Create new assignment document
//     const newAssignment = new Shift({
//       shiftType: shiftType.toUpperCase(),
//       shiftName: masterShift?.shiftName || shiftType,
//       timeSlots: masterShift?.timeSlots || [],
//       isBrakeShift: masterShift?.isBrakeShift || false, // ✅ Added isBrakeShift
//       employeeAssignment: {
//         employeeId: employeeId.trim(),
//         employeeName: employeeName.trim(),
//         selectedSlotId: selectedSlotId || null,
//         selectedTimeRange: timeRange,
//         selectedDescription: description,
//         assignedDate: new Date()
//       },
//       isMasterShift: false,
//       isActive: true
//     });

//     await newAssignment.save();
    
//     console.log("✅ SHIFT ASSIGNED:", newAssignment);

//     // 🔔 NOTIFY EMPLOYEE
//     await Notification.create({
//       userId: employeeId,
//       role: "employee",
//       title: "New Shift Assigned",
//       message: `You have been assigned to Shift ${shiftType} (${timeRange})`,
//       type: "attendance"
//     });
    
//     sendPushToUser(employeeId, {
//       title: "Shift Assigned",
//       body: `Admin assigned you Shift ${shiftType}`,
//       url: "/employee/dashboard"
//     });
    
//     res.status(201).json({ 
//       success: true,
//       message: "Shift assigned successfully", 
//       data: newAssignment 
//     });
//   } catch (error) {
//     console.error("❌ ASSIGN SHIFT ERROR:", error);
    
//     if (error.code === 11000) {
//       return res.status(400).json({ 
//         success: false,
//         message: "This employee already has a shift assigned" 
//       });
//     }
    
//     res.status(500).json({ 
//       success: false,
//       message: "Server error"
//     });
//   }
// };

// // ✅ 5. UPDATE ASSIGNMENT
// exports.updateAssignment = async (req, res) => {
//   try {
//     console.log("📝 UPDATE ASSIGNMENT REQUEST - ID:", req.params.id);
//     console.log("📝 UPDATE DATA:", req.body);
    
//     const { id } = req.params;
//     const { employeeName, shiftType, selectedSlotId, selectedTimeRange, selectedDescription } = req.body;

//     // Find the assignment
//     const assignment = await Shift.findById(id);
//     if (!assignment) {
//       return res.status(404).json({ 
//         success: false,
//         message: "Assignment not found" 
//       });
//     }

//     // Get master shift for details
//     const masterShift = await Shift.findOne({ 
//       shiftType: shiftType.toUpperCase(),
//       isMasterShift: true
//     });

//     // Update assignment
//     if (assignment.employeeAssignment) {
//       // New format
//       assignment.employeeAssignment.employeeName = employeeName || assignment.employeeAssignment.employeeName;
//       assignment.shiftType = shiftType.toUpperCase();
//       assignment.shiftName = masterShift?.shiftName || shiftType;
//       assignment.isBrakeShift = masterShift?.isBrakeShift || false; // ✅ Update isBrakeShift
      
//       // ✅ MODIFIED: For brake shift, combine both time slots
//       if (masterShift && masterShift.timeSlots && masterShift.timeSlots.length > 0) {
//         if (masterShift.isBrakeShift && masterShift.timeSlots.length > 1) {
//           assignment.employeeAssignment.selectedTimeRange = `${masterShift.timeSlots[0].timeRange} - ${masterShift.timeSlots[1].timeRange}`;
//           assignment.employeeAssignment.selectedDescription = "Brake shift with afternoon break";
//         } else {
//           // Regular shift - use first time slot
//           const timeSlot = masterShift.timeSlots[0];
//           assignment.employeeAssignment.selectedTimeRange = timeSlot.timeRange;
//           assignment.employeeAssignment.selectedDescription = timeSlot.description;
//         }
//       }
//     } else {
//       // Legacy format
//       assignment.employeeName = employeeName || assignment.employeeName;
//       assignment.shiftType = shiftType.toUpperCase();
//     }

//     await assignment.save();
    
//     console.log("✅ ASSIGNMENT UPDATED:", assignment);

//     // 🔔 NOTIFY EMPLOYEE
//     const empId = assignment.employeeAssignment?.employeeId || assignment.employeeId;
//     if (empId) {
//        await Notification.create({
//         userId: empId,
//         role: "employee",
//         title: "Shift Updated",
//         message: `Your shift has been changed to Shift ${shiftType}`,
//         type: "attendance"
//       });
      
//       sendPushToUser(empId, {
//         title: "Shift Updated",
//         body: `Admin updated your shift to ${shiftType}`,
//         url: "/employee/dashboard"
//       });
//     }
    
//     res.status(200).json({ 
//       success: true,
//       message: "Assignment updated successfully", 
//       data: assignment 
//     });
//   } catch (error) {
//     console.error("❌ UPDATE ASSIGNMENT ERROR:", error);
//     res.status(500).json({ 
//       success: false,
//       message: "Server error"
//     });
//   }
// };

// // ✅ 6. GET EMPLOYEES BY SHIFT TYPE (Legacy + New)
// exports.getEmployeesByShiftType = async (req, res) => {
//   try {
//     const { shiftType } = req.params;
    
//     console.log("📝 GET EMPLOYEES FOR SHIFT:", shiftType);
    
//     // New assignments
//     const newEmployees = await Shift.find({ 
//       shiftType: shiftType.toUpperCase(),
//       isMasterShift: false,
//       isActive: true
//     });
    
//     // Legacy assignments
//     const legacyEmployees = await Shift.find({ 
//       shiftType: shiftType.toUpperCase(),
//       employeeId: { $exists: true },
//       isMasterShift: { $exists: false }
//     });
    
//     const allEmployees = [...newEmployees, ...legacyEmployees];
    
//     // ✅ Filter out inactive employees
//     const activeEmployees = await Promise.all(allEmployees.map(async (assignment) => {
//         const empId = assignment.employeeAssignment?.employeeId || assignment.employeeId;
//         if (!empId) return null;
//         const emp = await Employee.findOne({ employeeId: empId });
//         return emp && emp.status !== 'inactive' ? assignment : null;
//     }));
    
//     const validEmployees = activeEmployees.filter(a => a !== null);
    
//     const masterShift = await Shift.findOne({ 
//       shiftType: shiftType.toUpperCase(),
//       isMasterShift: true
//     });

//     res.status(200).json({ 
//       success: true,
//       data: {
//         shiftType,
//         shiftName: masterShift?.shiftName || shiftType,
//         isBrakeShift: masterShift?.isBrakeShift || false, // ✅ Include isBrakeShift
//         employees: validEmployees,
//         totalEmployees: validEmployees.length
//       }
//     });
//   } catch (error) {
//     console.error("❌ GET EMPLOYEES ERROR:", error);
//     res.status(500).json({ 
//       success: false,
//       message: "Server error"
//     });
//   }
// };

// // ✅ NEW: GET EMPLOYEE COUNT BY SHIFT TYPE
// exports.getEmployeeCountByShift = async (req, res) => {
//   try {
//     console.log("📝 GET EMPLOYEE COUNT BY SHIFT REQUEST");
    
//     // Get all master shifts
//     const masterShifts = await Shift.find({ 
//       isMasterShift: true,
//       isActive: true
//     }).sort({ shiftType: 1 });
    
//     // Get employee counts for each shift type
//     const shiftCounts = await Promise.all(
//       masterShifts.map(async (shift) => {
//         // New format assignments
//         const newAssignmentShifts = await Shift.find({
//           shiftType: shift.shiftType,
//           isMasterShift: false,
//           isActive: true,
//           "employeeAssignment.employeeId": { $exists: true }
//         });
        
//         // Filter out inactive employees
//         const activeNewShifts = await Promise.all(newAssignmentShifts.map(async (s) => {
//            const emp = await Employee.findOne({ employeeId: s.employeeAssignment.employeeId });
//            return emp && emp.status !== 'inactive' ? s : null;
//         }));
//         const newCount = activeNewShifts.filter(s => s !== null).length;
        
//         // Legacy format assignments
//         const legacyAssignmentShifts = await Shift.find({
//           shiftType: shift.shiftType,
//           employeeId: { $exists: true },
//           isMasterShift: { $exists: false }
//         });

//         const activeLegacyShifts = await Promise.all(legacyAssignmentShifts.map(async (s) => {
//            const emp = await Employee.findOne({ employeeId: s.employeeId });
//            return emp && emp.status !== 'inactive' ? s : null;
//         }));
//         const legacyCount = activeLegacyShifts.filter(s => s !== null).length;
        
//         // Format time display for brake shift
//         let timeDisplay = "";
//         if (shift.isBrakeShift && shift.timeSlots.length > 1) {
//           timeDisplay = `${shift.timeSlots[0].timeRange} - ${shift.timeSlots[1].timeRange}`;
//         } else if (shift.timeSlots.length > 0) {
//           timeDisplay = shift.timeSlots[0].timeRange;
//         }
        
//         return {
//           shiftType: shift.shiftType,
//           shiftName: shift.shiftName,
//           isBrakeShift: shift.isBrakeShift || false, // ✅ Include isBrakeShift
//           totalEmployees: newCount + legacyCount,
//           timeSlot: timeDisplay || "Not specified"
//         };
//       })
//     );
    
//     // Also include legacy shifts that don't have master shift
//     const legacyShiftTypes = await Shift.distinct("shiftType", {
//       employeeId: { $exists: true },
//       isMasterShift: { $exists: false }
//     });
    
//     for (const shiftType of legacyShiftTypes) {
//       if (!shiftCounts.find(s => s.shiftType === shiftType)) {
//         const legacyCount = await Shift.countDocuments({
//           shiftType: shiftType,
//           employeeId: { $exists: true },
//           isMasterShift: { $exists: false }
//         });
        
//         shiftCounts.push({
//           shiftType: shiftType,
//           shiftName: `Shift ${shiftType} (Legacy)`,
//           isBrakeShift: false,
//           totalEmployees: legacyCount,
//           timeSlot: "Legacy timing"
//         });
//       }
//     }
    
//     res.status(200).json({ 
//       success: true,
//       data: shiftCounts.sort((a, b) => a.shiftType.localeCompare(b.shiftType))
//     });
//   } catch (error) {
//     console.error("❌ GET EMPLOYEE COUNT ERROR:", error);
//     res.status(500).json({ 
//       success: false,
//       message: "Server error"
//     });
//   }
// };

// // ✅ 7. MIGRATE LEGACY DATA (Optional)
// exports.migrateLegacyData = async (req, res) => {
//   try {
//     console.log("📝 MIGRATING LEGACY DATA");
    
//     const legacyData = await Shift.find({ 
//       employeeId: { $exists: true },
//       isMasterShift: { $exists: false }
//     });
    
//     let migratedCount = 0;
    
//     for (const legacy of legacyData) {
//       // Check if already migrated
//       const existing = await Shift.findOne({
//         "employeeAssignment.employeeId": legacy.employeeId
//       });
      
//       if (!existing) {
//         const masterShift = await Shift.findOne({
//           shiftType: legacy.shiftType,
//           isMasterShift: true
//         });
        
//         const migratedDoc = new Shift({
//           shiftType: legacy.shiftType,
//           shiftName: masterShift?.shiftName || legacy.shiftType,
//           timeSlots: masterShift?.timeSlots || [],
//           isBrakeShift: masterShift?.isBrakeShift || false, // ✅ Include isBrakeShift
//           employeeAssignment: {
//             employeeId: legacy.employeeId,
//             employeeName: legacy.employeeName,
//             selectedTimeRange: legacy.startTime && legacy.endTime ? `${legacy.startTime} - ${legacy.endTime}` : "Not specified",
//             selectedDescription: `Migrated from legacy system`,
//             startTime: legacy.startTime,
//             endTime: legacy.endTime,
//             assignedDate: legacy.createdAt
//           },
//           isMasterShift: false,
//           isActive: true,
//           createdAt: legacy.createdAt,
//           updatedAt: new Date()
//         });
        
//         await migratedDoc.save();
//         migratedCount++;
//       }
//     }
    
//     console.log(`✅ MIGRATED ${migratedCount} LEGACY RECORDS`);
    
//     res.status(200).json({ 
//       success: true,
//       message: `Migrated ${migratedCount} legacy records`,
//       migratedCount
//     });
//   } catch (error) {
//     console.error("❌ MIGRATION ERROR:", error);
//     res.status(500).json({ 
//       success: false,
//       message: "Migration failed"
//     });
//   }
// };

// // ✅ 8. DELETE MASTER SHIFT
// exports.deleteMasterShift = async (req, res) => {
//   try {
//     const { id } = req.params;

//     console.log("🗑️ DELETE MASTER SHIFT ID:", id);

//     const deletedShift = await Shift.findOneAndDelete({
//       _id: id,
//       isMasterShift: true
//     });

//     if (!deletedShift) {
//       return res.status(404).json({
//         success: false,
//         message: "Master shift not found"
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Master shift deleted successfully"
//     });
//   } catch (error) {
//     console.error("❌ DELETE MASTER SHIFT ERROR:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error"
//     });
//   }
// };

// // ✅ 9. DELETE ASSIGNMENT
// exports.deleteAssignment = async (req, res) => {
//   try {
//     const { id } = req.params;

//     console.log("🗑️ DELETE ASSIGNMENT ID:", id);

//     const deletedAssignment = await Shift.findOneAndDelete({
//       _id: id,
//       isMasterShift: false
//     });

//     if (!deletedAssignment) {
//       return res.status(404).json({
//         success: false,
//         message: "Assignment not found"
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Assignment deleted successfully"
//     });
//   } catch (error) {
//     console.error("❌ DELETE ASSIGNMENT ERROR:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error"
//     });
//   }
// };

// // ✅ 10. GET SHIFT FOR SPECIFIC EMPLOYEE (Employee Dashboard)
// exports.getShiftForEmployee = async (req, res) => {
//   try {
//     const { employeeId } = req.params;
    
//     console.log("📝 GET SHIFT FOR EMPLOYEE:", employeeId);
    
//     if (!employeeId) {
//       return res.status(400).json({ 
//         success: false,
//         message: "Employee ID is required" 
//       });
//     }

//     // Find employee shift in new format
//     let employeeShift = await Shift.findOne({ 
//       "employeeAssignment.employeeId": employeeId,
//       isActive: true,
//       isMasterShift: false
//     });

//     console.log("🔍 Found shift in new format:", employeeShift ? "Yes" : "No");

//     // If not found, check legacy format
//     if (!employeeShift) {
//       employeeShift = await Shift.findOne({ 
//         employeeId: employeeId,
//         isMasterShift: { $exists: false }
//       });
//       console.log("🔍 Found shift in legacy format:", employeeShift ? "Yes" : "No");
//     }

//     if (!employeeShift) {
//       return res.status(404).json({ 
//         success: false,
//         message: "No shift assigned to this employee",
//         data: null
//       });
//     }

//     // Prepare response based on format
//     let responseData = {
//       _id: employeeShift._id,
//       shiftType: employeeShift.shiftType,
//       shiftName: employeeShift.shiftName || `Shift ${employeeShift.shiftType}`,
//       isBrakeShift: employeeShift.isBrakeShift || false, // ✅ Include isBrakeShift
//       isAssigned: true
//     };

//     // New format (with employeeAssignment)
//     if (employeeShift.employeeAssignment) {
//       const timeRange = employeeShift.employeeAssignment.selectedTimeRange || "10:00 - 19:00";
//       const [startTime, endTime] = timeRange.split(" - ");
      
//       responseData.startTime = startTime ? startTime.trim() : "10:00";
//       responseData.endTime = endTime ? endTime.trim() : "19:00";
//       responseData.timeRange = timeRange;
//       responseData.description = employeeShift.employeeAssignment.selectedDescription || "Shift timing";
//       responseData.assignedDate = employeeShift.employeeAssignment.assignedDate;
//     } 
//     // Legacy format
//     else if (employeeShift.startTime && employeeShift.endTime) {
//       responseData.startTime = employeeShift.startTime;
//       responseData.endTime = employeeShift.endTime;
//       responseData.timeRange = `${employeeShift.startTime} - ${employeeShift.endTime}`;
//       responseData.description = "Legacy shift assignment";
//       responseData.assignedDate = employeeShift.createdAt;
//     }
//     // Default
//     else {
//       responseData.startTime = "10:00";
//       responseData.endTime = "19:00";
//       responseData.timeRange = "10:00 - 19:00";
//       responseData.description = "Shift timing";
//       responseData.assignedDate = employeeShift.createdAt;
//     }

//     console.log("✅ Sending response for employee:", employeeId);

//     res.status(200).json({ 
//       success: true,
//       data: responseData
//     });
    
//   } catch (error) {
//     console.error("❌ GET SHIFT FOR EMPLOYEE ERROR:", error);
//     res.status(500).json({ 
//       success: false,
//       message: "Server error",
//       error: error.message 
//     });
//   }
// };

// // ✅ 11. CREATE DEFAULT SHIFTS (A-D) + BRAKE SHIFT
// exports.createDefaultShifts = async (req, res) => {
//   try {
//     console.log("📝 CREATING DEFAULT SHIFTS A-D + BRAKE SHIFT");
    
//     const defaultShifts = [
//       {
//         shiftType: "A",
//         shiftName: "Morning Shift",
//         timeSlots: [{ slotId: "A1", timeRange: "06:00 - 14:00", description: "Morning 6 to 2" }],
//         isBrakeShift: false
//       },
//       {
//         shiftType: "B",
//         shiftName: "Evening Shift",
//         timeSlots: [{ slotId: "B1", timeRange: "14:00 - 22:00", description: "Evening 2 to 10" }],
//         isBrakeShift: false
//       },
//       {
//         shiftType: "C",
//         shiftName: "Night Shift",
//         timeSlots: [{ slotId: "C1", timeRange: "22:00 - 06:00", description: "Night 10 to 6" }],
//         isBrakeShift: false
//       },
//       {
//         shiftType: "D",
//         shiftName: "General Shift",
//         timeSlots: [{ slotId: "D1", timeRange: "09:00 - 18:00", description: "General 9 to 6" }],
//         isBrakeShift: false
//       },
//       {
//         shiftType: "BR", // ✅ BRAKE SHIFT
//         shiftName: "Brake Shift",
//         timeSlots: [
//           { slotId: "BR1", timeRange: "07:00 - 13:00", description: "First shift before break" },
//           { slotId: "BR2", timeRange: "17:00 - 21:30", description: "Second shift after break" }
//         ],
//         isBrakeShift: true
//       }
//     ];
    
//     let createdCount = 0;
    
//     for (const shiftData of defaultShifts) {
//       // Check if shift already exists
//       const existingShift = await Shift.findOne({ 
//         shiftType: shiftData.shiftType,
//         isMasterShift: true,
//         isBrakeShift: shiftData.isBrakeShift || false
//       });
      
//       if (!existingShift) {
//         const newShift = new Shift({
//           shiftType: shiftData.shiftType,
//           shiftName: shiftData.shiftName,
//           timeSlots: shiftData.timeSlots,
//           isBrakeShift: shiftData.isBrakeShift || false,
//           isMasterShift: true,
//           isActive: true
//         });
        
//         await newShift.save();
//         createdCount++;
//         console.log(`✅ Created ${shiftData.isBrakeShift ? 'brake ' : ''}shift: ${shiftData.shiftType}`);
//       }
//     }
    
//     res.status(200).json({ 
//       success: true,
//       message: `Created ${createdCount} default shifts`,
//       createdCount
//     });
//   } catch (error) {
//     console.error("❌ CREATE DEFAULT SHIFTS ERROR:", error);
//     res.status(500).json({ 
//       success: false,
//       message: "Server error"
//     });
//   }
// };

// // ✅ 12. GET SHIFT DETAILS WITH PROPER TIME DISPLAY
// exports.getShiftDetails = async (req, res) => {
//   try {
//     const { shiftType } = req.params;
    
//     const shift = await Shift.findOne({ 
//       shiftType: shiftType.toUpperCase(),
//       isMasterShift: true
//     });
    
//     if (!shift) {
//       return res.status(404).json({
//         success: false,
//         message: "Shift not found"
//       });
//     }
    
//     // Format time display for brake shift
//     let timeDisplay = "";
//     if (shift.isBrakeShift && shift.timeSlots.length > 1) {
//       timeDisplay = `${shift.timeSlots[0].timeRange} - ${shift.timeSlots[1].timeRange}`;
//     } else if (shift.timeSlots.length > 0) {
//       timeDisplay = shift.timeSlots[0].timeRange;
//     }
    
//     res.status(200).json({
//       success: true,
//       data: {
//         ...shift.toObject(),
//         timeDisplay: timeDisplay
//       }
//     });
//   } catch (error) {
//     console.error("❌ GET SHIFT DETAILS ERROR:", error);
//     res.status(500).json({ 
//       success: false,
//       message: "Server error"
//     });
//   }
// };


const Shift = require("../models/Shift");
const Employee = require("../models/Employee");
const Notification = require("../models/Notification");
const WeekOffDate = require("../models/WeekOffDate");
const WeekOff = require("../models/WeekOff");
const Attendance = require("../models/Attendance");
const Leave = require("../models/Leave");
const { sendPushToUser } = require("./notification.controller");

console.log("✅ Shift Controller Loaded");

const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const parseEffectiveFrom = (input) => {
  if (!input) return null;

  if (typeof input === "string") {
    const trimmed = input.trim();

    if (/^\d{4}-\d{2}(-\d{2})?$/.test(trimmed)) {
      const [year, month, day = "01"] = trimmed.split("-");
      return startOfDay(new Date(Number(year), Number(month) - 1, Number(day)));
    }

    const dmy = trimmed.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
    if (dmy) {
      return startOfDay(new Date(Number(dmy[3]), Number(dmy[2]) - 1, Number(dmy[1])));
    }
  }

  const parsed = startOfDay(new Date(input));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const getMasterShiftDetails = async (shiftType) => {
  const masterShift = await Shift.findOne({
    shiftType: shiftType.toUpperCase(),
    isMasterShift: true
  });

  let timeRange = "Not specified";
  let description = "No description";

  if (masterShift?.timeSlots?.length) {
    if (masterShift.isBrakeShift && masterShift.timeSlots.length > 1) {
      timeRange = `${masterShift.timeSlots[0].timeRange} - ${masterShift.timeSlots[1].timeRange}`;
      description = "Brake shift with afternoon break";
    } else {
      timeRange = masterShift.timeSlots[0].timeRange;
      description = masterShift.timeSlots[0].description;
    }
  }

  return { masterShift, timeRange, description };
};

const applyShiftTypeToAssignment = (assignment, shiftType, masterShift, timeRange, description) => {
  assignment.shiftType = shiftType.toUpperCase();
  assignment.shiftName = masterShift?.shiftName || shiftType;
  assignment.shiftCategory = masterShift?.shiftCategory || "Regular";
  assignment.isBrakeShift = masterShift?.isBrakeShift || false;
  assignment.timeSlots = masterShift?.timeSlots || [];

  if (assignment.employeeAssignment) {
    assignment.employeeAssignment.selectedTimeRange = timeRange;
    assignment.employeeAssignment.selectedDescription = description;
  }
};

const applyScheduledChangeIfDue = async (assignment) => {
  const scheduled = assignment.employeeAssignment?.scheduledChange;
  if (!scheduled?.shiftType || !scheduled?.effectiveFrom) return false;

  const effectiveDate = startOfDay(scheduled.effectiveFrom);
  if (effectiveDate > startOfDay(new Date())) return false;

  const { masterShift, timeRange, description } = await getMasterShiftDetails(scheduled.shiftType);
  applyShiftTypeToAssignment(assignment, scheduled.shiftType, masterShift, timeRange, description);

  if (assignment.employeeAssignment) {
    assignment.employeeAssignment.effectiveFrom = effectiveDate;
    delete assignment.employeeAssignment.scheduledChange;
    assignment.markModified("employeeAssignment");
  }

  await assignment.save();
  return true;
};

// ============================================================================
// ✅ COMP-OFF HELPERS — inline
// ============================================================================
const WEEK_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_MAP = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };

const toDateKey = (value) => {
  if (!value) return "";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDayLabel = (dateStr) => {
  const date = new Date(`${dateStr}T00:00:00`);
  return date.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });
};

const resolveDayName = (dayName) => {
  if (!dayName) return "";
  if (dayName.length === 3) {
    return WEEK_DAYS.find((d) => d.startsWith(dayName)) || dayName;
  }
  return dayName;
};

const calculateDatesFromPattern = (record, targetMonth = null) => {
  if (!record) return [];

  const hasSpecificMonths = Array.isArray(record.selectedMonths) && record.selectedMonths.length > 0;

  if (targetMonth && hasSpecificMonths && !record.selectedMonths.includes(targetMonth)) {
    if (Array.isArray(record.specificDates)) {
      return record.specificDates.filter((d) => d.startsWith(targetMonth));
    }
    return [];
  }

  const calculatedDates = [];
  let monthsToProcess = [];

  if (targetMonth) {
    monthsToProcess = [targetMonth];
  } else if (hasSpecificMonths) {
    monthsToProcess = record.selectedMonths;
  } else {
    const now = new Date();
    monthsToProcess = [`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`];
  }

  if ((record.selectionMode === "weekly" || !record.selectionMode) && record.weekOffDays && record.weekOffDays.length > 0) {
    monthsToProcess.forEach((monthVal) => {
      if (hasSpecificMonths && !record.selectedMonths.includes(monthVal)) return;
      const [year, month] = monthVal.split("-").map(Number);
      const daysInMonth = new Date(year, month, 0).getDate();

      record.weekOffDays.forEach((dayName) => {
        const targetDay = DAY_MAP[resolveDayName(dayName)];
        if (targetDay === undefined) return;
        for (let day = 1; day <= daysInMonth; day++) {
          const date = new Date(year, month - 1, day);
          if (date.getDay() === targetDay) {
            calculatedDates.push(`${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`);
          }
        }
      });
    });
  }

  if (record.selectionMode === "weekwise" && record.weekwiseSelection && record.weekwiseSelection.length > 0) {
    monthsToProcess.forEach((monthVal) => {
      if (hasSpecificMonths && !record.selectedMonths.includes(monthVal)) return;
      const [year, month] = monthVal.split("-").map(Number);
      const daysInMonth = new Date(year, month, 0).getDate();

      record.weekwiseSelection.forEach(({ week, day }) => {
        const targetDay = DAY_MAP[resolveDayName(day)];
        if (targetDay === undefined) return;
        const firstDayOfMonth = new Date(year, month - 1, 1);
        const firstDayOffset = (targetDay - firstDayOfMonth.getDay() + 7) % 7;
        const targetDate = 1 + firstDayOffset + (week - 1) * 7;
        if (targetDate <= daysInMonth && targetDate > 0) {
          calculatedDates.push(`${year}-${String(month).padStart(2, "0")}-${String(targetDate).padStart(2, "0")}`);
        }
      });
    });
  }

  if (Array.isArray(record.specificDates) && record.specificDates.length > 0) {
    record.specificDates.forEach((dateStr) => {
      const dateMonth = dateStr.slice(0, 7);
      if (monthsToProcess.includes(dateMonth)) {
        calculatedDates.push(dateStr);
      }
    });
  }

  return Array.from(new Set(calculatedDates)).sort();
};

const getEmployeeWeekOffRecordFromCollection = (records, employeeId) => {
  if (!employeeId || !Array.isArray(records)) return null;
  const empId = String(employeeId);

  const specificRecord = records.find((rec) =>
    !rec.selectAllEmployees &&
    rec.selectedEmployees?.some((e) => String(e.employeeId) === empId || String(e._id) === empId)
  );
  if (specificRecord) return specificRecord;

  return records.find((rec) => rec.selectAllEmployees === true) || null;
};

const getWorkedWeekOffCombOffOptions = async (employeeId, month) => {
  const now = new Date();
  const targetMonth = month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const [year, monthNum] = targetMonth.split("-").map(Number);
  const startDate = new Date(year, monthNum - 1, 1);
  const endDate = new Date(year, monthNum, 0, 23, 59, 59);

  const [weekOffRecords, attendanceRecords, shiftAssignment, usedLeaves] = await Promise.all([
    WeekOff.find().sort({ createdAt: -1 }),
    Attendance.find({
      employeeId,
      checkInTime: { $gte: startDate, $lte: endDate }
    }),
    Shift.findOne({
      $or: [
        { "employeeAssignment.employeeId": employeeId },
        { employeeId }
      ]
    }),
    Leave.find({
      employeeId,
      $or: [
        { isCombOff: true },
        { leaveType: { $regex: /comb|comp.?off/i } }
      ],
      status: { $nin: ["rejected"] }
    })
  ]);

  const weekOffRecord = getEmployeeWeekOffRecordFromCollection(weekOffRecords, employeeId);

  let weekOffDates = calculateDatesFromPattern(weekOffRecord, targetMonth);

  // ✅ FALLBACK: agar WeekOff record nahi hai, to Sundays poore month ke
  if (!weekOffDates || weekOffDates.length === 0) {
    const daysInMonth = new Date(year, monthNum, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, monthNum - 1, day);
      if (d.getDay() === 0) {
        weekOffDates.push(`${year}-${String(monthNum).padStart(2, "0")}-${String(day).padStart(2, "0")}`);
      }
    }
  }

  const hasWorkAssignment = !!shiftAssignment;

  // ✅ Attendance group by date (multiple records per day possible)
  const workedMap = new Map();
  attendanceRecords.forEach((rec) => {
    const key = toDateKey(rec.checkInTime);
    if (!key) return;
    const existing = workedMap.get(key);
    const hours = rec.totalHours || rec.workingHours || 0;
    if (existing) {
      existing.totalHours = (existing.totalHours || 0) + hours;
      existing.records.push(rec);
    } else {
      workedMap.set(key, {
        date: key,
        totalHours: hours,
        records: [rec]
      });
    }
  });

  const usedWorkDates = new Set(
    usedLeaves
      .map((leave) => toDateKey(leave.combOffWorkDate || leave.startDate))
      .filter(Boolean)
  );

  const allWeekOffs = weekOffDates.map((dateStr) => {
    const att = workedMap.get(dateStr);
    const worked = Boolean(att && att.totalHours > 0);
    return {
      date: dateStr,
      day: formatDayLabel(dateStr),
      isWeekOff: true,
      hasWorkAssignment,
      worked,
      eligible: worked,
      used: usedWorkDates.has(dateStr),
      totalHours: att?.totalHours || 0,
      extraHours: 0,
      status: usedWorkDates.has(dateStr) ? "used" : worked ? "active" : "not-worked",
      source: "weekOffWork"
    };
  });

  const options = allWeekOffs.filter((item) => item.eligible && !item.used);

  return {
    employeeId,
    month: targetMonth,
    weekOffDates,
    hasWorkAssignment,
    hasWeekOffPolicy: Boolean(weekOffRecord),
    options,
    allWeekOffs,
    workedCount: allWeekOffs.filter((item) => item.worked).length
  };
};

// ✅ 1. CREATE MASTER SHIFT WITH SINGLE TIME SLOT
exports.createMasterShift = async (req, res) => {
  try {
    console.log("📝 CREATE MASTER SHIFT REQUEST:", req.body);
    
    const { shiftType, shiftName, shiftCategory, timeSlots, isBrakeShift } = req.body;

    if (!shiftType || !shiftName) {
      return res.status(400).json({ 
        success: false,
        message: "Shift Type and Name are required" 
      });
    }

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

    const formatAmPm = (time24) => {
      if (!time24) return '';
      let [hours, minutes] = time24.split(':').map(Number);
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    };

    let finalTimeSlots = [];
    
    if (isBrakeShift) {
      finalTimeSlots = timeSlots.map((slot, idx) => ({
        slotId: `${shiftType.toUpperCase()}${idx + 1}`,
        startTime: slot.startTime,
        endTime: slot.endTime,
        timeRange: `${formatAmPm(slot.startTime)} - ${formatAmPm(slot.endTime)}`,
        description: slot.description || (idx === 0 ? "Morning Slot" : "Evening Slot")
      }));
    } else if (timeSlots && timeSlots.length > 0) {
      const firstSlot = timeSlots[0];
      finalTimeSlots = [{
        slotId: `${shiftType.toUpperCase()}1`,
        startTime: firstSlot.startTime,
        endTime: firstSlot.endTime,
        timeRange: `${formatAmPm(firstSlot.startTime)} - ${formatAmPm(firstSlot.endTime)}`,
        description: firstSlot.description
      }];
    } else {
      finalTimeSlots = [{
        slotId: `${shiftType.toUpperCase()}1`,
        startTime: "09:00",
        endTime: "18:00",
        timeRange: "09:00 AM - 06:00 PM",
        description: `${shiftName} timing`
      }];
    }

    const newShift = new Shift({
      shiftType: shiftType.toUpperCase(),
      shiftName,
      shiftCategory: shiftCategory || 'Regular',
      timeSlots: finalTimeSlots,
      isBrakeShift: isBrakeShift || false,
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
    const masterShifts = await Shift.find({ 
      isMasterShift: true,
      isActive: true
    }).sort({ shiftType: 1 });

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

// ✅ 3. UPDATE MASTER SHIFT (EDIT SHIFT)
exports.updateMasterShift = async (req, res) => {
  try {
    const { id } = req.params;
    const { shiftType, shiftName, shiftCategory, timeSlots, isBrakeShift } = req.body;

    const existingShift = await Shift.findOne({
      _id: id,
      isMasterShift: true
    });

    if (!existingShift) {
      return res.status(404).json({
        success: false,
        message: "Master shift not found"
      });
    }

    const duplicateShift = await Shift.findOne({
      shiftType: shiftType.toUpperCase(),
      isMasterShift: true,
      _id: { $ne: id }
    });

    if (duplicateShift) {
      return res.status(400).json({
        success: false,
        message: `Shift ${shiftType} already exists. Please use a different letter.`
      });
    }

    const formatAmPm = (time24) => {
      if (!time24) return '';
      let [hours, minutes] = time24.split(':').map(Number);
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    };

    const formattedTimeSlots = timeSlots.map((slot, idx) => ({
      slotId: slot.slotId || `${shiftType.toUpperCase()}${idx + 1}`,
      startTime: slot.startTime,
      endTime: slot.endTime,
      timeRange: `${formatAmPm(slot.startTime)} - ${formatAmPm(slot.endTime)}`,
      description: slot.description
    }));

    const updatedShift = await Shift.findByIdAndUpdate(
      id,
      {
        shiftType: shiftType.toUpperCase(),
        shiftName,
        shiftCategory: shiftCategory || 'Regular',
        timeSlots: formattedTimeSlots,
        isBrakeShift: isBrakeShift || false,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    const updateResult = await Shift.updateMany(
      {
        shiftType: existingShift.shiftType,
        isMasterShift: false,
        isActive: true
      },
      {
        $set: {
          shiftType: shiftType.toUpperCase(),
          shiftName: shiftName,
          shiftCategory: shiftCategory || 'Regular',
          isBrakeShift: isBrakeShift || false,
          timeSlots: formattedTimeSlots,
          "employeeAssignment.selectedTimeRange": isBrakeShift && formattedTimeSlots.length > 1 
            ? `${formattedTimeSlots[0].timeRange} - ${formattedTimeSlots[1].timeRange}`
            : formattedTimeSlots[0]?.timeRange || "Not specified",
          "employeeAssignment.selectedDescription": isBrakeShift 
            ? "Brake shift with afternoon break"
            : formattedTimeSlots[0]?.description || "Shift timing"
        }
      }
    );

    await Shift.updateMany(
      {
        shiftType: existingShift.shiftType,
        employeeId: { $exists: true },
        isMasterShift: { $exists: false }
      },
      {
        $set: {
          shiftType: shiftType.toUpperCase(),
          shiftName: shiftName
        }
      }
    );

    const affectedEmployees = await Shift.find({
      shiftType: shiftType.toUpperCase(),
      isMasterShift: false,
      "employeeAssignment.employeeId": { $exists: true }
    }).select('employeeAssignment.employeeId employeeAssignment.employeeName');

    for (const emp of affectedEmployees) {
      const empId = emp.employeeAssignment?.employeeId;
      if (empId) {
        await Notification.create({
          userId: empId,
          role: "employee",
          title: "Shift Updated",
          message: `Your shift has been updated to ${shiftName} (${shiftType})`,
          type: "attendance"
        });
        
        sendPushToUser(empId, {
          title: "Shift Schedule Changed",
          body: `Your shift has been updated to ${shiftName}`,
          url: "/employee/dashboard"
        });
      }
    }

    res.status(200).json({
      success: true,
      message: "Shift updated successfully",
      data: updatedShift,
      updatedAssignments: updateResult.modifiedCount
    });
  } catch (error) {
    console.error("❌ UPDATE MASTER SHIFT ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// ✅ 4. GET ALL EMPLOYEE ASSIGNMENTS
exports.getEmployeeAssignments = async (req, res) => {
  try {
    const newAssignments = await Shift.find({ 
      isMasterShift: false,
      isActive: true,
      "employeeAssignment.employeeId": { $exists: true }
    });
    
    for (const assignment of newAssignments) {
      await applyScheduledChangeIfDue(assignment);
    }
    
    const refreshedAssignments = await Shift.find({ 
      isMasterShift: false,
      isActive: true,
      "employeeAssignment.employeeId": { $exists: true }
    });
    
    const legacyAssignments = await Shift.find({ 
      employeeId: { $exists: true, $ne: null },
      isMasterShift: { $exists: false }
    });
    
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
    
    const allAssignments = [...refreshedAssignments, ...convertedLegacy];

    const activeAssignments = await Promise.all(allAssignments.map(async (assignment) => {
        const empId = assignment.employeeAssignment?.employeeId || assignment.employeeId;
        if (!empId) return null;
        const emp = await Employee.findOne({ employeeId: empId });
        return emp && emp.status !== 'inactive' ? assignment : null;
    }));
    
    const validAssignments = activeAssignments.filter(a => a !== null);
    
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

// ✅ 5. ASSIGN SHIFT TO EMPLOYEE
exports.assignShiftToEmployee = async (req, res) => {
  try {
    const { employeeId, employeeName, shiftType, selectedSlotId, selectedTimeRange, selectedDescription } = req.body;

    if (!employeeId || !employeeName || !shiftType) {
      return res.status(400).json({ 
        success: false,
        message: "Employee ID, Name and Shift Type are required" 
      });
    }

    const existingNewAssignment = await Shift.findOne({ 
      "employeeAssignment.employeeId": employeeId,
      isActive: true 
    });
    
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

    const masterShift = await Shift.findOne({ 
      shiftType: shiftType.toUpperCase(),
      isMasterShift: true
    });

    let timeRange = selectedTimeRange || "Not specified";
    let description = selectedDescription || "No description";
    
    if (masterShift && masterShift.timeSlots && masterShift.timeSlots.length > 0) {
      if (masterShift.isBrakeShift && masterShift.timeSlots.length > 1) {
        timeRange = `${masterShift.timeSlots[0].timeRange} - ${masterShift.timeSlots[1].timeRange}`;
        description = "Brake shift with afternoon break";
      } else {
        const timeSlot = masterShift.timeSlots[0];
        timeRange = timeSlot.timeRange;
        description = timeSlot.description;
      }
    }

    const newAssignment = new Shift({
      shiftType: shiftType.toUpperCase(),
      shiftName: masterShift?.shiftName || shiftType,
      shiftCategory: masterShift?.shiftCategory || 'Regular',
      timeSlots: masterShift?.timeSlots || [],
      isBrakeShift: masterShift?.isBrakeShift || false,
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

// ✅ 6. UPDATE ASSIGNMENT
exports.updateAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeName, shiftType, effectiveFrom } = req.body;

    const assignment = await Shift.findById(id);
    if (!assignment) {
      return res.status(404).json({ 
        success: false,
        message: "Assignment not found" 
      });
    }

    await applyScheduledChangeIfDue(assignment);

    const { masterShift, timeRange, description } = await getMasterShiftDetails(shiftType);
    const parsedEffectiveFrom = parseEffectiveFrom(effectiveFrom);
    const today = startOfDay(new Date());
    const scheduleForFuture = parsedEffectiveFrom && parsedEffectiveFrom > today;

    if (assignment.employeeAssignment) {
      assignment.employeeAssignment.employeeName = employeeName || assignment.employeeAssignment.employeeName;

      if (scheduleForFuture) {
        assignment.employeeAssignment.scheduledChange = {
          shiftType: shiftType.toUpperCase(),
          shiftName: masterShift?.shiftName || shiftType,
          shiftCategory: masterShift?.shiftCategory || "Regular",
          selectedTimeRange: timeRange,
          selectedDescription: description,
          isBrakeShift: masterShift?.isBrakeShift || false,
          effectiveFrom: parsedEffectiveFrom,
          effectiveMonth: parsedEffectiveFrom.getMonth() + 1,
          effectiveYear: parsedEffectiveFrom.getFullYear()
        };
      } else {
        applyShiftTypeToAssignment(assignment, shiftType, masterShift, timeRange, description);
        assignment.employeeAssignment.effectiveFrom = parsedEffectiveFrom || today;
        delete assignment.employeeAssignment.scheduledChange;
        assignment.markModified("employeeAssignment");
      }
    } else {
      assignment.employeeName = employeeName || assignment.employeeName;
      assignment.shiftType = shiftType.toUpperCase();
    }

    await assignment.save();

    const empId = assignment.employeeAssignment?.employeeId || assignment.employeeId;
    if (empId) {
      const notifyMessage = scheduleForFuture
        ? `Your shift will change to Shift ${shiftType} from ${parsedEffectiveFrom.toLocaleDateString("en-GB")}`
        : `Your shift has been changed to Shift ${shiftType}`;

       await Notification.create({
        userId: empId,
        role: "employee",
        title: scheduleForFuture ? "Shift Change Scheduled" : "Shift Updated",
        message: notifyMessage,
        type: "attendance"
      });
      
      sendPushToUser(empId, {
        title: scheduleForFuture ? "Shift Change Scheduled" : "Shift Updated",
        body: notifyMessage,
        url: "/employee/dashboard"
      });
    }
    
    res.status(200).json({ 
      success: true,
      message: scheduleForFuture
        ? `Shift change scheduled from ${parsedEffectiveFrom.toLocaleDateString("en-GB")}`
        : "Assignment updated successfully",
      data: assignment,
      scheduled: scheduleForFuture
    });
  } catch (error) {
    console.error("❌ UPDATE ASSIGNMENT ERROR:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error"
    });
  }
};

// ✅ 7. GET EMPLOYEES BY SHIFT TYPE
exports.getEmployeesByShiftType = async (req, res) => {
  try {
    const { shiftType } = req.params;

    const newEmployees = await Shift.find({ 
      shiftType: shiftType.toUpperCase(),
      isMasterShift: false,
      isActive: true
    });
    
    const legacyEmployees = await Shift.find({ 
      shiftType: shiftType.toUpperCase(),
      employeeId: { $exists: true },
      isMasterShift: { $exists: false }
    });
    
    const allEmployees = [...newEmployees, ...legacyEmployees];
    
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
        shiftCategory: masterShift?.shiftCategory || 'Regular',
        isBrakeShift: masterShift?.isBrakeShift || false,
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

// ✅ 8. GET EMPLOYEE COUNT BY SHIFT TYPE
exports.getEmployeeCountByShift = async (req, res) => {
  try {
    const masterShifts = await Shift.find({ 
      isMasterShift: true,
      isActive: true
    }).sort({ shiftType: 1 });
    
    const shiftCounts = await Promise.all(
      masterShifts.map(async (shift) => {
        const newAssignmentShifts = await Shift.find({
          shiftType: shift.shiftType,
          isMasterShift: false,
          isActive: true,
          "employeeAssignment.employeeId": { $exists: true }
        });
        
        const activeNewShifts = await Promise.all(newAssignmentShifts.map(async (s) => {
           const emp = await Employee.findOne({ employeeId: s.employeeAssignment.employeeId });
           return emp && emp.status !== 'inactive' ? s : null;
        }));
        const newCount = activeNewShifts.filter(s => s !== null).length;
        
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
        
        let timeDisplay = "";
        if (shift.isBrakeShift && shift.timeSlots.length > 1) {
          timeDisplay = `${shift.timeSlots[0].timeRange} - ${shift.timeSlots[1].timeRange}`;
        } else if (shift.timeSlots.length > 0) {
          timeDisplay = shift.timeSlots[0].timeRange;
        }
        
        return {
          shiftType: shift.shiftType,
          shiftName: shift.shiftName,
          shiftCategory: shift.shiftCategory || 'Regular',
          isBrakeShift: shift.isBrakeShift || false,
          totalEmployees: newCount + legacyCount,
          timeSlot: timeDisplay || "Not specified"
        };
      })
    );
    
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

// ✅ 9. DELETE MASTER SHIFT
exports.deleteMasterShift = async (req, res) => {
  try {
    const { id } = req.params;
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

// ✅ 10. DELETE ASSIGNMENT
exports.deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;
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

// ✅ 11. GET SHIFT FOR SPECIFIC EMPLOYEE
exports.getShiftForEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;

    if (!employeeId) {
      return res.status(400).json({ 
        success: false,
        message: "Employee ID is required" 
      });
    }

    let employeeShift = await Shift.findOne({ 
      "employeeAssignment.employeeId": employeeId,
      isActive: true,
      isMasterShift: false
    });

    if (employeeShift) {
      await applyScheduledChangeIfDue(employeeShift);
      employeeShift = await Shift.findOne({ 
        "employeeAssignment.employeeId": employeeId,
        isActive: true,
        isMasterShift: false
      });
    }

    if (!employeeShift) {
      employeeShift = await Shift.findOne({ 
        employeeId: employeeId,
        isMasterShift: { $exists: false }
      });
    }

    if (!employeeShift) {
      return res.status(404).json({ 
        success: false,
        message: "No shift assigned to this employee",
        data: null
      });
    }

    let responseData = {
      _id: employeeShift._id,
      shiftType: employeeShift.shiftType,
      shiftName: employeeShift.shiftName || `Shift ${employeeShift.shiftType}`,
      shiftCategory: employeeShift.shiftCategory || 'Regular',
      isBrakeShift: employeeShift.isBrakeShift || false,
      isAssigned: true
    };

    if (employeeShift.employeeAssignment) {
      const timeRange = employeeShift.employeeAssignment.selectedTimeRange || "10:00 - 19:00";
      const [startTime, endTime] = timeRange.split(" - ");
      
      responseData.startTime = startTime ? startTime.trim() : "10:00";
      responseData.endTime = endTime ? endTime.trim() : "19:00";
      responseData.timeRange = timeRange;
      responseData.description = employeeShift.employeeAssignment.selectedDescription || "Shift timing";
      responseData.assignedDate = employeeShift.employeeAssignment.assignedDate;
      responseData.effectiveFrom = employeeShift.employeeAssignment.effectiveFrom;
      responseData.scheduledChange = employeeShift.employeeAssignment.scheduledChange || null;
    } 
    else if (employeeShift.startTime && employeeShift.endTime) {
      responseData.startTime = employeeShift.startTime;
      responseData.endTime = employeeShift.endTime;
      responseData.timeRange = `${employeeShift.startTime} - ${employeeShift.endTime}`;
      responseData.description = "Legacy shift assignment";
      responseData.assignedDate = employeeShift.createdAt;
    }
    else {
      responseData.startTime = "10:00";
      responseData.endTime = "19:00";
      responseData.timeRange = "10:00 - 19:00";
      responseData.description = "Shift timing";
      responseData.assignedDate = employeeShift.createdAt;
    }

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

// ✅ 12. CREATE DEFAULT SHIFTS
exports.createDefaultShifts = async (req, res) => {
  try {
    const defaultShifts = [
      {
        shiftType: "A",
        shiftName: "Morning Shift",
        shiftCategory: "Regular",
        timeSlots: [{ 
          slotId: "A1", 
          startTime: "06:00",
          endTime: "14:00",
          timeRange: "06:00 AM - 02:00 PM", 
          description: "Morning 6 to 2"
        }],
        isBrakeShift: false
      },
      {
        shiftType: "B",
        shiftName: "Evening Shift",
        shiftCategory: "Regular",
        timeSlots: [{ 
          slotId: "B1", 
          startTime: "14:00",
          endTime: "22:00",
          timeRange: "02:00 PM - 10:00 PM", 
          description: "Evening 2 to 10"
        }],
        isBrakeShift: false
      },
      {
        shiftType: "C",
        shiftName: "Night Shift",
        shiftCategory: "Regular",
        timeSlots: [{ 
          slotId: "C1", 
          startTime: "22:00",
          endTime: "06:00",
          timeRange: "10:00 PM - 06:00 AM", 
          description: "Night 10 to 6"
        }],
        isBrakeShift: false
      },
      {
        shiftType: "D",
        shiftName: "General Shift",
        shiftCategory: "Regular",
        timeSlots: [{ 
          slotId: "D1", 
          startTime: "09:00",
          endTime: "18:00",
          timeRange: "09:00 AM - 06:00 PM", 
          description: "General 9 to 6"
        }],
        isBrakeShift: false
      },
      {
        shiftType: "E",
        shiftName: "Part Time Morning",
        shiftCategory: "Part Time",
        timeSlots: [{ 
          slotId: "E1", 
          startTime: "09:00",
          endTime: "13:00",
          timeRange: "09:00 AM - 01:00 PM", 
          description: "Part Time Morning"
        }],
        isBrakeShift: false
      },
      {
        shiftType: "F",
        shiftName: "Consultant Shift",
        shiftCategory: "Consultant",
        timeSlots: [{ 
          slotId: "F1", 
          startTime: "10:00",
          endTime: "16:00",
          timeRange: "10:00 AM - 04:00 PM", 
          description: "Flexible Consultant Hours"
        }],
        isBrakeShift: false
      }
    ];
    
    let createdCount = 0;
    
    for (const shiftData of defaultShifts) {
      const existingShift = await Shift.findOne({ 
        shiftType: shiftData.shiftType,
        isMasterShift: true
      });
      
      if (!existingShift) {
        const newShift = new Shift({
          shiftType: shiftData.shiftType,
          shiftName: shiftData.shiftName,
          shiftCategory: shiftData.shiftCategory,
          timeSlots: shiftData.timeSlots,
          isBrakeShift: shiftData.isBrakeShift || false,
          isMasterShift: true,
          isActive: true
        });
        
        await newShift.save();
        createdCount++;
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

// ✅ 13. MIGRATE LEGACY DATA
exports.migrateLegacyData = async (req, res) => {
  try {
    const legacyData = await Shift.find({ 
      employeeId: { $exists: true },
      isMasterShift: { $exists: false }
    });
    
    let migratedCount = 0;
    
    for (const legacy of legacyData) {
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
          shiftCategory: masterShift?.shiftCategory || 'Regular',
          timeSlots: masterShift?.timeSlots || [],
          isBrakeShift: masterShift?.isBrakeShift || false,
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

// ✅ 14. GET SHIFT DETAILS
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

// ✅ 15. SAVE WEEK OFF
exports.saveWeekOff = async (req, res) => {
  try {
    const { selectedEmployees, weekOffDays, specificDates, selectAllEmployees, selectedMonths, selectionMode, weekwiseSelection, monthlyPattern } = req.body;

    if (!selectAllEmployees && (!selectedEmployees || selectedEmployees.length === 0)) {
      return res.status(400).json({ 
        success: false,
        message: "Please select at least one employee or choose 'Select All Employees'" 
      });
    }

    const hasWeeklyPattern = Array.isArray(weekOffDays) && weekOffDays.length > 0;
    const hasWeekwisePattern = Array.isArray(weekwiseSelection) && weekwiseSelection.length > 0;
    const hasMonthlyPattern = Array.isArray(monthlyPattern) && monthlyPattern.length > 0;
    const hasSpecificDates = Array.isArray(specificDates) && specificDates.length > 0;

    if (!hasWeeklyPattern && !hasWeekwisePattern && !hasMonthlyPattern && !hasSpecificDates) {
      return res.status(400).json({ 
        success: false,
        message: "Please select at least one week-off pattern or specific date" 
      });
    }

    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const monthsToSave = (Array.isArray(selectedMonths) && selectedMonths.length > 0)
      ? selectedMonths
      : [currentMonthStr];

    const newWeekOff = new WeekOff({
      selectedEmployees: selectedEmployees || [],
      weekOffDays: weekOffDays || [],
      specificDates: specificDates || [],
      selectAllEmployees: selectAllEmployees || false,
      selectedMonths: monthsToSave,
      selectionMode: selectionMode || 'weekly',
      weekwiseSelection: weekwiseSelection || [],
      monthlyPattern: monthlyPattern || []
    });

    await newWeekOff.save();

    let patternSummary = "";
    if (selectionMode === 'weekly' && hasWeeklyPattern) {
      patternSummary = weekOffDays.join(', ');
    } else if (selectionMode === 'weekwise' && hasWeekwisePattern) {
      patternSummary = weekwiseSelection.map(item => `Week ${item.week} ${item.day}`).join(', ');
    } else if (selectionMode === 'monthly' && hasMonthlyPattern) {
      patternSummary = monthlyPattern.map(item => `${item.occurrence} ${item.day}`).join(', ');
    } else if (hasSpecificDates) {
      patternSummary = specificDates.join(', ');
    }

    if (!selectAllEmployees && selectedEmployees && selectedEmployees.length > 0) {
      for (const emp of selectedEmployees) {
        await Notification.create({
          userId: emp.employeeId,
          role: "employee",
          title: "Week Off Assigned",
          message: `You have been assigned week off: ${patternSummary || 'Scheduled week off'}`,
          type: "attendance"
        });
        
        sendPushToUser(emp.employeeId, {
          title: "Week Off Assigned",
          body: `Admin assigned you week off: ${patternSummary || 'Scheduled week off'}`,
          url: "/employee/dashboard"
        });
      }
    }

    res.status(201).json({ 
      success: true,
      message: "Week off saved successfully", 
      data: newWeekOff 
    });
  } catch (error) {
    console.error("❌ SAVE WEEK OFF ERROR:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error",
      error: error.message 
    });
  }
};

// ✅ 16. GET ALL WEEK OFF RECORDS
exports.getWeekOffRecords = async (req, res) => {
  try {
    const weekOffRecords = await WeekOff.find().sort({ createdAt: -1 });

    res.status(200).json({ 
      success: true,
      data: weekOffRecords
    });
  } catch (error) {
    console.error("❌ GET WEEK OFF RECORDS ERROR:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error"
    });
  }
};

// ✅ 17. DELETE WEEK OFF RECORD
exports.deleteWeekOff = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await WeekOff.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Week off record not found"
      });
    }
    res.status(200).json({
      success: true,
      message: "Week off record deleted successfully"
    });
  } catch (error) {
    console.error("❌ DELETE WEEK OFF RECORD ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// ✅ 18. GET EMPLOYEE WEEK-OFF DATES FOR A MONTH
exports.getEmployeeWeekOffDates = async (req, res) => {
  try {
    const { employeeId, month } = req.query;

    if (!employeeId || !month) {
      return res.status(400).json({
        success: false,
        message: "employeeId and month (YYYY-MM) are required"
      });
    }

    const generateWeeklyDates = (year, monthNum, weekOffDay) => {
      const daysInMonth = new Date(year, monthNum, 0).getDate();
      const targetDay = DAY_MAP[resolveDayName(weekOffDay)];
      if (targetDay === undefined) return [];
      const dates = [];
      for (let day = 1; day <= daysInMonth; day++) {
        const d = new Date(year, monthNum - 1, day);
        if (d.getDay() === targetDay) {
          dates.push(`${year}-${String(monthNum).padStart(2, "0")}-${String(day).padStart(2, "0")}`);
        }
      }
      return dates;
    };

    const [year, monthNum] = month.split("-").map(Number);
    if (isNaN(year) || isNaN(monthNum)) {
      return res.status(400).json({ success: false, message: "Invalid month format. Use YYYY-MM" });
    }

    const employee = await Employee.findOne({ employeeId: String(employeeId) });
    const fallbackWeekOffDay = employee?.weekOffDay || "Sunday";

    const allRecords = await WeekOff.find().sort({ createdAt: -1 });
    const empId = String(employeeId);

    const specific = allRecords.find((rec) =>
      !rec.selectAllEmployees &&
      rec.selectedEmployees?.some((e) => String(e.employeeId) === empId)
    );
    const record = specific || allRecords.find((rec) => rec.selectAllEmployees === true);

    if (!record) {
      const fallbackDates = generateWeeklyDates(year, monthNum, fallbackWeekOffDay);
      return res.json({
        success: true,
        employeeId,
        month,
        weekOffDates: fallbackDates,
        source: "fallback",
        selectionMode: "weekly",
        weekOffDays: [fallbackWeekOffDay],
        message: `No WeekOff assigned — using default ${fallbackWeekOffDay}`
      });
    }

    const hasSpecificMonths =
      Array.isArray(record.selectedMonths) && record.selectedMonths.length > 0;

    let dates = [];

    if (hasSpecificMonths && !record.selectedMonths.includes(month)) {
      if (Array.isArray(record.specificDates)) {
        dates = record.specificDates.filter((d) => d.startsWith(month));
      }
    } else {
      const daysInMonth = new Date(year, monthNum, 0).getDate();

      const pushDate = (day) => {
        if (day >= 1 && day <= daysInMonth) {
          dates.push(
            `${year}-${String(monthNum).padStart(2, "0")}-${String(day).padStart(2, "0")}`
          );
        }
      };

      if ((record.selectionMode === "weekly" || !record.selectionMode) &&
          Array.isArray(record.weekOffDays)) {
        record.weekOffDays.forEach((dayName) => {
          const targetDay = DAY_MAP[resolveDayName(dayName)];
          if (targetDay === undefined) return;
          for (let day = 1; day <= daysInMonth; day++) {
            const d = new Date(year, monthNum - 1, day);
            if (d.getDay() === targetDay) pushDate(day);
          }
        });
      }

      if (record.selectionMode === "weekwise" && Array.isArray(record.weekwiseSelection)) {
        record.weekwiseSelection.forEach(({ week, day }) => {
          const targetDay = DAY_MAP[resolveDayName(day)];
          if (targetDay === undefined) return;
          const firstDayOfMonth = new Date(year, monthNum - 1, 1);
          const offset = (targetDay - firstDayOfMonth.getDay() + 7) % 7;
          pushDate(1 + offset + (week - 1) * 7);
        });
      }

      if (record.selectionMode === "monthly" && Array.isArray(record.monthlyPattern)) {
        record.monthlyPattern.forEach(({ occurrence, day }) => {
          const targetDay = DAY_MAP[resolveDayName(day)];
          if (targetDay === undefined) return;
          const matching = [];
          for (let d = 1; d <= daysInMonth; d++) {
            if (new Date(year, monthNum - 1, d).getDay() === targetDay) matching.push(d);
          }
          const occMap = { "1st": 1, "2nd": 2, "3rd": 3, "4th": 4, "last": -1 };
          const occ = occMap[occurrence];
          if (occ === -1) pushDate(matching[matching.length - 1]);
          else if (occ && matching[occ - 1]) pushDate(matching[occ - 1]);
        });
      }

      if (Array.isArray(record.specificDates)) {
        record.specificDates.forEach((d) => {
          if (d.startsWith(month)) dates.push(d);
        });
      }
    }

    dates = Array.from(new Set(dates)).sort();

    if (dates.length === 0) {
      const fallbackDates = generateWeeklyDates(year, monthNum, fallbackWeekOffDay);
      return res.json({
        success: true,
        employeeId,
        month,
        weekOffDates: fallbackDates,
        source: "fallback",
        selectionMode: "weekly",
        weekOffDays: [fallbackWeekOffDay],
        message: `No dates from WeekOff record — using default ${fallbackWeekOffDay}`
      });
    }

    res.json({
      success: true,
      employeeId,
      month,
      weekOffDates: dates,
      source: specific ? "employee" : "all",
      selectionMode: record.selectionMode || "weekly",
      weekOffDays: record.weekOffDays || []
    });
  } catch (error) {
    console.error("❌ Error fetching employee week-off dates:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ 19. GET ELIGIBLE COMP-OFF DAYS (from WeekOff + Attendance)
exports.getEligibleCompOffDays = async (req, res) => {
  try {
    const { employeeId, month } = req.query;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: "employeeId is required"
      });
    }

    const now = new Date();
    const targetMonth = month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    console.log(`🔍 getEligibleCompOffDays: employeeId=${employeeId}, month=${targetMonth}`);

    const data = await getWorkedWeekOffCombOffOptions(employeeId, targetMonth);

    console.log(`✅ Found ${data.options.length} eligible days (out of ${data.weekOffDates.length} weekoffs)`);

    res.json({
      success: true,
      employeeId,
      month: targetMonth,
      weekOffDates: data.weekOffDates || [],
      hasWorkAssignment: data.hasWorkAssignment,
      hasWeekOffPolicy: data.hasWeekOffPolicy,
      options: data.options || [],
      allWeekOffs: data.allWeekOffs || [],
      workedCount: data.workedCount || 0
    });
  } catch (error) {
    console.error("❌ Error fetching eligible comp-off days:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};