const Admin = require("../models/Admin");

// 🟢 Register Admin
const registerAdmin = async (req, res) => {
  try {
    const { name, email, mobile, password, role } = req.body;

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ success: false, message: "Admin already exists" });
    }

    const admin = new Admin({
      name,
      email,
      mobile,
      password,
      role: role || "admin",
    });

    await admin.save();
    res.status(201).json({ success: true, message: "Admin registered successfully", admin });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🟢 Login Admin
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const admin = await Admin.findOne({ email, password });
    if (!admin) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    res.status(200).json({ success: true, message: "Login successful", admin });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { registerAdmin, loginAdmin };
