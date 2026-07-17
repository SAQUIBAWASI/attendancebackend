const express = require("express");
const { registerAdmin, loginAdmin, getAllQuizes, addBulkQuizzes, createAssessment, updateAssessment, deleteAssessment,
createQR,
getAllQRs,
updateQR,
deleteQR,
updateCompanyIP,
getAllCompanyIPs
 } = require("../controller/adminController");
const router = express.Router();


router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.get("/getallquizes", getAllQuizes);
router.post("/add-bulkquizzes", addBulkQuizzes);
router.post("/assessments", createAssessment);
router.put("/assessments/:id", updateAssessment);
router.delete("/assessments/:id", deleteAssessment);

router.post("/update-ip", updateCompanyIP);
router.get("/get-ips", getAllCompanyIPs);

// Routes
router.post('/createqr', createQR);          // CREATE
router.get('/getallqrs', getAllQRs);             // READ ALL
router.put('/updateqr/:id', updateQR);              // UPDATE
router.delete('/deleteqr/:id', deleteQR);           // DELETE

module.exports = router;

