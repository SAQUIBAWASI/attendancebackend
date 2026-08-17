const mongoose = require("mongoose");

const shiftSchema = new mongoose.Schema({
  name: { type: String, default: "Shift" },
  startTime: { type: String, required: true }, // Format "HH:mm" e.g. "09:00"
  endTime: { type: String, required: true }    // Format "HH:mm" e.g. "14:00"
});

const breakSchema = new mongoose.Schema({
  name: { type: String, default: "Break" },
  startTime: { type: String, required: true }, // Format "HH:mm" e.g. "14:00"
  endTime: { type: String, required: true }    // Format "HH:mm" e.g. "15:00"
});

const dayScheduleSchema = new mongoose.Schema({
  dayOfWeek: { 
    type: String, 
    required: true, 
    enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] 
  },
  isWorking: { type: Boolean, default: true },
  shifts: [shiftSchema],
  breaks: [breakSchema]
});

const appointmentSlotConfigSchema = new mongoose.Schema({
  configName: { type: String, default: "Default Appointment Schedule" },
  doctorId: { type: String, default: "default" },
  opDuration: { type: Number, default: 20, required: true }, // in minutes
  opGap: { type: Number, default: 5, required: true },        // in minutes
  consultationFee: { type: Number, default: 300, required: true }, // in Rupees (₹)
  weeklySchedules: [dayScheduleSchema]
}, { timestamps: true });


module.exports = mongoose.model("AppointmentSlotConfig", appointmentSlotConfigSchema);