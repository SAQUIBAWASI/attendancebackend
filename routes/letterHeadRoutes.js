const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  addLetterHead,
  getAllLetterHeads,
  updateLetterHead,
  deleteLetterHead
} = require('../controller/letterHeadController');

// ============ MULTER ============
const uploadDir = 'uploads/letterheads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `letterhead-${uniqueSuffix}${ext}`);
  }
});

// ✅ Accept both images and PDF
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg', 
    'image/png', 
    'image/gif', 
    'image/webp', 
    'image/svg+xml',
    'application/pdf'  // ✅ PDF allowed
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only images and PDF files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB (PDF can be larger)
  fileFilter: fileFilter
});

// ============ ROUTES ============
router.get('/getallheaders', getAllLetterHeads);
router.post('/addheaders', upload.single('letterhead'), addLetterHead);
router.put('/updateheader/:id', upload.single('letterhead'), updateLetterHead);
router.delete('/deleteheader/:id', deleteLetterHead);

module.exports = router;