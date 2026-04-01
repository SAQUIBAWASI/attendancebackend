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

// const mongoose = require("mongoose");

// const clientRequestSchema = new mongoose.Schema({
//     fullName: { 
//         type: String, 
//         required: true 
//     },
//     email: { 
//         type: String, 
//         required: true, 
//         unique: true 
//     },
//     mobileNumber: { 
//         type: String, 
//         required: true 
//     },
//     companyName: { 
//         type: String, 
//         required: true 
//     },
//     numberOfEmployees: { 
//         type: String, 
//         required: true 
//     },
//     address: { 
//         type: String, 
//         required: true 
//     },
//     country: { 
//         type: String, 
//         required: true 
//     },
//     status: { 
//         type: String, 
//         enum: ["Pending", "Approved", "Rejected"], 
//         default: "Pending" 
//     },
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
        unique: true,
        lowercase: true,
        trim: true
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
    pincode: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    country: { 
        type: String, 
        required: true 
    },
    countryCode: {
        type: String
    },
    fullAddress: {
        type: String
    },
    selectedProducts: [{
        type: String,
        enum: ['hr', 'attendance', 'coworking', 'projects', 'appointments', 'wellness', 
               'support', 'security', 'accounting', 'knowledge', 'studio', 'rentals',
               'sign', 'crm', 'subscriptions', 'pos', 'discuss', 'documents']
    }],
    status: { 
        type: String, 
        enum: ["Pending", "Approved", "Rejected"], 
        default: "Pending" 
    },
    notes: {
        type: String,
        default: ''
    }
}, { 
    timestamps: true 
});

// Add index for better query performance
clientRequestSchema.index({ email: 1 });
clientRequestSchema.index({ status: 1 });
clientRequestSchema.index({ createdAt: -1 });

module.exports = mongoose.model("ClientRequest", clientRequestSchema);