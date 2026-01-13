// const Role = require('../models/Role'); // Importing the schema

// // Add a new role
// const addRole = async (req, res) => {
//   try {
//     console.log('🔔 addRole API hit');

//     if (!req.body) {
//       console.log('❌ Request body missing');
//       return res.status(400).json({ error: 'Request body is missing' });
//     }

//     const { name, permissions } = req.body;

//     if (!name || !permissions || !Array.isArray(permissions) || permissions.length === 0) {
//       console.log('❌ Invalid input: name or permissions missing/empty');
//       return res.status(400).json({
//         error: 'Name and at least one permission are required',
//       });
//     }

//     // Create new role
//     const newRole = new Role({ name, permissions });
//     const savedRole = await newRole.save();

//     console.log('✅ Role saved to DB:', savedRole);

//     return res.status(201).json({
//       message: 'Role added successfully',
//       data: savedRole,
//     });

//   } catch (error) {
//     console.error('❌ Error in addRole:', error);

//     // Handle duplicate role name error
//     if (error.code === 11000) {
//       return res.status(409).json({
//         error: 'Role with this name already exists',
//       });
//     }

//     return res.status(500).json({ error: 'Internal server error' });
//   }
// };


// // Get all roles
// const getRoles = async (req, res) => {
//   try {
//     const roles = await Role.find().sort({ createdAt: -1 }); // Get roles from DB
//     return res.json({
//       message: 'List of roles',
//       data: roles,
//     });
//   } catch (error) {
//     console.error('Error in getRoles:', error);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// };



// // Update role
// const updateRole = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { name, permissions } = req.body;

//     const updatedRole = await Role.findByIdAndUpdate(
//       id,
//       { name, permissions },
//       { new: true, runValidators: true }
//     );

//     if (!updatedRole) {
//       return res.status(404).json({ error: "Role not found" });
//     }

//     res.status(200).json({
//       message: "Role updated successfully",
//       data: updatedRole,
//     });
//   } catch (error) {
//     console.error("Error in updateRole:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

// // Delete role
// const deleteRole = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const deletedRole = await Role.findByIdAndDelete(id);

//     if (!deletedRole) {
//       return res.status(404).json({ error: "Role not found" });
//     }

//     res.status(200).json({
//       message: "Role deleted successfully",
//     });
//   } catch (error) {
//     console.error("Error in deleteRole:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

// // ✅ Export properly
// module.exports = {
//   addRole,
//   getRoles,
//   updateRole,
//   deleteRole,
// };

// controllers/role.controller.js
const Role = require('../models/Role');
const Employee = require('../models/Employee');

// ✅ 1. CREATE NEW ROLE
exports.createRole = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: "Role name and description are required"
      });
    }

    const existingRole = await Role.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    });

    if (existingRole) {
      return res.status(400).json({
        success: false,
        message: "Role with this name already exists"
      });
    }

    const newRole = new Role({ name, description });
    await newRole.save();

    res.status(201).json({
      success: true,
      message: "Role created successfully",
      data: newRole
    });

  } catch (error) {
    console.error("Create role error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// ✅ 2. GET ALL ROLES WITH EMPLOYEE COUNT
exports.getAllRoles = async (req, res) => {
  try {
    const roles = await Role.find().sort({ name: 1 });

    const rolesWithCount = await Promise.all(
      roles.map(async (role) => {
        const employeeCount = await Employee.countDocuments({
          $or: [
            { roleId: role._id },
            { role: { $regex: new RegExp(`^${role.name}$`, 'i') } }
          ]
        });

        return {
          _id: role._id,
          name: role.name,
          description: role.description,
          employeeCount: employeeCount,
          createdAt: role.createdAt,
          updatedAt: role.updatedAt
        };
      })
    );

    res.status(200).json({
      success: true,
      message: "Roles fetched successfully",
      data: rolesWithCount
    });

  } catch (error) {
    console.error("Get roles error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// ✅ 3. GET SINGLE ROLE WITH EMPLOYEES
exports.getRoleById = async (req, res) => {
  try {
    const { id } = req.params;

    const role = await Role.findById(id);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found"
      });
    }

    const employees = await Employee.find({
      $or: [
        { roleId: role._id },
        { role: { $regex: new RegExp(`^${role.name}$`, 'i') } }
      ]
    })
    .select('name email employeeId department phone joinDate')
    .sort({ name: 1 });

    // Auto-update employees without roleId
    const employeesToUpdate = employees.filter(emp => !emp.roleId);
    if (employeesToUpdate.length > 0) {
      await Employee.updateMany(
        { _id: { $in: employeesToUpdate.map(emp => emp._id) } },
        { roleId: role._id }
      );
    }

    res.status(200).json({
      success: true,
      message: "Role fetched successfully",
      data: {
        role: role,
        employees: employees,
        totalEmployees: employees.length,
        updatedCount: employeesToUpdate.length
      }
    });

  } catch (error) {
    console.error("Get role by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// ✅ 4. UPDATE ROLE
exports.updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const role = await Role.findById(id);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found"
      });
    }

    if (name && name !== role.name) {
      const existingRole = await Role.findOne({
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: id }
      });

      if (existingRole) {
        return res.status(400).json({
          success: false,
          message: "Another role with this name already exists"
        });
      }
    }

    const updatedData = {};
    if (name) updatedData.name = name;
    if (description) updatedData.description = description;

    const updatedRole = await Role.findByIdAndUpdate(
      id,
      updatedData,
      { new: true, runValidators: true }
    );

    // Update role name in employees
    if (name && name !== role.name) {
      await Employee.updateMany(
        { roleId: id },
        { role: name }
      );
    }

    res.status(200).json({
      success: true,
      message: "Role updated successfully",
      data: updatedRole
    });

  } catch (error) {
    console.error("Update role error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// ✅ 5. DELETE ROLE
exports.deleteRole = async (req, res) => {
  try {
    const { id } = req.params;

    const role = await Role.findById(id);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found"
      });
    }

    const employeeCount = await Employee.countDocuments({
      $or: [
        { roleId: id },
        { role: { $regex: new RegExp(`^${role.name}$`, 'i') } }
      ]
    });

    if (employeeCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete role. ${employeeCount} employees have this role.`
      });
    }

    await Role.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Role deleted successfully"
    });

  } catch (error) {
    console.error("Delete role error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// ✅ 6. GET EMPLOYEES BY ROLE
exports.getEmployeesByRole = async (req, res) => {
  try {
    const { roleId } = req.params;

    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found"
      });
    }

    const employees = await Employee.find({
      $or: [
        { roleId: roleId },
        { role: { $regex: new RegExp(`^${role.name}$`, 'i') } }
      ]
    })
    .select('name email employeeId department phone joinDate role roleId')
    .sort({ name: 1 });

    res.status(200).json({
      success: true,
      message: `Employees with role: ${role.name}`,
      data: {
        role: role,
        employees: employees,
        count: employees.length
      }
    });

  } catch (error) {
    console.error("Get employees by role error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// role.controller.js में similar function
exports.getEmployeesByRole = async (req, res) => {
  try {
    const { roleId } = req.params;
    
    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found"
      });
    }
    
    const employees = await Employee.find({
      $or: [
        { roleId: roleId },
        { role: { $regex: new RegExp(`^${role.name}$`, 'i') } }
      ]
    })
    .select('name email employeeId department phone joinDate address shiftType role roleId')
    .sort({ name: 1 });
    
    res.status(200).json({
      success: true,
      message: `Employees with role: ${role.name}`,
      data: {
        role: role,
        employees: employees,
        count: employees.length
      }
    });
    
  } catch (error) {
    console.error('Error getting employees by role:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};