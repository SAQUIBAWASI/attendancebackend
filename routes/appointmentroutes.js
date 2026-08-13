const express = require("express");
const router = express.Router();
const {
  bookAppointment,
  getAllAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  deleteAppointment
} = require("../controllers/appointmentController");

// Routes
router.post("/bookappointment", bookAppointment);
router.get("/allappointmnet", getAllAppointments);
router.get("/getsingleapplointment/:id", getAppointmentById);
router.put("/updateappointmentstatus/:id", updateAppointmentStatus);
router.delete("/deleteappoint/:id", deleteAppointment);

module.exports = router;