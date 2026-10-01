const multer = require('multer');
const path = require('path');
const fs = require('fs');

const LETTER_UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'letters');
if (!fs.existsSync(LETTER_UPLOAD_DIR)) {
    fs.mkdirSync(LETTER_UPLOAD_DIR, { recursive: true });
}

const letterStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, LETTER_UPLOAD_DIR),
    filename: (req, file, cb) => {
        const empId = (req.body?.employeeId || 'emp').toString().replace(/[^a-zA-Z0-9_-]/g, '');
        const type = (req.body?.letterType || 'letter').toString().replace(/[^a-zA-Z0-9_-]/g, '');
        cb(null, `${type}-${empId}-${Date.now()}.pdf`);
    }
});

const uploadLetter = multer({
    storage: letterStorage,
    limits: { fileSize: 25 * 1024 * 1024 }, // ✅ 10 MB → 25 MB
    fileFilter: (req, file, cb) => {
        if (
            file.mimetype === 'application/pdf' ||
            (file.originalname || '').toLowerCase().endsWith('.pdf')
        ) {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'));
        }
    }
});

module.exports = {
    uploadLetterSingle: uploadLetter.single('letterPdf'),
    LETTER_UPLOAD_DIR,
};