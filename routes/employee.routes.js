const express = require("express");
const { addEmployee, getEmployees, loginEmployee } = require("../controller/employee.controller");
const router = express.Router();

router.post("/add-employee", addEmployee);
router.get("/get-employees", getEmployees);
router.post("/login", loginEmployee);

module.exports = router;
