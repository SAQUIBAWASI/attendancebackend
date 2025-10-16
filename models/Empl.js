const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobile: { type: String, required: true },
    password: { type: String, required: true }, 
    employeeId: { type: String, unique: true }, 
    role: { type: String, default: "employee" }
  },
  { timestamps: true }
);

const Empl = mongoose.models.Empl || mongoose.model("Empl", employeeSchema);
module.exports = Empl;
