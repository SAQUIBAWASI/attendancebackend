const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  name: { type: String, },
  age: { type: Number, min: 0, max: 120 },
  gender: { type: String, enum: ['Male', 'Female', 'Other'],  },
  phone: {
    type: String,
    validate: {
      validator: function(v) { return /^\+?\d{7,15}$/.test(v); },
      message: props => `${props.value} is not a valid phone number!`
    }
  },
   dob: { 
    type: Date,
  },
  address: { type: String },
  feeType: { type: String, enum: ['consultation', 'lab'], },
  feeAmount: { type: Number, default: 300 },
  paymentType: { type: String, enum: ['online', 'cash'],  },
  reason: { type: String },
  paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Due'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('Patient', patientSchema);