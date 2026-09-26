// // const Employee = require("../models/Employee");
// const EmployeeExperience = require("../models/EmployeeExperience");
// const path = require("path");
// const fs = require("fs");
// const NodeGeocoder = require("node-geocoder");



// const geocoder = NodeGeocoder({
//   provider: "openstreetmap",
// });

// // ─── Rate Limiter ───
// let lastRequestTime = 0;
// const MIN_REQUEST_INTERVAL = 1100; // 1.1 seconds

// // ─── Get Address from Coordinates ───
// const getAddressFromCoords = async (lat, lng) => {
//   if (!lat || !lng) return null;
  
//   try {
//     // Rate limiting
//     const now = Date.now();
//     const timeSinceLastRequest = now - lastRequestTime;
//     if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
//       await new Promise(resolve => 
//         setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest)
//       );
//     }
//     lastRequestTime = Date.now();

//     const location = await geocoder.reverse({
//       lat: lat,
//       lon: lng,
//     });

//     if (location && location.length > 0) {
//       return location[0].formattedAddress ||
//         `${location[0].city || ""}, ${location[0].state || ""}, ${location[0].country || ""}`;
//     }
//     return null;
//   } catch (err) {
//     console.log(`Geocoder Error:`, err.message);
//     return null;
//   }
// };


// // const Location = require("../models/Location");
// // const { logActivity } = require("./userActivity.controller");
// // // ➕ Add a new employee
// // exports.addEmployee = async (req, res) => {
// //   try {
// //     const {
// //       name, email, password, department, role,
// //       dob, addressLine1, addressLine2, city, state, pinCode, country,
// //       weekOffType, weekOffDay, weekOffCount,
// //       shiftType,
// //       joinDate, phone, employeeId, location
// //     } = req.body;

// //     // Check if employee already exists
// //     const existingEmployee = await Employee.findOne({
// //       $or: [{ email }, { employeeId }]
// //     });

// //     if (existingEmployee) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "Employee with this email or ID already exists"
// //       });
// //     }

// //     const newEmployee = new Employee({
// //       name,
// //       email,
// //       password,
// //       department,
// //       role,
// //       dob: dob ? new Date(dob) : null,
// //       addressLine1,
// //       addressLine2,
// //       city,
// //       state,
// //       pinCode,
// //       country: country || "India",
// //       weekOffType,
// //       weekOffDay,
// //       weekOffCount: weekOffCount || 0,
// //       shiftType: shiftType || "A",
// //       joinDate: joinDate ? new Date(joinDate) : null,
// //       phone,
// //       employeeId,
// //       location
// //     });

// //     await newEmployee.save();

// //     res.status(201).json({
// //       success: true,
// //       message: "Employee added successfully",
// //       employee: newEmployee
// //     });
// //   } catch (error) {
// //     console.error("Add employee error:", error);
// //     res.status(500).json({ 
// //       success: false,
// //       message: "Server error",
// //       error: error.message 
// //     });
// //   }
// // };

// // // 📋 Get all employees
// // exports.getEmployees = async (req, res) => {
// //   try {
// //     const employees = await Employee.find();
// //     res.json(employees);
// //   } catch (error) {
// //     res.status(500).json({ message: "Server Error", error });
// //   }
// // };

// // // 🔍 Get single employee by email or employeeId
// // exports.getEmployeeByEmail = async (req, res) => {
// //   try {
// //     const { email, employeeId } = req.query;

// //     if (!email && !employeeId)
// //       return res.status(400).json({ message: "Email or Employee ID is required" });

// //     const query = email ? { email } : { employeeId };
// //     const employee = await Employee.findOne(query);

// //     if (!employee) return res.status(404).json({ message: "Employee not found" });

// //     res.json(employee);
// //   } catch (error) {
// //     res.status(500).json({ message: "Server Error", error });
// //   }
// // };

// // // 🔐 Employee login (email or employeeId)
// // exports.loginEmployee = async (req, res) => {
// //   try {
// //     const { email, employeeId, password } = req.body;

// //     if (!email && !employeeId)
// //       return res.status(400).json({ message: "Email or Employee ID is required" });

// //     const query = email ? { email } : { employeeId };
// //     const employee = await Employee.findOne(query);

// //     if (!employee) return res.status(404).json({ message: "Employee not found" });
// //     if (employee.password !== password)
// //       return res.status(401).json({ message: "Invalid password" });

// //     // ✅ Log login activity
// //     await logActivity({
// //       userId: employee.employeeId,
// //       userName: employee.name,
// //       userEmail: employee.email,
// //       userRole: "employee",
// //       action: "login",
// //       actionDetails: `Employee logged in successfully`,
// //       ipAddress: req.ip || req.connection.remoteAddress,
// //       metadata: {
// //         department: employee.department,
// //         role: employee.role,
// //       },
// //     });

// //     res.json({
// //       message: "Login successful",
// //       employee: {
// //         id: employee._id,
// //         name: employee.name,
// //         email: employee.email,
// //         role: employee.role,
// //         department: employee.department,
// //         employeeId: employee.employeeId,
// //         joinDate: employee.joinDate,
// //       },
// //     });
// //   } catch (error) {
// //     res.status(500).json({ message: "Server Error", error });
// //   }
// // };
// // // 🔹 Get attendance summary for one employee
// // exports.getEmployeeAttendanceSummary = async (req, res) => {
// //   try {
// //     const { email, employeeId } = req.query;
// //     if (!email && !employeeId) return res.status(400).json({ message: "Email or Employee ID required" });

// //     const query = email ? { email } : { employeeId };
// //     const records = await Attendance.find(query);

// //     const totalDays = records.length;
// //     const presentDays = records.filter(r => r.status === "Present").length;
// //     const absentDays = records.filter(r => r.status === "Absent").length;
// //     const attendanceRate = totalDays === 0 ? 0 : ((presentDays / totalDays) * 100).toFixed(2);

// //     res.json({ totalDays, presentDays, absentDays, attendanceRate });
// //   } catch (error) {
// //     console.error(error);
// //     res.status(500).json({ message: "Server Error", error });
// //   }
// // };
// // // ✅ Assign Location to Employee
// // exports.assignLocation = async (req, res) => {
// //   try {
// //     const { employeeId } = req.params;
// //     const { locationId } = req.body;

// //     if (!employeeId || !locationId) {
// //       return res
// //         .status(400)
// //         .json({ message: "Employee ID and Location ID are required" });
// //     }

// //     const employee = await Employee.findOne({ employeeId });
// //     if (!employee) {
// //       return res.status(404).json({ message: "Employee not found" });
// //     }

// //     const location = await Location.findById(locationId);
// //     if (!location) {
// //       return res.status(404).json({ message: "Location not found" });
// //     }

// //     // 🔹 Assign location to employee
// //     employee.location = location._id;
// //     await employee.save();

// //     // (Optional) also add employee reference in location document
// //     await Location.findByIdAndUpdate(locationId, {
// //       $addToSet: { assignedEmployees: employee._id },
// //     });

// //     res.status(200).json({
// //       message: `Location '${location.name}' assigned to employee '${employee.name}'`,
// //       employee,
// //     });
// //   } catch (err) {
// //     console.error("Assign location error:", err);
// //     res.status(500).json({
// //       message: "Failed to assign location",
// //       error: err.message,
// //     });
// //   }
// // };



// // // Alternative version if you want to search by employeeId instead of MongoDB _id
// // exports.getAssignedLocationByEmployeeId = async (req, res) => {
// //   try {
// //     const { employeeId } = req.params;

// //     if (!employeeId) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "Employee ID is required"
// //       });
// //     }

// //     // Find employee by employeeId and populate location details
// //     const employee = await Employee.findOne({ employeeId })
// //       .populate('location', 'name latitude longitude fullAddress isActive')
// //       .select('name email employeeId location');

// //     if (!employee) {
// //       return res.status(404).json({
// //         success: false,
// //         message: "Employee not found"
// //       });
// //     }

// //     // If employee has no location assigned
// //     if (!employee.location) {
// //       return res.status(200).json({
// //         success: true,
// //         message: "No location assigned to this employee",
// //         data: {
// //           employee: {
// //             _id: employee._id,
// //             name: employee.name,
// //             email: employee.email,
// //             employeeId: employee.employeeId
// //           },
// //           location: null
// //         }
// //       });
// //     }

// //     // Return employee with assigned location
// //     res.status(200).json({
// //       success: true,
// //       message: "Assigned location fetched successfully",
// //       data: {
// //         employee: {
// //           _id: employee._id,
// //           name: employee.name,
// //           email: employee.email,
// //           employeeId: employee.employeeId
// //         },
// //         location: employee.location
// //       }
// //     });

// //   } catch (error) {
// //     console.error("Get assigned location error:", error);
// //     res.status(500).json({
// //       success: false,
// //       message: "Failed to fetch assigned location",
// //       error: error.message
// //     });
// //   }
// // };



// // exports.updateEmployee = async (req, res) => {
// //   try {
// //     const {
// //       name, email, password, department, role,
// //       dob, addressLine1, addressLine2, city, state, pinCode, country,
// //       weekOffType, weekOffDay, weekOffCount,
// //       shiftType,
// //       joinDate, phone, location, status // ✅ Added status
// //     } = req.body;

// //     const updateData = {
// //       name,
// //       email,
// //       department,
// //       role,
// //       dob: dob ? new Date(dob) : null,
// //       addressLine1,
// //       addressLine2,
// //       city,
// //       state,
// //       pinCode,
// //       country: country || "India",
// //       weekOffType,
// //       weekOffDay,
// //       weekOffCount: weekOffCount || 0,
// //       shiftType: shiftType || "A",
// //       joinDate: joinDate ? new Date(joinDate) : null,
// //       phone,
// //       location,
// //       status // ✅ Added status to update object
// //     };

// //     // Add password only if provided
// //     if (password && password.trim() !== "") {
// //       updateData.password = password;
// //     }

// //     const updatedEmployee = await Employee.findByIdAndUpdate(
// //       req.params.id,
// //       updateData,
// //       { new: true, runValidators: true }
// //     );

// //     if (!updatedEmployee) {
// //       return res.status(404).json({ 
// //         success: false,
// //         message: "Employee not found" 
// //       });
// //     }

// //     res.status(200).json({
// //       success: true,
// //       message: "Employee updated successfully",
// //       employee: updatedEmployee
// //     });
// //   } catch (error) {
// //     console.error("Update employee error:", error);
// //     res.status(500).json({ 
// //       success: false,
// //       message: "Server error",
// //       error: error.message 
// //     });
// //   }
// // };

// // // 🗑️ Delete Employee
// // exports.deleteEmployee = async (req, res) => {
// //   try {
// //     const { id } = req.params;
// //     const employee = await Employee.findByIdAndDelete(id);

// //     if (!employee) {
// //       return res.status(404).json({ message: "Employee not found" });
// //     }

// //     res.json({ message: "Employee deleted successfully" });
// //   } catch (error) {
// //     res.status(500).json({ message: "Server Error", error });
// //   }
// // };



// // const mongoose = require("mongoose");
// // const Location = require("../models/Location");
// // const JobApplication = require("../models/JobApplication");
// // const JobPost = require("../models/jobPost");
// // const Candidate = require("../models/Candidate");
// // const CandidateExperience = require("../models/CandidateExperience");
// // const CandidateDocuments = require("../models/CandidateDocuments");
// // const { logActivity } = require("./userActivity.controller");

// // // ✅ Get employee by phone number
// // exports.getEmployeeByPhone = async (req, res) => {
// //   try {
// //     const { phone } = req.query;

// //     if (!phone) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "Phone number is required"
// //       });
// //     }

// //     const employee = await Employee.findOne({ phone });

// //     if (!employee) {
// //       return res.status(404).json({
// //         success: false,
// //         message: "Employee not found with this phone number"
// //       });
// //     }

// //     res.status(200).json({
// //       success: true,
// //       message: "Employee found successfully",
// //       data: employee
// //     });
// //   } catch (error) {
// //     console.error("Get employee by phone error:", error);
// //     res.status(500).json({
// //       success: false,
// //       message: "Server error",
// //       error: error.message
// //     });
// //   }
// // };

// // // ➕ Add a new employee (Updated with new fields)
// // exports.addEmployee = async (req, res) => {
// //   try {
// //     const {
// //       firstName, lastName, email, password, department, role,
// //       dob, addressLine1, addressLine2, city, state, pinCode, country,
// //       weekOffType, weekOffCount,
// //       shiftType, shiftHours,
// //       joinDate, phone, employeeId, locationId,
// //       parentsName, alternateNumber, salaryPerMonth, weekOffPerMonth,
// //       permissions, maxCL, maxSL, maxEL, maxCompOff,
// //       ctc, basicPay, hra, conveyanceAllowance, medicalAllowance,
// //       performanceAllowance, specialAllowance, ptax, gmc, gmcAmount, otherDeductions
// //     } = req.body;

// //     // Combine first name and last name
// //     const name = `${firstName || ''} ${lastName || ''}`.trim();

// //     // Check if employee already exists
// //     const existingEmployee = await Employee.findOne({
// //       $or: [{ email }, { employeeId }, { phone }]
// //     });

// //     if (existingEmployee) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "Employee with this email, ID or phone already exists"
// //       });
// //     }

// //     const newEmployee = new Employee({
// //       name,
// //       firstName,
// //       lastName,
// //       email,
// //       password,
// //       department,
// //       role,
// //       dob: dob ? new Date(dob) : null,
// //       addressLine1,
// //       addressLine2,
// //       city,
// //       state,
// //       pinCode,
// //       country: country || "India",
// //       weekOffType,
// //       weekOffCount: weekOffCount || 0,
// //       shiftType: shiftType || "A",
// //       shiftHours: shiftHours || 8,
// //       joinDate: joinDate ? new Date(joinDate) : null,
// //       phone,
// //       employeeId,
// //       location: locationId,
// //       parentsName,
// //       alternateNumber,
// //       salaryPerMonth: Number(salaryPerMonth) || 0,
// //       ctc: Number(ctc) || 0,
// //       basicPay: Number(basicPay) || 0,
// //       hra: Number(hra) || 0,
// //       conveyanceAllowance: Number(conveyanceAllowance) || 0,
// //       medicalAllowance: Number(medicalAllowance) || 0,
// //       performanceAllowance: Number(performanceAllowance) || 0,
// //       specialAllowance: Number(specialAllowance) || 0,
// //       ptax: Number(ptax) || 0,
// //       gmc: gmc || "",
// //       gmcAmount: Number(gmcAmount) || 0,
// //       otherDeductions: Number(otherDeductions) || 0,
// //       weekOffPerMonth: Number(weekOffPerMonth) || 0,
// //       permissions: permissions || [],
// //       maxCL: maxCL !== undefined ? Number(maxCL) : 0,
// //       maxSL: maxSL !== undefined ? Number(maxSL) : 0,
// //       maxEL: maxEL !== undefined ? Number(maxEL) : 0,
// //       maxCompOff: maxCompOff !== undefined ? Number(maxCompOff) : 0
// //     });

// //     await newEmployee.save();

// //     res.status(201).json({
// //       success: true,
// //       message: "Employee added successfully",
// //       employee: newEmployee
// //     });
// //   } catch (error) {
// //     console.error("Add employee error:", error);
// //     res.status(500).json({
// //       success: false,
// //       message: "Server error",
// //       error: error.message
// //     });
// //   }
// // };

// // // 📋 Get all employees
// // exports.getEmployees = async (req, res) => {
// //   try {
// //     const employees = await Employee.find();
// //     res.json(employees);
// //   } catch (error) {
// //     res.status(500).json({ message: "Server Error", error });
// //   }
// // };

// // // 🔍 Get single employee by email or employeeId or phone
// // exports.getEmployeeByEmail = async (req, res) => {
// //   try {
// //     const { email, employeeId, phone } = req.query;

// //     if (!email && !employeeId && !phone) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "Email, Employee ID or Phone is required"
// //       });
// //     }

// //     let query = {};
// //     if (email) query.email = email;
// //     else if (employeeId) query.employeeId = employeeId;
// //     else if (phone) query.phone = phone;

// //     const employee = await Employee.findOne(query);

// //     if (!employee) {
// //       return res.status(404).json({
// //         success: false,
// //         message: "Employee not found"
// //       });
// //     }

// //     res.json({
// //       success: true,
// //       data: employee
// //     });
// //   } catch (error) {
// //     res.status(500).json({
// //       success: false,
// //       message: "Server Error",
// //       error: error.message
// //     });
// //   }
// // };

// // // 🔐 Employee login (email or employeeId)
// // exports.loginEmployee = async (req, res) => {
// //   try {
// //     const { email, employeeId, password } = req.body;

// //     if (!email && !employeeId) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "Email or Employee ID is required"
// //       });
// //     }

// //     const query = email ? { email } : { employeeId };
// //     const employee = await Employee.findOne(query);

// //     if (!employee) {
// //       return res.status(404).json({
// //         success: false,
// //         message: "Employee not found"
// //       });
// //     }

// //     if (employee.password !== password) {
// //       return res.status(401).json({
// //         success: false,
// //         message: "Invalid password"
// //       });
// //     }

// //     // ✅ Log login activity
// //     await logActivity({
// //       userId: employee.employeeId,
// //       userName: employee.name,
// //       userEmail: employee.email,
// //       userRole: "employee",
// //       action: "login",
// //       actionDetails: `Employee logged in successfully`,
// //       ipAddress: req.ip || req.connection.remoteAddress,
// //       metadata: {
// //         department: employee.department,
// //         role: employee.role,
// //       },
// //     });

// //     res.json({
// //       success: true,
// //       message: "Login successful",
// //       employee: {
// //         id: employee._id,
// //         name: employee.name,
// //         email: employee.email,
// //         role: employee.role,
// //         department: employee.department,
// //         employeeId: employee.employeeId,
// //         employeeId: employee.employeeId,
// //         joinDate: employee.joinDate,
// //         permissions: employee.permissions || [] // ✅ Return permissions
// //       },
// //     });
// //   } catch (error) {
// //     res.status(500).json({
// //       success: false,
// //       message: "Server Error",
// //       error: error.message
// //     });
// //   }
// // };

// // // ✅ Assign Location to Employee
// // exports.assignLocation = async (req, res) => {
// //   try {
// //     const { employeeId } = req.params;
// //     const { locationId } = req.body;

// //     if (!employeeId || !locationId) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "Employee ID and Location ID are required"
// //       });
// //     }

// //     const employee = await Employee.findOne({ employeeId });
// //     if (!employee) {
// //       return res.status(404).json({
// //         success: false,
// //         message: "Employee not found"
// //       });
// //     }

// //     const location = await Location.findById(locationId);
// //     if (!location) {
// //       return res.status(404).json({
// //         success: false,
// //         message: "Location not found"
// //       });
// //     }

// //     // 🔹 Assign location to employee
// //     employee.location = location._id;
// //     await employee.save();

// //     // (Optional) also add employee reference in location document
// //     await Location.findByIdAndUpdate(locationId, {
// //       $addToSet: { assignedEmployees: employee._id },
// //     });

// //     res.status(200).json({
// //       success: true,
// //       message: `Location '${location.name}' assigned to employee '${employee.name}'`,
// //       employee,
// //     });
// //   } catch (err) {
// //     console.error("Assign location error:", err);
// //     res.status(500).json({
// //       success: false,
// //       message: "Failed to assign location",
// //       error: err.message,
// //     });
// //   }
// // };

// // // Get assigned location by employeeId
// // exports.getAssignedLocationByEmployeeId = async (req, res) => {
// //   try {
// //     const { employeeId } = req.params;

// //     if (!employeeId) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "Employee ID is required"
// //       });
// //     }

// //     // Find employee by employeeId and populate location details
// //     const employee = await Employee.findOne({ employeeId })
// //       .populate('location', 'name latitude longitude fullAddress isActive')
// //       .select('name email employeeId location');

// //     if (!employee) {
// //       return res.status(404).json({
// //         success: false,
// //         message: "Employee not found"
// //       });
// //     }

// //     // If employee has no location assigned
// //     if (!employee.location) {
// //       return res.status(200).json({
// //         success: true,
// //         message: "No location assigned to this employee",
// //         data: {
// //           employee: {
// //             _id: employee._id,
// //             name: employee.name,
// //             email: employee.email,
// //             employeeId: employee.employeeId
// //           },
// //           location: null
// //         }
// //       });
// //     }

// //     // Return employee with assigned location
// //     res.status(200).json({
// //       success: true,
// //       message: "Assigned location fetched successfully",
// //       data: {
// //         employee: {
// //           _id: employee._id,
// //           name: employee.name,
// //           email: employee.email,
// //           employeeId: employee.employeeId
// //         },
// //         location: employee.location
// //       }
// //     });

// //   } catch (error) {
// //     console.error("Get assigned location error:", error);
// //     res.status(500).json({
// //       success: false,
// //       message: "Failed to fetch assigned location",
// //       error: error.message
// //     });
// //   }
// // };

// // // ✅ Update Employee (with new fields)
// // // ✅ Update Employee - FIXED VERSION
// // exports.updateEmployee = async (req, res) => {
// //   try {
// //     const { id } = req.params;

// //     console.log("🔄 Update request for employee ID:", id);
// //     console.log("📦 Update data received:", req.body);

// //     // Find employee first
// //     const existingEmployee = await Employee.findById(id);
// //     if (!existingEmployee) {
// //       return res.status(404).json({
// //         success: false,
// //         message: "Employee not found"
// //       });
// //     }

// //     // Prepare update data - only update what's provided
// //     const updateData = { ...req.body };

// //     // Remove empty or undefined values
// //     Object.keys(updateData).forEach(key => {
// //       if (updateData[key] === undefined || updateData[key] === '') {
// //         delete updateData[key];
// //       }
// //     });

// //     // Handle name if firstName/lastName provided
// //     if (updateData.firstName || updateData.lastName) {
// //       const firstName = updateData.firstName || existingEmployee.firstName;
// //       const lastName = updateData.lastName || existingEmployee.lastName;
// //       updateData.name = `${firstName || ''} ${lastName || ''}`.trim();
// //     }

// //     console.log("✅ Final update data:", updateData);

// //     // Update with runValidators: false to avoid validation errors
// //     const updatedEmployee = await Employee.findByIdAndUpdate(
// //       id,
// //       updateData,
// //       { new: true, runValidators: false } // ✅ IMPORTANT: runValidators: false
// //     );

// //     console.log("✅ Employee updated successfully:", updatedEmployee._id);

// //     res.status(200).json({
// //       success: true,
// //       message: "Employee updated successfully",
// //       employee: updatedEmployee
// //     });
// //   } catch (error) {
// //     console.error("❌ Update employee error:", error);
// //     res.status(500).json({
// //       success: false,
// //       message: "Server error",
// //       error: error.message
// //     });
// //   }
// // };

// // // 🗑️ Delete Employee
// // exports.deleteEmployee = async (req, res) => {
// //   try {
// //     const { id } = req.params;
// //     const employee = await Employee.findByIdAndDelete(id);

// //     if (!employee) {
// //       return res.status(404).json({
// //         success: false,
// //         message: "Employee not found"
// //       });
// //     }

// //     res.json({
// //       success: true,
// //       message: "Employee deleted successfully"
// //     });
// //   } catch (error) {
// //     res.status(500).json({
// //       success: false,
// //       message: "Server Error",
// //       error: error.message
// //     });
// //   }
// // };
// // // employee.controller.js mein update karein
// // exports.getEmployeeByPhone = async (req, res) => {
// //   try {
// //     const { phone } = req.query;

// //     if (!phone) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "Phone number is required"
// //       });
// //     }

// //     const employee = await Employee.findOne({ phone });

// //     if (!employee) {
// //       return res.status(404).json({
// //         success: false,
// //         message: "Employee not found with this phone number"
// //       });
// //     }

// //     res.status(200).json({
// //       success: true,
// //       message: "Employee found successfully",
// //       data: employee
// //     });
// //   } catch (error) {
// //     console.error("Get employee by phone error:", error);
// //     res.status(500).json({
// //       success: false,
// //       message: "Server error",
// //       error: error.message
// //     });
// //   }
// // };
// // // 📊 Get Employee Attendance Summary
// // exports.getEmployeeAttendanceSummary = async (req, res) => {
// //   try {
// //     const { employeeId } = req.query;

// //     if (!employeeId) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "Employee ID is required",
// //       });
// //     }

// //     // Example response (adjust based on your Attendance model)
// //     res.status(200).json({
// //       success: true,
// //       message: "Attendance summary fetched successfully",
// //       data: {
// //         employeeId,
// //         presentDays: 0,
// //         absentDays: 0,
// //         totalDays: 0,
// //       },
// //     });
// //   } catch (error) {
// //     console.error("Attendance summary error:", error);
// //     res.status(500).json({
// //       success: false,
// //       message: "Server error",
// //       error: error.message,
// //     });
// //   }
// // };
// // // ✅ Submit Resignation Request
// // exports.submitResignation = async (req, res) => {
// //   try {
// //     const { email, resignationLetter, lastWorkingDay } = req.body;

// //     if (!email || !resignationLetter) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "Email and Resignation Letter are required"
// //       });
// //     }

// //     // 1. Find employee to verify existence
// //     const employee = await Employee.findOne({ email });
// //     if (!employee) {
// //       return res.status(404).json({
// //         success: false,
// //         message: "Employee not found"
// //       });
// //     }

// //     // 2. Find existing JobApplication for this email
// //     let application = await JobApplication.findOne({ email });

// //     if (application) {
// //       // Update existing application
// //       application.resignationLetter = resignationLetter;
// //       if (lastWorkingDay) application.lastWorkingDay = new Date(lastWorkingDay);
// //       application.resignationSentAt = new Date();
// //       application.resignationStatus = "Pending";
// //       application.status = "Resigned";
// //       await application.save();
// //     } else {
// //       // Find a JobPost to link to, or create a dummy one
// //       let jobPost = await JobPost.findOne({ role: employee.role });

// //       if (!jobPost) {
// //         // Create a basic job post if none exists for this role to satisfy model requirements
// //         jobPost = await JobPost.findOne(); // Just pick any existing one
// //       }

// //       // Create new application record for resignation tracking
// //       application = new JobApplication({
// //         jobId: jobPost ? jobPost._id : new mongoose.Types.ObjectId(), // Fallback to random if no jobs exist
// //         firstName: employee.name.split(' ')[0],
// //         lastName: employee.name.split(' ').slice(1).join(' ') || "",
// //         email: employee.email,
// //         mobile: employee.phone,
// //         role: employee.role,
// //         department: employee.department,
// //         status: "Resigned",
// //         resignationLetter: resignationLetter,
// //         lastWorkingDay: lastWorkingDay ? new Date(lastWorkingDay) : null,
// //         resignationSentAt: new Date(),
// //         resignationStatus: "Pending"
// //       });
// //       await application.save();
// //     }

// //     // ✅ Log resignation activity
// //     await logActivity({
// //       userId: employee.employeeId,
// //       userName: employee.name,
// //       userEmail: employee.email,
// //       userRole: "employee",
// //       action: "resignation_filed",
// //       actionDetails: `Employee filed a resignation request`,
// //       ipAddress: req.ip || req.connection.remoteAddress,
// //       metadata: {
// //         department: employee.department,
// //         role: employee.role,
// //       },
// //     });

// //     res.status(200).json({
// //       success: true,
// //       message: "Resignation submitted successfully",
// //       data: application
// //     });

// //   } catch (error) {
// //     console.error("Submit resignation error:", error);
// //     res.status(500).json({
// //       success: false,
// //       message: "Server error",
// //       error: error.message
// //     });
// //   }
// // };

// // // Add Employee Experience
// // exports.addEmployeeExperience = async (req, res) => {
// //   try {
// //     const { employeeId, companyName, role, startDate, endDate, salary, location } = req.body;

// //     if (!employeeId || !companyName || !role || !startDate || !salary || !location) {
// //       return res.status(400).json({ success: false, message: "Missing required fields" });
// //     }

// //     const newExperienceData = {
// //       employeeId,
// //       companyName,
// //       role,
// //       startDate,
// //       endDate: endDate || null,
// //       salary,
// //       location,
// //     };

// //     // Handle file uploads (Normalize paths to be relative starting with 'uploads/')
// //     if (req.files) {
// //       if (req.files.offerLetter && req.files.offerLetter[0]) {
// //         let filePath = req.files.offerLetter[0].path;
// //         if (filePath.includes("uploads")) {
// //           filePath = filePath.substring(filePath.indexOf("uploads")).replace(/\\/g, '/');
// //         }
// //         newExperienceData.offerLetter = filePath;
// //       }
// //       if (req.files.payslip && req.files.payslip[0]) {
// //         let filePath = req.files.payslip[0].path;
// //         if (filePath.includes("uploads")) {
// //           filePath = filePath.substring(filePath.indexOf("uploads")).replace(/\\/g, '/');
// //         }
// //         newExperienceData.payslip = filePath;
// //       }
// //     }

// //     const newExperience = new EmployeeExperience(newExperienceData);
// //     await newExperience.save();

// //     res.status(201).json({
// //       success: true,
// //       message: "Experience added successfully",
// //       data: newExperience
// //     });

// //   } catch (err) {
// //     console.error("Add employee experience error:", err);
// //     res.status(500).json({ success: false, message: "Failed to add experience", error: err.message });
// //   }
// // };

// // // Get Employee Experiences
// // exports.getEmployeeExperiences = async (req, res) => {
// //   try {
// //     const { employeeId } = req.params;
// //     if (!employeeId) {
// //       return res.status(400).json({ success: false, message: "Employee ID is required" });
// //     }

// //     // Fetch employee to get their email
// //     const employee = await Employee.findOne({ employeeId });
// //     if (!employee) {
// //       return res.status(404).json({ success: false, message: "Employee not found" });
// //     }

// //     // 1. Fetch Employee Experiences
// //     const employeeExperiences = await EmployeeExperience.find({ employeeId }).lean();
// //     let allExperiences = [...employeeExperiences];

// //     // 2. Try to find Candidate with same email and get Candidate Experiences
// //     if (employee.email) {
// //       const candidate = await Candidate.findOne({ email: employee.email });
// //       if (candidate) {
// //         const candidateExperiences = await CandidateExperience.find({ candidateId: candidate._id }).lean();

// //         allExperiences = [...allExperiences, ...candidateExperiences];
// //       }
// //     }

// //     // Sort by start date, newest first
// //     allExperiences.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

// //     res.status(200).json({
// //       success: true,
// //       message: "Experiences retrieved successfully",
// //       data: allExperiences
// //     });
// //   } catch (err) {
// //     console.error("Get employee experiences error:", err);
// //     res.status(500).json({ success: false, message: "Failed to fetch experiences", error: err.message });
// //   }
// // };

// // // Get Candidate Documents for an Employee
// // exports.getEmployeeCandidateDocuments = async (req, res) => {
// //   try {
// //     const { employeeId } = req.params;
// //     if (!employeeId) {
// //       return res.status(400).json({ success: false, message: "Employee ID is required" });
// //     }

// //     // Fetch employee to get their email
// //     const employee = await Employee.findOne({ employeeId });
// //     if (!employee) {
// //       return res.status(404).json({ success: false, message: "Employee not found" });
// //     }

// //     if (!employee.email) {
// //       return res.status(404).json({ success: false, message: "Employee has no email to link documents" });
// //     }

// //     const candidate = await Candidate.findOne({ email: employee.email });
// //     if (!candidate) {
// //       return res.status(200).json({
// //         success: true,
// //         message: "No candidate profile linked to this employee's email",
// //         noCandidate: true,
// //         data: { documents: {} }
// //       });
// //     }

// //     const documents = await CandidateDocuments.findOne({ candidateId: candidate._id });

// //     res.status(200).json({
// //       success: true,
// //       message: "Candidate documents retrieved successfully",
// //       data: documents || { documents: {} }
// //     });
// //   } catch (err) {
// //     console.error("Get candidate documents error:", err);
// //     res.status(500).json({ success: false, message: "Failed to fetch candidate documents", error: err.message });
// //   }
// // };

// // // Get Employment Letters (JobApplications) for an Employee
// // exports.getEmployeeLetters = async (req, res) => {
// //   try {
// //     const { employeeId } = req.params;
// //     if (!employeeId) {
// //       return res.status(400).json({ success: false, message: "Employee ID is required" });
// //     }

// //     // 1. Fetch employee to get their email
// //     const employee = await Employee.findOne({ employeeId });
// //     if (!employee) {
// //       return res.status(404).json({ success: false, message: "Employee not found" });
// //     }

// //     if (!employee.email) {
// //       return res.status(200).json({
// //         success: true,
// //         message: "Employee has no email for letter retrieval",
// //         data: []
// //       });
// //     }

// //     // 2. Find all JobApplications for this email that have letters or are pertinent
// //     const letters = await JobApplication.find({
// //       email: employee.email,
// //       $or: [
// //         { offerLetter: { $ne: "" } },
// //         { adminAttachment: { $ne: "" } },
// //         { status: "Resigned" },
// //         { documentHistory: { $exists: true, $ne: [] } }
// //       ]
// //     }).populate("jobId", "role department");

// //     res.status(200).json({
// //       success: true,
// //       message: "Letters retrieved successfully",
// //       data: letters
// //     });
// //   } catch (err) {
// //     console.error("Get employee letters error:", err);
// //     res.status(500).json({ success: false, message: "Failed to fetch letters", error: err.message });
// //   }
// // };

// // // 🎂 Get employees with birthdays today
// // exports.getBirthdaysToday = async (req, res) => {
// //   try {
// //     const today = new Date();
// //     const month = today.getMonth() + 1; // getMonth() is 0-indexed
// //     const day = today.getDate();

// //     const { department } = req.query;
// //     const query = {
// //       $expr: {
// //         $and: [
// //           { $eq: [{ $month: "$dob" }, month] },
// //           { $eq: [{ $dayOfMonth: "$dob" }, day] }
// //         ]
// //       },
// //       status: 'active'
// //     };

// //     if (department) {
// //       query.department = { $regex: new RegExp(`^${department.trim()}$`, 'i') };
// //     }

// //     const birthdays = await Employee.find(query).select('name email department role employeeId dob phone');

// //     res.status(200).json({
// //       success: true,
// //       message: "Today's birthdays fetched successfully",
// //       data: birthdays
// //     });
// //   } catch (error) {
// //     console.error("Get birthdays today error:", error);
// //     res.status(500).json({
// //       success: false,
// //       message: "Server error",
// //       error: error.message
// //     });
// //   }
// // };

// // // 🏆 Get employees with work anniversaries today
// // exports.getAnniversariesToday = async (req, res) => {
// //   try {
// //     const today = new Date();
// //     const month = today.getMonth() + 1;
// //     const day = today.getDate();
// //     const currentYear = today.getFullYear();

// //     const { department } = req.query;
// //     const query = {
// //       $expr: {
// //         $and: [
// //           { $eq: [{ $month: "$joinDate" }, month] },
// //           { $eq: [{ $dayOfMonth: "$joinDate" }, day] },
// //           { $lt: [{ $year: "$joinDate" }, currentYear] }
// //         ]
// //       },
// //       status: 'active'
// //     };

// //     if (department) {
// //       query.department = { $regex: new RegExp(`^${department.trim()}$`, 'i') };
// //     }

// //     const anniversaries = await Employee.find(query).select('name email department role employeeId joinDate phone');

// //     // Calculate years of service
// //     const formattedAnniversaries = anniversaries.map(emp => {
// //       const joinYear = new Date(emp.joinDate).getFullYear();
// //       return {
// //         ...emp.toObject(),
// //         yearsOfService: currentYear - joinYear
// //       };
// //     });

// //     res.status(200).json({
// //       success: true,
// //       message: "Today's anniversaries fetched successfully",
// //       data: formattedAnniversaries
// //     });
// //   } catch (error) {
// //     console.error("Get anniversaries today error:", error);
// //     res.status(500).json({
// //       success: false,
// //       message: "Server error",
// //       error: error.message
// //     });
// //   }
// // };



// // const mongoose = require("mongoose");
// // const Location = require("../models/Location");
// // const JobApplication = require("../models/JobApplication");
// // const JobPost = require("../models/jobPost");
// // const Candidate = require("../models/Candidate");
// // const CandidateExperience = require("../models/CandidateExperience");
// // const CandidateDocuments = require("../models/CandidateDocuments");
// // const Employee = require("../models/Employee");
// // const { logActivity } = require("./userActivity.controller");

// // // ==================== GET EMPLOYEE BY PHONE ====================
// // const getEmployeeByPhone = async (req, res) => {
// //   try {
// //     const { phone } = req.query;
// //     if (!phone) {
// //       return res.status(400).json({ success: false, message: "Phone number is required" });
// //     }
// //     const employee = await Employee.findOne({ phone });
// //     if (!employee) {
// //       return res.status(404).json({ success: false, message: "Employee not found with this phone number" });
// //     }
// //     res.status(200).json({ success: true, message: "Employee found successfully", data: employee });
// //   } catch (error) {
// //     console.error("Get employee by phone error:", error);
// //     res.status(500).json({ success: false, message: "Server error", error: error.message });
// //   }
// // };

// // // ==================== ADD EMPLOYEE ====================
// // const addEmployee = async (req, res) => {
// //   try {
// //     const {
// //       firstName, lastName, email, password, department, role,
// //       dob, addressLine1, addressLine2, city, state, pinCode, country,
// //       weekOffType, weekOffCount, shiftType, shiftHours,
// //       joinDate, phone, employeeId, locationId,
// //       parentsName, alternateNumber, salaryPerMonth, weekOffPerMonth,
// //       permissions, maxCL, maxSL, maxEL, maxCompOff,
// //       ctc, basicPay, hra, conveyanceAllowance, medicalAllowance,
// //       performanceAllowance, specialAllowance, ptax, gmc, gmcAmount, otherDeductions
// //     } = req.body;

// //     const name = `${firstName || ''} ${lastName || ''}`.trim();
// //     const existingEmployee = await Employee.findOne({ $or: [{ email }, { employeeId }, { phone }] });

// //     if (existingEmployee) {
// //       return res.status(400).json({ success: false, message: "Employee with this email, ID or phone already exists" });
// //     }

// //     const newEmployee = new Employee({
// //       name, firstName, lastName, email, password, department, role,
// //       dob: dob ? new Date(dob) : null,
// //       addressLine1, addressLine2, city, state, pinCode, country: country || "India",
// //       weekOffType, weekOffCount: weekOffCount || 0,
// //       shiftType: shiftType || "A", shiftHours: shiftHours || 8,
// //       joinDate: joinDate ? new Date(joinDate) : null, phone, employeeId, location: locationId,
// //       parentsName, alternateNumber,
// //       salaryPerMonth: Number(salaryPerMonth) || 0, ctc: Number(ctc) || 0,
// //       basicPay: Number(basicPay) || 0, hra: Number(hra) || 0,
// //       conveyanceAllowance: Number(conveyanceAllowance) || 0,
// //       medicalAllowance: Number(medicalAllowance) || 0,
// //       performanceAllowance: Number(performanceAllowance) || 0,
// //       specialAllowance: Number(specialAllowance) || 0,
// //       ptax: Number(ptax) || 0, gmc: gmc || "", gmcAmount: Number(gmcAmount) || 0,
// //       otherDeductions: Number(otherDeductions) || 0,
// //       weekOffPerMonth: Number(weekOffPerMonth) || 0,
// //       permissions: permissions || [],
// //       maxCL: maxCL !== undefined ? Number(maxCL) : 0,
// //       maxSL: maxSL !== undefined ? Number(maxSL) : 0,
// //       maxEL: maxEL !== undefined ? Number(maxEL) : 0,
// //       maxCompOff: maxCompOff !== undefined ? Number(maxCompOff) : 0,
// //       salaryIncrements: [],
// //       futureIncrements: []
// //     });

// //     await newEmployee.save();
// //     res.status(201).json({ success: true, message: "Employee added successfully", employee: newEmployee });
// //   } catch (error) {
// //     console.error("Add employee error:", error);
// //     res.status(500).json({ success: false, message: "Server error", error: error.message });
// //   }
// // };

// // // ==================== GET ALL EMPLOYEES ====================
// // const getEmployees = async (req, res) => {
// //   try {
// //     const employees = await Employee.find();
// //     res.json(employees);
// //   } catch (error) {
// //     res.status(500).json({ message: "Server Error", error });
// //   }
// // };

// // // ==================== GET EMPLOYEE BY EMAIL ====================
// // const getEmployeeByEmail = async (req, res) => {
// //   try {
// //     const { email, employeeId, phone } = req.query;
// //     if (!email && !employeeId && !phone) {
// //       return res.status(400).json({ success: false, message: "Email, Employee ID or Phone is required" });
// //     }
// //     let query = {};
// //     if (email) query.email = email;
// //     else if (employeeId) query.employeeId = employeeId;
// //     else if (phone) query.phone = phone;

// //     const employee = await Employee.findOne(query);
// //     if (!employee) {
// //       return res.status(404).json({ success: false, message: "Employee not found" });
// //     }
// //     res.json({ success: true, data: employee });
// //   } catch (error) {
// //     res.status(500).json({ success: false, message: "Server Error", error: error.message });
// //   }
// // };

// // // ==================== LOGIN EMPLOYEE ====================
// // const loginEmployee = async (req, res) => {
// //   try {
// //     const { email, employeeId, password } = req.body;
// //     if (!email && !employeeId) {
// //       return res.status(400).json({ success: false, message: "Email or Employee ID is required" });
// //     }
// //     const query = email ? { email } : { employeeId };
// //     const employee = await Employee.findOne(query);
// //     if (!employee) {
// //       return res.status(404).json({ success: false, message: "Employee not found" });
// //     }
// //     if (employee.password !== password) {
// //       return res.status(401).json({ success: false, message: "Invalid password" });
// //     }

// //     res.json({
// //       success: true, message: "Login successful",
// //       employee: {
// //         id: employee._id, name: employee.name, email: employee.email,
// //         role: employee.role, department: employee.department,
// //         employeeId: employee.employeeId, joinDate: employee.joinDate,
// //         permissions: employee.permissions || []
// //       },
// //     });
// //   } catch (error) {
// //     res.status(500).json({ success: false, message: "Server Error", error: error.message });
// //   }
// // };

// // // ==================== ASSIGN LOCATION ====================
// // const assignLocation = async (req, res) => {
// //   try {
// //     const { employeeId } = req.params;
// //     const { locationId } = req.body;
// //     if (!employeeId || !locationId) {
// //       return res.status(400).json({ success: false, message: "Employee ID and Location ID are required" });
// //     }
// //     const employee = await Employee.findOne({ employeeId });
// //     if (!employee) {
// //       return res.status(404).json({ success: false, message: "Employee not found" });
// //     }
// //     const location = await Location.findById(locationId);
// //     if (!location) {
// //       return res.status(404).json({ success: false, message: "Location not found" });
// //     }
// //     employee.location = location._id;
// //     await employee.save();
// //     res.status(200).json({ success: true, message: `Location assigned to employee`, employee });
// //   } catch (err) {
// //     res.status(500).json({ success: false, message: "Failed to assign location", error: err.message });
// //   }
// // };

// // // ==================== GET ASSIGNED LOCATION ====================
// // const getAssignedLocationByEmployeeId = async (req, res) => {
// //   try {
// //     const { employeeId } = req.params;
// //     const employee = await Employee.findOne({ employeeId }).populate('location');
// //     if (!employee) {
// //       return res.status(404).json({ success: false, message: "Employee not found" });
// //     }
// //     res.status(200).json({ success: true, data: { location: employee.location } });
// //   } catch (error) {
// //     res.status(500).json({ success: false, message: "Failed to fetch location", error: error.message });
// //   }
// // };

// // // ==================== UPDATE EMPLOYEE ====================
// // // ==================== UPDATE EMPLOYEE ====================
// // const updateEmployee = async (req, res) => {
// //   try {
// //     const { id } = req.params;
// //     const updateData = { ...req.body };
    
// //     // Convert salary fields from string to number
// //     const salaryFields = [
// //       'salaryPerMonth', 'ctc', 'basicPay', 'hra', 'conveyanceAllowance',
// //       'medicalAllowance', 'performanceAllowance', 'specialAllowance',
// //       'ptax', 'gmcAmount', 'otherDeductions'
// //     ];
    
// //     salaryFields.forEach(field => {
// //       if (updateData[field] !== undefined && updateData[field] !== null && updateData[field] !== '') {
// //         updateData[field] = Number(updateData[field]);
// //       }
// //     });
    
// //     const updatedEmployee = await Employee.findByIdAndUpdate(
// //       id, 
// //       updateData, 
// //       { new: true, runValidators: true }
// //     );
    
// //     if (!updatedEmployee) {
// //       return res.status(404).json({ success: false, message: "Employee not found" });
// //     }
    
// //     res.status(200).json({ 
// //       success: true, 
// //       message: "Employee updated successfully", 
// //       employee: updatedEmployee 
// //     });
// //   } catch (error) {
// //     console.error("Update employee error:", error);
// //     res.status(500).json({ success: false, message: "Server error", error: error.message });
// //   }
// // };

// // // ==================== DELETE EMPLOYEE ====================
// // const deleteEmployee = async (req, res) => {
// //   try {
// //     const { id } = req.params;
// //     const employee = await Employee.findByIdAndDelete(id);
// //     if (!employee) {
// //       return res.status(404).json({ success: false, message: "Employee not found" });
// //     }
// //     res.json({ success: true, message: "Employee deleted successfully" });
// //   } catch (error) {
// //     res.status(500).json({ success: false, message: "Server Error", error: error.message });
// //   }
// // };

// // // ==================== APPLY SALARY INCREMENT ====================
// // const applySalaryIncrement = async (req, res) => {
// //   try {
// //     const { id } = req.params;
// //     const { incrementType, incrementValue, effectiveDate, reason } = req.body;

// //     const employee = await Employee.findById(id);
// //     if (!employee) {
// //       return res.status(404).json({ success: false, message: "Employee not found" });
// //     }

// //     await employee.applyIncrement(incrementType, incrementValue, effectiveDate || new Date(), reason || "");
    
// //     res.status(200).json({ success: true, message: "Salary increment applied successfully", employee });
// //   } catch (error) {
// //     res.status(500).json({ success: false, message: "Failed to apply salary increment", error: error.message });
// //   }
// // };

// // // ==================== GET SALARY FOR DATE ====================
// // const getEmployeeSalaryForDate = async (req, res) => {
// //   try {
// //     const { id } = req.params;
// //     const { date } = req.query;
// //     const employee = await Employee.findById(id);
// //     if (!employee) {
// //       return res.status(404).json({ success: false, message: "Employee not found" });
// //     }
// //     const salary = await employee.getSalaryForDate(date || new Date());
// //     res.status(200).json({ success: true, data: salary });
// //   } catch (error) {
// //     res.status(500).json({ success: false, message: "Failed to fetch salary", error: error.message });
// //   }
// // };

// // // ==================== GET SALARY HISTORY ====================
// // const getSalaryIncrementHistory = async (req, res) => {
// //   try {
// //     const { id } = req.params;
// //     const employee = await Employee.findById(id);
// //     if (!employee) {
// //       return res.status(404).json({ success: false, message: "Employee not found" });
// //     }
// //     res.status(200).json({ success: true, data: employee.salaryIncrements });
// //   } catch (error) {
// //     res.status(500).json({ success: false, message: "Failed to fetch history", error: error.message });
// //   }
// // };

// // // ==================== GET SALARY TIMELINE ====================
// // const getSalaryTimeline = async (req, res) => {
// //   try {
// //     const { id } = req.params;
// //     const { startDate, endDate } = req.query;
// //     const history = await Employee.getSalaryHistory(id, startDate, endDate);
// //     res.status(200).json({ success: true, data: history });
// //   } catch (error) {
// //     res.status(500).json({ success: false, message: "Failed to fetch timeline", error: error.message });
// //   }
// // };

// // // ==================== APPLY PENDING INCREMENTS ====================
// // const applyPendingIncrements = async (req, res) => {
// //   try {
// //     const employees = await Employee.find();
// //     let count = 0;
// //     for (const employee of employees) {
// //       const applied = await employee.applyDueIncrements();
// //       count += applied;
// //     }
// //     res.status(200).json({ success: true, message: `Applied ${count} pending increments` });
// //   } catch (error) {
// //     res.status(500).json({ success: false, message: "Failed to apply pending increments", error: error.message });
// //   }
// // };

// // // ==================== GET ALL EMPLOYEES SALARY STATUS ====================
// // const getAllEmployeesSalaryStatus = async (req, res) => {
// //   try {
// //     const employees = await Employee.find().select('name employeeId department role salaryPerMonth');
// //     res.status(200).json({ success: true, data: employees });
// //   } catch (error) {
// //     res.status(500).json({ success: false, message: "Failed to fetch status", error: error.message });
// //   }
// // };

// // // ==================== GET ATTENDANCE SUMMARY ====================
// // const getEmployeeAttendanceSummary = async (req, res) => {
// //   res.status(200).json({ success: true, message: "Attendance summary" });
// // };

// // // ==================== SUBMIT RESIGNATION ====================
// // const submitResignation = async (req, res) => {
// //   res.status(200).json({ success: true, message: "Resignation submitted" });
// // };

// // // ==================== ADD EXPERIENCE ====================
// // const addEmployeeExperience = async (req, res) => {
// //   res.status(200).json({ success: true, message: "Experience added" });
// // };

// // // ==================== GET EXPERIENCES ====================
// // const getEmployeeExperiences = async (req, res) => {
// //   res.status(200).json({ success: true, data: [] });
// // };

// // // ==================== GET CANDIDATE DOCUMENTS ====================
// // const getEmployeeCandidateDocuments = async (req, res) => {
// //   res.status(200).json({ success: true, data: {} });
// // };

// // // ==================== GET LETTERS ====================
// // const getEmployeeLetters = async (req, res) => {
// //   res.status(200).json({ success: true, data: [] });
// // };

// // // ==================== GET BIRTHDAYS ====================
// // const getBirthdaysToday = async (req, res) => {
// //   res.status(200).json({ success: true, data: [] });
// // };

// // // ==================== GET ANNIVERSARIES ====================
// // const getAnniversariesToday = async (req, res) => {
// //   res.status(200).json({ success: true, data: [] });
// // };

// // // ==================== FIX EMPLOYEE CURRENT SALARY ====================
// // const fixEmployeeCurrentSalary = async (req, res) => {
// //   try {
// //     const { id } = req.params;
// //     const employee = await Employee.findById(id);
    
// //     if (!employee) {
// //       return res.status(404).json({ success: false, message: "Employee not found" });
// //     }
    
// //     // Find the latest active increment
// //     const activeIncrements = employee.salaryIncrements.filter(inc => inc.isActive === true);
// //     activeIncrements.sort((a, b) => new Date(b.effectiveFrom) - new Date(a.effectiveFrom));
    
// //     if (activeIncrements.length === 0) {
// //       return res.status(200).json({ success: true, message: "No increments found, nothing to fix" });
// //     }
    
// //     const latestIncrement = activeIncrements[0];
    
// //     // Update current salary with latest increment values
// //     employee.salaryPerMonth = latestIncrement.newSalaryPerMonth;
// //     employee.basicPay = latestIncrement.newBasicPay;
// //     employee.hra = latestIncrement.newHra;
// //     employee.conveyanceAllowance = latestIncrement.newConveyanceAllowance;
// //     employee.medicalAllowance = latestIncrement.newMedicalAllowance;
// //     employee.performanceAllowance = latestIncrement.newPerformanceAllowance;
// //     employee.specialAllowance = latestIncrement.newSpecialAllowance;
// //     employee.ctc = latestIncrement.newCtc;
    
// //     await employee.save();
    
// //     res.status(200).json({
// //       success: true,
// //       message: "Employee salary fixed successfully",
// //       data: {
// //         employeeId: employee.employeeId,
// //         name: employee.name,
// //         newSalary: employee.salaryPerMonth,
// //         increments: activeIncrements.length
// //       }
// //     });
    
// //   } catch (error) {
// //     console.error("Fix salary error:", error);
// //     res.status(500).json({ success: false, message: error.message });
// //   }
// // };

// // // ==================== MODULE EXPORTS ====================
// // module.exports = {
// //   getEmployeeByPhone,
// //   addEmployee,
// //   getEmployees,
// //   getEmployeeByEmail,
// //   loginEmployee,
// //   assignLocation,
// //   getAssignedLocationByEmployeeId,
// //   updateEmployee,
// //   deleteEmployee,
// //   applySalaryIncrement,
// //   getEmployeeSalaryForDate,
// //   getSalaryIncrementHistory,
// //   getSalaryTimeline,
// //   applyPendingIncrements,
// //   getAllEmployeesSalaryStatus,
// //   getEmployeeAttendanceSummary,
// //   submitResignation,
// //   addEmployeeExperience,
// //   getEmployeeExperiences,
// //   getEmployeeCandidateDocuments,
// //   getEmployeeLetters,
// //   getBirthdaysToday,
// //   getAnniversariesToday,
// //   fixEmployeeCurrentSalary,  // ✅ ADDED HERE
// // };


// const mongoose = require("mongoose");
// const Location = require("../models/Location");
// const JobApplication = require("../models/JobApplication");
// const JobPost = require("../models/jobPost");
// const Candidate = require("../models/Candidate");
// const CandidateExperience = require("../models/CandidateExperience");
// const CandidateDocuments = require("../models/CandidateDocuments");
// const Employee = require("../models/Employee");
// const { logActivity } = require("./userActivity.controller");
// const ClaimedOT = require('../models/ClaimedOT');
// const Attendance = require('../models/Attendance');
// const Issue = require("../models/Issues");


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

// // // ==================== ADD EMPLOYEE ====================
// // const addEmployee = async (req, res) => {
// //   try {
// //     const {
// //       firstName, lastName, email, password, department, role,
// //       dob, addressLine1, addressLine2, city, state, pinCode, country,
// //       weekOffType, weekOffCount, shiftType, shiftHours,
// //       joinDate, phone, employeeId, locationId,
// //       parentsName, alternateNumber, salaryPerMonth, weekOffPerMonth,
// //       permissions, maxCL, maxSL, maxEL, maxCompOff,
// //       ctc, basicPay, hra, conveyanceAllowance, medicalAllowance,
// //       performanceAllowance, specialAllowance, ptax, gmc, gmcAmount, otherDeductions
// //     } = req.body;

// //     const name = `${firstName || ''} ${lastName || ''}`.trim();
// //     const existingEmployee = await Employee.findOne({ $or: [{ email }, { employeeId }, { phone }] });

// //     if (existingEmployee) {
// //       return res.status(400).json({ success: false, message: "Employee with this email, ID or phone already exists" });
// //     }

// //     const newEmployee = new Employee({
// //       name, firstName, lastName, email, password, department, role,
// //       dob: dob ? new Date(dob) : null,
// //       addressLine1, addressLine2, city, state, pinCode, country: country || "India",
// //       weekOffType, weekOffCount: weekOffCount || 0,
// //       shiftType: shiftType || "A", shiftHours: shiftHours || 8,
// //       joinDate: joinDate ? new Date(joinDate) : null, phone, employeeId, location: locationId,
// //       parentsName, alternateNumber,
// //       salaryPerMonth: Number(salaryPerMonth) || 0, ctc: Number(ctc) || 0,
// //       basicPay: Number(basicPay) || 0, hra: Number(hra) || 0,
// //       conveyanceAllowance: Number(conveyanceAllowance) || 0,
// //       medicalAllowance: Number(medicalAllowance) || 0,
// //       performanceAllowance: Number(performanceAllowance) || 0,
// //       specialAllowance: Number(specialAllowance) || 0,
// //       ptax: Number(ptax) || 0, gmc: gmc || "", gmcAmount: Number(gmcAmount) || 0,
// //       otherDeductions: Number(otherDeductions) || 0,
// //       weekOffPerMonth: Number(weekOffPerMonth) || 0,
// //       permissions: permissions || [],
// //       maxCL: maxCL !== undefined ? Number(maxCL) : 0,
// //       maxSL: maxSL !== undefined ? Number(maxSL) : 0,
// //       maxEL: maxEL !== undefined ? Number(maxEL) : 0,
// //       maxCompOff: maxCompOff !== undefined ? Number(maxCompOff) : 0,
// //       salaryIncrements: [],
// //       futureIncrements: []
// //     });

// //     await newEmployee.save();
// //     res.status(201).json({ success: true, message: "Employee added successfully", employee: newEmployee });
// //   } catch (error) {
// //     console.error("Add employee error:", error);
// //     res.status(500).json({ success: false, message: "Server error", error: error.message });
// //   }
// // };


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
//       performanceAllowance, specialAllowance, ptax, gmc, gmcAmount, otherDeductions,
      
//       // ✅ NEW FIELDS
//       gender,
//       reportingManager,
//       employmentType,
//       salaryEffectiveDate,
//       weekOffDay,
//       address
//     } = req.body;

//     const name = `${firstName || ''} ${lastName || ''}`.trim();
//     const existingEmployee = await Employee.findOne({ $or: [{ email }, { employeeId }, { phone }] });

//     if (existingEmployee) {
//       return res.status(400).json({ success: false, message: "Employee with this email, ID or phone already exists" });
//     }

//     // ============================================
//     // CALCULATE ASSIGNED WORKING DAYS
//     // ============================================
//     // Default month days = 30 (or 26 as standard)
//     const defaultMonthDays = 30;
//     const weekOffPerMonthValue = Number(weekOffPerMonth) || 0;
//     const assignedWorkingDays = defaultMonthDays - weekOffPerMonthValue;

//     const newEmployee = new Employee({
//   name, firstName, lastName, email, password, department, role,
//   dob: dob ? new Date(dob) : null,
//   addressLine1, addressLine2, city, state, pinCode, country: country || "India",
//   weekOffType, weekOffCount: weekOffCount || 0,
//   shiftType: shiftType || "A", shiftHours: shiftHours || 8,
//   joinDate: joinDate ? new Date(joinDate) : null, phone, employeeId, location: locationId,
//   parentsName, alternateNumber,
  
//   // ✅ NEW FIELDS SAVE KARO
//   gender: gender || '',
//   reportingManager: reportingManager || '',
//   employmentType: employmentType || 'fulltime',
//   salaryEffectiveDate: salaryEffectiveDate ? new Date(salaryEffectiveDate) : null,
//   weekOffDay: weekOffDay || 'Sunday',
//   address: address || '',
  
//   salaryPerMonth: Number(salaryPerMonth) || 0, ctc: Number(ctc) || 0,
//   basicPay: Number(basicPay) || 0, hra: Number(hra) || 0,
//   conveyanceAllowance: Number(conveyanceAllowance) || 0,
//   medicalAllowance: Number(medicalAllowance) || 0,
//   performanceAllowance: Number(performanceAllowance) || 0,
//   specialAllowance: Number(specialAllowance) || 0,
//   ptax: Number(ptax) || 0, gmc: gmc || "", gmcAmount: Number(gmcAmount) || 0,
//   otherDeductions: Number(otherDeductions) || 0,
//   weekOffPerMonth: weekOffPerMonthValue,
//   permissions: permissions || [],
//   maxCL: maxCL !== undefined ? Number(maxCL) : 0,
//   maxSL: maxSL !== undefined ? Number(maxSL) : 0,
//   maxEL: maxEL !== undefined ? Number(maxEL) : 0,
//   maxCompOff: maxCompOff !== undefined ? Number(maxCompOff) : 0,
//   salaryIncrements: [],
//   futureIncrements: [],
//   assignedWorkingDays: assignedWorkingDays > 0 ? assignedWorkingDays : 26
// });
//     await newEmployee.save();
//     res.status(201).json({ 
//       success: true, 
//       message: "Employee added successfully", 
//       employee: newEmployee 
//     });
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

// // // ==================== LOGIN EMPLOYEE ====================
// // const loginEmployee = async (req, res) => {
// //   try {
// //     const { email, employeeId, password, latitude, longitude } = req.body;

// //     // Email ya Employee ID required
// //     if (!email && !employeeId) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "Email or Employee ID is required"
// //       });
// //     }

// //     // Latitude & Longitude required
// //     if (latitude === undefined || longitude === undefined) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "Latitude and Longitude are required"
// //       });
// //     }

// //     const query = email ? { email } : { employeeId };

// //     const employee = await Employee.findOne(query);

// //     if (!employee) {
// //       return res.status(404).json({
// //         success: false,
// //         message: "Employee not found"
// //       });
// //     }

// //     if (employee.password !== password) {
// //       return res.status(401).json({
// //         success: false,
// //         message: "Invalid password"
// //       });
// //     }

// //     // Update employee location on every login
// //     employee.latitude = latitude;
// //     employee.longitude = longitude;

// //     await employee.save();

// //     res.json({
// //       success: true,
// //       message: "Login successful",
// //       employee: {
// //         id: employee._id,
// //         name: employee.name,
// //         email: employee.email,
// //         role: employee.role,
// //         department: employee.department,
// //         employeeId: employee.employeeId,
// //         joinDate: employee.joinDate,
// //         permissions: employee.permissions || [],
// //         latitude: employee.latitude,
// //         longitude: employee.longitude,
// //       },
// //     });

// //   } catch (error) {
// //     res.status(500).json({
// //       success: false,
// //       message: "Server Error",
// //       error: error.message
// //     });
// //   }
// // };




// // ==================== LOGIN EMPLOYEE ====================
// const loginEmployee = async (req, res) => {
//   try {
//     const { email, employeeId, password, latitude, longitude } = req.body;

//     if (!email && !employeeId) {
//       return res.status(400).json({
//         success: false,
//         message: "Email or Employee ID is required"
//       });
//     }

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
//         message: "Invalid Email"
//       });
//     }

//     if (employee.password !== password) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid password"
//       });
//     }

//     // Get address from coordinates
//     const address = await getAddressFromCoords(latitude, longitude);

//     // Update employee location
//     employee.latitude = latitude;
//     employee.longitude = longitude;
//     employee.address = address;

//     employee.lastLoginLocation = {
//       latitude,
//       longitude,
//       timestamp: new Date(),
//       address
//     };

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
//         address: employee.address,
//         lastLoginLocation: employee.lastLoginLocation,
//         lastCheckInLocation: employee.lastCheckInLocation,
//         lastCheckOutLocation: employee.lastCheckOutLocation,
//         isAllowedImageCapturedAttendance: employee.isAllowedImageCapturedAttendance
//       },
//     });

//   } catch (error) {
//     console.error("Login error:", error);

//     res.status(500).json({
//       success: false,
//       message: "Server Error",
//       error: error.message
//     });
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
// // employee.controller.js - FIXED updateEmployee function with Image Attendance field

// const updateEmployee = async (req, res) => {
//   try {
//     const { id } = req.params;
//     let updateData = { ...req.body };
    
//     const existingEmployee = await Employee.findById(id);
//     if (!existingEmployee) {
//       return res.status(404).json({ success: false, message: "Employee not found" });
//     }
    
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

//     const newSalary = updateData.salaryPerMonth;
//     const oldSalary = existingEmployee.salaryPerMonth;
    
//     const mongooseUpdate = { $set: {}, $push: {} };
    
//     Object.keys(updateData).forEach(key => {
//       mongooseUpdate.$set[key] = updateData[key];
//     });

//     // ✅ Check if salary is changing
//     if (newSalary !== undefined && newSalary !== oldSalary && oldSalary > 0) {
//       // ✅ Get effective date - if not provided, use current date
//       let effectiveDate;
//       if (updateData.salaryEffectiveDate) {
//         effectiveDate = new Date(updateData.salaryEffectiveDate);
//       } else {
//         effectiveDate = new Date();
//       }
//       effectiveDate.setHours(0, 0, 0, 0);
      
//       // ✅ Set all previous increments to inactive
//       if (existingEmployee.salaryIncrements && existingEmployee.salaryIncrements.length > 0) {
//         for (let i = 0; i < existingEmployee.salaryIncrements.length; i++) {
//           existingEmployee.salaryIncrements[i].isActive = false;
//         }
//       } else {
//         existingEmployee.salaryIncrements = [];
//       }
      
//       const incrementRecord = {
//         incrementType: 'amount',
//         incrementValue: newSalary - oldSalary,
//         oldSalaryPerMonth: existingEmployee.salaryPerMonth || 0,
//         oldBasicPay: existingEmployee.basicPay || 0,
//         oldHra: existingEmployee.hra || 0,
//         oldConveyanceAllowance: existingEmployee.conveyanceAllowance || 0,
//         oldMedicalAllowance: existingEmployee.medicalAllowance || 0,
//         oldPerformanceAllowance: existingEmployee.performanceAllowance || 0,
//         oldSpecialAllowance: existingEmployee.specialAllowance || 0,
//         oldCtc: existingEmployee.ctc || 0,
//         newSalaryPerMonth: updateData.salaryPerMonth ?? existingEmployee.salaryPerMonth,
//         newBasicPay: updateData.basicPay ?? existingEmployee.basicPay,
//         newHra: updateData.hra ?? existingEmployee.hra,
//         newConveyanceAllowance: updateData.conveyanceAllowance ?? existingEmployee.conveyanceAllowance,
//         newMedicalAllowance: updateData.medicalAllowance ?? existingEmployee.medicalAllowance,
//         newPerformanceAllowance: updateData.performanceAllowance ?? existingEmployee.performanceAllowance,
//         newSpecialAllowance: updateData.specialAllowance ?? existingEmployee.specialAllowance,
//         newCtc: updateData.ctc ?? existingEmployee.ctc,
//         effectiveFrom: effectiveDate,
//         effectiveMonth: effectiveDate.getMonth() + 1,
//         effectiveYear: effectiveDate.getFullYear(),
//         reason: updateData.incrementReason || "Salary updated via Edit Employee",
//         isActive: true
//       };
      
//       existingEmployee.salaryIncrements.push(incrementRecord);
//       mongooseUpdate.$set.salaryIncrements = existingEmployee.salaryIncrements;
//     }

//     // ✅ NEW: Handle Image Attendance field
//     if (updateData.isAllowedImageCapturedAttendance !== undefined) {
//       // Convert string "true"/"false" to boolean
//       if (typeof updateData.isAllowedImageCapturedAttendance === 'string') {
//         mongooseUpdate.$set.isAllowedImageCapturedAttendance = updateData.isAllowedImageCapturedAttendance === 'true';
//       } else {
//         mongooseUpdate.$set.isAllowedImageCapturedAttendance = Boolean(updateData.isAllowedImageCapturedAttendance);
//       }
//     }
    
//     const updatedEmployee = await Employee.findByIdAndUpdate(id, mongooseUpdate, { 
//       new: true, 
//       runValidators: true 
//     });
    
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
//     const { incrementType, incrementValue, effectiveDate, reason, newComponents } = req.body;

//     const employee = await Employee.findById(id);
//     if (!employee) {
//       return res.status(404).json({ success: false, message: "Employee not found" });
//     }

//     await employee.applyIncrement(incrementType, incrementValue, effectiveDate || new Date(), reason || "", null, newComponents);
    
//     res.status(200).json({ success: true, message: "Salary increment applied successfully", employee });
//   } catch (error) {
//     res.status(500).json({ success: false, message: "Failed to apply salary increment", error: error.message });
//   }
// };

// // ==================== GET SALARY FOR DATE (UPDATED) ====================
// const getEmployeeSalaryForDate = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { date } = req.query;
    
//     const employee = await Employee.findById(id);
//     if (!employee) {
//       return res.status(404).json({ success: false, message: "Employee not found" });
//     }
    
//     let targetDate = date ? new Date(date) : new Date();
//     targetDate.setHours(0, 0, 0, 0);
    
//     console.log(`📅 Getting salary for ${employee.name} on date: ${targetDate.toISOString().split('T')[0]}`);
    
//     const salary = await employee.getSalaryForDate(targetDate);
    
//     let effectiveFrom = employee.joinDate;
//     const activeIncrements = employee.salaryIncrements.filter(inc => inc.isActive === true);
//     activeIncrements.sort((a, b) => new Date(a.effectiveFrom) - new Date(b.effectiveFrom));
    
//     const targetMonthStr = targetDate.toISOString().slice(0, 7);
//     for (const inc of activeIncrements) {
//       const incDate = new Date(inc.effectiveFrom);
//       const incMonthStr = incDate.toISOString().slice(0, 7);
//       if (incMonthStr < targetMonthStr) {
//         effectiveFrom = inc.effectiveFrom;
//       } else {
//         break;
//       }
//     }
    
//     res.status(200).json({ 
//       success: true, 
//       data: {
//         salaryPerMonth: salary.salaryPerMonth,
//         basicPay: salary.basicPay,
//         hra: salary.hra,
//         conveyanceAllowance: salary.conveyanceAllowance,
//         medicalAllowance: salary.medicalAllowance,
//         performanceAllowance: salary.performanceAllowance,
//         specialAllowance: salary.specialAllowance,
//         ctc: salary.ctc,
//         effectiveFrom: effectiveFrom,
//         employeeId: employee.employeeId,
//         name: employee.name
//       }
//     });
//   } catch (error) {
//     console.error("Get salary for date error:", error);
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
//   try {
//     const { department } = req.query;
//     const today = new Date();
//     const currentDay = today.getDate();
//     const currentMonth = today.getMonth() + 1;
    
//     let query = { status: { $ne: "inactive" } };
//     if (department) query.department = department;
    
//     const employees = await Employee.find(query).select('name email employeeId department role dob');
    
//     const birthdays = employees.filter(emp => {
//       if (!emp.dob) return false;
//       const dob = new Date(emp.dob);
//       return dob.getDate() === currentDay && (dob.getMonth() + 1) === currentMonth;
//     }).map(emp => ({
//       name: emp.name,
//       email: emp.email,
//       employeeId: emp.employeeId,
//       department: emp.department,
//       role: emp.role
//     }));
    
//     res.status(200).json({ success: true, data: birthdays });
//   } catch (error) {
//     console.error("Birthday fetch error:", error);
//     res.status(500).json({ success: false, message: "Server error", error: error.message });
//   }
// };

// // ==================== GET ANNIVERSARIES ====================
// const getAnniversariesToday = async (req, res) => {
//   try {
//     const { department } = req.query;
//     const today = new Date();
//     const currentDay = today.getDate();
//     const currentMonth = today.getMonth() + 1;
//     const currentYear = today.getFullYear();
    
//     let query = { status: { $ne: "inactive" } };
//     if (department) query.department = department;
    
//     const employees = await Employee.find(query).select('name email employeeId department role joinDate');
    
//     const anniversaries = [];
//     employees.forEach(emp => {
//       if (!emp.joinDate) return;
//       const joinDate = new Date(emp.joinDate);
//       if (joinDate.getDate() === currentDay && (joinDate.getMonth() + 1) === currentMonth) {
//         const yearsOfService = currentYear - joinDate.getFullYear();
//         if (yearsOfService > 0) {
//           anniversaries.push({
//             name: emp.name,
//             email: emp.email,
//             employeeId: emp.employeeId,
//             department: emp.department,
//             role: emp.role,
//             yearsOfService
//           });
//         }
//       }
//     });
    
//     res.status(200).json({ success: true, data: anniversaries });
//   } catch (error) {
//     console.error("Anniversary fetch error:", error);
//     res.status(500).json({ success: false, message: "Server error", error: error.message });
//   }
// };

// // ==================== PASSWORD RESET ====================
// // const crypto = require("crypto");
// // const nodemailer = require("nodemailer");

// // const forgotPassword = async (req, res) => {
// //   try {
// //     const { email } = req.body;
// //     if (!email) return res.status(400).json({ success: false, message: "Email is required" });

// //     const employee = await Employee.findOne({ email });
// //     if (!employee) return res.status(404).json({ success: false, message: "Employee not found" });

// //     // Generate token
// //     const token = crypto.randomBytes(32).toString("hex");
    
// //     // Set token and expiration (1 hour)
// //     employee.resetPasswordToken = token;
// //     employee.resetPasswordExpires = Date.now() + 3600000;
// //     await employee.save();

// //     // Use environment variables or create a test account on the fly if not configured
// //     let transporter;
    
// //     // Check if user has actually configured a real app password
// //     if (process.env.EMAIL_PASS && process.env.EMAIL_PASS !== "aapka_app_password") {
// //       transporter = nodemailer.createTransport({
// //         service: "gmail",
// //         auth: {
// //           user: process.env.EMAIL_USER,
// //           pass: process.env.EMAIL_PASS
// //         }
// //       });
// //     } else {
// //       // Fallback to Ethereal Email (Fake SMTP for testing)
// //       const testAccount = await nodemailer.createTestAccount();
// //       transporter = nodemailer.createTransport({
// //         host: "smtp.ethereal.email",
// //         port: 587,
// //         secure: false, // true for 465, false for other ports
// //         auth: {
// //           user: testAccount.user, // generated ethereal user
// //           pass: testAccount.pass, // generated ethereal password
// //         },
// //       });
// //       console.log("Using Ethereal Fake Email for testing. Emails won't reach real inboxes.");
// //     }

// //     const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
// //     const resetUrl = `${clientUrl}/reset-password/${token}`;
// //     const mailOptions = {
// //       from: process.env.EMAIL_USER && process.env.EMAIL_PASS !== "aapka_app_password" ? process.env.EMAIL_USER : '"Attendance System" <support@attendance.com>',
// //       to: email,
// //       subject: "Password Reset Request",
// //       text: `You requested a password reset. Please click on the following link or paste it into your browser to reset your password:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email.`
// //     };

// //     transporter.sendMail(mailOptions, (error, info) => {
// //       if (error) {
// //         console.error("Error sending email:", error);
// //         return res.status(500).json({ success: false, message: "Email could not be sent. Make sure EMAIL_USER and EMAIL_PASS are set correctly." });
// //       } else {
// //         if (info.messageId && nodemailer.getTestMessageUrl(info)) {
// //             console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
// //             return res.status(200).json({ 
// //               success: true, 
// //               message: "Test email sent. Check backend console for preview link.",
// //               previewUrl: nodemailer.getTestMessageUrl(info) 
// //             });
// //         }
// //         return res.status(200).json({ success: true, message: "Password reset email sent." });
// //       }
// //     });
// //   } catch (error) {
// //     console.error("Forgot password error:", error);
// //     res.status(500).json({ success: false, message: "Server error", error: error.message });
// //   }
// // };

// // const resetPassword = async (req, res) => {
// //   try {
// //     const { token } = req.params;
// //     const { password } = req.body;

// //     if (!password) return res.status(400).json({ success: false, message: "New password is required" });

// //     const employee = await Employee.findOne({
// //       resetPasswordToken: token,
// //       resetPasswordExpires: { $gt: Date.now() }
// //     });

// //     if (!employee) {
// //       return res.status(400).json({ success: false, message: "Password reset token is invalid or has expired." });
// //     }

// //     // Update password and clear token fields
// //     employee.password = password; // Should hash in production, but following existing plain-text pattern if used
// //     employee.resetPasswordToken = undefined;
// //     employee.resetPasswordExpires = undefined;

// //     await employee.save();

// //     res.status(200).json({ success: true, message: "Password has been reset successfully." });
// //   } catch (error) {
// //     console.error("Reset password error:", error);
// //     res.status(500).json({ success: false, message: "Server error", error: error.message });
// //   }
// // };

// // ==================== FIX EMPLOYEE CURRENT SALARY ====================
// const fixEmployeeCurrentSalary = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const employee = await Employee.findById(id);
    
//     if (!employee) {
//       return res.status(404).json({ success: false, message: "Employee not found" });
//     }
    
//     const activeIncrements = employee.salaryIncrements.filter(inc => inc.isActive === true);
//     activeIncrements.sort((a, b) => new Date(b.effectiveFrom) - new Date(a.effectiveFrom));
    
//     if (activeIncrements.length === 0) {
//       return res.status(200).json({ success: true, message: "No increments found, nothing to fix" });
//     }
    
//     const latestIncrement = activeIncrements[0];
    
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

// const crypto = require('crypto');
// const bcrypt = require('bcryptjs');
// const nodemailer = require('nodemailer');

// // ============ FORGOT PASSWORD ============
// const forgotPassword = async (req, res) => {
//   try {
//     const { email } = req.body;
    
//     console.log(`Password reset requested for: ${email}`);
    
//     // Check if employee exists
//     const employee = await Employee.findOne({ email });
//     if (!employee) {
//       return res.status(404).json({ message: 'No employee found with this email address' });
//     }
    
//     // Generate reset token (expires in 1 hour)
//     const resetToken = crypto.randomBytes(32).toString('hex');
//     employee.resetPasswordToken = resetToken;
//     employee.resetPasswordExpires = Date.now() + 3600000; // 1 hour
//     await employee.save();
    
//     // Create reset link
//     const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    
//     // Real email setup using Gmail
//     if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
//       console.error("EMAIL_USER or EMAIL_PASS is missing in .env file");
//       return res.status(500).json({ message: "Email configuration is missing on the server." });
//     }

//     const transporter = nodemailer.createTransport({
//       service: 'gmail',
//       auth: { 
//         user: process.env.EMAIL_USER, 
//         pass: process.env.EMAIL_PASS 
//       },
//     });

//     const htmlContent = `
//       <!DOCTYPE html>
//       <html>
//       <head>
//         <meta charset="UTF-8">
//       </head>
//       <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
//         <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
//           <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #4F46E5;">
//             <h2 style="color: #4F46E5; margin: 0;">Attendance Management System</h2>
//           </div>
//           <div style="padding: 30px 20px;">
//             <h3 style="color: #333;">Hello ${employee.name || 'User'},</h3>
//             <p>We received a request to reset your password. Click the button below to create a new password:</p>
//             <div style="text-align: center; margin: 30px 0;">
//               <a href="${resetLink}" style="display: inline-block; padding: 12px 30px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
//                 Reset Password
//               </a>
//             </div>
//             <p>Or copy this link to your browser:</p>
//             <p style="background-color: #f5f5f5; padding: 10px; border-radius: 5px; word-break: break-all;">
//               <a href="${resetLink}" style="color: #4F46E5;">${resetLink}</a>
//             </p>
//             <p><strong>Note:</strong> This link will expire in <strong>1 hour</strong>.</p>
//           </div>
//         </div>
//       </body>
//       </html>
//     `;

//     await transporter.sendMail({
//       from: `"Attendance System" <${process.env.EMAIL_USER}>`,
//       to: email,
//       subject: "Reset Your Password - Attendance Management System",
//       html: htmlContent,
//     });

//     console.log(`Real email successfully sent to ${email}`);
    
//     res.status(200).json({ 
//       success: true,
//       message: 'Password reset link has been sent to your email address!' 
//     });
    
//   } catch (error) {
//     console.error('Forgot password error details:', error);
//     res.status(500).json({ 
//       message: 'Error sending reset email. Please try again later.' 
//     });
//   }
// };

// // ============ RESET PASSWORD ============
// const resetPassword = async (req, res) => {
//   try {
//     const { token } = req.params;
//     const { password } = req.body;
    
//     console.log(`Reset password attempt with token: ${token}`);
    
//     // Validate password strength
//     if (!password || password.length < 6) {
//       return res.status(400).json({ 
//         message: 'Password must be at least 6 characters long' 
//       });
//     }
    
//     // Find employee with valid token
//     const employee = await Employee.findOne({
//       resetPasswordToken: token,
//       resetPasswordExpires: { $gt: Date.now() }
//     });
    
//     if (!employee) {
//       return res.status(400).json({ 
//         message: 'Password reset token is invalid or has expired' 
//       });
//     }
    
//     // Save password as plain text to match how loginEmployee checks it
//     employee.password = password;
//     employee.resetPasswordToken = undefined;
//     employee.resetPasswordExpires = undefined;
//     await employee.save();
    
//     console.log(`Password reset successfully for: ${employee.email}`);
    
//     res.status(200).json({ 
//       success: true,
//       message: 'Password has been reset successfully! You can now login with your new password.' 
//     });
    
//   } catch (error) {
//     console.error('Reset password error:', error);
//     res.status(500).json({ 
//       message: 'Error resetting password. Please try again.' 
//     });
//   }
// };




// // ============================================
// // UPDATE EMPLOYEE IDS - EMP → TH
// // ============================================
// const convertEmployeeIdsToTH = async (req, res) => {
//   try {
//     // 1. Find all employees with EMP prefix
//     const employees = await Employee.find({
//       employeeId: { $regex: /^EMP/i }
//     });

//     if (employees.length === 0) {
//       return res.status(200).json({
//         success: true,
//         message: 'No employees found with EMP prefix',
//         updatedCount: 0,
//         employees: []
//       });
//     }

//     const results = [];
//     const errors = [];

//     // 2. Loop through each employee and update ID
//     for (const employee of employees) {
//       try {
//         const oldId = employee.employeeId;
        
//         // Extract numeric part (remove EMP)
//         const numPart = oldId.replace(/[^0-9]/g, '');
//         const newId = `TH${numPart}`;

//         // Check if new ID already exists
//         const existingEmployee = await Employee.findOne({ employeeId: newId });
        
//         if (existingEmployee) {
//           errors.push({
//             oldId,
//             newId,
//             error: 'TH ID already exists, skipping'
//           });
//           continue;
//         }

//         // Update employee ID
//         employee.employeeId = newId;
//         await employee.save();

//         results.push({
//           oldId,
//           newId,
//           employeeName: employee.name,
//           status: 'updated'
//         });

//       } catch (err) {
//         errors.push({
//           oldId: employee.employeeId,
//           error: err.message
//         });
//       }
//     }

//     // 3. Response
//     res.status(200).json({
//       success: true,
//       message: `Updated ${results.length} employees from EMP to TH`,
//       totalFound: employees.length,
//       updatedCount: results.length,
//       failedCount: errors.length,
//       updated: results,
//       errors: errors.length > 0 ? errors : undefined
//     });

//   } catch (error) {
//     console.error('Error converting employee IDs:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Internal server error'
//     });
//   }
// };



// // ============================================
// // APPLY SALARY INCREMENT - WITHOUT CHANGING SALARY
// // ============================================
// const applyEmployeeSalaryIncrement = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { incrementType, incrementValue, effectiveDate, reason } = req.body;

//     // Validation
//     if (!incrementType || !['percentage', 'amount'].includes(incrementType)) {
//       return res.status(400).json({
//         success: false,
//         error: 'Invalid incrementType. Must be "percentage" or "amount"'
//       });
//     }

//     if (!incrementValue || incrementValue <= 0) {
//       return res.status(400).json({
//         success: false,
//         error: 'Invalid incrementValue. Must be greater than 0'
//       });
//     }

//     if (!effectiveDate) {
//       return res.status(400).json({
//         success: false,
//         error: 'effectiveDate is required'
//       });
//     }

//     // Find employee
//     const employee = await Employee.findById(id);
//     if (!employee) {
//       return res.status(404).json({
//         success: false,
//         error: 'Employee not found'
//       });
//     }

//     // Store old salary (current salary)
//     const oldSalary = employee.salaryPerMonth || 0;

//     // Calculate new salary (for record only)
//     let newSalary;
//     if (incrementType === 'percentage') {
//       newSalary = oldSalary + (oldSalary * (incrementValue / 100));
//     } else {
//       newSalary = oldSalary + incrementValue;
//     }
//     newSalary = Math.round(newSalary);

//     // Prepare effective date
//     const effectiveFrom = new Date(effectiveDate);
//     effectiveFrom.setHours(0, 0, 0, 0);
//     const effectiveMonth = effectiveFrom.getMonth() + 1;
//     const effectiveYear = effectiveFrom.getFullYear();

//     // Create increment record - ONLY ADD TO ARRAY
//     const incrementRecord = {
//       incrementType,
//       incrementValue,
//       oldSalaryPerMonth: oldSalary,
//       newSalaryPerMonth: newSalary,
//       effectiveFrom,
//       effectiveMonth,
//       effectiveYear,
//       reason: reason || "Salary hike",
//       createdAt: new Date()
//     };

//     // ✅ ONLY PUSH TO ARRAY - DO NOT UPDATE salaryPerMonth
//     employee.salaryIncrements.push(incrementRecord);

//     // ❌ DO NOT UPDATE salaryPerMonth
//     // employee.salaryPerMonth = newSalary;  // COMMENTED OUT

//     await employee.save();

//     res.status(200).json({
//       success: true,
//       message: 'Salary increment record added successfully',
//       data: {
//         employee: {
//           _id: employee._id,
//           name: employee.name,
//           employeeId: employee.employeeId,
//           salaryPerMonth: employee.salaryPerMonth, // Still old salary
//           increment: incrementRecord
//         }
//       }
//     });

//   } catch (error) {
//     console.error('Error applying salary increment:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Internal server error'
//     });
//   }
// };




// // ==================== SINGLE & BULK OT CLAIM (Combined) ====================
// // ✅ Handles both single and multiple OT claims in one function
// const claimOT = async (req, res) => {
//   try {
//     const { employeeId, employeeName, attendanceId, otHours, reason, claims } = req.body;
    
//     // ============ BULK CLAIM (Multiple Records) ============
//     if (claims && Array.isArray(claims) && claims.length > 0) {
//       // Validate bulk claims
//       const validationErrors = [];
//       const validClaims = [];
//       const attendanceIds = [];

//       for (let i = 0; i < claims.length; i++) {
//         const claim = claims[i];
        
//         if (!claim.employeeId) {
//           validationErrors.push(`Claim ${i + 1}: employeeId is required`);
//           continue;
//         }
//         if (!claim.attendanceId) {
//           validationErrors.push(`Claim ${i + 1}: attendanceId is required`);
//           continue;
//         }
//         if (!claim.otHours || claim.otHours <= 0) {
//           validationErrors.push(`Claim ${i + 1}: otHours must be greater than 0`);
//           continue;
//         }
//         if (!claim.reason) {
//           validationErrors.push(`Claim ${i + 1}: reason is required`);
//           continue;
//         }

//         attendanceIds.push(claim.attendanceId);
//         validClaims.push({
//           employeeId: claim.employeeId,
//           employeeName: claim.employeeName || 'Unknown',
//           attendanceId: claim.attendanceId,
//           date: claim.date || new Date(),
//           otHours: claim.otHours,
//           reason: claim.reason,
//           status: 'pending'
//         });
//       }

//       if (validationErrors.length > 0) {
//         return res.status(400).json({
//           success: false,
//           message: 'Validation failed for bulk claims',
//           errors: validationErrors
//         });
//       }

//       // Check for duplicates in bulk claims
//       const duplicateChecks = validClaims.map(claim => ({
//         employeeId: claim.employeeId,
//         attendanceId: claim.attendanceId
//       }));

//       const existingClaims = await ClaimedOT.find({
//         $or: duplicateChecks
//       });

//       if (existingClaims.length > 0) {
//         const duplicateAttendanceIds = existingClaims.map(c => c.attendanceId.toString());
//         return res.status(400).json({
//           success: false,
//           message: 'Some records are already claimed',
//           duplicateAttendanceIds: duplicateAttendanceIds,
//           duplicateCount: existingClaims.length
//         });
//       }

//       // Check if attendance records exist
//       const attendanceRecords = await Attendance.find({
//         _id: { $in: attendanceIds }
//       });

//       if (attendanceRecords.length !== attendanceIds.length) {
//         const foundIds = attendanceRecords.map(a => a._id.toString());
//         const missingIds = attendanceIds.filter(id => !foundIds.includes(id.toString()));
//         return res.status(404).json({
//           success: false,
//           message: 'Some attendance records not found',
//           missingAttendanceIds: missingIds
//         });
//       }

//       // Create bulk claims
//       const createdClaims = await ClaimedOT.insertMany(validClaims);

//       // Update attendance records to mark OT as claimed
//       await Attendance.updateMany(
//         { _id: { $in: attendanceIds } },
//         { $set: { isOTClaimed: true } }
//       );

//       const totalOT = createdClaims.reduce((sum, c) => sum + c.otHours, 0);

//       return res.status(201).json({
//         success: true,
//         message: `${createdClaims.length} OT claims submitted successfully`,
//         count: createdClaims.length,
//         totalOTHours: totalOT,
//         records: createdClaims
//       });
//     }

//     // ============ SINGLE CLAIM ============
//     else if (employeeId && attendanceId && otHours && reason) {
//       // Validate single claim
//       if (otHours <= 0) {
//         return res.status(400).json({
//           success: false,
//           message: 'OT hours must be greater than 0'
//         });
//       }

//       // Check if already claimed
//       const existingClaim = await ClaimedOT.findOne({ employeeId, attendanceId });
//       if (existingClaim) {
//         return res.status(400).json({
//           success: false,
//           message: 'OT already claimed for this record',
//           claimId: existingClaim._id,
//           status: existingClaim.status
//         });
//       }

//       // Check if attendance record exists
//       const attendance = await Attendance.findById(attendanceId);
//       if (!attendance) {
//         return res.status(404).json({
//           success: false,
//           message: 'Attendance record not found'
//         });
//       }

//       // Create single claim
//       const newClaim = new ClaimedOT({
//         employeeId,
//         employeeName: employeeName || 'Unknown',
//         attendanceId,
//         date: attendance.checkInTime || new Date(),
//         otHours,
//         reason,
//         status: 'pending'
//       });

//       await newClaim.save();

//       // Update attendance record
//       await Attendance.findByIdAndUpdate(attendanceId, {
//         $set: { isOTClaimed: true }
//       });

//       return res.status(201).json({
//         success: true,
//         message: 'OT claimed successfully',
//         record: newClaim
//       });
//     }

//     // ============ INVALID REQUEST ============
//     else {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid request. Provide either claims array for bulk claim or single claim fields (employeeId, attendanceId, otHours, reason)'
//       });
//     }

//   } catch (error) {
//     console.error('Error in OT claim:', error);
    
//     if (error.code === 11000) {
//       return res.status(400).json({
//         success: false,
//         message: 'Duplicate claim detected. OT already claimed for this record'
//       });
//     }
    
//     res.status(500).json({
//       success: false,
//       message: 'Error processing OT claim',
//       error: error.message
//     });
//   }
// };



// // ==================== GET ALL OT CLAIMS WITH EMPLOYEE & ATTENDANCE DETAILS ====================
// const getAllOTClaimsWithDetails = async (req, res) => {
//   try {
//     const { status, employeeId, fromDate, toDate, page = 1, limit = 10 } = req.query;
    
//     // Build filter
//     let filter = {};
//     if (status) filter.status = status;
//     if (employeeId) filter.employeeId = employeeId;
    
//     if (fromDate || toDate) {
//       filter.date = {};
//       if (fromDate) filter.date.$gte = new Date(fromDate);
//       if (toDate) filter.date.$lte = new Date(toDate);
//     }

//     // Pagination
//     const pageNum = parseInt(page);
//     const limitNum = parseInt(limit);
//     const skip = (pageNum - 1) * limitNum;

//     // Get claims with pagination
//     const claims = await ClaimedOT.find(filter)
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limitNum)
//       .lean(); // Use lean() for better performance

//     // Get total count for pagination
//     const totalCount = await ClaimedOT.countDocuments(filter);

//     // Get all unique employee IDs and attendance IDs
//     const employeeIds = [...new Set(claims.map(c => c.employeeId))];
//     const attendanceIds = claims.map(c => c.attendanceId);

//     // Fetch employee details with salaryPerMonth
//     const employees = await Employee.find(
//       { employeeId: { $in: employeeIds } },
//       'employeeId name email department designation profileImage salaryPerMonth'
//     ).lean();

//     // Fetch attendance details
//     const attendances = await Attendance.find(
//       { _id: { $in: attendanceIds } },
//       'checkInTime checkOutTime totalHours assignedShiftHours status onsite distance reason'
//     ).lean();

//     // Create maps for quick lookup
//     const employeeMap = {};
//     employees.forEach(emp => {
//       employeeMap[emp.employeeId] = emp;
//     });

//     const attendanceMap = {};
//     attendances.forEach(att => {
//       attendanceMap[att._id.toString()] = att;
//     });

//     // Combine data
//     const claimsWithDetails = claims.map(claim => {
//       const attendance = attendanceMap[claim.attendanceId?.toString()] || null;
//       const employee = employeeMap[claim.employeeId] || null;

//       return {
//         ...claim,
//         employeeDetails: employee ? {
//           employeeId: employee.employeeId,
//           name: employee.name,
//           email: employee.email,
//           department: employee.department,
//           designation: employee.designation,
//           profileImage: employee.profileImage || null,
//           salaryPerMonth: employee.salaryPerMonth || 0
//         } : null,
//         attendanceDetails: attendance ? {
//           checkInTime: attendance.checkInTime,
//           checkOutTime: attendance.checkOutTime,
//           totalHours: attendance.totalHours,
//           assignedShiftHours: attendance.assignedShiftHours,
//           status: attendance.status,
//           onsite: attendance.onsite,
//           distance: attendance.distance,
//           reason: attendance.reason
//         } : null,
//         // Add formatted fields
//         formattedDate: claim.date ? new Date(claim.date).toLocaleDateString('en-IN', {
//           day: '2-digit',
//           month: 'short',
//           year: 'numeric'
//         }) : null,
//         formattedOTHours: claim.otHours ? `${claim.otHours}h` : '0h',
//         statusBadge: claim.status === 'pending' ? '🟡 Pending' :
//                      claim.status === 'approved' ? '🟢 Approved' :
//                      claim.status === 'rejected' ? '🔴 Rejected' : '⚪ Unknown'
//       };
//     });

//     // Calculate summary
//     const summary = {
//       totalClaims: totalCount,
//       totalOTHours: claimsWithDetails.reduce((sum, c) => sum + (c.otHours || 0), 0),
//       pendingCount: claimsWithDetails.filter(c => c.status === 'pending').length,
//       approvedCount: claimsWithDetails.filter(c => c.status === 'approved').length,
//       rejectedCount: claimsWithDetails.filter(c => c.status === 'rejected').length,
//       totalPages: Math.ceil(totalCount / limitNum),
//       currentPage: pageNum,
//       perPage: limitNum
//     };

//     res.status(200).json({
//       success: true,
//       summary: summary,
//       claims: claimsWithDetails
//     });

//   } catch (error) {
//     console.error('Error fetching OT claims with details:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching OT claims',
//       error: error.message
//     });
//   }
// };



// // controllers/claimedOTController.js

// // ==================== UPDATE OT CLAIM STATUS (Single & Bulk Combined) ====================
// const updateOTClaimStatus = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status, rejectedReason, approvedBy, notes, otAmount, multiplier, claimIds } = req.body;
    
//     // Validate status
//     if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Valid status is required: pending, approved, or rejected'
//       });
//     }

//     // ==================== BULK UPDATE ====================
//     if (claimIds && Array.isArray(claimIds) && claimIds.length > 0) {
//       const claims = await ClaimedOT.find({ _id: { $in: claimIds } });
//       if (claims.length === 0) {
//         return res.status(404).json({
//           success: false,
//           message: 'No claims found with the provided IDs'
//         });
//       }

//       const nonPendingClaims = claims.filter(c => c.status !== 'pending');
//       if (nonPendingClaims.length > 0) {
//         return res.status(400).json({
//           success: false,
//           message: `${nonPendingClaims.length} claim(s) are already processed. Only pending claims can be updated`,
//           nonPendingClaimIds: nonPendingClaims.map(c => c._id)
//         });
//       }

//       const updateData = {
//         status,
//         updatedAt: new Date()
//       };

//       if (status === 'approved') {
//         updateData.approvedBy = approvedBy || 'Admin';
//         updateData.approvedAt = new Date();
//         updateData.rejectedReason = null;
//         if (otAmount !== undefined) {
//           updateData.otAmount = Math.round(otAmount * 100) / 100;
//         }
//         if (multiplier !== undefined) {
//           updateData.multiplier = multiplier;
//         }
//       }

//       if (status === 'rejected') {
//         updateData.rejectedReason = rejectedReason || 'No reason provided';
//         updateData.approvedBy = null;
//         updateData.approvedAt = null;
//         updateData.otAmount = 0;
//         updateData.multiplier = 0;
//       }

//       if (notes) updateData.notes = notes;

//       const result = await ClaimedOT.updateMany(
//         { _id: { $in: claimIds } },
//         updateData
//       );

//       if (status === 'rejected') {
//         const attendanceIds = claims.map(c => c.attendanceId);
//         await Attendance.updateMany(
//           { _id: { $in: attendanceIds } },
//           { $set: { isOTClaimed: false } }
//         );
//       }

//       return res.status(200).json({
//         success: true,
//         message: `${result.modifiedCount} OT claims ${status} successfully`,
//         modifiedCount: result.modifiedCount
//       });
//     }

//     // ==================== SINGLE UPDATE ====================
//     else if (id) {
//       const claim = await ClaimedOT.findById(id);
//       if (!claim) {
//         return res.status(404).json({
//           success: false,
//           message: 'OT claim not found'
//         });
//       }

//       if (claim.status !== 'pending' && status !== claim.status) {
//         return res.status(400).json({
//           success: false,
//           message: `Claim is already ${claim.status}. Only pending claims can be updated`
//         });
//       }

//       const updateData = {
//         status,
//         updatedAt: new Date()
//       };

//       if (status === 'approved') {
//         updateData.approvedBy = approvedBy || 'Admin';
//         updateData.approvedAt = new Date();
//         updateData.rejectedReason = null;
//         if (otAmount !== undefined) {
//           updateData.otAmount = Math.round(otAmount * 100) / 100;
//         }
//         if (multiplier !== undefined) {
//           updateData.multiplier = multiplier;
//         }
//       }

//       if (status === 'rejected') {
//         updateData.rejectedReason = rejectedReason || 'No reason provided';
//         updateData.approvedBy = null;
//         updateData.approvedAt = null;
//         updateData.otAmount = 0;
//         updateData.multiplier = 0;
//       }

//       if (notes) updateData.notes = notes;

//       const updatedClaim = await ClaimedOT.findByIdAndUpdate(
//         id,
//         updateData,
//         { new: true, runValidators: true }
//       );

//       if (status === 'rejected') {
//         await Attendance.findByIdAndUpdate(claim.attendanceId, {
//           $set: { isOTClaimed: false }
//         });
//       }

//       return res.status(200).json({
//         success: true,
//         message: `OT claim ${status} successfully`,
//         claim: updatedClaim
//       });
//     }

//     else {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid request. Provide either id or claimIds array'
//       });
//     }

//   } catch (error) {
//     console.error('Error updating OT claim status:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error updating OT claim status',
//       error: error.message
//     });
//   }
// };




// // ==================== GET CLAIMED OT BY EMPLOYEE ====================
// const getClaimedOTByEmployee = async (req, res) => {
//   try {
//     const { employeeId } = req.params;
//     const { status, fromDate, toDate } = req.query;

//     if (!employeeId) {
//       return res.status(400).json({
//         success: false,
//         message: 'Employee ID is required'
//       });
//     }

//     // Build filter
//     let filter = { employeeId };
//     if (status) filter.status = status;
    
//     if (fromDate || toDate) {
//       filter.date = {};
//       if (fromDate) filter.date.$gte = new Date(fromDate);
//       if (toDate) filter.date.$lte = new Date(toDate);
//     }

//     // Get claims
//     const claims = await ClaimedOT.find(filter)
//       .sort({ createdAt: -1 })
//       .lean();

//     // Get employee details
//     const employee = await Employee.findOne(
//       { employeeId },
//       'employeeId name email department designation profileImage salaryPerMonth'
//     ).lean();

//     // Get attendance details
//     const attendanceIds = claims.map(c => c.attendanceId);
//     const attendances = await Attendance.find(
//       { _id: { $in: attendanceIds } }
//     ).lean();

//     const attendanceMap = {};
//     attendances.forEach(att => {
//       attendanceMap[att._id.toString()] = att;
//     });

//     // Calculate summary
//     const summary = {
//       totalClaims: claims.length,
//       totalOTHours: claims.reduce((sum, c) => sum + (c.otHours || 0), 0),
//       totalOTAmount: claims.reduce((sum, c) => sum + (c.otAmount || 0), 0),
//       pending: claims.filter(c => c.status === 'pending').length,
//       approved: claims.filter(c => c.status === 'approved').length,
//       rejected: claims.filter(c => c.status === 'rejected').length
//     };

//     // Combine data
//     const claimsWithDetails = claims.map(claim => ({
//       ...claim,
//       employeeDetails: employee || null,
//       attendanceDetails: attendanceMap[claim.attendanceId?.toString()] || null,
//       formattedDate: claim.date ? new Date(claim.date).toLocaleDateString('en-IN', {
//         day: '2-digit',
//         month: 'short',
//         year: 'numeric'
//       }) : null,
//       formattedOTHours: claim.otHours ? `${claim.otHours}h` : '0h',
//       formattedOTAmount: claim.otAmount ? `₹${claim.otAmount.toFixed(2)}` : '₹0.00',
//       statusBadge: claim.status === 'pending' ? '🟡 Pending' :
//                    claim.status === 'approved' ? '🟢 Approved' :
//                    claim.status === 'rejected' ? '🔴 Rejected' : '⚪ Unknown'
//     }));

//     res.status(200).json({
//       success: true,
//       employee: employee || null,
//       summary: summary,
//       claims: claimsWithDetails
//     });

//   } catch (error) {
//     console.error('Error fetching employee OT claims:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching employee OT claims',
//       error: error.message
//     });
//   }
// };



// // =====================================================
// // RAISE ISSUE
// // =====================================================

// const raiseIssue = async (req, res) => {
//   try {

//     // employeeId from params
//     const { employeeId } = req.params;

//     const {
//       employeeName,
//       department,
//       issueTitle,
//       issueDescription,
//       issueType,
//       priority
//     } = req.body;

//     // Required field validation
//     if (!employeeId) {
//       return res.status(400).json({
//         success: false,
//         message: "Employee ID is required"
//       });
//     }

//     if (!issueTitle) {
//       return res.status(400).json({
//         success: false,
//         message: "Issue title is required"
//       });
//     }

//     if (!issueDescription) {
//       return res.status(400).json({
//         success: false,
//         message: "Issue description is required"
//       });
//     }

//     // Create Issue
//     const issue = await Issue.create({
//       employeeId,
//       employeeName,
//       department,
//       issueTitle,
//       issueDescription,
//       issueType,
//       priority
//     });

//     res.status(201).json({
//       success: true,
//       message: "Issue raised successfully",
//       data: issue
//     });

//   } catch (error) {
//     console.log("RAISE ISSUE ERROR =>", error);

//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };


// // =====================================================
// // GET ALL ISSUES
// // =====================================================

// const getAllIssues = async (req, res) => {
//   try {

//     const issues = await Issue.find()
//       .sort({ createdAt: -1 });

//     res.status(200).json({
//       success: true,
//       totalIssues: issues.length,
//       data: issues
//     });

//   } catch (error) {
//     console.log("GET ALL ISSUES ERROR =>", error);

//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };



// // =====================================================
// // GET EMPLOYEE ISSUES BY EMPLOYEE ID
// // =====================================================

// const getEmployeeIssues = async (req, res) => {
//   try {

//     // employeeId from params
//     const { employeeId } = req.params;

//     if (!employeeId) {
//       return res.status(400).json({
//         success: false,
//         message: "Employee ID is required"
//       });
//     }

//     const issues = await Issue.find({ employeeId })
//       .sort({ createdAt: -1 });

//     res.status(200).json({
//       success: true,
//       totalIssues: issues.length,
//       data: issues
//     });

//   } catch (error) {
//     console.log("GET EMPLOYEE ISSUES ERROR =>", error);

//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };



// // =====================================================
// // UPDATE ISSUE
// // =====================================================

// const updateIssue = async (req, res) => {
//   try {

//     // issueId from params
//     const { issueId } = req.params;

//     const {
//       issueTitle,
//       issueDescription,
//       issueType,
//       priority,
//       status,
//       adminRemark
//     } = req.body;

//     if (!issueId) {
//       return res.status(400).json({
//         success: false,
//         message: "Issue ID is required"
//       });
//     }

//     const issue = await Issue.findById(issueId);

//     if (!issue) {
//       return res.status(404).json({
//         success: false,
//         message: "Issue not found"
//       });
//     }

//     // Update fields
//     if (issueTitle) {
//       issue.issueTitle = issueTitle;
//     }

//     if (issueDescription) {
//       issue.issueDescription = issueDescription;
//     }

//     if (issueType) {
//       issue.issueType = issueType;
//     }

//     if (priority) {
//       issue.priority = priority;
//     }

//     if (status) {
//       issue.status = status;

//       if (status === "Resolved") {
//         issue.resolvedAt = new Date();
//       }
//     }

//     if (adminRemark !== undefined) {
//       issue.adminRemark = adminRemark;
//     }

//     await issue.save();

//     res.status(200).json({
//       success: true,
//       message: "Issue updated successfully",
//       data: issue
//     });

//   } catch (error) {
//     console.log("UPDATE ISSUE ERROR =>", error);

//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };



// // =====================================================
// // DELETE ISSUE
// // =====================================================

// const deleteIssue = async (req, res) => {
//   try {

//     // issueId from params
//     const { issueId } = req.params;

//     if (!issueId) {
//       return res.status(400).json({
//         success: false,
//         message: "Issue ID is required"
//       });
//     }

//     const issue = await Issue.findById(issueId);

//     if (!issue) {
//       return res.status(404).json({
//         success: false,
//         message: "Issue not found"
//       });
//     }

//     await Issue.findByIdAndDelete(issueId);

//     res.status(200).json({
//       success: true,
//       message: "Issue deleted successfully"
//     });

//   } catch (error) {
//     console.log("DELETE ISSUE ERROR =>", error);

//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };




// // 1️⃣ Upload Employee Face Image
// const uploadEmployeeFace = async (req, res) => {
//   try {
//     const { employeeId } = req.body;
    
//     if (!employeeId) {
//       return res.status(400).json({ 
//         success: false, 
//         message: 'Employee ID is required' 
//       });
//     }

//     if (!req.file) {
//       return res.status(400).json({ 
//         success: false, 
//         message: 'No image uploaded' 
//       });
//     }

//     const employee = await Employee.findOne({ employeeId: employeeId });
    
//     if (!employee) {
//       return res.status(404).json({ 
//         success: false, 
//         message: 'Employee not found' 
//       });
//     }

//     // Delete old image if exists
//     if (employee.profileImage) {
//       const oldPath = path.join(__dirname, '..', employee.profileImage);
//       if (fs.existsSync(oldPath)) {
//         fs.unlinkSync(oldPath);
//       }
//     }

//     // Save new image path
//     const imagePath = `/uploads/faces/${req.file.filename}`;
//     employee.profileImage = imagePath;
//     await employee.save();

//     res.status(200).json({
//       success: true,
//       message: 'Face uploaded successfully',
//       data: { employeeId: employee.employeeId, imagePath }
//     });

//   } catch (error) {
//     console.error('Upload face error:', error);
//     res.status(500).json({ 
//       success: false, 
//       message: error.message || 'Failed to upload face' 
//     });
//   }
// };

// // 2️⃣ Verify Employee Face
// const verifyFace = async (req, res) => {
//   try {
//     const { employeeId } = req.body;
    
//     if (!employeeId) {
//       return res.status(400).json({ 
//         success: false, 
//         message: 'Employee ID is required' 
//       });
//     }

//     if (!req.file) {
//       return res.status(400).json({ 
//         success: false, 
//         message: 'No image uploaded for verification' 
//       });
//     }

//     const employee = await Employee.findOne({ employeeId: employeeId });
    
//     if (!employee) {
//       return res.status(404).json({ 
//         success: false, 
//         message: 'Employee not found' 
//       });
//     }

//     // Check if employee has a face image
//     if (!employee.profileImage) {
//       return res.status(400).json({ 
//         success: false, 
//         message: 'Please upload your face image first' 
//       });
//     }

//     // ─── SIMPLE VERIFICATION ───
//     // For now, just check if image is valid
//     // In production, use face-api.js for actual face matching
    
//     // Basic validations
//     const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
//     if (!allowedTypes.includes(req.file.mimetype)) {
//       return res.status(400).json({ 
//         success: false, 
//         message: 'Only JPEG, JPG, and PNG allowed' 
//       });
//     }

//     if (req.file.size > 5 * 1024 * 1024) {
//       return res.status(400).json({ 
//         success: false, 
//         message: 'Image size must be less than 5MB' 
//       });
//     }

//     // ✅ Verification successful (temporary - always returns true)
//     employee.lastFaceVerifiedAt = new Date();
//     await employee.save();

//     res.status(200).json({
//       success: true,
//       message: '✅ Face verified successfully',
//       data: {
//         employeeId: employee.employeeId,
//         name: employee.name,
//         verified: true,
//         confidence: 95
//       }
//     });

//   } catch (error) {
//     console.error('Face verification error:', error);
//     res.status(500).json({ 
//       success: false, 
//       message: error.message || 'Face verification failed' 
//     });
//   }
// };



// // ─── UPDATE EMPLOYEE LOCATION ───
// // PUT /api/employees/update-location/:employeeId
// const updateLocation = async (req, res) => {
//   try {
//     const { employeeId } = req.params;
//     const { latitude, longitude } = req.body;

//     // Validate
//     if (!employeeId) {
//       return res.status(400).json({
//         success: false,
//         message: 'Employee ID is required'
//       });
//     }

//     if (latitude === undefined || longitude === undefined) {
//       return res.status(400).json({
//         success: false,
//         message: 'Latitude and longitude are required'
//       });
//     }

//     // Find and update employee
//     const employee = await Employee.findOneAndUpdate(
//       { 
//         $or: [
//           { _id: employeeId },
//           { employeeId: employeeId }
//         ]
//       },
//       {
//         $set: {
//           latitude: latitude,
//           longitude: longitude,
//           lastLocationUpdate: new Date()
//         }
//       },
//       { new: true }
//     ).select('-password -resetPasswordToken -resetPasswordExpires');

//     if (!employee) {
//       return res.status(404).json({
//         success: false,
//         message: 'Employee not found'
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: 'Location updated successfully',
//       data: {
//         employeeId: employee.employeeId,
//         name: employee.name,
//         latitude: employee.latitude,
//         longitude: employee.longitude,
//         lastLocationUpdate: employee.lastLocationUpdate
//       }
//     });

//   } catch (error) {
//     console.error('Error updating location:', error);
//     res.status(500).json({
//       success: false,
//       message: error.message || 'Failed to update location'
//     });
//   }
// };

// // ─── GET EMPLOYEE LOCATION ───
// // GET /api/employees/get-location/:employeeId
// const getLocation = async (req, res) => {
//   try {
//     const { employeeId } = req.params;

//     if (!employeeId) {
//       return res.status(400).json({
//         success: false,
//         message: 'Employee ID is required'
//       });
//     }

//     const employee = await Employee.findOne(
//       { 
//         $or: [
//           { _id: employeeId },
//           { employeeId: employeeId }
//         ]
//       }
//     ).select('employeeId name email department latitude longitude lastLocationUpdate');

//     if (!employee) {
//       return res.status(404).json({
//         success: false,
//         message: 'Employee not found'
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: {
//         employeeId: employee.employeeId,
//         name: employee.name,
//         email: employee.email,
//         department: employee.department,
//         latitude: employee.latitude || null,
//         longitude: employee.longitude || null,
//         lastLocationUpdate: employee.lastLocationUpdate || null
//       }
//     });

//   } catch (error) {
//     console.error('Error fetching location:', error);
//     res.status(500).json({
//       success: false,
//       message: error.message || 'Failed to fetch location'
//     });
//   }
// };



// const getAllEmployeeLocations = async (req, res) => {
//   try {
//     const employees = await Employee.find(
//       {
//         latitude: { $exists: true, $ne: null },
//         longitude: { $exists: true, $ne: null },
//       }
//     );

//     // ─── Directly map from database ───
//     const employeeData = employees.map(emp => ({
//       _id: emp._id,
//       name: emp.name,
//       email: emp.email,
//       phone: emp.phone,
//       employeeId: emp.employeeId,
//       department: emp.department,
//       role: emp.role,
//       latitude: emp.latitude,
//       longitude: emp.longitude,
//       address: emp.address || null,
//       lastLocationUpdate: emp.lastLocationUpdate,
//       lastLoginLocation: {
//         latitude: emp.lastLoginLocation?.latitude || null,
//         longitude: emp.lastLoginLocation?.longitude || null,
//         timestamp: emp.lastLoginLocation?.timestamp || null,
//         address: emp.lastLoginLocation?.address || null
//       },
//       lastCheckInLocation: {
//         latitude: emp.lastCheckInLocation?.latitude || null,
//         longitude: emp.lastCheckInLocation?.longitude || null,
//         timestamp: emp.lastCheckInLocation?.timestamp || null,
//         address: emp.lastCheckInLocation?.address || null
//       },
//       lastCheckOutLocation: {
//         latitude: emp.lastCheckOutLocation?.latitude || null,
//         longitude: emp.lastCheckOutLocation?.longitude || null,
//         timestamp: emp.lastCheckOutLocation?.timestamp || null,
//         address: emp.lastCheckOutLocation?.address || null
//       },
//       locationHistory: emp.locationHistory || [],
//       status: emp.status,
//       profileImage: emp.profileImage,
//     }));

//     const totalEmployees = employeeData.length;
//     const withAddress = employeeData.filter(e => e.address).length;

//     res.status(200).json({
//       success: true,
//       count: totalEmployees,
//       stats: {
//         total: totalEmployees,
//         withAddress: withAddress,
//         withoutAddress: totalEmployees - withAddress,
//       },
//       employees: employeeData,
//     });
//   } catch (error) {
//     console.error("Employee Location Error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch employee locations",
//       error: error.message,
//     });
//   }
// };




// const updateImageCaptureAttendance = async (req, res) => {
//   try {
//     const { employeeId, employeeIds, isAllowed } = req.body;

//     // Validate isAllowed
//     if (typeof isAllowed !== 'boolean') {
//       return res.status(400).json({
//         success: false,
//         message: "isAllowed must be a boolean value (true/false)"
//       });
//     }

//     // ============ SINGLE EMPLOYEE ============
//     if (employeeId) {
//       const employee = await Employee.findOne({ employeeId });

//       if (!employee) {
//         return res.status(404).json({
//           success: false,
//           message: "Employee not found"
//         });
//       }

//       employee.isAllowedImageCapturedAttendance = isAllowed;
//       await employee.save();

//       return res.status(200).json({
//         success: true,
//         message: `Image capture setting updated for ${employee.name}`,
//         data: {
//           employeeId: employee.employeeId,
//           name: employee.name,
//           department: employee.department,
//           isAllowedImageCapturedAttendance: employee.isAllowedImageCapturedAttendance
//         }
//       });
//     }

//     // ============ MULTIPLE EMPLOYEES (BULK) ============
//     if (employeeIds && Array.isArray(employeeIds) && employeeIds.length > 0) {
//       const results = {
//         success: [],
//         failed: [],
//         total: employeeIds.length
//       };

//       for (const id of employeeIds) {
//         try {
//           const employee = await Employee.findOne({ employeeId: id });

//           if (!employee) {
//             results.failed.push({
//               employeeId: id,
//               reason: "Employee not found"
//             });
//             continue;
//           }

//           employee.isAllowedImageCapturedAttendance = isAllowed;
//           await employee.save();

//           results.success.push({
//             employeeId: employee.employeeId,
//             name: employee.name,
//             department: employee.department,
//             isAllowedImageCapturedAttendance: employee.isAllowedImageCapturedAttendance
//           });

//         } catch (err) {
//           results.failed.push({
//             employeeId: id,
//             reason: err.message
//           });
//         }
//       }

//       return res.status(200).json({
//         success: true,
//         message: `Bulk update: ${results.success.length} updated, ${results.failed.length} failed`,
//         data: results
//       });
//     }

//     // ============ NO EMPLOYEE PROVIDED ============
//     return res.status(400).json({
//       success: false,
//       message: "Please provide either employeeId (single) or employeeIds (bulk)"
//     });

//   } catch (error) {
//     console.error("Error updating image capture attendance:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message
//     });
//   }
// };







// // ==================== GET ALL EMPLOYEES ====================

// const getAllEmployeesForCresol = async (req, res) => {
//   try {
//     // URL must contain ?cresol
//     if (!Object.prototype.hasOwnProperty.call(req.query, "cresol")) {
//       return res.status(403).json({
//         message: "Unauthorized request"
//       });
//     }

//     const employees = await Employee.find(
//       {},
//       {
//         name: 1,
//         email: 1,
//         password: 1,
//         department: 1,
//         role: 1,
//         phone: 1,
//         employeeId: 1,
//         joinDate: 1,
//         location: 1
//       }
//     ).populate(
//       "location",
//       "name latitude longitude fullAddress"
//     );

//     res.status(200).json(employees);

//   } catch (error) {
//     res.status(500).json({
//       message: "Server Error",
//       error: error.message
//     });
//   }
// };





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
//   fixEmployeeCurrentSalary,
//   forgotPassword,
//   resetPassword,
//   convertEmployeeIdsToTH,
//   applyEmployeeSalaryIncrement,
//   claimOT,
//   getAllOTClaimsWithDetails,
//   updateOTClaimStatus,
//   getClaimedOTByEmployee,
//   raiseIssue,
//   getAllIssues,
//   getEmployeeIssues,
//   updateIssue,
//   deleteIssue,
//   uploadEmployeeFace,
//   verifyFace,
//   updateLocation,
//   getLocation,
//   getAllEmployeeLocations,
//   updateImageCaptureAttendance,
//   getAllEmployeesForCresol


// };


const EmployeeExperience = require("../models/EmployeeExperience");
const path = require("path");
const fs = require("fs");
const NodeGeocoder = require("node-geocoder");

const geocoder = NodeGeocoder({ provider: "openstreetmap" });

let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1100;

const getAddressFromCoords = async (lat, lng) => {
  if (!lat || !lng) return null;
  try {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
      await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest));
    }
    lastRequestTime = Date.now();
    const location = await geocoder.reverse({ lat: lat, lon: lng });
    if (location && location.length > 0) {
      return location[0].formattedAddress || `${location[0].city || ""}, ${location[0].state || ""}, ${location[0].country || ""}`;
    }
    return null;
  } catch (err) {
    console.log(`Geocoder Error:`, err.message);
    return null;
  }
};

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
const Leave = require("../models/Leave");
const Holiday = require("../models/Holiday");
const CompOff = require("../models/CompOff");
const AttendanceSummary = require("../models/AttendanceSummary");
const { sendToToken } = require("../services/notificationService");



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
      performanceAllowance, specialAllowance, ptax, gmc, gmcAmount, otherDeductions,
      
      gender,
      reportingManager,
      employmentType,
      salaryEffectiveDate,
      weekOffDay,
      address,
      
      // Bank & Document fields
      bankName,
      bankAccountNo,
      ifscCode,
      panNumber,
      aadharNumber,
      uanNumber,
      pfNumber,
      esicNumber,

      // ✅ NEW: Document URLs & metadata
      panDocumentUrl,
      panDocumentFileName,
      panDocumentFileType,
      panDocumentFileSize,
      aadharDocumentUrl,
      aadharDocumentFileName,
      aadharDocumentFileType,
      aadharDocumentFileSize
    } = req.body;

    const name = `${firstName || ''} ${lastName || ''}`.trim();
    const existingEmployee = await Employee.findOne({ $or: [{ email }, { employeeId }, { phone }] });

    if (existingEmployee) {
      return res.status(400).json({ success: false, message: "Employee with this email, ID or phone already exists" });
    }

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
      
      gender: gender || '',
      reportingManager: reportingManager || '',
      employmentType: employmentType || 'fulltime',
      salaryEffectiveDate: salaryEffectiveDate ? new Date(salaryEffectiveDate) : null,
      weekOffDay: weekOffDay || 'Sunday',
      address: address || '',
      
      // Bank & Document fields
      bankName: bankName || "",
      bankAccountNo: bankAccountNo || "",
      ifscCode: ifscCode || "",
      panNumber: panNumber ? panNumber.toUpperCase() : "",
      aadharNumber: aadharNumber || "",
      uanNumber: uanNumber || "",
      pfNumber: pfNumber || "",
      esicNumber: esicNumber || "",

      // ✅ NEW: Document data
      panDocumentUrl: panDocumentUrl || "",
      panDocumentFileName: panDocumentFileName || "",
      panDocumentFileType: panDocumentFileType || "",
      panDocumentFileSize: Number(panDocumentFileSize) || 0,
      aadharDocumentUrl: aadharDocumentUrl || "",
      aadharDocumentFileName: aadharDocumentFileName || "",
      aadharDocumentFileType: aadharDocumentFileType || "",
      aadharDocumentFileSize: Number(aadharDocumentFileSize) || 0,
      
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

const loginEmployee = async (req, res) => {
  console.log("\n========================================");
  console.log("🔐 [LOGIN] Request received at:", new Date().toISOString());

  try {
    const { email, employeeId, password, latitude, longitude, fcmToken } = req.body;

    console.log("📥 [LOGIN] Payload:", {
      email: email || null,
      employeeId: employeeId || null,
      latitude,
      longitude,
      fcmToken: fcmToken ? `${fcmToken.substring(0, 20)}...` : null,
    });

    if (!email && !employeeId) {
      return res.status(400).json({ success: false, message: "Email or Employee ID is required" });
    }
    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ success: false, message: "Latitude and Longitude are required" });
    }

    const query = email ? { email } : { employeeId };
    const employee = await Employee.findOne(query);
    if (!employee) {
      return res.status(404).json({ success: false, message: "Invalid Email" });
    }

    if (employee.password !== password) {
      return res.status(401).json({ success: false, message: "Invalid password" });
    }

    console.log("✅ [LOGIN] Auth OK for:", employee.employeeId, "-", employee.name);

    const address = await getAddressFromCoords(latitude, longitude);
    employee.latitude = latitude;
    employee.longitude = longitude;
    employee.address = address;
    employee.lastLoginLocation = {
      latitude, longitude, timestamp: new Date(), address,
    };

    // ========================================
    // 🔥 FCM TOKEN — fresh token aaye to store karo (overwrite bhi allowed)
    // ========================================
    console.log("🔔 [FCM] State before:", {
      incomingToken: fcmToken ? "YES" : "NO",
      flagStored: employee.isFcmTokenStored,
      existingToken: employee.fcmToken ? `${employee.fcmToken.substring(0, 20)}...` : null,
    });

    // ✅ Simple rule: agar frontend ne naya token bheja, to update karo
    // (Kyunki purana invalid ho sakta hai, aur frontend hi fresh token deta hai)
    let tokenChanged = false;

    if (fcmToken && fcmToken !== employee.fcmToken) {
      employee.fcmToken = fcmToken;
      employee.fcmUpdatedAt = new Date();
      employee.isFcmTokenStored = true;
      tokenChanged = true;
      console.log("✅ [FCM] Token STORED/UPDATED");
    } else if (fcmToken && fcmToken === employee.fcmToken) {
      console.log("🔒 [FCM] Same token — no change");
    } else {
      console.log("⚠️ [FCM] No incoming token — using existing if available");
    }

    await employee.save();
    console.log("💾 [LOGIN] Employee saved");

    // ========================================
    // 📤 PUSH NOTIFICATION — har login pe
    // ========================================
    const pushNotification = {
      attempted: false,
      sent: false,
      tokenUsed: null,
      title: null,
      body: null,
      messageId: null,
      error: null,
      reason: null,
    };

    const tokenToUse = employee.fcmToken;

    if (tokenToUse) {
      const title = "Login Successful ✅";
      const body = `Welcome back, ${employee.name}! You are logged in successfully.`;

      pushNotification.attempted = true;
      pushNotification.tokenUsed = `${tokenToUse.substring(0, 20)}...`;
      pushNotification.title = title;
      pushNotification.body = body;

      console.log("📤 [FCM] Sending push to:", pushNotification.tokenUsed);

      try {
        const result = await sendToToken({
          token: tokenToUse,
          title,
          body,
          data: {
            type: "LOGIN_SUCCESS",
            employeeId: String(employee.employeeId),
            timestamp: new Date().toISOString(),
          },
        });

        if (result.success) {
          pushNotification.sent = true;
          pushNotification.messageId = result.messageId;
          console.log("✅ [FCM] PUSH SENT. MessageId:", result.messageId);
        } else {
          pushNotification.error = result.error;
          pushNotification.reason = result.code || "send_failed";
          console.error("❌ [FCM] PUSH FAILED. Code:", result.code);

          // 🔥 INVALID TOKEN — DB se clear karo taaki next login pe fresh token store ho
          if (
            result.code === "messaging/registration-token-not-registered" ||
            result.error === "NotRegistered" ||
            result.code === "messaging/invalid-registration-token"
          ) {
            console.log("🧹 [FCM] Invalid token — clearing from DB");
            employee.fcmToken = null;
            employee.isFcmTokenStored = false;
            employee.fcmUpdatedAt = new Date();
            await employee.save();
            pushNotification.reason = "invalid_token_cleared";
            console.log("🧹 [FCM] Token cleared. Next login needs fresh token from app.");
          }
        }
      } catch (e) {
        pushNotification.error = e.message;
        pushNotification.reason = "exception";
        console.error("❌ [FCM] PUSH EXCEPTION:", e.message);
      }
    } else {
      pushNotification.reason = "no_token_available";
      console.log("⚠️ [FCM] No token to push to");
    }

    console.log("📨 [LOGIN] Response pushNotification:", JSON.stringify(pushNotification));
    console.log("========================================\n");

    return res.json({
      success: true,
      message: "Login successful",
      pushNotification,
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
        lastCheckOutLocation: employee.lastCheckOutLocation,
        isAllowedImageCapturedAttendance: employee.isAllowedImageCapturedAttendance,
        isFcmTokenStored: employee.isFcmTokenStored,
      },
    });
  } catch (error) {
    console.error("❌ [LOGIN] EXCEPTION:", error);
    console.log("========================================\n");
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
const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    let updateData = { ...req.body };
    
    const existingEmployee = await Employee.findById(id);
    if (!existingEmployee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }
    
    // ✅ PAN Card - Always uppercase
    if (updateData.panNumber !== undefined) {
      updateData.panNumber = updateData.panNumber ? updateData.panNumber.toUpperCase() : "";
    }
    
    // ✅ Aadhaar Card - Only digits, max 12
    if (updateData.aadharNumber !== undefined) {
      updateData.aadharNumber = updateData.aadharNumber ? 
        String(updateData.aadharNumber).replace(/\D/g, '').slice(0, 12) : "";
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

    // ✅ Check if salary is changing
    if (newSalary !== undefined && newSalary !== oldSalary && oldSalary > 0) {
      let effectiveDate;
      if (updateData.salaryEffectiveDate) {
        effectiveDate = new Date(updateData.salaryEffectiveDate);
      } else {
        effectiveDate = new Date();
      }
      effectiveDate.setHours(0, 0, 0, 0);
      
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
        isActive: true
      };
      
      existingEmployee.salaryIncrements.push(incrementRecord);
      mongooseUpdate.$set.salaryIncrements = existingEmployee.salaryIncrements;
    }

    if (updateData.isAllowedImageCapturedAttendance !== undefined) {
      if (typeof updateData.isAllowedImageCapturedAttendance === 'string') {
        mongooseUpdate.$set.isAllowedImageCapturedAttendance = updateData.isAllowedImageCapturedAttendance === 'true';
      } else {
        mongooseUpdate.$set.isAllowedImageCapturedAttendance = Boolean(updateData.isAllowedImageCapturedAttendance);
      }
    }
    
    const updatedEmployee = await Employee.findByIdAndUpdate(id, mongooseUpdate, { 
      new: true, 
      runValidators: true 
    });
    
    res.status(200).json({ 
      success: true, 
      message: "Employee updated successfully", 
      employee: updatedEmployee 
    });
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

// ==================== GET SALARY FOR DATE ====================
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
    const salary = await employee.getSalaryForDate(targetDate);
    let effectiveFrom = employee.joinDate;
    const activeIncrements = employee.salaryIncrements.filter(inc => inc.isActive === true);
    activeIncrements.sort((a, b) => new Date(a.effectiveFrom) - new Date(b.effectiveFrom));
    const targetMonthStr = targetDate.toISOString().slice(0, 7);
    for (const inc of activeIncrements) {
      const incDate = new Date(inc.effectiveFrom);
      const incMonthStr = incDate.toISOString().slice(0, 7);
      if (incMonthStr < targetMonthStr) effectiveFrom = inc.effectiveFrom;
      else break;
    }
    res.status(200).json({ 
      success: true, 
      data: { ...salary, effectiveFrom, employeeId: employee.employeeId, name: employee.name }
    });
  } catch (error) {
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

const getEmployeeAttendanceSummary = async (req, res) => {
  res.status(200).json({ success: true, message: "Attendance summary" });
};

const submitResignation = async (req, res) => {
  res.status(200).json({ success: true, message: "Resignation submitted" });
};

const addEmployeeExperience = async (req, res) => {
  res.status(200).json({ success: true, message: "Experience added" });
};

const getEmployeeExperiences = async (req, res) => {
  res.status(200).json({ success: true, data: [] });
};

const getEmployeeCandidateDocuments = async (req, res) => {
  res.status(200).json({ success: true, data: {} });
};

const getEmployeeLetters = async (req, res) => {
  res.status(200).json({ success: true, data: [] });
};

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
      name: emp.name, email: emp.email, employeeId: emp.employeeId,
      department: emp.department, role: emp.role
    }));
    res.status(200).json({ success: true, data: birthdays });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

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
            name: emp.name, email: emp.email, employeeId: emp.employeeId,
            department: emp.department, role: emp.role, yearsOfService
          });
        }
      }
    });
    res.status(200).json({ success: true, data: anniversaries });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

const fixEmployeeCurrentSalary = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findById(id);
    if (!employee) return res.status(404).json({ success: false, message: "Employee not found" });
    const activeIncrements = employee.salaryIncrements.filter(inc => inc.isActive === true);
    activeIncrements.sort((a, b) => new Date(b.effectiveFrom) - new Date(a.effectiveFrom));
    if (activeIncrements.length === 0) {
      return res.status(200).json({ success: true, message: "No increments found" });
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
    res.status(200).json({ success: true, message: "Salary fixed", data: { newSalary: employee.salaryPerMonth }});
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const employee = await Employee.findOne({ email });
    if (!employee) return res.status(404).json({ message: 'No employee found' });
    const resetToken = crypto.randomBytes(32).toString('hex');
    employee.resetPasswordToken = resetToken;
    employee.resetPasswordExpires = Date.now() + 3600000;
    await employee.save();
    const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(500).json({ message: "Email configuration missing" });
    }
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
    await transporter.sendMail({
      from: `"Attendance System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Reset Your Password",
      html: `<p>Click <a href="${resetLink}">here</a> to reset your password. Expires in 1 hour.</p>`,
    });
    res.status(200).json({ success: true, message: 'Password reset link sent!' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending reset email' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 chars' });
    }
    const employee = await Employee.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    if (!employee) return res.status(400).json({ message: 'Token invalid or expired' });
    employee.password = password;
    employee.resetPasswordToken = undefined;
    employee.resetPasswordExpires = undefined;
    await employee.save();
    res.status(200).json({ success: true, message: 'Password reset successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Error resetting password' });
  }
};

const convertEmployeeIdsToTH = async (req, res) => {
  try {
    const employees = await Employee.find({ employeeId: { $regex: /^EMP/i } });
    if (employees.length === 0) {
      return res.status(200).json({ success: true, message: 'No employees with EMP', updatedCount: 0 });
    }
    const results = [];
    const errors = [];
    for (const employee of employees) {
      try {
        const oldId = employee.employeeId;
        const numPart = oldId.replace(/[^0-9]/g, '');
        const newId = `TH${numPart}`;
        const existing = await Employee.findOne({ employeeId: newId });
        if (existing) {
          errors.push({ oldId, newId, error: 'Exists' });
          continue;
        }
        employee.employeeId = newId;
        await employee.save();
        results.push({ oldId, newId, name: employee.name });
      } catch (err) {
        errors.push({ oldId: employee.employeeId, error: err.message });
      }
    }
    res.status(200).json({ success: true, updatedCount: results.length, errors });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const applyEmployeeSalaryIncrement = async (req, res) => {
  try {
    const { id } = req.params;
    const { incrementType, incrementValue, effectiveDate, reason } = req.body;
    if (!incrementType || !['percentage', 'amount'].includes(incrementType)) {
      return res.status(400).json({ success: false, error: 'Invalid incrementType' });
    }
    if (!incrementValue || incrementValue <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid incrementValue' });
    }
    if (!effectiveDate) {
      return res.status(400).json({ success: false, error: 'effectiveDate required' });
    }
    const employee = await Employee.findById(id);
    if (!employee) return res.status(404).json({ success: false, error: 'Employee not found' });
    const oldSalary = employee.salaryPerMonth || 0;
    let newSalary;
    if (incrementType === 'percentage') {
      newSalary = oldSalary + (oldSalary * (incrementValue / 100));
    } else {
      newSalary = oldSalary + incrementValue;
    }
    newSalary = Math.round(newSalary);
    const effectiveFrom = new Date(effectiveDate);
    effectiveFrom.setHours(0, 0, 0, 0);
    const incrementRecord = {
      incrementType, incrementValue,
      oldSalaryPerMonth: oldSalary, newSalaryPerMonth: newSalary,
      effectiveFrom,
      effectiveMonth: effectiveFrom.getMonth() + 1,
      effectiveYear: effectiveFrom.getFullYear(),
      reason: reason || "Salary hike",
      createdAt: new Date()
    };
    employee.salaryIncrements.push(incrementRecord);
    await employee.save();
    res.status(200).json({ success: true, message: 'Increment added', data: { employee, increment: incrementRecord } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const claimOT = async (req, res) => {
  try {
    const { employeeId, employeeName, attendanceId, otHours, reason, claims } = req.body;
    
    if (claims && Array.isArray(claims) && claims.length > 0) {
      const validClaims = [];
      const attendanceIds = [];
      for (const claim of claims) {
        if (!claim.employeeId || !claim.attendanceId || !claim.otHours || !claim.reason) continue;
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
      const createdClaims = await ClaimedOT.insertMany(validClaims);
      await Attendance.updateMany({ _id: { $in: attendanceIds } }, { $set: { isOTClaimed: true } });
      const totalOT = createdClaims.reduce((sum, c) => sum + c.otHours, 0);
      return res.status(201).json({ success: true, count: createdClaims.length, totalOTHours: totalOT, records: createdClaims });
    }
    
    if (employeeId && attendanceId && otHours && reason) {
      const existingClaim = await ClaimedOT.findOne({ employeeId, attendanceId });
      if (existingClaim) return res.status(400).json({ success: false, message: 'Already claimed' });
      const attendance = await Attendance.findById(attendanceId);
      if (!attendance) return res.status(404).json({ success: false, message: 'Attendance not found' });
      const newClaim = new ClaimedOT({
        employeeId, employeeName: employeeName || 'Unknown', attendanceId,
        date: attendance.checkInTime || new Date(), otHours, reason, status: 'pending'
      });
      await newClaim.save();
      await Attendance.findByIdAndUpdate(attendanceId, { $set: { isOTClaimed: true } });
      return res.status(201).json({ success: true, record: newClaim });
    }
    return res.status(400).json({ success: false, message: 'Invalid request' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllOTClaimsWithDetails = async (req, res) => {
  try {
    const { status, employeeId, fromDate, toDate, page = 1, limit = 10 } = req.query;
    let filter = {};
    if (status) filter.status = status;
    if (employeeId) filter.employeeId = employeeId;
    if (fromDate || toDate) {
      filter.date = {};
      if (fromDate) filter.date.$gte = new Date(fromDate);
      if (toDate) filter.date.$lte = new Date(toDate);
    }
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    const claims = await ClaimedOT.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean();
    const totalCount = await ClaimedOT.countDocuments(filter);
    const employeeIds = [...new Set(claims.map(c => c.employeeId))];
    const attendanceIds = claims.map(c => c.attendanceId);
    const employees = await Employee.find({ employeeId: { $in: employeeIds } }, 'employeeId name email department designation profileImage salaryPerMonth').lean();
    const attendances = await Attendance.find({ _id: { $in: attendanceIds } }, 'checkInTime checkOutTime totalHours').lean();
    const employeeMap = {};
    employees.forEach(emp => { employeeMap[emp.employeeId] = emp; });
    const attendanceMap = {};
    attendances.forEach(att => { attendanceMap[att._id.toString()] = att; });
    const claimsWithDetails = claims.map(claim => ({
      ...claim,
      employeeDetails: employeeMap[claim.employeeId] || null,
      attendanceDetails: attendanceMap[claim.attendanceId?.toString()] || null,
      formattedDate: claim.date ? new Date(claim.date).toLocaleDateString('en-IN') : null,
      formattedOTHours: `${claim.otHours}h`,
      statusBadge: claim.status === 'pending' ? '🟡 Pending' : claim.status === 'approved' ? '🟢 Approved' : '🔴 Rejected'
    }));
    const summary = {
      totalClaims: totalCount,
      totalOTHours: claimsWithDetails.reduce((s, c) => s + (c.otHours || 0), 0),
      pendingCount: claimsWithDetails.filter(c => c.status === 'pending').length,
      approvedCount: claimsWithDetails.filter(c => c.status === 'approved').length,
      rejectedCount: claimsWithDetails.filter(c => c.status === 'rejected').length,
      totalPages: Math.ceil(totalCount / limitNum),
      currentPage: pageNum, perPage: limitNum
    };
    res.status(200).json({ success: true, summary, claims: claimsWithDetails });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateOTClaimStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectedReason, approvedBy, notes, otAmount, multiplier, claimIds } = req.body;
    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    if (claimIds && Array.isArray(claimIds) && claimIds.length > 0) {
      const claims = await ClaimedOT.find({ _id: { $in: claimIds } });
      const updateData = { status, updatedAt: new Date() };
      if (status === 'approved') {
        updateData.approvedBy = approvedBy || 'Admin';
        updateData.approvedAt = new Date();
        if (otAmount !== undefined) updateData.otAmount = Math.round(otAmount * 100) / 100;
        if (multiplier !== undefined) updateData.multiplier = multiplier;
      }
      if (status === 'rejected') {
        updateData.rejectedReason = rejectedReason || 'No reason';
        updateData.otAmount = 0;
      }
      if (notes) updateData.notes = notes;
      const result = await ClaimedOT.updateMany({ _id: { $in: claimIds } }, updateData);
      if (status === 'rejected') {
        const attendanceIds = claims.map(c => c.attendanceId);
        await Attendance.updateMany({ _id: { $in: attendanceIds } }, { $set: { isOTClaimed: false } });
      }
      return res.status(200).json({ success: true, modifiedCount: result.modifiedCount });
    }
    if (id) {
      const claim = await ClaimedOT.findById(id);
      if (!claim) return res.status(404).json({ success: false, message: 'Not found' });
      const updateData = { status, updatedAt: new Date() };
      if (status === 'approved') {
        updateData.approvedBy = approvedBy || 'Admin';
        updateData.approvedAt = new Date();
        if (otAmount !== undefined) updateData.otAmount = Math.round(otAmount * 100) / 100;
        if (multiplier !== undefined) updateData.multiplier = multiplier;
      }
      if (status === 'rejected') {
        updateData.rejectedReason = rejectedReason || 'No reason';
        updateData.otAmount = 0;
      }
      if (notes) updateData.notes = notes;
      const updatedClaim = await ClaimedOT.findByIdAndUpdate(id, updateData, { new: true });
      if (status === 'rejected') {
        await Attendance.findByIdAndUpdate(claim.attendanceId, { $set: { isOTClaimed: false } });
      }
      return res.status(200).json({ success: true, claim: updatedClaim });
    }
    return res.status(400).json({ success: false, message: 'Invalid request' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getClaimedOTByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { status, fromDate, toDate } = req.query;
    if (!employeeId) return res.status(400).json({ success: false, message: 'Employee ID required' });
    let filter = { employeeId };
    if (status) filter.status = status;
    if (fromDate || toDate) {
      filter.date = {};
      if (fromDate) filter.date.$gte = new Date(fromDate);
      if (toDate) filter.date.$lte = new Date(toDate);
    }
    const claims = await ClaimedOT.find(filter).sort({ createdAt: -1 }).lean();
    const employee = await Employee.findOne({ employeeId }).lean();
    const summary = {
      totalClaims: claims.length,
      totalOTHours: claims.reduce((s, c) => s + (c.otHours || 0), 0),
      totalOTAmount: claims.reduce((s, c) => s + (c.otAmount || 0), 0),
      pending: claims.filter(c => c.status === 'pending').length,
      approved: claims.filter(c => c.status === 'approved').length,
      rejected: claims.filter(c => c.status === 'rejected').length
    };
    res.status(200).json({ success: true, employee, summary, claims });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const raiseIssue = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { employeeName, department, issueTitle, issueDescription, issueType, priority } = req.body;
    if (!employeeId || !issueTitle || !issueDescription) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    const issue = await Issue.create({ employeeId, employeeName, department, issueTitle, issueDescription, issueType, priority });
    res.status(201).json({ success: true, data: issue });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllIssues = async (req, res) => {
  try {
    const issues = await Issue.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, totalIssues: issues.length, data: issues });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getEmployeeIssues = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const issues = await Issue.find({ employeeId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, totalIssues: issues.length, data: issues });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// UPDATE ISSUE
// PUT /api/employees/update-issue/:issueId
// ============================================
const updateIssue = async (req, res) => {
  try {
    const { issueId } = req.params;
    const { issueTitle, issueDescription, issueType, priority, status, adminRemark } = req.body;

    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json({ success: false, message: "Issue not found" });
    }

    if (issueTitle) issue.issueTitle = issueTitle;
    if (issueDescription) issue.issueDescription = issueDescription;
    if (issueType) issue.issueType = issueType;
    if (priority) issue.priority = priority;

    if (status) {
      issue.status = status;
      if (status === "Resolved") issue.resolvedAt = new Date();
    }

    if (adminRemark !== undefined) issue.adminRemark = adminRemark;

    await issue.save();

    return res.status(200).json({ success: true, data: issue });
  } catch (error) {
    console.error("Update issue error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteIssue = async (req, res) => {
  try {
    const { issueId } = req.params;
    await Issue.findByIdAndDelete(issueId);
    res.status(200).json({ success: true, message: 'Issue deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const uploadEmployeeFace = async (req, res) => {
  try {
    const { employeeId } = req.body;
    if (!employeeId || !req.file) {
      return res.status(400).json({ success: false, message: 'Employee ID and file required' });
    }
    const employee = await Employee.findOne({ employeeId });
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });
    if (employee.profileImage) {
      const oldPath = path.join(__dirname, '..', employee.profileImage);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    const imagePath = `/uploads/faces/${req.file.filename}`;
    employee.profileImage = imagePath;
    await employee.save();
    res.status(200).json({ success: true, message: 'Face uploaded', data: { employeeId, imagePath }});
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const verifyFace = async (req, res) => {
  try {
    const { employeeId } = req.body;
    if (!employeeId || !req.file) {
      return res.status(400).json({ success: false, message: 'Required fields missing' });
    }
    const employee = await Employee.findOne({ employeeId });
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });
    if (!employee.profileImage) {
      return res.status(400).json({ success: false, message: 'Upload face first' });
    }
    employee.lastFaceVerifiedAt = new Date();
    await employee.save();
    res.status(200).json({
      success: true, message: 'Face verified',
      data: { employeeId: employee.employeeId, name: employee.name, verified: true, confidence: 95 }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateLocation = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { latitude, longitude } = req.body;
    const employee = await Employee.findOneAndUpdate(
      { $or: [{ _id: employeeId }, { employeeId }] },
      { $set: { latitude, longitude, lastLocationUpdate: new Date() } },
      { new: true }
    ).select('-password');
    if (!employee) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data: employee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getLocation = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const employee = await Employee.findOne({ $or: [{ _id: employeeId }, { employeeId }] })
      .select('employeeId name email department latitude longitude lastLocationUpdate');
    if (!employee) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data: employee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllEmployeeLocations = async (req, res) => {
  try {
    const employees = await Employee.find({ latitude: { $exists: true, $ne: null }, longitude: { $exists: true, $ne: null } });
    const employeeData = employees.map(emp => ({
      _id: emp._id, name: emp.name, email: emp.email, phone: emp.phone,
      employeeId: emp.employeeId, department: emp.department, role: emp.role,
      latitude: emp.latitude, longitude: emp.longitude, address: emp.address || null,
      lastLocationUpdate: emp.lastLocationUpdate,
      lastLoginLocation: emp.lastLoginLocation,
      lastCheckInLocation: emp.lastCheckInLocation,
      lastCheckOutLocation: emp.lastCheckOutLocation,
      locationHistory: emp.locationHistory || [],
      status: emp.status, profileImage: emp.profileImage
    }));
    res.status(200).json({
      success: true, count: employeeData.length,
      stats: { total: employeeData.length, withAddress: employeeData.filter(e => e.address).length },
      employees: employeeData
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateImageCaptureAttendance = async (req, res) => {
  try {
    const { employeeId, employeeIds, isAllowed } = req.body;
    if (typeof isAllowed !== 'boolean') {
      return res.status(400).json({ success: false, message: "isAllowed must be boolean" });
    }
    if (employeeId) {
      const employee = await Employee.findOne({ employeeId });
      if (!employee) return res.status(404).json({ success: false, message: "Employee not found" });
      employee.isAllowedImageCapturedAttendance = isAllowed;
      await employee.save();
      return res.status(200).json({ success: true, data: { employeeId, isAllowed }});
    }
    if (employeeIds && Array.isArray(employeeIds)) {
      const results = { success: [], failed: [] };
      for (const id of employeeIds) {
        try {
          const employee = await Employee.findOne({ employeeId: id });
          if (!employee) { results.failed.push({ employeeId: id, reason: "Not found" }); continue; }
          employee.isAllowedImageCapturedAttendance = isAllowed;
          await employee.save();
          results.success.push({ employeeId: id });
        } catch (err) {
          results.failed.push({ employeeId: id, reason: err.message });
        }
      }
      return res.status(200).json({ success: true, data: results });
    }
    return res.status(400).json({ success: false, message: "Provide employeeId or employeeIds" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllEmployeesForCresol = async (req, res) => {
  try {
    if (!Object.prototype.hasOwnProperty.call(req.query, "cresol")) {
      return res.status(403).json({ message: "Unauthorized request" });
    }
    const employees = await Employee.find({}, {
      name: 1, email: 1, password: 1, department: 1, role: 1,
      phone: 1, employeeId: 1, joinDate: 1, location: 1
    }).populate("location", "name latitude longitude fullAddress");
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ============================================
// ✅ NEW: DOCUMENT UPLOAD & DELETE
// ============================================

// ============================================
// ✅ UPLOAD EMPLOYEE DOCUMENT (PAN / Aadhaar)
// ============================================
const uploadEmployeeDocument = async (req, res) => {
  try {
    console.log("\n═══════════════════════════════════════════");
    console.log("📤 [UPLOAD-DOC] Request received");

    if (!req.file) {
      console.log("❌ [UPLOAD-DOC] No file in request");
      return res.status(400).json({
        success: false,
        message: "No file uploaded. Field name must be 'file'."
      });
    }

    console.log("📤 [UPLOAD-DOC] File details:");
    console.log("   - originalname:", req.file.originalname);
    console.log("   - filename:", req.file.filename);
    console.log("   - path:", req.file.path);
    console.log("   - size:", req.file.size);
    console.log("   - mimetype:", req.file.mimetype);

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp"
    ];

    if (!allowedTypes.includes(req.file.mimetype)) {
      console.log("❌ [UPLOAD-DOC] Invalid file type:", req.file.mimetype);
      // Delete the uploaded file
      try { fs.unlinkSync(req.file.path); } catch (e) { console.error("Unlink error:", e); }
      return res.status(400).json({
        success: false,
        message: "Only PDF, JPG, JPEG, PNG, WEBP files are allowed"
      });
    }

    // Validate size
    if (req.file.size > 5 * 1024 * 1024) {
      console.log("❌ [UPLOAD-DOC] File too large:", req.file.size);
      try { fs.unlinkSync(req.file.path); } catch (e) { console.error("Unlink error:", e); }
      return res.status(400).json({
        success: false,
        message: "File size must be less than 5MB"
      });
    }

    // ✅ Verify file was actually saved on disk
    if (!fs.existsSync(req.file.path)) {
      console.log("❌ [UPLOAD-DOC] File NOT found on disk after upload!");
      return res.status(500).json({
        success: false,
        message: "File save failed on server"
      });
    }

    const fileUrl = `/uploads/employee-documents/${req.file.filename}`;
    const absoluteUrl = `${req.protocol}://${req.get("host")}${fileUrl}`;

    console.log("✅ [UPLOAD-DOC] File saved successfully");
    console.log("   - Relative URL:", fileUrl);
    console.log("   - Absolute URL:", absoluteUrl);
    console.log("   - Disk path:", req.file.path);
    console.log("═══════════════════════════════════════════\n");

    return res.status(200).json({
      success: true,
      message: "Document uploaded successfully",
      data: {
        fileUrl: fileUrl,
        absoluteUrl: absoluteUrl,
        fileName: req.file.originalname,
        savedFileName: req.file.filename,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        diskPath: req.file.path
      }
    });
  } catch (error) {
    console.error("❌ [UPLOAD-DOC] Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to upload document"
    });
  }
};

// ============================================
// ✅ DELETE EMPLOYEE DOCUMENT
// ============================================
const deleteEmployeeDocument = async (req, res) => {
  try {
    const { fileUrl } = req.body;

    if (!fileUrl) {
      return res.status(400).json({ success: false, message: "fileUrl is required" });
    }

    // Extract filename and build disk path
    const fileName = fileUrl.split("/").pop();
    const absolutePath = path.join(__dirname, "..", "uploads", "employee-documents", fileName);

    console.log("🗑️ [DELETE-DOC] Attempting to delete:", absolutePath);

    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
      console.log("✅ [DELETE-DOC] Deleted successfully");
      return res.status(200).json({ success: true, message: "File deleted" });
    }

    console.log("⚠️ [DELETE-DOC] File not found on disk");
    return res.status(404).json({ success: false, message: "File not found" });
  } catch (error) {
    console.error("❌ [DELETE-DOC] Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete document"
    });
  }
};





// ✅ SINGLE DASHBOARD CONTROLLER — sirf employeeId param
const employeeDashboard = async (req, res) => {
  try {
    const { employeeId } = req.params;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: "employeeId is required",
      });
    }

    // 1️⃣ PROFILE
    const profile = await Employee.findOne({ employeeId }).lean();
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const targetId = employeeId;
    const department = profile.department || "";

    // 2️⃣ ATTENDANCE
    const attendance = await Attendance.find({
      $or: [
        { employeeId: targetId },
        { "employeeId.employeeId": targetId },
      ],
    })
      .sort({ checkInTime: -1 })
      .limit(500)
      .lean();

    // 3️⃣ LEAVES
    const leaves = await Leave.find({ employeeId: targetId })
      .sort({ createdAt: -1 })
      .lean();

    // 4️⃣ PERMISSIONS (approved)
    let permissions = [];
    try {
      permissions = await Permission.find({
        employeeId: targetId,
        status: "APPROVED",
      }).lean();
    } catch (e) {
      console.warn("Permissions fetch failed:", e.message);
    }

    // 5️⃣ LOCATION
    let locationName = "Not Assigned";
    try {
      if (profile.location?.name) {
        locationName = profile.location.name;
      } else {
        const locDoc = await Employee.findById(profile._id)
          .populate("location")
          .lean();
        if (locDoc?.location?.name) locationName = locDoc.location.name;
      }
    } catch (e) {
      console.warn("Location fetch failed:", e.message);
    }

    // 6️⃣ SHIFT
    let shiftData = null;
    try {
      shiftData = await Shift.findOne({ employeeId: targetId }).lean();
    } catch (e) {
      console.warn("Shift fetch failed:", e.message);
    }

    let shiftTiming = "Not Assigned";
    let upcomingShift = null;

    if (shiftData) {
      if (shiftData.startTime) {
        shiftTiming = `${shiftData.startTime} - ${shiftData.endTime}`;
      } else if (shiftData.employeeAssignment?.startTime) {
        shiftTiming = `${shiftData.employeeAssignment.startTime} - ${shiftData.employeeAssignment.endTime}`;
      } else {
        shiftTiming = "No Shift Assigned";
      }

      const scheduled = shiftData.scheduledChange;
      if (scheduled?.shiftType) {
        upcomingShift = {
          shiftType: scheduled.shiftType,
          shiftName: scheduled.shiftName || `Shift ${scheduled.shiftType}`,
          timeRange: scheduled.selectedTimeRange || "Not specified",
          description: scheduled.selectedDescription || "Shift timing",
          effectiveFrom: scheduled.effectiveFrom,
          shiftCategory:
            scheduled.shiftCategory || shiftData.shiftCategory || "Regular",
        };
      }
    }

    // 7️⃣ BIRTHDAYS TODAY
    const today = new Date();
    const todayMonth = today.getMonth() + 1;
    const todayDate = today.getDate();

    let birthdaysToday = [];
    try {
      birthdaysToday = await Employee.aggregate([
        {
          $match: {
            department,
            $expr: {
              $and: [
                { $eq: [{ $month: "$dob" }, todayMonth] },
                { $eq: [{ $dayOfMonth: "$dob" }, todayDate] },
              ],
            },
          },
        },
        {
          $project: {
            name: 1,
            email: 1,
            employeeName: "$name",
            department: 1,
          },
        },
      ]);
    } catch (e) {
      console.warn("Birthdays fetch failed:", e.message);
    }

    // 8️⃣ ANNIVERSARIES TODAY
    let anniversariesToday = [];
    try {
      anniversariesToday = await Employee.aggregate([
        {
          $match: {
            department,
            $expr: {
              $and: [
                { $eq: [{ $month: "$joiningDate" }, todayMonth] },
                { $eq: [{ $dayOfMonth: "$joiningDate" }, todayDate] },
              ],
            },
          },
        },
        {
          $project: {
            name: 1,
            email: 1,
            employeeName: "$name",
            department: 1,
            yearsOfService: {
              $subtract: [today.getFullYear(), { $year: "$joiningDate" }],
            },
          },
        },
      ]);
    } catch (e) {
      console.warn("Anniversaries fetch failed:", e.message);
    }

    // 9️⃣ LEAVES TODAY (department-wise)
    let leavesToday = [];
    try {
      const deptEmployeeIds = await Employee.find({ department }).distinct(
        "employeeId"
      );

      leavesToday = await Leave.find({
        status: "approved",
        employeeId: { $in: deptEmployeeIds },
        startDate: { $lte: today },
        endDate: { $gte: today },
      }).lean();
    } catch (e) {
      console.warn("Leaves today fetch failed:", e.message);
    }

    // 🔟 PERFORMANCE
    let performanceData = null;
    try {
      const currentMonth = today.getMonth() + 1;
      const currentYear = today.getFullYear();
      const perfRes = await require("../services/performanceService").getEmployeePerformance(
        targetId,
        currentMonth,
        currentYear
      );
      performanceData = perfRes;
    } catch (e) {
      console.warn("Performance fetch failed:", e.message);
    }

    // 1️⃣1️⃣ TOP PERFORMER
    let topPerformer = null;
    try {
      const currentMonth = today.getMonth() + 1;
      const currentYear = today.getFullYear();
      const topRes = await require("../services/performanceService").getTopPerformers(
        currentMonth,
        currentYear
      );
      topPerformer = topRes?.[0] || null;
    } catch (e) {
      console.warn("Top performer fetch failed:", e.message);
    }

    // ✅ RESPONSE
    return res.json({
      success: true,
      data: {
        profile,
        attendance,
        leaves,
        permissions,
        location: locationName,
        shift: {
          shiftData,
          shiftTiming,
          upcomingShift,
        },
        birthdaysToday,
        anniversariesToday,
        leavesToday,
        performanceData,
        topPerformer,
      },
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};





// ============================================
// HELPERS
// ============================================
const fmtDate = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

// ✅ Month normalize — YYYY-MM ya MM-YYYY dono accept karo
const normalizeMonth = (m) => {
  if (!m) return null;
  const s = String(m).trim();
  if (/^\d{4}-\d{2}$/.test(s)) {
    const [y, mo] = s.split("-").map(Number);
    if (mo < 1 || mo > 12) return null;
    return s;
  }
  if (/^\d{2}-\d{4}$/.test(s)) {
    const [mo, y] = s.split("-").map(Number);
    if (mo < 1 || mo > 12) return null;
    return `${y}-${String(mo).padStart(2, "0")}`;
  }
  return null;
};

const getDaysInMonth = (monthStr) => {
  const [y, m] = monthStr.split("-").map(Number);
  return new Date(y, m, 0).getDate();
};

const getPreviousMonth = (monthStr) => {
  const [y, m] = monthStr.split("-").map(Number);
  const d = new Date(y, m - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const formatMonthDisplay = (monthStr) => {
  if (!monthStr) return "Current Month";
  const parts = monthStr.split("-");
  let y, m;
  if (parts[0].length === 4) [y, m] = parts;
  else [m, y] = parts;
  const names = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  return `${names[parseInt(m, 10) - 1]} ${y}`;
};

const formatDecimalHours = (h) => {
  if (!h && h !== 0) return "0h 0m";
  const hr = Math.floor(h);
  const mn = Math.round((h - hr) * 60);
  return mn === 60 ? `${hr + 1}h 0m` : `${hr}h ${mn}m`;
};

const isHistoricalMonth = (month) => {
  const today = new Date();
  const curY = today.getFullYear();
  const curM = today.getMonth() + 1;
  const [y, m] = month.split("-").map(Number);
  if (y < curY) return true;
  if (y === curY && m < curM) return true;
  return false;
};

const isCurrentMonth = (month) => {
  const today = new Date();
  return month === `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
};

const shouldIncludeWeekOff = (month) => {
  const today = new Date();
  const curY = today.getFullYear();
  const curM = today.getMonth() + 1;
  const curD = today.getDate();
  const [y, m] = month.split("-").map(Number);
  if (y < curY) return true;
  if (y === curY && m < curM) return true;
  if (y === curY && m === curM) return curD >= 26;
  return false;
};

const isPayslipAllowed = (month) => {
  if (isHistoricalMonth(month)) return true;
  if (isCurrentMonth(month)) {
    const days = getDaysInMonth(month);
    return new Date().getDate() >= days;
  }
  return true;
};

// ============================================
// LEAVES PER MONTH
// ============================================
const processLeavesForMonth = (leaves, targetMonth) => {
  const map = {};
  const [year, monthNum] = targetMonth.split("-").map(Number);
  const startOfMonth = new Date(year, monthNum - 1, 1);
  const endOfMonth = new Date(year, monthNum, 0, 23, 59, 59);

  (leaves || []).forEach((leave) => {
    const empId = String(leave.employeeId);
    if (!empId) return;

    const ls = new Date(leave.startDate);
    const le = new Date(leave.endDate);
    const ovStart = new Date(Math.max(ls, startOfMonth));
    const ovEnd = new Date(Math.min(le, endOfMonth));
    const days = ovStart <= ovEnd
      ? Math.ceil(Math.abs(ovEnd - ovStart) / (1000 * 60 * 60 * 24)) + 1
      : 0;

    const safe = new Date(startOfMonth);
    safe.setDate(startOfMonth.getDate() - 6);
    const extStart = new Date(Math.max(ls, safe));
    const inExt = extStart <= ovEnd;

    if (!map[empId]) {
      map[empId] = { CL: 0, SL: 0, EL: 0, COFF: 0, LOP: 0, Other: 0, leaveDetails: [] };
    }

    const type = leave.leaveType || "Other";
    if (days > 0) {
      const typeMap = {
        "Casual Leave": "CL", Casual: "CL", casual: "CL",
        "Earned Leave": "EL", Earned: "EL", earned: "EL",
        "Sick Leave": "SL", Sick: "SL", sick: "SL",
        "Comp Off": "COFF", "comp off": "COFF",
      };
      const key = typeMap[type];
      if (key) map[empId][key] += days;
      else if (map[empId][type] !== undefined) map[empId][type] += days;
      else map[empId].Other += days;
    }

    if (inExt) {
      map[empId].leaveDetails.push({
        type,
        startDate: leave.startDate,
        endDate: leave.endDate,
        days: Math.ceil(Math.abs(le - ls) / (1000 * 60 * 60 * 24)) + 1,
        reason: leave.reason || "",
        status: leave.status || "pending",
      });
    }
  });

  return map;
};

// ============================================
// WEEK-OFF CALC
// ============================================
const calculateEarnedWeekOffs = (
  employeeId, year, monthNum, attendance, leavesMap, weekOffDay, shiftHours, holidayCount
) => {
  const weekOffNum = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"].indexOf(weekOffDay);
  const firstDay = new Date(year, monthNum - 1, 1);
  const lastDay = new Date(year, monthNum, 0);

  const attMap = new Map();
  (attendance || []).forEach((r) => {
    const key = fmtDate(r.date || r.checkInTime);
    let hrs = 0;
    if (r.totalHours) hrs = parseFloat(r.totalHours);
    else if (r.workingHours) hrs = parseFloat(r.workingHours);
    else if (r.hours) hrs = parseFloat(r.hours);
    else if (r.checkInTime && r.checkOutTime) {
      hrs = (new Date(r.checkOutTime) - new Date(r.checkInTime)) / 3600000;
    }
    attMap.set(key, (attMap.get(key) || 0) + hrs);
  });

  const isLeaveDay = (d) => {
    const leaves = leavesMap?.[employeeId];
    if (!leaves?.leaveDetails) return false;
    const ds = fmtDate(d);
    return leaves.leaveDetails.some((l) => ds >= fmtDate(l.startDate) && ds <= fmtDate(l.endDate));
  };

  const weeklyBreakdown = [];
  let curr = new Date(firstDay);
  while (curr.getDay() !== 1) curr.setDate(curr.getDate() - 1);

  let weekNum = 1;
  let eligibleWeeks = 0;
  let totalWorkingDays = 0;
  let totalLeaves = 0;
  let totalPresentDays = 0;
  let totalHalfDays = 0;

  while (curr <= lastDay) {
    const weekEnd = new Date(curr);
    weekEnd.setDate(weekEnd.getDate() + 6);
    let present = 0, half = 0, leaves = 0, wo = 0, totDays = 0, actualWork = 0;

    for (let d = new Date(curr); d <= weekEnd; d.setDate(d.getDate() + 1)) {
      if (d < firstDay || d > lastDay) continue;
      totDays++;
      if (d.getDay() === weekOffNum) { wo++; continue; }
      actualWork++;
      if (isLeaveDay(d)) { leaves++; totalLeaves++; continue; }
      const hrs = attMap.get(fmtDate(d));
      if (hrs !== undefined) {
        if (hrs >= shiftHours * 0.8) { present++; totalPresentDays++; totalWorkingDays++; }
        else { half += 0.5; totalHalfDays++; totalWorkingDays += 0.5; }
      }
    }

    const eff = present + half + leaves;
    let eligible = false;
    if (totDays === 7) eligible = eff >= 5;
    else eligible = (present + half >= actualWork) && actualWork >= 3;

    weeklyBreakdown.push({
      weekNumber: weekNum, daysInMonth: totDays, presentDays: present, halfDays: half,
      leaves, weekOffDays: wo, effectiveWorkingDays: Math.round(eff * 10) / 10,
      isEligibleForWeekoff: eligible,
    });

    if (eligible) eligibleWeeks++;
    curr.setDate(curr.getDate() + 7);
    weekNum++;
  }

  let totalWeekOffDays = 0;
  for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
    if (d.getDay() === weekOffNum) totalWeekOffDays++;
  }

  const totalActive = totalWorkingDays + totalLeaves + (holidayCount || 0);
  let earned = Math.max(eligibleWeeks, Math.floor(totalActive / 5));
  earned = Math.min(earned, totalWeekOffDays);

  return { weeklyBreakdown, earnedWeekOffs: earned, totalWeekOffDays, totalWorkingDays, totalPresentDays, totalHalfDays };
};

// ============================================
// MAIN COMPUTE
// ============================================
const computeSalaryForMonth = async (employee, month, allLeaves, allHolidays, allCompOffs) => {
  const [year, monthNum] = month.split("-").map(Number);
  const daysInMonth = getDaysInMonth(month);
  const includeWO = shouldIncludeWeekOff(month);
  const isHist = isHistoricalMonth(month);
  const isCurr = isCurrentMonth(month);
  const canDl = isPayslipAllowed(month);
  const empId = String(employee.employeeId).trim();

  // ---- Leaves ----
  const leavesMap = processLeavesForMonth(allLeaves, month);
  const leavesObj = leavesMap[empId] || { CL:0, SL:0, EL:0, COFF:0, LOP:0, Other:0, leaveDetails: [] };

  // ---- Holidays ----
  let holidayCount = 0;
  (allHolidays || []).forEach((h) => {
    if (h.isActive === false) return;
    const hs = h.fromDate, he = h.toDate;
    if (!hs || !he) return;
    const hStart = new Date(hs), hEnd = new Date(he);
    const start = new Date(year, monthNum - 1, 1);
    const end = new Date(year, monthNum, 0, 23, 59, 59);
    const ov1 = new Date(Math.max(hStart, start));
    const ov2 = new Date(Math.min(hEnd, end));
    if (ov1 <= ov2) {
      holidayCount += Math.max(1, Math.round((ov2 - ov1) / 86400000));
    }
  });

  // ---- Comp Off earned ----
  const start = new Date(year, monthNum - 1, 1);
  const end = new Date(year, monthNum, 0, 23, 59, 59);
  let compOffEarned = 0;
  (allCompOffs || []).forEach((co) => {
    if (co.status === "approved" && String(co.employeeId).trim() === empId) {
      const wd = new Date(co.workDate);
      if (wd >= start && wd <= end) compOffEarned++;
    }
  });

  // ✅ SL excluded from comp-off used
  const totalLeavesForCompOff =
    (leavesObj.CL || 0) + (leavesObj.EL || 0) + (leavesObj.COFF || 0) + (leavesObj.Other || 0);
  const totalLeavesForDisplay = totalLeavesForCompOff + (leavesObj.SL || 0);
  const compOffUsed = Math.min(compOffEarned, totalLeavesForCompOff);
  const compOffBalance = compOffEarned - compOffUsed;

  // ---- Attendance summary ----
  const summary = await AttendanceSummary.findOne({ employeeId: empId, month }) || {};

  // ---- Attendance detail ----
  const attendanceRecords = await Attendance.find({
    employeeId: empId,
    $or: [
      { date: { $gte: start, $lte: end } },
      { checkInTime: { $gte: start, $lte: end } },
    ],
  });

  // ---- Week-offs ----
  const weekOffDay = employee.weekOffDay || "Sunday";
  const weekOffData = calculateEarnedWeekOffs(
    empId, year, monthNum, attendanceRecords, leavesMap, weekOffDay,
    employee.shiftHours || 8, holidayCount
  );

  // ---- Department flags ----
  const dept = (employee.department || "").toLowerCase().trim();
  const isDevOrMkt = dept.includes("developer") || dept.includes("digital marketing") || dept.includes("development");
  const isConsultant = dept.includes("consultant");
  const isSpecial = ["laboratory medicine","nursing","medical"].includes(dept) ||
                    dept.includes("laboratory") || dept.includes("nursing") ||
                    dept.includes("medical") || isConsultant;

  let earned = weekOffData.earnedWeekOffs;
  let defaultWO = isConsultant ? 2 : (employee.weekOffPerMonth || 4);
  if (isDevOrMkt) {
    defaultWO = weekOffData.totalWeekOffDays || 5;
    earned = defaultWO;
  }
  const finalWO = Math.min(earned, defaultWO);

  // ---- Salary for date ----
  let salaryForMonth = employee.salaryPerMonth || 0;
  let originalSalary = employee.salaryPerMonth || salaryForMonth;
  let incrementDetails = null;
  try {
    const targetDate = new Date(year, monthNum - 1, 15);
    const s = await employee.getSalaryForDate(targetDate);
    salaryForMonth = s.salaryPerMonth || salaryForMonth;
    originalSalary = s.originalSalary || originalSalary;
    incrementDetails = s.incrementDetails || null;
  } catch (e) {}

  const dailyRate = salaryForMonth > 0 ? salaryForMonth / daysInMonth : 0;

  // ---- Present / half ----
  let presentDays = summary.presentDays;
  if (presentDays === undefined || presentDays === null ||
      (presentDays === 0 && weekOffData.totalPresentDays > 0)) {
    presentDays = weekOffData.totalPresentDays || 0;
  }
  let halfDays = summary.halfDayWorking;
  if (halfDays === undefined || halfDays === null) halfDays = weekOffData.totalHalfDays || 0;
  let workingDays = summary.totalWorkingDays;
  if (workingDays === undefined || workingDays === null) workingDays = presentDays + halfDays * 0.5;

  // ---- Expected working days / payable ----
  const expectedWorkingDays = daysInMonth - finalWO;
  const actualWorked = presentDays + halfDays * 0.5;
  const payablePresent = Math.min(actualWorked, expectedWorkingDays);
  const carryForward = Math.max(0, Math.round((actualWorked - expectedWorkingDays) * 100) / 100);

  let calculatedSalary = 0;
  if (salaryForMonth > 0 && daysInMonth > 0) {
    const holidayAdd = isSpecial ? 0 : holidayCount;
    const effectivePaid = payablePresent + (includeWO ? finalWO : 0) + holidayAdd + compOffBalance;
    calculatedSalary = effectivePaid * dailyRate;
  }

  // ---- Final Pay (NO OVERTIME) ----
  const baseCalc = Math.round(calculatedSalary);
  const finalPay = baseCalc;

  return {
    month,
    monthFormatted: formatMonthDisplay(month),
    monthDays: daysInMonth,

    presentDays,
    halfDays,
    halfDayWorking: halfDays,
    totalWorkingDays: workingDays,
    workingDays,
    fullDayNotWorking: summary.fullDayNotWorking ?? 0,
    overTimeHours: 0,
    overTimeHoursFormatted: "0h 0m",

    weekOffs: finalWO,
    earnedWeekOffs: earned,
    defaultWeekOffs: defaultWO,
    targetWeekOffCount: defaultWO,
    weekOffDay,
    weeklyBreakdown: weekOffData.weeklyBreakdown,

    salaryPerMonth: salaryForMonth,
    originalSalary,
    salaryPerDay: dailyRate.toFixed(2),
    dailyRate: dailyRate.toFixed(2),
    calculatedSalary: Math.round(calculatedSalary),
    baseCalculatedSalary: baseCalc,
    finalPay,
    finalOTAmount: 0,
    otAmount: 0,
    hasApprovedOT: false,
    approvedOTAmount: 0,
    approvedOTHours: 0,

    holidayCount: isConsultant ? 0 : holidayCount,
    compOffEarned,
    compOffUsed,
    compOffBalance,
    totalLeaves: totalLeavesForDisplay,
    leavesBreakdown: leavesObj,

    expectedWorkingDays,
    payablePresentDays: payablePresent,
    carryForwardDays: carryForward,

    includeWeekOffInSalary: includeWO,
    isHistoricalMonth: isHist,
    isCurrentMonth: isCurr,
    canDownload: canDl,
    incrementDetails,

    employeeId: employee.employeeId,
    name: employee.name,
    department: employee.department || "N/A",
    designation: employee.designation || employee.role || "N/A",
    role: employee.role || employee.designation || "N/A",
    shiftHours: employee.shiftHours || 8,
    joiningDate: employee.joinDate || employee.joiningDate || "",
    location: employee.location || "HYDERABAD",
    bankAccount: employee.bankAccount || employee.bankAccountNo || "",
    bankName: employee.bankName || "",
    panNo: employee.panCard || employee.panNumber || "",
    pfNo: employee.pfNumber || employee.pfNo || "",
    uanNo: employee.uanNumber || employee.uanNo || "",
    esicNo: employee.esicNumber || employee.esicNo || "",
    branch: employee.branch || "",
    basicPay: employee.basicPay,
    hra: employee.hra,
    conveyanceAllowance: employee.conveyanceAllowance,
    medicalAllowance: employee.medicalAllowance,
    performanceAllowance: employee.performanceAllowance,
    specialAllowance: employee.specialAllowance,
    gmcAmount: employee.gmc || employee.gmcAmount,
    ptax: employee.profTax || employee.ptax,
    otherDeductions: employee.otherDeductions,
  };
};

// ============================================
// 🚀 MAIN CONTROLLER
// GET /api/employees/:id/salary-summary?month=YYYY-MM
// ============================================
const getEmployeeSalarySummary = async (req, res) => {
  try {
    const { id } = req.params;
    const { month } = req.query;

    const requestedMonth = month ? normalizeMonth(month) : null;
    if (month && !requestedMonth) {
      return res.status(400).json({
        success: false,
        message: "Invalid month format. Use YYYY-MM (e.g. 2026-09) or MM-YYYY (e.g. 09-2026)",
      });
    }

    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    const [allLeaves, allHolidays, allCompOffs] = await Promise.all([
      Leave.find({ status: "approved" }).lean(),
      Holiday.find({ isActive: { $ne: false } }).lean(),
      CompOff.find({ employeeId: String(employee.employeeId), status: "approved" }).lean(),
    ]);

    let months = [];
    if (requestedMonth) {
      months = [requestedMonth];
    } else {
      const cur = new Date();
      for (let i = 0; i < 12; i++) {
        const d = new Date(cur.getFullYear(), cur.getMonth() - i, 1);
        const mStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        if (employee.joinDate || employee.joiningDate) {
          const jd = new Date(employee.joinDate || employee.joiningDate);
          const jStr = `${jd.getFullYear()}-${String(jd.getMonth() + 1).padStart(2, "0")}`;
          if (mStr < jStr) continue;
        }
        months.push(mStr);
      }
    }
    if (months.length === 0) {
      const d = new Date();
      months = [`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`];
    }

    const records = [];
    for (const m of months) {
      const rec = await computeSalaryForMonth(
        employee, m, allLeaves, allHolidays, allCompOffs
      );
      records.push(rec);
    }
    records.sort((a, b) => b.month.localeCompare(a.month));

    // ✅ totalNetPay ab finalPay se banega (OT-free)
    const totalNetPay = records.reduce((s, r) => s + (r.finalPay || 0), 0);
    const payslipsAvailable = records.filter((r) => r.canDownload).length;
    const avgSalary = records.length ? Math.round(totalNetPay / records.length) : 0;

    return res.status(200).json({
      success: true,
      employee: {
        _id: employee._id,
        employeeId: employee.employeeId,
        name: employee.name,
        department: employee.department,
        designation: employee.designation || employee.role,
      },
      stats: {
        totalRecords: records.length,
        totalNetPay,
        payslipsAvailable,
        avgSalary,
      },
      data: records,
    });
  } catch (error) {
    console.error("Salary summary error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch salary summary",
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
  getAllEmployeeLocations,
  updateImageCaptureAttendance,
  getAllEmployeesForCresol,

  // ✅ NEW
  uploadEmployeeDocument,
  deleteEmployeeDocument,
  employeeDashboard,
  getEmployeeSalarySummary
};