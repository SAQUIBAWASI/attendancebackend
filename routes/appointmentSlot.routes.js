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


// ============================================================
// POST /appointment-slots/book  — Book Appointment
// ============================================================
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
      patientId,
      patientName,
      patientAge,
      patientGender,
      patientDob,
      patientTitle,
      patientAddress,
      patientCity,
      patientPincode,
      patientPhone,
      patientEmail,
      purpose,
      symptoms,
      paymentType,
      paymentStatus,
      partialAmount,
      appointmentType,
      priority,
      // ===== REFERRAL FIELDS =====
      referredByCustomer,
      referredByDoctor,
      referralCustomerId,
      referralDoctorId,
      referralContactId,
      referredBy,
      referralCommission,
      referralCommissionType,
      // ===== DISCOUNT =====
      discount,                // ✅ NEW
      insuranceProvider,
      insurancePolicyNumber,
      patientBloodGroup,
      patientMedicalHistory,
      patientAllergies,
      patientMedications,
      notes,
      isOP,
      serviceItems,
      services
    } = req.body;

    console.log("📥 Booking request received:", req.body);

    let slot = null;
    let bookedAppointment = null;

    const finalDate = appointmentDate || date || new Date().toISOString().split('T')[0];

    // ===== FIND SLOT =====
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

    if (!slot) {
      return res.status(404).json({
        success: false,
        message: "Slot not found. Please select a valid available slot."
      });
    }

    if (slot.status !== 'available') {
      return res.status(400).json({
        success: false,
        message: `Slot is not available. Current status: ${slot.status}`
      });
    }

    // Update slot status
    slot.status = 'booked';
    if (finalDate) slot.date = finalDate;
    await slot.save();

    // ===== NORMALIZE REFERRAL FIELDS =====
    let finalReferralContactId = null;
    let finalReferralCustomerId = null;
    let finalReferralDoctorId = null;
    let finalReferredBy = "";

    if (referralDoctorId && mongoose.Types.ObjectId.isValid(referralDoctorId)) {
      finalReferralDoctorId = referralDoctorId;
      finalReferralContactId = referralDoctorId;
    }

    if (referralCustomerId && mongoose.Types.ObjectId.isValid(referralCustomerId)) {
      finalReferralCustomerId = referralCustomerId;
      if (!finalReferralContactId) {
        finalReferralContactId = referralCustomerId;
      }
    }

    if (!finalReferralContactId && referralContactId && mongoose.Types.ObjectId.isValid(referralContactId)) {
      finalReferralContactId = referralContactId;
    }

    finalReferredBy = referredByDoctor || referredByCustomer || referredBy || "";

    if (finalReferralContactId) {
      try {
        const referralContact = await ReferralContact.findById(finalReferralContactId);
        if (referralContact) {
          console.log("✅ Referral contact found:", referralContact.referralType);
        }
      } catch (err) {
        console.warn("⚠️ Error fetching referral contact:", err.message);
      }
    }

    // ===== TOTALS — ONLY FROM SERVICES =====
    const finalServices = serviceItems || services || [];
    const servicesTotal = finalServices.reduce((sum, s) => sum + (Number(s.price) || 0), 0);
    const subtotal = servicesTotal;
    const commissionPercent = parseFloat(referralCommission) || 0;
    const commissionAmount = (subtotal * commissionPercent) / 100;
    const discountAmount = Number(discount) || 0;                       // ✅ NEW
    const finalPayable = subtotal - commissionAmount - discountAmount;  // ✅ discount minus

    console.log("💰 Totals:", { servicesTotal, subtotal, commissionAmount, discountAmount, finalPayable });

    // ===== ✅ PARTIAL PAYMENT HANDLING =====
    const parsedPartial = Number(partialAmount) || 0;
    let finalPaymentStatus = paymentStatus || "Pending";
    let finalAmountPaid = 0;
    let finalBalanceAmount = finalPayable;

    if (paymentStatus === "Paid") {
      finalAmountPaid = finalPayable;
      finalBalanceAmount = 0;
      finalPaymentStatus = "Paid";
    } else if (paymentStatus === "Partial") {
      if (parsedPartial > 0) {
        finalAmountPaid = parsedPartial;
        finalBalanceAmount = finalPayable - parsedPartial;

        if (finalBalanceAmount <= 0) {
          finalPaymentStatus = "Paid";
          finalAmountPaid = finalPayable;
          finalBalanceAmount = 0;
        } else {
          finalPaymentStatus = "Partial";
        }
      } else {
        finalPaymentStatus = "Pending";
        finalAmountPaid = 0;
        finalBalanceAmount = finalPayable;
      }
    } else if (paymentStatus === "Due") {
      finalAmountPaid = 0;
      finalBalanceAmount = finalPayable;
      finalPaymentStatus = "Due";
    } else {
      finalAmountPaid = 0;
      finalBalanceAmount = finalPayable;
      finalPaymentStatus = "Pending";
    }

    console.log("💳 Payment:", { finalPaymentStatus, finalAmountPaid, finalBalanceAmount });

    // ===== CREATE APPOINTMENT =====
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
      patientId: patientId || undefined,
      patientName: patientName,
      patientTitle: patientTitle || "Mr.",
      patientDob: patientDob || "",
      patientAge: patientAge,
      patientGender: patientGender,
      patientPhone: patientPhone,
      patientEmail: patientEmail || "",
      patientAddress: patientAddress || "",
      patientCity: patientCity || "",
      patientPincode: patientPincode || "",
      patientBloodGroup: patientBloodGroup || "",
      patientMedicalHistory: patientMedicalHistory || "",
      patientAllergies: patientAllergies || "",
      patientMedications: patientMedications || "",
      purpose: purpose || "",
      symptoms: symptoms || "",

      paymentType: paymentType || "cash",
      paymentStatus: finalPaymentStatus,
      partialAmount: parsedPartial,
      amountPaid: finalAmountPaid,
      balanceAmount: finalBalanceAmount,
      appointmentType: appointmentType || "Consultation",
      priority: priority || "Normal",

      // ===== REFERRAL FIELDS =====
      referredBy: finalReferredBy,
      referralContactId: finalReferralContactId,
      referralCustomerId: finalReferralCustomerId,
      referralDoctorId: finalReferralDoctorId,
      referredByCustomer: referredByCustomer || "",
      referredByDoctor: referredByDoctor || "",
      referralCommission: referralCommission || "",
      referralCommissionType: referralCommissionType || "",

      // ===== SERVICES =====
      services: finalServices.map(s => ({
        serviceId: s.serviceId || s._id,
        name: s.name,
        price: Number(s.price) || 0,
        description: s.description || "",
        paymentStatus: s.paymentStatus || "Pending"
      })),

      // ===== CALCULATED FIELDS =====
      subtotal: subtotal,
      commissionAmount: commissionAmount,
      discount: discountAmount,             // ✅ NEW
      finalPayable: finalPayable,
      totalAmount: finalPayable,

      insuranceProvider: insuranceProvider || "",
      insurancePolicyNumber: insurancePolicyNumber || "",
      notes: notes || "",
      status: "confirmed",
      bookedAt: new Date(),
      isOP: isOP || false,
      partnerPaymentStatus: "Due"
    };

    bookedAppointment = new Appointment(appointmentData);
    await bookedAppointment.save();

    const populatedAppointment = await Appointment.findById(bookedAppointment._id)
      .populate('referralContactId')
      .populate('referralCustomerId')
      .populate('referralDoctorId');

    return res.status(200).json({
      success: true,
      message: `✅ Appointment booked successfully for ${patientName}!`,
      appointment: populatedAppointment || bookedAppointment,
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


// ============================================================
// PUT /appointment-slots/updateop/:bookingId — Update Appointment
// ============================================================
router.put("/updateop/:bookingId", async (req, res) => {
  try {
    const { bookingId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ success: false, message: "Invalid booking ID" });
    }

    const existing = await Appointment.findById(bookingId);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    const {
      slotId,
      appointmentDate,
      patientTitle,
      patientName,
      patientAge,
      patientDob,
      patientGender,
      patientPhone,
      patientEmail,
      patientAddress,
      patientCity,
      patientPincode,
      purpose,
      symptoms,
      paymentType,
      paymentStatus,
      partialAmount,
      amountPaid,
      balanceAmount,
      referredByCustomer,
      referredByDoctor,
      referralCustomerId,
      referralDoctorId,
      referralContactId,
      referredBy,
      referralCommission,
      referralCommissionType,
      discount,
      serviceItems,
      services,
      status,
    } = req.body;

    // ===== NORMALIZE REFERRALS =====
    let finalReferralContactId = existing.referralContactId || null;
    let finalReferralCustomerId = existing.referralCustomerId || null;
    let finalReferralDoctorId = existing.referralDoctorId || null;

    if (referralDoctorId && mongoose.Types.ObjectId.isValid(referralDoctorId)) {
      finalReferralDoctorId = referralDoctorId;
      finalReferralContactId = referralDoctorId;
    }
    if (referralCustomerId && mongoose.Types.ObjectId.isValid(referralCustomerId)) {
      finalReferralCustomerId = referralCustomerId;
      if (!finalReferralContactId) finalReferralContactId = referralCustomerId;
    }
    if (!finalReferralContactId && referralContactId && mongoose.Types.ObjectId.isValid(referralContactId)) {
      finalReferralContactId = referralContactId;
    }

    const finalReferredBy = referredByDoctor || referredByCustomer || referredBy || "";

    // ===== NORMALIZE SERVICES =====
    const finalServices =
      (Array.isArray(serviceItems) && serviceItems.length > 0 && serviceItems) ||
      (Array.isArray(services) && services.length > 0 && services) ||
      [];

    const normalizedServices = finalServices.map((s) => ({
      serviceId: s.serviceId || s._id || "",
      name: s.name || "Service",
      price: Number(s.price) || 0,
      description: s.description || "",
      paymentStatus: s.paymentStatus || "Pending",
      addedAt: s.addedAt || new Date(),
    }));

    // ===== ✅ CALCULATE TOTALS (same as /updatecharges logic) =====
    const servicesTotal = normalizedServices.reduce((sum, s) => sum + (s.price || 0), 0);

    // ✅ Use NEW labTotal/medicineTotal if provided, else keep existing
    const medicineTotal = (req.body.medicineTotal !== undefined && req.body.medicineTotal !== null)
      ? Number(req.body.medicineTotal)
      : Number(existing.medicineTotal) || 0;

    const labTotal = (req.body.labTotal !== undefined && req.body.labTotal !== null)
      ? Number(req.body.labTotal)
      : Number(existing.labTotal) || 0;

    // ✅ Grand subtotal = services + lab + medicine
    const subtotal = servicesTotal + medicineTotal + labTotal;

    const commissionPercent = parseFloat(referralCommission) || 0;
    const commissionAmount = (subtotal * commissionPercent) / 100;
    const discountAmount = Number(discount) || 0;

    // ✅ Final = subtotal − commission − discount
    const finalPayable = subtotal - commissionAmount - discountAmount;

    // ===== ✅ PAYMENT HANDLING =====
    let finalPaymentStatus = paymentStatus || "Pending";
    let finalAmountPaid = Number(amountPaid) || 0;
    let finalBalanceAmount = Number(balanceAmount);
    if (isNaN(finalBalanceAmount)) finalBalanceAmount = finalPayable;

    if (paymentStatus === "Paid") {
      finalAmountPaid = finalPayable;
      finalBalanceAmount = 0;
    } else if (paymentStatus === "Partial" && partialAmount) {
      finalAmountPaid = parseFloat(partialAmount) || 0;
      finalBalanceAmount = finalPayable - finalAmountPaid;
      if (finalBalanceAmount <= 0) {
        finalPaymentStatus = "Paid";
        finalAmountPaid = finalPayable;
        finalBalanceAmount = 0;
      }
    } else if (paymentStatus === "Due") {
      finalAmountPaid = 0;
      finalBalanceAmount = finalPayable;
    }

    // ===== UPDATE DATA =====
    const updateData = {
      patientTitle: patientTitle || "Mr.",
      patientName: patientName || existing.patientName,
      patientAge: patientAge ?? existing.patientAge,
      patientDob: patientDob || "",
      patientGender: patientGender || existing.patientGender,
      patientPhone: patientPhone || existing.patientPhone,
      patientEmail: patientEmail || "",
      patientAddress: patientAddress || "",
      patientCity: patientCity || existing.patientCity || "",
      patientPincode: patientPincode || existing.patientPincode || "",
      purpose: purpose || "",
      symptoms: symptoms || "",
      paymentType: paymentType || "cash",
      paymentStatus: finalPaymentStatus,
      partialAmount: parseFloat(partialAmount) || 0,
      amountPaid: finalAmountPaid,
      balanceAmount: finalBalanceAmount,
      referredBy: finalReferredBy,
      referralContactId: finalReferralContactId,
      referralCustomerId: finalReferralCustomerId,
      referralDoctorId: finalReferralDoctorId,
      referredByCustomer: referredByCustomer || "",
      referredByDoctor: referredByDoctor || "",
      referralCommission: referralCommission || "",
      referralCommissionType: referralCommissionType || "",

      // ✅ Services
      services: normalizedServices,

      // ✅ Totals (updated properly)
      servicesTotal,
      medicineTotal,
      labTotal,
      subtotal,
      commissionAmount,
      discount: discountAmount,
      finalPayable,
      totalAmount: finalPayable,
      grandTotal: finalPayable,
      finalPayableAmount: finalPayable,

      status: status || existing.status,
    };

    if (appointmentDate) updateData.appointmentDate = appointmentDate;
    if (slotId && mongoose.Types.ObjectId.isValid(slotId)) updateData.slotId = slotId;

    const updated = await Appointment.findByIdAndUpdate(bookingId, updateData, {
      new: true,
      runValidators: false,
    })
      .populate("referralContactId")
      .populate("referralCustomerId")
      .populate("referralDoctorId");

    return res.status(200).json({
      success: true,
      message: "✅ Appointment updated successfully!",
      appointment: updated,
    });
  } catch (error) {
    console.error("❌ Error updating appointment:", error);
    return res.status(500).json({ success: false, message: error.message });
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



// ================================================================
// 2. UPDATE PARTNER PAYMENT STATUS (WITH TIMESTAMP)
// ================================================================
router.put("/:bookingId/update-partner-payment", async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { partnerPaymentStatus } = req.body;

    // Validate input
    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: "Booking ID is required"
      });
    }

    if (!partnerPaymentStatus) {
      return res.status(400).json({
        success: false,
        message: "Partner payment status is required"
      });
    }

    // Validate partnerPaymentStatus values
    const validStatuses = ["Due", "Pending", "Paid"];
    if (!validStatuses.includes(partnerPaymentStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid partner payment status. Allowed values: ${validStatuses.join(", ")}`
      });
    }

    // Find booking by ID
    const booking = await Appointment.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    // Store previous status for reference
    const previousStatus = booking.partnerPaymentStatus || "Due";

    // Update partner payment status
    booking.partnerPaymentStatus = partnerPaymentStatus;
    booking.updatedAt = new Date();
    
    // ===== ADD TIMESTAMP FIELD =====
    booking.partnerPaymentUpdatedAt = new Date(); // NEW: dedicated timestamp field

    // Save the updated booking
    await booking.save();

    // Return success response with timestamp
    return res.status(200).json({
      success: true,
      message: `Partner payment status updated from "${previousStatus}" to "${partnerPaymentStatus}" successfully`,
      data: {
        _id: booking._id,
        partnerPaymentStatus: booking.partnerPaymentStatus,
        previousStatus: previousStatus,
        updatedAt: booking.updatedAt,
        partnerPaymentUpdatedAt: booking.partnerPaymentUpdatedAt, // NEW: timestamp field
        formattedDate: new Date(booking.partnerPaymentUpdatedAt).toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true
        })
      }
    });

  } catch (error) {
    console.error("Error updating partner payment status:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update partner payment status",
      error: error.message
    });
  }
});




router.get("/getallreferralbookings", async (req, res) => {
  try {
    const bookings = await Appointment.find({
      paymentStatus: "Paid",
      $or: [
        { referralContactId: { $exists: true, $ne: null } },
        { referralDoctorId: { $exists: true, $ne: null } },
        { referralCustomerId: { $exists: true, $ne: null } }
      ]
    })
      .populate("referralContactId")
      .populate("referralDoctorId")
      .populate("referralCustomerId")
      .sort({ createdAt: -1, bookedAt: -1 });

    // ✅ Helper — classify service category
    const classifyService = (svc) => {
      const cat = (svc.category || svc.serviceCategory || svc.type || "").toString().toLowerCase();
      const name = (svc.name || "").toString().toLowerCase();
      if (cat.includes("pharm") || cat.includes("medic") || name.includes("pharm") || name.includes("medic")) return "pharmacy";
      if (cat.includes("lab") || cat.includes("test") || cat.includes("diagnos") || name.includes("lab") || name.includes("test")) return "lab";
      return "clinic";
    };

    const transform = (b) => {
      const slotDetails = b.slotDetails || {};
      const rawServices =
        (Array.isArray(b.services) && b.services.length > 0 && b.services) ||
        (Array.isArray(b.serviceItems) && b.serviceItems.length > 0 && b.serviceItems) ||
        [];

      const normalizedServices = rawServices.map((s) => ({
        serviceId: s.serviceId || s._id || "",
        _id: s.serviceId || s._id || "",
        name: s.name || "Service",
        price: Number(s.price) || 0,
        description: s.description || "",
        category: s.category || s.serviceCategory || s.type || "",
        paymentStatus: s.paymentStatus || b.paymentStatus || "Pending",
      }));

      // ✅ Break down services by category
      let clinicAmount = 0;
      let labAmount = 0;
      let pharmacyAmount = 0;

      normalizedServices.forEach((s) => {
        const cat = classifyService(s);
        const price = Number(s.price) || 0;
        if (cat === "lab") labAmount += price;
        else if (cat === "pharmacy") pharmacyAmount += price;
        else clinicAmount += price;
      });

      // ✅ Add manual medicineTotal + labTotal
      const manualMedicineTotal = Number(b.medicineTotal) || 0;
      const manualLabTotal = Number(b.labTotal) || 0;
      pharmacyAmount += manualMedicineTotal;
      labAmount += manualLabTotal;

      const servicesTotal = normalizedServices.reduce((sum, s) => sum + (Number(s.price) || 0), 0);
      const subtotal = Number(b.subtotal) || (servicesTotal + manualMedicineTotal + manualLabTotal);
      const commissionAmount = Number(b.commissionAmount) || 0;
      const discountAmount = Number(b.discount) || 0;
      const finalPayable =
        Number(b.finalPayable) || Number(b.finalPayableAmount) ||
        Number(b.grandTotal) || Number(b.totalAmount) ||
        (subtotal - commissionAmount - discountAmount) || 0;
      const amountPaid = Number(b.amountPaid) || 0;
      const balanceAmount = Number(b.balanceAmount) || Math.max(0, finalPayable - amountPaid);

      // ✅ Extract referral contact commission %
      const rc = b.referralContactId && typeof b.referralContactId === "object"
        ? b.referralContactId
        : (b.referralDoctorId && typeof b.referralDoctorId === "object" ? b.referralDoctorId : null);

      const clinicCommissionPct = Number(rc?.clinicCommission) || 0;
      const pharmacyCommissionPct = Number(rc?.pharmacyCommission) || 0;
      const labCommissionPct = Number(rc?.labCommission) || 0;

      // ✅ Per-booking doctor payable
      const partnerPayable =
        (clinicAmount * clinicCommissionPct) / 100 +
        (pharmacyAmount * pharmacyCommissionPct) / 100 +
        (labAmount * labCommissionPct) / 100;

      return {
        _id: b._id,
        slotId: b.slotId || b._id,
        patientId: b.patientId || "",
        patientName: b.patientName || "",
        patientAge: b.patientAge || "",
        patientGender: b.patientGender || "",
        patientPhone: b.patientPhone || "",
        patientAddress: b.patientAddress || "",
        patientTitle: b.patientTitle || "Mr.",
        patientDob: b.patientDob || "",
        dayOfWeek: slotDetails.dayOfWeek || b.dayOfWeek || "",
        date: slotDetails.date || b.appointmentDate || b.date || "",
        startTime: slotDetails.startTime || b.startTime || "",
        endTime: slotDetails.endTime || b.endTime || "",
        doctorId: slotDetails.doctorId || b.doctorId || "",
        doctorName: slotDetails.doctorName || b.doctorName || "",
        doctorSpecialization: slotDetails.doctorSpecialization || b.doctorSpecialization || "",
        purpose: b.purpose || "",
        symptoms: b.symptoms || "",
        appointmentType: b.appointmentType || "Consultation",
        paymentType: b.paymentType || "cash",
        paymentStatus: b.paymentStatus || "Pending",
        partialAmount: Number(b.partialAmount) || 0,

        // ✅ Payment statuses — YE ADD KIYE
        doctorPaymentStatus: b.doctorPaymentStatus || "Pending",
        doctorPaymentUpdatedAt: b.doctorPaymentUpdatedAt || null,
        customerPaymentStatus: b.customerPaymentStatus || "Pending",
        partnerPaymentStatus: b.partnerPaymentStatus || "Due",
        partnerPaymentUpdatedAt: b.partnerPaymentUpdatedAt || null,

        // ✅ Totals
        subtotal,
        commissionAmount,
        discount: discountAmount,
        finalPayable,
        finalPayableAmount: finalPayable,
        totalAmount: Number(b.totalAmount) || finalPayable,
        grandTotal: Number(b.grandTotal) || finalPayable,
        amountPaid,
        balanceAmount,

        // ✅ Category breakdown
        clinicAmount,
        labAmount,
        pharmacyAmount,
        medicineTotal: manualMedicineTotal,
        labTotal: manualLabTotal,

        // ✅ Referral commission + partner payable
        clinicCommissionPct,
        pharmacyCommissionPct,
        labCommissionPct,
        partnerPayable: Math.round(partnerPayable),

        status: b.status || "confirmed",
        services: normalizedServices,
        serviceItems: normalizedServices,
        createdAt: b.createdAt || b.bookedAt || new Date().toISOString(),
        bookedAt: b.bookedAt || b.createdAt || new Date().toISOString(),
        appointmentDate: b.appointmentDate || slotDetails.date || "",
        isOP: b.isOP || false,
        referredBy: b.referredBy || "",
        referralContactId: b.referralContactId || "",
        referredByCustomer: b.referredByCustomer || "",
        referredByDoctor: b.referredByDoctor || "",
        referralCustomerId: b.referralCustomerId || "",
        referralDoctorId: b.referralDoctorId || "",
        referralCommission: b.referralCommission || "",
        referralCommissionType: b.referralCommissionType || "",

        referralContactDetails: rc
          ? {
              _id: rc._id,
              referralType: rc.referralType,
              name: rc.doctorName || rc.customerName || "",
              organization: rc.doctorOrganization || "",
              phone: rc.doctorPhone || rc.customerPhone || "",
              specialization: rc.doctorSpecialization || "",
              clinicCommission: Number(rc.clinicCommission) || 0,
              pharmacyCommission: Number(rc.pharmacyCommission) || 0,
              labCommission: Number(rc.labCommission) || 0,
              totalCommission: Number(rc.totalCommission) || 0,
            }
          : null,
      };
    };

    const transformed = bookings.map(transform);

    return res.status(200).json({
      success: true,
      count: transformed.length,
      bookings: transformed
    });
  } catch (error) {
    console.error("❌ Error fetching all referral bookings:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /appointment-slots/updatedoctorpayment/:bookingId
router.put("/updatedoctorpayment/:bookingId", async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { doctorPaymentStatus } = req.body;

    console.log("🔵 [updateDoctorPayment] Called with:", {
      bookingId,
      doctorPaymentStatus,
    });

    if (!bookingId || !mongoose.Types.ObjectId.isValid(bookingId)) {
      console.log("❌ Invalid bookingId");
      return res.status(400).json({
        success: false,
        message: "Valid booking ID is required",
      });
    }

    if (!doctorPaymentStatus || !["Pending", "Paid"].includes(doctorPaymentStatus)) {
      console.log("❌ Invalid status");
      return res.status(400).json({
        success: false,
        message: "doctorPaymentStatus must be 'Pending' or 'Paid'",
      });
    }

    // ✅ Direct update — no middleware, no save(), instant write
    const updated = await Appointment.findByIdAndUpdate(
      bookingId,
      {
        $set: {
          doctorPaymentStatus: doctorPaymentStatus,
          doctorPaymentUpdatedAt: new Date(),
        },
      },
      { new: true, runValidators: false }
    );

    if (!updated) {
      console.log("❌ Booking not found");
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    console.log("✅ Updated:", {
      _id: updated._id,
      doctorPaymentStatus: updated.doctorPaymentStatus,
      doctorPaymentUpdatedAt: updated.doctorPaymentUpdatedAt,
    });

    return res.status(200).json({
      success: true,
      message: `Doctor payment status updated to ${doctorPaymentStatus}`,
      data: updated,
    });

  } catch (error) {
    console.error("❌ Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update",
    });
  }
});


// PUT /api/appointment-slots/updatecustomerpayment/:bookingId
router.put("/updatecustomerpayment/:id", async (req, res) => {
  try {
    const { customerPaymentStatus } = req.body;
    const booking = await Appointment.findByIdAndUpdate(
      req.params.id,
      { customerPaymentStatus },
      { new: true }
    );
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});



router.put("/addmedicines/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { medicines, medicineTotal } = req.body;

    // ✅ Validation
    if (!Array.isArray(medicines)) {
      return res.status(400).json({
        success: false,
        message: "medicines must be an array",
      });
    }

    if (medicines.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one medicine is required",
      });
    }

    // ✅ Validate each medicine
    for (let i = 0; i < medicines.length; i++) {
      const med = medicines[i];
      if (!med.name || typeof med.name !== "string" || med.name.trim() === "") {
        return res.status(400).json({
          success: false,
          message: `Medicine at index ${i} must have a valid name`,
        });
      }
      if (med.price === undefined || med.price === null || isNaN(Number(med.price)) || Number(med.price) < 0) {
        return res.status(400).json({
          success: false,
          message: `Medicine "${med.name}" must have a valid non-negative price`,
        });
      }
    }

    // ✅ Clean/sanitize medicines
    const cleanMedicines = medicines.map((m) => ({
      name: String(m.name).trim(),
      price: Number(m.price) || 0,
    }));

    // ✅ Auto-calculate total if not provided
    const computedTotal =
      medicineTotal !== undefined && medicineTotal !== null
        ? Number(medicineTotal)
        : cleanMedicines.reduce((sum, m) => sum + m.price, 0);

    // ✅ Find and update
    const booking = await AppointmentSlot.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    booking.medicines = cleanMedicines;
    booking.medicineTotal = computedTotal;

    await booking.save();

    return res.status(200).json({
      success: true,
      message: `${cleanMedicines.length} medicine(s) added successfully`,
      data: {
        _id: booking._id,
        medicines: booking.medicines,
        medicineTotal: booking.medicineTotal,
      },
    });
  } catch (error) {
    console.error("❌ Error adding medicines:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to add medicines",
    });
  }
});



router.put("/updatemedicinetotal/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { medicineTotal } = req.body;

    // ✅ Validation
    if (medicineTotal === undefined || medicineTotal === null) {
      return res.status(400).json({
        success: false,
        message: "medicineTotal is required",
      });
    }

    const total = Number(medicineTotal);
    if (isNaN(total) || total < 0) {
      return res.status(400).json({
        success: false,
        message: "medicineTotal must be a valid non-negative number",
      });
    }

    // ✅ Find and update
    const booking = await Appointment.findByIdAndUpdate(
      id,
      { medicineTotal: total },
      { new: true, runValidators: true }
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Medicine total updated to ₹${total}`,
      data: {
        _id: booking._id,
        medicineTotal: booking.medicineTotal,
        patientName: booking.patientName,
      },
    });
  } catch (error) {
    console.error("❌ Error updating medicine total:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update medicine total",
    });
  }
});



router.put("/updatelabtotal/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { labTotal } = req.body;

    // ✅ Validation
    if (labTotal === undefined || labTotal === null) {
      return res.status(400).json({
        success: false,
        message: "labTotal is required",
      });
    }

    const total = Number(labTotal);
    if (isNaN(total) || total < 0) {
      return res.status(400).json({
        success: false,
        message: "labTotal must be a valid non-negative number",
      });
    }

    // ✅ Find and update
    const booking = await Appointment.findByIdAndUpdate(
      id,
      { labTotal: total },
      { new: true, runValidators: true }
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Lab total updated to ₹${total}`,
      data: {
        _id: booking._id,
        labTotal: booking.labTotal,
        patientName: booking.patientName,
      },
    });
  } catch (error) {
    console.error("❌ Error updating lab total:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update lab total",
    });
  }
});




router.put("/updatecharges/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { medicineTotal, labTotal } = req.body;

    // ✅ At least one required
    if (medicineTotal === undefined && labTotal === undefined) {
      return res.status(400).json({
        success: false,
        message: "At least one of medicineTotal or labTotal is required",
      });
    }

    // ✅ Validate medicineTotal
    let newMedicineTotal;
    if (medicineTotal !== undefined && medicineTotal !== null) {
      newMedicineTotal = Number(medicineTotal);
      if (isNaN(newMedicineTotal) || newMedicineTotal < 0) {
        return res.status(400).json({
          success: false,
          message: "medicineTotal must be a valid non-negative number",
        });
      }
    }

    // ✅ Validate labTotal
    let newLabTotal;
    if (labTotal !== undefined && labTotal !== null) {
      newLabTotal = Number(labTotal);
      if (isNaN(newLabTotal) || newLabTotal < 0) {
        return res.status(400).json({
          success: false,
          message: "labTotal must be a valid non-negative number",
        });
      }
    }

    // ✅ Find booking
    const booking = await Appointment.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // ✅ Just set the raw values — middleware will handle the math
    if (newMedicineTotal !== undefined) booking.medicineTotal = newMedicineTotal;
    if (newLabTotal !== undefined) booking.labTotal = newLabTotal;

    // ✅ Save — pre-save middleware recalculates everything automatically
    await booking.save();

    return res.status(200).json({
      success: true,
      message: `Charges updated. New total: ₹${booking.grandTotal}`,
      data: {
        _id: booking._id,
        medicineTotal: booking.medicineTotal,
        labTotal: booking.labTotal,
        servicesTotal: booking.servicesTotal,
        subtotal: booking.subtotal,
        totalAmount: booking.totalAmount,
        grandTotal: booking.grandTotal,
        commissionAmount: booking.commissionAmount,
        finalPayable: booking.finalPayable,
        finalPayableAmount: booking.finalPayableAmount,
        amountPaid: booking.amountPaid,
        balanceAmount: booking.balanceAmount,
        paymentStatus: booking.paymentStatus,
        patientName: booking.patientName,
      },
    });
  } catch (error) {
    console.error("❌ Error updating charges:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update charges",
    });
  }
});



// ✅ NEW: Vitals update API
router.put("/vitals/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { vitalsTemp, vitalsBp, vitalsPr, vitalsWeight } = req.body;

    // ✅ At least one required
    if (
      vitalsTemp === undefined &&
      vitalsBp === undefined &&
      vitalsPr === undefined &&
      vitalsWeight === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "At least one vital field is required",
      });
    }

    // ✅ Find booking
    const booking = await Appointment.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // ✅ Set vitals (only if provided)
    if (vitalsTemp !== undefined && vitalsTemp !== null) booking.vitalsTemp = String(vitalsTemp).trim();
    if (vitalsBp !== undefined && vitalsBp !== null) booking.vitalsBp = String(vitalsBp).trim();
    if (vitalsPr !== undefined && vitalsPr !== null) booking.vitalsPr = String(vitalsPr).trim();
    if (vitalsWeight !== undefined && vitalsWeight !== null) booking.vitalsWeight = String(vitalsWeight).trim();

    // ✅ Save
    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Vitals updated successfully",
      data: {
        _id: booking._id,
        vitalsTemp: booking.vitalsTemp,
        vitalsBp: booking.vitalsBp,
        vitalsPr: booking.vitalsPr,
        vitalsWeight: booking.vitalsWeight,
        patientName: booking.patientName,
      },
    });
  } catch (error) {
    console.error("❌ Error updating vitals:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update vitals",
    });
  }
});



// ✅ Toggle Active Status
router.put("/toggle-active/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be a boolean value",
      });
    }

    const booking = await Appointment.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    return res.status(200).json({
      success: true,
      message: `Booking marked as ${isActive ? "Active" : "Inactive"}`,
      data: { _id: booking._id, isActive: booking.isActive },
    });
  } catch (error) {
    console.error("Error toggling active status:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;