const Employee = require("../models/Employee");

// ➕ Add a new employee
exports.addEmployee = async (req, res) => {
  try {
    const { name, email, password, department, role, joinDate, phone, address, employeeId } = req.body;

    const existingEmail = await Employee.findOne({ email });
    if (existingEmail) return res.status(400).json({ message: "Email already exists" });

    const existingId = await Employee.findOne({ employeeId });
    if (existingId) return res.status(400).json({ message: "Employee ID already exists" });

    const employee = new Employee({
      name,
      email,
      password,
      role,
      department,
      employeeId,
      joinDate,
      address,
      phone,
    });

    await employee.save();
    res.status(201).json({ message: "Employee added successfully", employee });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
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

// 🔍 Get single employee by email or employeeId
exports.getEmployeeByEmail = async (req, res) => {
  try {
    const { email, employeeId } = req.query;

    if (!email && !employeeId)
      return res.status(400).json({ message: "Email or Employee ID is required" });

    const query = email ? { email } : { employeeId };
    const employee = await Employee.findOne(query);

    if (!employee) return res.status(404).json({ message: "Employee not found" });

    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// 🔐 Employee login (email or employeeId)
exports.loginEmployee = async (req, res) => {
  try {
    const { email, employeeId, password } = req.body;

    if (!email && !employeeId)
      return res.status(400).json({ message: "Email or Employee ID is required" });

    const query = email ? { email } : { employeeId };
    const employee = await Employee.findOne(query);

    if (!employee) return res.status(404).json({ message: "Employee not found" });
    if (employee.password !== password)
      return res.status(401).json({ message: "Invalid password" });

    res.json({
      message: "Login successful",
      employee: {
        id: employee._id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        department: employee.department,
        employeeId: employee.employeeId,
        joinDate: employee.joinDate,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};
// 🔹 Get attendance summary for one employee
exports.getEmployeeAttendanceSummary = async (req, res) => {
  try {
    const { email, employeeId } = req.query;
    if (!email && !employeeId) return res.status(400).json({ message: "Email or Employee ID required" });

    const query = email ? { email } : { employeeId };
    const records = await Attendance.find(query);

    const totalDays = records.length;
    const presentDays = records.filter(r => r.status === "Present").length;
    const absentDays = records.filter(r => r.status === "Absent").length;
    const attendanceRate = totalDays === 0 ? 0 : ((presentDays / totalDays) * 100).toFixed(2);

    res.json({ totalDays, presentDays, absentDays, attendanceRate });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error });
  }
};

