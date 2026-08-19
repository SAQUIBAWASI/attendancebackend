const mongoose = require("mongoose");

const appointmentSlotSchema = new mongoose.Schema({
  // =============================================
  // SLOT IDENTIFICATION (ALL OPTIONAL)
  // =============================================
  slotId: { type: String, sparse: true },
  doctorId: { type: String },
  doctorName: { type: String },
  doctorSpecialization: { type: String, default: "" },
  
  // =============================================
  // SLOT TIMING (ALL OPTIONAL)
  // =============================================
  dayOfWeek: { type: String }, // Monday, Tuesday, ...
  date: { type: String, default: "" }, // Specific date YYYY-MM-DD
  startTime: { type: String }, // e.g. "09:00 AM"
  endTime: { type: String }, // e.g. "09:20 AM"
  startTime24: { type: String }, // e.g. "09:00"
  endTime24: { type: String }, // e.g. "09:20"
  duration: { type: Number, default: 20 }, // e.g. 20 mins
  gap: { type: Number, default: 5 }, // e.g. 5 mins
  shift: { type: String, default: "Morning" }, // Morning / Evening
  slotNumber: { type: Number, default: 0 },
  
  // =============================================
  // SLOT TYPE & STATUS
  // =============================================
  type: { 
    type: String, 
    enum: ["op", "break"], 
    default: "op" 
  },
  status: { 
    type: String, 
    enum: ["available", "booked", "blocked", "break"], 
    default: "available" 
  },
  
  // =============================================
  // CONSULTATION FEE
  // =============================================
  consultationFee: { type: Number, default: 300 },
  
  // =============================================
  // ACTIVE STATUS
  // =============================================
  isActive: { type: Boolean, default: true }

}, { timestamps: true });

// =============================================
// INDEXES FOR FASTER QUERIES
// =============================================
appointmentSlotSchema.index({ slotId: 1 });
appointmentSlotSchema.index({ dayOfWeek: 1 });
appointmentSlotSchema.index({ status: 1 });
appointmentSlotSchema.index({ doctorId: 1 });
appointmentSlotSchema.index({ date: 1 });
appointmentSlotSchema.index({ startTime24: 1 });
appointmentSlotSchema.index({ endTime24: 1 });

// =============================================
// VIRTUAL FIELDS
// =============================================

// Is Available for Booking
appointmentSlotSchema.virtual('isAvailable').get(function() {
  return this.status === 'available' && this.type === 'op';
});

// Is Booked
appointmentSlotSchema.virtual('isBooked').get(function() {
  return this.status === 'booked';
});

// =============================================
// METHODS
// =============================================

// Check if slot is available
appointmentSlotSchema.methods.isSlotAvailable = function() {
  return this.status === 'available' && this.type === 'op';
};

// Book the slot
appointmentSlotSchema.methods.bookSlot = function() {
  if (this.status !== 'available') {
    throw new Error('Slot is not available for booking');
  }
  this.status = 'booked';
  return this.save();
};

// Cancel booking
appointmentSlotSchema.methods.cancelBooking = function() {
  if (this.status !== 'booked') {
    throw new Error('Slot is not booked');
  }
  this.status = 'available';
  return this.save();
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

// Get slots by doctor
appointmentSlotSchema.statics.getSlotsByDoctor = function(doctorId) {
  return this.find({ 
    doctorId: doctorId,
    type: 'op'
  }).sort({ dayOfWeek: 1, startTime24: 1 });
};

// Get available slots by doctor and day
appointmentSlotSchema.statics.getAvailableSlotsByDoctorAndDay = function(doctorId, day) {
  return this.find({ 
    doctorId: doctorId,
    dayOfWeek: day,
    status: 'available',
    type: 'op'
  }).sort({ startTime24: 1 });
};

// Get slot by slotId
appointmentSlotSchema.statics.getBySlotId = function(slotId) {
  return this.findOne({ slotId: slotId });
};

// Get all available slots
appointmentSlotSchema.statics.getAllAvailableSlots = function() {
  return this.find({ 
    status: 'available',
    type: 'op'
  }).sort({ dayOfWeek: 1, startTime24: 1 });
};

// Get slots by date
appointmentSlotSchema.statics.getSlotsByDate = function(date) {
  return this.find({ 
    date: date,
    type: 'op'
  }).sort({ startTime24: 1 });
};

// Ensure virtuals are included in JSON output
appointmentSlotSchema.set('toJSON', { virtuals: true });
appointmentSlotSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model("AppointmentSlot", appointmentSlotSchema);