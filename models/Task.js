const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    taskName: {
      type: String,
      trim: true,
    },

    title: {
      type: String,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },

    createdByType: {
      type: String,
      enum: ["admin", "employee"],
      default: "admin",
    },

    assignType: {
      type: String,
      enum: ["ALL", "DEPARTMENT", "INDIVIDUAL", "SELF"],
      default: "DEPARTMENT",
    },

    assignedTo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
      },
    ],

    department: {
      type: String,
      default: null,
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
    },

    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed", "Rejected", "Overdue"],
      default: "Pending",
    },

    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    frequency: {
      type: [String],
      enum: ["One Time", "Daily", "Weekly", "Monthly"],
      default: ["One Time"],
    },

    submitDate: {
      type: Date,
      default: null,
    },

    subtasks: [
      {
        name: {
          type: String,
          trim: true,
        },
        description: {
          type: String,
          trim: true,
        },
        status: {
          type: String,
          enum: ["Pending", "In Progress", "Completed"],
          default: "Pending",
        },
        priority: {
          type: String,
          enum: ["Low", "Medium", "High", "Critical"],
          default: "Medium",
        },
        submitDate: {
          type: Date,
          default: null,
        },
        submittedDate: {
          type: Date,
          default: null,
        },
        _id: {
          type: String,
          default: () => new mongoose.Types.ObjectId().toString(),
        },
      },
    ],

    // ─── ✅ IMPORTANT: Employee-wise subtask progress tracking ───
employeeSubtaskProgress: {
  type: mongoose.Schema.Types.Mixed,  // ✅ Mixed type
  default: {}
},

    voiceNote: {
      type: String,
      default: null,
    },

    remark: {
      type: String,
      default: "",
    },

    employeeUpdates: [
      {
        employeeId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Employee",
        },

        updateText: {
          type: String,
          trim: true,
        },

        progress: {
          type: Number,
          default: 0,
          min: 0,
          max: 100,
        },

        remark: {
          type: String,
          default: "",
        },

        attachments: [
          {
            fileName: String,
            fileUrl: String,
          },
        ],

        updatedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    expenses: [
      {
        location: {
          address: {
            type: String,
          },

          latitude: {
            type: Number,
          },

          longitude: {
            type: Number,
          },
        },

        distance: {
          type: Number,
          default: 0,
        },

        expenseAmount: {
          type: Number,
          default: 0,
        },

        description: {
          type: String,
        },

        receiptImage: {
          type: String,
          default: null,
        },

        expenseDate: {
          type: Date,
          default: Date.now,
        },

        addedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Employee",
        },

        approvalStatus: {
          type: String,
          enum: ["Pending", "Approved", "Rejected"],
          default: "Pending",
        },

        approvedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Employee",
          default: null,
        },
      },
    ],

    attachments: [
      {
        fileName: {
          type: String,
        },

        fileUrl: {
          type: String,
        },

        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    reportedIssues: [
      {
        employeeId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Employee",
        },

        issueTitle: {
          type: String,
        },

        issueDescription: {
          type: String,
        },

        priority: {
          type: String,
          enum: ["Low", "Medium", "High", "Critical"],
          default: "Medium",
        },

        status: {
          type: String,
          enum: ["Open", "In Progress", "Resolved", "Closed"],
          default: "Open",
        },

        reportedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Task", taskSchema);