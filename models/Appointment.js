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
    // APPOINTMENT DATE
    // =============================================
    appointmentDate: { type: String, default: "" },

    // =============================================
    // PATIENT DETAILS
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
    patientTitle: { type: String, default: "Mr." },
    patientDob: { type: String, default: "" },
    patientPhone: { type: String },
    patientEmail: { type: String, default: "" },
    patientAddress: { type: String, default: "" },
    patientCity: { type: String, default: "" },
    patientPincode: { type: String, default: "" },

    // Vitals
    vitalsTemp: { type: String, default: "" },
    vitalsBp: { type: String, default: "" },
    vitalsPr: { type: String, default: "" },
    vitalsWeight: { type: String, default: "" },

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

    // =============================================
    // REFERRAL FIELDS
    // =============================================
    referredBy: { type: String, default: "" },

    referralContactId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ReferralContact",
      default: null
    },
    referralCustomerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ReferralContact",
      default: null
    },
    referralDoctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ReferralContact",
      default: null
    },

    referredByCustomer: { type: String, default: "" },
    referredByDoctor: { type: String, default: "" },

    referralCommission: { type: String, default: "" },
    referralCommissionType: {
      type: String,
      enum: ["clinic", "pharmacy", "lab", "Clinic", "Pharmacy", "Lab", ""],
      default: ""
    },

    // ✅ Active/Inactive Flag (REAL FIELD — no virtual allowed)
    isActive: { type: Boolean, default: true },

    // =============================================
    // PARTNER PAYMENT
    // =============================================
    partnerPaymentStatus: {
      type: String,
      enum: ["Due", "Pending", "Paid"],
      default: "Due"
    },
    partnerPaymentUpdatedAt: {
      type: Date,
      default: null
    },

    // =============================================
    // INSURANCE
    // =============================================
    insuranceProvider: { type: String, default: "" },
    insurancePolicyNumber: { type: String, default: "" },

    // =============================================
    // PAYMENT DETAILS
    // =============================================
    paymentType: {
      type: String,
      enum: ["cash", "online", "insurance", "card", ""],
      default: "cash"
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Partial", "Due", "Refunded"],
      default: "Pending"
    },

    doctorPaymentStatus: {
      type: String,
      enum: ["Pending", "Paid"],
      default: "Pending"
    },
    doctorPaymentUpdatedAt: {
      type: Date,
      default: null
    },

    customerPaymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Partial", "Due"],
      default: "Pending"
    },

    // =============================================
    // MEDICINES (Pharmacy items)
    // =============================================
    medicines: [
      {
        name: { type: String, trim: true },
        price: { type: Number, default: 0, min: 0 },
      },
    ],

    // =============================================
    // ✅ EXTRA CHARGES
    // =============================================
    medicineTotal: { type: Number, default: 0, min: 0 },
    labTotal: { type: Number, default: 0, min: 0 },

    // =============================================
    // PAYMENT FIELDS
    // =============================================
    partialAmount: { type: Number, default: 0 },
    paymentTransactionId: { type: String, default: "" },
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
        price: { type: Number, default: 0 },
        description: { type: String, default: "" },
        paymentStatus: {
          type: String,
          enum: ["Pending", "Paid", "Partial", "Due"],
          default: "Pending"
        },
        addedAt: { type: Date, default: Date.now }
      }],
      default: []
    },

    // =============================================
    // ✅ CALCULATED FIELDS
    // =============================================
    servicesTotal: { type: Number, default: 0 },
    subtotal: { type: Number, default: 0 },
    totalFee: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },
    commissionAmount: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },      // ✅ ADD THIS
    finalPayable: { type: Number, default: 0 },
    finalPayableAmount: { type: Number, default: 0 },

    isOP: { type: Boolean, default: false },

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
    patientRating: { type: Number, min: 1, max: 5, default: null },
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
appointmentSchema.index({ appointmentDate: 1 });
appointmentSchema.index({ referralContactId: 1 });
appointmentSchema.index({ referralCustomerId: 1 });
appointmentSchema.index({ referralDoctorId: 1 });
appointmentSchema.index({ isActive: 1 });

// =============================================
// ✅ VIRTUALS — Only Safe Ones (NO conflict with real fields)
// =============================================
appointmentSchema.virtual('isCompleted').get(function () {
  return this.status === 'completed';
});

appointmentSchema.virtual('isCancelled').get(function () {
  return this.status === 'cancelled';
});

// ❌ REMOVED — conflicts with real `isActive` field:
// appointmentSchema.virtual('isActive').get(function () {
//   return this.status !== 'cancelled' && this.status !== 'completed';
// });

// =============================================
// METHODS
// =============================================

appointmentSchema.methods.confirm = function () {
  if (this.status !== 'pending') {
    throw new Error('Appointment cannot be confirmed');
  }
  this.status = 'confirmed';
  return this.save();
};

appointmentSchema.methods.startConsultation = function () {
  if (this.status !== 'confirmed' && this.status !== 'pending') {
    throw new Error('Appointment cannot be started');
  }
  this.status = 'consulting';
  this.consultationStarted = true;
  this.checkInTime = new Date();
  return this.save();
};

appointmentSchema.methods.complete = function () {
  if (this.status !== 'consulting' && this.status !== 'confirmed') {
    throw new Error('Appointment cannot be completed');
  }
  this.status = 'completed';
  this.consultationCompleted = true;
  this.completedAt = new Date();
  this.checkOutTime = new Date();
  return this.save();
};

appointmentSchema.methods.cancel = function (reason = '') {
  if (this.status === 'completed' || this.status === 'cancelled') {
    throw new Error('Appointment cannot be cancelled');
  }
  this.status = 'cancelled';
  this.cancelled = true;
  this.cancellationReason = reason;
  return this.save();
};

appointmentSchema.methods.addService = function (serviceData) {
  this.services.push({
    ...serviceData,
    paymentStatus: serviceData.paymentStatus || "Pending",
    addedAt: new Date()
  });
  return this.save();
};

appointmentSchema.methods.removeService = function (serviceId) {
  this.services = this.services.filter(s => s.serviceId !== serviceId);
  return this.save();
};

appointmentSchema.methods.markAsPaid = function (amount = null) {
  const amountToPay = amount || this.finalPayable || this.totalAmount;
  this.paymentStatus = 'Paid';
  this.amountPaid = amountToPay;
  this.balanceAmount = 0;
  this.billingDate = new Date();
  return this.save();
};

appointmentSchema.methods.updateServicePaymentStatus = function (serviceId, paymentStatus) {
  const service = this.services.find(s => s.serviceId === serviceId);
  if (service) {
    service.paymentStatus = paymentStatus;
    return this.save();
  }
  throw new Error('Service not found');
};

appointmentSchema.methods.recalculateTotals = function () {
  const servicesTotal = this.services.reduce(
    (sum, s) => sum + (Number(s.price) || 0),
    0
  );
  const medTotal = Number(this.medicineTotal) || 0;
  const labT = Number(this.labTotal) || 0;
  const commissionPercent = parseFloat(this.referralCommission) || 0;
  const commissionAmount = (servicesTotal * commissionPercent) / 100;
  const grandTotal = servicesTotal + medTotal + labT - commissionAmount;

  this.servicesTotal = servicesTotal;
  this.subtotal = servicesTotal;
  this.totalFee = servicesTotal;
  this.totalAmount = grandTotal;
  this.grandTotal = grandTotal;
  this.commissionAmount = commissionAmount;
  this.finalPayable = grandTotal;
  this.finalPayableAmount = grandTotal;

  const amountPaid = Number(this.amountPaid) || 0;
  this.balanceAmount = Math.max(0, grandTotal - amountPaid);

  if (this.balanceAmount === 0 && amountPaid > 0) {
    this.paymentStatus = "Paid";
  } else if (amountPaid > 0 && this.balanceAmount > 0) {
    this.paymentStatus = "Partial";
  } else if (amountPaid === 0 && grandTotal > 0) {
    if (this.paymentStatus !== "Due") {
      this.paymentStatus = "Pending";
    }
  }

  return this.save();
};

// =============================================
// STATICS
// =============================================

appointmentSchema.statics.getByPatientPhone = function (phone) {
  return this.find({ patientPhone: phone }).sort({ createdAt: -1 });
};

appointmentSchema.statics.getByPatientId = function (patientId) {
  return this.find({ patientId: patientId }).sort({ createdAt: -1 });
};

appointmentSchema.statics.getBySlotId = function (slotId) {
  return this.findOne({ slotId: slotId });
};

appointmentSchema.statics.getTodayAppointments = function () {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return this.find({
    createdAt: { $gte: today, $lt: tomorrow }
  }).sort({ createdAt: 1 });
};

appointmentSchema.statics.getPendingAppointments = function () {
  return this.find({ status: 'pending' }).sort({ createdAt: -1 });
};

appointmentSchema.statics.getConfirmedAppointments = function () {
  return this.find({ status: 'confirmed' }).sort({ createdAt: -1 });
};

appointmentSchema.statics.getCompletedAppointments = function () {
  return this.find({ status: 'completed' }).sort({ createdAt: -1 });
};

appointmentSchema.statics.getCancelledAppointments = function () {
  return this.find({ status: 'cancelled' }).sort({ createdAt: -1 });
};

appointmentSchema.statics.getByDateRange = function (startDate, endDate) {
  return this.find({
    createdAt: { $gte: startDate, $lte: endDate }
  }).sort({ createdAt: 1 });
};

appointmentSchema.statics.getPaymentSummary = function () {
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

appointmentSchema.statics.getByAppointmentDate = function (date) {
  return this.find({ appointmentDate: date }).sort({ startTime: 1 });
};

appointmentSchema.statics.getByAppointmentDateRange = function (startDate, endDate) {
  return this.find({
    appointmentDate: { $gte: startDate, $lte: endDate }
  }).sort({ appointmentDate: 1, startTime: 1 });
};

appointmentSchema.statics.getByReferralContactId = function (referralContactId) {
  return this.find({ referralContactId: referralContactId }).sort({ createdAt: -1 });
};

appointmentSchema.statics.getByReferralCustomerId = function (referralCustomerId) {
  return this.find({ referralCustomerId: referralCustomerId }).sort({ createdAt: -1 });
};

appointmentSchema.statics.getByReferralDoctorId = function (referralDoctorId) {
  return this.find({ referralDoctorId: referralDoctorId }).sort({ createdAt: -1 });
};

// ✅ NEW: Get active / inactive appointments
appointmentSchema.statics.getActiveAppointments = function () {
  return this.find({ isActive: true }).sort({ createdAt: -1 });
};

appointmentSchema.statics.getInactiveAppointments = function () {
  return this.find({ isActive: false }).sort({ createdAt: -1 });
};

// =============================================
// ✅ PRE-SAVE MIDDLEWARE — CENTRAL CALCULATION
// =============================================
appointmentSchema.pre('save', function (next) {
  const servicesTotal = (this.services || []).reduce(
    (sum, service) => sum + (Number(service.price) || 0),
    0
  );

  const medTotal = Number(this.medicineTotal) || 0;
  const labT = Number(this.labTotal) || 0;

  const commissionPercent = parseFloat(this.referralCommission) || 0;
  const commissionAmount = (servicesTotal * commissionPercent) / 100;

  const grandTotal = servicesTotal + medTotal + labT - commissionAmount;

  this.servicesTotal = servicesTotal;
  this.subtotal = servicesTotal;
  this.totalFee = servicesTotal;
  this.totalAmount = grandTotal;
  this.grandTotal = grandTotal;
  this.commissionAmount = commissionAmount;
  this.finalPayable = grandTotal;
  this.finalPayableAmount = grandTotal;

  const amountPaid = Number(this.amountPaid) || 0;
  this.balanceAmount = Math.max(0, grandTotal - amountPaid);

  if (this.balanceAmount === 0 && amountPaid > 0) {
    this.paymentStatus = "Paid";
  } else if (amountPaid > 0 && this.balanceAmount > 0) {
    this.paymentStatus = "Partial";
  } else if (amountPaid === 0 && grandTotal > 0) {
    if (this.paymentStatus !== "Due") {
      this.paymentStatus = "Pending";
    }
  }

  next();
});

// Ensure virtuals are included in JSON output
appointmentSchema.set('toJSON', { virtuals: true });
appointmentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model("Appointment", appointmentSchema);