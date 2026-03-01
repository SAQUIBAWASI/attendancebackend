const express = require("express");
const router = express.Router();
const {
    addExpense,
    getMyExpenses,
    getKmRate,
    updateKmRate,
    getAllExpenses
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

module.exports = router;
