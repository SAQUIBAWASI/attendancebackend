const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, required: true },
  password: { type: String, required: true }, // new field
  department: { type: String },
  role: { type: String },
  joinDate: { type: Date },
  phone: { type: String },
  address: { type: String },
  employeeId: { type: String, unique: true, required: true }
});

module.exports = mongoose.model("Employee", employeeSchema);
