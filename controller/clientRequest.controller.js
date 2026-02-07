// const ClientRequest = require("../models/clientRequest.model");
// const Admin = require("../models/Admin"); // Assuming we create an Admin/Client from this
// // Note: The user request is to "send to admin panel" and "super admin accept/reject".
// // When accepted, it should probably create a real Client/Admin user. 
// // For now, I'll just handle the Request CRUD. The "Accept" logic will need to create the actual user.

// // 🟢 Create a new Client Registration Request
// const createClientRequest = async (req, res) => {
//   try {
//     const { clientName, companyName, email, phone, password, address, country } = req.body;

//     // Check if email already exists in requests
//     const existingRequest = await ClientRequest.findOne({ email });
//     if (existingRequest) {
//       return res.status(400).json({ success: false, message: "Request with this email already exists" });
//     }

//     // Check if email already exists in actual Admin/Client table (optional but good)
//     const existingAdmin = await Admin.findOne({ email });
//     if (existingAdmin) {
//       return res.status(400).json({ success: false, message: "Email already registered as Client/Admin" });
//     }

//     const newRequest = new ClientRequest({
//       clientName,
//       companyName,
//       email,
//       phone,
//       password, // In a real app, hash this! But for now keeping simple or relying on frontend/pre-save? 
//                 // Better to hash it here if we can, or just store it plain if that's the pattern (not recommended but fast).
//                 // I will store it as is for now and hash it when "Accepted" and moved to Admin table, 
//                 // OR hash it here. Let's start with storing it, assuming the Admin creation process handles hashing.
//       address,
//       country,
//     });

//     await newRequest.save();
//     res.status(201).json({ success: true, message: "Registration request submitted. Pending Approval." });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // 🟢 Get All Pending Requests (For Super Admin)
// const getAllClientRequests = async (req, res) => {
//   try {
//     const requests = await ClientRequest.find({ status: "Pending" }).sort({ createdAt: -1 });
//     res.status(200).json({ success: true, requests });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // 🟢 Update Request Status (Accept/Reject)
// const updateRequestStatus = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status } = req.body; // "Approved" or "Rejected"

//     if (!["Approved", "Rejected"].includes(status)) {
//       return res.status(400).json({ success: false, message: "Invalid status" });
//     }

//     const request = await ClientRequest.findById(id);
//     if (!request) {
//       return res.status(404).json({ success: false, message: "Request not found" });
//     }

//     request.status = status;
//     await request.save();

//     if (status === "Approved") {
//       // Logic to create the actual Client/Admin account
//       // This matches the `registerAdmin` logic in adminController.js
//       const newClient = new Admin({
//         name: request.clientName,
//         email: request.email,
//         mobile: request.phone,
//         password: request.password, 
//         role: "admin", // Assuming "Client" users are "admin" role in this system? 
//                        // Based on ClientsTable.js, they seem to be clients. 
//                        // But Login.js only checks `api/admin/login` and `api/employees/login`.
//                        // So "Clients" are likely "Admins" of their own company.
//       });
//       await newClient.save();
//       return res.status(200).json({ success: true, message: "Request Approved and Client Account Created", client: newClient });
//     }

//     res.status(200).json({ success: true, message: `Request ${status}` });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// module.exports = { createClientRequest, getAllClientRequests, updateRequestStatus };


const ClientRequest = require("../models/clientRequest.model");
const Admin = require("../models/Admin");

// 🟢 Create a new Client Registration Request
const createClientRequest = async (req, res) => {
  try {
    const { fullName, email, mobileNumber, companyName, numberOfEmployees, address, country } = req.body;

    // Check if email already exists in requests
    const existingRequest = await ClientRequest.findOne({ email });
    if (existingRequest) {
      return res.status(400).json({ success: false, message: "Request with this email already exists" });
    }

    // Check if email already exists in actual Admin/Client table (optional but good)
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ success: false, message: "Email already registered as Client/Admin" });
    }

    const newRequest = new ClientRequest({
      fullName,
      email,
      mobileNumber,
      companyName,
      numberOfEmployees,
      address,
      country,
    });

    await newRequest.save();
    res.status(201).json({ success: true, message: "Registration request submitted. Pending Approval." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🟢 Get All Pending Requests (For Super Admin)
const getAllClientRequests = async (req, res) => {
  try {
    const requests = await ClientRequest.find({ status: "Pending" }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🟢 Update Request Status (Accept/Reject)
const updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // "Approved" or "Rejected"

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const request = await ClientRequest.findById(id);
    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    request.status = status;
    await request.save();

    if (status === "Approved") {
      // Create the actual Client/Admin account
      // Note: You might want to generate a temporary password or send a password setup link
      const newClient = new Admin({
        name: request.fullName,
        email: request.email,
        mobile: request.mobileNumber,
        companyName: request.companyName,
        role: "admin", // Or "client" based on your system
        // You'll need to handle password separately - maybe send a setup email
      });
      await newClient.save();
      return res.status(200).json({ success: true, message: "Request Approved and Client Account Created", client: newClient });
    }

    res.status(200).json({ success: true, message: `Request ${status}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createClientRequest, getAllClientRequests, updateRequestStatus };