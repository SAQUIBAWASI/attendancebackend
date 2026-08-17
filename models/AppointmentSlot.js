const mongoose = require("mongoose");

const appointmentSlotSchema = new mongoose.Schema({
  slotId: { type: String, required: true },
  doctorId: { type: String, default: "default" },
  doctorName: { type: String, default: "General OP Doctor" },
  dayOfWeek: { type: String, required: true }, // Monday, Tuesday, ...
  date: { type: String, default: "" },         // Specific date YYYY-MM-DD
  startTime: { type: String, required: true }, // e.g. "09:00 AM"
  endTime: { type: String, required: true },   // e.g. "09:20 AM"
  startTime24: { type: String, required: true }, // e.g. "09:00"
  endTime24: { type: String, required: true },   // e.g. "09:20"
  duration: { type: Number, default: 20 },     // e.g. 20 mins
  gap: { type: Number, default: 5 },           // e.g. 5 mins
  shift: { type: String, default: "Morning" },  // Morning / Evening
  type: { type: String, enum: ["op", "break"], default: "op" },
  status: { 
    type: String, 
    enum: ["available", "booked", "blocked", "break", "completed"], 
    default: "available" 
  },
  consultationFee: { type: Number, default: 300 },
  paymentStatus: { 
    type: String, 
    enum: ["Pending", "Paid"], 
    default: "Pending" 
  },
  patientName: { type: String, default: "" },
  patientAge: { type: String, default: "" },
  patientGender: { type: String, default: "Male" },
  patientAddress: { type: String, default: "" },
  purpose: { type: String, default: "" },
  patientPhone: { type: String, default: "" },
  notes: { type: String, default: "" },
// ✅ FIX: Services array with proper schema
  services: {
    type: [{
      serviceId: { type: String, required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      description: { type: String, default: "" },
      paymentStatus: { 
        type: String, 
        enum: ["Pending", "Paid"], 
        default: "Pending" 
      },
      addedAt: { type: Date, default: Date.now }
    }],
    default: []
  }
}, { timestamps: true });


module.exports = mongoose.model("AppointmentSlot", appointmentSlotSchema);