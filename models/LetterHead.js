const mongoose = require('mongoose');

const letterHeadSchema = new mongoose.Schema({
  letterheadUrl: {
    type: String,
  },
  name: {
    type: String,
    default: 'Letterhead'
  },
  isDefault: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('LetterHead', letterHeadSchema);