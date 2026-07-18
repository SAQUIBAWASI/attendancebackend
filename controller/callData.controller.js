const CallData = require("../models/CallData");

// Add a new call data record
exports.addCallData = async (req, res) => {
    try {
        const {
            employeeId, centerName, clientName, contact,
            address, addressLink, status, remarks
        } = req.body;

        if (!employeeId || !centerName || !clientName || !contact || !address) {
            return res.status(400).json({
                success: false,
                message: "Required fields missing: employeeId, centerName, clientName, contact, address"
            });
        }

        const newCall = new CallData({
            employeeId,
            centerName,
            clientName,
            contact,
            address,
            addressLink,
            status: status || "Pending",
            remarks
        });

        await newCall.save();

        res.status(201).json({
            success: true,
            message: "Call data recorded successfully",
            callData: newCall
        });
    } catch (error) {
        console.error("Add call data error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

// Get my call data records
exports.getMyCallData = async (req, res) => {
    try {
        const { employeeId } = req.query;

        if (!employeeId) {
            return res.status(400).json({
                success: false,
                message: "employeeId is required"
            });
        }

        const calls = await CallData.find({ employeeId }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: calls
        });
    } catch (error) {
        console.error("Get my call data error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

// Get all call data records (Admin view)
exports.getAllCallData = async (req, res) => {
    try {
        const calls = await CallData.aggregate([
            {
                $lookup: {
                    from: "employees", // Mongoose collection name for Employee
                    localField: "employeeId",
                    foreignField: "employeeId",
                    as: "employeeDetails"
                }
            },
            { $unwind: { path: "$employeeDetails", preserveNullAndEmptyArrays: true } },
            { $sort: { createdAt: -1 } }
        ]);

        res.status(200).json({
            success: true,
            data: calls
        });
    } catch (error) {
        console.error("Get all call data error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

// Update a call data record
exports.updateCallData = async (req, res) => {
    try {
        const { id } = req.params;
        const { centerName, clientName, contact, address, addressLink, status, remarks } = req.body;

        const callData = await CallData.findById(id);
        if (!callData) {
            return res.status(404).json({ success: false, message: "Call data not found" });
        }

        callData.centerName = centerName || callData.centerName;
        callData.clientName = clientName || callData.clientName;
        callData.contact = contact || callData.contact;
        callData.address = address || callData.address;
        callData.addressLink = addressLink !== undefined ? addressLink : callData.addressLink;
        callData.status = status || callData.status;
        callData.remarks = remarks !== undefined ? remarks : callData.remarks;

        await callData.save();

        res.status(200).json({
            success: true,
            message: "Call data updated successfully",
            callData
        });
    } catch (error) {
        console.error("Update call data error:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// Delete a call data record
exports.deleteCallData = async (req, res) => {
    try {
        const { id } = req.params;
        const callData = await CallData.findByIdAndDelete(id);
        if (!callData) {
            return res.status(404).json({ success: false, message: "Call data not found" });
        }
        res.status(200).json({ success: true, message: "Call data deleted successfully" });
    } catch (error) {
        console.error("Delete call data error:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// Get rejected visits
exports.getRejectedVisits = async (req, res) => {
    try {
        const calls = await CallData.aggregate([
            { $match: { status: "Rejected" } },
            {
                $lookup: {
                    from: "employees",
                    localField: "employeeId",
                    foreignField: "employeeId",
                    as: "employeeDetails"
                }
            },
            { $unwind: { path: "$employeeDetails", preserveNullAndEmptyArrays: true } },
            { $sort: { createdAt: -1 } }
        ]);

        res.status(200).json({
            success: true,
            data: calls
        });
    } catch (error) {
        console.error("Get rejected visits error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

// Get pending visits
exports.getPendingVisits = async (req, res) => {
    try {
        const calls = await CallData.aggregate([
            { $match: { status: "Pending" } },
            {
                $lookup: {
                    from: "employees",
                    localField: "employeeId",
                    foreignField: "employeeId",
                    as: "employeeDetails"
                }
            },
            { $unwind: { path: "$employeeDetails", preserveNullAndEmptyArrays: true } },
            { $sort: { createdAt: -1 } }
        ]);

        res.status(200).json({
            success: true,
            data: calls
        });
    } catch (error) {
        console.error("Get pending visits error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

// Get leads
exports.getLeads = async (req, res) => {
    try {
        const calls = await CallData.aggregate([
            { $match: { status: "Lead" } },
            {
                $lookup: {
                    from: "employees",
                    localField: "employeeId",
                    foreignField: "employeeId",
                    as: "employeeDetails"
                }
            },
            { $unwind: { path: "$employeeDetails", preserveNullAndEmptyArrays: true } },
            { $sort: { createdAt: -1 } }
        ]);

        res.status(200).json({
            success: true,
            data: calls
        });
    } catch (error) {
        console.error("Get leads error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};