const JobPost = require("../models/JobPost");
const Notification = require("../models/Notification"); // Adjusted based on file name
const crypto = require("crypto");

// 🟢 Create Job Post
const createJobPost = async (req, res) => {
    try {
        const { role, responsibilities, skills, salary, experience, assessmentIds } = req.body;

        console.log("=== CREATE JOB POST ===");
        console.log("Received assessmentIds:", assessmentIds);
        console.log("Type:", Array.isArray(assessmentIds) ? "Array" : typeof assessmentIds);
        console.log("Length:", assessmentIds?.length);

        // Generate a unique identifier for the link
        const uniqueId = crypto.randomBytes(4).toString("hex");
        const link = `/jobs/${uniqueId}`;

        const jobPost = new JobPost({
            role,
            responsibilities,
            skills,
            salary,
            experience,
            assessmentIds: assessmentIds || [],
            link,
        });

        console.log("JobPost object before save:", {
            role: jobPost.role,
            assessmentIds: jobPost.assessmentIds
        });

        await jobPost.save();


        console.log("JobPost saved successfully!");
        console.log("Saved assessmentIds:", jobPost.assessmentIds);

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
        const jobPosts = await JobPost.find().populate("assessmentIds").sort({ createdAt: -1 });

        res.status(200).json({ success: true, jobPosts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 🟢 Get Job Post by Unique ID (for public view)
const getJobPostByLink = async (req, res) => {
    try {
        const { id } = req.params;
        const jobPost = await JobPost.findOne({ link: `/jobs/${id}` }).populate("assessmentIds");


        if (!jobPost) {
            return res.status(404).json({ success: false, message: "Job post not found" });
        }

        res.status(200).json({ success: true, jobPost });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 🟢 Update Job Post
const updateJobPost = async (req, res) => {
    try {
        const { id } = req.params;
        const { role, responsibilities, skills, salary, experience, assessmentIds } = req.body;


        console.log("Updating Job ID:", id);
        console.log("Update Data:", req.body);
        console.log("AssessmentIds received:", assessmentIds);

        if (!id) {
            return res.status(400).json({ success: false, message: "Job post ID is required" });
        }

        const updatedJob = await JobPost.findByIdAndUpdate(
            id,
            {
                role,
                responsibilities,
                skills,
                salary,
                experience,
                assessmentIds: assessmentIds || [],
            },
            { new: true }
        ).populate("assessmentIds");

        console.log("Updated Job assessmentIds:", updatedJob.assessmentIds);



        if (!updatedJob) {
            console.log("Update failed: Job not found for ID", id);
            return res.status(404).json({ success: false, message: "Job post not found in database" });
        }

        console.log("Update successful");
        res.status(200).json({ success: true, message: "Job post updated successfully", jobPost: updatedJob });
    } catch (error) {
        console.error("Job Post Update Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 🟢 Delete Job Post
const deleteJobPost = async (req, res) => {
    try {
        const { id } = req.params;
        console.log("Attempting to delete Job ID:", id);

        if (!id) {
            return res.status(400).json({ success: false, message: "Job post ID is required" });
        }

        const deletedJob = await JobPost.findByIdAndDelete(id);

        if (!deletedJob) {
            console.log("Delete failed: Job not found for ID", id);
            return res.status(404).json({ success: false, message: "Job post not found in database" });
        }

        console.log("Delete successful");
        res.status(200).json({ success: true, message: "Job post deleted successfully" });
    } catch (error) {
        console.error("Job Post Delete Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { createJobPost, getAllJobPosts, getJobPostByLink, updateJobPost, deleteJobPost };
