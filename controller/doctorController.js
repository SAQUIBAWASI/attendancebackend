const Doctor = require('../models/Doctor');

// =============================================
// Add Doctor
// =============================================
const addDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      specialization,
      qualification,
      experience,
      address,
      consultationFee,
      availableDays,
      availableTime,
      status
    } = req.body;

    // Validation
    if (!name || !phone || !specialization || !password) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, phone, specialization, password'
      });
    }

    // Check if doctor with same phone already exists
    const existingDoctor = await Doctor.findOne({ phone });
    if (existingDoctor) {
      return res.status(409).json({
        success: false,
        message: 'A doctor with this phone number already exists'
      });
    }

    // Check if doctor with same email already exists (if email provided)
    if (email) {
      const existingEmail = await Doctor.findOne({ email });
      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message: 'A doctor with this email already exists'
        });
      }
    }

    // Create new doctor
    const doctor = new Doctor({
      name,
      email,
      phone,
      password, // Note: In production, you should hash this password
      specialization,
      qualification: qualification || '',
      experience: experience || 0,
      address: address || '',
      consultationFee: consultationFee || 0,
      availableDays: availableDays || [],
      availableTime: availableTime || '',
      status: status || 'active',
      createdBy: req.user?._id || null
    });

    await doctor.save();

    // Remove password from response
    const doctorResponse = doctor.toObject();
    delete doctorResponse.password;

    res.status(201).json({
      success: true,
      message: 'Doctor added successfully',
      data: doctorResponse
    });

  } catch (error) {
    console.error('Error adding doctor:', error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to add doctor',
      error: error.message
    });
  }
};

// =============================================
// Get All Doctors
// =============================================
const getAllDoctors = async (req, res) => {
  try {
    const { 
      specialization, 
      status, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      limit = 100,
      page = 1
    } = req.query;

    // Build filter
    const filter = {};
    if (specialization) filter.specialization = specialization;
    if (status) filter.status = status;

    // Search filter (name, phone, email, specialization)
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } }
      ];
    }

    // Sort options
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const doctors = await Doctor.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))

    // Get total count for pagination
    const totalCount = await Doctor.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: 'Doctors fetched successfully',
      data: doctors,
      pagination: {
        total: totalCount,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalCount / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch doctors',
      error: error.message
    });
  }
};

// =============================================
// Get Single Doctor by ID
// =============================================
const getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await Doctor.findById(id).select('-password');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Doctor fetched successfully',
      data: doctor
    });

  } catch (error) {
    console.error('Error fetching doctor:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid doctor ID format'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to fetch doctor',
      error: error.message
    });
  }
};

// =============================================
// Update Doctor
// =============================================
const updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check if doctor exists
    const existingDoctor = await Doctor.findById(id);
    if (!existingDoctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Prevent updating password through this endpoint (use separate endpoint)
    delete updates.password;

    // Check if phone is being updated and already exists
    if (updates.phone && updates.phone !== existingDoctor.phone) {
      const phoneExists = await Doctor.findOne({ 
        phone: updates.phone,
        _id: { $ne: id }
      });
      if (phoneExists) {
        return res.status(409).json({
          success: false,
          message: 'Another doctor with this phone number already exists'
        });
      }
    }

    // Check if email is being updated and already exists
    if (updates.email && updates.email !== existingDoctor.email) {
      const emailExists = await Doctor.findOne({ 
        email: updates.email,
        _id: { $ne: id }
      });
      if (emailExists) {
        return res.status(409).json({
          success: false,
          message: 'Another doctor with this email already exists'
        });
      }
    }

    // Update doctor
    const updatedDoctor = await Doctor.findByIdAndUpdate(
      id,
      { $set: updates },
      { 
        new: true, 
        runValidators: true 
      }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Doctor updated successfully',
      data: updatedDoctor
    });

  } catch (error) {
    console.error('Error updating doctor:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid doctor ID format'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update doctor',
      error: error.message
    });
  }
};

// =============================================
// Delete Doctor
// =============================================
const deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Soft delete alternative: just mark as inactive instead of hard delete
    // Uncomment the following lines if you prefer soft delete
    // await Doctor.findByIdAndUpdate(id, { status: 'inactive' });
    // return res.status(200).json({
    //   success: true,
    //   message: 'Doctor deactivated successfully'
    // });

    // Hard delete
    await Doctor.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Doctor deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting doctor:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid doctor ID format'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to delete doctor',
      error: error.message
    });
  }
};

// =============================================
// Update Doctor Password (Bonus)
// =============================================
const updateDoctorPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    doctor.password = password; // In production, hash the password
    await doctor.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });

  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update password',
      error: error.message
    });
  }
};

// =============================================
// Get Doctor Statistics
// =============================================
const getDoctorStats = async (req, res) => {
  try {
    const totalDoctors = await Doctor.countDocuments();
    const activeDoctors = await Doctor.countDocuments({ status: 'active' });
    const inactiveDoctors = await Doctor.countDocuments({ status: 'inactive' });

    // Get specialization distribution
    const specializationStats = await Doctor.aggregate([
      { $group: { _id: '$specialization', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      message: 'Doctor statistics fetched successfully',
      data: {
        total: totalDoctors,
        active: activeDoctors,
        inactive: inactiveDoctors,
        bySpecialization: specializationStats
      }
    });

  } catch (error) {
    console.error('Error fetching doctor stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch doctor statistics',
      error: error.message
    });
  }
};

module.exports = {
  addDoctor,
  getAllDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
  updateDoctorPassword,
  getDoctorStats
};