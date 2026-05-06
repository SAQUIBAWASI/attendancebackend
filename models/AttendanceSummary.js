// const mongoose = require("mongoose");

// const AttendanceSummarySchema = new mongoose.Schema({
//   employeeId: {
//     type: String,
//     required: true,
//   },

//   name: {
//     type: String,
//     default: "Unknown",
//   },

//   presentDays: { type: Number, default: 0 },
//   lateDays: { type: Number, default: 0 },
//   onsiteDays: { type: Number, default: 0 },
//   halfDayLeaves: { type: Number, default: 0 },
//   fullDayLeaves: { type: Number, default: 0 },
//   totalWorkingDays: { type: Number, default: 0 },

//   fromDate: { type: Date },
//   toDate: { type: Date },
//   month: { type: String }, // "2025-11"

//   createdAt: {
//     type: Date,
//     default: Date.now,
//   }
// });

// module.exports = mongoose.model("AttendanceSummary", AttendanceSummarySchema);

const mongoose = require("mongoose");

const AttendanceSummarySchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
  },

  name: {
    type: String,
    default: "Unknown",
  },

  presentDays: { type: Number, default: 0 },
  lateDays: { type: Number, default: 0 },
  onsiteDays: { type: Number, default: 0 },
  halfDayWorking: { type: Number, default: 0 }, // Changed from halfDayLeaves
  fullDayNotWorking: { type: Number, default: 0 }, // Changed from fullDayLeaves
  totalWorkingDays: { type: Number, default: 0 },

  onsiteYesDays: { type: Number, default: 0 },
  onsiteNoDays: { type: Number, default: 0 },

  reasonCount: {
    onsite: { type: Number, default: 0 },
    fieldWork: { type: Number, default: 0 },
    workFromHome: { type: Number, default: 0 }
  },

  // Payroll Fields
  salaryPerMonthSnapshot: { type: Number, default: 0 },
  basicPaySnapshot: { type: Number, default: 0 },
  hraSnapshot: { type: Number, default: 0 },
  conveyanceAllowanceSnapshot: { type: Number, default: 0 },
  medicalAllowanceSnapshot: { type: Number, default: 0 },
  performanceAllowanceSnapshot: { type: Number, default: 0 },
  specialAllowanceSnapshot: { type: Number, default: 0 },
  ptaxSnapshot: { type: Number, default: 0 },
  gmcAmountSnapshot: { type: Number, default: 0 },
  otherDeductionsSnapshot: { type: Number, default: 0 },
  calculatedSalary: { type: Number, default: 0 },
  weekOffDays: { type: Number, default: 0 },
  holidays: { type: Number, default: 0 },
  extraWork: {
    extraDays: { type: Number, default: 0 },
    extraHours: { type: Number, default: 0 },
    bonus: { type: Number, default: 0 },
    deductions: { type: Number, default: 0 },
    reason: { type: String, default: "" }
  },

  overTimeHours: { type: Number, default: 0 }, // 👈 OT

  fromDate: { type: Date },
  toDate: { type: Date },
  month: { type: String }, // "2025-11"

  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model("AttendanceSummary", AttendanceSummarySchema);
