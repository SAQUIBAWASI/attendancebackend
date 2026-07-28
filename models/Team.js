const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema(
  {
    teamName: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    teamLead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },

    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
      },
    ],

    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
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

module.exports = mongoose.model("Team", teamSchema);