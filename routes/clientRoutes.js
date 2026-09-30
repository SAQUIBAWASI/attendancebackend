// routes/clientRoutes.js
const express = require("express");
const router = express.Router();
const {
  bookPlan,
  getAllBookings,
  getBookingByClientId,
} = require("../controller/bookingController");

router.post("/bookplan", bookPlan);
router.get("/getallbookings", getAllBookings);
router.get("/singlebooking/:clientId", getBookingByClientId);

module.exports = router;