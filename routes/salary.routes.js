const express = require("express");
const { setSalary, getSalary, getAllSalaries, updateEmployeeSalary } = require("../controller/salary.controller");

const router = express.Router();

router.post("/set-salary", setSalary);
router.get("/get-salary/:employeeId", getSalary);
router.get("/all-salaries", getAllSalaries);
// ✅ UPDATE salary route
router.put("/update-salary/:employeeId", updateEmployeeSalary);
module.exports = router;
