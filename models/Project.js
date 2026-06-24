const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    projectName: {
      type: String,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },

    startDate: {
      type: Date,
    },

    endDate: {
      type: Date,
    },

    projectManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },

    teamMembers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
      },
    ],

    status: {
      type: String,
      enum: ["Active", "On Hold", "Completed"],
      default: "Active",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
    },

    createdByType: {
      type: String,
      enum: ["admin", "employee"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Project", projectSchema);