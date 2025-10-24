// const mongoose = require("mongoose");

// const attendanceSchema = new mongoose.Schema(
//   {
//     employeeId: {
//       type: String,
//       trim: true,
//     },
//     employeeEmail: {
//       type: String,
//       trim: true,
//     },
//     checkInTime: {
//       type: Date,
//       default: null,
//     },
//     checkOutTime: {
//       type: Date,
//       default: null,
//     },
//     totalHours: {
//       type: Number,
//       default: 0,
//       min: 0,
//     },
//     latitude: {
//       type: Number,
//     },
//     longitude: {
//       type: Number,
//     },
//     distance: {
//       type: Number,
//       default: 0,
//     },
//     onsite: {
//       type: Boolean,
//       default: false,
//     },
//     status: {
//       type: String,
//       enum: ["checked-in", "checked-out"],
//       default: "checked-out",
//     },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Attendance", attendanceSchema);


const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    employeeId: { type: String, required: true },
    employeeEmail: { type: String },
    checkInTime: { type: Date, required: true },   // MUST be required
    checkOutTime: { type: Date },
    totalHours: { type: Number, default: 0 },
    latitude: { type: Number },
    longitude: { type: Number },
    distance: { type: Number, default: 0 },
    onsite: { type: Boolean, default: false },
    status: { type: String, enum: ["checked-in", "checked-out"], default: "checked-in" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Attendance", attendanceSchema);

