const mongoose = require("mongoose");

const employeeExperienceSchema = new mongoose.Schema({
    employeeId: {
        type: String,
        required: true,
        index: true,
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
        required: false,
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
        type: String,
        required: false,
    },
    payslip: {
        type: String,
        required: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("EmployeeExperience", employeeExperienceSchema);
