const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    price: {
      type: Number,
    },
    description: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true // Automatically adds createdAt and updatedAt
  }
);

// Index for faster search
serviceSchema.index({ name: 'text' });

module.exports = mongoose.model('Service', serviceSchema);