// const express = require("express");
// const {
//   addEmployee,
//   getEmployees,
//   getEmployeeByEmail,
//   loginEmployee,
//  getEmployeeAttendanceSummary,
//  employeeController,
// } = require("../controller/employee.controller");

// const router = express.Router();

// // ➕ Add a new employee
// router.post("/add-employee", addEmployee);

// // 📋 Get all employees
// router.get("/get-employees", getEmployees);

// // 🔍 Get single employee by email (for dashboard)
// router.get("/get-employee", getEmployeeByEmail);

// // 🔐 Employee login
// router.post("/login", loginEmployee);

// // 📊 Get attendance summary
// router.get("/attendance-summary", getEmployeeAttendanceSummary); // ✅ add this route
// // ✅ Add this new route
// router.put("/assign-location/:employeeId", employeeController.assignLocation);
// module.exports = router;
// const express = require("express");
// const {
//   addEmployee,
//   getEmployees,
//   getEmployeeByEmail,
//   loginEmployee,
//   getEmployeeAttendanceSummary,
//   assignLocation,
//   getAssignedLocationByEmployeeId, // ✅ add this instead
//   updateEmployee, // ✅ ADD THIS
//   deleteEmployee, // ✅ ADD THIS
// } = require("../controller/employee.controller");

// const router = express.Router();

// // ➕ Add a new employee
// router.post("/add-employee", addEmployee);

// // 📋 Get all employees
// router.get("/get-employees", getEmployees);

// // 🔍 Get single employee by email (for dashboard)
// router.get("/get-employee", getEmployeeByEmail);

// // 🔐 Employee login
// router.post("/login", loginEmployee);

// // 📊 Get attendance summary
// router.get("/attendance-summary", getEmployeeAttendanceSummary);

// // ✅ Assign location to employee
// router.put("/assign-location/:employeeId", assignLocation);
// router.get("/mylocation/:employeeId", getAssignedLocationByEmployeeId);


// router.put("/update/:id", updateEmployee); // ✅ ADD THIS
// router.delete("/delete-employee/:id", deleteEmployee); // ✅ ADD THIS

// module.exports = router;



// const express = require("express");
// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");

// // Ensure upload directory exists for employee experiences
// const uploadDir = path.join(__dirname, "../uploads/employee-experience");
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }

// // Configure Multer for document uploads
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, uploadDir);
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
//     cb(null, uniqueSuffix + path.extname(file.originalname));
//   }
// });

// const upload = multer({
//   storage: storage,
//   limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
//   fileFilter: (req, file, cb) => {
//     const allowedMimes = [
//       'application/pdf',
//       'image/jpeg',
//       'image/jpg',
//       'image/png',
//       'application/msword',
//       'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
//     ];

//     if (allowedMimes.includes(file.mimetype)) {
//       cb(null, true);
//     } else {
//       cb(new Error(`File type not allowed. Allowed types: PDF, JPG, PNG, DOC, DOCX`));
//     }
//   }
// });

// const {
//   addEmployee,
//   getEmployees,
//   getEmployeeByEmail,
//   getEmployeeByPhone, // ✅ New route
//   loginEmployee,
//   getEmployeeAttendanceSummary,
//   assignLocation,
//   getAssignedLocationByEmployeeId,
//   updateEmployee,
//   deleteEmployee,
//   submitResignation, // ✅ New method
//   addEmployeeExperience,
//   getEmployeeExperiences,
//   getEmployeeCandidateDocuments,
//   getEmployeeLetters,
//   getBirthdaysToday,
//   getAnniversariesToday, // ✅ Added this
// } = require("../controller/employee.controller");

// const router = express.Router();

// // 🏆 Anniversaries (NEW)
// router.get("/anniversaries-today", getAnniversariesToday);

// // 🎂 Birthdays (NEW)
// router.get("/birthdays-today", getBirthdaysToday);

// // ➕ Add a new employee
// router.post("/add-employee", addEmployee);

// // 📋 Get all employees
// router.get("/get-employees", getEmployees);

// // 🔍 Get single employee by email (for dashboard)
// router.get("/get-employee", getEmployeeByEmail);

// // 🔍 Get employee by phone number (NEW)
// router.get("/get-employee-by-phone", getEmployeeByPhone);

// // 🔐 Employee login
// router.post("/login", loginEmployee);

// // 📊 Get attendance summary
// router.get("/attendance-summary", getEmployeeAttendanceSummary);

// // ✅ Assign location to employee
// router.put("/assign-location/:employeeId", assignLocation);
// router.get("/mylocation/:employeeId", getAssignedLocationByEmployeeId);

// // ✅ Update employee
// router.put("/update/:id", updateEmployee);

// // ✅ Delete employee
// router.delete("/delete-employee/:id", deleteEmployee);

// // ✅ Submit resignation (NEW)
// router.post("/submit-resignation", submitResignation);

// // ✅ Employee Experience Routes (NEW)
// router.post(
//   "/experience",
//   upload.fields([{ name: 'offerLetter', maxCount: 1 }, { name: 'payslip', maxCount: 1 }]),
//   addEmployeeExperience
// );
// router.get("/experience/:employeeId", getEmployeeExperiences);
// router.get("/candidate-documents/:employeeId", getEmployeeCandidateDocuments);
// router.get("/letters/:employeeId", getEmployeeLetters);

// module.exports = router;


const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ═══════════════════════════════════════════════════════════
// ✅✅✅ UPLOADS ROOT — MUST MATCH server.js ⚠️⚠️⚠️
// ═══════════════════════════════════════════════════════════
// Uses __dirname which points to /routes folder.
// So path.join(__dirname, "..", "uploads") = backend root / uploads
//
const UPLOADS_ROOT = process.env.UPLOADS_ROOT || path.join(__dirname, "..", "uploads");

console.log("📁 [ROUTES] Uploads root:", UPLOADS_ROOT);
console.log("📁 [ROUTES] Exists:", fs.existsSync(UPLOADS_ROOT));

// ═══════════════════════════════════════════════════════════
// ═══ MULTER CONFIG: EMPLOYEE EXPERIENCE UPLOADS ════════════
// ═══════════════════════════════════════════════════════════
const uploadDir = path.join(UPLOADS_ROOT, "employee-experience");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => { cb(null, uploadDir); },
  filename: (req, file, cb) => { cb(null, Date.now() + "-" + Math.round(Math.random() * 1E9) + path.extname(file.originalname)); }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    allowedMimes.includes(file.mimetype) ? cb(null, true) : cb(new Error(`File type not allowed. Allowed types: PDF, JPG, PNG, DOC, DOCX`));
  }
});

// ═══════════════════════════════════════════════════════════
// ═══ MULTER CONFIG: FACE UPLOADS ═══════════════════════════
// ═══════════════════════════════════════════════════════════
const faceUploadDir = path.join(UPLOADS_ROOT, "faces");
if (!fs.existsSync(faceUploadDir)) {
  fs.mkdirSync(faceUploadDir, { recursive: true });
}

const faceStorage = multer.diskStorage({
  destination: (req, file, cb) => { cb(null, faceUploadDir); },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + "-" + Math.round(Math.random() * 1E9) + ext);
  }
});

const faceUpload = multer({
  storage: faceStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png'];
    allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Only JPEG, JPG, PNG allowed'));
  }
});

// ═══════════════════════════════════════════════════════════
// ═══ ✅ EMPLOYEE DOCUMENTS (PAN / Aadhaar) MULTER CONFIG ════
// ═══════════════════════════════════════════════════════════
const employeeDocsDir = path.join(UPLOADS_ROOT, "employee-documents");
console.log("📁 [ROUTES] Employee docs folder path:", employeeDocsDir);

if (!fs.existsSync(employeeDocsDir)) {
  fs.mkdirSync(employeeDocsDir, { recursive: true });
  console.log("📁 [ROUTES] Created employee-documents folder");
} else {
  console.log("✅ [ROUTES] Employee-documents folder already exists");
}

// ✅ SANITIZE FUNCTION
const sanitizeBaseName = (originalName) => {
  const ext = path.extname(originalName);
  let base = path.basename(originalName, ext);
  base = base.replace(/[^a-zA-Z0-9]/g, "_");
  base = base.replace(/_+/g, "_");
  base = base.replace(/^_+|_+$/g, "");
  base = base.slice(0, 30);
  if (!base) base = "file";
  return base;
};

const employeeDocStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("🎯 [MULTER] Upload destination:", employeeDocsDir);
    console.log("🎯 [MULTER] Original filename:", file.originalname);
    if (!fs.existsSync(employeeDocsDir)) {
      fs.mkdirSync(employeeDocsDir, { recursive: true });
    }
    cb(null, employeeDocsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanBase = sanitizeBaseName(file.originalname);
    const timestamp = Date.now();
    const randomHex = Math.floor(Math.random() * 0xFFFFFFFF).toString(16);
    const finalName = `${cleanBase}-${timestamp}-${randomHex}${ext}`;
    console.log("📝 [MULTER] Final filename:", finalName);
    cb(null, finalName);
  }
});

const employeeDocUpload = multer({
  storage: employeeDocStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp'
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, JPG, JPEG, PNG, WEBP files are allowed'));
    }
  }
});

// ═══════════════════════════════════════════════════════════
// ═══ CONTROLLERS ════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════
const {
  addEmployee, getEmployees, getEmployeeByEmail, getEmployeeByPhone,
  loginEmployee, getEmployeeAttendanceSummary, assignLocation,
  getAssignedLocationByEmployeeId, updateEmployee, deleteEmployee,
  submitResignation, addEmployeeExperience, getEmployeeExperiences,
  getEmployeeCandidateDocuments, getEmployeeLetters, getBirthdaysToday,
  getAnniversariesToday, convertEmployeeIdsToTH, applyEmployeeSalaryIncrement,
  applySalaryIncrement, getEmployeeSalaryForDate, getSalaryIncrementHistory,
  getSalaryTimeline, getAllEmployeesSalaryStatus, applyPendingIncrements,
  fixEmployeeCurrentSalary, forgotPassword, resetPassword, claimOT,
  getAllOTClaimsWithDetails, updateOTClaimStatus, getClaimedOTByEmployee,
  raiseIssue,
  getAllIssues,
  getEmployeeIssues,
  updateIssue,
  deleteIssue,
  uploadEmployeeFace,
  verifyFace,
  updateLocation,
  getLocation,
  getAllEmployeeLocations,
  updateImageCaptureAttendance,
  getAllEmployeesForCresol,
  uploadEmployeeDocument,
  deleteEmployeeDocument
} = require("../controller/employee.controller");

const router = express.Router();

// ==================== EXISTING ROUTES ====================
router.get("/anniversaries-today", getAnniversariesToday);
router.get("/birthdays-today", getBirthdaysToday);
router.post("/add-employee", addEmployee);
router.get("/get-employees", getEmployees);
router.get("/get-employeesforcresol", getAllEmployeesForCresol);
router.get("/get-employee", getEmployeeByEmail);
router.get("/get-employee-by-phone", getEmployeeByPhone);
router.post("/login", loginEmployee);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/attendance-summary", getEmployeeAttendanceSummary);
router.put("/assign-location/:employeeId", assignLocation);
router.get("/mylocation/:employeeId", getAssignedLocationByEmployeeId);
router.put("/update/:id", updateEmployee);
router.delete("/delete-employee/:id", deleteEmployee);
router.post("/submit-resignation", submitResignation);
router.post("/experience", upload.fields([{ name: 'offerLetter', maxCount: 1 }, { name: 'payslip', maxCount: 1 }]), addEmployeeExperience);
router.get("/experience/:employeeId", getEmployeeExperiences);
router.get("/candidate-documents/:employeeId", getEmployeeCandidateDocuments);
router.get("/letters/:employeeId", getEmployeeLetters);

// ==================== SALARY INCREMENT ROUTES ====================
router.put("/:id/salary-increment", applySalaryIncrement);
router.get("/:id/salary-for-date", getEmployeeSalaryForDate);
router.get("/:id/salary-history", getSalaryIncrementHistory);
router.get("/:id/salary-timeline", getSalaryTimeline);
router.get("/salary-status/all", getAllEmployeesSalaryStatus);
router.post("/salary/apply-pending-increments", applyPendingIncrements);
router.post("/:id/fix-salary", fixEmployeeCurrentSalary);

router.put('/convert-ids', convertEmployeeIdsToTH);

router.put('/applysalary-increment/:id', applyEmployeeSalaryIncrement);
router.post('/claimot', claimOT);
router.get('/allotclaimed', getAllOTClaimsWithDetails);
router.put('/update-otclaimedstatus/:id', updateOTClaimStatus);
router.get('/employeeotclaimed/:employeeId', getClaimedOTByEmployee);

// ==================== ISSUE ROUTES ====================
router.post("/raise-issue/:employeeId", raiseIssue);
router.get("/get-all-issues", getAllIssues);
router.get("/get-employee-issues/:employeeId", getEmployeeIssues);
router.put("/update-issue/:issueId", updateIssue);
router.delete("/delete-issue/:issueId", deleteIssue);

// ==================== FACE ROUTES ====================
router.post("/upload-face", faceUpload.single('image'), uploadEmployeeFace);
router.post("/verify-face", faceUpload.single('image'), verifyFace);

// ==================== LOCATION ROUTES ====================
router.put('/update-location/:employeeId', updateLocation);
router.get('/get-location/:employeeId', getLocation);
router.get("/employee-locations", getAllEmployeeLocations);
router.put('/update-image-capture', updateImageCaptureAttendance);

// =====================================================
// ✅ EMPLOYEE DOCUMENT ROUTES (PAN / Aadhaar)
// =====================================================
router.post(
  "/upload-document",
  employeeDocUpload.single("file"),
  uploadEmployeeDocument
);

router.post("/delete-document", deleteEmployeeDocument);

module.exports = router;