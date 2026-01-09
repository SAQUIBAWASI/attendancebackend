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


// PUT /api/department/update/:id
const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const updatedDept = await Department.findByIdAndUpdate(
      id,
      { name, description },
      { new: true, runValidators: true }
    );

    if (!updatedDept) {
      return res.status(404).json({ error: "Department not found" });
    }

    res.status(200).json({
      message: "Department updated successfully",
      data: updatedDept,
    });
  } catch (error) {
    console.error("❌ Error in updateDepartment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// DELETE /api/department/delete/:id
const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedDept = await Department.findByIdAndDelete(id);

    if (!deletedDept) {
      return res.status(404).json({ error: "Department not found" });
    }

    res.status(200).json({
      message: "Department deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error in deleteDepartment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


// ✅ EXPORT BOTH
module.exports = {
  addDepartment,
  getDepartments,
  updateDepartment,
  deleteDepartment,
};