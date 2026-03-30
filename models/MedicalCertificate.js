const mongoose = require("mongoose");

const medicalCertificateSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    ref: "Employee"
  },
  employeeName: {
    type: String
  },
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Candidate"
  },
  candidateName: {
    type: String
  },
  registrationDate: {
    type: Date,
    required: true
  },
  expiryDate: {
    type: Date,
    required: true
  },
  documentUrl: {
    type: String,
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("MedicalCertificate", medicalCertificateSchema);
