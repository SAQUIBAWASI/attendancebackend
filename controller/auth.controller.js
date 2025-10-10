const admins = require("../models/Admin");
const employees = require("../models/Emp"); // make sure path & filename are correct
const bcrypt = require("bcryptjs");

// You forgot to export register in your snippet, add it as a placeholder or with logic
exports.register = async (req, res) => {
  // your register code here or placeholder
  res.status(200).json({ message: "Register route" });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  const normalizedEmail = email.toLowerCase();

  // Check admin (hardcoded)
  const adminUser = admins.find(
    (admin) =>
      admin.email.toLowerCase() === normalizedEmail && admin.password === password
  );
  if (adminUser) {
    return res.status(200).json({
      message: "Admin login successful",
      user: {
        id: adminUser.id,
        name: adminUser.name,
        email: adminUser.email,
        role: "admin",
      },
    });
  }

  // Check employee (hardcoded or from DB, depending on your design)
  const employeeUser = employees.find(
    (emp) =>
      emp.email.toLowerCase() === normalizedEmail && emp.password === password
  );
  if (employeeUser) {
    return res.status(200).json({
      message: "Employee login successful",
      user: {
        id: employeeUser.id,
        employeeId: employeeUser.employeeId,
        name: employeeUser.name,
        email: employeeUser.email,
        role: employeeUser.role,
        department: employeeUser.department,
        phone: employeeUser.phone,
        address: employeeUser.address,
      },
    });
  }

  return res.status(401).json({ message: "Invalid email or password" });
};
