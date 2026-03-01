const mongoose = require("mongoose");

const candidateDocumentsSchema = new mongoose.Schema({
    candidateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Candidate",
        unique: true,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    documents: {
        aadharCard: {
            fileName: String,
            filePath: String,
            uploadedAt: Date,
            verified: { type: Boolean, default: false }
        },
        panCard: {
            fileName: String,
            filePath: String,
            uploadedAt: Date,
            verified: { type: Boolean, default: false }
        },
        tenthCertificate: {
            fileName: String,
            filePath: String,
            uploadedAt: Date,
            verified: { type: Boolean, default: false }
        },
        twelfthCertificate: {
            fileName: String,
            filePath: String,
            uploadedAt: Date,
            verified: { type: Boolean, default: false }
        },
        graduationCertificate: {
            fileName: String,
            filePath: String,
            uploadedAt: Date,
            verified: { type: Boolean, default: false }
        },
        experienceLetters: {
            fileName: String,
            filePath: String,
            uploadedAt: Date,
            verified: { type: Boolean, default: false }
        },
        passportPhoto: {
            fileName: String,
            filePath: String,
            uploadedAt: Date,
            verified: { type: Boolean, default: false }
        },
        bankDetails: {
            bankName: String,
            accountNumber: String,
            ifscCode: String,
            uploadedAt: Date,
            verified: { type: Boolean, default: false }
        },
        emergencyContact1: {
            name: String,
            phone: String,
            relationship: String,
            uploadedAt: Date,
            verified: { type: Boolean, default: false }
        },
        emergencyContact2: {
            name: String,
            phone: String,
            relationship: String,
            uploadedAt: Date,
            verified: { type: Boolean, default: false }
        }
    },
    completionPercentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    adminNotes: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt field on every save
candidateDocumentsSchema.pre("save", function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model("CandidateDocuments", candidateDocumentsSchema);

