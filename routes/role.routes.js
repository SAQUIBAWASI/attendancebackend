// routes/role.routes.js
const express = require('express');
const router = express.Router();

// ✅ Correct import - path check करें
const { addRole, getRoles } = require('../controller/role.controller');

// Routes
router.post('/add-role', addRole);
router.get('/roles', getRoles);

module.exports = router;