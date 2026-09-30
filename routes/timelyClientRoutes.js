// routes/timelyClientRoutes.js
const express = require("express");
const router = express.Router();
const {
  addTimelyClient,
  getAllTimelyClients,
  getTimelyClientById,
  updateTimelyClient,
  deleteTimelyClient,
  toggleTimelyClientStatus,
  bookPlan,
  getAllBookings,
  getBookingByClientId
} = require("../controller/timelyClientController");

// CRUD Routes
router.post("/addclient", addTimelyClient);
router.get("/getallclients", getAllTimelyClients);
router.get("/getsingleclinet/:id", getTimelyClientById);
router.put("/updateclinet/:id", updateTimelyClient);
router.delete("/deleteclient/:id", deleteTimelyClient);
router.put("/toggle-status/:id", toggleTimelyClientStatus);


router.post("/bookplan", bookPlan);
router.get("/allbookings", getAllBookings);
router.get("/singlebooking/:clientId", getBookingByClientId);


module.exports = router;