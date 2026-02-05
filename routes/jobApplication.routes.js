console.log("✅ [DEBUG] Loading Job Application Routes...");
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const {
    submitApplication,
    getAllApplications,
    getApplicationsByJobId
} = require("../controller/jobApplication.controller");

// Ensure uploads directory exists
const uploadDir = "uploads/resumes";
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /pdf|doc|docx/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error("Only .pdf, .doc and .docx files are allowed!"));
        }
    },
});

// ✅ Public route to submit application
router.post("/submit", upload.single("resume"), submitApplication);

// ✅ Admin routes
router.get("/all", getAllApplications);
router.get("/job/:jobId", getApplicationsByJobId);

module.exports = router;
