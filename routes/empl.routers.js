const express = require("express");
const router = express.Router();
const { registerEmployee, employeeLogin } = require("../controller/emplController");

router.post("/register", registerEmployee);
router.post("/login", employeeLogin);

module.exports = router;
