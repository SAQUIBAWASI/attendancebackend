const Patient = require('../models/Patient');

// Create a new patient record
exports.createPatient = async (req, res) => {
  try {
    const patient = await Patient.create(req.body);
    return res.status(201).json({ success: true, data: patient });
  } catch (err) {
    console.error('Error creating patient:', err);
    return res.status(400).json({ success: false, message: err.message });
  }
};

// Get list of patients (with optional pagination & search)
exports.getPatients = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = {};
    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [{ name: regex }, { phone: regex }];
    }
    const patients = await Patient.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    const total = await Patient.countDocuments(query);
    return res.json({ success: true, data: patients, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error('Error fetching patients:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Get a single patient by ID
exports.getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }
    return res.json({ success: true, data: patient });
  } catch (err) {
    console.error('Error fetching patient:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Update patient (partial updates allowed)
exports.updatePatient = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }
    return res.json({ success: true, data: patient });
  } catch (err) {
    console.error('Error updating patient:', err);
    return res.status(400).json({ success: false, message: err.message });
  }
};

// Delete patient record
exports.deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }
    return res.json({ success: true, message: 'Patient deleted' });
  } catch (err) {
    console.error('Error deleting patient:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};