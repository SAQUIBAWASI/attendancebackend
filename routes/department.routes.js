// const express = require("express");
// const router = express.Router();

// const {
//   addDepartment,
//   getDepartments
// } = require("../controller/department.controller");

// // POST /api/department/add
// router.post("/add", addDepartment);

// // GET /api/department/get
// router.get("/get", getDepartments);

// // PUT /api/department/update/:id
// router.put("/update/:id", require("../controller/department.controller").updateDepartment);

// // DELETE /api/department/delete/:id
// router.delete("/delete/:id", require("../controller/department.controller").deleteDepartment);


// module.exports = router;


// routes/department.routes.js
const express = require('express');
const router = express.Router();
const {
  createDepartment,
  getAllDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
  getEmployeesByDepartment
} = require('../controller/department.controller');

// ✅ CREATE
router.post('/create', createDepartment);

// ✅ READ
router.get('/all', getAllDepartments);
router.get('/:id', getDepartmentById);
router.get('/:departmentId/employees', getEmployeesByDepartment);

// ✅ UPDATE
router.put('/update/:id', updateDepartment);

// ✅ DELETE
router.delete('/delete/:id', deleteDepartment);
// department.routes.js में
router.get('/:departmentId/employees', getEmployeesByDepartment);


module.exports = router;