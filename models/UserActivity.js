const mongoose = require("mongoose");

const userActivitySchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
            index: true, // Index for faster queries
        },
        userName: {
            type: String,
            required: true,
        },
        userEmail: {
            type: String,
            required: true,
        },
        userRole: {
            type: String,
            enum: ["employee", "admin"],
            required: true,
        },
        action: {
            type: String,
            enum: [
                "login",
                "logout",
                "leave_apply",
                "leave_approve",
                "leave_reject",
                "payslip_download",
            ],
            required: true,
            index: true, // Index for filtering by action
        },
        actionDetails: {
            type: String,
            default: "",
        },
        ipAddress: {
            type: String,
            default: null,
        },
        metadata: {
            type: mongoose.Schema.Types.Mixed, // Flexible JSON storage
            default: {},
        },
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt
    }
);

// Index for sorting by timestamp (newest first)
userActivitySchema.index({ createdAt: -1 });

// Compound index for common queries
userActivitySchema.index({ userId: 1, action: 1, createdAt: -1 });

module.exports = mongoose.model("UserActivity", userActivitySchema);
