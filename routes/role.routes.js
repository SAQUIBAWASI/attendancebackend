// routes/role.routes.js
const express = require('express');
const router = express.Router();

// ✅ Correct import - path check करें
const { addRole, getRoles } = require('../controller/role.controller');

// Routes
router.post('/add-role', addRole);
router.get('/roles', getRoles);

// Update & Delete
router.put('/update/:id', require('../controller/role.controller').updateRole);
router.delete('/delete/:id', require('../controller/role.controller').deleteRole);


module.exports = router;