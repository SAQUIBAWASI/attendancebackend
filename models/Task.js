const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
{
    taskName: {
        type: String,
        required: true
    },

    title: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },

    createdByType: {
        type: String,
        enum: ["admin", "employee"],
        required: true
    },

    assignType: {
        type: String,
        enum: ["ALL", "DEPARTMENT", "INDIVIDUAL", "SELF"],
        required: true
    },

    assignedTo: [{
        type: mongoose.Schema.Types.ObjectId
    }],

    department: {
        type: String,
        default: null
    },

    priority: {
        type: String,
        enum: ["Low", "Medium", "High", "Critical"],
        default: "Medium"
    },

    status: {
        type: String,
        enum: [
            "Pending",
            "In Progress",
            "Completed",
            "Rejected",
            "Overdue"
        ],
        default: "Pending"
    },

    progress: {
        type: Number,
        default: 0
    },

    deadlineType: {
        type: String,
        enum: ["Days", "Week", "Month", "Custom"]
    },

    deadlineValue: Number,

    dueDate: Date,

    attachments: [
        {
            fileName: String,
            fileUrl: String,
            uploadedAt: {
                type: Date,
                default: Date.now
            }
        }
    ]
},
{
    timestamps: true
});


module.exports = mongoose.model("Task", taskSchema);