const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const AppointmentSlotConfig = require("../models/AppointmentSlotConfig");
const AppointmentSlot = require("../models/AppointmentSlot");
const Appointment = require("../models/Appointment");


// Helper function to format minutes to 12-hour AM/PM string
function minutesTo12Hour(mins) {
  let h = Math.floor(mins / 60);
  const m = mins % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  h = h ? h : 12;
  const strH = String(h).padStart(2, "0");
  const strM = String(m).padStart(2, "0");
  return `${strH}:${strM} ${ampm}`;
}

// Helper function to format minutes to 24-hour HH:mm string
function minutesTo24Hour(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// Helper function to convert "HH:mm" to total minutes
function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const parts = timeStr.trim().split(":");
  const h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  return h * 60 + m;
}

// Default Configuration Preset
const getDefaultConfig = () => {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const weeklySchedules = days.map((day) => {
    if (day === "Sunday") {
      return {
        dayOfWeek: day,
        isWorking: true,
        shifts: [{ name: "Morning Shift", startTime: "09:00", endTime: "14:00" }],
        breaks: []
      };
    } else {
      return {
        dayOfWeek: day,
        isWorking: true,
        shifts: [
          { name: "Morning Shift", startTime: "09:00", endTime: "14:00" },
          { name: "Evening Shift", startTime: "15:00", endTime: "21:00" }
        ],
        breaks: [
          { name: "Afternoon Break", startTime: "14:00", endTime: "15:00" }
        ]
      };
    }
  });

  return {
    configName: "Default Weekly Appointment Schedule",
    doctorId: "default",
    opDuration: 20, // 20 Mins
    opGap: 5,        // 5 Mins Gap
    consultationFee: 300, // 300 Rs Default Fee
    weeklySchedules
  };
};

// Slot Generation logic based on config for a specific day schedule
const generateSlotsForDaySchedule = (daySchedule, opDuration, opGap, consultationFee = 300, doctorId = "default") => {
  const slots = [];
  if (!daySchedule || !daySchedule.isWorking) return slots;

  const dayOfWeek = daySchedule.dayOfWeek;
  let slotIndex = 1;

  // Process each shift
  (daySchedule.shifts || []).forEach((shift) => {
    const shiftStart = timeToMinutes(shift.startTime);
    const shiftEnd = timeToMinutes(shift.endTime);
    let curr = shiftStart;

    while (curr + opDuration <= shiftEnd) {
      const slotStartMins = curr;
      const slotEndMins = curr + opDuration;

      slots.push({
        slotId: `${dayOfWeek.substring(0, 3).toLowerCase()}_${shift.name.substring(0, 3).toLowerCase()}_${slotIndex}`,
        doctorId,
        doctorName: "General OP Doctor",
        dayOfWeek,
        startTime: minutesTo12Hour(slotStartMins),
        endTime: minutesTo12Hour(slotEndMins),
        startTime24: minutesTo24Hour(slotStartMins),
        endTime24: minutesTo24Hour(slotEndMins),
        duration: opDuration,
        gap: opGap,
        consultationFee,
        paymentStatus: "Pending",
        shift: shift.name,
        type: "op",
        status: "available",
        slotNumber: slotIndex++
      });

      curr = slotEndMins + opGap; // Move cursor by OP Duration + Gap
    }
  });

  // Process breaks
  (daySchedule.breaks || []).forEach((brk) => {
    const brkStart = timeToMinutes(brk.startTime);
    const brkEnd = timeToMinutes(brk.endTime);

    slots.push({
      slotId: `${dayOfWeek.substring(0, 3).toLowerCase()}_break_${slotIndex}`,
      doctorId,
      doctorName: "General OP Doctor",
      dayOfWeek,
      startTime: minutesTo12Hour(brkStart),
      endTime: minutesTo12Hour(brkEnd),
      startTime24: minutesTo24Hour(brkStart),
      endTime24: minutesTo24Hour(brkEnd),
      duration: brkEnd - brkStart,
      gap: 0,
      consultationFee: 0,
      paymentStatus: "Pending",
      shift: "Break",
      type: "break",
      status: "break",
      slotNumber: slotIndex++,
      notes: brk.name || "Scheduled Break"
    });
  });

  // Sort slots by start time
  slots.sort((a, b) => timeToMinutes(a.startTime24) - timeToMinutes(b.startTime24));
  return slots;
};

// 1. GET CONFIGURATION
router.get("/config", async (req, res) => {
  try {
    let config = await AppointmentSlotConfig.findOne({ doctorId: "default" });
    if (!config) {
      const defaultConfig = getDefaultConfig();
      config = await AppointmentSlotConfig.create(defaultConfig);
    }
    return res.status(200).json({ success: true, config });
  } catch (error) {
    console.error("Error fetching slot config:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 2. SAVE/UPDATE CONFIGURATION
router.post("/config", async (req, res) => {
  try {
    const { opDuration, opGap, consultationFee, weeklySchedules, configName } = req.body;

    let config = await AppointmentSlotConfig.findOne({ doctorId: "default" });
    if (config) {
      if (opDuration !== undefined) config.opDuration = opDuration;
      if (opGap !== undefined) config.opGap = opGap;
      if (consultationFee !== undefined) config.consultationFee = consultationFee;
      if (weeklySchedules) config.weeklySchedules = weeklySchedules;
      if (configName) config.configName = configName;
      await config.save();
    } else {
      config = await AppointmentSlotConfig.create({
        doctorId: "default",
        opDuration: opDuration || 20,
        opGap: opGap || 5,
        consultationFee: consultationFee !== undefined ? consultationFee : 300,
        weeklySchedules: weeklySchedules || getDefaultConfig().weeklySchedules,
        configName: configName || "Default Appointment Schedule"
      });
    }

    return res.status(200).json({ 
      success: true, 
      message: "Slot configuration updated successfully!", 
      config 
    });
  } catch (error) {
    console.error("Error updating slot config:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 3. GENERATE SLOTS FOR ALL DAYS (or single day)
router.post("/generate", async (req, res) => {
  try {
    const { dayOfWeek, saveToDb } = req.body;

    // Get latest config
    let config = await AppointmentSlotConfig.findOne({ doctorId: "default" });
    if (!config) {
      config = getDefaultConfig();
    }

    const { opDuration, opGap, consultationFee = 300, weeklySchedules } = config;
    let generatedSlots = [];

    if (dayOfWeek) {
      const daySched = weeklySchedules.find(
        (s) => s.dayOfWeek.toLowerCase() === dayOfWeek.toLowerCase()
      );
      if (daySched) {
        generatedSlots = generateSlotsForDaySchedule(daySched, opDuration, opGap, consultationFee);
      }
    } else {
      (weeklySchedules || []).forEach((daySched) => {
        const daySlots = generateSlotsForDaySchedule(daySched, opDuration, opGap, consultationFee);
        generatedSlots = generatedSlots.concat(daySlots);
      });
    }

    // Save generated slots to DB ONLY if explicitly requested
    if (saveToDb === true) {
      if (dayOfWeek) {
        await AppointmentSlot.deleteMany({ dayOfWeek: new RegExp(`^${dayOfWeek}$`, "i") });
      } else {
        await AppointmentSlot.deleteMany({ doctorId: "default" });
      }
      if (generatedSlots.length > 0) {
        await AppointmentSlot.insertMany(generatedSlots);
      }
    }

    return res.status(200).json({
      success: true,
      message: `Successfully generated ${generatedSlots.length} slots!`,
      totalSlots: generatedSlots.length,
      opDuration,
      opGap,
      consultationFee,
      slots: generatedSlots
    });
  } catch (error) {
    console.error("Error generating slots:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});


// =============================================
// 4. GET ALL SLOTS (ONLY FROM DB - NO GENERATION)
// =============================================
router.get("/", async (req, res) => {
  try {
    const { dayOfWeek, status, shift, doctorId } = req.query;

    // Build filter
    const filter = {};
    if (dayOfWeek && dayOfWeek !== "All") {
      filter.dayOfWeek = new RegExp(`^${dayOfWeek}$`, "i");
    }
    if (status && status !== "All") {
      filter.status = status;
    }
    if (shift && shift !== "All") {
      filter.shift = new RegExp(`^${shift}$`, "i");
    }
    if (doctorId) {
      filter.doctorId = doctorId;
    }

    // Fetch slots from MongoDB only - NO GENERATION
    // Populate doctorId with full doctor details
    const slots = await AppointmentSlot.find(filter)
      .sort({ startTime24: 1 })
      .populate('doctorId', 'name email phone specialization qualification experience address consultationFee');

    // Apply additional filters if needed
    let filteredSlots = slots;
    
    if (status && status !== "All") {
      filteredSlots = filteredSlots.filter((s) => s.status === status);
    }
    if (shift && shift !== "All") {
      filteredSlots = filteredSlots.filter((s) => s.shift && s.shift.toLowerCase() === shift.toLowerCase());
    }

    return res.status(200).json({
      success: true,
      count: filteredSlots.length,
      slots: filteredSlots
    });
  } catch (error) {
    console.error("Error fetching appointment slots:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});


// 5. BOOK AN APPOINTMENT SLOT (Using Appointment Schema)
router.post("/book", async (req, res) => {
  try {
    const {
      slotId,
      _id,
      dayOfWeek,
      date,
      appointmentDate,
      startTime,
      endTime,
      startTime24,
      endTime24,
      doctorId,
      doctorName,
      doctorSpecialization,
      patientName,
      patientAge,
      patientGender,
      patientAddress,
      patientPhone,
      patientEmail,
      purpose,
      symptoms,
      consultationFee,
      paymentType,
      paymentStatus,
      appointmentType,
      priority,
      referredBy,
      insuranceProvider,
      insurancePolicyNumber,
      patientBloodGroup,
      patientMedicalHistory,
      patientAllergies,
      patientMedications,
      notes
    } = req.body;

    console.log("📥 Booking request received:", req.body);

    let slot = null;
    let bookedAppointment = null;

    // ✅ Use appointmentDate if provided, else use date
    const finalDate = appointmentDate || date || new Date().toISOString().split('T')[0];

    // ✅ STEP 1: Try finding slot by various methods
    if (_id && mongoose.Types.ObjectId.isValid(_id)) {
      slot = await AppointmentSlot.findById(_id);
    }

    if (!slot && slotId) {
      if (mongoose.Types.ObjectId.isValid(slotId)) {
        slot = await AppointmentSlot.findById(slotId);
      } else {
        slot = await AppointmentSlot.findOne({ slotId: slotId });
      }
    }

    if (!slot && dayOfWeek && startTime && doctorId) {
      slot = await AppointmentSlot.findOne({
        doctorId: doctorId,
        dayOfWeek: new RegExp(`^${dayOfWeek}$`, "i"),
        startTime: startTime,
        status: 'available'
      });
    }

    if (!slot && finalDate && startTime && doctorId) {
      slot = await AppointmentSlot.findOne({
        doctorId: doctorId,
        date: finalDate,
        startTime: startTime,
        status: 'available'
      });
    }

    if (!slot && doctorId && startTime) {
      slot = await AppointmentSlot.findOne({
        doctorId: doctorId,
        startTime: startTime,
        status: 'available'
      });
    }

    // ✅ STEP 2: If slot found, check if available and book it
    if (slot) {
      if (slot.status !== 'available') {
        return res.status(400).json({
          success: false,
          message: `Slot is not available. Current status: ${slot.status}`
        });
      }

      // Update slot status to booked
      slot.status = 'booked';
      if (finalDate) slot.date = finalDate;
      await slot.save();
    } else {
      // ✅ STEP 2.5: If no slot found, DO NOT create new slot
      // Just return error saying slot not found
      return res.status(404).json({
        success: false,
        message: "Slot not found. Please select a valid available slot."
      });
    }

    // ✅ STEP 3: Create new Appointment - ONLY with frontend data
    const appointmentData = {
      slotId: slot._id,
      appointmentDate: finalDate,
      slotDetails: {
        dayOfWeek: slot.dayOfWeek || dayOfWeek,
        date: finalDate,
        startTime: slot.startTime || startTime,
        endTime: slot.endTime || endTime,
        startTime24: slot.startTime24 || startTime24,
        endTime24: slot.endTime24 || endTime24,
        doctorId: slot.doctorId || doctorId,
        doctorName: slot.doctorName || doctorName,
        doctorSpecialization: slot.doctorSpecialization || doctorSpecialization
      },
      patientName: patientName,
      patientAge: patientAge,
      patientGender: patientGender,
      patientPhone: patientPhone,
      patientEmail: patientEmail || "",
      patientAddress: patientAddress || "",
      patientBloodGroup: patientBloodGroup || "",
      patientMedicalHistory: patientMedicalHistory || "",
      patientAllergies: patientAllergies || "",
      patientMedications: patientMedications || "",
      purpose: purpose || "",
      symptoms: symptoms || "",
      consultationFee: consultationFee || 300,
      paymentType: paymentType || "cash",
      paymentStatus: paymentStatus || "Pending",
      appointmentType: appointmentType || "Consultation",
      priority: priority || "Normal",
      referredBy: referredBy || "",
      insuranceProvider: insuranceProvider || "",
      insurancePolicyNumber: insurancePolicyNumber || "",
      notes: notes || "",
      status: "confirmed",
      bookedAt: new Date()
    };

    bookedAppointment = new Appointment(appointmentData);
    await bookedAppointment.save();

    return res.status(200).json({
      success: true,
      message: `✅ Appointment booked successfully for ${patientName}!`,
      appointment: bookedAppointment,
      slot: slot
    });

  } catch (error) {
    console.error("❌ Error booking appointment:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});



// ✅ GET ALL BOOKINGS
// Route: GET /getallbookings
router.get("/getallbookings", async (req, res) => {
  try {
    // Get all bookings directly from database
    const bookings = await Appointment.find({})
      .sort({ date: -1, startTime: 1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      message: "All bookings fetched successfully",
      bookings
    });

  } catch (error) {
    console.error("Error fetching all bookings:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
      error: error.message
    });
  }
});

// =============================================
// 6. CREATE MANUAL CUSTOM SLOT (FIXED)
// =============================================
router.post("/", async (req, res) => {
  try {
    const {
      dayOfWeek,
      startTime,
      endTime,
      startTime24,
      endTime24,
      shift,
      status,
      type,
      patientName,
      notes,
      doctorId,
      doctorName,
      doctorSpecialization,
      duration,
      gap,
      consultationFee,
      date,
      slotNumber,
      patientPhone,
      patientAge,
      patientGender,
      patientAddress,
      purpose,
      paymentStatus
    } = req.body;

    // Validate required fields
    if (!dayOfWeek || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "Day, Start Time, and End Time are required"
      });
    }

    // Auto-generate slotId
    const dayPrefix = dayOfWeek.substring(0, 3).toLowerCase();
    const count = await AppointmentSlot.countDocuments({ dayOfWeek });
    const slotId = `custom_${dayPrefix}_${count + 1}`;

    // Auto-calculate duration if not provided
    let calculatedDuration = duration;
    if (!calculatedDuration && startTime24 && endTime24) {
      const start = startTime24.split(':').map(Number);
      const end = endTime24.split(':').map(Number);
      const startMinutes = start[0] * 60 + start[1];
      const endMinutes = end[0] * 60 + end[1];
      calculatedDuration = endMinutes - startMinutes;
    }
    if (!calculatedDuration) {
      calculatedDuration = 20;
    }

    const newSlot = new AppointmentSlot({
      slotId: slotId,
      doctorId: doctorId || "default",
      doctorName: doctorName || "General OP Doctor",
      doctorSpecialization: doctorSpecialization || "",
      dayOfWeek: dayOfWeek,
      date: date || "",
      startTime: startTime,
      endTime: endTime,
      startTime24: startTime24 || startTime,
      endTime24: endTime24 || endTime,
      duration: calculatedDuration,
      gap: gap || 5,
      shift: shift || "Morning",
      type: type || "op",
      status: status || "available",
      consultationFee: consultationFee || 300,
      slotNumber: slotNumber || 0,
      patientName: patientName || "",
      patientPhone: patientPhone || "",
      patientAge: patientAge || "",
      patientGender: patientGender || "Male",
      patientAddress: patientAddress || "",
      purpose: purpose || "",
      notes: notes || "",
      paymentStatus: paymentStatus || "Pending",
      isActive: true
    });

    await newSlot.save();

    return res.status(201).json({
      success: true,
      message: "Custom slot created successfully!",
      slot: newSlot
    });
  } catch (error) {
    console.error("Error creating slot:", error);
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Slot ID already exists"
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});


// 7. UPDATE SLOT STATUS OR DETAILS
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedSlot = await Appointment.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedSlot) {
      return res.status(404).json({ success: false, message: "Slot not found" });
    }

    return res.status(200).json({ success: true, message: "Slot updated successfully!", slot: updatedSlot });
  } catch (error) {
    console.error("Error updating slot:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 8. DELETE SINGLE SLOT
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedSlot = await Appointment.findByIdAndDelete(id);

    if (!deletedSlot) {
      return res.status(404).json({ success: false, message: "Slot not found" });
    }

    return res.status(200).json({ success: true, message: "Slot deleted successfully!" });
  } catch (error) {
    console.error("Error deleting slot:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});
// 9. CLEAR ALL SLOTS
router.delete("/clear/all", async (req, res) => {
  try {
    await AppointmentSlot.deleteMany({ doctorId: "default" });
    return res.status(200).json({ success: true, message: "All slots cleared successfully!" });
  } catch (error) {
    console.error("Error clearing slots:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;