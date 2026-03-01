const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
    employeeId: {
        type: String,
        required: true,
        index: true
    },
    purpose: { type: String, required: true },
    date: { type: Date, required: true },
    km: { type: Number, required: true },
    rateApplied: { type: Number, required: true }, // The rate per KM at time of submission
    totalAmount: { type: Number, required: true }, // Calculated as km * rateApplied
    outcome: { type: String },
    orderValue: { type: Number, default: 0 },
    upsellValue: { type: Number, default: 0 },
    remark: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("Expense", expenseSchema);
