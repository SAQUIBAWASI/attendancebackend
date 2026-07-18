const express = require("express");
const router = express.Router();
const {
    addCallData,
    getMyCallData,
    getAllCallData,
    updateCallData,
    deleteCallData,
    getRejectedVisits,
    getPendingVisits,
    getLeads
} = require("../controller/callData.controller");

// Add a new call data record
router.post("/add", addCallData);

// Get my call data records
router.get("/my", getMyCallData);

// Get all call data records (Admin)
router.get("/all", getAllCallData);

// Get rejected visits
router.get("/rejected", getRejectedVisits);

// Get pending visits
router.get("/pending", getPendingVisits);

// Get leads
router.get("/leads", getLeads);

// Update a call data record
router.put("/edit/:id", updateCallData);

// Delete a call data record
router.delete("/delete/:id", deleteCallData);

module.exports = router;