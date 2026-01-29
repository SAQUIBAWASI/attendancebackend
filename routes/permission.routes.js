// const express = require("express");
// const router = express.Router();

// const {
//   createPermission,
//   getAllPermissions,
//   approvePermission,
// } = require("../controllers/permission.controller");

// // Employee
// router.post("/request", createPermission);

// // Admin
// router.get("/all", getAllPermissions);
// router.put("/approve/:id", approvePermission);

// module.exports = router;


const express = require("express");
const router = express.Router();

const {
  createPermission,
  getAllPermissions,
  approvePermission,
  backToDuty,
  getEmployeePermissions,
} = require("../controller/permission.controller");

router.post("/request", createPermission);
router.get("/all", getAllPermissions);
router.put("/approve/:id", approvePermission);
router.put("/back-to-duty/:id", backToDuty);
router.get("/my-permissions/:employeeId", getEmployeePermissions);

module.exports = router;

