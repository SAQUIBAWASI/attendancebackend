const mongoose = require("mongoose");

const holidaySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    fromDate: { type: String, required: true }, // "YYYY-MM-DD" string
    toDate: { type: String, required: true },   // "YYYY-MM-DD" string
    totalDays: { type: Number, default: 1 },
    type: { type: String, default: "Public Holiday" }, // Festival, National Holiday, etc.
  },
  { timestamps: true }
);

module.exports = mongoose.model("Holiday", holidaySchema);
