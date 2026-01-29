// const Employee = require("../models/Employee");
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


const mongoose = require("mongoose");
const Employee = require("../models/Employee");
const Location = require("../models/Location");
const { logActivity } = require("./userActivity.controller");

// ✅ Get employee by phone number
exports.getEmployeeByPhone = async (req, res) => {
  try {
    const { phone } = req.query;

    if (!phone) {
      return res.status(400).json({ 
        success: false,
        message: "Phone number is required" 
      });
    }

    const employee = await Employee.findOne({ phone });

    if (!employee) {
      return res.status(404).json({ 
        success: false,
        message: "Employee not found with this phone number" 
      });
    }

    res.status(200).json({
      success: true,
      message: "Employee found successfully",
      data: employee
    });
  } catch (error) {
    console.error("Get employee by phone error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error",
      error: error.message 
    });
  }
};

// ➕ Add a new employee (Updated with new fields)
exports.addEmployee = async (req, res) => {
  try {
    const {
      firstName, lastName, email, password, department, role,
      dob, addressLine1, addressLine2, city, state, pinCode, country,
      weekOffType, weekOffCount,
      shiftType, shiftHours,
      joinDate, phone, employeeId, locationId,
      parentsName, alternateNumber, salaryPerMonth, weekOffPerMonth,
      permissions // ✅ Added permissions
    } = req.body;

    // Combine first name and last name
    const name = `${firstName || ''} ${lastName || ''}`.trim();

    // Check if employee already exists
    const existingEmployee = await Employee.findOne({
      $or: [{ email }, { employeeId }, { phone }]
    });

    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: "Employee with this email, ID or phone already exists"
      });
    }

    const newEmployee = new Employee({
      name,
      firstName,
      lastName,
      email,
      password,
      department,
      role,
      dob: dob ? new Date(dob) : null,
      addressLine1,
      addressLine2,
      city,
      state,
      pinCode,
      country: country || "India",
      weekOffType,
      weekOffCount: weekOffCount || 0,
      shiftType: shiftType || "A",
      shiftHours: shiftHours || 8,
      joinDate: joinDate ? new Date(joinDate) : null,
      phone,
      employeeId,
      location: locationId,
      parentsName,
      alternateNumber,
      salaryPerMonth: Number(salaryPerMonth) || 0,
      weekOffPerMonth: Number(weekOffPerMonth) || 0,
      permissions: permissions || [] // ✅ Added permissions
    });

    await newEmployee.save();

    res.status(201).json({
      success: true,
      message: "Employee added successfully",
      employee: newEmployee
    });
  } catch (error) {
    console.error("Add employee error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error",
      error: error.message 
    });
  }
};

// 📋 Get all employees
exports.getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// 🔍 Get single employee by email or employeeId or phone
exports.getEmployeeByEmail = async (req, res) => {
  try {
    const { email, employeeId, phone } = req.query;

    if (!email && !employeeId && !phone) {
      return res.status(400).json({ 
        success: false,
        message: "Email, Employee ID or Phone is required" 
      });
    }

    let query = {};
    if (email) query.email = email;
    else if (employeeId) query.employeeId = employeeId;
    else if (phone) query.phone = phone;

    const employee = await Employee.findOne(query);

    if (!employee) {
      return res.status(404).json({ 
        success: false,
        message: "Employee not found" 
      });
    }

    res.json({
      success: true,
      data: employee
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Server Error", 
      error: error.message 
    });
  }
};

// 🔐 Employee login (email or employeeId)
exports.loginEmployee = async (req, res) => {
  try {
    const { email, employeeId, password } = req.body;

    if (!email && !employeeId) {
      return res.status(400).json({ 
        success: false,
        message: "Email or Employee ID is required" 
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

    // ✅ Log login activity
    await logActivity({
      userId: employee.employeeId,
      userName: employee.name,
      userEmail: employee.email,
      userRole: "employee",
      action: "login",
      actionDetails: `Employee logged in successfully`,
      ipAddress: req.ip || req.connection.remoteAddress,
      metadata: {
        department: employee.department,
        role: employee.role,
      },
    });

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
        employeeId: employee.employeeId,
        joinDate: employee.joinDate,
        permissions: employee.permissions || [] // ✅ Return permissions
      },
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Server Error", 
      error: error.message 
    });
  }
};

// ✅ Assign Location to Employee
exports.assignLocation = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { locationId } = req.body;

    if (!employeeId || !locationId) {
      return res.status(400).json({ 
        success: false,
        message: "Employee ID and Location ID are required" 
      });
    }

    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      return res.status(404).json({ 
        success: false,
        message: "Employee not found" 
      });
    }

    const location = await Location.findById(locationId);
    if (!location) {
      return res.status(404).json({ 
        success: false,
        message: "Location not found" 
      });
    }

    // 🔹 Assign location to employee
    employee.location = location._id;
    await employee.save();

    // (Optional) also add employee reference in location document
    await Location.findByIdAndUpdate(locationId, {
      $addToSet: { assignedEmployees: employee._id },
    });

    res.status(200).json({
      success: true,
      message: `Location '${location.name}' assigned to employee '${employee.name}'`,
      employee,
    });
  } catch (err) {
    console.error("Assign location error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to assign location",
      error: err.message,
    });
  }
};

// Get assigned location by employeeId
exports.getAssignedLocationByEmployeeId = async (req, res) => {
  try {
    const { employeeId } = req.params;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: "Employee ID is required"
      });
    }

    // Find employee by employeeId and populate location details
    const employee = await Employee.findOne({ employeeId })
      .populate('location', 'name latitude longitude fullAddress isActive')
      .select('name email employeeId location');

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found"
      });
    }

    // If employee has no location assigned
    if (!employee.location) {
      return res.status(200).json({
        success: true,
        message: "No location assigned to this employee",
        data: {
          employee: {
            _id: employee._id,
            name: employee.name,
            email: employee.email,
            employeeId: employee.employeeId
          },
          location: null
        }
      });
    }

    // Return employee with assigned location
    res.status(200).json({
      success: true,
      message: "Assigned location fetched successfully",
      data: {
        employee: {
          _id: employee._id,
          name: employee.name,
          email: employee.email,
          employeeId: employee.employeeId
        },
        location: employee.location
      }
    });

  } catch (error) {
    console.error("Get assigned location error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch assigned location",
      error: error.message
    });
  }
};

// ✅ Update Employee (with new fields)
// ✅ Update Employee - FIXED VERSION
exports.updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log("🔄 Update request for employee ID:", id);
    console.log("📦 Update data received:", req.body);

    // Find employee first
    const existingEmployee = await Employee.findById(id);
    if (!existingEmployee) {
      return res.status(404).json({ 
        success: false,
        message: "Employee not found" 
      });
    }

    // Prepare update data - only update what's provided
    const updateData = { ...req.body };
    
    // Remove empty or undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined || updateData[key] === '') {
        delete updateData[key];
      }
    });

    // Handle name if firstName/lastName provided
    if (updateData.firstName || updateData.lastName) {
      const firstName = updateData.firstName || existingEmployee.firstName;
      const lastName = updateData.lastName || existingEmployee.lastName;
      updateData.name = `${firstName || ''} ${lastName || ''}`.trim();
    }

    console.log("✅ Final update data:", updateData);

    // Update with runValidators: false to avoid validation errors
    const updatedEmployee = await Employee.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: false } // ✅ IMPORTANT: runValidators: false
    );

    console.log("✅ Employee updated successfully:", updatedEmployee._id);

    res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      employee: updatedEmployee
    });
  } catch (error) {
    console.error("❌ Update employee error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error",
      error: error.message 
    });
  }
};

// 🗑️ Delete Employee
exports.deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findByIdAndDelete(id);

    if (!employee) {
      return res.status(404).json({ 
        success: false,
        message: "Employee not found" 
      });
    }

    res.json({ 
      success: true,
      message: "Employee deleted successfully" 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Server Error", 
      error: error.message 
    });
  }
};
// employee.controller.js mein update karein
exports.getEmployeeByPhone = async (req, res) => {
  try {
    const { phone } = req.query;

    if (!phone) {
      return res.status(400).json({ 
        success: false,
        message: "Phone number is required" 
      });
    }

    const employee = await Employee.findOne({ phone });

    if (!employee) {
      return res.status(404).json({ 
        success: false,
        message: "Employee not found with this phone number" 
      });
    }

    res.status(200).json({
      success: true,
      message: "Employee found successfully",
      data: employee
    });
  } catch (error) {
    console.error("Get employee by phone error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error",
      error: error.message 
    });
  }
};
// 📊 Get Employee Attendance Summary
exports.getEmployeeAttendanceSummary = async (req, res) => {
  try {
    const { employeeId } = req.query;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: "Employee ID is required",
      });
    }

    // Example response (adjust based on your Attendance model)
    res.status(200).json({
      success: true,
      message: "Attendance summary fetched successfully",
      data: {
        employeeId,
        presentDays: 0,
        absentDays: 0,
        totalDays: 0,
      },
    });
  } catch (error) {
    console.error("Attendance summary error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
