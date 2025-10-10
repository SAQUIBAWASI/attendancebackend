// models/shift.model.js
const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  days: {
    type: [String],
    required: true,
    validate: [arr => arr.length > 0, 'At least one day is required'],
  },
}, { timestamps: true });

const Shift = mongoose.model('Shift', shiftSchema);
module.exports = Shift;
