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


// const Shift = require("../models/Shift");
// const Employee = require("../models/Employee");

// console.log("✅ Shift Controller Loaded");

// // ✅ 1. CREATE MASTER SHIFT WITH SINGLE TIME SLOT
// exports.createMasterShift = async (req, res) => {
//   try {
//     console.log("📝 CREATE MASTER SHIFT REQUEST:", req.body);
    
//     const { shiftType, shiftName, timeSlots } = req.body;

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

//     // ✅ MODIFIED: Only one time slot per shift
//     let finalTimeSlots = [];
    
//     if (timeSlots && timeSlots.length > 0) {
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
//       timeSlots: finalTimeSlots, // ✅ Only one slot
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
//       // ✅ MODIFIED: Always use the first (only) time slot
//       const timeSlot = masterShift.timeSlots[0];
//       timeRange = timeSlot.timeRange;
//       description = timeSlot.description;
//     }

//     // Create new assignment document
//     const newAssignment = new Shift({
//       shiftType: shiftType.toUpperCase(),
//       shiftName: masterShift?.shiftName || shiftType,
//       timeSlots: masterShift?.timeSlots || [],
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
      
//       // ✅ MODIFIED: Always use first time slot from master shift
//       if (masterShift && masterShift.timeSlots && masterShift.timeSlots.length > 0) {
//         const timeSlot = masterShift.timeSlots[0];
//         assignment.employeeAssignment.selectedTimeRange = timeSlot.timeRange;
//         assignment.employeeAssignment.selectedDescription = timeSlot.description;
//       }
//     } else {
//       // Legacy format
//       assignment.employeeName = employeeName || assignment.employeeName;
//       assignment.shiftType = shiftType.toUpperCase();
//     }

//     await assignment.save();
    
//     console.log("✅ ASSIGNMENT UPDATED:", assignment);
    
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
        
//         return {
//           shiftType: shift.shiftType,
//           shiftName: shift.shiftName,
//           totalEmployees: newCount + legacyCount,
//           timeSlot: shift.timeSlots && shift.timeSlots.length > 0 ? shift.timeSlots[0].timeRange : "Not specified"
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

// // ✅ 11. CREATE DEFAULT SHIFTS (A-D) - For quick creation
// exports.createDefaultShifts = async (req, res) => {
//   try {
//     console.log("📝 CREATING DEFAULT SHIFTS A-D");
    
//     const defaultShifts = [
//       {
//         shiftType: "A",
//         shiftName: "Morning Shift",
//         timeSlots: [{ slotId: "A1", timeRange: "06:00 - 14:00", description: "Morning 6 to 2" }]
//       },
//       {
//         shiftType: "B",
//         shiftName: "Evening Shift",
//         timeSlots: [{ slotId: "B1", timeRange: "14:00 - 22:00", description: "Evening 2 to 10" }]
//       },
//       {
//         shiftType: "C",
//         shiftName: "Night Shift",
//         timeSlots: [{ slotId: "C1", timeRange: "22:00 - 06:00", description: "Night 10 to 6" }]
//       },
//       {
//         shiftType: "D",
//         shiftName: "General Shift",
//         timeSlots: [{ slotId: "D1", timeRange: "09:00 - 18:00", description: "General 9 to 6" }]
//       }
//     ];
    
//     let createdCount = 0;
    
//     for (const shiftData of defaultShifts) {
//       // Check if shift already exists
//       const existingShift = await Shift.findOne({ 
//         shiftType: shiftData.shiftType,
//         isMasterShift: true
//       });
      
//       if (!existingShift) {
//         const newShift = new Shift({
//           shiftType: shiftData.shiftType,
//           shiftName: shiftData.shiftName,
//           timeSlots: shiftData.timeSlots,
//           isMasterShift: true,
//           isActive: true
//         });
        
//         await newShift.save();
//         createdCount++;
//         console.log(`✅ Created default shift: ${shiftData.shiftType}`);
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


const Shift = require("../models/Shift");
const Employee = require("../models/Employee");

console.log("✅ Shift Controller Loaded");

// ✅ 1. CREATE MASTER SHIFT WITH SINGLE TIME SLOT OR BRAKE SHIFT
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
      // Regular shift - Take only the first time slot
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
    
    console.log("✅ MASTER SHIFT CREATED:", newShift.shiftType, isBrakeShift ? "(Brake Shift)" : "");
    
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
      // ✅ MODIFIED: For brake shift, combine both time slots
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
      isBrakeShift: masterShift?.isBrakeShift || false, // ✅ Include isBrakeShift field
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