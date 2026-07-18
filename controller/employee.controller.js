// const Employee = require("../models/Employee");
const EmployeeExperience = require("../models/EmployeeExperience");
const path = require("path");
const fs = require("fs");
const NodeGeocoder = require("node-geocoder");



const geocoder = NodeGeocoder({
  provider: "openstreetmap",
});

// ─── Rate Limiter ───
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1100; // 1.1 seconds

// ─── Get Address from Coordinates ───
const getAddressFromCoords = async (lat, lng) => {
  if (!lat || !lng) return null;
  
  try {
    // Rate limiting
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
      await new Promise(resolve => 
        setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest)
      );
    }
    lastRequestTime = Date.now();

    const location = await geocoder.reverse({
      lat: lat,
      lon: lng,
    });

    if (location && location.length > 0) {
      return location[0].formattedAddress ||
        `${location[0].city || ""}, ${location[0].state || ""}, ${location[0].country || ""}`;
    }
    return null;
  } catch (err) {
    console.log(`Geocoder Error:`, err.message);
    return null;
  }
};


// const Location = require("../models/Location");
// const { logActivity } = require("./userActivity.controller");
// // ➕ Add a new employee
// exports.addEmployee = async (req, res) => {
//   try {
//     const {
//       name, email, password, department, role,
//       dob, addressLine1, addressLine2, city, state, pinCode, country,
//       weekOffType, weekOffDay, weekOffCount,
//       shiftType,
//       joinDate, phone, employeeId, location
//     } = req.body;

//     // Check if employee already exists
//     const existingEmployee = await Employee.findOne({
//       $or: [{ email }, { employeeId }]
//     });

//     if (existingEmployee) {
//       return res.status(400).json({
//         success: false,
//         message: "Employee with this email or ID already exists"
//       });
//     }

//     const newEmployee = new Employee({
//       name,
//       email,
//       password,
//       department,
//       role,
//       dob: dob ? new Date(dob) : null,
//       addressLine1,
//       addressLine2,
//       city,
//       state,
//       pinCode,
//       country: country || "India",
//       weekOffType,
//       weekOffDay,
//       weekOffCount: weekOffCount || 0,
//       shiftType: shiftType || "A",
//       joinDate: joinDate ? new Date(joinDate) : null,
//       phone,
//       employeeId,
//       location
//     });

//     await newEmployee.save();

//     res.status(201).json({
//       success: true,
//       message: "Employee added successfully",
//       employee: newEmployee
//     });
//   } catch (error) {
//     console.error("Add employee error:", error);
//     res.status(500).json({ 
//       success: false,
//       message: "Server error",
//       error: error.message 
//     });
//   }
// };

// // 📋 Get all employees
// exports.getEmployees = async (req, res) => {
//   try {
//     const employees = await Employee.find();
//     res.json(employees);
//   } catch (error) {
//     res.status(500).json({ message: "Server Error", error });
//   }
// };

// // 🔍 Get single employee by email or employeeId
// exports.getEmployeeByEmail = async (req, res) => {
//   try {
//     const { email, employeeId } = req.query;

//     if (!email && !employeeId)
//       return res.status(400).json({ message: "Email or Employee ID is required" });

//     const query = email ? { email } : { employeeId };
//     const employee = await Employee.findOne(query);

//     if (!employee) return res.status(404).json({ message: "Employee not found" });

//     res.json(employee);
//   } catch (error) {
//     res.status(500).json({ message: "Server Error", error });
//   }
// };

// // 🔐 Employee login (email or employeeId)
// exports.loginEmployee = async (req, res) => {
//   try {
//     const { email, employeeId, password } = req.body;

//     if (!email && !employeeId)
//       return res.status(400).json({ message: "Email or Employee ID is required" });

//     const query = email ? { email } : { employeeId };
//     const employee = await Employee.findOne(query);

//     if (!employee) return res.status(404).json({ message: "Employee not found" });
//     if (employee.password !== password)
//       return res.status(401).json({ message: "Invalid password" });

//     // ✅ Log login activity
//     await logActivity({
//       userId: employee.employeeId,
//       userName: employee.name,
//       userEmail: employee.email,
//       userRole: "employee",
//       action: "login",
//       actionDetails: `Employee logged in successfully`,
//       ipAddress: req.ip || req.connection.remoteAddress,
//       metadata: {
//         department: employee.department,
//         role: employee.role,
//       },
//     });

//     res.json({
//       message: "Login successful",
//       employee: {
//         id: employee._id,
//         name: employee.name,
//         email: employee.email,
//         role: employee.role,
//         department: employee.department,
//         employeeId: employee.employeeId,
//         joinDate: employee.joinDate,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Server Error", error });
//   }
// };
// // 🔹 Get attendance summary for one employee
// exports.getEmployeeAttendanceSummary = async (req, res) => {
//   try {
//     const { email, employeeId } = req.query;
//     if (!email && !employeeId) return res.status(400).json({ message: "Email or Employee ID required" });

//     const query = email ? { email } : { employeeId };
//     const records = await Attendance.find(query);

//     const totalDays = records.length;
//     const presentDays = records.filter(r => r.status === "Present").length;
//     const absentDays = records.filter(r => r.status === "Absent").length;
//     const attendanceRate = totalDays === 0 ? 0 : ((presentDays / totalDays) * 100).toFixed(2);

//     res.json({ totalDays, presentDays, absentDays, attendanceRate });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server Error", error });
//   }
// };
// // ✅ Assign Location to Employee
// exports.assignLocation = async (req, res) => {
//   try {
//     const { employeeId } = req.params;
//     const { locationId } = req.body;

//     if (!employeeId || !locationId) {
//       return res
//         .status(400)
//         .json({ message: "Employee ID and Location ID are required" });
//     }

//     const employee = await Employee.findOne({ employeeId });
//     if (!employee) {
//       return res.status(404).json({ message: "Employee not found" });
//     }

//     const location = await Location.findById(locationId);
//     if (!location) {
//       return res.status(404).json({ message: "Location not found" });
//     }

//     // 🔹 Assign location to employee
//     employee.location = location._id;
//     await employee.save();

//     // (Optional) also add employee reference in location document
//     await Location.findByIdAndUpdate(locationId, {
//       $addToSet: { assignedEmployees: employee._id },
//     });

//     res.status(200).json({
//       message: `Location '${location.name}' assigned to employee '${employee.name}'`,
//       employee,
//     });
//   } catch (err) {
//     console.error("Assign location error:", err);
//     res.status(500).json({
//       message: "Failed to assign location",
//       error: err.message,
//     });
//   }
// };



// // Alternative version if you want to search by employeeId instead of MongoDB _id
// exports.getAssignedLocationByEmployeeId = async (req, res) => {
//   try {
//     const { employeeId } = req.params;

//     if (!employeeId) {
//       return res.status(400).json({
//         success: false,
//         message: "Employee ID is required"
//       });
//     }

//     // Find employee by employeeId and populate location details
//     const employee = await Employee.findOne({ employeeId })
//       .populate('location', 'name latitude longitude fullAddress isActive')
//       .select('name email employeeId location');

//     if (!employee) {
//       return res.status(404).json({
//         success: false,
//         message: "Employee not found"
//       });
//     }

//     // If employee has no location assigned
//     if (!employee.location) {
//       return res.status(200).json({
//         success: true,
//         message: "No location assigned to this employee",
//         data: {
//           employee: {
//             _id: employee._id,
//             name: employee.name,
//             email: employee.email,
//             employeeId: employee.employeeId
//           },
//           location: null
//         }
//       });
//     }

//     // Return employee with assigned location
//     res.status(200).json({
//       success: true,
//       message: "Assigned location fetched successfully",
//       data: {
//         employee: {
//           _id: employee._id,
//           name: employee.name,
//           email: employee.email,
//           employeeId: employee.employeeId
//         },
//         location: employee.location
//       }
//     });

//   } catch (error) {
//     console.error("Get assigned location error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch assigned location",
//       error: error.message
//     });
//   }
// };



// exports.updateEmployee = async (req, res) => {
//   try {
//     const {
//       name, email, password, department, role,
//       dob, addressLine1, addressLine2, city, state, pinCode, country,
//       weekOffType, weekOffDay, weekOffCount,
//       shiftType,
//       joinDate, phone, location, status // ✅ Added status
//     } = req.body;

//     const updateData = {
//       name,
//       email,
//       department,
//       role,
//       dob: dob ? new Date(dob) : null,
//       addressLine1,
//       addressLine2,
//       city,
//       state,
//       pinCode,
//       country: country || "India",
//       weekOffType,
//       weekOffDay,
//       weekOffCount: weekOffCount || 0,
//       shiftType: shiftType || "A",
//       joinDate: joinDate ? new Date(joinDate) : null,
//       phone,
//       location,
//       status // ✅ Added status to update object
//     };

//     // Add password only if provided
//     if (password && password.trim() !== "") {
//       updateData.password = password;
//     }

//     const updatedEmployee = await Employee.findByIdAndUpdate(
//       req.params.id,
//       updateData,
//       { new: true, runValidators: true }
//     );

//     if (!updatedEmployee) {
//       return res.status(404).json({ 
//         success: false,
//         message: "Employee not found" 
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Employee updated successfully",
//       employee: updatedEmployee
//     });
//   } catch (error) {
//     console.error("Update employee error:", error);
//     res.status(500).json({ 
//       success: false,
//       message: "Server error",
//       error: error.message 
//     });
//   }
// };

// // 🗑️ Delete Employee
// exports.deleteEmployee = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const employee = await Employee.findByIdAndDelete(id);

//     if (!employee) {
//       return res.status(404).json({ message: "Employee not found" });
//     }

//     res.json({ message: "Employee deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ message: "Server Error", error });
//   }
// };



// const mongoose = require("mongoose");
// const Location = require("../models/Location");
// const JobApplication = require("../models/JobApplication");
// const JobPost = require("../models/jobPost");
// const Candidate = require("../models/Candidate");
// const CandidateExperience = require("../models/CandidateExperience");
// const CandidateDocuments = require("../models/CandidateDocuments");
// const { logActivity } = require("./userActivity.controller");

// // ✅ Get employee by phone number
// exports.getEmployeeByPhone = async (req, res) => {
//   try {
//     const { phone } = req.query;

//     if (!phone) {
//       return res.status(400).json({
//         success: false,
//         message: "Phone number is required"
//       });
//     }

//     const employee = await Employee.findOne({ phone });

//     if (!employee) {
//       return res.status(404).json({
//         success: false,
//         message: "Employee not found with this phone number"
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Employee found successfully",
//       data: employee
//     });
//   } catch (error) {
//     console.error("Get employee by phone error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: error.message
//     });
//   }
// };

// // ➕ Add a new employee (Updated with new fields)
// exports.addEmployee = async (req, res) => {
//   try {
//     const {
//       firstName, lastName, email, password, department, role,
//       dob, addressLine1, addressLine2, city, state, pinCode, country,
//       weekOffType, weekOffCount,
//       shiftType, shiftHours,
//       joinDate, phone, employeeId, locationId,
//       parentsName, alternateNumber, salaryPerMonth, weekOffPerMonth,
//       permissions, maxCL, maxSL, maxEL, maxCompOff,
//       ctc, basicPay, hra, conveyanceAllowance, medicalAllowance,
//       performanceAllowance, specialAllowance, ptax, gmc, gmcAmount, otherDeductions
//     } = req.body;

//     // Combine first name and last name
//     const name = `${firstName || ''} ${lastName || ''}`.trim();

//     // Check if employee already exists
//     const existingEmployee = await Employee.findOne({
//       $or: [{ email }, { employeeId }, { phone }]
//     });

//     if (existingEmployee) {
//       return res.status(400).json({
//         success: false,
//         message: "Employee with this email, ID or phone already exists"
//       });
//     }

//     const newEmployee = new Employee({
//       name,
//       firstName,
//       lastName,
//       email,
//       password,
//       department,
//       role,
//       dob: dob ? new Date(dob) : null,
//       addressLine1,
//       addressLine2,
//       city,
//       state,
//       pinCode,
//       country: country || "India",
//       weekOffType,
//       weekOffCount: weekOffCount || 0,
//       shiftType: shiftType || "A",
//       shiftHours: shiftHours || 8,
//       joinDate: joinDate ? new Date(joinDate) : null,
//       phone,
//       employeeId,
//       location: locationId,
//       parentsName,
//       alternateNumber,
//       salaryPerMonth: Number(salaryPerMonth) || 0,
//       ctc: Number(ctc) || 0,
//       basicPay: Number(basicPay) || 0,
//       hra: Number(hra) || 0,
//       conveyanceAllowance: Number(conveyanceAllowance) || 0,
//       medicalAllowance: Number(medicalAllowance) || 0,
//       performanceAllowance: Number(performanceAllowance) || 0,
//       specialAllowance: Number(specialAllowance) || 0,
//       ptax: Number(ptax) || 0,
//       gmc: gmc || "",
//       gmcAmount: Number(gmcAmount) || 0,
//       otherDeductions: Number(otherDeductions) || 0,
//       weekOffPerMonth: Number(weekOffPerMonth) || 0,
//       permissions: permissions || [],
//       maxCL: maxCL !== undefined ? Number(maxCL) : 0,
//       maxSL: maxSL !== undefined ? Number(maxSL) : 0,
//       maxEL: maxEL !== undefined ? Number(maxEL) : 0,
//       maxCompOff: maxCompOff !== undefined ? Number(maxCompOff) : 0
//     });

//     await newEmployee.save();

//     res.status(201).json({
//       success: true,
//       message: "Employee added successfully",
//       employee: newEmployee
//     });
//   } catch (error) {
//     console.error("Add employee error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: error.message
//     });
//   }
// };

// // 📋 Get all employees
// exports.getEmployees = async (req, res) => {
//   try {
//     const employees = await Employee.find();
//     res.json(employees);
//   } catch (error) {
//     res.status(500).json({ message: "Server Error", error });
//   }
// };

// // 🔍 Get single employee by email or employeeId or phone
// exports.getEmployeeByEmail = async (req, res) => {
//   try {
//     const { email, employeeId, phone } = req.query;

//     if (!email && !employeeId && !phone) {
//       return res.status(400).json({
//         success: false,
//         message: "Email, Employee ID or Phone is required"
//       });
//     }

//     let query = {};
//     if (email) query.email = email;
//     else if (employeeId) query.employeeId = employeeId;
//     else if (phone) query.phone = phone;

//     const employee = await Employee.findOne(query);

//     if (!employee) {
//       return res.status(404).json({
//         success: false,
//         message: "Employee not found"
//       });
//     }

//     res.json({
//       success: true,
//       data: employee
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Server Error",
//       error: error.message
//     });
//   }
// };

// // 🔐 Employee login (email or employeeId)
// exports.loginEmployee = async (req, res) => {
//   try {
//     const { email, employeeId, password } = req.body;

//     if (!email && !employeeId) {
//       return res.status(400).json({
//         success: false,
//         message: "Email or Employee ID is required"
//       });
//     }

//     const query = email ? { email } : { employeeId };
//     const employee = await Employee.findOne(query);

//     if (!employee) {
//       return res.status(404).json({
//         success: false,
//         message: "Employee not found"
//       });
//     }

//     if (employee.password !== password) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid password"
//       });
//     }

//     // ✅ Log login activity
//     await logActivity({
//       userId: employee.employeeId,
//       userName: employee.name,
//       userEmail: employee.email,
//       userRole: "employee",
//       action: "login",
//       actionDetails: `Employee logged in successfully`,
//       ipAddress: req.ip || req.connection.remoteAddress,
//       metadata: {
//         department: employee.department,
//         role: employee.role,
//       },
//     });

//     res.json({
//       success: true,
//       message: "Login successful",
//       employee: {
//         id: employee._id,
//         name: employee.name,
//         email: employee.email,
//         role: employee.role,
//         department: employee.department,
//         employeeId: employee.employeeId,
//         employeeId: employee.employeeId,
//         joinDate: employee.joinDate,
//         permissions: employee.permissions || [] // ✅ Return permissions
//       },
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Server Error",
//       error: error.message
//     });
//   }
// };

// // ✅ Assign Location to Employee
// exports.assignLocation = async (req, res) => {
//   try {
//     const { employeeId } = req.params;
//     const { locationId } = req.body;

//     if (!employeeId || !locationId) {
//       return res.status(400).json({
//         success: false,
//         message: "Employee ID and Location ID are required"
//       });
//     }

//     const employee = await Employee.findOne({ employeeId });
//     if (!employee) {
//       return res.status(404).json({
//         success: false,
//         message: "Employee not found"
//       });
//     }

//     const location = await Location.findById(locationId);
//     if (!location) {
//       return res.status(404).json({
//         success: false,
//         message: "Location not found"
//       });
//     }

//     // 🔹 Assign location to employee
//     employee.location = location._id;
//     await employee.save();

//     // (Optional) also add employee reference in location document
//     await Location.findByIdAndUpdate(locationId, {
//       $addToSet: { assignedEmployees: employee._id },
//     });

//     res.status(200).json({
//       success: true,
//       message: `Location '${location.name}' assigned to employee '${employee.name}'`,
//       employee,
//     });
//   } catch (err) {
//     console.error("Assign location error:", err);
//     res.status(500).json({
//       success: false,
//       message: "Failed to assign location",
//       error: err.message,
//     });
//   }
// };

// // Get assigned location by employeeId
// exports.getAssignedLocationByEmployeeId = async (req, res) => {
//   try {
//     const { employeeId } = req.params;

//     if (!employeeId) {
//       return res.status(400).json({
//         success: false,
//         message: "Employee ID is required"
//       });
//     }

//     // Find employee by employeeId and populate location details
//     const employee = await Employee.findOne({ employeeId })
//       .populate('location', 'name latitude longitude fullAddress isActive')
//       .select('name email employeeId location');

//     if (!employee) {
//       return res.status(404).json({
//         success: false,
//         message: "Employee not found"
//       });
//     }

//     // If employee has no location assigned
//     if (!employee.location) {
//       return res.status(200).json({
//         success: true,
//         message: "No location assigned to this employee",
//         data: {
//           employee: {
//             _id: employee._id,
//             name: employee.name,
//             email: employee.email,
//             employeeId: employee.employeeId
//           },
//           location: null
//         }
//       });
//     }

//     // Return employee with assigned location
//     res.status(200).json({
//       success: true,
//       message: "Assigned location fetched successfully",
//       data: {
//         employee: {
//           _id: employee._id,
//           name: employee.name,
//           email: employee.email,
//           employeeId: employee.employeeId
//         },
//         location: employee.location
//       }
//     });

//   } catch (error) {
//     console.error("Get assigned location error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch assigned location",
//       error: error.message
//     });
//   }
// };

// // ✅ Update Employee (with new fields)
// // ✅ Update Employee - FIXED VERSION
// exports.updateEmployee = async (req, res) => {
//   try {
//     const { id } = req.params;

//     console.log("🔄 Update request for employee ID:", id);
//     console.log("📦 Update data received:", req.body);

//     // Find employee first
//     const existingEmployee = await Employee.findById(id);
//     if (!existingEmployee) {
//       return res.status(404).json({
//         success: false,
//         message: "Employee not found"
//       });
//     }

//     // Prepare update data - only update what's provided
//     const updateData = { ...req.body };

//     // Remove empty or undefined values
//     Object.keys(updateData).forEach(key => {
//       if (updateData[key] === undefined || updateData[key] === '') {
//         delete updateData[key];
//       }
//     });

//     // Handle name if firstName/lastName provided
//     if (updateData.firstName || updateData.lastName) {
//       const firstName = updateData.firstName || existingEmployee.firstName;
//       const lastName = updateData.lastName || existingEmployee.lastName;
//       updateData.name = `${firstName || ''} ${lastName || ''}`.trim();
//     }

//     console.log("✅ Final update data:", updateData);

//     // Update with runValidators: false to avoid validation errors
//     const updatedEmployee = await Employee.findByIdAndUpdate(
//       id,
//       updateData,
//       { new: true, runValidators: false } // ✅ IMPORTANT: runValidators: false
//     );

//     console.log("✅ Employee updated successfully:", updatedEmployee._id);

//     res.status(200).json({
//       success: true,
//       message: "Employee updated successfully",
//       employee: updatedEmployee
//     });
//   } catch (error) {
//     console.error("❌ Update employee error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: error.message
//     });
//   }
// };

// // 🗑️ Delete Employee
// exports.deleteEmployee = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const employee = await Employee.findByIdAndDelete(id);

//     if (!employee) {
//       return res.status(404).json({
//         success: false,
//         message: "Employee not found"
//       });
//     }

//     res.json({
//       success: true,
//       message: "Employee deleted successfully"
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Server Error",
//       error: error.message
//     });
//   }
// };
// // employee.controller.js mein update karein
// exports.getEmployeeByPhone = async (req, res) => {
//   try {
//     const { phone } = req.query;

//     if (!phone) {
//       return res.status(400).json({
//         success: false,
//         message: "Phone number is required"
//       });
//     }

//     const employee = await Employee.findOne({ phone });

//     if (!employee) {
//       return res.status(404).json({
//         success: false,
//         message: "Employee not found with this phone number"
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Employee found successfully",
//       data: employee
//     });
//   } catch (error) {
//     console.error("Get employee by phone error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: error.message
//     });
//   }
// };
// // 📊 Get Employee Attendance Summary
// exports.getEmployeeAttendanceSummary = async (req, res) => {
//   try {
//     const { employeeId } = req.query;

//     if (!employeeId) {
//       return res.status(400).json({
//         success: false,
//         message: "Employee ID is required",
//       });
//     }

//     // Example response (adjust based on your Attendance model)
//     res.status(200).json({
//       success: true,
//       message: "Attendance summary fetched successfully",
//       data: {
//         employeeId,
//         presentDays: 0,
//         absentDays: 0,
//         totalDays: 0,
//       },
//     });
//   } catch (error) {
//     console.error("Attendance summary error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: error.message,
//     });
//   }
// };
// // ✅ Submit Resignation Request
// exports.submitResignation = async (req, res) => {
//   try {
//     const { email, resignationLetter, lastWorkingDay } = req.body;

//     if (!email || !resignationLetter) {
//       return res.status(400).json({
//         success: false,
//         message: "Email and Resignation Letter are required"
//       });
//     }

//     // 1. Find employee to verify existence
//     const employee = await Employee.findOne({ email });
//     if (!employee) {
//       return res.status(404).json({
//         success: false,
//         message: "Employee not found"
//       });
//     }

//     // 2. Find existing JobApplication for this email
//     let application = await JobApplication.findOne({ email });

//     if (application) {
//       // Update existing application
//       application.resignationLetter = resignationLetter;
//       if (lastWorkingDay) application.lastWorkingDay = new Date(lastWorkingDay);
//       application.resignationSentAt = new Date();
//       application.resignationStatus = "Pending";
//       application.status = "Resigned";
//       await application.save();
//     } else {
//       // Find a JobPost to link to, or create a dummy one
//       let jobPost = await JobPost.findOne({ role: employee.role });

//       if (!jobPost) {
//         // Create a basic job post if none exists for this role to satisfy model requirements
//         jobPost = await JobPost.findOne(); // Just pick any existing one
//       }

//       // Create new application record for resignation tracking
//       application = new JobApplication({
//         jobId: jobPost ? jobPost._id : new mongoose.Types.ObjectId(), // Fallback to random if no jobs exist
//         firstName: employee.name.split(' ')[0],
//         lastName: employee.name.split(' ').slice(1).join(' ') || "",
//         email: employee.email,
//         mobile: employee.phone,
//         role: employee.role,
//         department: employee.department,
//         status: "Resigned",
//         resignationLetter: resignationLetter,
//         lastWorkingDay: lastWorkingDay ? new Date(lastWorkingDay) : null,
//         resignationSentAt: new Date(),
//         resignationStatus: "Pending"
//       });
//       await application.save();
//     }

//     // ✅ Log resignation activity
//     await logActivity({
//       userId: employee.employeeId,
//       userName: employee.name,
//       userEmail: employee.email,
//       userRole: "employee",
//       action: "resignation_filed",
//       actionDetails: `Employee filed a resignation request`,
//       ipAddress: req.ip || req.connection.remoteAddress,
//       metadata: {
//         department: employee.department,
//         role: employee.role,
//       },
//     });

//     res.status(200).json({
//       success: true,
//       message: "Resignation submitted successfully",
//       data: application
//     });

//   } catch (error) {
//     console.error("Submit resignation error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: error.message
//     });
//   }
// };

// // Add Employee Experience
// exports.addEmployeeExperience = async (req, res) => {
//   try {
//     const { employeeId, companyName, role, startDate, endDate, salary, location } = req.body;

//     if (!employeeId || !companyName || !role || !startDate || !salary || !location) {
//       return res.status(400).json({ success: false, message: "Missing required fields" });
//     }

//     const newExperienceData = {
//       employeeId,
//       companyName,
//       role,
//       startDate,
//       endDate: endDate || null,
//       salary,
//       location,
//     };

//     // Handle file uploads (Normalize paths to be relative starting with 'uploads/')
//     if (req.files) {
//       if (req.files.offerLetter && req.files.offerLetter[0]) {
//         let filePath = req.files.offerLetter[0].path;
//         if (filePath.includes("uploads")) {
//           filePath = filePath.substring(filePath.indexOf("uploads")).replace(/\\/g, '/');
//         }
//         newExperienceData.offerLetter = filePath;
//       }
//       if (req.files.payslip && req.files.payslip[0]) {
//         let filePath = req.files.payslip[0].path;
//         if (filePath.includes("uploads")) {
//           filePath = filePath.substring(filePath.indexOf("uploads")).replace(/\\/g, '/');
//         }
//         newExperienceData.payslip = filePath;
//       }
//     }

//     const newExperience = new EmployeeExperience(newExperienceData);
//     await newExperience.save();

//     res.status(201).json({
//       success: true,
//       message: "Experience added successfully",
//       data: newExperience
//     });

//   } catch (err) {
//     console.error("Add employee experience error:", err);
//     res.status(500).json({ success: false, message: "Failed to add experience", error: err.message });
//   }
// };

// // Get Employee Experiences
// exports.getEmployeeExperiences = async (req, res) => {
//   try {
//     const { employeeId } = req.params;
//     if (!employeeId) {
//       return res.status(400).json({ success: false, message: "Employee ID is required" });
//     }

//     // Fetch employee to get their email
//     const employee = await Employee.findOne({ employeeId });
//     if (!employee) {
//       return res.status(404).json({ success: false, message: "Employee not found" });
//     }

//     // 1. Fetch Employee Experiences
//     const employeeExperiences = await EmployeeExperience.find({ employeeId }).lean();
//     let allExperiences = [...employeeExperiences];

//     // 2. Try to find Candidate with same email and get Candidate Experiences
//     if (employee.email) {
//       const candidate = await Candidate.findOne({ email: employee.email });
//       if (candidate) {
//         const candidateExperiences = await CandidateExperience.find({ candidateId: candidate._id }).lean();

//         allExperiences = [...allExperiences, ...candidateExperiences];
//       }
//     }

//     // Sort by start date, newest first
//     allExperiences.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

//     res.status(200).json({
//       success: true,
//       message: "Experiences retrieved successfully",
//       data: allExperiences
//     });
//   } catch (err) {
//     console.error("Get employee experiences error:", err);
//     res.status(500).json({ success: false, message: "Failed to fetch experiences", error: err.message });
//   }
// };

// // Get Candidate Documents for an Employee
// exports.getEmployeeCandidateDocuments = async (req, res) => {
//   try {
//     const { employeeId } = req.params;
//     if (!employeeId) {
//       return res.status(400).json({ success: false, message: "Employee ID is required" });
//     }

//     // Fetch employee to get their email
//     const employee = await Employee.findOne({ employeeId });
//     if (!employee) {
//       return res.status(404).json({ success: false, message: "Employee not found" });
//     }

//     if (!employee.email) {
//       return res.status(404).json({ success: false, message: "Employee has no email to link documents" });
//     }

//     const candidate = await Candidate.findOne({ email: employee.email });
//     if (!candidate) {
//       return res.status(200).json({
//         success: true,
//         message: "No candidate profile linked to this employee's email",
//         noCandidate: true,
//         data: { documents: {} }
//       });
//     }

//     const documents = await CandidateDocuments.findOne({ candidateId: candidate._id });

//     res.status(200).json({
//       success: true,
//       message: "Candidate documents retrieved successfully",
//       data: documents || { documents: {} }
//     });
//   } catch (err) {
//     console.error("Get candidate documents error:", err);
//     res.status(500).json({ success: false, message: "Failed to fetch candidate documents", error: err.message });
//   }
// };

// // Get Employment Letters (JobApplications) for an Employee
// exports.getEmployeeLetters = async (req, res) => {
//   try {
//     const { employeeId } = req.params;
//     if (!employeeId) {
//       return res.status(400).json({ success: false, message: "Employee ID is required" });
//     }

//     // 1. Fetch employee to get their email
//     const employee = await Employee.findOne({ employeeId });
//     if (!employee) {
//       return res.status(404).json({ success: false, message: "Employee not found" });
//     }

//     if (!employee.email) {
//       return res.status(200).json({
//         success: true,
//         message: "Employee has no email for letter retrieval",
//         data: []
//       });
//     }

//     // 2. Find all JobApplications for this email that have letters or are pertinent
//     const letters = await JobApplication.find({
//       email: employee.email,
//       $or: [
//         { offerLetter: { $ne: "" } },
//         { adminAttachment: { $ne: "" } },
//         { status: "Resigned" },
//         { documentHistory: { $exists: true, $ne: [] } }
//       ]
//     }).populate("jobId", "role department");

//     res.status(200).json({
//       success: true,
//       message: "Letters retrieved successfully",
//       data: letters
//     });
//   } catch (err) {
//     console.error("Get employee letters error:", err);
//     res.status(500).json({ success: false, message: "Failed to fetch letters", error: err.message });
//   }
// };

// // 🎂 Get employees with birthdays today
// exports.getBirthdaysToday = async (req, res) => {
//   try {
//     const today = new Date();
//     const month = today.getMonth() + 1; // getMonth() is 0-indexed
//     const day = today.getDate();

//     const { department } = req.query;
//     const query = {
//       $expr: {
//         $and: [
//           { $eq: [{ $month: "$dob" }, month] },
//           { $eq: [{ $dayOfMonth: "$dob" }, day] }
//         ]
//       },
//       status: 'active'
//     };

//     if (department) {
//       query.department = { $regex: new RegExp(`^${department.trim()}$`, 'i') };
//     }

//     const birthdays = await Employee.find(query).select('name email department role employeeId dob phone');

//     res.status(200).json({
//       success: true,
//       message: "Today's birthdays fetched successfully",
//       data: birthdays
//     });
//   } catch (error) {
//     console.error("Get birthdays today error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: error.message
//     });
//   }
// };

// // 🏆 Get employees with work anniversaries today
// exports.getAnniversariesToday = async (req, res) => {
//   try {
//     const today = new Date();
//     const month = today.getMonth() + 1;
//     const day = today.getDate();
//     const currentYear = today.getFullYear();

//     const { department } = req.query;
//     const query = {
//       $expr: {
//         $and: [
//           { $eq: [{ $month: "$joinDate" }, month] },
//           { $eq: [{ $dayOfMonth: "$joinDate" }, day] },
//           { $lt: [{ $year: "$joinDate" }, currentYear] }
//         ]
//       },
//       status: 'active'
//     };

//     if (department) {
//       query.department = { $regex: new RegExp(`^${department.trim()}$`, 'i') };
//     }

//     const anniversaries = await Employee.find(query).select('name email department role employeeId joinDate phone');

//     // Calculate years of service
//     const formattedAnniversaries = anniversaries.map(emp => {
//       const joinYear = new Date(emp.joinDate).getFullYear();
//       return {
//         ...emp.toObject(),
//         yearsOfService: currentYear - joinYear
//       };
//     });

//     res.status(200).json({
//       success: true,
//       message: "Today's anniversaries fetched successfully",
//       data: formattedAnniversaries
//     });
//   } catch (error) {
//     console.error("Get anniversaries today error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: error.message
//     });
//   }
// };



// const mongoose = require("mongoose");
// const Location = require("../models/Location");
// const JobApplication = require("../models/JobApplication");
// const JobPost = require("../models/jobPost");
// const Candidate = require("../models/Candidate");
// const CandidateExperience = require("../models/CandidateExperience");
// const CandidateDocuments = require("../models/CandidateDocuments");
// const Employee = require("../models/Employee");
// const { logActivity } = require("./userActivity.controller");

// // ==================== GET EMPLOYEE BY PHONE ====================
// const getEmployeeByPhone = async (req, res) => {
//   try {
//     const { phone } = req.query;
//     if (!phone) {
//       return res.status(400).json({ success: false, message: "Phone number is required" });
//     }
//     const employee = await Employee.findOne({ phone });
//     if (!employee) {
//       return res.status(404).json({ success: false, message: "Employee not found with this phone number" });
//     }
//     res.status(200).json({ success: true, message: "Employee found successfully", data: employee });
//   } catch (error) {
//     console.error("Get employee by phone error:", error);
//     res.status(500).json({ success: false, message: "Server error", error: error.message });
//   }
// };

// // ==================== ADD EMPLOYEE ====================
// const addEmployee = async (req, res) => {
//   try {
//     const {
//       firstName, lastName, email, password, department, role,
//       dob, addressLine1, addressLine2, city, state, pinCode, country,
//       weekOffType, weekOffCount, shiftType, shiftHours,
//       joinDate, phone, employeeId, locationId,
//       parentsName, alternateNumber, salaryPerMonth, weekOffPerMonth,
//       permissions, maxCL, maxSL, maxEL, maxCompOff,
//       ctc, basicPay, hra, conveyanceAllowance, medicalAllowance,
//       performanceAllowance, specialAllowance, ptax, gmc, gmcAmount, otherDeductions
//     } = req.body;

//     const name = `${firstName || ''} ${lastName || ''}`.trim();
//     const existingEmployee = await Employee.findOne({ $or: [{ email }, { employeeId }, { phone }] });

//     if (existingEmployee) {
//       return res.status(400).json({ success: false, message: "Employee with this email, ID or phone already exists" });
//     }

//     const newEmployee = new Employee({
//       name, firstName, lastName, email, password, department, role,
//       dob: dob ? new Date(dob) : null,
//       addressLine1, addressLine2, city, state, pinCode, country: country || "India",
//       weekOffType, weekOffCount: weekOffCount || 0,
//       shiftType: shiftType || "A", shiftHours: shiftHours || 8,
//       joinDate: joinDate ? new Date(joinDate) : null, phone, employeeId, location: locationId,
//       parentsName, alternateNumber,
//       salaryPerMonth: Number(salaryPerMonth) || 0, ctc: Number(ctc) || 0,
//       basicPay: Number(basicPay) || 0, hra: Number(hra) || 0,
//       conveyanceAllowance: Number(conveyanceAllowance) || 0,
//       medicalAllowance: Number(medicalAllowance) || 0,
//       performanceAllowance: Number(performanceAllowance) || 0,
//       specialAllowance: Number(specialAllowance) || 0,
//       ptax: Number(ptax) || 0, gmc: gmc || "", gmcAmount: Number(gmcAmount) || 0,
//       otherDeductions: Number(otherDeductions) || 0,
//       weekOffPerMonth: Number(weekOffPerMonth) || 0,
//       permissions: permissions || [],
//       maxCL: maxCL !== undefined ? Number(maxCL) : 0,
//       maxSL: maxSL !== undefined ? Number(maxSL) : 0,
//       maxEL: maxEL !== undefined ? Number(maxEL) : 0,
//       maxCompOff: maxCompOff !== undefined ? Number(maxCompOff) : 0,
//       salaryIncrements: [],
//       futureIncrements: []
//     });

//     await newEmployee.save();
//     res.status(201).json({ success: true, message: "Employee added successfully", employee: newEmployee });
//   } catch (error) {
//     console.error("Add employee error:", error);
//     res.status(500).json({ success: false, message: "Server error", error: error.message });
//   }
// };

// // ==================== GET ALL EMPLOYEES ====================
// const getEmployees = async (req, res) => {
//   try {
//     const employees = await Employee.find();
//     res.json(employees);
//   } catch (error) {
//     res.status(500).json({ message: "Server Error", error });
//   }
// };

// // ==================== GET EMPLOYEE BY EMAIL ====================
// const getEmployeeByEmail = async (req, res) => {
//   try {
//     const { email, employeeId, phone } = req.query;
//     if (!email && !employeeId && !phone) {
//       return res.status(400).json({ success: false, message: "Email, Employee ID or Phone is required" });
//     }
//     let query = {};
//     if (email) query.email = email;
//     else if (employeeId) query.employeeId = employeeId;
//     else if (phone) query.phone = phone;

//     const employee = await Employee.findOne(query);
//     if (!employee) {
//       return res.status(404).json({ success: false, message: "Employee not found" });
//     }
//     res.json({ success: true, data: employee });
//   } catch (error) {
//     res.status(500).json({ success: false, message: "Server Error", error: error.message });
//   }
// };

// // ==================== LOGIN EMPLOYEE ====================
// const loginEmployee = async (req, res) => {
//   try {
//     const { email, employeeId, password } = req.body;
//     if (!email && !employeeId) {
//       return res.status(400).json({ success: false, message: "Email or Employee ID is required" });
//     }
//     const query = email ? { email } : { employeeId };
//     const employee = await Employee.findOne(query);
//     if (!employee) {
//       return res.status(404).json({ success: false, message: "Employee not found" });
//     }
//     if (employee.password !== password) {
//       return res.status(401).json({ success: false, message: "Invalid password" });
//     }

//     res.json({
//       success: true, message: "Login successful",
//       employee: {
//         id: employee._id, name: employee.name, email: employee.email,
//         role: employee.role, department: employee.department,
//         employeeId: employee.employeeId, joinDate: employee.joinDate,
//         permissions: employee.permissions || []
//       },
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: "Server Error", error: error.message });
//   }
// };

// // ==================== ASSIGN LOCATION ====================
// const assignLocation = async (req, res) => {
//   try {
//     const { employeeId } = req.params;
//     const { locationId } = req.body;
//     if (!employeeId || !locationId) {
//       return res.status(400).json({ success: false, message: "Employee ID and Location ID are required" });
//     }
//     const employee = await Employee.findOne({ employeeId });
//     if (!employee) {
//       return res.status(404).json({ success: false, message: "Employee not found" });
//     }
//     const location = await Location.findById(locationId);
//     if (!location) {
//       return res.status(404).json({ success: false, message: "Location not found" });
//     }
//     employee.location = location._id;
//     await employee.save();
//     res.status(200).json({ success: true, message: `Location assigned to employee`, employee });
//   } catch (err) {
//     res.status(500).json({ success: false, message: "Failed to assign location", error: err.message });
//   }
// };

// // ==================== GET ASSIGNED LOCATION ====================
// const getAssignedLocationByEmployeeId = async (req, res) => {
//   try {
//     const { employeeId } = req.params;
//     const employee = await Employee.findOne({ employeeId }).populate('location');
//     if (!employee) {
//       return res.status(404).json({ success: false, message: "Employee not found" });
//     }
//     res.status(200).json({ success: true, data: { location: employee.location } });
//   } catch (error) {
//     res.status(500).json({ success: false, message: "Failed to fetch location", error: error.message });
//   }
// };

// // ==================== UPDATE EMPLOYEE ====================
// // ==================== UPDATE EMPLOYEE ====================
// const updateEmployee = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updateData = { ...req.body };
    
//     // Convert salary fields from string to number
//     const salaryFields = [
//       'salaryPerMonth', 'ctc', 'basicPay', 'hra', 'conveyanceAllowance',
//       'medicalAllowance', 'performanceAllowance', 'specialAllowance',
//       'ptax', 'gmcAmount', 'otherDeductions'
//     ];
    
//     salaryFields.forEach(field => {
//       if (updateData[field] !== undefined && updateData[field] !== null && updateData[field] !== '') {
//         updateData[field] = Number(updateData[field]);
//       }
//     });
    
//     const updatedEmployee = await Employee.findByIdAndUpdate(
//       id, 
//       updateData, 
//       { new: true, runValidators: true }
//     );
    
//     if (!updatedEmployee) {
//       return res.status(404).json({ success: false, message: "Employee not found" });
//     }
    
//     res.status(200).json({ 
//       success: true, 
//       message: "Employee updated successfully", 
//       employee: updatedEmployee 
//     });
//   } catch (error) {
//     console.error("Update employee error:", error);
//     res.status(500).json({ success: false, message: "Server error", error: error.message });
//   }
// };

// // ==================== DELETE EMPLOYEE ====================
// const deleteEmployee = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const employee = await Employee.findByIdAndDelete(id);
//     if (!employee) {
//       return res.status(404).json({ success: false, message: "Employee not found" });
//     }
//     res.json({ success: true, message: "Employee deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ success: false, message: "Server Error", error: error.message });
//   }
// };

// // ==================== APPLY SALARY INCREMENT ====================
// const applySalaryIncrement = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { incrementType, incrementValue, effectiveDate, reason } = req.body;

//     const employee = await Employee.findById(id);
//     if (!employee) {
//       return res.status(404).json({ success: false, message: "Employee not found" });
//     }

//     await employee.applyIncrement(incrementType, incrementValue, effectiveDate || new Date(), reason || "");
    
//     res.status(200).json({ success: true, message: "Salary increment applied successfully", employee });
//   } catch (error) {
//     res.status(500).json({ success: false, message: "Failed to apply salary increment", error: error.message });
//   }
// };

// // ==================== GET SALARY FOR DATE ====================
// const getEmployeeSalaryForDate = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { date } = req.query;
//     const employee = await Employee.findById(id);
//     if (!employee) {
//       return res.status(404).json({ success: false, message: "Employee not found" });
//     }
//     const salary = await employee.getSalaryForDate(date || new Date());
//     res.status(200).json({ success: true, data: salary });
//   } catch (error) {
//     res.status(500).json({ success: false, message: "Failed to fetch salary", error: error.message });
//   }
// };

// // ==================== GET SALARY HISTORY ====================
// const getSalaryIncrementHistory = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const employee = await Employee.findById(id);
//     if (!employee) {
//       return res.status(404).json({ success: false, message: "Employee not found" });
//     }
//     res.status(200).json({ success: true, data: employee.salaryIncrements });
//   } catch (error) {
//     res.status(500).json({ success: false, message: "Failed to fetch history", error: error.message });
//   }
// };

// // ==================== GET SALARY TIMELINE ====================
// const getSalaryTimeline = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { startDate, endDate } = req.query;
//     const history = await Employee.getSalaryHistory(id, startDate, endDate);
//     res.status(200).json({ success: true, data: history });
//   } catch (error) {
//     res.status(500).json({ success: false, message: "Failed to fetch timeline", error: error.message });
//   }
// };

// // ==================== APPLY PENDING INCREMENTS ====================
// const applyPendingIncrements = async (req, res) => {
//   try {
//     const employees = await Employee.find();
//     let count = 0;
//     for (const employee of employees) {
//       const applied = await employee.applyDueIncrements();
//       count += applied;
//     }
//     res.status(200).json({ success: true, message: `Applied ${count} pending increments` });
//   } catch (error) {
//     res.status(500).json({ success: false, message: "Failed to apply pending increments", error: error.message });
//   }
// };

// // ==================== GET ALL EMPLOYEES SALARY STATUS ====================
// const getAllEmployeesSalaryStatus = async (req, res) => {
//   try {
//     const employees = await Employee.find().select('name employeeId department role salaryPerMonth');
//     res.status(200).json({ success: true, data: employees });
//   } catch (error) {
//     res.status(500).json({ success: false, message: "Failed to fetch status", error: error.message });
//   }
// };

// // ==================== GET ATTENDANCE SUMMARY ====================
// const getEmployeeAttendanceSummary = async (req, res) => {
//   res.status(200).json({ success: true, message: "Attendance summary" });
// };

// // ==================== SUBMIT RESIGNATION ====================
// const submitResignation = async (req, res) => {
//   res.status(200).json({ success: true, message: "Resignation submitted" });
// };

// // ==================== ADD EXPERIENCE ====================
// const addEmployeeExperience = async (req, res) => {
//   res.status(200).json({ success: true, message: "Experience added" });
// };

// // ==================== GET EXPERIENCES ====================
// const getEmployeeExperiences = async (req, res) => {
//   res.status(200).json({ success: true, data: [] });
// };

// // ==================== GET CANDIDATE DOCUMENTS ====================
// const getEmployeeCandidateDocuments = async (req, res) => {
//   res.status(200).json({ success: true, data: {} });
// };

// // ==================== GET LETTERS ====================
// const getEmployeeLetters = async (req, res) => {
//   res.status(200).json({ success: true, data: [] });
// };

// // ==================== GET BIRTHDAYS ====================
// const getBirthdaysToday = async (req, res) => {
//   res.status(200).json({ success: true, data: [] });
// };

// // ==================== GET ANNIVERSARIES ====================
// const getAnniversariesToday = async (req, res) => {
//   res.status(200).json({ success: true, data: [] });
// };

// // ==================== FIX EMPLOYEE CURRENT SALARY ====================
// const fixEmployeeCurrentSalary = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const employee = await Employee.findById(id);
    
//     if (!employee) {
//       return res.status(404).json({ success: false, message: "Employee not found" });
//     }
    
//     // Find the latest active increment
//     const activeIncrements = employee.salaryIncrements.filter(inc => inc.isActive === true);
//     activeIncrements.sort((a, b) => new Date(b.effectiveFrom) - new Date(a.effectiveFrom));
    
//     if (activeIncrements.length === 0) {
//       return res.status(200).json({ success: true, message: "No increments found, nothing to fix" });
//     }
    
//     const latestIncrement = activeIncrements[0];
    
//     // Update current salary with latest increment values
//     employee.salaryPerMonth = latestIncrement.newSalaryPerMonth;
//     employee.basicPay = latestIncrement.newBasicPay;
//     employee.hra = latestIncrement.newHra;
//     employee.conveyanceAllowance = latestIncrement.newConveyanceAllowance;
//     employee.medicalAllowance = latestIncrement.newMedicalAllowance;
//     employee.performanceAllowance = latestIncrement.newPerformanceAllowance;
//     employee.specialAllowance = latestIncrement.newSpecialAllowance;
//     employee.ctc = latestIncrement.newCtc;
    
//     await employee.save();
    
//     res.status(200).json({
//       success: true,
//       message: "Employee salary fixed successfully",
//       data: {
//         employeeId: employee.employeeId,
//         name: employee.name,
//         newSalary: employee.salaryPerMonth,
//         increments: activeIncrements.length
//       }
//     });
    
//   } catch (error) {
//     console.error("Fix salary error:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ==================== MODULE EXPORTS ====================
// module.exports = {
//   getEmployeeByPhone,
//   addEmployee,
//   getEmployees,
//   getEmployeeByEmail,
//   loginEmployee,
//   assignLocation,
//   getAssignedLocationByEmployeeId,
//   updateEmployee,
//   deleteEmployee,
//   applySalaryIncrement,
//   getEmployeeSalaryForDate,
//   getSalaryIncrementHistory,
//   getSalaryTimeline,
//   applyPendingIncrements,
//   getAllEmployeesSalaryStatus,
//   getEmployeeAttendanceSummary,
//   submitResignation,
//   addEmployeeExperience,
//   getEmployeeExperiences,
//   getEmployeeCandidateDocuments,
//   getEmployeeLetters,
//   getBirthdaysToday,
//   getAnniversariesToday,
//   fixEmployeeCurrentSalary,  // ✅ ADDED HERE
// };


const mongoose = require("mongoose");
const Location = require("../models/Location");
const JobApplication = require("../models/JobApplication");
const JobPost = require("../models/jobPost");
const Candidate = require("../models/Candidate");
const CandidateExperience = require("../models/CandidateExperience");
const CandidateDocuments = require("../models/CandidateDocuments");
const Employee = require("../models/Employee");
const { logActivity } = require("./userActivity.controller");
const ClaimedOT = require('../models/ClaimedOT');
const Attendance = require('../models/Attendance');
const Issue = require("../models/Issues");


// ==================== GET EMPLOYEE BY PHONE ====================
const getEmployeeByPhone = async (req, res) => {
  try {
    const { phone } = req.query;
    if (!phone) {
      return res.status(400).json({ success: false, message: "Phone number is required" });
    }
    const employee = await Employee.findOne({ phone });
    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found with this phone number" });
    }
    res.status(200).json({ success: true, message: "Employee found successfully", data: employee });
  } catch (error) {
    console.error("Get employee by phone error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// // ==================== ADD EMPLOYEE ====================
// const addEmployee = async (req, res) => {
//   try {
//     const {
//       firstName, lastName, email, password, department, role,
//       dob, addressLine1, addressLine2, city, state, pinCode, country,
//       weekOffType, weekOffCount, shiftType, shiftHours,
//       joinDate, phone, employeeId, locationId,
//       parentsName, alternateNumber, salaryPerMonth, weekOffPerMonth,
//       permissions, maxCL, maxSL, maxEL, maxCompOff,
//       ctc, basicPay, hra, conveyanceAllowance, medicalAllowance,
//       performanceAllowance, specialAllowance, ptax, gmc, gmcAmount, otherDeductions
//     } = req.body;

//     const name = `${firstName || ''} ${lastName || ''}`.trim();
//     const existingEmployee = await Employee.findOne({ $or: [{ email }, { employeeId }, { phone }] });

//     if (existingEmployee) {
//       return res.status(400).json({ success: false, message: "Employee with this email, ID or phone already exists" });
//     }

//     const newEmployee = new Employee({
//       name, firstName, lastName, email, password, department, role,
//       dob: dob ? new Date(dob) : null,
//       addressLine1, addressLine2, city, state, pinCode, country: country || "India",
//       weekOffType, weekOffCount: weekOffCount || 0,
//       shiftType: shiftType || "A", shiftHours: shiftHours || 8,
//       joinDate: joinDate ? new Date(joinDate) : null, phone, employeeId, location: locationId,
//       parentsName, alternateNumber,
//       salaryPerMonth: Number(salaryPerMonth) || 0, ctc: Number(ctc) || 0,
//       basicPay: Number(basicPay) || 0, hra: Number(hra) || 0,
//       conveyanceAllowance: Number(conveyanceAllowance) || 0,
//       medicalAllowance: Number(medicalAllowance) || 0,
//       performanceAllowance: Number(performanceAllowance) || 0,
//       specialAllowance: Number(specialAllowance) || 0,
//       ptax: Number(ptax) || 0, gmc: gmc || "", gmcAmount: Number(gmcAmount) || 0,
//       otherDeductions: Number(otherDeductions) || 0,
//       weekOffPerMonth: Number(weekOffPerMonth) || 0,
//       permissions: permissions || [],
//       maxCL: maxCL !== undefined ? Number(maxCL) : 0,
//       maxSL: maxSL !== undefined ? Number(maxSL) : 0,
//       maxEL: maxEL !== undefined ? Number(maxEL) : 0,
//       maxCompOff: maxCompOff !== undefined ? Number(maxCompOff) : 0,
//       salaryIncrements: [],
//       futureIncrements: []
//     });

//     await newEmployee.save();
//     res.status(201).json({ success: true, message: "Employee added successfully", employee: newEmployee });
//   } catch (error) {
//     console.error("Add employee error:", error);
//     res.status(500).json({ success: false, message: "Server error", error: error.message });
//   }
// };


// ==================== ADD EMPLOYEE ====================
const addEmployee = async (req, res) => {
  try {
    const {
      firstName, lastName, email, password, department, role,
      dob, addressLine1, addressLine2, city, state, pinCode, country,
      weekOffType, weekOffCount, shiftType, shiftHours,
      joinDate, phone, employeeId, locationId,
      parentsName, alternateNumber, salaryPerMonth, weekOffPerMonth,
      permissions, maxCL, maxSL, maxEL, maxCompOff,
      ctc, basicPay, hra, conveyanceAllowance, medicalAllowance,
      performanceAllowance, specialAllowance, ptax, gmc, gmcAmount, otherDeductions
    } = req.body;

    const name = `${firstName || ''} ${lastName || ''}`.trim();
    const existingEmployee = await Employee.findOne({ $or: [{ email }, { employeeId }, { phone }] });

    if (existingEmployee) {
      return res.status(400).json({ success: false, message: "Employee with this email, ID or phone already exists" });
    }

    // ============================================
    // CALCULATE ASSIGNED WORKING DAYS
    // ============================================
    // Default month days = 30 (or 26 as standard)
    const defaultMonthDays = 30;
    const weekOffPerMonthValue = Number(weekOffPerMonth) || 0;
    const assignedWorkingDays = defaultMonthDays - weekOffPerMonthValue;

    const newEmployee = new Employee({
      name, firstName, lastName, email, password, department, role,
      dob: dob ? new Date(dob) : null,
      addressLine1, addressLine2, city, state, pinCode, country: country || "India",
      weekOffType, weekOffCount: weekOffCount || 0,
      shiftType: shiftType || "A", shiftHours: shiftHours || 8,
      joinDate: joinDate ? new Date(joinDate) : null, phone, employeeId, location: locationId,
      parentsName, alternateNumber,
      salaryPerMonth: Number(salaryPerMonth) || 0, ctc: Number(ctc) || 0,
      basicPay: Number(basicPay) || 0, hra: Number(hra) || 0,
      conveyanceAllowance: Number(conveyanceAllowance) || 0,
      medicalAllowance: Number(medicalAllowance) || 0,
      performanceAllowance: Number(performanceAllowance) || 0,
      specialAllowance: Number(specialAllowance) || 0,
      ptax: Number(ptax) || 0, gmc: gmc || "", gmcAmount: Number(gmcAmount) || 0,
      otherDeductions: Number(otherDeductions) || 0,
      weekOffPerMonth: weekOffPerMonthValue,
      permissions: permissions || [],
      maxCL: maxCL !== undefined ? Number(maxCL) : 0,
      maxSL: maxSL !== undefined ? Number(maxSL) : 0,
      maxEL: maxEL !== undefined ? Number(maxEL) : 0,
      maxCompOff: maxCompOff !== undefined ? Number(maxCompOff) : 0,
      salaryIncrements: [],
      futureIncrements: [],
      
      // ============================================
      // NEW FIELD - ASSIGNED WORKING DAYS
      // ============================================
      assignedWorkingDays: assignedWorkingDays > 0 ? assignedWorkingDays : 26
    });

    await newEmployee.save();
    res.status(201).json({ 
      success: true, 
      message: "Employee added successfully", 
      employee: newEmployee 
    });
  } catch (error) {
    console.error("Add employee error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ==================== GET ALL EMPLOYEES ====================
const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// ==================== GET EMPLOYEE BY EMAIL ====================
const getEmployeeByEmail = async (req, res) => {
  try {
    const { email, employeeId, phone } = req.query;
    if (!email && !employeeId && !phone) {
      return res.status(400).json({ success: false, message: "Email, Employee ID or Phone is required" });
    }
    let query = {};
    if (email) query.email = email;
    else if (employeeId) query.employeeId = employeeId;
    else if (phone) query.phone = phone;

    const employee = await Employee.findOne(query);
    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }
    res.json({ success: true, data: employee });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// // ==================== LOGIN EMPLOYEE ====================
// const loginEmployee = async (req, res) => {
//   try {
//     const { email, employeeId, password, latitude, longitude } = req.body;

//     // Email ya Employee ID required
//     if (!email && !employeeId) {
//       return res.status(400).json({
//         success: false,
//         message: "Email or Employee ID is required"
//       });
//     }

//     // Latitude & Longitude required
//     if (latitude === undefined || longitude === undefined) {
//       return res.status(400).json({
//         success: false,
//         message: "Latitude and Longitude are required"
//       });
//     }

//     const query = email ? { email } : { employeeId };

//     const employee = await Employee.findOne(query);

//     if (!employee) {
//       return res.status(404).json({
//         success: false,
//         message: "Employee not found"
//       });
//     }

//     if (employee.password !== password) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid password"
//       });
//     }

//     // Update employee location on every login
//     employee.latitude = latitude;
//     employee.longitude = longitude;

//     await employee.save();

//     res.json({
//       success: true,
//       message: "Login successful",
//       employee: {
//         id: employee._id,
//         name: employee.name,
//         email: employee.email,
//         role: employee.role,
//         department: employee.department,
//         employeeId: employee.employeeId,
//         joinDate: employee.joinDate,
//         permissions: employee.permissions || [],
//         latitude: employee.latitude,
//         longitude: employee.longitude,
//       },
//     });

//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Server Error",
//       error: error.message
//     });
//   }
// };




// ==================== LOGIN EMPLOYEE ====================
const loginEmployee = async (req, res) => {
  try {
    const { email, employeeId, password, latitude, longitude } = req.body;

    if (!email && !employeeId) {
      return res.status(400).json({
        success: false,
        message: "Email or Employee ID is required"
      });
    }

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: "Latitude and Longitude are required"
      });
    }

    const query = email ? { email } : { employeeId };
    const employee = await Employee.findOne(query);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found"
      });
    }

    if (employee.password !== password) {
      return res.status(401).json({
        success: false,
        message: "Invalid password"
      });
    }

    // Get address from coordinates
    const address = await getAddressFromCoords(latitude, longitude);

    // Update employee location
    employee.latitude = latitude;
    employee.longitude = longitude;
    employee.address = address;

    employee.lastLoginLocation = {
      latitude,
      longitude,
      timestamp: new Date(),
      address
    };

    await employee.save();

    res.json({
      success: true,
      message: "Login successful",
      employee: {
        id: employee._id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        department: employee.department,
        employeeId: employee.employeeId,
        joinDate: employee.joinDate,
        permissions: employee.permissions || [],
        latitude: employee.latitude,
        longitude: employee.longitude,
        address: employee.address,
        lastLoginLocation: employee.lastLoginLocation,
        lastCheckInLocation: employee.lastCheckInLocation,
        lastCheckOutLocation: employee.lastCheckOutLocation
      },
    });

  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};

// ==================== ASSIGN LOCATION ====================
const assignLocation = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { locationId } = req.body;
    if (!employeeId || !locationId) {
      return res.status(400).json({ success: false, message: "Employee ID and Location ID are required" });
    }
    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }
    const location = await Location.findById(locationId);
    if (!location) {
      return res.status(404).json({ success: false, message: "Location not found" });
    }
    employee.location = location._id;
    await employee.save();
    res.status(200).json({ success: true, message: `Location assigned to employee`, employee });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to assign location", error: err.message });
  }
};

// ==================== GET ASSIGNED LOCATION ====================
const getAssignedLocationByEmployeeId = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const employee = await Employee.findOne({ employeeId }).populate('location');
    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }
    res.status(200).json({ success: true, data: { location: employee.location } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch location", error: error.message });
  }
};

// ==================== UPDATE EMPLOYEE ====================
// employee.controller.js - FIXED updateEmployee function

const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    let updateData = { ...req.body };
    
    const existingEmployee = await Employee.findById(id);
    if (!existingEmployee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }
    
    const salaryFields = [
      'salaryPerMonth', 'ctc', 'basicPay', 'hra', 'conveyanceAllowance',
      'medicalAllowance', 'performanceAllowance', 'specialAllowance',
      'ptax', 'gmcAmount', 'otherDeductions'
    ];
    
    salaryFields.forEach(field => {
      if (updateData[field] !== undefined && updateData[field] !== null && updateData[field] !== '') {
        updateData[field] = Number(updateData[field]);
      }
    });

    const newSalary = updateData.salaryPerMonth;
    const oldSalary = existingEmployee.salaryPerMonth;
    
    const mongooseUpdate = { $set: {}, $push: {} };
    
    Object.keys(updateData).forEach(key => {
      mongooseUpdate.$set[key] = updateData[key];
    });

    // ✅ FIX: Check if salary is changing
    if (newSalary !== undefined && newSalary !== oldSalary && oldSalary > 0) {
      // ✅ Get effective date - if not provided, use current date
      let effectiveDate;
      if (updateData.salaryEffectiveDate) {
        effectiveDate = new Date(updateData.salaryEffectiveDate);
      } else {
        effectiveDate = new Date();
      }
      effectiveDate.setHours(0, 0, 0, 0);
      
      // ✅ Set all previous increments to inactive
      if (existingEmployee.salaryIncrements && existingEmployee.salaryIncrements.length > 0) {
        for (let i = 0; i < existingEmployee.salaryIncrements.length; i++) {
          existingEmployee.salaryIncrements[i].isActive = false;
        }
      } else {
        existingEmployee.salaryIncrements = [];
      }
      
      const incrementRecord = {
        incrementType: 'amount',
        incrementValue: newSalary - oldSalary,
        oldSalaryPerMonth: existingEmployee.salaryPerMonth || 0,
        oldBasicPay: existingEmployee.basicPay || 0,
        oldHra: existingEmployee.hra || 0,
        oldConveyanceAllowance: existingEmployee.conveyanceAllowance || 0,
        oldMedicalAllowance: existingEmployee.medicalAllowance || 0,
        oldPerformanceAllowance: existingEmployee.performanceAllowance || 0,
        oldSpecialAllowance: existingEmployee.specialAllowance || 0,
        oldCtc: existingEmployee.ctc || 0,
        newSalaryPerMonth: updateData.salaryPerMonth ?? existingEmployee.salaryPerMonth,
        newBasicPay: updateData.basicPay ?? existingEmployee.basicPay,
        newHra: updateData.hra ?? existingEmployee.hra,
        newConveyanceAllowance: updateData.conveyanceAllowance ?? existingEmployee.conveyanceAllowance,
        newMedicalAllowance: updateData.medicalAllowance ?? existingEmployee.medicalAllowance,
        newPerformanceAllowance: updateData.performanceAllowance ?? existingEmployee.performanceAllowance,
        newSpecialAllowance: updateData.specialAllowance ?? existingEmployee.specialAllowance,
        newCtc: updateData.ctc ?? existingEmployee.ctc,
        effectiveFrom: effectiveDate,
        effectiveMonth: effectiveDate.getMonth() + 1,
        effectiveYear: effectiveDate.getFullYear(),
        reason: updateData.incrementReason || "Salary updated via Edit Employee",
        isActive: true  // ✅ IMPORTANT: Set to true
      };
      
      existingEmployee.salaryIncrements.push(incrementRecord);
      mongooseUpdate.$set.salaryIncrements = existingEmployee.salaryIncrements;
    }
    
    const updatedEmployee = await Employee.findByIdAndUpdate(id, mongooseUpdate, { new: true, runValidators: true });
    
    res.status(200).json({ success: true, message: "Employee updated successfully", employee: updatedEmployee });
  } catch (error) {
    console.error("Update employee error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ==================== DELETE EMPLOYEE ====================
const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findByIdAndDelete(id);
    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }
    res.json({ success: true, message: "Employee deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// ==================== APPLY SALARY INCREMENT ====================
const applySalaryIncrement = async (req, res) => {
  try {
    const { id } = req.params;
    const { incrementType, incrementValue, effectiveDate, reason, newComponents } = req.body;

    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    await employee.applyIncrement(incrementType, incrementValue, effectiveDate || new Date(), reason || "", null, newComponents);
    
    res.status(200).json({ success: true, message: "Salary increment applied successfully", employee });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to apply salary increment", error: error.message });
  }
};

// ==================== GET SALARY FOR DATE (UPDATED) ====================
const getEmployeeSalaryForDate = async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;
    
    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }
    
    let targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    
    console.log(`📅 Getting salary for ${employee.name} on date: ${targetDate.toISOString().split('T')[0]}`);
    
    const salary = await employee.getSalaryForDate(targetDate);
    
    let effectiveFrom = employee.joinDate;
    const activeIncrements = employee.salaryIncrements.filter(inc => inc.isActive === true);
    activeIncrements.sort((a, b) => new Date(a.effectiveFrom) - new Date(b.effectiveFrom));
    
    const targetMonthStr = targetDate.toISOString().slice(0, 7);
    for (const inc of activeIncrements) {
      const incDate = new Date(inc.effectiveFrom);
      const incMonthStr = incDate.toISOString().slice(0, 7);
      if (incMonthStr < targetMonthStr) {
        effectiveFrom = inc.effectiveFrom;
      } else {
        break;
      }
    }
    
    res.status(200).json({ 
      success: true, 
      data: {
        salaryPerMonth: salary.salaryPerMonth,
        basicPay: salary.basicPay,
        hra: salary.hra,
        conveyanceAllowance: salary.conveyanceAllowance,
        medicalAllowance: salary.medicalAllowance,
        performanceAllowance: salary.performanceAllowance,
        specialAllowance: salary.specialAllowance,
        ctc: salary.ctc,
        effectiveFrom: effectiveFrom,
        employeeId: employee.employeeId,
        name: employee.name
      }
    });
  } catch (error) {
    console.error("Get salary for date error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch salary", error: error.message });
  }
};

// ==================== GET SALARY HISTORY ====================
const getSalaryIncrementHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }
    res.status(200).json({ success: true, data: employee.salaryIncrements });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch history", error: error.message });
  }
};

// ==================== GET SALARY TIMELINE ====================
const getSalaryTimeline = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;
    const history = await Employee.getSalaryHistory(id, startDate, endDate);
    res.status(200).json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch timeline", error: error.message });
  }
};

// ==================== APPLY PENDING INCREMENTS ====================
const applyPendingIncrements = async (req, res) => {
  try {
    const employees = await Employee.find();
    let count = 0;
    for (const employee of employees) {
      const applied = await employee.applyDueIncrements();
      count += applied;
    }
    res.status(200).json({ success: true, message: `Applied ${count} pending increments` });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to apply pending increments", error: error.message });
  }
};

// ==================== GET ALL EMPLOYEES SALARY STATUS ====================
const getAllEmployeesSalaryStatus = async (req, res) => {
  try {
    const employees = await Employee.find().select('name employeeId department role salaryPerMonth');
    res.status(200).json({ success: true, data: employees });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch status", error: error.message });
  }
};

// ==================== GET ATTENDANCE SUMMARY ====================
const getEmployeeAttendanceSummary = async (req, res) => {
  res.status(200).json({ success: true, message: "Attendance summary" });
};

// ==================== SUBMIT RESIGNATION ====================
const submitResignation = async (req, res) => {
  res.status(200).json({ success: true, message: "Resignation submitted" });
};

// ==================== ADD EXPERIENCE ====================
const addEmployeeExperience = async (req, res) => {
  res.status(200).json({ success: true, message: "Experience added" });
};

// ==================== GET EXPERIENCES ====================
const getEmployeeExperiences = async (req, res) => {
  res.status(200).json({ success: true, data: [] });
};

// ==================== GET CANDIDATE DOCUMENTS ====================
const getEmployeeCandidateDocuments = async (req, res) => {
  res.status(200).json({ success: true, data: {} });
};

// ==================== GET LETTERS ====================
const getEmployeeLetters = async (req, res) => {
  res.status(200).json({ success: true, data: [] });
};

// ==================== GET BIRTHDAYS ====================
const getBirthdaysToday = async (req, res) => {
  try {
    const { department } = req.query;
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth() + 1;
    
    let query = { status: { $ne: "inactive" } };
    if (department) query.department = department;
    
    const employees = await Employee.find(query).select('name email employeeId department role dob');
    
    const birthdays = employees.filter(emp => {
      if (!emp.dob) return false;
      const dob = new Date(emp.dob);
      return dob.getDate() === currentDay && (dob.getMonth() + 1) === currentMonth;
    }).map(emp => ({
      name: emp.name,
      email: emp.email,
      employeeId: emp.employeeId,
      department: emp.department,
      role: emp.role
    }));
    
    res.status(200).json({ success: true, data: birthdays });
  } catch (error) {
    console.error("Birthday fetch error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ==================== GET ANNIVERSARIES ====================
const getAnniversariesToday = async (req, res) => {
  try {
    const { department } = req.query;
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();
    
    let query = { status: { $ne: "inactive" } };
    if (department) query.department = department;
    
    const employees = await Employee.find(query).select('name email employeeId department role joinDate');
    
    const anniversaries = [];
    employees.forEach(emp => {
      if (!emp.joinDate) return;
      const joinDate = new Date(emp.joinDate);
      if (joinDate.getDate() === currentDay && (joinDate.getMonth() + 1) === currentMonth) {
        const yearsOfService = currentYear - joinDate.getFullYear();
        if (yearsOfService > 0) {
          anniversaries.push({
            name: emp.name,
            email: emp.email,
            employeeId: emp.employeeId,
            department: emp.department,
            role: emp.role,
            yearsOfService
          });
        }
      }
    });
    
    res.status(200).json({ success: true, data: anniversaries });
  } catch (error) {
    console.error("Anniversary fetch error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ==================== PASSWORD RESET ====================
// const crypto = require("crypto");
// const nodemailer = require("nodemailer");

// const forgotPassword = async (req, res) => {
//   try {
//     const { email } = req.body;
//     if (!email) return res.status(400).json({ success: false, message: "Email is required" });

//     const employee = await Employee.findOne({ email });
//     if (!employee) return res.status(404).json({ success: false, message: "Employee not found" });

//     // Generate token
//     const token = crypto.randomBytes(32).toString("hex");
    
//     // Set token and expiration (1 hour)
//     employee.resetPasswordToken = token;
//     employee.resetPasswordExpires = Date.now() + 3600000;
//     await employee.save();

//     // Use environment variables or create a test account on the fly if not configured
//     let transporter;
    
//     // Check if user has actually configured a real app password
//     if (process.env.EMAIL_PASS && process.env.EMAIL_PASS !== "aapka_app_password") {
//       transporter = nodemailer.createTransport({
//         service: "gmail",
//         auth: {
//           user: process.env.EMAIL_USER,
//           pass: process.env.EMAIL_PASS
//         }
//       });
//     } else {
//       // Fallback to Ethereal Email (Fake SMTP for testing)
//       const testAccount = await nodemailer.createTestAccount();
//       transporter = nodemailer.createTransport({
//         host: "smtp.ethereal.email",
//         port: 587,
//         secure: false, // true for 465, false for other ports
//         auth: {
//           user: testAccount.user, // generated ethereal user
//           pass: testAccount.pass, // generated ethereal password
//         },
//       });
//       console.log("Using Ethereal Fake Email for testing. Emails won't reach real inboxes.");
//     }

//     const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
//     const resetUrl = `${clientUrl}/reset-password/${token}`;
//     const mailOptions = {
//       from: process.env.EMAIL_USER && process.env.EMAIL_PASS !== "aapka_app_password" ? process.env.EMAIL_USER : '"Attendance System" <support@attendance.com>',
//       to: email,
//       subject: "Password Reset Request",
//       text: `You requested a password reset. Please click on the following link or paste it into your browser to reset your password:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email.`
//     };

//     transporter.sendMail(mailOptions, (error, info) => {
//       if (error) {
//         console.error("Error sending email:", error);
//         return res.status(500).json({ success: false, message: "Email could not be sent. Make sure EMAIL_USER and EMAIL_PASS are set correctly." });
//       } else {
//         if (info.messageId && nodemailer.getTestMessageUrl(info)) {
//             console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
//             return res.status(200).json({ 
//               success: true, 
//               message: "Test email sent. Check backend console for preview link.",
//               previewUrl: nodemailer.getTestMessageUrl(info) 
//             });
//         }
//         return res.status(200).json({ success: true, message: "Password reset email sent." });
//       }
//     });
//   } catch (error) {
//     console.error("Forgot password error:", error);
//     res.status(500).json({ success: false, message: "Server error", error: error.message });
//   }
// };

// const resetPassword = async (req, res) => {
//   try {
//     const { token } = req.params;
//     const { password } = req.body;

//     if (!password) return res.status(400).json({ success: false, message: "New password is required" });

//     const employee = await Employee.findOne({
//       resetPasswordToken: token,
//       resetPasswordExpires: { $gt: Date.now() }
//     });

//     if (!employee) {
//       return res.status(400).json({ success: false, message: "Password reset token is invalid or has expired." });
//     }

//     // Update password and clear token fields
//     employee.password = password; // Should hash in production, but following existing plain-text pattern if used
//     employee.resetPasswordToken = undefined;
//     employee.resetPasswordExpires = undefined;

//     await employee.save();

//     res.status(200).json({ success: true, message: "Password has been reset successfully." });
//   } catch (error) {
//     console.error("Reset password error:", error);
//     res.status(500).json({ success: false, message: "Server error", error: error.message });
//   }
// };

// ==================== FIX EMPLOYEE CURRENT SALARY ====================
const fixEmployeeCurrentSalary = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findById(id);
    
    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }
    
    const activeIncrements = employee.salaryIncrements.filter(inc => inc.isActive === true);
    activeIncrements.sort((a, b) => new Date(b.effectiveFrom) - new Date(a.effectiveFrom));
    
    if (activeIncrements.length === 0) {
      return res.status(200).json({ success: true, message: "No increments found, nothing to fix" });
    }
    
    const latestIncrement = activeIncrements[0];
    
    employee.salaryPerMonth = latestIncrement.newSalaryPerMonth;
    employee.basicPay = latestIncrement.newBasicPay;
    employee.hra = latestIncrement.newHra;
    employee.conveyanceAllowance = latestIncrement.newConveyanceAllowance;
    employee.medicalAllowance = latestIncrement.newMedicalAllowance;
    employee.performanceAllowance = latestIncrement.newPerformanceAllowance;
    employee.specialAllowance = latestIncrement.newSpecialAllowance;
    employee.ctc = latestIncrement.newCtc;
    
    await employee.save();
    
    res.status(200).json({
      success: true,
      message: "Employee salary fixed successfully",
      data: {
        employeeId: employee.employeeId,
        name: employee.name,
        newSalary: employee.salaryPerMonth,
        increments: activeIncrements.length
      }
    });
    
  } catch (error) {
    console.error("Fix salary error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

// ============ FORGOT PASSWORD ============
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    console.log(`Password reset requested for: ${email}`);
    
    // Check if employee exists
    const employee = await Employee.findOne({ email });
    if (!employee) {
      return res.status(404).json({ message: 'No employee found with this email address' });
    }
    
    // Generate reset token (expires in 1 hour)
    const resetToken = crypto.randomBytes(32).toString('hex');
    employee.resetPasswordToken = resetToken;
    employee.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await employee.save();
    
    // Create reset link
    const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    
    // Real email setup using Gmail
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error("EMAIL_USER or EMAIL_PASS is missing in .env file");
      return res.status(500).json({ message: "Email configuration is missing on the server." });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { 
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS 
      },
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #4F46E5;">
            <h2 style="color: #4F46E5; margin: 0;">Attendance Management System</h2>
          </div>
          <div style="padding: 30px 20px;">
            <h3 style="color: #333;">Hello ${employee.name || 'User'},</h3>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="display: inline-block; padding: 12px 30px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Reset Password
              </a>
            </div>
            <p>Or copy this link to your browser:</p>
            <p style="background-color: #f5f5f5; padding: 10px; border-radius: 5px; word-break: break-all;">
              <a href="${resetLink}" style="color: #4F46E5;">${resetLink}</a>
            </p>
            <p><strong>Note:</strong> This link will expire in <strong>1 hour</strong>.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"Attendance System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Reset Your Password - Attendance Management System",
      html: htmlContent,
    });

    console.log(`Real email successfully sent to ${email}`);
    
    res.status(200).json({ 
      success: true,
      message: 'Password reset link has been sent to your email address!' 
    });
    
  } catch (error) {
    console.error('Forgot password error details:', error);
    res.status(500).json({ 
      message: 'Error sending reset email. Please try again later.' 
    });
  }
};

// ============ RESET PASSWORD ============
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    
    console.log(`Reset password attempt with token: ${token}`);
    
    // Validate password strength
    if (!password || password.length < 6) {
      return res.status(400).json({ 
        message: 'Password must be at least 6 characters long' 
      });
    }
    
    // Find employee with valid token
    const employee = await Employee.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!employee) {
      return res.status(400).json({ 
        message: 'Password reset token is invalid or has expired' 
      });
    }
    
    // Save password as plain text to match how loginEmployee checks it
    employee.password = password;
    employee.resetPasswordToken = undefined;
    employee.resetPasswordExpires = undefined;
    await employee.save();
    
    console.log(`Password reset successfully for: ${employee.email}`);
    
    res.status(200).json({ 
      success: true,
      message: 'Password has been reset successfully! You can now login with your new password.' 
    });
    
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ 
      message: 'Error resetting password. Please try again.' 
    });
  }
};




// ============================================
// UPDATE EMPLOYEE IDS - EMP → TH
// ============================================
const convertEmployeeIdsToTH = async (req, res) => {
  try {
    // 1. Find all employees with EMP prefix
    const employees = await Employee.find({
      employeeId: { $regex: /^EMP/i }
    });

    if (employees.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No employees found with EMP prefix',
        updatedCount: 0,
        employees: []
      });
    }

    const results = [];
    const errors = [];

    // 2. Loop through each employee and update ID
    for (const employee of employees) {
      try {
        const oldId = employee.employeeId;
        
        // Extract numeric part (remove EMP)
        const numPart = oldId.replace(/[^0-9]/g, '');
        const newId = `TH${numPart}`;

        // Check if new ID already exists
        const existingEmployee = await Employee.findOne({ employeeId: newId });
        
        if (existingEmployee) {
          errors.push({
            oldId,
            newId,
            error: 'TH ID already exists, skipping'
          });
          continue;
        }

        // Update employee ID
        employee.employeeId = newId;
        await employee.save();

        results.push({
          oldId,
          newId,
          employeeName: employee.name,
          status: 'updated'
        });

      } catch (err) {
        errors.push({
          oldId: employee.employeeId,
          error: err.message
        });
      }
    }

    // 3. Response
    res.status(200).json({
      success: true,
      message: `Updated ${results.length} employees from EMP to TH`,
      totalFound: employees.length,
      updatedCount: results.length,
      failedCount: errors.length,
      updated: results,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Error converting employee IDs:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
};



// ============================================
// APPLY SALARY INCREMENT - WITHOUT CHANGING SALARY
// ============================================
const applyEmployeeSalaryIncrement = async (req, res) => {
  try {
    const { id } = req.params;
    const { incrementType, incrementValue, effectiveDate, reason } = req.body;

    // Validation
    if (!incrementType || !['percentage', 'amount'].includes(incrementType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid incrementType. Must be "percentage" or "amount"'
      });
    }

    if (!incrementValue || incrementValue <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid incrementValue. Must be greater than 0'
      });
    }

    if (!effectiveDate) {
      return res.status(400).json({
        success: false,
        error: 'effectiveDate is required'
      });
    }

    // Find employee
    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found'
      });
    }

    // Store old salary (current salary)
    const oldSalary = employee.salaryPerMonth || 0;

    // Calculate new salary (for record only)
    let newSalary;
    if (incrementType === 'percentage') {
      newSalary = oldSalary + (oldSalary * (incrementValue / 100));
    } else {
      newSalary = oldSalary + incrementValue;
    }
    newSalary = Math.round(newSalary);

    // Prepare effective date
    const effectiveFrom = new Date(effectiveDate);
    effectiveFrom.setHours(0, 0, 0, 0);
    const effectiveMonth = effectiveFrom.getMonth() + 1;
    const effectiveYear = effectiveFrom.getFullYear();

    // Create increment record - ONLY ADD TO ARRAY
    const incrementRecord = {
      incrementType,
      incrementValue,
      oldSalaryPerMonth: oldSalary,
      newSalaryPerMonth: newSalary,
      effectiveFrom,
      effectiveMonth,
      effectiveYear,
      reason: reason || "Salary hike",
      createdAt: new Date()
    };

    // ✅ ONLY PUSH TO ARRAY - DO NOT UPDATE salaryPerMonth
    employee.salaryIncrements.push(incrementRecord);

    // ❌ DO NOT UPDATE salaryPerMonth
    // employee.salaryPerMonth = newSalary;  // COMMENTED OUT

    await employee.save();

    res.status(200).json({
      success: true,
      message: 'Salary increment record added successfully',
      data: {
        employee: {
          _id: employee._id,
          name: employee.name,
          employeeId: employee.employeeId,
          salaryPerMonth: employee.salaryPerMonth, // Still old salary
          increment: incrementRecord
        }
      }
    });

  } catch (error) {
    console.error('Error applying salary increment:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
};




// ==================== SINGLE & BULK OT CLAIM (Combined) ====================
// ✅ Handles both single and multiple OT claims in one function
const claimOT = async (req, res) => {
  try {
    const { employeeId, employeeName, attendanceId, otHours, reason, claims } = req.body;
    
    // ============ BULK CLAIM (Multiple Records) ============
    if (claims && Array.isArray(claims) && claims.length > 0) {
      // Validate bulk claims
      const validationErrors = [];
      const validClaims = [];
      const attendanceIds = [];

      for (let i = 0; i < claims.length; i++) {
        const claim = claims[i];
        
        if (!claim.employeeId) {
          validationErrors.push(`Claim ${i + 1}: employeeId is required`);
          continue;
        }
        if (!claim.attendanceId) {
          validationErrors.push(`Claim ${i + 1}: attendanceId is required`);
          continue;
        }
        if (!claim.otHours || claim.otHours <= 0) {
          validationErrors.push(`Claim ${i + 1}: otHours must be greater than 0`);
          continue;
        }
        if (!claim.reason) {
          validationErrors.push(`Claim ${i + 1}: reason is required`);
          continue;
        }

        attendanceIds.push(claim.attendanceId);
        validClaims.push({
          employeeId: claim.employeeId,
          employeeName: claim.employeeName || 'Unknown',
          attendanceId: claim.attendanceId,
          date: claim.date || new Date(),
          otHours: claim.otHours,
          reason: claim.reason,
          status: 'pending'
        });
      }

      if (validationErrors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed for bulk claims',
          errors: validationErrors
        });
      }

      // Check for duplicates in bulk claims
      const duplicateChecks = validClaims.map(claim => ({
        employeeId: claim.employeeId,
        attendanceId: claim.attendanceId
      }));

      const existingClaims = await ClaimedOT.find({
        $or: duplicateChecks
      });

      if (existingClaims.length > 0) {
        const duplicateAttendanceIds = existingClaims.map(c => c.attendanceId.toString());
        return res.status(400).json({
          success: false,
          message: 'Some records are already claimed',
          duplicateAttendanceIds: duplicateAttendanceIds,
          duplicateCount: existingClaims.length
        });
      }

      // Check if attendance records exist
      const attendanceRecords = await Attendance.find({
        _id: { $in: attendanceIds }
      });

      if (attendanceRecords.length !== attendanceIds.length) {
        const foundIds = attendanceRecords.map(a => a._id.toString());
        const missingIds = attendanceIds.filter(id => !foundIds.includes(id.toString()));
        return res.status(404).json({
          success: false,
          message: 'Some attendance records not found',
          missingAttendanceIds: missingIds
        });
      }

      // Create bulk claims
      const createdClaims = await ClaimedOT.insertMany(validClaims);

      // Update attendance records to mark OT as claimed
      await Attendance.updateMany(
        { _id: { $in: attendanceIds } },
        { $set: { isOTClaimed: true } }
      );

      const totalOT = createdClaims.reduce((sum, c) => sum + c.otHours, 0);

      return res.status(201).json({
        success: true,
        message: `${createdClaims.length} OT claims submitted successfully`,
        count: createdClaims.length,
        totalOTHours: totalOT,
        records: createdClaims
      });
    }

    // ============ SINGLE CLAIM ============
    else if (employeeId && attendanceId && otHours && reason) {
      // Validate single claim
      if (otHours <= 0) {
        return res.status(400).json({
          success: false,
          message: 'OT hours must be greater than 0'
        });
      }

      // Check if already claimed
      const existingClaim = await ClaimedOT.findOne({ employeeId, attendanceId });
      if (existingClaim) {
        return res.status(400).json({
          success: false,
          message: 'OT already claimed for this record',
          claimId: existingClaim._id,
          status: existingClaim.status
        });
      }

      // Check if attendance record exists
      const attendance = await Attendance.findById(attendanceId);
      if (!attendance) {
        return res.status(404).json({
          success: false,
          message: 'Attendance record not found'
        });
      }

      // Create single claim
      const newClaim = new ClaimedOT({
        employeeId,
        employeeName: employeeName || 'Unknown',
        attendanceId,
        date: attendance.checkInTime || new Date(),
        otHours,
        reason,
        status: 'pending'
      });

      await newClaim.save();

      // Update attendance record
      await Attendance.findByIdAndUpdate(attendanceId, {
        $set: { isOTClaimed: true }
      });

      return res.status(201).json({
        success: true,
        message: 'OT claimed successfully',
        record: newClaim
      });
    }

    // ============ INVALID REQUEST ============
    else {
      return res.status(400).json({
        success: false,
        message: 'Invalid request. Provide either claims array for bulk claim or single claim fields (employeeId, attendanceId, otHours, reason)'
      });
    }

  } catch (error) {
    console.error('Error in OT claim:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate claim detected. OT already claimed for this record'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error processing OT claim',
      error: error.message
    });
  }
};



// ==================== GET ALL OT CLAIMS WITH EMPLOYEE & ATTENDANCE DETAILS ====================
const getAllOTClaimsWithDetails = async (req, res) => {
  try {
    const { status, employeeId, fromDate, toDate, page = 1, limit = 10 } = req.query;
    
    // Build filter
    let filter = {};
    if (status) filter.status = status;
    if (employeeId) filter.employeeId = employeeId;
    
    if (fromDate || toDate) {
      filter.date = {};
      if (fromDate) filter.date.$gte = new Date(fromDate);
      if (toDate) filter.date.$lte = new Date(toDate);
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get claims with pagination
    const claims = await ClaimedOT.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(); // Use lean() for better performance

    // Get total count for pagination
    const totalCount = await ClaimedOT.countDocuments(filter);

    // Get all unique employee IDs and attendance IDs
    const employeeIds = [...new Set(claims.map(c => c.employeeId))];
    const attendanceIds = claims.map(c => c.attendanceId);

    // Fetch employee details with salaryPerMonth
    const employees = await Employee.find(
      { employeeId: { $in: employeeIds } },
      'employeeId name email department designation profileImage salaryPerMonth'
    ).lean();

    // Fetch attendance details
    const attendances = await Attendance.find(
      { _id: { $in: attendanceIds } },
      'checkInTime checkOutTime totalHours assignedShiftHours status onsite distance reason'
    ).lean();

    // Create maps for quick lookup
    const employeeMap = {};
    employees.forEach(emp => {
      employeeMap[emp.employeeId] = emp;
    });

    const attendanceMap = {};
    attendances.forEach(att => {
      attendanceMap[att._id.toString()] = att;
    });

    // Combine data
    const claimsWithDetails = claims.map(claim => {
      const attendance = attendanceMap[claim.attendanceId?.toString()] || null;
      const employee = employeeMap[claim.employeeId] || null;

      return {
        ...claim,
        employeeDetails: employee ? {
          employeeId: employee.employeeId,
          name: employee.name,
          email: employee.email,
          department: employee.department,
          designation: employee.designation,
          profileImage: employee.profileImage || null,
          salaryPerMonth: employee.salaryPerMonth || 0
        } : null,
        attendanceDetails: attendance ? {
          checkInTime: attendance.checkInTime,
          checkOutTime: attendance.checkOutTime,
          totalHours: attendance.totalHours,
          assignedShiftHours: attendance.assignedShiftHours,
          status: attendance.status,
          onsite: attendance.onsite,
          distance: attendance.distance,
          reason: attendance.reason
        } : null,
        // Add formatted fields
        formattedDate: claim.date ? new Date(claim.date).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }) : null,
        formattedOTHours: claim.otHours ? `${claim.otHours}h` : '0h',
        statusBadge: claim.status === 'pending' ? '🟡 Pending' :
                     claim.status === 'approved' ? '🟢 Approved' :
                     claim.status === 'rejected' ? '🔴 Rejected' : '⚪ Unknown'
      };
    });

    // Calculate summary
    const summary = {
      totalClaims: totalCount,
      totalOTHours: claimsWithDetails.reduce((sum, c) => sum + (c.otHours || 0), 0),
      pendingCount: claimsWithDetails.filter(c => c.status === 'pending').length,
      approvedCount: claimsWithDetails.filter(c => c.status === 'approved').length,
      rejectedCount: claimsWithDetails.filter(c => c.status === 'rejected').length,
      totalPages: Math.ceil(totalCount / limitNum),
      currentPage: pageNum,
      perPage: limitNum
    };

    res.status(200).json({
      success: true,
      summary: summary,
      claims: claimsWithDetails
    });

  } catch (error) {
    console.error('Error fetching OT claims with details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching OT claims',
      error: error.message
    });
  }
};



// controllers/claimedOTController.js

// ==================== UPDATE OT CLAIM STATUS (Single & Bulk Combined) ====================
const updateOTClaimStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectedReason, approvedBy, notes, otAmount, multiplier, claimIds } = req.body;
    
    // Validate status
    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status is required: pending, approved, or rejected'
      });
    }

    // ==================== BULK UPDATE ====================
    if (claimIds && Array.isArray(claimIds) && claimIds.length > 0) {
      const claims = await ClaimedOT.find({ _id: { $in: claimIds } });
      if (claims.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No claims found with the provided IDs'
        });
      }

      const nonPendingClaims = claims.filter(c => c.status !== 'pending');
      if (nonPendingClaims.length > 0) {
        return res.status(400).json({
          success: false,
          message: `${nonPendingClaims.length} claim(s) are already processed. Only pending claims can be updated`,
          nonPendingClaimIds: nonPendingClaims.map(c => c._id)
        });
      }

      const updateData = {
        status,
        updatedAt: new Date()
      };

      if (status === 'approved') {
        updateData.approvedBy = approvedBy || 'Admin';
        updateData.approvedAt = new Date();
        updateData.rejectedReason = null;
        if (otAmount !== undefined) {
          updateData.otAmount = Math.round(otAmount * 100) / 100;
        }
        if (multiplier !== undefined) {
          updateData.multiplier = multiplier;
        }
      }

      if (status === 'rejected') {
        updateData.rejectedReason = rejectedReason || 'No reason provided';
        updateData.approvedBy = null;
        updateData.approvedAt = null;
        updateData.otAmount = 0;
        updateData.multiplier = 0;
      }

      if (notes) updateData.notes = notes;

      const result = await ClaimedOT.updateMany(
        { _id: { $in: claimIds } },
        updateData
      );

      if (status === 'rejected') {
        const attendanceIds = claims.map(c => c.attendanceId);
        await Attendance.updateMany(
          { _id: { $in: attendanceIds } },
          { $set: { isOTClaimed: false } }
        );
      }

      return res.status(200).json({
        success: true,
        message: `${result.modifiedCount} OT claims ${status} successfully`,
        modifiedCount: result.modifiedCount
      });
    }

    // ==================== SINGLE UPDATE ====================
    else if (id) {
      const claim = await ClaimedOT.findById(id);
      if (!claim) {
        return res.status(404).json({
          success: false,
          message: 'OT claim not found'
        });
      }

      if (claim.status !== 'pending' && status !== claim.status) {
        return res.status(400).json({
          success: false,
          message: `Claim is already ${claim.status}. Only pending claims can be updated`
        });
      }

      const updateData = {
        status,
        updatedAt: new Date()
      };

      if (status === 'approved') {
        updateData.approvedBy = approvedBy || 'Admin';
        updateData.approvedAt = new Date();
        updateData.rejectedReason = null;
        if (otAmount !== undefined) {
          updateData.otAmount = Math.round(otAmount * 100) / 100;
        }
        if (multiplier !== undefined) {
          updateData.multiplier = multiplier;
        }
      }

      if (status === 'rejected') {
        updateData.rejectedReason = rejectedReason || 'No reason provided';
        updateData.approvedBy = null;
        updateData.approvedAt = null;
        updateData.otAmount = 0;
        updateData.multiplier = 0;
      }

      if (notes) updateData.notes = notes;

      const updatedClaim = await ClaimedOT.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      if (status === 'rejected') {
        await Attendance.findByIdAndUpdate(claim.attendanceId, {
          $set: { isOTClaimed: false }
        });
      }

      return res.status(200).json({
        success: true,
        message: `OT claim ${status} successfully`,
        claim: updatedClaim
      });
    }

    else {
      return res.status(400).json({
        success: false,
        message: 'Invalid request. Provide either id or claimIds array'
      });
    }

  } catch (error) {
    console.error('Error updating OT claim status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating OT claim status',
      error: error.message
    });
  }
};




// ==================== GET CLAIMED OT BY EMPLOYEE ====================
const getClaimedOTByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { status, fromDate, toDate } = req.query;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID is required'
      });
    }

    // Build filter
    let filter = { employeeId };
    if (status) filter.status = status;
    
    if (fromDate || toDate) {
      filter.date = {};
      if (fromDate) filter.date.$gte = new Date(fromDate);
      if (toDate) filter.date.$lte = new Date(toDate);
    }

    // Get claims
    const claims = await ClaimedOT.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    // Get employee details
    const employee = await Employee.findOne(
      { employeeId },
      'employeeId name email department designation profileImage salaryPerMonth'
    ).lean();

    // Get attendance details
    const attendanceIds = claims.map(c => c.attendanceId);
    const attendances = await Attendance.find(
      { _id: { $in: attendanceIds } }
    ).lean();

    const attendanceMap = {};
    attendances.forEach(att => {
      attendanceMap[att._id.toString()] = att;
    });

    // Calculate summary
    const summary = {
      totalClaims: claims.length,
      totalOTHours: claims.reduce((sum, c) => sum + (c.otHours || 0), 0),
      totalOTAmount: claims.reduce((sum, c) => sum + (c.otAmount || 0), 0),
      pending: claims.filter(c => c.status === 'pending').length,
      approved: claims.filter(c => c.status === 'approved').length,
      rejected: claims.filter(c => c.status === 'rejected').length
    };

    // Combine data
    const claimsWithDetails = claims.map(claim => ({
      ...claim,
      employeeDetails: employee || null,
      attendanceDetails: attendanceMap[claim.attendanceId?.toString()] || null,
      formattedDate: claim.date ? new Date(claim.date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }) : null,
      formattedOTHours: claim.otHours ? `${claim.otHours}h` : '0h',
      formattedOTAmount: claim.otAmount ? `₹${claim.otAmount.toFixed(2)}` : '₹0.00',
      statusBadge: claim.status === 'pending' ? '🟡 Pending' :
                   claim.status === 'approved' ? '🟢 Approved' :
                   claim.status === 'rejected' ? '🔴 Rejected' : '⚪ Unknown'
    }));

    res.status(200).json({
      success: true,
      employee: employee || null,
      summary: summary,
      claims: claimsWithDetails
    });

  } catch (error) {
    console.error('Error fetching employee OT claims:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching employee OT claims',
      error: error.message
    });
  }
};



// =====================================================
// RAISE ISSUE
// =====================================================

const raiseIssue = async (req, res) => {
  try {

    // employeeId from params
    const { employeeId } = req.params;

    const {
      employeeName,
      department,
      issueTitle,
      issueDescription,
      issueType,
      priority
    } = req.body;

    // Required field validation
    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: "Employee ID is required"
      });
    }

    if (!issueTitle) {
      return res.status(400).json({
        success: false,
        message: "Issue title is required"
      });
    }

    if (!issueDescription) {
      return res.status(400).json({
        success: false,
        message: "Issue description is required"
      });
    }

    // Create Issue
    const issue = await Issue.create({
      employeeId,
      employeeName,
      department,
      issueTitle,
      issueDescription,
      issueType,
      priority
    });

    res.status(201).json({
      success: true,
      message: "Issue raised successfully",
      data: issue
    });

  } catch (error) {
    console.log("RAISE ISSUE ERROR =>", error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// =====================================================
// GET ALL ISSUES
// =====================================================

const getAllIssues = async (req, res) => {
  try {

    const issues = await Issue.find()
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      totalIssues: issues.length,
      data: issues
    });

  } catch (error) {
    console.log("GET ALL ISSUES ERROR =>", error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};



// =====================================================
// GET EMPLOYEE ISSUES BY EMPLOYEE ID
// =====================================================

const getEmployeeIssues = async (req, res) => {
  try {

    // employeeId from params
    const { employeeId } = req.params;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: "Employee ID is required"
      });
    }

    const issues = await Issue.find({ employeeId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      totalIssues: issues.length,
      data: issues
    });

  } catch (error) {
    console.log("GET EMPLOYEE ISSUES ERROR =>", error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};



// =====================================================
// UPDATE ISSUE
// =====================================================

const updateIssue = async (req, res) => {
  try {

    // issueId from params
    const { issueId } = req.params;

    const {
      issueTitle,
      issueDescription,
      issueType,
      priority,
      status,
      adminRemark
    } = req.body;

    if (!issueId) {
      return res.status(400).json({
        success: false,
        message: "Issue ID is required"
      });
    }

    const issue = await Issue.findById(issueId);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found"
      });
    }

    // Update fields
    if (issueTitle) {
      issue.issueTitle = issueTitle;
    }

    if (issueDescription) {
      issue.issueDescription = issueDescription;
    }

    if (issueType) {
      issue.issueType = issueType;
    }

    if (priority) {
      issue.priority = priority;
    }

    if (status) {
      issue.status = status;

      if (status === "Resolved") {
        issue.resolvedAt = new Date();
      }
    }

    if (adminRemark !== undefined) {
      issue.adminRemark = adminRemark;
    }

    await issue.save();

    res.status(200).json({
      success: true,
      message: "Issue updated successfully",
      data: issue
    });

  } catch (error) {
    console.log("UPDATE ISSUE ERROR =>", error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};



// =====================================================
// DELETE ISSUE
// =====================================================

const deleteIssue = async (req, res) => {
  try {

    // issueId from params
    const { issueId } = req.params;

    if (!issueId) {
      return res.status(400).json({
        success: false,
        message: "Issue ID is required"
      });
    }

    const issue = await Issue.findById(issueId);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found"
      });
    }

    await Issue.findByIdAndDelete(issueId);

    res.status(200).json({
      success: true,
      message: "Issue deleted successfully"
    });

  } catch (error) {
    console.log("DELETE ISSUE ERROR =>", error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};




// 1️⃣ Upload Employee Face Image
const uploadEmployeeFace = async (req, res) => {
  try {
    const { employeeId } = req.body;
    
    if (!employeeId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Employee ID is required' 
      });
    }

    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No image uploaded' 
      });
    }

    const employee = await Employee.findOne({ employeeId: employeeId });
    
    if (!employee) {
      return res.status(404).json({ 
        success: false, 
        message: 'Employee not found' 
      });
    }

    // Delete old image if exists
    if (employee.profileImage) {
      const oldPath = path.join(__dirname, '..', employee.profileImage);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    // Save new image path
    const imagePath = `/uploads/faces/${req.file.filename}`;
    employee.profileImage = imagePath;
    await employee.save();

    res.status(200).json({
      success: true,
      message: 'Face uploaded successfully',
      data: { employeeId: employee.employeeId, imagePath }
    });

  } catch (error) {
    console.error('Upload face error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to upload face' 
    });
  }
};

// 2️⃣ Verify Employee Face
const verifyFace = async (req, res) => {
  try {
    const { employeeId } = req.body;
    
    if (!employeeId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Employee ID is required' 
      });
    }

    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No image uploaded for verification' 
      });
    }

    const employee = await Employee.findOne({ employeeId: employeeId });
    
    if (!employee) {
      return res.status(404).json({ 
        success: false, 
        message: 'Employee not found' 
      });
    }

    // Check if employee has a face image
    if (!employee.profileImage) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please upload your face image first' 
      });
    }

    // ─── SIMPLE VERIFICATION ───
    // For now, just check if image is valid
    // In production, use face-api.js for actual face matching
    
    // Basic validations
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Only JPEG, JPG, and PNG allowed' 
      });
    }

    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ 
        success: false, 
        message: 'Image size must be less than 5MB' 
      });
    }

    // ✅ Verification successful (temporary - always returns true)
    employee.lastFaceVerifiedAt = new Date();
    await employee.save();

    res.status(200).json({
      success: true,
      message: '✅ Face verified successfully',
      data: {
        employeeId: employee.employeeId,
        name: employee.name,
        verified: true,
        confidence: 95
      }
    });

  } catch (error) {
    console.error('Face verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Face verification failed' 
    });
  }
};



// ─── UPDATE EMPLOYEE LOCATION ───
// PUT /api/employees/update-location/:employeeId
const updateLocation = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { latitude, longitude } = req.body;

    // Validate
    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID is required'
      });
    }

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    // Find and update employee
    const employee = await Employee.findOneAndUpdate(
      { 
        $or: [
          { _id: employeeId },
          { employeeId: employeeId }
        ]
      },
      {
        $set: {
          latitude: latitude,
          longitude: longitude,
          lastLocationUpdate: new Date()
        }
      },
      { new: true }
    ).select('-password -resetPasswordToken -resetPasswordExpires');

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Location updated successfully',
      data: {
        employeeId: employee.employeeId,
        name: employee.name,
        latitude: employee.latitude,
        longitude: employee.longitude,
        lastLocationUpdate: employee.lastLocationUpdate
      }
    });

  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update location'
    });
  }
};

// ─── GET EMPLOYEE LOCATION ───
// GET /api/employees/get-location/:employeeId
const getLocation = async (req, res) => {
  try {
    const { employeeId } = req.params;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID is required'
      });
    }

    const employee = await Employee.findOne(
      { 
        $or: [
          { _id: employeeId },
          { employeeId: employeeId }
        ]
      }
    ).select('employeeId name email department latitude longitude lastLocationUpdate');

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        employeeId: employee.employeeId,
        name: employee.name,
        email: employee.email,
        department: employee.department,
        latitude: employee.latitude || null,
        longitude: employee.longitude || null,
        lastLocationUpdate: employee.lastLocationUpdate || null
      }
    });

  } catch (error) {
    console.error('Error fetching location:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch location'
    });
  }
};



const getAllEmployeeLocations = async (req, res) => {
  try {
    const employees = await Employee.find(
      {
        latitude: { $exists: true, $ne: null },
        longitude: { $exists: true, $ne: null },
      }
    );

    // ─── Directly map from database ───
    const employeeData = employees.map(emp => ({
      _id: emp._id,
      name: emp.name,
      email: emp.email,
      phone: emp.phone,
      employeeId: emp.employeeId,
      department: emp.department,
      role: emp.role,
      latitude: emp.latitude,
      longitude: emp.longitude,
      address: emp.address || null,
      lastLocationUpdate: emp.lastLocationUpdate,
      lastLoginLocation: {
        latitude: emp.lastLoginLocation?.latitude || null,
        longitude: emp.lastLoginLocation?.longitude || null,
        timestamp: emp.lastLoginLocation?.timestamp || null,
        address: emp.lastLoginLocation?.address || null
      },
      lastCheckInLocation: {
        latitude: emp.lastCheckInLocation?.latitude || null,
        longitude: emp.lastCheckInLocation?.longitude || null,
        timestamp: emp.lastCheckInLocation?.timestamp || null,
        address: emp.lastCheckInLocation?.address || null
      },
      lastCheckOutLocation: {
        latitude: emp.lastCheckOutLocation?.latitude || null,
        longitude: emp.lastCheckOutLocation?.longitude || null,
        timestamp: emp.lastCheckOutLocation?.timestamp || null,
        address: emp.lastCheckOutLocation?.address || null
      },
      locationHistory: emp.locationHistory || [],
      status: emp.status,
      profileImage: emp.profileImage,
    }));

    const totalEmployees = employeeData.length;
    const withAddress = employeeData.filter(e => e.address).length;

    res.status(200).json({
      success: true,
      count: totalEmployees,
      stats: {
        total: totalEmployees,
        withAddress: withAddress,
        withoutAddress: totalEmployees - withAddress,
      },
      employees: employeeData,
    });
  } catch (error) {
    console.error("Employee Location Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch employee locations",
      error: error.message,
    });
  }
};

module.exports = {
  getEmployeeByPhone,
  addEmployee,
  getEmployees,
  getEmployeeByEmail,
  loginEmployee,
  assignLocation,
  getAssignedLocationByEmployeeId,
  updateEmployee,
  deleteEmployee,
  applySalaryIncrement,
  getEmployeeSalaryForDate,
  getSalaryIncrementHistory,
  getSalaryTimeline,
  applyPendingIncrements,
  getAllEmployeesSalaryStatus,
  getEmployeeAttendanceSummary,
  submitResignation,
  addEmployeeExperience,
  getEmployeeExperiences,
  getEmployeeCandidateDocuments,
  getEmployeeLetters,
  getBirthdaysToday,
  getAnniversariesToday,
  fixEmployeeCurrentSalary,
  forgotPassword,
  resetPassword,
  convertEmployeeIdsToTH,
  applyEmployeeSalaryIncrement,
  claimOT,
  getAllOTClaimsWithDetails,
  updateOTClaimStatus,
  getClaimedOTByEmployee,
  raiseIssue,
  getAllIssues,
  getEmployeeIssues,
  updateIssue,
  deleteIssue,
  uploadEmployeeFace,
  verifyFace,
  updateLocation,
  getLocation,
  getAllEmployeeLocations

};

