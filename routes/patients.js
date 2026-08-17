const express = require('express');
const router = express.Router();
const patientController = require('../controller/patientController');

// @route POST /api/patients
router.post('/', patientController.createPatient);

// @route GET /api/patients
router.get('/', patientController.getPatients);

// @route GET /api/patients/:id
router.get('/:id', patientController.getPatientById);

// @route PUT /api/patients/:id
router.put('/:id', patientController.updatePatient);

// @route DELETE /api/patients/:id
router.delete('/:id', patientController.deletePatient);

module.exports = router;