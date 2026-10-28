const mongoose = require("mongoose");

const holidaySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    fromDate: { type: String, required: true }, // "YYYY-MM-DD" string
    toDate: { type: String, required: true },   // "YYYY-MM-DD" string
    totalDays: { type: Number, default: 1 },
    type: { type: String, default: "Public Holiday" }, 
    state: { type: String, default: "All" }, 
    department: { type: String, default: "All" }, // e.g. "All" ya "Sales, HR"
    departments: [{ type: String }], // Array format for easy filtering
    isActive: { type: Boolean, default: true }, 
  },
  { timestamps: true }
);

module.exports = mongoose.model("Holiday", holidaySchema);