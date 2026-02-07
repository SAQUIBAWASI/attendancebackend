// const mongoose = require("mongoose");

// const clientRequestSchema = new mongoose.Schema({
//   clientName: { type: String, required: true },
//   companyName: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   phone: { type: String, required: true },
//   password: { type: String, required: true },
//   address: { type: String, required: true },
//   country: { type: String, required: true },
//   status: { 
//     type: String, 
//     enum: ["Pending", "Approved", "Rejected"], 
//     default: "Pending" 
//   },
// }, { timestamps: true });

// module.exports = mongoose.model("ClientRequest", clientRequestSchema);

const mongoose = require("mongoose");

const clientRequestSchema = new mongoose.Schema({
    fullName: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    mobileNumber: { 
        type: String, 
        required: true 
    },
    companyName: { 
        type: String, 
        required: true 
    },
    numberOfEmployees: { 
        type: String, 
        required: true 
    },
    address: { 
        type: String, 
        required: true 
    },
    country: { 
        type: String, 
        required: true 
    },
    status: { 
        type: String, 
        enum: ["Pending", "Approved", "Rejected"], 
        default: "Pending" 
    },
}, { timestamps: true });

module.exports = mongoose.model("ClientRequest", clientRequestSchema);