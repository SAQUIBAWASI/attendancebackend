const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema(
  {
    slots: [
      {
        day: { type: String },
        date: { type: String },
        time_slots: [
          {
            time: { type: String },
            isBooked: { type: Boolean, default: false }
          }
        ]
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Slot", slotSchema);