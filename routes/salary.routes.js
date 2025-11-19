const express = require("express");
const { setSalary, getSalary, getAllSalaries } = require("../controller/salary.controller");

const router = express.Router();

router.post("/set-salary", setSalary);
router.get("/get-salary/:employeeId", getSalary);
router.get("/all-salaries", getAllSalaries);

module.exports = router;
