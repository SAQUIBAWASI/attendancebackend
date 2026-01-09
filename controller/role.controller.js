const Role = require('../models/Role'); // Importing the schema

// Add a new role
const addRole = async (req, res) => {
  try {
    console.log('🔔 addRole API hit');

    if (!req.body) {
      console.log('❌ Request body missing');
      return res.status(400).json({ error: 'Request body is missing' });
    }

    const { name, permissions } = req.body;

    if (!name || !permissions || !Array.isArray(permissions) || permissions.length === 0) {
      console.log('❌ Invalid input: name or permissions missing/empty');
      return res.status(400).json({
        error: 'Name and at least one permission are required',
      });
    }

    // Create new role
    const newRole = new Role({ name, permissions });
    const savedRole = await newRole.save();

    console.log('✅ Role saved to DB:', savedRole);

    return res.status(201).json({
      message: 'Role added successfully',
      data: savedRole,
    });

  } catch (error) {
    console.error('❌ Error in addRole:', error);

    // Handle duplicate role name error
    if (error.code === 11000) {
      return res.status(409).json({
        error: 'Role with this name already exists',
      });
    }

    return res.status(500).json({ error: 'Internal server error' });
  }
};


// Get all roles
const getRoles = async (req, res) => {
  try {
    const roles = await Role.find().sort({ createdAt: -1 }); // Get roles from DB
    return res.json({
      message: 'List of roles',
      data: roles,
    });
  } catch (error) {
    console.error('Error in getRoles:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};



// Update role
const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, permissions } = req.body;

    const updatedRole = await Role.findByIdAndUpdate(
      id,
      { name, permissions },
      { new: true, runValidators: true }
    );

    if (!updatedRole) {
      return res.status(404).json({ error: "Role not found" });
    }

    res.status(200).json({
      message: "Role updated successfully",
      data: updatedRole,
    });
  } catch (error) {
    console.error("Error in updateRole:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete role
const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRole = await Role.findByIdAndDelete(id);

    if (!deletedRole) {
      return res.status(404).json({ error: "Role not found" });
    }

    res.status(200).json({
      message: "Role deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteRole:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ Export properly
module.exports = {
  addRole,
  getRoles,
  updateRole,
  deleteRole,
};