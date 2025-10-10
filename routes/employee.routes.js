const express = require("express");
const { addEmployee, getEmployees } = require("../controller/employee.controller");
const router = express.Router();

router.post("/add-employee", addEmployee);
router.get("/get-employees", getEmployees);

module.exports = router;
