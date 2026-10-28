const express = require("express");
const router = express.Router();
const {
    addExpense,
    getMyExpenses,
    getKmRate,
    updateKmRate,
    getAllExpenses,
    updateBulkPaymentStatus,
    updatePaymentStatus,
    updateExpense,
    deleteExpense
} = require("../controller/expense.controller");

// ➕ Add a new expense
router.post("/add", addExpense);

// 📊 Get all expenses (Admin)
router.get("/all", getAllExpenses);

// 📋 Get expenses (usually for the logged-in employee via query or token)
router.get("/my", getMyExpenses);

// 🔍 Get current global KM rate
router.get("/rate", getKmRate);

// ⚙️ Update global KM rate
router.put("/rate", updateKmRate);

// ✅ Status update routes (Bulk pehle, Single baad mein)
router.put("/status/bulk", updateBulkPaymentStatus); 
router.put("/status/:id", updatePaymentStatus);


// Update Expense
router.put("/updateexpense/:id", updateExpense);

// Delete Expense
router.delete("/deleteexpense/:id", deleteExpense);

module.exports = router;
