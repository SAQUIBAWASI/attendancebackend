const JobApplication = require("../models/JobApplication");
const JobPost = require("../models/JobPost");
const fs = require('fs');


// Submit Job Application
const submitApplication = async (req, res) => {
    let newApplication;
    try {
        const {
            jobId,
            firstName,
            lastName,
            email,
            mobile,
            dob,
            gender,
            highestQualification,
            experience,
            currentCTC,
            expectedCTC,
            noticePeriod,
            currentLocation,
            skills,
            percentage,
            passingYear,
            address,
            dateOfJoining,
            currentCompany,
            candidateId
        } = req.body;

        console.log(`[DEBUG] Received Application for JobID: ${jobId}`);
        // ... (logs)

        /* if (!req.file) {
            return res.status(400).json({ success: false, message: "Resume is required" });
        } */

        // Verify if Job exists
        const job = await JobPost.findById(jobId);
        if (!job) {
            console.error(`[ERROR] Job not found for ID: ${jobId}`);
            return res.status(404).json({ success: false, message: `Job post not found in database for ID: ${jobId}` });
        }

        // Optional: Check if candidate has already applied (if candidateId is provided)
        const sanitizedCandidateId = candidateId && candidateId !== 'undefined' ? candidateId : null;

        if (sanitizedCandidateId) {
            const existingApp = await JobApplication.findOne({ jobId, candidateId: sanitizedCandidateId });
            if (existingApp) return res.status(400).json({ message: "You have already applied for this job." });
        }

        newApplication = new JobApplication({
            jobId,
            firstName,
            lastName,
            email,
            mobile,
            dob,
            gender,
            highestQualification,
            experience,
            currentCTC,
            expectedCTC,
            noticePeriod,
            currentLocation,
            skills,
            percentage,
            passingYear,
            address,
            dateOfJoining,
            currentCompany,
            resume: req.file ? req.file.path : null, // Optional resume
            candidateId: sanitizedCandidateId
        });


        await newApplication.save();

        res.status(201).json({
            success: true,
            message: "Job application submitted successfully",
            application: newApplication,
            applicationId: newApplication._id
        });
    } catch (error) {
        console.error("=== APPLICATION SUBMISSION ERROR ===");
        console.error("Error Message:", error.message);
        console.error("Error Stack:", error.stack);

        // Return full error details to client for debugging
        res.status(500).json({
            success: false,
            message: error.message,
            stack: error.stack,
            validation: error.errors ? Object.keys(error.errors).map(key => ({
                field: key,
                message: error.errors[key].message
            })) : null,
            bodyReceived: req.body
        });
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
        application.assessmentResults.push({ quizId, score, totalQuestions });
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
        const { applicationId, interviewSubject, interviewTime } = req.body;

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
        application.interviewStatus = "Invited";

        await application.save();

        res.status(200).json({
            success: true,
            message: "Interview invitation saved and sent to candidate's dashboard!",
            application
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
        const { applicationId, email, offerLetterContent, documentsVerified } = req.body;

        if (!applicationId || !offerLetterContent) {
            return res.status(400).json({ success: false, message: "Application ID and Offer Content are required" });
        }

        const application = await JobApplication.findById(applicationId);
        if (!application) {
            return res.status(404).json({ success: false, message: "Application not found" });
        }

        application.offerLetter = offerLetterContent;
        application.offerSentAt = new Date();
        application.documentsVerified = documentsVerified;
        application.status = "Selected"; // Should likely move to 'Selected' or similar status if not already

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
    getApplicationsWithDocuments
};

