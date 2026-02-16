const express = require("express");
const { registerAdmin, loginAdmin, getAllQuizes, addBulkQuizzes, createAssessment, updateAssessment, deleteAssessment } = require("../controller/adminController");
const router = express.Router();


router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.get("/getallquizes", getAllQuizes);
router.post("/add-bulkquizzes", addBulkQuizzes);
router.post("/assessments", createAssessment);
router.put("/assessments/:id", updateAssessment);
router.delete("/assessments/:id", deleteAssessment);

module.exports = router;

