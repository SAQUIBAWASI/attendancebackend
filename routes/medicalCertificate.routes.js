const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const {
  uploadCertificate,
  getEmployeeCertificates,
  getAllCertificates,
} = require("../controller/medicalCertificate.controller");

const router = express.Router();

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "../uploads/medical-certificates");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only PDF and Images (JPG, PNG) are allowed."));
    }
  },
});

// Routes
router.post("/upload", upload.single("document"), uploadCertificate);
router.get("/employee/:employeeId", getEmployeeCertificates);
router.get("/all", getAllCertificates);

module.exports = router;
