const mongoose = require("mongoose");

const appointmentSlotSchema = new mongoose.Schema({
  // =============================================
  // EXISTING FIELDS (KEPT AS IS - ALL OPTIONAL)
  // =============================================
  slotId: { type: String },
  doctorId: { type: String, default: "default" },
  doctorName: { type: String, default: "General OP Doctor" },
  doctorSpecialization: { type: String, default: "" },
  dayOfWeek: { type: String }, // Monday, Tuesday, ...
  date: { type: String, default: "" }, // Specific date YYYY-MM-DD
  startTime: { type: String }, // e.g. "09:00 AM"
  endTime: { type: String }, // e.g. "09:20 AM"
  startTime24: { type: String }, // e.g. "09:00"
  endTime24: { type: String }, // e.g. "09:20"
  duration: { type: Number, default: 20 }, // e.g. 20 mins
  gap: { type: Number, default: 5 }, // e.g. 5 mins
  shift: { type: String, default: "Morning" }, // Morning / Evening
  type: { type: String, enum: ["op", "break"], default: "op" },
  slotNumber: { type: Number, default: 0 },
  
  status: { 
    type: String, 
    enum: ["available", "booked", "blocked", "break", "completed", "consulting", "cancelled"], 
    default: "available" 
  },
  
  consultationFee: { type: Number, default: 300 },
  
  paymentStatus: { 
    type: String, 
    enum: ["Pending", "Paid"], 
    default: "Pending" 
  },
  
  // =============================================
  // PATIENT FIELDS
  // =============================================
  patientName: { type: String, default: "" },
  patientAge: { type: String, default: "" },
  patientGender: { type: String, default: "Male" },
  patientAddress: { type: String, default: "" },
  patientPhone: { type: String, default: "" },
  patientEmail: { type: String, default: "" },
  patientBloodGroup: { 
    type: String, 
    enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", ""], 
    default: "" 
  },
  patientMedicalHistory: { type: String, default: "" },
  patientAllergies: { type: String, default: "" },
  patientMedications: { type: String, default: "" },
  
  // =============================================
  // APPOINTMENT FIELDS
  // =============================================
  purpose: { type: String, default: "" },
  appointmentType: { 
    type: String, 
    enum: ["New", "Follow-up", "Consultation", "Emergency", ""], 
    default: "Consultation" 
  },
  priority: { 
    type: String, 
    enum: ["Normal", "High", "Urgent", "Emergency"], 
    default: "Normal" 
  },
  referredBy: { type: String, default: "" },
  
  // =============================================
  // INSURANCE FIELDS
  // =============================================
  insuranceProvider: { type: String, default: "" },
  insurancePolicyNumber: { type: String, default: "" },
  
  // =============================================
  // PAYMENT FIELDS
  // =============================================
  paymentType: { 
    type: String, 
    enum: ["cash", "online", "insurance", "card", ""], 
    default: "cash" 
  },
  paymentTransactionId: { type: String, default: "" },
  totalAmount: { type: Number, default: 0 },
  amountPaid: { type: Number, default: 0 },
  balanceAmount: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  billNumber: { type: String, default: "" },
  billingDate: { type: Date, default: null },
  
  // =============================================
  // SERVICES
  // =============================================
  services: {
    type: [{
      serviceId: { type: String },
      name: { type: String },
      price: { type: Number },
      description: { type: String, default: "" },
      paymentStatus: { 
        type: String, 
        enum: ["Pending", "Paid"], 
        default: "Pending" 
      },
      addedAt: { type: Date, default: Date.now }
    }],
    default: []
  },

  // =============================================
  // STATUS TRACKING
  // =============================================
  consulting: { type: Boolean, default: false },
  cancelled: { type: Boolean, default: false },
  cancellationReason: { type: String, default: "" },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date, default: null },
  bookedAt: { type: Date, default: null },
  
  // =============================================
  // FOLLOW-UP
  // =============================================
  followUpRequired: { type: Boolean, default: false },
  followUpDate: { type: String, default: "" },
  
  // =============================================
  // STAFF FIELDS
  // =============================================
  bookedBy: { type: String, default: "" },
  updatedBy: { type: String, default: "" },
  createdBy: { type: String, default: "" },
  lastModifiedBy: { type: String, default: "" },
  
  // =============================================
  // TIME TRACKING
  // =============================================
  checkInTime: { type: Date, default: null },
  checkOutTime: { type: Date, default: null },
  waitingTime: { type: Number, default: 0 },
  actualConsultationDuration: { type: Number, default: 0 },
  
  // =============================================
  // MEDICAL NOTES
  // =============================================
  notes: { type: String, default: "" },
  clinicalNotes: { type: String, default: "" },
  diagnosis: { type: String, default: "" },
  prescription: { type: String, default: "" },
  labTestsOrdered: { type: [String], default: [] },
  imagingOrdered: { type: [String], default: [] },
  referralToSpecialist: { type: String, default: "" },
  
  // =============================================
  // TELEMEDICINE
  // =============================================
  isTelemedicine: { type: Boolean, default: false },
  telemedicinePlatform: { type: String, default: "" },
  telemedicineLink: { type: String, default: "" },
  
  // =============================================
  // NOTIFICATIONS
  // =============================================
  reminderSent: { type: Boolean, default: false },
  reminderSentAt: { type: Date, default: null },
  smsSent: { type: Boolean, default: false },
  emailSent: { type: Boolean, default: false },
  
  // =============================================
  // FEEDBACK
  // =============================================
  patientRating: { 
    type: Number, 
    min: 1, 
    max: 5, 
    default: null 
  },
  patientFeedback: { type: String, default: "" },
  
  // =============================================
  // ACTIVE STATUS
  // =============================================
  isActive: { type: Boolean, default: true }

}, { timestamps: true });

// =============================================
// INDEXES FOR FASTER QUERIES (OPTIONAL)
// =============================================
appointmentSlotSchema.index({ slotId: 1 });
appointmentSlotSchema.index({ dayOfWeek: 1 });
appointmentSlotSchema.index({ status: 1 });
appointmentSlotSchema.index({ doctorId: 1 });
appointmentSlotSchema.index({ patientPhone: 1 });
appointmentSlotSchema.index({ startTime24: 1 });
appointmentSlotSchema.index({ endTime24: 1 });
appointmentSlotSchema.index({ date: 1 });
appointmentSlotSchema.index({ createdAt: -1 });

// =============================================
// VIRTUAL FIELDS
// =============================================

// Total Fee (Consultation + Services)
appointmentSlotSchema.virtual('totalFee').get(function() {
  const consultationFee = this.consultationFee || 0;
  const servicesTotal = this.services.reduce((sum, service) => sum + (service.price || 0), 0);
  return consultationFee + servicesTotal;
});

// Is Booked
appointmentSlotSchema.virtual('isBooked').get(function() {
  return this.status === 'booked' || this.status === 'consulting' || this.status === 'completed';
});

// Has Services
appointmentSlotSchema.virtual('hasServices').get(function() {
  return this.services && this.services.length > 0;
});

// Service Count
appointmentSlotSchema.virtual('serviceCount').get(function() {
  return this.services ? this.services.length : 0;
});

// Is Available for Booking
appointmentSlotSchema.virtual('isAvailable').get(function() {
  return this.status === 'available' && this.type === 'op';
});

// Can be Cancelled
appointmentSlotSchema.virtual('canCancel').get(function() {
  return this.status === 'booked' || this.status === 'consulting';
});

// Can be Completed
appointmentSlotSchema.virtual('canComplete').get(function() {
  return this.status === 'booked' || this.status === 'consulting';
});

// Get Services Total
appointmentSlotSchema.virtual('servicesTotal').get(function() {
  return this.services.reduce((sum, service) => sum + (service.price || 0), 0);
});

// Get Grand Total
appointmentSlotSchema.virtual('grandTotal').get(function() {
  return (this.consultationFee || 0) + this.servicesTotal;
});

// =============================================
// METHODS
// =============================================

// Check if slot is available
appointmentSlotSchema.methods.isSlotAvailable = function() {
  return this.status === 'available' && this.type === 'op';
};

// Check if slot can be cancelled
appointmentSlotSchema.methods.canBeCancelled = function() {
  return this.status === 'booked' || this.status === 'consulting';
};

// Check if slot can be completed
appointmentSlotSchema.methods.canBeCompleted = function() {
  return this.status === 'booked' || this.status === 'consulting';
};

// Get total services fee
appointmentSlotSchema.methods.getServicesTotal = function() {
  return this.services.reduce((sum, service) => sum + (service.price || 0), 0);
};

// Get total fee
appointmentSlotSchema.methods.getTotalFee = function() {
  return (this.consultationFee || 0) + this.getServicesTotal();
};

// =============================================
// STATICS
// =============================================

// Get available slots by day
appointmentSlotSchema.statics.getAvailableSlotsByDay = function(day) {
  return this.find({ 
    dayOfWeek: day, 
    status: 'available',
    type: 'op'
  }).sort({ startTime24: 1 });
};

// Get booked slots by patient phone
appointmentSlotSchema.statics.getBookingsByPatient = function(phone) {
  return this.find({ 
    patientPhone: phone,
    status: { $in: ['booked', 'consulting', 'completed'] }
  }).sort({ createdAt: -1 });
};

// Get slots by doctor
appointmentSlotSchema.statics.getSlotsByDoctor = function(doctorId) {
  return this.find({ 
    doctorId: doctorId,
    status: { $ne: 'break' }
  }).sort({ dayOfWeek: 1, startTime24: 1 });
};

// Get today's appointments
appointmentSlotSchema.statics.getTodayAppointments = function() {
  const today = new Date();
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
  return this.find({ 
    dayOfWeek: dayName,
    status: { $in: ['booked', 'consulting', 'completed'] }
  }).sort({ startTime24: 1 });
};

// Get upcoming appointments
appointmentSlotSchema.statics.getUpcomingAppointments = function(days = 7) {
  const today = new Date();
  const dayNames = [];
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    dayNames.push(date.toLocaleDateString('en-US', { weekday: 'long' }));
  }
  return this.find({ 
    dayOfWeek: { $in: dayNames },
    status: 'booked'
  }).sort({ dayOfWeek: 1, startTime24: 1 });
};

// =============================================
// MIDDLEWARE
// =============================================

// Pre-save middleware to auto-generate slotId
appointmentSlotSchema.pre('save', async function(next) {
  if (!this.slotId && this.dayOfWeek) {
    const dayPrefix = this.dayOfWeek.substring(0, 3).toLowerCase();
    const count = await this.constructor.countDocuments({ dayOfWeek: this.dayOfWeek });
    this.slotId = `${dayPrefix}_${count + 1}`;
  }
  next();
});

// Ensure virtuals are included in JSON output
appointmentSlotSchema.set('toJSON', { virtuals: true });
appointmentSlotSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model("AppointmentSlot", appointmentSlotSchema);