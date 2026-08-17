const express = require('express');
const router = express.Router();
const {
  addService,
  getAllServices,
  updateService,
  deleteService,
  addServiceToBooking,
  updateBookingService,
  removeServiceFromBooking,
  updateServicePaymentStatus
} = require('../controller/serviceController');

// =============================================
// SERVICE ROUTES (Only 4)
// =============================================

// GET - Get all services
router.get('/allservices', getAllServices);

// POST - Add new service
router.post('/addservice', addService);

// PUT - Update service by ID
router.put('/updateservice/:id', updateService);

// DELETE - Delete service by ID
router.delete('/deleteservice/:id', deleteService);


// POST - Add service to booking
router.post("/addservicestobooking/:bookingId", addServiceToBooking);

// PUT - Update service in booking
router.put("/updateservicestobooking/:bookingId/:serviceId", updateBookingService);

// DELETE - Remove service from booking
router.delete("/deleteservicestobooking/:bookingId/:serviceId", removeServiceFromBooking);

// PUT - Update service payment status (Paid/Pending)
router.put("/updateservicepayment/:bookingId/:serviceId", updateServicePaymentStatus);


module.exports = router;