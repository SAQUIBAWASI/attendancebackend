const Expense = require("../models/Expense");
const GlobalSetting = require("../models/GlobalSetting");

// ➕ Add a new expense
exports.addExpense = async (req, res) => {
    try {
        const {
            employeeId, purpose, date, km,
            outcome, orderValue, upsellValue, remark, stops
        } = req.body;

        if (!employeeId || !purpose || !date || !km) {
            return res.status(400).json({
                success: false,
                message: "Required fields missing: employeeId, purpose, date, km"
            });
        }

        // 🔍 Fetch Current KM Rate
        let rateSetting = await GlobalSetting.findOne({ key: "kmRate" });
        let currentRate = rateSetting ? Number(rateSetting.value) : 10;

        const rateApplied = currentRate;
        let finalKm = Number(km) || 0;
        let totalAmount = (finalKm * rateApplied).toFixed(2);

        // Calculate dynamic values if stops are provided
        let finalOutcome = outcome;
        let finalOrderValue = Number(orderValue) || 0;
        let finalUpsellValue = Number(upsellValue) || 0;

        if (stops && Array.isArray(stops) && stops.length > 0) {
            finalOrderValue = stops.reduce((sum, stop) => sum + (Number(stop.orderValue) || 0), 0);
            finalUpsellValue = stops.reduce((sum, stop) => sum + (Number(stop.upsellValue) || 0), 0);
            
            // Calculate total km from stops if stops have km
            const stopsTotalKm = stops.reduce((sum, stop) => sum + (Number(stop.km) || 0), 0);
            if (stopsTotalKm > 0) {
               finalKm = stopsTotalKm;
               totalAmount = (finalKm * rateApplied).toFixed(2);
            }
            
            // If primary outcome is empty but stops have outcomes, we could safely concatenate them or leave as is.
            // Leaving primary outcome as the "overall visit outcome".
        }

        const newExpense = new Expense({
            employeeId,
            purpose,
            date: new Date(date),
            km: finalKm,
            rateApplied,
            totalAmount: Number(totalAmount),
            outcome: finalOutcome,
            orderValue: finalOrderValue,
            upsellValue: finalUpsellValue,
            remark,
            stops: stops && Array.isArray(stops) ? stops : []
        });

        await newExpense.save();

        res.status(201).json({
            success: true,
            message: "Expense recorded successfully",
            expense: newExpense
        });
    } catch (error) {
        console.error("Add expense error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

// 📋 Get my expenses
exports.getMyExpenses = async (req, res) => {
    try {
        const { employeeId } = req.query;

        if (!employeeId) {
            return res.status(400).json({
                success: false,
                message: "employeeId is required"
            });
        }

        const expenses = await Expense.find({ employeeId }).sort({ date: -1 });

        res.status(200).json({
            success: true,
            data: expenses
        });
    } catch (error) {
        console.error("Get my expenses error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

// 📊 Get all expenses (Admin view)
exports.getAllExpenses = async (req, res) => {
    try {
        const expenses = await Expense.aggregate([
            {
                $lookup: {
                    from: "employees", // Mongoose collection name for Employee
                    localField: "employeeId",
                    foreignField: "employeeId",
                    as: "employeeDetails"
                }
            },
            { $unwind: { path: "$employeeDetails", preserveNullAndEmptyArrays: true } },
            { $sort: { date: -1 } }
        ]);

        res.status(200).json({
            success: true,
            data: expenses
        });
    } catch (error) {
        console.error("Get all expenses error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

// 🔍 Get current KM Rate
exports.getKmRate = async (req, res) => {
    try {
        const rateSetting = await GlobalSetting.findOne({ key: "kmRate" });
        const rate = rateSetting ? Number(rateSetting.value) : 10;

        res.status(200).json({
            success: true,
            rate: rate
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching rate",
            error: error.message
        });
    }
};

// ⚙️ Update global KM Rate
exports.updateKmRate = async (req, res) => {
    try {
        const { rate } = req.body;

        if (rate === undefined || isNaN(rate)) {
            return res.status(400).json({
                success: false,
                message: "Valid rate value is required"
            });
        }

        const updatedSetting = await GlobalSetting.findOneAndUpdate(
            { key: "kmRate" },
            { value: Number(rate) },
            { upsert: true, new: true }
        );

        res.status(200).json({
            success: true,
            message: "Global KM rate updated successfully",
            rate: updatedSetting.value
        });
    } catch (error) {
        console.error("Update rate error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};
