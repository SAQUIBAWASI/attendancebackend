const mongoose = require("mongoose");

const candidateExperienceSchema = new mongoose.Schema({
    candidateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Candidate",
        required: true,
    },
    companyName: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: false, // Can be null if currently working
    },
    salary: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    offerLetter: {
        type: String, // Path to the uploaded document
        required: false,
    },
    payslip: {
        type: String, // Path to the uploaded document
        required: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("CandidateExperience", candidateExperienceSchema);
