const Patient = require('../models/Patient');
const Appointment = require("../models/Appointment");


// Create a new patient record
exports.createPatient = async (req, res) => {
  try {
    const patient = await Patient.create(req.body);
    return res.status(201).json({ success: true, data: patient });
  } catch (err) {
    console.error('Error creating patient:', err);
    return res.status(400).json({ success: false, message: err.message });
  }
};

// Get list of patients (with optional pagination & search)
exports.getPatients = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = {};
    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [{ name: regex }, { phone: regex }];
    }
    const patients = await Patient.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    const total = await Patient.countDocuments(query);
    return res.json({ success: true, data: patients, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error('Error fetching patients:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Get a single patient by ID
exports.getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }
    return res.json({ success: true, data: patient });
  } catch (err) {
    console.error('Error fetching patient:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Update patient (partial updates allowed)
exports.updatePatient = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }
    return res.json({ success: true, data: patient });
  } catch (err) {
    console.error('Error updating patient:', err);
    return res.status(400).json({ success: false, message: err.message });
  }
};

// Delete patient record
exports.deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }
    return res.json({ success: true, message: 'Patient deleted' });
  } catch (err) {
    console.error('Error deleting patient:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};



// ============================================================
// POST /api/patients/login
// Body: { email }
// Simple login — returns minimal patient info only
// ============================================================
exports.patientLogin = async (req, res) => {
  try {
    const { email } = req.body;

    // ---------- Validation ----------
    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    console.log("📥 Patient login attempt:", normalizedEmail);

    // ---------- Check if any appointment exists with this email ----------
    const latestAppointment = await Appointment.findOne({
      patientEmail: { $regex: new RegExp(`^${normalizedEmail}$`, "i") },
    })
      .sort({ appointmentDate: -1, bookedAt: -1 })
      .select("patientName patientTitle patientEmail patientPhone")
      .lean();

    if (!latestAppointment) {
      return res.status(404).json({
        success: false,
        message: "No appointments found with this email. Please book an appointment first.",
      });
    }

    console.log("✅ Patient login success:", normalizedEmail);

    // ---------- Minimal response ----------
    return res.status(200).json({
      success: true,
      message: "Login successful",
      patient: {
        name: latestAppointment.patientName || "",
        email: latestAppointment.patientEmail || normalizedEmail,
        phone: latestAppointment.patientPhone || "",
      },
    });
  } catch (error) {
    console.error("❌ Patient login error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};




exports.getPatientDashboard = async (req, res) => {
  try {
    const email = req.params.email || req.query.email;

    // ---------- Validation ----------
    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    console.log("📥 Patient dashboard request:", normalizedEmail);

    // ---------- Fetch all appointments ----------
    const appointments = await Appointment.find({
      patientEmail: { $regex: new RegExp(`^${normalizedEmail}$`, "i") },
    })
      .sort({ appointmentDate: -1, bookedAt: -1 })
      .lean();

    if (!appointments || appointments.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No appointments found with this email",
      });
    }

    // ============================================================
    // ✅ MERGE patient info from ALL appointments
    // ============================================================
    const pickFirst = (field) => {
      for (const apt of appointments) {
        if (apt[field] !== undefined && apt[field] !== null && apt[field] !== "") {
          return apt[field];
        }
      }
      return "";
    };

    const patient = {
      name: pickFirst("patientName"),
      title: pickFirst("patientTitle"),
      email: pickFirst("patientEmail") || normalizedEmail,
      phone: pickFirst("patientPhone"),
      age: pickFirst("patientAge"),
      gender: pickFirst("patientGender"),
      dob: pickFirst("patientDob"),
      address: pickFirst("patientAddress"),
      city: pickFirst("patientCity"),
      pincode: pickFirst("patientPincode"),
    };

    // ---------- Helper: today ----------
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // ---------- Transform appointments ----------
    const transformed = appointments.map((apt) => {
      const slot = apt.slotDetails || {};
      return {
        _id: apt._id,
        appointmentDate: apt.appointmentDate || slot.date || "",
        dayOfWeek: slot.dayOfWeek || "",
        startTime: slot.startTime || apt.startTime || "",
        endTime: slot.endTime || apt.endTime || "",
        startTime24: slot.startTime24 || apt.startTime24 || "",
        endTime24: slot.endTime24 || apt.endTime24 || "",
        shift: slot.shift || apt.shift || "Morning Shift",

        doctorId: slot.doctorId || apt.doctorId || "",
        doctorName: slot.doctorName || apt.doctorName || "",
        doctorSpecialization:
          slot.doctorSpecialization || apt.doctorSpecialization || "",
        doctorEmail: apt.doctorEmail || "",
        doctorPhone: apt.doctorPhone || "",

        clinicId: apt.clinicId || "",
        clinicName: apt.clinicName || "",

        patientName: apt.patientName || "",
        patientAge: apt.patientAge || "",
        patientGender: apt.patientGender || "",
        patientPhone: apt.patientPhone || "",
        patientEmail: apt.patientEmail || "",

        purpose: apt.purpose || "",
        symptoms: apt.symptoms || "",
        notes: apt.notes || "",
        appointmentType: apt.appointmentType || "Online Consultation",
        bookingType: apt.bookingType || "Online",
        isOnline: apt.isOnline !== undefined ? apt.isOnline : true,

        paymentType: apt.paymentType || "cash",
        paymentStatus: apt.paymentStatus || "Pending",
        amountPaid: apt.amountPaid || 0,
        amountDue: apt.balanceAmount || 0,
        balanceAmount: apt.balanceAmount || 0,
        finalPayable: apt.finalPayable || apt.totalAmount || 0,
        totalAmount: apt.totalAmount || 0,
        paymentTransactionId: apt.paymentTransactionId || "",
        transactionId: apt.transactionId || "",
        paymentMethod: apt.paymentMethod || "",
        consultationFee: apt.consultationFee || 0,
        servicesTotal: apt.servicesTotal || 0,
        discount: apt.discount || 0,
        tax: apt.tax || 0,

        status: apt.status || "confirmed",
        isActive: apt.isActive !== undefined ? apt.isActive : true,

        services: (apt.services || []).map((s) => ({
          name: s.name || "",
          price: s.price || 0,
          description: s.description || "",
          paymentStatus: s.paymentStatus || "Pending",
        })),

        reports: apt.reports || [],
        prescriptions: apt.prescriptions || [],

        // ⭐ RESCHEDULE DATA — YE ADD KIYA
        rescheduleHistory: apt.rescheduleHistory || [],
        rescheduledAt: apt.rescheduledAt || null,
        rescheduleCount: apt.rescheduleCount || 0,

        bookedAt: apt.bookedAt || apt.createdAt || null,
        createdAt: apt.createdAt || null,
        updatedAt: apt.updatedAt || null,

        bookingId: apt.bookingId || "",
      };
    });

    // ---------- Classify appointments ----------
    const upcoming = [];
    const past = [];
    const cancelled = [];

    transformed.forEach((apt) => {
      const isCancelled =
        apt.status === "cancelled" || apt.status === "Cancelled";
      if (isCancelled) {
        cancelled.push(apt);
        return;
      }

      const aptDate = new Date(apt.appointmentDate);
      aptDate.setHours(0, 0, 0, 0);

      if (aptDate >= today) {
        upcoming.push(apt);
      } else {
        past.push(apt);
      }
    });

    // Sort upcoming by nearest first
    upcoming.sort(
      (a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate)
    );

    // ---------- Stats ----------
    const totalAppointments = transformed.length;
    const totalUpcoming = upcoming.length;
    const totalPast = past.length;
    const totalCancelled = cancelled.length;

    let totalPaid = 0;
    let totalPending = 0;

    transformed.forEach((apt) => {
      if (apt.paymentStatus === "Paid") {
        totalPaid += Number(apt.amountPaid) || 0;
      } else {
        totalPending += Number(apt.balanceAmount) || 0;
      }
    });

    const doctorSet = new Set(
      transformed.map((a) => a.doctorName).filter(Boolean)
    );

    const nextAppointment = upcoming.length > 0 ? upcoming[0] : null;

    let totalReports = 0;
    let totalPrescriptions = 0;
    transformed.forEach((apt) => {
      totalReports += (apt.reports || []).length;
      totalPrescriptions += (apt.prescriptions || []).length;
    });

    console.log("✅ Dashboard fetched:", {
      email: normalizedEmail,
      totalAppointments,
      upcoming: totalUpcoming,
      past: totalPast,
    });

    // ---------- Response ----------
    return res.status(200).json({
      success: true,
      message: "Dashboard data fetched successfully",
      patient,
      stats: {
        totalAppointments,
        totalUpcoming,
        totalPast,
        totalCancelled,
        totalPaid,
        totalPending,
        totalDoctors: doctorSet.size,
        totalReports,
        totalPrescriptions,
      },
      nextAppointment,
      upcomingAppointments: upcoming,
      pastAppointments: past,
      cancelledAppointments: cancelled,
    });
  } catch (error) {
    console.error("❌ Patient dashboard error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching dashboard",
    });
  }
};
