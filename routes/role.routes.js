// // routes/role.routes.js
// const express = require('express');
// const router = express.Router();

// // ✅ Correct import - path check करें
// const { addRole, getRoles } = require('../controller/role.controller');

// // Routes
// router.post('/add-role', addRole);
// router.get('/roles', getRoles);

// // Update & Delete
// router.put('/update/:id', require('../controller/role.controller').updateRole);
// router.delete('/delete/:id', require('../controller/role.controller').deleteRole);


// module.exports = router;

// routes/role.routes.js
const express = require('express');
const router = express.Router();
const {
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  deleteRole,
  getEmployeesByRole
} = require('../controller/role.controller');

// ✅ CREATE
router.post('/create', createRole);

// ✅ READ
router.get('/all', getAllRoles);
router.get('/:id', getRoleById);
router.get('/:roleId/employees', getEmployeesByRole);

// ✅ UPDATE
router.put('/update/:id', updateRole);

// ✅ DELETE
router.delete('/delete/:id', deleteRole);
// role.routes.js में
router.get('/:roleId/employees', getEmployeesByRole);

module.exports = router;