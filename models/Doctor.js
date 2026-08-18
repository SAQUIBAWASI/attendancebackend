const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
    },
    phone: {
      type: String,
    },
    password: {
      type: String,
    },
    specialization: {
      type: String,
    },
    qualification: {
      type: String,
    },
    experience: {
      type: Number,
    },
    address: {
      type: String,
    },
    consultationFee: {
      type: Number,
    },
    availableDays: {
      type: [String],
    },
    availableTime: {
      type: String,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false
    }
  },
  {
    timestamps: true
  }
);

// Create index for faster searches
doctorSchema.index({ name: 1 });
doctorSchema.index({ phone: 1 });
doctorSchema.index({ email: 1 });
doctorSchema.index({ specialization: 1 });
doctorSchema.index({ status: 1 });

module.exports = mongoose.model('Doctor', doctorSchema);