
const Employee = require("../models/Employee");

exports.addEmployee = async (req, res) => {
  try {
    console.log('🔸 Incoming data:', req.body); // Debug log

    const {
      name,
      email,
      department,
      role,
      joinDate,
      phone,
      address,
      employeeId,
    } = req.body;

    if (!name || !email || !employeeId) {
      console.log('🔴 Missing required fields');
      return res.status(400).json({ error: 'Name, email, and employeeId are required.' });
    }

    const employee = new Employee({
      name,
      email,
      department,
      role,
      joinDate: joinDate ? new Date(joinDate) : null, // Ensure date format
      phone,
      address,
      employeeId,
    });

    await employee.save();
    console.log('✅ Employee saved successfully:', employee); // Confirm save
    res.status(201).json(employee);
  } catch (error) {
    console.error('❌ Error saving employee:', error); // Show full error

    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ error: `${duplicateField} must be unique.` });
    }

    res.status(400).json({ error: error.message });
  }
};


exports.getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



// 🟢 Employee Login (via phone number only)
exports.loginEmployee = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ success: false, message: "Phone number is required" });
    }

    const employee = await Employee.findOne({ phone });
    if (!employee) {
      return res.status(401).json({ success: false, message: "Invalid phone number" });
    }

    res.status(200).json({
      success: true,
      message: "Login successful",
      employee,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};