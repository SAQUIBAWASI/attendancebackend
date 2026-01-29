const mongoose = require("mongoose");

const permissionSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String, // or ObjectId later
      required: true,
    },

    employeeName: {
      type: String,
      required: true,
    },

    reason: {
      type: String,
      required: true,
    },

    duration: {
      type: Number, // in minutes (ex: 30)
      required: true,
    },

    startTime: {
      type: Date, // set when admin approves
    },

    endTime: {
      type: Date, // startTime + duration
    },

    returnedAt: {
      type: Date, // back to duty time
    },

    returnLocation: {
      lat: Number,
      lng: Number,
    },

    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "COMPLETED"],
      default: "PENDING",
    },
  },
  { timestamps: true } // createdAt = request time
);

module.exports = mongoose.model("Permission", permissionSchema);
