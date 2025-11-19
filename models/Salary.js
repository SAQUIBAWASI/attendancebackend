const mongoose = require("mongoose");

const EmployeeSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true
  },

  name: {
    type: String,
    required: true
  },

  salaryPerMonth: {
    type: Number,
    default: 0
  },

  shiftHours: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model("Salary", EmployeeSchema);
