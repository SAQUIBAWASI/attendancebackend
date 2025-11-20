const express = require("express");
const router = express.Router();

const {
  saveSummary,
  getSummary
} = require("../controller/attendanceSummary.controller");

router.post("/save", saveSummary);
router.get("/get", getSummary);

module.exports = router;
