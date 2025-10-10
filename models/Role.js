const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  permissions: {
    type: [String],
    required: true,
    validate: [arr => arr.length > 0, 'At least one permission is required']
  }
}, { timestamps: true });

const Role = mongoose.model('Role', roleSchema);
module.exports = Role;
