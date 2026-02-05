const mongoose = require("mongoose");

const jobApplicationSchema = new mongoose.Schema(
    {
        jobId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "JobPost",
            required: true,
        },
        firstName: {
            type: String,
            required: true,
            trim: true,
        },
        lastName: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        mobile: {
            type: String,
            required: true,
            trim: true,
        },
        dob: {
            type: Date,
            required: true,
        },
        highestQualification: {
            type: String,
            required: true,
        },
        resume: {
            type: String, // Path to the uploaded resume
            required: true,
        },
        experience: {
            type: String, // e.g., "2 years"
        },
        currentCTC: {
            type: String,
        },
        expectedCTC: {
            type: String,
        },
        noticePeriod: {
            type: String,
        },
        currentLocation: {
            type: String,
        },
        status: {
            type: String,
            enum: ["Pending", "Shortlisted", "Rejected", "Hired"],
            default: "Pending",
        },
        appliedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("JobApplication", jobApplicationSchema);
