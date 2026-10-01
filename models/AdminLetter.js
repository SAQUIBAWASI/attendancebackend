const mongoose = require('mongoose');

const adminLetterSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    index: true,
  },
  employeeObjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    index: true,
  },
  employeeName: {
    type: String,
    default: '',
  },
  letterType: {
    type: String,
    required: true,
    default: 'experience',
    index: true,
  },
  content: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  status: {
    type: String,
    enum: ['draft', 'sent'],
    default: 'draft',
    index: true,
  },
  letterPdfUrl: {
  type: String,
  default: null,
},
  sentAt: {
    type: Date,
  },
}, {
  timestamps: true
});

module.exports = mongoose.model('AdminLetter', adminLetterSchema);
