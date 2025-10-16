const Empl = require("../models/Empl");

// Register Empl
exports.registerEmployee = async (req, res) => {
  const { name, email, mobile, password } = req.body;

  try {
    const existing = await Empl.findOne({ email });
    if (existing) return res.status(400).json({ message: "Empl already exists" });

    const employee = new Empl({ name, email, mobile, password });
    await employee.save();

    res.json({ message: "Empl registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Login Empl (plain-text)
exports.employeeLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const employee = await Empl.findOne({ email });
    if (!employee) return res.status(404).json({ message: "Empl not found" });

    if (employee.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({
      message: "Login successful",
      employee: {
        id: employee._id,
        name: employee.name,
        email: employee.email,
        mobile: employee.mobile,
        employeeId:employee._Id,
        password: employee.password,
        role: employee.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
