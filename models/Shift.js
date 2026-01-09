// const mongoose = require("mongoose");

// const shiftSchema = new mongoose.Schema(
//   {
//     employeeId: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     employeeName: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     shiftType: {
//       type: String,
//       required: true,
//       enum: ["A", "B", "C", "D", "E", "F", "G", "H", "I"],
//     },
//     startTime: {
//       type: String,
//       required: true,
//     },
//     endTime: {
//       type: String,
//       required: true,
//     },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Shift", shiftSchema);


// models/Shift.js - FINAL VERSION
const mongoose = require("mongoose");

const shiftSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      trim: true,
    },
    employeeName: {
      type: String,
      required: true,
      trim: true,
    },
    shiftType: {
      type: String,
      required: true,
      // ❌ YE LINE COMMENT KAR DO YA HATA DO
      // enum: ["A", "B", "C", "D", "E", "F", "G", "H", "I"],
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Shift", shiftSchema);