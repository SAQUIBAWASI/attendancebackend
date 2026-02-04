const express = require("express");
const { createJobPost, getAllJobPosts, getJobPostByLink } = require("../controller/jobPost.controller");
const router = express.Router();

router.post("/create", createJobPost);
router.get("/all", getAllJobPosts);
router.get("/view/:id", getJobPostByLink);

module.exports = router;
