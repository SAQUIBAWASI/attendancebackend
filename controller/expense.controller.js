const Expense = require("../models/Expense");
const GlobalSetting = require("../models/GlobalSetting");
const Employee = require("../models/Employee"); // ✅ Import Employee model

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
        let finalOutcome = outcome;
        let finalOrderValue = Number(orderValue) || 0;
        let finalUpsellValue = Number(upsellValue) || 0;

        if (stops && Array.isArray(stops) && stops.length > 0) {
            finalOrderValue = stops.reduce((sum, stop) => sum + (Number(stop.orderValue) || 0), 0);
            finalUpsellValue = stops.reduce((sum, stop) => sum + (Number(stop.upsellValue) || 0), 0);
            const stopsTotalKm = stops.reduce((sum, stop) => sum + (Number(stop.km) || 0), 0);
            if (stopsTotalKm > 0) {
               finalKm = stopsTotalKm;
               totalAmount = (finalKm * rateApplied).toFixed(2);
            }
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

        // ✅ Manually fetch employee details
        const employee = await Employee.findOne({ employeeId });
        
        const expenseWithDetails = {
            ...newExpense.toObject(),
            employeeDetails: employee || null
        };

        res.status(201).json({
            success: true,
            message: "Expense recorded successfully",
            expense: expenseWithDetails
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

// 📋 Get my expenses (with server-side stats for cards)
exports.getMyExpenses = async (req, res) => {
    try {
        const { employeeId } = req.query;

        if (!employeeId) {
            return res.status(400).json({
                success: false,
                message: "employeeId is required"
            });
        }

        // 1️⃣ Fetch expenses + employee details
        const expenses = await Expense.find({ employeeId }).sort({ date: -1 });
        const employee = await Employee.findOne({ employeeId });

        const expensesWithDetails = expenses.map(exp => ({
            ...exp.toObject(),
            employeeDetails: employee || null
        }));

        // 2️⃣ Current KM rate
        const rateSetting = await GlobalSetting.findOne({ key: "kmRate" });
        const rate = rateSetting ? Number(rateSetting.value) : 10;

        // 3️⃣ ✅ Compute ALL card values on the server
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        let totalClaims = 0;
        let totalDistance = 0;
        let totalAmount = 0;
        let monthlyClaims = 0;
        let monthlyAmount = 0;
        let monthlyDistance = 0;
        let pendingClaims = 0;
        let approvedClaims = 0;
        let rejectedClaims = 0;
        let approvedAmount = 0;
        let pendingAmount = 0;
        let rejectedAmount = 0;
        let totalOrderValue = 0;
        let totalUpsellValue = 0;
        let totalStops = 0;

        expenses.forEach((exp) => {
            const km = Number(exp.km) || 0;
            const amount = Number(exp.totalAmount) || 0;

            totalClaims += 1;
            totalDistance += km;
            totalAmount += amount;
            totalStops += Array.isArray(exp.stops) ? exp.stops.length : 0;

            totalOrderValue += Number(exp.orderValue) || 0;
            totalUpsellValue += Number(exp.upsellValue) || 0;

            // Status-wise split
            const status = exp.status || "Pending";
            if (status === "Approved") {
                approvedClaims += 1;
                approvedAmount += amount;
            } else if (status === "Rejected") {
                rejectedClaims += 1;
                rejectedAmount += amount;
            } else {
                pendingClaims += 1;
                pendingAmount += amount;
            }

            // Current-month bucket
            if (exp.date) {
                const d = new Date(exp.date);
                if (
                    d.getMonth() === currentMonth &&
                    d.getFullYear() === currentYear
                ) {
                    monthlyClaims += 1;
                    monthlyAmount += amount;
                    monthlyDistance += km;
                }
            }
        });

        const stats = {
            totalClaims,
            totalDistance: Number(totalDistance.toFixed(2)),
            totalAmount: Number(totalAmount.toFixed(2)),

            monthlyClaims,
            monthlyAmount: Number(monthlyAmount.toFixed(2)),
            monthlyDistance: Number(monthlyDistance.toFixed(2)),

            pendingClaims,
            approvedClaims,
            rejectedClaims,
            pendingAmount: Number(pendingAmount.toFixed(2)),
            approvedAmount: Number(approvedAmount.toFixed(2)),
            rejectedAmount: Number(rejectedAmount.toFixed(2)),

            totalOrderValue: Number(totalOrderValue.toFixed(2)),
            totalUpsellValue: Number(totalUpsellValue.toFixed(2)),
            totalStops,
            avgClaimAmount: totalClaims
                ? Number((totalAmount / totalClaims).toFixed(2))
                : 0
        };

        // 4️⃣ Send everything together
        res.status(200).json({
            success: true,
            data: expensesWithDetails, // list for table
            stats,                     // 👈 cards consume this
            rate                       // 👈 hero pill rate
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



// 📊 Get all expenses (Admin view) - WITHOUT POPULATE
exports.getAllExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find().sort({ date: -1 });
        
        // ✅ Fetch employee details manually for each expense
        const expensesWithDetails = await Promise.all(
            expenses.map(async (expense) => {
                const employee = await Employee.findOne({ employeeId: expense.employeeId });
                return {
                    ...expense.toObject(),
                    employeeDetails: employee || null
                };
            })
        );

        res.status(200).json({
            success: true,
            data: expensesWithDetails
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
        console.error("Update global rate error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

// ✏️ Update an expense - FINAL WORKING
exports.updateExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const { purpose, date, km, outcome, orderValue, upsellValue, remark, stops } = req.body;

        console.log("========== UPDATE EXPENSE ==========");
        console.log("📌 ID:", id);
        console.log("📌 Body:", JSON.stringify(req.body, null, 2));

        // 1️⃣ Check if expense exists
        const existingExpense = await Expense.findById(id);
        if (!existingExpense) {
            console.log("❌ Expense not found");
            return res.status(404).json({
                success: false,
                message: "Expense not found"
            });
        }

        // 2️⃣ Get current KM rate
        const rateSetting = await GlobalSetting.findOne({ key: "kmRate" });
        const currentRate = rateSetting ? Number(rateSetting.value) : 10;

        // 3️⃣ Calculate values
        let finalKm = Number(km) || 0;
        let totalAmount = finalKm * currentRate;
        let finalOrderValue = Number(orderValue) || 0;
        let finalUpsellValue = Number(upsellValue) || 0;

        // 4️⃣ Handle stops
        if (Array.isArray(stops) && stops.length > 0) {
            finalOrderValue = stops.reduce((sum, stop) => sum + (Number(stop.orderValue) || 0), 0);
            finalUpsellValue = stops.reduce((sum, stop) => sum + (Number(stop.upsellValue) || 0), 0);
            const stopsTotalKm = stops.reduce((sum, stop) => sum + (Number(stop.km) || 0), 0);
            if (stopsTotalKm > 0) {
                finalKm = stopsTotalKm;
                totalAmount = finalKm * currentRate;
            }
        }

        // 5️⃣ Build update object
        const updateData = {
            purpose: purpose || existingExpense.purpose,
            date: date ? new Date(date) : existingExpense.date,
            km: finalKm,
            rateApplied: currentRate,
            totalAmount: Number(totalAmount.toFixed(2)),
            outcome: outcome || '',
            orderValue: finalOrderValue,
            upsellValue: finalUpsellValue,
            remark: remark || '',
            stops: Array.isArray(stops) ? stops : existingExpense.stops || []
        };

        console.log("📤 Update Data:", JSON.stringify(updateData, null, 2));

        // 6️⃣ ✅ UPDATE WITH findByIdAndUpdate
        const updatedExpense = await Expense.findByIdAndUpdate(
            id,
            updateData,
            { 
                new: true,           // ✅ Returns updated document
                runValidators: true 
            }
        );

        if (!updatedExpense) {
            return res.status(404).json({
                success: false,
                message: "Expense not found after update"
            });
        }

        console.log("✅ Updated Expense:", JSON.stringify(updatedExpense.toObject(), null, 2));

        // 7️⃣ Fetch employee details
        const employee = await Employee.findOne({ employeeId: updatedExpense.employeeId });

        const expenseWithDetails = {
            ...updatedExpense.toObject(),
            employeeDetails: employee || null
        };

        console.log("📤 Final Response:", JSON.stringify(expenseWithDetails, null, 2));

        res.status(200).json({
            success: true,
            message: "Expense updated successfully",
            expense: expenseWithDetails
        });

    } catch (error) {
        console.error("❌ Update error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

// 🗑️ Delete an expense - ✅ FIXED
exports.deleteExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedExpense = await Expense.findByIdAndDelete(id);

        if (!deletedExpense) {
            return res.status(404).json({ 
                success: false, 
                message: "Expense not found" 
            });
        }

        // ✅ Manually fetch employee details
        const employee = await Employee.findOne({ employeeId: deletedExpense.employeeId });
        const expenseWithDetails = {
            ...deletedExpense.toObject(),
            employeeDetails: employee || null
        };

        res.status(200).json({ 
            success: true, 
            message: "Expense deleted successfully",
            expense: expenseWithDetails
        });
    } catch (error) {
        console.error("Delete expense error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Server error", 
            error: error.message 
        });
    }
};