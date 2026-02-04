const JobPost = require("../models/JobPost");
const Notification = require("../models/Notification"); // Adjusted based on file name
const crypto = require("crypto");

// 🟢 Create Job Post
const createJobPost = async (req, res) => {
    try {
        const { role, responsibilities, skills, salary, assessmentId } = req.body;

        // Generate a unique identifier for the link
        const uniqueId = crypto.randomBytes(4).toString("hex");
        const link = `/jobs/${uniqueId}`;

        const jobPost = new JobPost({
            role,
            responsibilities,
            skills,
            salary,
            assessmentId: assessmentId || null, // Handle empty string from frontend
            link,
        });

        await jobPost.save();

        // Trigger Notification for Admin
        try {
            await Notification.create({
                userId: "ADMIN",
                role: "admin",
                title: "New Job Posted",
                message: `A new job post for "${role}" has been created.`,
                type: "general",
            });
        } catch (notifErr) {
            console.error("Failed to create notification:", notifErr);
        }

        res.status(201).json({ success: true, message: "Job post created successfully", jobPost });
    } catch (error) {
        console.error("Job Post Creation Error:", error);
        res.status(500).json({
            success: false,
            message: error.message,
            detail: error.errors // Include mongoose validation errors if any
        });
    }
};

// 🟢 Get All Job Posts
const getAllJobPosts = async (req, res) => {
    try {
        const jobPosts = await JobPost.find().populate("assessmentId").sort({ createdAt: -1 });
        res.status(200).json({ success: true, jobPosts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 🟢 Get Job Post by Unique ID (for public view)
const getJobPostByLink = async (req, res) => {
    try {
        const { id } = req.params;
        const jobPost = await JobPost.findOne({ link: `/jobs/${id}` }).populate("assessmentId");

        if (!jobPost) {
            return res.status(404).json({ success: false, message: "Job post not found" });
        }

        res.status(200).json({ success: true, jobPost });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { createJobPost, getAllJobPosts, getJobPostByLink };
