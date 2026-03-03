const JobApplication = require("../models/JobApplication");
const JobPost = require("../models/jobPost");
const fs = require('fs');
const mongoose = require("mongoose");


// Submit Job Application
// const submitApplication = async (req, res) => {
//     let newApplication;
//     try {
//         const {
//             jobId,
//             firstName,
//             lastName,
//             email,
//             mobile,
//             dob,
//             gender,
//             highestQualification,
//             experience,
//             currentCTC,
//             expectedCTC,
//             noticePeriod,
//             currentLocation,
//             skills,
//             percentage,
//             passingYear,
//             address,
//             dateOfJoining,
//             currentCompany,
//             candidateId
//         } = req.body;

//         console.log(`[DEBUG] Received Application for JobID: ${jobId}`);
//         // ... (logs)



//         // Verify if Job exists
//         const job = await JobPost.findById(jobId);
//         if (!job) {
//             console.error(`[ERROR] Job not found for ID: ${jobId}`);
//             return res.status(404).json({ success: false, message: `Job post not found in database for ID: ${jobId}` });
//         }

//         // Optional: Check if candidate has already applied (if candidateId is provided)
//         const sanitizedCandidateId = candidateId && candidateId !== 'undefined' ? candidateId : null;

//         if (sanitizedCandidateId) {
//             const existingApp = await JobApplication.findOne({ jobId, candidateId: sanitizedCandidateId });
//             if (existingApp) return res.status(400).json({ message: "You have already applied for this job." });
//         }

//         newApplication = new JobApplication({
//             jobId,
//             firstName,
//             lastName,
//             email,
//             mobile,
//             dob,
//             gender,
//             highestQualification,
//             experience,
//             currentCTC,
//             expectedCTC,
//             noticePeriod,
//             currentLocation,
//             skills,
//             percentage,
//             passingYear,
//             address,
//             dateOfJoining,
//             currentCompany,
//             resume: req.file ? (req.file.path.includes("uploads") ? "uploads/" + req.file.path.split(/uploads[\\/]/).pop().replace(/\\/g, "/") : req.file.path.replace(/\\/g, "/")) : null, // Store relative path
//             candidateId: sanitizedCandidateId
//         });


//         await newApplication.save();

//         res.status(201).json({
//             success: true,
//             message: "Job application submitted successfully",
//             application: newApplication,
//             applicationId: newApplication._id
//         });
//     } catch (error) {
//         console.error("=== APPLICATION SUBMISSION ERROR ===");
//         console.error("Error Message:", error.message);
//         console.error("Error Stack:", error.stack);

//         // Return full error details to client for debugging
//         res.status(500).json({
//             success: false,
//             message: error.message,
//             stack: error.stack,
//             validation: error.errors ? Object.keys(error.errors).map(key => ({
//                 field: key,
//                 message: error.errors[key].message
//             })) : null,
//             bodyReceived: req.body
//         });
//     }

// };

const submitApplication = async (req, res) => {
    try {
        console.log("[DEBUG] Submit Application Body:", req.body);
        const {
            jobId,
            firstName,
            lastName,
            email,
            mobile,
            dob,
            highestQualification,
            institution,
            department,
            percentage,
            passingYear,
            address,
            currentLocation,
            totalExperience,
            companyName,
            role,
            currentCTC,
            expectedCTC,
            noticePeriod,
            dateOfJoining,
            currentCompany,
            skills,
            candidateId
        } = req.body;

        // Check job exists
        const job = await JobPost.findById(jobId);
        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found"
            });
        }

        // Prevent duplicate apply
        const sanitizedCandidateId =
            candidateId && candidateId !== "undefined"
                ? candidateId
                : null;

        if (sanitizedCandidateId) {
            const existingApp = await JobApplication.findOne({
                jobId,
                candidateId: sanitizedCandidateId
            });

            if (existingApp) {
                return res.status(400).json({
                    success: false,
                    message: "You already applied for this job"
                });
            }
        }

        const newApplication = new JobApplication({
            jobId,
            firstName,
            lastName,
            email,
            mobile,
            dob,
            highestQualification,
            institution,
            department,
            percentage,
            passingYear,
            address,
            currentLocation,
            experience: totalExperience, // mapped
            companyName,
            role,
            currentCTC,
            expectedCTC,
            noticePeriod,
            dateOfJoining,
            currentCompany,
            skills,
            resume: req.file
                ? req.file.path.replace(/\\/g, "/")
                : null,
            candidateId: sanitizedCandidateId
        });

        await newApplication.save();

        return res.status(201).json({
            success: true,
            message: "Application submitted successfully",
            application: newApplication
        });

    } catch (error) {
        console.error("[ERROR] APPLICATION SUBMISSION FAILURE:", error);

        return res.status(500).json({
            success: false,
            message: "Application Submission Failed: " + error.message
        });
    }
};


// Get all applications (Admin only)
const getAllApplications = async (req, res) => {
    try {
        const applications = await JobApplication.find()
            .populate("jobId", "role")
            .populate("candidateId", "name email phone")
            .populate("assessmentResults.quizId", "title questions")
            .sort({ appliedAt: -1 });
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

const submitAssessment = async (req, res) => {
    try {
        const { applicationId, quizId, score, totalQuestions } = req.body;

        console.log("=== SUBMIT ASSESSMENT DEBUG ===");
        console.log("Body:", req.body);

        if (!applicationId || !quizId) {
            return res.status(400).json({ success: false, message: "Application ID and Quiz ID are required" });
        }

        const application = await JobApplication.findById(applicationId);
        if (!application) {
            console.error(`[ERROR] Application not found for ID: ${applicationId}`);
            return res.status(404).json({ success: false, message: "Application not found" });
        }

        // Add result
        application.assessmentResults.push({
            quizId,
            score,
            totalQuestions,
            answers: req.body.answers || [] // Save detailed answers if provided
        });
        await application.save();

        console.log("Assessment saved for Application:", applicationId);

        res.status(200).json({ success: true, message: "Assessment result saved successfully" });
    } catch (error) {
        console.error("Submit Assessment Error:", error);
        res.status(500).json({
            success: false,
            message: error.message,
            stack: error.stack,
            bodyReceived: req.body
        });
    }
};



// Update Application Score & Status
const updateApplicationScore = async (req, res) => {
    try {
        const { applicationId, appearanceScore, workKnowledge, technicalScore, inchargeScore, overallRating, comment, status, assignedAssessmentId } = req.body;

        if (!applicationId) {
            return res.status(400).json({ success: false, message: "Application ID is required" });
        }

        const application = await JobApplication.findById(applicationId);
        if (!application) {
            return res.status(404).json({ success: false, message: "Application not found" });
        }

        // Update fields
        if (appearanceScore !== undefined) application.appearanceScore = appearanceScore;
        if (workKnowledge !== undefined) application.workKnowledge = workKnowledge;
        if (technicalScore !== undefined) application.technicalScore = technicalScore;
        if (inchargeScore !== undefined) application.inchargeScore = inchargeScore;
        if (overallRating !== undefined) application.overallRating = overallRating;
        if (comment !== undefined) application.comment = comment;
        if (status !== undefined) application.status = status;
        if (assignedAssessmentId !== undefined) application.assignedAssessmentId = assignedAssessmentId;

        await application.save();

        res.status(200).json({ success: true, message: "Score updated successfully", application });
    } catch (error) {
        console.error("Update Score Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ Send Interview Invitation
const sendInterviewInvitation = async (req, res) => {
    console.log("✅ [BACKEND DEBUG] Received sendInterviewInvitation request");
    console.log("Body:", req.body);
    try {
        const { applicationId, interviewSubject, interviewTime, interviewMode } = req.body;

        if (!applicationId || !interviewSubject || !interviewTime) {
            console.log("❌ Missing fields:", { applicationId, interviewSubject, interviewTime });
            return res.status(400).json({ success: false, message: "Application ID, Subject, and Time are required" });
        }

        const application = await JobApplication.findById(applicationId);
        if (!application) {
            console.log("❌ Application NOT found in DB for ID:", applicationId);
            return res.status(404).json({ success: false, message: "DEBUG: Application not found in database" });
        }

        application.interviewSubject = interviewSubject;
        application.interviewTime = interviewTime;
        if (interviewMode) {
            console.log("📝 [BACKEND] Saving interviewMode:", interviewMode);
            application.interviewMode = interviewMode;
        } else {
            console.log("⚠️ [BACKEND] No interviewMode received in request body");
        }
        application.interviewStatus = "Invited";
        application.candidateInterviewStatus = "Pending";
        application.candidateInterviewNote = "";

        const savedApp = await application.save();
        console.log("✅ [BACKEND] Application saved successfully. Persisted interviewMode:", savedApp.interviewMode);

        res.status(200).json({
            success: true,
            message: "Interview invitation saved and sent to candidate's dashboard!",
            application: savedApp
        });
    } catch (error) {
        console.error("Send Invitation Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ Send Offer Letter
const sendOfferLetter = async (req, res) => {
    console.log("✅ [BACKEND DEBUG] Received sendOfferLetter request");
    try {
        const { applicationId, email, offerLetterContent, documentsVerified, documentType } = req.body;

        if (!applicationId || !offerLetterContent) {
            return res.status(400).json({ success: false, message: "Application ID and Content are required" });
        }

        const application = await JobApplication.findById(applicationId);
        if (!application) {
            return res.status(404).json({ success: false, message: "Application not found" });
        }

        application.offerLetter = offerLetterContent;
        application.documentType = documentType || "Offer";
        application.offerSentAt = new Date();
        application.documentsVerified = documentsVerified;

        // Add to history
        if (!application.documentHistory) {
            application.documentHistory = [];
        }
        application.documentHistory.push({
            content: offerLetterContent,
            documentType: documentType || "Offer",
            sentAt: new Date()
        });

        // Only update status to Selected if it's an actual Offer Letter
        if (application.documentType === "Offer") {
            application.status = "Selected";
        }

        await application.save();

        // 📧 MOCK EMAIL SENDING (Replace with actual Nodemailer logic if needed)
        console.log("---------------------------------------------------");
        console.log(`📧 SENDING OFFER LETTER TO: ${email}`);
        console.log(`📜 CONTENT PREVIEW: ${offerLetterContent.substring(0, 50)}...`);
        console.log("---------------------------------------------------");

        res.status(200).json({
            success: true,
            message: "Offer letter saved and sent (Mock) successfully!",
            application
        });
    } catch (error) {
        console.error("Send Offer Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ Send Agreements (Admin -> Candidate)
const sendAgreements = async (req, res) => {
    try {
        const { applicationId, agreementsContent } = req.body;
        if (!applicationId) {
            return res.status(400).json({ success: false, message: "Application ID is required" });
        }

        const application = await JobApplication.findById(applicationId);
        if (!application) return res.status(404).json({ success: false, message: "Application not found" });

        if (agreementsContent !== undefined) application.adminAgreements = agreementsContent;
        if (req.file) application.adminAttachment = req.file.path;

        application.docReviewStatus = "Pending";
        await application.save();

        res.status(200).json({ success: true, message: "Agreements/Documents sent successfully", application });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ Upload Signed Agreements (Candidate -> Admin)
const uploadSignedAgreements = async (req, res) => {
    try {
        const { applicationId } = req.body;
        if (!applicationId || !req.file) {
            return res.status(400).json({ success: false, message: "Application ID and File are required" });
        }

        const application = await JobApplication.findById(applicationId);
        if (!application) return res.status(404).json({ success: false, message: "Application not found" });

        application.candidateAgreementsUpload = req.file.path;
        application.docReviewStatus = "Pending"; // Reset to pending for admin review
        await application.save();

        res.status(200).json({ success: true, message: "Document uploaded successfully", application });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ Review Documents (Admin Action)
const reviewDocuments = async (req, res) => {
    try {
        const { applicationId, status } = req.body; // status: "Accepted" or "Rejected"
        if (!applicationId || !status) {
            return res.status(400).json({ success: false, message: "Application ID and Status are required" });
        }

        const application = await JobApplication.findById(applicationId);
        if (!application) return res.status(404).json({ success: false, message: "Application not found" });

        application.docReviewStatus = status;
        await application.save();

        res.status(200).json({ success: true, message: `Documents ${status} successfully`, application });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get application by ID
const getApplicationById = async (req, res) => {
    console.log(`[DEBUG] Fetching Application details for ID: ${req.params.applicationId}`);
    try {
        const { applicationId } = req.params;

        if (!applicationId || applicationId === "undefined") {
            console.error("[ERROR] Missing or invalid applicationId in params");
            return res.status(400).json({ success: false, message: "Invalid Application ID" });
        }

        const application = await JobApplication.findById(applicationId).populate("jobId", "role");

        if (!application) {
            console.error(`[ERROR] Application not found for ID: ${applicationId}`);
            return res.status(404).json({ success: false, message: "Application not found in database" });
        }

        console.log(`[SUCCESS] Found application for ${application.firstName} ${application.lastName}`);
        res.status(200).json({ success: true, application });
    } catch (error) {
        console.error(`[ERROR] getApplicationById Error: ${error.message}`);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update Application Status
const updateApplicationStatus = async (req, res) => {
    try {
        const { applicationId, status } = req.body;
        const application = await JobApplication.findByIdAndUpdate(applicationId, { status }, { new: true });
        if (!application) {
            return res.status(404).json({ success: false, message: "Application not found" });
        }
        res.status(200).json({ success: true, message: "Status updated successfully", application });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ Handle Resignation Approval (Admin Action)
const handleResignationApproval = async (req, res) => {
    try {
        const { applicationId, status } = req.body; // status: "Approved" or "Rejected"
        if (!applicationId || !status) {
            return res.status(400).json({ success: false, message: "Application ID and Status are required" });
        }

        const application = await JobApplication.findById(applicationId);
        if (!application) return res.status(404).json({ success: false, message: "Application not found" });

        application.resignationStatus = status;

        // If approved, we might want to change the overall status as well, 
        // though "Resigned" is already set when the candidate submits.
        // We can keep it "Resigned" but the resignationStatus will be "Approved".

        await application.save();

        res.status(200).json({ success: true, message: `Resignation ${status} successfully`, application });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all applications with uploaded documents
const getApplicationsWithDocuments = async (req, res) => {
    try {
        const applications = await JobApplication.find({
            candidateAgreementsUpload: { $exists: true, $ne: null }
        })
            .populate('jobId', 'role department location')
            .sort({ updatedAt: -1 });

        res.status(200).json({ success: true, data: applications });
    } catch (error) {
        console.error("Error fetching applications with documents:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Recruitment Statistics
const getRecruitmentStats = async (req, res) => {
    try {
        const { role, statusRole, scoreRole } = req.query;

        // Helper function to get jobIds by role name
        const getJobIdsByRole = async (roleName) => {
            if (!roleName || roleName === "All") return null;
            const roleRegex = new RegExp(`^${roleName.trim()}$`, "i");
            return await JobPost.find({ role: roleRegex }).distinct("_id");
        };

        const globalJobIds = await getJobIdsByRole(role);
        const statusJobIds = await getJobIdsByRole(statusRole || role);
        const scoreJobIds = await getJobIdsByRole(scoreRole || role);

        // Build robust filter helper
        const buildFilter = (jobIds, roleName) => {
            if (!jobIds && (!roleName || roleName === "All")) return {};
            const filter = { $or: [] };
            if (jobIds && jobIds.length > 0) filter.$or.push({ jobId: { $in: jobIds } });
            if (roleName && roleName !== "All") {
                filter.$or.push({ role: { $regex: new RegExp(`^${roleName.trim()}$`, "i") } });
            }
            return filter.$or.length > 0 ? filter : {};
        };

        const globalFilter = buildFilter(globalJobIds, role);
        const statusFilter = buildFilter(statusJobIds, statusRole || role);
        const scoreFilter = buildFilter(scoreJobIds, scoreRole || role);

        const totalApplicants = await JobApplication.countDocuments(globalFilter);
        const selected = await JobApplication.countDocuments({ ...globalFilter, status: "Selected" });
        const rejected = await JobApplication.countDocuments({ ...globalFilter, status: "Rejected" });
        const interview = await JobApplication.countDocuments({
            ...globalFilter,
            status: { $in: ["Interview", "Shortlisted", "Invited", "Assessment"] }
        });

        const availableRoles = await JobPost.distinct("role", { status: "active" });

        // 1. Status Breakdown (for Pie Chart)
        const statusAggregation = await JobApplication.aggregate([
            { $match: statusFilter },
            { $group: { _id: "$status", value: { $sum: 1 } } },
            { $project: { name: "$_id", value: 1, _id: 0 } }
        ]);

        // 2. Monthly Trend (for last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);
        sixMonthsAgo.setHours(0, 0, 0, 0);

        const trendAggregation = await JobApplication.aggregate([
            { $match: { ...globalFilter, appliedAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: {
                        month: { $month: "$appliedAt" },
                        year: { $year: "$appliedAt" }
                    },
                    avgScore: { $avg: { $ifNull: ["$technicalScore", 0] } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthlyTrend = trendAggregation.map(item => ({
            name: `${months[item._id.month - 1]} ${item._id.year}`,
            avgScore: Math.round(item.avgScore || 0),
            count: item.count
        }));

        // 3. Score Distribution (Buckets)
        const scoreDistribution = await JobApplication.aggregate([
            { $match: scoreFilter },
            {
                $bucket: {
                    groupBy: { $ifNull: ["$technicalScore", 0] },
                    boundaries: [0, 40, 50, 60, 70, 80, 90, 101],
                    default: "Other",
                    output: { count: { $sum: 1 } }
                }
            },
            {
                $project: {
                    range: {
                        $switch: {
                            branches: [
                                { case: { $eq: ["$_id", 0] }, then: "0-40" },
                                { case: { $eq: ["$_id", 40] }, then: "40-50" },
                                { case: { $eq: ["$_id", 50] }, then: "50-60" },
                                { case: { $eq: ["$_id", 60] }, then: "60-70" },
                                { case: { $eq: ["$_id", 70] }, then: "70-80" },
                                { case: { $eq: ["$_id", 80] }, then: "80-90" },
                                { case: { $eq: ["$_id", 90] }, then: "90-100" }
                            ],
                            default: "100+"
                        }
                    },
                    count: 1,
                    _id: 0
                }
            }
        ]);

        // 4. Quality Metrics (50+, 60+, etc.)
        const qualityMetrics = {
            score50plus: await JobApplication.countDocuments({ ...globalFilter, technicalScore: { $gte: 50 } }),
            score60plus: await JobApplication.countDocuments({ ...globalFilter, technicalScore: { $gte: 60 } }),
            score70plus: await JobApplication.countDocuments({ ...globalFilter, technicalScore: { $gte: 70 } }),
            score80plus: await JobApplication.countDocuments({ ...globalFilter, technicalScore: { $gte: 80 } }),
            score90plus: await JobApplication.countDocuments({ ...globalFilter, technicalScore: { $gte: 90 } })
        };

        res.status(200).json({
            success: true,
            stats: {
                totalApplicants,
                selected,
                rejected,
                interview,
                statusBreakdown: statusAggregation,
                monthlyTrend,
                scoreDistribution,
                qualityMetrics,
                availableRoles
            }
        });
    } catch (error) {
        console.error("Error fetching recruitment stats:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ... other existing code ...

module.exports = {
    submitApplication,
    getAllApplications,
    getApplicationById,
    updateApplicationStatus,
    getApplicationsByJobId,
    submitAssessment,
    updateApplicationScore,
    sendInterviewInvitation,
    sendOfferLetter,
    sendAgreements,
    uploadSignedAgreements,
    reviewDocuments,
    getApplicationsWithDocuments,
    handleResignationApproval,
    getRecruitmentStats
};

