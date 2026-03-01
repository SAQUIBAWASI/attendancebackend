// const mongoose = require("mongoose");

// const jobApplicationSchema = new mongoose.Schema(
//     {
//         jobId: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: "JobPost",
//             required: true,
//         },
//         firstName: {
//             type: String,
//             trim: true,
//         },
//         lastName: {
//             type: String,
//             trim: true,
//         },
//         email: {
//             type: String,
//             trim: true,
//             lowercase: true,
//         },
//         mobile: {
//             type: String,
//             trim: true,
//         },
//         dob: {
//             type: Date,
//         },
//         highestQualification: {
//             type: String,
//         },
//         resume: {
//             type: String, // Path to the uploaded resume
//         },
//         experience: {
//             type: String, // e.g., "2 years"
//         },
//         currentCTC: {
//             type: String,
//         },
//         currentCompany: {
//             type: String,
//         },
//         expectedCTC: {
//             type: String,
//         },
//         noticePeriod: {
//             type: String,
//         },
//         skills: {
//             type: String,
//         },
//         candidateId: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: "Candidate",
//         },
//         percentage: {
//             type: String,
//         },
//         passingYear: {
//             type: String,
//         },
//         address: {
//             type: String,
//         },
//         dateOfJoining: {
//             type: String,
//         },
//         currentLocation: {
//             type: String,
//         },
//         status: {
//             type: String,
//             enum: ["Pending", "Shortlisted", "Interview", "Selected", "Rejected", "Hired", "OnHold"],
//             default: "Pending",
//         },
//         // Score Card Fields
//         appearanceScore: { type: Number, default: 0 },
//         workKnowledge: { type: Number, default: 0 },
//         technicalScore: { type: Number, default: 0 },
//         inchargeScore: { type: Number, default: 0 },
//         overallRating: { type: Number, default: 0 },
//         comment: { type: String, default: "" },

//         // Interview Invitation Fields
//         interviewSubject: { type: String, default: "" },
//         interviewTime: { type: String, default: "" },
//         interviewMode: { type: String, default: "" }, // Added this field
//         interviewStatus: {
//             type: String,
//             enum: ["Not Invited", "Invited", "Rescheduled"],
//             default: "Not Invited"
//         },

//         assessmentResults: [
//             {
//                 quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },
//                 score: Number,
//                 totalQuestions: Number,
//                 attemptedAt: { type: Date, default: Date.now }
//             }
//         ],
//         assignedAssessmentId: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: "Quiz",
//         },

//         // Offer Letter & Doc Verification
//         offerLetter: { type: String, default: "" },
//         offerSentAt: { type: Date },
//         documentsVerified: {
//             resume: { type: Boolean, default: false },
//             idProof: { type: Boolean, default: false },
//             academicCertificates: { type: Boolean, default: false },
//             experienceLetter: { type: Boolean, default: false },
//         },
//         // Custom Agreement Workflow
//         adminAgreements: { type: String, default: "" },
//         adminAttachment: { type: String, default: "" },
//         candidateAgreementsUpload: { type: String, default: "" },
//         docReviewStatus: {
//             type: String,
//             enum: ["Not Sent", "Pending", "Accepted", "Rejected"],
//             default: "Not Sent"
//         },

//         appliedAt: {
//             type: Date,
//             default: Date.now,
//         },

//     },
//     { timestamps: true }
// );


// module.exports = mongoose.model("JobApplication", jobApplicationSchema);


// const mongoose = require("mongoose");

// const jobApplicationSchema = new mongoose.Schema(
// {
//     jobId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "JobPost",
//         required: true,
//     },

//     firstName: { type: String, trim: true },
//     lastName: { type: String, trim: true },
//     email: { type: String, trim: true, lowercase: true },
//     mobile: { type: String, trim: true },
//     dob: { type: Date },

//     address: { type: String },
//     currentLocation: { type: String },

//     highestQualification: { type: String },
//     institution: { type: String },
//     department: { type: String },
//     percentage: { type: String },
//     passingYear: { type: String },

//     experience: { type: String },
//     companyName: { type: String },
//     role: { type: String },
//     currentCompany: { type: String },

//     currentCTC: { type: String },
//     expectedCTC: { type: String },
//     noticePeriod: { type: String },
//     dateOfJoining: { type: String },

//     skills: { type: String },
//     resume: { type: String },

//     candidateId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Candidate",
//     },

//     status: {
//         type: String,
//         enum: ["Pending", "Shortlisted", "Interview", "Selected", "Rejected", "Hired", "OnHold"],
//         default: "Pending",
//     },

// },
// { timestamps: true }
// );

// module.exports = mongoose.model("JobApplication", jobApplicationSchema);





const mongoose = require("mongoose");

const jobApplicationSchema = new mongoose.Schema(
    {
        // ================= BASIC JOB INFO =================
        jobId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "JobPost",
            required: true,
        },

        candidateId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Candidate",
        },

        // ================= PERSONAL DETAILS =================
        firstName: { type: String, trim: true },
        lastName: { type: String, trim: true },
        email: { type: String, trim: true, lowercase: true },
        mobile: { type: String, trim: true },
        dob: { type: Date },

        address: { type: String },
        currentLocation: { type: String },

        // ================= EDUCATION DETAILS =================
        highestQualification: { type: String },
        institution: { type: String },
        department: { type: String },
        percentage: { type: String },
        passingYear: { type: String },

        // ================= EXPERIENCE DETAILS =================
        experience: { type: String }, // e.g., "2 years"
        companyName: { type: String },
        role: { type: String },
        currentCompany: { type: String },

        currentCTC: { type: String },
        expectedCTC: { type: String },
        noticePeriod: { type: String },
        dateOfJoining: { type: String },

        skills: { type: String },
        resume: { type: String }, // File path

        // ================= APPLICATION STATUS =================
        status: {
            type: String,
            enum: [
                "Pending",
                "Shortlisted",
                "Interview",
                "Selected",
                "Rejected",
                "Hired",
                "OnHold",
                "Resigned"
            ],
            default: "Pending",
        },

        // ================= RESIGNATION SECTION =================
        resignationLetter: { type: String, default: "" },
        resignationSentAt: { type: Date },
        resignationStatus: {
            type: String,
            enum: ["Pending", "Approved", "Rejected"],
            default: "Pending"
        },

        // ================= INTERVIEW SCORE CARD =================
        appearanceScore: { type: Number, default: 0 },
        workKnowledge: { type: Number, default: 0 },
        technicalScore: { type: Number, default: 0 },
        inchargeScore: { type: Number, default: 0 },
        overallRating: { type: Number, default: 0 },
        comment: { type: String, default: "" },

        // ================= INTERVIEW INVITATION =================
        interviewSubject: { type: String, default: "" },
        interviewTime: { type: String, default: "" },
        interviewMode: { type: String, default: "" }, // Online / Offline

        interviewStatus: {
            type: String,
            enum: ["Not Invited", "Invited", "Rescheduled"],
            default: "Not Invited"
        },

        candidateInterviewStatus: {
            type: String,
            enum: ["Pending", "Confirmed", "Declined"],
            default: "Pending"
        },
        candidateInterviewNote: { type: String, default: "" },

        // ================= ASSESSMENT SECTION =================
        assessmentResults: [
            {
                quizId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Quiz"
                },
                score: { type: Number },
                totalQuestions: { type: Number },
                answers: [
                    {
                        questionText: String,
                        options: [String],
                        selectedOption: String,
                        correctAnswer: String,
                        isCorrect: Boolean,
                        marks: Number
                    }
                ],
                attemptedAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ],

        assignedAssessmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Quiz",
        },

        // ================= OFFER LETTER SECTION =================
        // ================= OFFER LETTER SECTION =================
        offerLetter: { type: String, default: "" },
        documentType: {
            type: String,
            enum: ["Offer", "Warning", "Appraisal", "Termination"],
            default: "Offer"
        },
        offerSentAt: { type: Date },

        documentHistory: [
            {
                content: String,
                documentType: {
                    type: String,
                    enum: ["Offer", "Warning", "Appraisal", "Termination"],
                },
                sentAt: { type: Date, default: Date.now }
            }
        ],

        // ================= DOCUMENT VERIFICATION =================
        documentsVerified: {
            resume: { type: Boolean, default: false },
            idProof: { type: Boolean, default: false },
            academicCertificates: { type: Boolean, default: false },
            experienceLetter: { type: Boolean, default: false },
        },

        // ================= AGREEMENT WORKFLOW =================
        adminAgreements: { type: String, default: "" },
        adminAttachment: { type: String, default: "" },
        candidateAgreementsUpload: { type: String, default: "" },

        docReviewStatus: {
            type: String,
            enum: ["Not Sent", "Pending", "Accepted", "Rejected"],
            default: "Not Sent"
        },

        // ================= APPLICATION DATE =================
        appliedAt: {
            type: Date,
            default: Date.now,
        }

    },
    { timestamps: true }
);

module.exports = mongoose.model("JobApplication", jobApplicationSchema);
