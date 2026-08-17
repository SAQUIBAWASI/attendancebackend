const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true, min: 0, max: 120 },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  phone: {
    type: String,
    required: true,
    validate: {
      validator: function(v) { return /^\+?\d{7,15}$/.test(v); },
      message: props => `${props.value} is not a valid phone number!`
    }
  },
  address: { type: String },
  feeType: { type: String, enum: ['consultation', 'lab'], required: true },
  feeAmount: { type: Number, required: true, default: 300 },
  paymentType: { type: String, enum: ['online', 'cash'], required: true },
  reason: { type: String },
  paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('Patient', patientSchema);