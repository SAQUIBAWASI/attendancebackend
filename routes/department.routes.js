const express = require("express");
const router = express.Router();

const {
  addDepartment,
  getDepartments
} = require("../controller/department.controller");

// POST /api/department/add
router.post("/add", addDepartment);

// GET /api/department/get
router.get("/get", getDepartments);

module.exports = router;
