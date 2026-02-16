const express = require("express");
const router = express.Router();
const candidateController = require("../controller/candidate.controller");
// Middleware to verify JWT token for candidates
const candidateAuth = require("../middleware/candidateAuth");

// @route   POST api/candidate/register
// @desc    Register a candidate
// @access  Public
router.post("/register", candidateController.register);

// @route   POST api/candidate/login
// @desc    Login candidate
// @access  Public
router.post("/login", candidateController.login);

// @route   GET api/candidate/profile
// @desc    Get candidate profile
// @access  Private
router.get("/profile", candidateAuth, candidateController.getProfile);

// @route   PUT api/candidate/profile
// @desc    Update candidate profile
// @access  Private
router.put("/profile", candidateAuth, candidateController.updateProfile);

// @route   GET api/candidate/applications
// @desc    Get jobs applied by candidate
// @access  Private
router.get("/applications", candidateAuth, candidateController.getAppliedJobs);

// @route   POST api/candidate/check-existence
// @desc    Check if candidate exists by email
// @access  Public
router.post("/check-existence", candidateController.checkCandidateExists);

module.exports = router;
