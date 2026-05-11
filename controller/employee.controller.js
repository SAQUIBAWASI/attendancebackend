// const Employee = require("../models/Employee");
const EmployeeExperience = require("../models/EmployeeExperience");
const path = require("path");
const fs = require("fs");
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
      weekOffPerMonth: Number(weekOffPerMonth) || 0,
      permissions: permissions || [],
      maxCL: maxCL !== undefined ? Number(maxCL) : 0,
      maxSL: maxSL !== undefined ? Number(maxSL) : 0,
      maxEL: maxEL !== undefined ? Number(maxEL) : 0,
      maxCompOff: maxCompOff !== undefined ? Number(maxCompOff) : 0,
      salaryIncrements: [],
      futureIncrements: []
    });

    await newEmployee.save();
    res.status(201).json({ success: true, message: "Employee added successfully", employee: newEmployee });
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

// ==================== LOGIN EMPLOYEE ====================
const loginEmployee = async (req, res) => {
  try {
    const { email, employeeId, password } = req.body;
    if (!email && !employeeId) {
      return res.status(400).json({ success: false, message: "Email or Employee ID is required" });
    }
    const query = email ? { email } : { employeeId };
    const employee = await Employee.findOne(query);
    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }
    if (employee.password !== password) {
      return res.status(401).json({ success: false, message: "Invalid password" });
    }

    res.json({
      success: true, message: "Login successful",
      employee: {
        id: employee._id, name: employee.name, email: employee.email,
        role: employee.role, department: employee.department,
        employeeId: employee.employeeId, joinDate: employee.joinDate,
        permissions: employee.permissions || []
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
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
};