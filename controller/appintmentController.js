
const Appointment = require("../models/Appointment");
const Slot = require("../models/Slot")


// Book Appointment
const bookAppointment = async (req, res) => {
  try {
    const {
      patientName,
      patientAge,
      patientGender,
      patientPhone,
      patientEmail,
      patientAddress,
      symptoms,
      slotId,
      appointmentDate,
      appointmentTime
    } = req.body;

    // Check if slot is available
    if (slotId) {
      const slotDoc = await Slot.findOne({ "slots._id": slotId });
      if (!slotDoc) {
        return res.status(404).json({
          success: false,
          message: "Slot not found"
        });
      }

      // Find the specific slot
      const slot = slotDoc.slots.id(slotId);
      if (!slot) {
        return res.status(404).json({
          success: false,
          message: "Slot not found"
        });
      }

      // Check if slot is already booked
      const timeSlot = slot.time_slots.find(t => t.time === appointmentTime);
      if (timeSlot && timeSlot.isBooked) {
        return res.status(400).json({
          success: false,
          message: "This time slot is already booked"
        });
      }

      // Mark the specific time slot as booked
      if (timeSlot) {
        timeSlot.isBooked = true;
        await slotDoc.save();
      }
    }

    // Create appointment
    const appointment = new Appointment({
      patientName,
      patientAge,
      patientGender,
      patientPhone,
      patientEmail,
      patientAddress,
      symptoms,
      slotId: slotId || null,
      appointmentDate,
      appointmentTime,
      status: "confirmed"
    });

    await appointment.save();

    res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      data: appointment
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get All Appointments
const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: appointments
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get Appointment by ID
const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found"
      });
    }

    res.status(200).json({
      success: true,
      data: appointment
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};




// Update Appointment Status
const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["pending", "confirmed", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status"
      });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found"
      });
    }

    // If cancelled, free up the slot
    if (status === "cancelled" && appointment.slotId) {
      const slotDoc = await Slot.findOne({ "slots._id": appointment.slotId });
      if (slotDoc) {
        const slot = slotDoc.slots.id(appointment.slotId);
        if (slot) {
          const timeSlot = slot.time_slots.find(t => t.time === appointment.appointmentTime);
          if (timeSlot) {
            timeSlot.isBooked = false;
            await slotDoc.save();
          }
        }
      }
    }

    res.status(200).json({
      success: true,
      message: "Appointment status updated successfully",
      data: appointment
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};




// Delete Appointment
const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findByIdAndDelete(id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found"
      });
    }

    // Free up the slot
    if (appointment.slotId) {
      const slotDoc = await Slot.findOne({ "slots._id": appointment.slotId });
      if (slotDoc) {
        const slot = slotDoc.slots.id(appointment.slotId);
        if (slot) {
          const timeSlot = slot.time_slots.find(t => t.time === appointment.appointmentTime);
          if (timeSlot) {
            timeSlot.isBooked = false;
            await slotDoc.save();
          }
        }
      }
    }

    res.status(200).json({
      success: true,
      message: "Appointment deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  bookAppointment,
  getAllAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  deleteAppointment
};