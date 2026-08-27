const express = require('express');
const router = express.Router();
const {
  addDoctor,
  getAllDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
  getDoctorStats,
  doctorLogin
} = require('../controller/doctorController');

// =============================================
// Doctor Routes
// =============================================

// GET /api/doctors - Get all doctors (with filters, search, pagination)
router.get('/getalldoctors', getAllDoctors);

// GET /api/doctors/stats - Get doctor statistics
router.get('/stats', getDoctorStats);

// GET /api/doctors/:id - Get single doctor by ID
router.get('/getsingledoctor/:id', getDoctorById);

// POST /api/doctors - Add new doctor
router.post('/adddoctor/', addDoctor);

// PUT /api/doctors/:id - Update doctor
router.put('/updatedoctor/:id', updateDoctor);



// DELETE /api/doctors/:id - Delete doctor
router.delete('/deletedoctor/:id', deleteDoctor);


router.post('/doctorlogin', doctorLogin);


module.exports = router;