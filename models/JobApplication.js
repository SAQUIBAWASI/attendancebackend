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
            trim: true,
        },
        lastName: {
            type: String,
            trim: true,
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
        },
        mobile: {
            type: String,
            trim: true,
        },
        dob: {
            type: Date,
        },
        highestQualification: {
            type: String,
        },
        resume: {
            type: String, // Path to the uploaded resume
        },
        experience: {
            type: String, // e.g., "2 years"
        },
        currentCTC: {
            type: String,
        },
        currentCompany: {
            type: String,
        },
        expectedCTC: {
            type: String,
        },
        noticePeriod: {
            type: String,
        },
        skills: {
            type: String,
        },
        candidateId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Candidate",
        },
        percentage: {
            type: String,
        },
        passingYear: {
            type: String,
        },
        address: {
            type: String,
        },
        dateOfJoining: {
            type: String,
        },
        currentLocation: {
            type: String,
        },
        status: {
            type: String,
            enum: ["Pending", "Shortlisted", "Interview", "Selected", "Rejected", "Hired", "OnHold"],
            default: "Pending",
        },
        // Score Card Fields
        appearanceScore: { type: Number, default: 0 },
        workKnowledge: { type: Number, default: 0 },
        technicalScore: { type: Number, default: 0 },
        inchargeScore: { type: Number, default: 0 },
        overallRating: { type: Number, default: 0 },
        comment: { type: String, default: "" },

        // Interview Invitation Fields
        interviewSubject: { type: String, default: "" },
        interviewTime: { type: String, default: "" },
        interviewStatus: {
            type: String,
            enum: ["Not Invited", "Invited", "Rescheduled"],
            default: "Not Invited"
        },

        assessmentResults: [
            {
                quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },
                score: Number,
                totalQuestions: Number,
                attemptedAt: { type: Date, default: Date.now }
            }
        ],
        assignedAssessmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Quiz",
        },

        // Offer Letter & Doc Verification
        offerLetter: { type: String, default: "" },
        offerSentAt: { type: Date },
        documentsVerified: {
            resume: { type: Boolean, default: false },
            idProof: { type: Boolean, default: false },
            academicCertificates: { type: Boolean, default: false },
            experienceLetter: { type: Boolean, default: false },
        },
        // Custom Agreement Workflow
        adminAgreements: { type: String, default: "" },
        adminAttachment: { type: String, default: "" },
        candidateAgreementsUpload: { type: String, default: "" },
        docReviewStatus: {
            type: String,
            enum: ["Not Sent", "Pending", "Accepted", "Rejected"],
            default: "Not Sent"
        },

        appliedAt: {
            type: Date,
            default: Date.now,
        },

    },
    { timestamps: true }
);


module.exports = mongoose.model("JobApplication", jobApplicationSchema);
