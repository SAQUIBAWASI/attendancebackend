const express = require("express");
const router = express.Router();
const {
    createJobPost,
    getAllJobPosts,
    getJobPostByLink,
    updateJobPost,
    deleteJobPost
} = require("../controller/jobPost.controller");

router.post("/create", createJobPost);
router.get("/all", getAllJobPosts);
router.get("/view/:id", getJobPostByLink);
router.put("/:id", updateJobPost);
router.delete("/:id", deleteJobPost);
router.get("/test", (req, res) => res.send("Job post router is active"));

module.exports = router;
