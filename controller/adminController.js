const Admin = require("../models/Admin");
const CompanyIP = require("../models/CompanyIP");
const axios = require("axios");


const jwt = require("jsonwebtoken");

// 🟢 Register Admin
const registerAdmin = async (req, res) => {
  try {
    const { name, email, mobile, password, role } = req.body;

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ success: false, message: "Admin already exists" });
    }

    const admin = new Admin({
      name,
      email,
      mobile,
      password,
      role: role || "admin",
    });

    await admin.save();
    res.status(201).json({ success: true, message: "Admin registered successfully", admin });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🟢 Login Admin
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const admin = await Admin.findOne({ email, password });
    if (!admin) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.status(200).json({ success: true, message: "Login successful", admin, token });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const Quiz = require("../models/Quiz");
const QRCode = require("../models/QRCode");

// 🟢 Get All Quizes
const getAllQuizes = async (req, res) => {
  try {
    const quizzes = await Quiz.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, quizzes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🟢 Add Bulk Quizzes
const addBulkQuizzes = async (req, res) => {
  try {
    const { quizzes } = req.body;
    if (!quizzes || !Array.isArray(quizzes)) {
      return res.status(400).json({ success: false, message: "Invalid data format" });
    }

    const formattedQuizzes = quizzes.map(q => {
      const marks = q.questions ? q.questions.reduce((sum, qn) => sum + (qn.marks || 1), 0) : 0;
      return {
        title: q.topic || q.title || "Untitled Assessment",
        description: q.explanation || q.description || "",
        role: q.role || q.category || "Developer",
        experienceLevel: q.experienceLevel || "Fresher",
        duration: q.duration || 30,
        totalMarks: marks,
        status: "Active",
        questions: q.questions ? q.questions.map(qn => ({
          questionText: qn.questionText || qn.question,
          options: qn.options,
          correctAnswer: qn.correctAnswer || qn.answer,
          marks: qn.marks || 1
        })) : []
      };
    });

    const result = await Quiz.insertMany(formattedQuizzes);
    res.status(201).json({ success: true, message: `${result.length} Quizzes added successfully`, quizzes: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🟢 Create Single Assessment
const createAssessment = async (req, res) => {
  try {
    const { title, description, role, experienceLevel, duration, questions } = req.body;

    const totalMarks = questions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0);

    const assessment = new Quiz({
      title,
      description,
      role,
      experienceLevel,
      duration,
      totalMarks,
      questions
    });

    await assessment.save();
    res.status(201).json({ success: true, message: "Assessment created successfully", assessment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🟢 Update Assessment
const updateAssessment = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (updateData.questions) {
      updateData.totalMarks = updateData.questions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0);
    }

    const assessment = await Quiz.findByIdAndUpdate(id, updateData, { new: true });
    if (!assessment) return res.status(404).json({ success: false, message: "Assessment not found" });

    res.status(200).json({ success: true, message: "Assessment updated successfully", assessment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🟢 Delete Assessment
const deleteAssessment = async (req, res) => {
  try {
    const { id } = req.params;
    await Quiz.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Assessment deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



// ─── CREATE QR ───
const createQR = async (req, res) => {
  try {
    const { 
      companyName, 
      locationName, 
      address, 
      latitude, 
      longitude, 
      adminName, 
      expiryTime,
      token,
      qrData  // ✅ URL directly from frontend
    } = req.body;

    // Validate required fields
    if (!companyName || !locationName) {
      return res.status(400).json({
        success: false,
        message: 'Company name and location name are required'
      });
    }

    // ✅ If token not sent from frontend, generate it
    let finalToken = token;
    if (!finalToken) {
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 8);
      finalToken = `${companyName.substring(0, 3).toUpperCase()}-${timestamp}-${random}`;
    }

    // ✅ If qrData not sent, generate URL with default attendance URL
    const ATTENDANCE_URL = 'https://www.timelyhealth.in/attendance-capture';
    let finalQrData = qrData;
    if (!finalQrData) {
      finalQrData = `${ATTENDANCE_URL}?token=${finalToken}&company=${encodeURIComponent(companyName)}&location=${encodeURIComponent(locationName)}&lat=${latitude || ''}&lng=${longitude || ''}`;
    }

    const qrCode = new QRCode({
      companyName,
      locationName,
      address: address || '',
      latitude: latitude || '',
      longitude: longitude || '',
      adminName: adminName || '',
      token: finalToken,
      qrData: finalQrData, // ✅ URL stored
      expiryTime: expiryTime || 30
    });

    await qrCode.save();

    res.status(201).json({
      success: true,
      message: 'QR created successfully',
      data: qrCode
    });
  } catch (error) {
    console.error('Error creating QR:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ─── GET ALL QRS ───
const getAllQRs = async (req, res) => {
  try {
    const qrCodes = await QRCode.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: qrCodes.length,
      data: qrCodes
    });
  } catch (error) {
    console.error('Error fetching QRs:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ─── GET SINGLE QR ───
const getQR = async (req, res) => {
  try {
    const { id } = req.params;
    const qrCode = await QRCode.findById(id);

    if (!qrCode) {
      return res.status(404).json({
        success: false,
        message: 'QR not found'
      });
    }

    res.status(200).json({
      success: true,
      data: qrCode
    });
  } catch (error) {
    console.error('Error fetching QR:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ─── UPDATE QR ───
const updateQR = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // ✅ Agar qrData update ho raha hai toh woh URL hi hona chahiye
    const qrCode = await QRCode.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!qrCode) {
      return res.status(404).json({
        success: false,
        message: 'QR not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'QR updated successfully',
      data: qrCode
    });
  } catch (error) {
    console.error('Error updating QR:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ─── DELETE QR ───
const deleteQR = async (req, res) => {
  try {
    const { id } = req.params;
    const qrCode = await QRCode.findByIdAndDelete(id);

    if (!qrCode) {
      return res.status(404).json({
        success: false,
        message: 'QR not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'QR deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting QR:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};




const updateCompanyIP = async (req, res) => {
  try {
    const { companyId } = req.body;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "Company ID is required",
      });
    }

    // Fetch current public IP
    const { data } = await axios.get("https://api.ipify.org?format=json");

    const publicIp = data.ip;

    const company = await CompanyIP.findOneAndUpdate(
      { companyId },
      {
        publicIp,
        updatedAt: new Date(),
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Company IP updated successfully.",
      data: company,
    });
  } catch (error) {
    console.error("Update Company IP Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update company IP.",
      error: error.message,
    });
  }
};



const getAllCompanyIPs = async (req, res) => {
  try {
    const companies = await CompanyIP.find().sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      count: companies.length,
      data: companies,
    });
  } catch (error) {
    console.error("Get All Company IPs Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch company IPs.",
      error: error.message,
    });
  }
};
module.exports = { registerAdmin, 
  loginAdmin, 
  getAllQuizes, 
  addBulkQuizzes, 
  createAssessment, 
  updateAssessment, 
  deleteAssessment,
  createQR,
  getAllQRs,
  updateQR,
  deleteQR,
  updateCompanyIP,
  getAllCompanyIPs
 };


