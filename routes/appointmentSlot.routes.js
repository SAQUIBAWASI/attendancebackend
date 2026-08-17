const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const AppointmentSlotConfig = require("../models/AppointmentSlotConfig");
const AppointmentSlot = require("../models/AppointmentSlot");

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


// 4. GET ALL SLOTS (with dynamic schedule generation and booked DB slot merging)
router.get("/", async (req, res) => {
  try {
    const { dayOfWeek, status, shift } = req.query;

    // Load config
    let config = await AppointmentSlotConfig.findOne({ doctorId: "default" });
    if (!config) {
      config = getDefaultConfig();
    }

    const { opDuration, opGap, consultationFee = 300, weeklySchedules } = config;
    let generatedSlots = [];

    if (dayOfWeek && dayOfWeek !== "All") {
      const daySched = (weeklySchedules || []).find(
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

    // Fetch saved/booked slots from MongoDB
    const filter = { doctorId: "default" };
    if (dayOfWeek && dayOfWeek !== "All") {
      filter.dayOfWeek = new RegExp(`^${dayOfWeek}$`, "i");
    }

    const dbSlots = await AppointmentSlot.find(filter).sort({ startTime24: 1 });

    // Map DB slots by slotId and by day+time for quick lookup
    const dbSlotMapBySlotId = new Map();
    const dbSlotMapByDayTime = new Map();

    dbSlots.forEach((slot) => {
      if (slot.slotId) {
        dbSlotMapBySlotId.set(slot.slotId, slot);
      }
      const dayTimeKey = `${slot.dayOfWeek?.toLowerCase()}_${slot.startTime24 || slot.startTime}`;
      dbSlotMapByDayTime.set(dayTimeKey, slot);
    });

    // Merge DB slots into generated slots
    const mergedSlotIds = new Set();

    let finalSlots = generatedSlots.map((genSlot) => {
      const dayTimeKey = `${genSlot.dayOfWeek?.toLowerCase()}_${genSlot.startTime24 || genSlot.startTime}`;
      const dbMatch = dbSlotMapBySlotId.get(genSlot.slotId) || dbSlotMapByDayTime.get(dayTimeKey);

      if (dbMatch) {
        mergedSlotIds.add(dbMatch._id.toString());
        return {
          ...genSlot,
          ...dbMatch.toObject(),
          _id: dbMatch._id
        };
      }
      return genSlot;
    });

    // Append any extra DB slots that were custom created and not in generatedSlots
    dbSlots.forEach((dbSlot) => {
      if (!mergedSlotIds.has(dbSlot._id.toString())) {
        finalSlots.push(dbSlot.toObject());
      }
    });

    // Apply status and shift filters if requested
    if (status && status !== "All") {
      finalSlots = finalSlots.filter((s) => s.status === status);
    }
    if (shift && shift !== "All") {
      finalSlots = finalSlots.filter((s) => s.shift && s.shift.toLowerCase() === shift.toLowerCase());
    }

    // Sort final slots by start time
    finalSlots.sort((a, b) => timeToMinutes(a.startTime24) - timeToMinutes(b.startTime24));

    return res.status(200).json({
      success: true,
      count: finalSlots.length,
      slots: finalSlots
    });
  } catch (error) {
    console.error("Error fetching appointment slots:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 5. BOOK AN APPOINTMENT SLOT (Guaranteed persistence in DB)
router.post("/book", async (req, res) => {
  try {
    const {
      slotId,
      _id,
      dayOfWeek,
      date,
      startTime,
      endTime,
      patientName,
      patientAge,
      patientGender,
      patientAddress,
      purpose,
      patientPhone,
      consultationFee,
      paymentStatus
    } = req.body;

    let bookedSlot = null;

    // 1. Try finding by Mongo _id
    if (_id && mongoose.Types.ObjectId.isValid(_id)) {
      bookedSlot = await AppointmentSlot.findById(_id);
    }

    // 2. Try finding by slotId or dayOfWeek + startTime
    if (!bookedSlot && (slotId || (dayOfWeek && startTime))) {
      const query = { doctorId: "default" };
      if (slotId) query.slotId = slotId;
      if (dayOfWeek) query.dayOfWeek = new RegExp(`^${dayOfWeek}$`, "i");
      if (startTime) query.startTime = startTime;

      bookedSlot = await AppointmentSlot.findOne(query);
    }

    // 3. Update existing slot in DB
    if (bookedSlot) {
      bookedSlot.status = "booked";
      if (patientName) bookedSlot.patientName = patientName;
      if (patientAge) bookedSlot.patientAge = patientAge;
      if (patientGender) bookedSlot.patientGender = patientGender;
      if (patientAddress) bookedSlot.patientAddress = patientAddress;
      if (purpose) bookedSlot.purpose = purpose;
      if (patientPhone) bookedSlot.patientPhone = patientPhone;
      if (date) bookedSlot.date = date;
      if (consultationFee !== undefined) bookedSlot.consultationFee = consultationFee;
      bookedSlot.paymentStatus = paymentStatus || bookedSlot.paymentStatus || "Pending";

      await bookedSlot.save();
    } else {
      // 4. Create new booked slot if not found
      bookedSlot = new AppointmentSlot({
        slotId: slotId || `slot_${Date.now()}`,
        doctorId: "default",
        dayOfWeek: dayOfWeek || "Monday",
        date: date || new Date().toISOString().split("T")[0],
        startTime: startTime || "09:00 AM",
        endTime: endTime || "09:20 AM",
        startTime24: startTime || "09:00",
        endTime24: endTime || "09:20",
        shift: "Morning Shift",
        status: "booked",
        consultationFee: consultationFee !== undefined ? consultationFee : 300,
        paymentStatus: paymentStatus || "Pending",
        patientName: patientName || "",
        patientAge: patientAge || "",
        patientGender: patientGender || "Male",
        patientAddress: patientAddress || "",
        purpose: purpose || "",
        patientPhone: patientPhone || ""
      });
      await bookedSlot.save();
    }


    return res.status(200).json({
      success: true,
      message: `Appointment slot successfully booked for ${patientName}!`,
      slot: bookedSlot
    });
  } catch (error) {
    console.error("Error booking slot API:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});


// ✅ GET ALL BOOKINGS
// Route: GET /getallbookings
router.get("/getallbookings", async (req, res) => {
  try {
    // Get all bookings directly from database
    const bookings = await AppointmentSlot.find({})
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

// 6. CREATE MANUAL CUSTOM SLOT
router.post("/", async (req, res) => {
  try {
    const { dayOfWeek, startTime, endTime, startTime24, endTime24, shift, status, type, patientName, notes } = req.body;

    if (!dayOfWeek || !startTime || !endTime) {
      return res.status(400).json({ success: false, message: "Day, Start Time, and End Time are required" });
    }

    const newSlot = new AppointmentSlot({
      slotId: `custom_${Date.now()}`,
      doctorId: "default",
      dayOfWeek,
      startTime,
      endTime,
      startTime24: startTime24 || startTime,
      endTime24: endTime24 || endTime,
      shift: shift || "Morning",
      type: type || "op",
      status: status || "available",
      patientName: patientName || "",
      notes: notes || ""
    });

    await newSlot.save();
    return res.status(201).json({ success: true, message: "Custom slot created successfully!", slot: newSlot });
  } catch (error) {
    console.error("Error creating slot:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 7. UPDATE SLOT STATUS OR DETAILS
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedSlot = await AppointmentSlot.findByIdAndUpdate(id, updateData, { new: true });
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
    const deletedSlot = await AppointmentSlot.findByIdAndDelete(id);

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