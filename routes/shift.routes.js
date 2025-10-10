// routes/shift.routes.js

const express = require('express');
const router = express.Router();

const shiftController = require('../controller/shift.controller'); // ✅ Check this path

router.post('/add', shiftController.addShift);
router.get('/all', shiftController.getShifts);

module.exports = router;
