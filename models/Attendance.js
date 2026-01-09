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


// const mongoose = require("mongoose");

// const attendanceSchema = new mongoose.Schema(
//   {
//     employeeId: { type: String, required: true },
//     employeeEmail: { type: String },
//     checkInTime: { type: Date, required: true },   // MUST be required
//     checkOutTime: { type: Date },
//     totalHours: { type: Number, default: 0 },
//     latitude: { type: Number },
//     longitude: { type: Number },
//     distance: { type: Number, default: 0 },
//     onsite: { type: Boolean, default: false },
//     status: { type: String, enum: ["checked-in", "checked-out"], default: "checked-in" },
//     reason: { type: String },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Attendance", attendanceSchema);

// const mongoose = require("mongoose");

// const attendanceSchema = new mongoose.Schema(
//   {
//     employee: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Employee",
//       required: true,
//     },
//     checkInTime: { type: Date, required: true },
//     checkOutTime: { type: Date },
//     totalHours: { type: Number, default: 0 },
//     latitude: { type: Number },
//     longitude: { type: Number },
//     distance: { type: Number, default: 0 },
//     onsite: { type: Boolean, default: false },
//     status: { type: String, enum: ["checked-in", "checked-out"], default: "checked-in" },
//     lateToday: { type: Boolean, default: false }
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Attendance", attendanceSchema);

// const mongoose = require("mongoose");

// const attendanceSchema = new mongoose.Schema(
//   {
//     employeeId: { type: String, required: true }, // matches employee.employeeId
//     employeeEmail: { type: String, required: true },
//     name: { type: String, default: "Unknown" },
//     shiftCode: { type: String, default: "A" },
//     checkInTime: { type: Date, required: true },
//     checkOutTime: { type: Date },
//     totalHours: { type: Number, default: 0 },
//     latitude: { type: Number },
//     longitude: { type: Number },
//     distance: { type: Number, default: 0 },
//     onsite: { type: Boolean, default: false },
//     officeName: { type: String, default: "Default Office" },
//     status: { type: String, enum: ["checked-in", "checked-out"], default: "checked-in" },
//     lateToday: { type: Boolean, default: false },
//     reason: { type: String }
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Attendance", attendanceSchema);

const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    employeeId: { type: String, required: true },
    name:{ type: String },
    employeeEmail: { type: String },
    checkInTime: { type: Date, required: true },   // MUST be required
    checkOutTime: { type: Date },
    totalHours: { type: Number, default: 0 },
    latitude: { type: Number },
    longitude: { type: Number },
    distance: { type: Number, default: 0 },
    onsite: { type: Boolean, default: false },
    status: { type: String, enum: ["checked-in", "checked-out"], default: "checked-in" },
    reason: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Attendance", attendanceSchema);