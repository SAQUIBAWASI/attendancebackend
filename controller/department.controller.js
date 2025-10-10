// controller/department.controller.js
const Department = require('../models/Department');

// POST /api/department/add
const addDepartment = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).json({ error: 'Name and description are required' });
    }

    const newDept = new Department({ name, description });
    const savedDept = await newDept.save();

    res.status(201).json({
      message: 'Department created successfully',
      data: savedDept,
    });
  } catch (error) {
    console.error('❌ Error in addDepartment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/department/get
const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find();
    res.status(200).json({
      message: 'Departments fetched successfully',
      data: departments,
    });
  } catch (error) {
    console.error('❌ Error in getDepartments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ✅ EXPORT BOTH
module.exports = {
  addDepartment,
  getDepartments,
};
