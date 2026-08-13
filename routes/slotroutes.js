const express = require("express");
const router = express.Router();
const { 
  addSlot, 
  getAllSlots, 
  updateSlot, 
  deleteSlot 
} = require("../controller/slotController");

// Routes
router.post("/addslots", addSlot);
router.get("/getall", getAllSlots);
router.put("/updateslot", updateSlot);
router.delete("/deletedelete/:slotId", deleteSlot);

module.exports = router;