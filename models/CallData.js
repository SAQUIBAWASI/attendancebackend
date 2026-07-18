const mongoose = require("mongoose");

const callDataSchema = new mongoose.Schema({
    employeeId: {
        type: String,
        required: true,
        index: true
    },
    centerName: { type: String, required: true },
    clientName: { type: String, required: true },
    contact: { type: String, required: true },
    address: { type: String, required: true },
    addressLink: { type: String },
    status: { 
        type: String, 
        enum: ["Pending", "Lead", "Rejected"], 
        default: "Pending" 
    },
    remarks: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("CallData", callDataSchema);