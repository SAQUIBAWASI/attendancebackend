const mongoose = require("mongoose");

const holidaySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    date: { type: String, required: true }, // Format "YYYY-MM-DD"
    day: { type: String }, // e.g., "Monday"
    year: { type: String, required: true },
    type: { type: String, default: "National" }, // National, Regional, etc.
  },
  { timestamps: true }
);

module.exports = mongoose.model("Holiday", holidaySchema);
