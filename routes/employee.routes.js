// const express = require("express");
// const {
//   addEmployee,
//   getEmployees,
//   getEmployeeByEmail,
//   loginEmployee,
//  getEmployeeAttendanceSummary,
//  employeeController,
// } = require("../controller/employee.controller");

// const router = express.Router();

// // ➕ Add a new employee
// router.post("/add-employee", addEmployee);

// // 📋 Get all employees
// router.get("/get-employees", getEmployees);

// // 🔍 Get single employee by email (for dashboard)
// router.get("/get-employee", getEmployeeByEmail);

// // 🔐 Employee login
// router.post("/login", loginEmployee);

// // 📊 Get attendance summary
// router.get("/attendance-summary", getEmployeeAttendanceSummary); // ✅ add this route
// // ✅ Add this new route
// router.put("/assign-location/:employeeId", employeeController.assignLocation);
// module.exports = router;
const express = require("express");
const {
  addEmployee,
  getEmployees,
  getEmployeeByEmail,
  loginEmployee,
  getEmployeeAttendanceSummary,
  assignLocation,
  getAssignedLocationByEmployeeId, // ✅ add this instead
  updateEmployee, // ✅ ADD THIS
  deleteEmployee, // ✅ ADD THIS
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

// 📊 Get attendance summary
router.get("/attendance-summary", getEmployeeAttendanceSummary);

// ✅ Assign location to employee
router.put("/assign-location/:employeeId", assignLocation);
router.get("/mylocation/:employeeId", getAssignedLocationByEmployeeId);


router.put("/update/:id", updateEmployee); // ✅ ADD THIS
router.delete("/delete-employee/:id", deleteEmployee); // ✅ ADD THIS

module.exports = router;

