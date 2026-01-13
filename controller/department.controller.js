// // controller/department.controller.js
// const Department = require('../models/Department');

// // POST /api/department/add
// const addDepartment = async (req, res) => {
//   try {
//     const { name, description } = req.body;

//     if (!name || !description) {
//       return res.status(400).json({ error: 'Name and description are required' });
//     }

//     const newDept = new Department({ name, description });
//     const savedDept = await newDept.save();

//     res.status(201).json({
//       message: 'Department created successfully',
//       data: savedDept,
//     });
//   } catch (error) {
//     console.error('❌ Error in addDepartment:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

// // GET /api/department/get
// const getDepartments = async (req, res) => {
//   try {
//     const departments = await Department.find();
//     res.status(200).json({
//       message: 'Departments fetched successfully',
//       data: departments,
//     });
//   } catch (error) {
//     console.error('❌ Error in getDepartments:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };


// // PUT /api/department/update/:id
// const updateDepartment = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { name, description } = req.body;

//     const updatedDept = await Department.findByIdAndUpdate(
//       id,
//       { name, description },
//       { new: true, runValidators: true }
//     );

//     if (!updatedDept) {
//       return res.status(404).json({ error: "Department not found" });
//     }

//     res.status(200).json({
//       message: "Department updated successfully",
//       data: updatedDept,
//     });
//   } catch (error) {
//     console.error("❌ Error in updateDepartment:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

// // DELETE /api/department/delete/:id
// const deleteDepartment = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const deletedDept = await Department.findByIdAndDelete(id);

//     if (!deletedDept) {
//       return res.status(404).json({ error: "Department not found" });
//     }

//     res.status(200).json({
//       message: "Department deleted successfully",
//     });
//   } catch (error) {
//     console.error("❌ Error in deleteDepartment:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };


// // ✅ EXPORT BOTH
// module.exports = {
//   addDepartment,
//   getDepartments,
//   updateDepartment,
//   deleteDepartment,
// };

// controllers/department.controller.js
const Department = require('../models/Department');
const Employee = require('../models/Employee');

// ✅ 1. CREATE NEW DEPARTMENT
exports.createDepartment = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: "Department name and description are required"
      });
    }

    // Check if department already exists
    const existingDept = await Department.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    });

    if (existingDept) {
      return res.status(400).json({
        success: false,
        message: "Department with this name already exists"
      });
    }

    const newDepartment = new Department({ name, description });
    await newDepartment.save();

    res.status(201).json({
      success: true,
      message: "Department created successfully",
      data: newDepartment
    });

  } catch (error) {
    console.error("Create department error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// ✅ 2. GET ALL DEPARTMENTS WITH EMPLOYEE COUNT
exports.getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find().sort({ name: 1 });

    // Get employee count for each department
    const departmentsWithCount = await Promise.all(
      departments.map(async (dept) => {
        // Count employees by departmentId OR department name
        const employeeCount = await Employee.countDocuments({
          $or: [
            { departmentId: dept._id },
            { department: { $regex: new RegExp(`^${dept.name}$`, 'i') } }
          ]
        });

        return {
          _id: dept._id,
          name: dept.name,
          description: dept.description,
          employeeCount: employeeCount,
          createdAt: dept.createdAt,
          updatedAt: dept.updatedAt
        };
      })
    );

    res.status(200).json({
      success: true,
      message: "Departments fetched successfully",
      data: departmentsWithCount
    });

  } catch (error) {
    console.error("Get departments error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// ✅ 3. GET SINGLE DEPARTMENT WITH EMPLOYEES
exports.getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const department = await Department.findById(id);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found"
      });
    }

    // Get employees in this department
    const employees = await Employee.find({
      $or: [
        { departmentId: department._id },
        { department: { $regex: new RegExp(`^${department.name}$`, 'i') } }
      ]
    })
    .select('name email employeeId role phone joinDate')
    .sort({ name: 1 });

    // Auto-update employees without departmentId
    const employeesToUpdate = employees.filter(emp => !emp.departmentId);
    if (employeesToUpdate.length > 0) {
      await Employee.updateMany(
        { _id: { $in: employeesToUpdate.map(emp => emp._id) } },
        { departmentId: department._id }
      );
    }

    res.status(200).json({
      success: true,
      message: "Department fetched successfully",
      data: {
        department: department,
        employees: employees,
        totalEmployees: employees.length,
        updatedCount: employeesToUpdate.length
      }
    });

  } catch (error) {
    console.error("Get department by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// ✅ 4. UPDATE DEPARTMENT
exports.updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const department = await Department.findById(id);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found"
      });
    }

    // Check if new name conflicts
    if (name && name !== department.name) {
      const existingDept = await Department.findOne({
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: id }
      });

      if (existingDept) {
        return res.status(400).json({
          success: false,
          message: "Another department with this name already exists"
        });
      }
    }

    // Update department
    const updatedData = {};
    if (name) updatedData.name = name;
    if (description) updatedData.description = description;

    const updatedDepartment = await Department.findByIdAndUpdate(
      id,
      updatedData,
      { new: true, runValidators: true }
    );

    // Update department name in employees
    if (name && name !== department.name) {
      await Employee.updateMany(
        { departmentId: id },
        { department: name }
      );
    }

    res.status(200).json({
      success: true,
      message: "Department updated successfully",
      data: updatedDepartment
    });

  } catch (error) {
    console.error("Update department error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// ✅ 5. DELETE DEPARTMENT
exports.deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    const department = await Department.findById(id);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found"
      });
    }

    // Check if department has employees
    const employeeCount = await Employee.countDocuments({
      $or: [
        { departmentId: id },
        { department: { $regex: new RegExp(`^${department.name}$`, 'i') } }
      ]
    });

    if (employeeCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete department. ${employeeCount} employees are assigned to this department.`
      });
    }

    await Department.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Department deleted successfully"
    });

  } catch (error) {
    console.error("Delete department error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// ✅ 6. GET EMPLOYEES BY DEPARTMENT
exports.getEmployeesByDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;

    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found"
      });
    }

    const employees = await Employee.find({
      $or: [
        { departmentId: departmentId },
        { department: { $regex: new RegExp(`^${department.name}$`, 'i') } }
      ]
    })
    .select('name email employeeId role phone joinDate department departmentId')
    .sort({ name: 1 });

    res.status(200).json({
      success: true,
      message: `Employees in ${department.name}`,
      data: {
        department: department,
        employees: employees,
        count: employees.length
      }
    });

  } catch (error) {
    console.error("Get employees by department error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// department.controller.js में
exports.getEmployeesByDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;
    
    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found"
      });
    }
    
    // Get employees by departmentId OR department name
    const employees = await Employee.find({
      $or: [
        { departmentId: departmentId },
        { department: { $regex: new RegExp(`^${department.name}$`, 'i') } }
      ]
    })
    .select('name email employeeId role phone joinDate address shiftType department departmentId')
    .sort({ name: 1 });
    
    res.status(200).json({
      success: true,
      message: `Employees in ${department.name}`,
      data: {
        department: department,
        employees: employees,
        count: employees.length
      }
    });
    
  } catch (error) {
    console.error('Error getting employees by department:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

