const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    skills: {
        type: String, // Comma separated or just a string description
    },
    experience: {
        type: String,
    },
    resume: {
        type: String, // Path to resume file
    },
    address: {
        type: String,
    },
    qualification: {
        type: String,
    },
    percentage: {
        type: String,
    },
    passingYear: {
        type: String,
    },
    currentCompany: {
        type: String,
    },
    currentCTC: {
        type: String,
    },
    expectedCTC: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Candidate", candidateSchema);
