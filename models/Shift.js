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
// models/Shift.js
// const mongoose = require("mongoose");

// // 🔥 IMPORTANT: delete old cached model
// if (mongoose.models.Shift) {
//   delete mongoose.models.Shift;
// }

// const shiftSchema = new mongoose.Schema(
//   {
//     shiftType: {
//       type: String,
//       required: true,
//       uppercase: true
//     },

//     shiftName: {
//       type: String,
//       required: true
//     },

//     timeSlots: [
//       {
//         slotId: String,
//         timeRange: String,
//         description: String
//       }
//     ],

//     employeeAssignment: {
//       employeeId: String,
//       employeeName: String,
//       selectedSlotId: String,
//       selectedTimeRange: String,
//       selectedDescription: String,
//       startTime: String,
//       endTime: String,
//       assignedDate: Date
//     },

//     // Legacy fields
//     employeeId: String,
//     employeeName: String,
//     startTime: String,
//     endTime: String,

//     isMasterShift: {
//       type: Boolean,
//       default: true
//     },

//     isActive: {
//       type: Boolean,
//       default: true
//     }
//   },
//   { timestamps: true }
// );

// // index
// shiftSchema.index(
//   { "employeeAssignment.employeeId": 1 },
//   { unique: true, sparse: true }
// );

// module.exports = mongoose.model("Shift", shiftSchema);


// const mongoose = require("mongoose");

// // 🔥 IMPORTANT: delete old cached model
// if (mongoose.models.Shift) {
//   delete mongoose.models.Shift;
// }

// const shiftSchema = new mongoose.Schema(
//   {
//     shiftType: {
//       type: String,
//       required: true,
//       uppercase: true
//     },

//     shiftName: {
//       type: String,
//       required: true
//     },

//     timeSlots: [
//       {
//         slotId: String,
//         timeRange: String,
//         description: String
//       }
//     ],

//     // ✅ NEW FIELD: For brake shift (07:00-13:00 and 17:00-21:30)
//     isBrakeShift: {
//       type: Boolean,
//       default: false
//     },

//     employeeAssignment: {
//       employeeId: String,
//       employeeName: String,
//       selectedSlotId: String,
//       selectedTimeRange: String,
//       selectedDescription: String,
//       startTime: String,
//       endTime: String,
//       assignedDate: Date
//     },

//     // Legacy fields
//     employeeId: String,
//     employeeName: String,
//     startTime: String,
//     endTime: String,

//     isMasterShift: {
//       type: Boolean,
//       default: true
//     },

//     isActive: {
//       type: Boolean,
//       default: true
//     }
//   },
//   { timestamps: true }
// );

// // index
// shiftSchema.index(
//   { "employeeAssignment.employeeId": 1 },
//   { unique: true, sparse: true }
// );

// module.exports = mongoose.model("Shift", shiftSchema);


const mongoose = require("mongoose");

// 🔥 IMPORTANT: delete old cached model
if (mongoose.models.Shift) {
  delete mongoose.models.Shift;
}

const shiftSchema = new mongoose.Schema(
  {
    shiftType: {
      type: String,
      required: true,
      uppercase: true
    },

    shiftName: {
      type: String,
      required: true
    },

    shiftCategory: {
      type: String,
      enum: ['Regular', 'Brake', 'Part Time', 'Consultant'],
      default: 'Regular'
    },

    timeSlots: [
      {
        slotId: String,
        timeRange: String,
        description: String,
        startTime: String,
        endTime: String
      }
    ],

    // ✅ For brake shift (07:00-13:00 and 17:00-21:30)
    isBrakeShift: {
      type: Boolean,
      default: false
    },

    employeeAssignment: {
      employeeId: String,
      employeeName: String,
      selectedSlotId: String,
      selectedTimeRange: String,
      selectedDescription: String,
      startTime: String,
      endTime: String,
      assignedDate: Date
    },

    // Legacy fields
    employeeId: String,
    employeeName: String,
    startTime: String,
    endTime: String,

    isMasterShift: {
      type: Boolean,
      default: true
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// index
shiftSchema.index(
  { "employeeAssignment.employeeId": 1 },
  { unique: true, sparse: true }
);

module.exports = mongoose.model("Shift", shiftSchema);