const express = require("express");
const { registerAdmin, loginAdmin, getAllQuizes } = require("../controller/adminController");
const router = express.Router();

router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.get("/getallquizes", getAllQuizes);

module.exports = router;
