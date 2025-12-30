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
