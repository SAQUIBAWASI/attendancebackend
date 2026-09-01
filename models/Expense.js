const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
    employeeId: {
        type: String,
        required: true,
        index: true
    },
    // ✅ ADD THIS FIELD
    employeeDetails: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',  // Employee model ka naam
        // OR if your Employee model is registered as 'employees'
        // ref: 'employees'
    },
    purpose: { type: String, required: true },
    date: { type: Date, required: true },
    km: { type: Number, required: true },
    rateApplied: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    outcome: { type: String },
    orderValue: { type: Number, default: 0 },
    upsellValue: { type: Number, default: 0 },
    remark: { type: String },
    stops: [
        {
            locationName: { type: String, required: true },
            outcome: { type: String },
            orderValue: { type: Number, default: 0 },
            upsellValue: { type: Number, default: 0 },
            km: { type: Number, default: 0 },
            amount: { type: Number, default: 0 }
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model("Expense", expenseSchema);