const express = require("express");

const router = express.Router();

const {
  getTopPerformers,
  getAllPerformers,
  getDepartmentPerformance,
  getAllDepartment,
  getEmployeePerformance,
} = require("../controller/dashboardController");

// Top performers
router.get(
  "/top-performers",
  getTopPerformers
);

// All performers
router.get(
  "/all-performers",
  getAllPerformers
);

// Department performance
router.get(
  "/department-performance",
  getDepartmentPerformance
);

// All departments
router.get(
  "/all-departments",
  getAllDepartment
);

// Specific employee performance by employee ID
router.get(
  "/employee-performance/:employeeId",
  getEmployeePerformance
);

module.exports = router;