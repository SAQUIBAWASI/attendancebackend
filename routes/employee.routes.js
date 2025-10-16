const express = require("express");
const {
  addEmployee,
  getEmployees,
  getEmployeeByEmail,
  loginEmployee,
} = require("../controller/employee.controller");

const router = express.Router();

// ➕ Add a new employee
router.post("/add-employee", addEmployee);

// 📋 Get all employees
router.get("/get-employees", getEmployees);

// 🔍 Get single employee by email (for dashboard)
router.get("/get-employee", getEmployeeByEmail);

// 🔐 Employee login
router.post("/login", loginEmployee);

module.exports = router;
