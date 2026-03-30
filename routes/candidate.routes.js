const express = require("express");
const router = express.Router();
const candidateController = require("../controller/candidate.controller");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Middleware to verify JWT token for candidates
const candidateAuth = require("../middleware/candidateAuth");
const auth = require("../middleware/auth"); // Admin auth

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "../uploads/candidate-documents");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer for document uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        // Allow common document types
        const allowedMimes = [
            'application/pdf',
            'image/jpeg',
            'image/jpg',
            'image/png',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];

        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`File type not allowed. Allowed types: PDF, JPG, PNG, DOC, DOCX`));
        }
    }
});

// @route   POST api/candidate/register
// @desc    Register a candidate
// @access  Public
router.post("/register", candidateController.register);

// @route   POST api/candidate/login
// @desc    Login candidate
// @access  Public
router.post("/login", candidateController.login);

// @route   GET api/candidate/profile
// @desc    Get candidate profile
// @access  Private
router.get("/profile", candidateAuth, candidateController.getProfile);

// @route   PUT api/candidate/profile
// @desc    Update candidate profile
// @access  Private
router.put("/profile", candidateAuth, candidateController.updateProfile);

// @route   GET api/candidate/applications
// @desc    Get jobs applied by candidate
// @access  Private
router.get("/applications", candidateAuth, candidateController.getAppliedJobs);

// @route   POST api/candidate/check-existence
// @desc    Check if candidate exists by email
// @access  Public
router.post("/check-existence", candidateController.checkCandidateExists);

// @route   POST api/candidate/upload-documents
// @desc    Upload personal documents
// @access  Private
router.post(
    "/upload-documents",
    candidateAuth,
    upload.single("document"),
    candidateController.uploadPersonalDocuments
);

// @route   GET api/candidate/documents
// @desc    Get candidate personal documents
// @access  Private
router.get("/documents", candidateAuth, candidateController.getPersonalDocuments);

// @route   GET api/candidate/all-documents
// @desc    Get all candidates documents (Admin)
// @access  Private (Admin only - can add admin middleware if needed)
router.get("/all-documents", candidateController.getAllCandidatesDocuments);

// @route   GET api/candidate/admin/:id
// @desc    Get specific candidate's personal documents (Admin)
// @access  Private (Admin only - can add admin middleware if needed)
router.get("/admin/:id", candidateController.getCandidateDocumentsById);

// @route   POST api/candidate/save-bank-details
// @desc    Save bank details
// @access  Private
router.post("/save-bank-details", candidateAuth, candidateController.saveBankDetails);

// @route   POST api/candidate/save-emergency-contact
// @desc    Save emergency contact
// @access  Private
router.post("/save-emergency-contact", candidateAuth, candidateController.saveEmergencyContact);

// @route   POST api/candidate/submit-resignation
// @desc    Submit resignation
// @access  Private
router.post("/submit-resignation", candidateAuth, candidateController.submitResignation);

// @route   PUT api/candidate/confirm-interview
// @desc    Confirm or decline interview invitation
// @access  Private
router.put("/confirm-interview", candidateAuth, candidateController.confirmInterview);

// @route   POST api/candidate/experience
// @desc    Add previous work experience (Employee Journey)
// @access  Private
router.post(
    "/experience",
    candidateAuth,
    upload.fields([{ name: 'offerLetter', maxCount: 1 }, { name: 'payslip', maxCount: 1 }]),
    candidateController.addCandidateExperience
);

// @route   GET api/candidate/experience
// @desc    Get candidate's previous work experiences
// @access  Private
router.get("/experience", candidateAuth, candidateController.getCandidateExperiences);

// @route   GET api/candidate/all-experiences
// @desc    Get all candidate experiences (Admin)
// @access  Public (matching existing admin patterns)
router.get("/all-experiences", candidateController.getAllCandidateExperiences);

// Recruitment Frontend Compatibility Routes
router.post(
    "/documents/upload",
    candidateAuth,
    upload.single("document"),
    candidateController.uploadPersonalDocuments
);
router.put("/documents/details", candidateAuth, candidateController.updateCandidateDocumentDetails);

module.exports = router;
