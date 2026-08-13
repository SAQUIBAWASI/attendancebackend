const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    // Patient Details
    patientName: { type: String },
    patientAge: { type: Number },
    patientGender: { 
      type: String, 
      enum: ["Male", "Female", "Other"]
    },
    patientPhone: { type: String },
    patientEmail: { type: String },
    patientAddress: { type: String },
    
    // Medical Info
    symptoms: { type: String },
    medicalHistory: { type: String },
    allergies: { type: String },
    medications: { type: String },
    
    // Doctor Details
    doctorName: { type: String },
    doctorSpecialty: { type: String },
    
    // Services
    services: [
      {
        name: { type: String },
        price: { type: Number },
      }
    ],
    
    // Service Payment
    servicePayment: { type: Number },
    servicePaymentStatus: { 
      type: String, 
      enum: ["pending", "paid", "partial", "refunded"],
      default: "pending"
    },
    
    // Appointment Details
    slotId: { type: mongoose.Schema.Types.ObjectId, ref: "Slot" },
    appointmentDate: { type: String },
    appointmentTime: { type: String },
    
    // Status
    status: { 
      type: String, 
      enum: ["pending", "confirmed", "completed", "cancelled"], 
      default: "pending" 
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);