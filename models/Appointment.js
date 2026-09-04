const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    // =============================================
    // REFERENCE TO SLOT
    // =============================================
    slotId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "AppointmentSlot"
    },
    slotDetails: {
      dayOfWeek: { type: String },
      date: { type: String },
      startTime: { type: String },
      endTime: { type: String },
      startTime24: { type: String },
      endTime24: { type: String },
      doctorId: { type: String },
      doctorName: { type: String },
      doctorSpecialization: { type: String }
    },
    
    // =============================================
    // ✅ NEW: APPOINTMENT DATE (Direct field)
    // =============================================
    appointmentDate: { type: String, default: "" }, // YYYY-MM-DD format
    
    // =============================================
    // PATIENT DETAILS (ALL OPTIONAL)
    // =============================================
    patientId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Patient" 
    },
    patientName: { type: String },
    patientAge: { type: Number },
    patientGender: { 
      type: String, 
      enum: ["Male", "Female", "Other"]
    },
    patientPhone: { type: String },
    patientEmail: { type: String, default: "" },
    patientAddress: { type: String, default: "" },
    
    // =============================================
    // MEDICAL INFO
    // =============================================
    patientBloodGroup: { 
      type: String, 
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", ""], 
      default: "" 
    },
    patientMedicalHistory: { type: String, default: "" },
    patientAllergies: { type: String, default: "" },
    patientMedications: { type: String, default: "" },
    
    // =============================================
    // APPOINTMENT DETAILS
    // =============================================
    purpose: { type: String, default: "" },
    symptoms: { type: String, default: "" },
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
    // INSURANCE
    // =============================================
    insuranceProvider: { type: String, default: "" },
    insurancePolicyNumber: { type: String, default: "" },
    
    // =============================================
    // PAYMENT DETAILS
    // =============================================
    consultationFee: { type: Number, default: 300 },
    paymentType: { 
      type: String, 
      enum: ["cash", "online", "insurance", "card", ""], 
      default: "cash" 
    },
    paymentStatus: { 
      type: String, 
      enum: ["Pending", "Paid", "Partial", "Refunded"], 
      default: "Pending" 
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

     isOP: {
    type: Boolean,
    default: false,
  },
    
    // =============================================
    // STATUS TRACKING
    // =============================================
    status: { 
      type: String, 
      enum: ["pending", "confirmed", "consulting", "completed", "cancelled"], 
      default: "pending" 
    },
    consultationStarted: { type: Boolean, default: false },
    consultationCompleted: { type: Boolean, default: false },
    cancelled: { type: Boolean, default: false },
    cancellationReason: { type: String, default: "" },
    completedAt: { type: Date, default: null },
    bookedAt: { type: Date, default: Date.now },
    
    // =============================================
    // FOLLOW-UP
    // =============================================
    followUpRequired: { type: Boolean, default: false },
    followUpDate: { type: String, default: "" },
    followUpNotes: { type: String, default: "" },
    
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
    // STAFF
    // =============================================
    bookedBy: { type: String, default: "" },
    updatedBy: { type: String, default: "" },
    createdBy: { type: String, default: "" }

  },
  { timestamps: true }
);

// =============================================
// INDEXES
// =============================================
appointmentSchema.index({ slotId: 1 });
appointmentSchema.index({ patientId: 1 });
appointmentSchema.index({ patientPhone: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ paymentStatus: 1 });
appointmentSchema.index({ createdAt: -1 });
appointmentSchema.index({ appointmentDate: 1 }); // ✅ Index for appointmentDate

// =============================================
// VIRTUAL FIELDS
// =============================================

appointmentSchema.virtual('totalFee').get(function() {
  const consultationFee = this.consultationFee || 0;
  const servicesTotal = this.services.reduce((sum, service) => sum + (service.price || 0), 0);
  return consultationFee + servicesTotal;
});

appointmentSchema.virtual('servicesTotal').get(function() {
  return this.services.reduce((sum, service) => sum + (service.price || 0), 0);
});

appointmentSchema.virtual('grandTotal').get(function() {
  return (this.consultationFee || 0) + this.servicesTotal;
});

appointmentSchema.virtual('isCompleted').get(function() {
  return this.status === 'completed';
});

appointmentSchema.virtual('isCancelled').get(function() {
  return this.status === 'cancelled';
});

appointmentSchema.virtual('isActive').get(function() {
  return this.status !== 'cancelled' && this.status !== 'completed';
});

// =============================================
// METHODS
// =============================================

appointmentSchema.methods.confirm = function() {
  if (this.status !== 'pending') {
    throw new Error('Appointment cannot be confirmed');
  }
  this.status = 'confirmed';
  return this.save();
};

appointmentSchema.methods.startConsultation = function() {
  if (this.status !== 'confirmed' && this.status !== 'pending') {
    throw new Error('Appointment cannot be started');
  }
  this.status = 'consulting';
  this.consultationStarted = true;
  this.checkInTime = new Date();
  return this.save();
};

appointmentSchema.methods.complete = function() {
  if (this.status !== 'consulting' && this.status !== 'confirmed') {
    throw new Error('Appointment cannot be completed');
  }
  this.status = 'completed';
  this.consultationCompleted = true;
  this.completedAt = new Date();
  this.checkOutTime = new Date();
  return this.save();
};

appointmentSchema.methods.cancel = function(reason = '') {
  if (this.status === 'completed' || this.status === 'cancelled') {
    throw new Error('Appointment cannot be cancelled');
  }
  this.status = 'cancelled';
  this.cancelled = true;
  this.cancellationReason = reason;
  return this.save();
};

appointmentSchema.methods.addService = function(serviceData) {
  this.services.push({
    ...serviceData,
    addedAt: new Date()
  });
  this.totalAmount = this.grandTotal;
  return this.save();
};

appointmentSchema.methods.removeService = function(serviceId) {
  this.services = this.services.filter(s => s.serviceId !== serviceId);
  this.totalAmount = this.grandTotal;
  return this.save();
};

appointmentSchema.methods.markAsPaid = function(amount = null) {
  const amountToPay = amount || this.grandTotal;
  this.paymentStatus = 'Paid';
  this.amountPaid = amountToPay;
  this.balanceAmount = 0;
  this.billingDate = new Date();
  return this.save();
};

// =============================================
// STATICS
// =============================================

appointmentSchema.statics.getByPatientPhone = function(phone) {
  return this.find({ patientPhone: phone })
    .sort({ createdAt: -1 });
};

appointmentSchema.statics.getByPatientId = function(patientId) {
  return this.find({ patientId: patientId })
    .sort({ createdAt: -1 });
};

appointmentSchema.statics.getBySlotId = function(slotId) {
  return this.findOne({ slotId: slotId });
};

appointmentSchema.statics.getTodayAppointments = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return this.find({
    createdAt: { $gte: today, $lt: tomorrow }
  }).sort({ createdAt: 1 });
};

appointmentSchema.statics.getPendingAppointments = function() {
  return this.find({ status: 'pending' })
    .sort({ createdAt: -1 });
};

appointmentSchema.statics.getConfirmedAppointments = function() {
  return this.find({ status: 'confirmed' })
    .sort({ createdAt: -1 });
};

appointmentSchema.statics.getCompletedAppointments = function() {
  return this.find({ status: 'completed' })
    .sort({ createdAt: -1 });
};

appointmentSchema.statics.getCancelledAppointments = function() {
  return this.find({ status: 'cancelled' })
    .sort({ createdAt: -1 });
};

appointmentSchema.statics.getByDateRange = function(startDate, endDate) {
  return this.find({
    createdAt: { $gte: startDate, $lte: endDate }
  }).sort({ createdAt: 1 });
};

appointmentSchema.statics.getPaymentSummary = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$paymentStatus',
        count: { $sum: 1 },
        totalAmount: { $sum: '$totalAmount' },
        totalPaid: { $sum: '$amountPaid' }
      }
    }
  ]);
};

// ✅ NEW: Get appointments by appointmentDate
appointmentSchema.statics.getByAppointmentDate = function(date) {
  return this.find({ appointmentDate: date })
    .sort({ startTime: 1 });
};

// ✅ NEW: Get appointments by date range
appointmentSchema.statics.getByAppointmentDateRange = function(startDate, endDate) {
  return this.find({
    appointmentDate: { $gte: startDate, $lte: endDate }
  }).sort({ appointmentDate: 1, startTime: 1 });
};

// =============================================
// MIDDLEWARE
// =============================================

appointmentSchema.pre('save', function(next) {
  this.totalAmount = this.grandTotal;
  this.balanceAmount = this.totalAmount - (this.amountPaid || 0);
  next();
});

// Ensure virtuals are included in JSON output
appointmentSchema.set('toJSON', { virtuals: true });
appointmentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model("Appointment", appointmentSchema);