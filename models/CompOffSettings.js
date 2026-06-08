/**
 * 📌 Comp-Off Settings Schema
 */

const mongoose = require("mongoose");

const compOffSettingsSchema = new mongoose.Schema(
  {
    totalCompOff: {
      type: Number,
      default: 0
    },

    validityFrom: {
      type: Date,
    },

    validityTo: {
      type: Date,
    },

    status: {
      type: String,
      enum: ["active", "expired"],
      default: "active"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "CompOffSettings",
  compOffSettingsSchema
);