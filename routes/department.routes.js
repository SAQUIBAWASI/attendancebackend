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

// PUT /api/department/update/:id
router.put("/update/:id", require("../controller/department.controller").updateDepartment);

// DELETE /api/department/delete/:id
router.delete("/delete/:id", require("../controller/department.controller").deleteDepartment);


module.exports = router;
