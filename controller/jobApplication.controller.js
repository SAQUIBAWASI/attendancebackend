const JobApplication = require("../models/JobApplication");
const JobPost = require("../models/JobPost");

// Submit Job Application
const submitApplication = async (req, res) => {
    try {
        const {
            jobId,
            firstName,
            lastName,
            email,
            mobile,
            dob,
            highestQualification,
            experience,
            currentCTC,
            expectedCTC,
            noticePeriod,
            currentLocation
        } = req.body;

        console.log(`[DEBUG] Received Application for JobID: ${jobId}`);
        console.log(`[DEBUG] Resume File:`, req.file ? req.file.path : "Missing");

        if (!req.file) {
            return res.status(400).json({ success: false, message: "Resume is required" });
        }

        // Verify if Job exists
        const job = await JobPost.findById(jobId);
        if (!job) {
            console.error(`[ERROR] Job not found for ID: ${jobId}`);
            return res.status(404).json({ success: false, message: `Job post not found in database for ID: ${jobId}` });
        }

        const newApplication = new JobApplication({
            jobId,
            firstName,
            lastName,
            email,
            mobile,
            dob,
            highestQualification,
            experience,
            currentCTC,
            expectedCTC,
            noticePeriod,
            currentLocation,
            resume: req.file.path // Store the path of the uploaded file
        });

        await newApplication.save();

        res.status(201).json({
            success: true,
            message: "Application submitted successfully!",
            application: newApplication
        });
    } catch (error) {
        console.error("Application Submission Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all applications (Admin only)
const getAllApplications = async (req, res) => {
    try {
        const applications = await JobApplication.find().populate("jobId", "role").sort({ appliedAt: -1 });
        res.status(200).json({ success: true, applications });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get applications by Job ID
const getApplicationsByJobId = async (req, res) => {
    try {
        const { jobId } = req.params;
        const applications = await JobApplication.find({ jobId }).sort({ appliedAt: -1 });
        res.status(200).json({ success: true, applications });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    submitApplication,
    getAllApplications,
    getApplicationsByJobId
};
