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

// Ensure upload directory exists for employee experiences
const uploadDir = path.join(__dirname, "../uploads/employee-experience");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer for document uploads
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



// ─── Ensure upload directory exists for faces ───
const faceUploadDir = path.join(__dirname, "../uploads/faces");
if (!fs.existsSync(faceUploadDir)) {
  fs.mkdirSync(faceUploadDir, { recursive: true });
}

// ─── Multer config for face uploads ───
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

const {
  addEmployee, getEmployees, getEmployeeByEmail, getEmployeeByPhone,
  loginEmployee, getEmployeeAttendanceSummary, assignLocation,
  getAssignedLocationByEmployeeId, updateEmployee, deleteEmployee,
  submitResignation, addEmployeeExperience, getEmployeeExperiences,
  getEmployeeCandidateDocuments, getEmployeeLetters, getBirthdaysToday,
  getAnniversariesToday, convertEmployeeIdsToTH, applyEmployeeSalaryIncrement,
  // 🆕 Salary increment controllers
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
  getLocation
} = require("../controller/employee.controller");

const router = express.Router();

// ==================== EXISTING ROUTES ====================
router.get("/anniversaries-today", getAnniversariesToday);
router.get("/birthdays-today", getBirthdaysToday);
router.post("/add-employee", addEmployee);
router.get("/get-employees", getEmployees);
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

// ==================== 🆕 SALARY INCREMENT ROUTES ====================
router.put("/:id/salary-increment", applySalaryIncrement);
router.get("/:id/salary-for-date", getEmployeeSalaryForDate);
router.get("/:id/salary-history", getSalaryIncrementHistory);
router.get("/:id/salary-timeline", getSalaryTimeline);
router.get("/salary-status/all", getAllEmployeesSalaryStatus);
router.post("/salary/apply-pending-increments", applyPendingIncrements);
// Fix employee current salary (temporary fix for existing data)
router.post("/:id/fix-salary", fixEmployeeCurrentSalary);

router.put('/convert-ids', convertEmployeeIdsToTH);

// Apply salary increment
router.put('/applysalary-increment/:id', applyEmployeeSalaryIncrement);
router.post('/claimot', claimOT);
router.get('/allotclaimed', getAllOTClaimsWithDetails);
router.put('/update-otclaimedstatus/:id', updateOTClaimStatus);

router.get('/employeeotclaimed/:employeeId', getClaimedOTByEmployee);

// =====================================================
// ROUTES
// =====================================================

// Raise Issue
router.post("/raise-issue/:employeeId", raiseIssue);

// Get All Issues
router.get("/get-all-issues", getAllIssues);

// Get Employee Issues
router.get("/get-employee-issues/:employeeId", getEmployeeIssues);

// Update Issue
router.put("/update-issue/:issueId", updateIssue);

// Delete Issue
router.delete("/delete-issue/:issueId", deleteIssue);


// 1. Upload Face
router.post("/upload-face", faceUpload.single('image'), uploadEmployeeFace);

// 2. Verify Face
router.post("/verify-face", faceUpload.single('image'), verifyFace);


// ─── LOCATION ROUTES ───
// UPDATE location
router.put('/update-location/:employeeId', updateLocation);

// GET location
router.get('/get-location/:employeeId', getLocation);

module.exports = router;