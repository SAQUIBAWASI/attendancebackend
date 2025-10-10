const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
   name: { type: String,  },
  email: { type: String, unique: true },
  department: { type: String },
  role: { type: String },
  joinDate: { type: Date },
  phone: { type: String, },
  address: { type: String },
  employeeId: { type: String, unique: true }
});

module.exports = mongoose.model("Employee", employeeSchema);
