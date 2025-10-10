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

// ✅ Export properly
module.exports = {
  addRole,
  getRoles,
};
