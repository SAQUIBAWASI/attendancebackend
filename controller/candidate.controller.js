const Candidate = require("../models/Candidate");
const JobApplication = require("../models/JobApplication");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const CandidateDocuments = require("../models/CandidateDocuments");
const CandidateExperience = require("../models/CandidateExperience");
const Employee = require("../models/Employee");

// Register Candidate
exports.register = async (req, res) => {
    try {
        console.log("[DEBUG] Candidate Register Request Body:", req.body);
        const {
            name, email, phone, skills, experience, address,
            currentCompany, currentCTC, expectedCTC,
            highestQualification, institution, department,
            currentLocation, noticePeriod, dateOfJoining, role,
            percentage, passingYear
        } = req.body;

        // Check if candidate already exists
        let candidate = await Candidate.findOne({ email });
        if (candidate) {
            return res.status(400).json({ message: "Candidate already exists" });
        }

        candidate = new Candidate({
            name,
            email,
            phone,
            skills,
            experience,
            address,
            currentCompany,
            currentCTC,
            expectedCTC,
            qualification: highestQualification,
            institution,
            department,
            currentLocation,
            noticePeriod,
            dateOfJoining,
            role,
            percentage,
            passingYear
        });

        await candidate.save();

        // Create JWT Payload
        const payload = {
            candidate: {
                id: candidate.id,
            },
        };

        // Sign Token
        jwt.sign(
            payload,
            process.env.JWT_SECRET || "secret_ecom",
            { expiresIn: 360000 },
            (err, token) => {
                if (err) throw err;
                res.status(201).json({ token, message: "Candidate registered successfully" });
            }
        );
    } catch (err) {
        console.error("[ERROR] Candidate Register Failure:", err);
        res.status(500).send("Server Error: " + err.message);
    }
};

// Login Candidate
exports.login = async (req, res) => {
    try {
        const { email } = req.body; // Remove password extraction

        // Check if candidate exists
        let candidate = await Candidate.findOne({ email });
        if (!candidate) {
            // For email-only login, if they don't exist, we might want to say so or just say Invalid Credentials
            return res.status(400).json({ message: "Candidate not found. Please register." });
        }

        // Create JWT Payload
        const payload = {
            candidate: {
                id: candidate.id,
            },
        };

        // Sign Token
        jwt.sign(
            payload,
            process.env.JWT_SECRET || "secret_ecom",
            { expiresIn: 360000 },
            (err, token) => {
                if (err) throw err;
                res.json({ token, message: "Login successful" });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

// Get Candidate Profile
exports.getProfile = async (req, res) => {
    try {
        const candidate = await Candidate.findById(req.candidate.id).select("-password");
        res.json(candidate);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

// Update Candidate Profile
exports.updateProfile = async (req, res) => {
    try {
        const {
            name, phone, skills, experience, address,
            currentCompany, currentCTC, expectedCTC,
            qualification, percentage, passingYear,
            institution, department, currentLocation,
            noticePeriod, dateOfJoining, role
        } = req.body;

        let candidate = await Candidate.findById(req.candidate.id);

        if (!candidate) {
            return res.status(404).json({ message: "Candidate not found" });
        }

        // Update fields
        if (name !== undefined) candidate.name = name;
        if (phone !== undefined) candidate.phone = phone;
        if (skills !== undefined) candidate.skills = skills;
        if (experience !== undefined) candidate.experience = experience;
        if (address !== undefined) candidate.address = address;
        if (currentCompany !== undefined) candidate.currentCompany = currentCompany;
        if (currentCTC !== undefined) candidate.currentCTC = currentCTC;
        if (expectedCTC !== undefined) candidate.expectedCTC = expectedCTC;
        if (qualification !== undefined) candidate.qualification = qualification;
        if (percentage !== undefined) candidate.percentage = percentage;
        if (passingYear !== undefined) candidate.passingYear = passingYear;
        if (institution !== undefined) candidate.institution = institution;
        if (department !== undefined) candidate.department = department;
        if (currentLocation !== undefined) candidate.currentLocation = currentLocation;
        if (noticePeriod !== undefined) candidate.noticePeriod = noticePeriod;
        if (dateOfJoining !== undefined) candidate.dateOfJoining = dateOfJoining;
        if (role !== undefined) candidate.role = role;

        // Handle Resume Upload if present (req.file)
        if (req.file) {
            candidate.resume = req.file.path;
        }

        await candidate.save();
        res.json({ message: "Profile updated successfully", candidate });

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
}


// Get Applied Jobs
const getAppliedJobs = async (req, res) => {
    try {
        const applications = await JobApplication.find({ candidateId: req.candidate.id })
            .populate("jobId")
            .sort({ appliedAt: -1 });
        res.status(200).json(applications);
    } catch (err) {
        console.error("Get Applied Jobs Error:", err.message);
        res.status(500).send("Server Error");
    }
};

const checkCandidateExists = async (req, res) => {
    try {
        const { email } = req.body;
        const candidate = await Candidate.findOne({ email }).select("-password");
        if (candidate) {
            return res.status(200).json({ exists: true, message: "Candidate found", candidate });
        }
        res.status(200).json({ exists: false, message: "Candidate not found" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

// Upload Candidate Documents
exports.uploadPersonalDocuments = async (req, res) => {
    try {
        const candidateId = req.candidate?.id;
        const documentType = req.body.documentType || req.body.type;

        if (!candidateId) {
            return res.status(400).json({ success: false, message: "Candidate ID not found in token" });
        }

        if (!documentType) {
            return res.status(400).json({ success: false, message: "Document type is required" });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        // Verify file was actually saved
        const fs = require("fs");
        if (!fs.existsSync(req.file.path)) {
            return res.status(500).json({ success: false, message: "File save failed - directory may not exist" });
        }

        // Get candidate's email from profile
        const candidate = await require("../models/Candidate").findById(candidateId);
        if (!candidate) {
            return res.status(404).json({ success: false, message: "Candidate not found" });
        }

        // Find or create candidate documents record
        let candDocs = await CandidateDocuments.findOne({ candidateId });
        if (!candDocs) {
            candDocs = new CandidateDocuments({
                candidateId,
                email: candidate.email,
                documents: {}
            });
        }

        // Update specific document field with normalized relative path
        let relativePath = req.file.path;
        if (relativePath.includes("uploads")) {
            relativePath = relativePath.substring(relativePath.indexOf("uploads")).replace(/\\/g, '/');
        }

        candDocs.documents[documentType] = {
            fileName: req.file.originalname,
            filePath: relativePath,
            url: relativePath,
            status: "Pending",
            uploadedAt: new Date(),
            verified: false
        };

        // Calculate completion percentage
        const docFields = [
            'aadharCard', 'panCard',
            'tenthCertificate', 'twelfthCertificate', 'graduationCertificate',
            'passportPhoto', 'bankDetails', 'emergencyContact1', 'emergencyContact2'
        ];

        let completedCount = 0;
        docFields.forEach(field => {
            const doc = candDocs.documents[field];
            if (doc && (doc.filePath || doc.bankName || doc.name)) {
                completedCount++;
            }
        });

        candDocs.completionPercentage = Math.round((completedCount / docFields.length) * 100);

        await candDocs.save();

        res.status(200).json({
            success: true,
            message: "Document uploaded successfully",
            data: candDocs
        });
    } catch (err) {
        console.error("Document upload error:", err);
        res.status(500).json({
            success: false,
            message: "Upload failed: " + err.message,
            error: err.message
        });
    }
};

// Get Candidate Documents
exports.getPersonalDocuments = async (req, res) => {
    try {
        const candidateId = req.candidate?.id;

        if (!candidateId) {
            return res.status(400).json({ success: false, message: "Candidate ID not found in token" });
        }

        let candDocs = await CandidateDocuments.findOne({ candidateId })
            .populate("candidateId", "name email phone qualification percentage passingYear address currentCompany experience currentCTC expectedCTC skills");

        if (!candDocs) {
            // Get candidate info first
            const candidate = await require("../models/Candidate").findById(candidateId);
            if (!candidate) {
                return res.status(404).json({ success: false, message: "Candidate not found" });
            }

            // Create new empty document record
            candDocs = new CandidateDocuments({
                candidateId,
                email: candidate.email,
                documents: {}
            });
            await candDocs.save();
        }

        if (candDocs && candDocs.documents) {
            const types = ['aadharCard', 'panCard', 'tenthCertificate', 'twelfthCertificate', 'graduationCertificate', 'experienceLetters', 'passportPhoto'];
            types.forEach(type => {
                if (candDocs.documents[type] && candDocs.documents[type].filePath && !candDocs.documents[type].url) {
                    candDocs.documents[type].url = candDocs.documents[type].filePath;
                }
            });
        }

        res.status(200).json({
            success: true,
            message: "Documents retrieved successfully",
            data: candDocs
        });
    } catch (err) {
        console.error("Get documents error:", err);
        res.status(500).json({ success: false, message: "Failed to fetch documents", error: err.message });
    }
};

// Get All Candidates Documents (Admin View)
exports.getAllCandidatesDocuments = async (req, res) => {
    try {
        const candDocs = await CandidateDocuments.find()
            .populate('candidateId', 'name email phone qualification percentage passingYear address currentCompany experience currentCTC expectedCTC skills department role')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: "All candidate documents retrieved",
            totalCount: candDocs.length,
            data: candDocs
        });
    } catch (err) {
        console.error("Get all documents error:", err);
        res.status(500).json({ success: false, message: "Failed to fetch documents", error: err.message });
    }
};

// Get Specific Candidate Documents by ID (Admin View)
exports.getCandidateDocumentsById = async (req, res) => {
    try {
        const candidateId = req.params.id;

        if (!candidateId) {
            return res.status(400).json({ success: false, message: "Candidate ID parameter is missing" });
        }

        let candDocs = await CandidateDocuments.findOne({ candidateId })
            .populate('candidateId', 'name email phone qualification percentage passingYear address currentCompany experience currentCTC expectedCTC skills');

        if (!candDocs) {
            // Get candidate info first to see if they exist
            const candidate = await require("../models/Candidate").findById(candidateId);
            if (!candidate) {
                return res.status(404).json({ success: false, message: "Candidate not found" });
            }

            // Return empty document structure for the candidate
            candDocs = {
                candidateId: candidate,
                email: candidate.email,
                documents: {}
            };
        }

        res.status(200).json({
            success: true,
            message: "Candidate documents retrieved",
            data: candDocs
        });
    } catch (err) {
        console.error("Get specific candidate documents error:", err);
        res.status(500).json({ success: false, message: "Failed to fetch documents", error: err.message });
    }
};

// Save Bank Details
exports.saveBankDetails = async (req, res) => {
    try {
        const candidateId = req.candidate?.id;
        const { bankDetails } = req.body;

        if (!candidateId) {
            return res.status(400).json({ success: false, message: "Candidate ID not found in token" });
        }

        if (!bankDetails || !bankDetails.bankName || !bankDetails.accountNumber || !bankDetails.ifscCode) {
            return res.status(400).json({ success: false, message: "Missing required bank details fields (bankName, accountNumber, ifscCode)" });
        }

        // Get candidate's email for reference
        const candidate = await require("../models/Candidate").findById(candidateId);
        if (!candidate) {
            return res.status(404).json({ success: false, message: "Candidate not found" });
        }

        let candDocs = await CandidateDocuments.findOne({ candidateId });

        if (!candDocs) {
            candDocs = new CandidateDocuments({
                candidateId,
                email: candidate.email
            });
        }

        candDocs.documents.bankDetails = {
            bankName: bankDetails.bankName,
            accountNumber: bankDetails.accountNumber,
            ifscCode: bankDetails.ifscCode,
            uploadedAt: new Date(),
            verified: false
        };

        // Calculate completion percentage
        let completedFields = 0;
        const docFields = [
            "aadharCard", "panCard", "tenthCertificate",
            "twelfthCertificate", "graduationCertificate",
            "passportPhoto", "bankDetails", "emergencyContact1", "emergencyContact2"
        ];

        docFields.forEach(field => {
            if (candDocs.documents[field] && (candDocs.documents[field].fileName || candDocs.documents[field].bankName || candDocs.documents[field].name)) {
                completedFields++;
            }
        });

        candDocs.completionPercentage = Math.round((completedFields / docFields.length) * 100);

        await candDocs.save();

        res.status(200).json({
            success: true,
            message: "Bank details saved successfully",
            data: candDocs
        });
    } catch (err) {
        console.error("Save bank details error:", err);
        res.status(500).json({ success: false, message: "Failed to save bank details", error: err.message });
    }
};

// Save Emergency Contact
exports.saveEmergencyContact = async (req, res) => {
    try {
        const candidateId = req.candidate?.id;
        const { contactNumber, contact } = req.body;

        if (!candidateId) {
            return res.status(400).json({ success: false, message: "Candidate ID not found in token" });
        }

        if (!contactNumber || !contact || !contact.name || !contact.phone || !contact.relationship) {
            return res.status(400).json({ success: false, message: "Missing required emergency contact fields (name, phone, relationship)" });
        }

        // Get candidate's email for reference
        const candidate = await require("../models/Candidate").findById(candidateId);
        if (!candidate) {
            return res.status(404).json({ success: false, message: "Candidate not found" });
        }

        let candDocs = await CandidateDocuments.findOne({ candidateId });

        if (!candDocs) {
            candDocs = new CandidateDocuments({
                candidateId,
                email: candidate.email
            });
        }

        const fieldName = contactNumber === 1 ? "emergencyContact1" : "emergencyContact2";
        candDocs.documents[fieldName] = {
            name: contact.name,
            phone: contact.phone,
            relationship: contact.relationship,
            uploadedAt: new Date(),
            verified: false
        };

        // Calculate completion percentage
        let completedFields = 0;
        const docFields = [
            "aadharCard", "panCard", "tenthCertificate",
            "twelfthCertificate", "graduationCertificate",
            "passportPhoto", "bankDetails", "emergencyContact1", "emergencyContact2"
        ];

        docFields.forEach(field => {
            if (candDocs.documents[field] && (candDocs.documents[field].fileName || candDocs.documents[field].bankName || candDocs.documents[field].name)) {
                completedFields++;
            }
        });

        candDocs.completionPercentage = Math.round((completedFields / docFields.length) * 100);

        await candDocs.save();

        res.status(200).json({
            success: true,
            message: `Emergency contact ${contactNumber} saved successfully`,
            data: candDocs
        });
    } catch (err) {
        console.error("Save emergency contact error:", err);
        res.status(500).json({ success: false, message: "Failed to save emergency contact", error: err.message });
    }
};

// Update Document Details (Generic for Bank/Emergency) - Used by Recruitment Frontend
exports.updateCandidateDocumentDetails = async (req, res) => {
    try {
        const candidateId = req.candidate?.id;
        const { bankDetails, emergencyContact1, emergencyContact2 } = req.body;

        if (!candidateId) {
            return res.status(400).json({ success: false, message: "Candidate ID not found in token" });
        }

        // Get candidate's email for reference
        const candidate = await (require("../models/Candidate")).findById(candidateId);
        if (!candidate) {
            return res.status(404).json({ success: false, message: "Candidate not found" });
        }

        let candDocs = await (require("../models/CandidateDocuments")).findOne({ candidateId });

        if (!candDocs) {
            candDocs = new (require("../models/CandidateDocuments"))({
                candidateId,
                email: candidate.email,
                documents: {}
            });
        }

        // Update Bank Details if present
        if (bankDetails) {
            candDocs.documents.bankDetails = {
                bankName: bankDetails.bankName,
                accountNumber: bankDetails.accountNumber,
                ifscCode: bankDetails.ifscCode,
                uploadedAt: new Date(),
                verified: false
            };
        }

        // Update Emergency Contact 1 if present
        if (emergencyContact1) {
            candDocs.documents.emergencyContact1 = {
                name: emergencyContact1.name,
                phone: emergencyContact1.phone,
                relationship: emergencyContact1.relationship,
                uploadedAt: new Date(),
                verified: false
            };
        }

        // Update Emergency Contact 2 if present
        if (emergencyContact2) {
            candDocs.documents.emergencyContact2 = {
                name: emergencyContact2.name,
                phone: emergencyContact2.phone,
                relationship: emergencyContact2.relationship,
                uploadedAt: new Date(),
                verified: false
            };
        }

        // Calculate completion percentage
        let completedFields = 0;
        const docFields = [
            "aadharCard", "panCard", "tenthCertificate",
            "twelfthCertificate", "graduationCertificate",
            "passportPhoto", "bankDetails", "emergencyContact1", "emergencyContact2"
        ];

        docFields.forEach(field => {
            if (candDocs.documents[field] && (candDocs.documents[field].fileName || candDocs.documents[field].bankName || candDocs.documents[field].name)) {
                completedFields++;
            }
        });

        candDocs.completionPercentage = Math.round((completedFields / docFields.length) * 100);

        await candDocs.save();

        res.status(200).json({
            success: true,
            message: "Candidate document details updated successfully",
            data: candDocs
        });
    } catch (err) {
        console.error("Update candidate document details error:", err);
        res.status(500).json({ success: false, message: "Failed to update details", error: err.message });
    }
};

// Submit Resignation
exports.submitResignation = async (req, res) => {
    try {
        const candidateId = req.candidate?.id;
        const { applicationId, resignationLetter } = req.body;

        if (!candidateId) {
            return res.status(400).json({ success: false, message: "Candidate ID not found in token" });
        }

        if (!applicationId || !resignationLetter) {
            return res.status(400).json({ success: false, message: "Application ID and resignation letter are required" });
        }

        const application = await JobApplication.findOne({ _id: applicationId, candidateId });

        if (!application) {
            return res.status(404).json({ success: false, message: "Application not found or unauthorized" });
        }

        application.resignationLetter = resignationLetter;
        application.resignationSentAt = new Date();
        application.status = "Resigned";

        await application.save();

        res.status(200).json({
            success: true,
            message: "Resignation submitted successfully",
            data: application
        });
    } catch (err) {
        console.error("Submit resignation error:", err);
        res.status(500).json({ success: false, message: "Failed to submit resignation", error: err.message });
    }
};

// Confirm Interview
exports.confirmInterview = async (req, res) => {
    try {
        const candidateId = req.candidate?.id;
        const { applicationId, status, note } = req.body;

        console.log(`[DEBUG] Confirm Interview Request:`, {
            candidateId,
            applicationId,
            status,
            note,
            url: req.originalUrl,
            method: req.method
        });

        if (!candidateId) {
            return res.status(400).json({ success: false, message: "Candidate ID not found in token" });
        }

        if (!applicationId || !status) {
            return res.status(400).json({ success: false, message: "Application ID and status are required" });
        }

        if (!["Confirmed", "Declined"].includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status value" });
        }

        const application = await JobApplication.findOne({ _id: applicationId, candidateId });

        if (!application) {
            console.log(`[DEBUG] Interview Application Not Found: applicationId=${applicationId}, candidateId=${candidateId}`);
            return res.status(404).json({ success: false, message: "Application not found or unauthorized" });
        }

        console.log(`[DEBUG] Found Application:`, application._id);

        application.candidateInterviewStatus = status;
        application.candidateInterviewNote = note || "";

        await application.save();

        res.status(200).json({
            success: true,
            message: `Interview ${status.toLowerCase()} successfully`,
            data: application
        });
    } catch (err) {
        console.error("Confirm interview error:", err);
        res.status(500).json({ success: false, message: "Failed to confirm interview", error: err.message });
    }
};

// Add Candidate Experience
exports.addCandidateExperience = async (req, res) => {
    try {
        const candidateId = req.candidate?.id;
        const { companyName, role, startDate, endDate, salary, location } = req.body;

        if (!candidateId) {
            return res.status(400).json({ success: false, message: "Candidate ID not found in token" });
        }

        if (!companyName || !role || !startDate || !salary || !location) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        const newExperienceData = {
            candidateId,
            companyName,
            role,
            startDate,
            endDate: endDate || null,
            salary,
            location,
        };

        // Handle file uploads (Normalize paths to be relative starting with 'uploads/')
        if (req.files) {
            if (req.files.offerLetter && req.files.offerLetter[0]) {
                let filePath = req.files.offerLetter[0].path;
                if (filePath.includes("uploads")) {
                    filePath = filePath.substring(filePath.indexOf("uploads")).replace(/\\/g, '/');
                }
                newExperienceData.offerLetter = filePath;
            }
            if (req.files.payslip && req.files.payslip[0]) {
                let filePath = req.files.payslip[0].path;
                if (filePath.includes("uploads")) {
                    filePath = filePath.substring(filePath.indexOf("uploads")).replace(/\\/g, '/');
                }
                newExperienceData.payslip = filePath;
            }
        }

        const newExperience = new CandidateExperience(newExperienceData);
        await newExperience.save();

        res.status(201).json({
            success: true,
            message: "Experience added successfully",
            data: newExperience
        });

    } catch (err) {
        console.error("Add experience error:", err);
        res.status(500).json({ success: false, message: "Failed to add experience", error: err.message });
    }
};

// Get Candidate Experiences
exports.getCandidateExperiences = async (req, res) => {
    try {
        const candidateId = req.candidate?.id;
        if (!candidateId) {
            return res.status(400).json({ success: false, message: "Candidate ID not found in token" });
        }

        const experiences = await CandidateExperience.find({ candidateId }).sort({ startDate: -1 });

        res.status(200).json({
            success: true,
            message: "Experiences retrieved successfully",
            data: experiences
        });
    } catch (err) {
        console.error("Get experiences error:", err);
        res.status(500).json({ success: false, message: "Failed to fetch experiences", error: err.message });
    }
};

// Get All Candidate Experiences (Admin)
exports.getAllCandidateExperiences = async (req, res) => {
    try {
        const experiences = await CandidateExperience.find()
            .populate("candidateId", "name email phone")
            .sort({ createdAt: -1 });

        // Convert Mongoose documents to plain objects for manipulation
        let mergedExperiences = experiences.map(exp => exp.toObject());

        // --- Added: Merge Current Employee Jobs into Journey ---
        try {
            const employees = await Employee.find({ status: 'active' });

            // For each active employee, create a "virtual" experience entry if they have a candidate record
            for (const emp of employees) {
                // Find matching experience for this candidate to get their ID for grouping
                const existingExp = experiences.find(exp =>
                    exp.candidateId && exp.candidateId.email?.toLowerCase() === emp.email?.toLowerCase()
                );

                if (existingExp && existingExp.candidateId) {
                    // Create a virtual experience record for the current job
                    const currentJobEntry = {
                        _id: `current_${emp._id}`,
                        candidateId: existingExp.candidateId,
                        companyName: "Timely Health Tech Pvt Ltd",
                        role: emp.role || "Employee",
                        startDate: emp.joinDate || emp.createdAt,
                        endDate: null, // "Present"
                        salary: emp.salaryPerMonth ? `₹${emp.salaryPerMonth.toLocaleString('en-IN')}/mo` : "-",
                        location: emp.city || emp.addressLine1 || "India",
                        isCurrentJob: true,
                        createdAt: new Date().toISOString()
                    };
                    mergedExperiences.unshift(currentJobEntry);
                }
            }
        } catch (empErr) {
            console.error("Error merging employee data into experiences:", empErr);
        }
        // -------------------------------------------------------

        res.status(200).json({
            success: true,
            message: "All experiences retrieved successfully",
            data: mergedExperiences
        });
    } catch (err) {
        console.error("Get all experiences error:", err);
        res.status(500).json({ success: false, message: "Failed to fetch all experiences", error: err.message });
    }
};

module.exports = {
    register: exports.register,
    login: exports.login,
    getProfile: exports.getProfile,
    updateProfile: exports.updateProfile,
    getAppliedJobs,
    checkCandidateExists,
    uploadPersonalDocuments: exports.uploadPersonalDocuments,
    getPersonalDocuments: exports.getPersonalDocuments,
    getAllCandidatesDocuments: exports.getAllCandidatesDocuments,
    getCandidateDocumentsById: exports.getCandidateDocumentsById,
    saveBankDetails: exports.saveBankDetails,
    saveEmergencyContact: exports.saveEmergencyContact,
    updateCandidateDocumentDetails: exports.updateCandidateDocumentDetails,
    submitResignation: exports.submitResignation,
    confirmInterview: exports.confirmInterview,
    addCandidateExperience: exports.addCandidateExperience,
    getCandidateExperiences: exports.getCandidateExperiences,
    getAllCandidateExperiences: exports.getAllCandidateExperiences
};
