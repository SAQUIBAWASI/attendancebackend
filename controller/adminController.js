const Admin = require("../models/Admin");

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

    res.status(200).json({ success: true, message: "Login successful", admin });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const Quiz = require("../models/Quiz");

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

module.exports = { registerAdmin, loginAdmin, getAllQuizes, addBulkQuizzes, createAssessment, updateAssessment, deleteAssessment };


