const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
    },

    employeeName: {
      type: String
    },

    department: {
      type: String
    },

    issueTitle: {
      type: String,
    },

    issueDescription: {
      type: String,
    },

    issueType: {
      type: String,
      enum: [
        "Salary",
        "Attendance",
        "Leave",
        "Technical",
        "HR",
        "Admin",
        "Other"
      ],
      default: "Other"
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Urgent"],
      default: "Medium"
    },

    status: {
      type: String,
      enum: ["Open", "In Progress", "Resolved", "Rejected"],
      default: "Open"
    },

    adminRemark: {
      type: String,
      default: ""
    },

    resolvedAt: {
      type: Date
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Issue", issueSchema);