const Employee = require("../models/Employee.js");

// -------------------------------------------------------
// 1️⃣ Add / Update Employee Salary
// -------------------------------------------------------
exports.setSalary = async (req, res) => {
  try {
    const { employeeId, name, salaryPerDay, salaryPerMonth, shiftHours, weekOffPerMonth } = req.body;

    if (!employeeId) {
      return res.status(400).json({ message: "employeeId is required" });
    }

    if (!name) {
      return res.status(400).json({ message: "name is required" });
    }

    if (!shiftHours) {
      return res.status(400).json({ message: "shiftHours is required" });
    }

    // -----------------------
    // Auto Convert Salary
    // -----------------------
    let finalSalaryPerMonth = salaryPerMonth;

    if (salaryPerDay) {
      finalSalaryPerMonth = Number(salaryPerDay) * 30;
    }

    if (!finalSalaryPerMonth) {
      return res.status(400).json({
        message: "Provide salaryPerDay OR salaryPerMonth"
      });
    }

    const employee = await Employee.findOneAndUpdate(
      { employeeId },
      {
        name,
        salaryPerMonth: finalSalaryPerMonth,
        shiftHours,
        weekOffPerMonth: weekOffPerMonth || 0    // ⭐ ADDED NEW FIELD
      },
      { new: true, upsert: true }
    );

    res.json({
      message: "Salary updated successfully",
      employee,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// -------------------------------------------------------
// 2️⃣ Get Salary for ONE Employee
// -------------------------------------------------------
exports.getSalary = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const emp = await Employee.findOne({ employeeId });

    if (!emp) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json({
      employeeId: emp.employeeId,
      name: emp.name,
      shiftHours: emp.shiftHours,
      salaryPerMonth: emp.salaryPerMonth,
      weekOffPerMonth: emp.weekOffPerMonth || 0   // ⭐ ADDED NEW FIELD
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// -------------------------------------------------------
// 3️⃣ Get Salary for ALL Employees
// -------------------------------------------------------
exports.getAllSalaries = async (req, res) => {
  try {
    const employees = await Employee.find();

    const salaryList = employees.map((emp) => ({
      employeeId: emp.employeeId,
      name: emp.name,
      shiftHours: emp.shiftHours,
      salaryPerMonth: emp.salaryPerMonth,
      weekOffPerMonth: emp.weekOffPerMonth || 0   // ⭐ ADDED NEW FIELD
    }));

    res.json(salaryList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
