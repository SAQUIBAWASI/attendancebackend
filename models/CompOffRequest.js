const mongoose = require("mongoose");

const compOffRequestSchema = new mongoose.Schema(
  {
    employeeId: { 
      type: String, 
      required: true 
    },
    employeeName: { 
      type: String, 
      required: true 
    },
    originalLeaveId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Leave",
      required: true 
    },
    workDate: { 
      type: String, 
      required: true 
    },
    reason: { 
      type: String, 
      default: "" 
    },
    // Add this field in your schema
count: { type: Number, default: 1, min: 0.5 },
    status: { 
      type: String, 
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },
    approvedBy: { 
      type: String,
      default: null
    },
    approvedDate: { 
      type: Date 
    },
    convertedToCompOff: {
      type: Boolean,
      default: false
    },
    compOffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CompOff"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("CompOffRequest", compOffRequestSchema);