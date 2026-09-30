// controllers/timelyClientController.js
const crypto = require("crypto");
const Razorpay = require("razorpay");
const mongoose = require("mongoose");
const TimelyClient = require("../models/TimelyClient");
const TimelyBooking = require("../models/TimelyBooking");
const TimelyPlan = require("../models/TimelyPlan");

/* ══════════════════════════════════════════════
   1️⃣ ADD CLIENT
   POST /api/timely-clients/add
   ══════════════════════════════════════════════ */
exports.addTimelyClient = async (req, res) => {
  try {
    const { name, email, organisationName, location, phone, password } = req.body;

    // Validation
    if (!name || !email || !organisationName || !location || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required (name, email, organisationName, location, phone, password)",
      });
    }

    // Duplicate email check
    const existing = await TimelyClient.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "A client with this email already exists",
      });
    }

    // Create
    const client = await TimelyClient.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      organisationName: organisationName.trim(),
      location: location.trim(),
      phone: phone.trim(),
      password: password,
    });

    return res.status(201).json({
      success: true,
      message: "TimelyHealth client created successfully",
      data: client,
    });
  } catch (error) {
    console.error("addTimelyClient Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create client",
    });
  }
};

/* ══════════════════════════════════════════════
   2️⃣ GET ALL CLIENTS
   GET /api/timely-clients/all
   ══════════════════════════════════════════════ */
exports.getAllTimelyClients = async (req, res) => {
  try {
    const { search, status } = req.query;

    let filter = {};

    // Optional status filter
    if (status && status !== "all") {
      filter.status = status;
    }

    // Optional search
    if (search && search.trim()) {
      const q = search.trim();
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
        { organisationName: { $regex: q, $options: "i" } },
        { location: { $regex: q, $options: "i" } },
        { phone: { $regex: q, $options: "i" } },
      ];
    }

    const clients = await TimelyClient.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "TimelyHealth clients fetched successfully",
      count: clients.length,
      data: clients,
    });
  } catch (error) {
    console.error("getAllTimelyClients Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch clients",
    });
  }
};

/* ══════════════════════════════════════════════
   3️⃣ GET CLIENT BY ID
   GET /api/timely-clients/:id
   ══════════════════════════════════════════════ */
exports.getTimelyClientById = async (req, res) => {
  try {
    const { id } = req.params;

    const client = await TimelyClient.findById(id);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: client,
    });
  } catch (error) {
    console.error("getTimelyClientById Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch client",
    });
  }
};

/* ══════════════════════════════════════════════
   4️⃣ UPDATE CLIENT
   PUT /api/timely-clients/update/:id
   ══════════════════════════════════════════════ */
exports.updateTimelyClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, organisationName, location, phone, password, status } = req.body;

    const client = await TimelyClient.findById(id);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    // Duplicate email check (agar email change ho raha hai)
    if (email && email.toLowerCase() !== client.email) {
      const existing = await TimelyClient.findOne({
        email: email.toLowerCase(),
        _id: { $ne: id },
      });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: "Another client with this email already exists",
        });
      }
      client.email = email.toLowerCase().trim();
    }

    // Update only provided fields
    if (name) client.name = name.trim();
    if (organisationName) client.organisationName = organisationName.trim();
    if (location) client.location = location.trim();
    if (phone) client.phone = phone.trim();
    if (password) client.password = password; // simple, no hash
    if (status) client.status = status;

    await client.save();

    return res.status(200).json({
      success: true,
      message: "Client updated successfully",
      data: client,
    });
  } catch (error) {
    console.error("updateTimelyClient Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update client",
    });
  }
};

/* ══════════════════════════════════════════════
   5️⃣ DELETE CLIENT
   DELETE /api/timely-clients/delete/:id
   ══════════════════════════════════════════════ */
exports.deleteTimelyClient = async (req, res) => {
  try {
    const { id } = req.params;

    const client = await TimelyClient.findByIdAndDelete(id);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Client deleted successfully",
      data: client,
    });
  } catch (error) {
    console.error("deleteTimelyClient Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete client",
    });
  }
};

/* ══════════════════════════════════════════════
   6️⃣ TOGGLE STATUS (bonus)
   PUT /api/timely-clients/toggle-status/:id
   ══════════════════════════════════════════════ */
exports.toggleTimelyClientStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const client = await TimelyClient.findById(id);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    client.status = client.status === "active" ? "inactive" : "active";
    await client.save();

    return res.status(200).json({
      success: true,
      message: `Client status changed to '${client.status}'`,
      data: client,
    });
  } catch (error) {
    console.error("toggleTimelyClientStatus Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to toggle status",
    });
  }
};





/* ══════════════════════════════════════════════
   RAZORPAY INSTANCE
   ══════════════════════════════════════════════ */
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_TQkLWUaBkiSKBY",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "3uwm0uK0B5PpYpNDWZSIhPlf",
});

/* ══════════════════════════════════════════════
   HELPER FUNCTIONS
   ══════════════════════════════════════════════ */
const generateClientId = () => {
  return (
    "TH" +
    Date.now().toString(36).toUpperCase() +
    Math.random().toString(36).substring(2, 5).toUpperCase()
  );
};

const generateReferralCode = (name = "") => {
  const prefix = (name.replace(/\s+/g, "").slice(0, 3) || "THC").toUpperCase();
  const suffix = Date.now().toString(36).slice(-5).toUpperCase();
  return prefix + suffix;
};

const calculateValidTill = (validFrom, validity, validityUnit) => {
  if (!validity) return null;
  const d = new Date(validFrom);
  if (validityUnit === "years") d.setFullYear(d.getFullYear() + validity);
  else if (validityUnit === "months") d.setMonth(d.getMonth() + validity);
  else d.setDate(d.getDate() + validity);
  return d;
};

const verifyRazorpaySignature = ({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) => {
  const secret = process.env.RAZORPAY_KEY_SECRET || "3uwm0uK0B5PpYpNDWZSIhPlf";
  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");
  return expectedSignature === razorpay_signature;
};

/* ══════════════════════════════════════════════
   BOOK PLAN CONTROLLER (Handles both steps)
   POST /api/timely-clients/bookplan

   STEP 1 → Body without razorpay fields
           → Order create karke bhej dega

   STEP 2 → Body with razorpay_order_id,
            razorpay_payment_id, razorpay_signature
           → Verify karke booking save karega
   ══════════════════════════════════════════════ */
exports.bookPlan = async (req, res) => {
  try {
    const {
      /* form fields */
      fullName,
      workEmail,
      mobileNumber,
      companySize,
      industryType,
      address,
      organizationName,
      panNumber,
      planId,
      planName,
      price,
      referralCode,
      accessibleProducts = [],

      /* razorpay verification fields (only in step 2) */
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    /* ═══════════════════════════════════════════
       STEP 1 → ORDER CREATE
       (jab razorpay fields nahi aaye)
       ═══════════════════════════════════════════ */
    const isVerificationStep = razorpay_order_id && razorpay_payment_id && razorpay_signature;

    if (!isVerificationStep) {
      /* Validation for order creation */
      if (!planId) {
        return res.status(400).json({
          success: false,
          message: "planId is required",
        });
      }

      /* Amount calculate with GST */
      const baseAmount = Number(price) || 0;
      const gstAmount = Math.round(baseAmount * 0.18);
      const totalAmount = baseAmount + gstAmount;

      if (totalAmount <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid amount. price must be greater than 0",
        });
      }

      /* Razorpay order create karo */
      const razorpayOrder = await razorpay.orders.create({
        amount: totalAmount * 100, // ₹ → paise
        currency: "INR",
        receipt: `rcpt_${Date.now()}`,
        notes: {
          planId: String(planId),
          planName: planName || "Plan",
          baseAmount: String(baseAmount),
          gstAmount: String(gstAmount),
          totalAmount: String(totalAmount),
        },
      });

      return res.status(200).json({
        success: true,
        step: "order_created",
        message: "Order created successfully",
        order: {
          orderId: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
        },
        breakdown: {
          baseAmount,
          gstAmount,
          totalAmount,
        },
        keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_TQkLWUaBkiSKBY",
      });
    }

    /* ═══════════════════════════════════════════
       STEP 2 → VERIFY + SAVE BOOKING
       ═══════════════════════════════════════════ */

    /* 2.1 Basic validation */
    if (!fullName || !workEmail || !mobileNumber || !planId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: fullName, workEmail, mobileNumber, planId",
      });
    }

    /* 2.2 Verify Razorpay signature */
    const isValid = verifyRazorpaySignature({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed. Invalid signature.",
      });
    }

    /* 2.3 Duplicate check */
    const existingBooking = await TimelyBooking.findOne({
      transactionId: razorpay_payment_id,
    });
    if (existingBooking) {
      return res.status(200).json({
        success: true,
        message: "Booking already exists",
        client: {
          clientId: existingBooking.clientId,
          referralCode: existingBooking.generatedReferralCode,
          name: existingBooking.fullName,
          email: existingBooking.workEmail,
        },
        booking: existingBooking,
      });
    }

    /* 2.4 Fetch payment details from Razorpay (double check) */
    let paymentDetails = null;
    try {
      paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);
    } catch (e) {
      console.warn("Could not fetch payment details:", e.message);
    }

    if (
      paymentDetails &&
      paymentDetails.status !== "captured" &&
      paymentDetails.status !== "authorized"
    ) {
      return res.status(400).json({
        success: false,
        message: `Payment not successful. Status: ${paymentDetails.status}`,
      });
    }

    /* 2.5 Plan fetch karo */
    let plan = null;
    if (mongoose.Types.ObjectId.isValid(planId)) {
      plan = await TimelyPlan.findById(planId);
    }

    /* 2.6 Amounts */
    const baseAmount = plan?.price || 0;
    const discount = plan?.discount || 0;
    const discountedPrice = Math.round(baseAmount - (baseAmount * discount) / 100);
    const gstAmount = Math.round(discountedPrice * 0.18);
    const totalAmount = discountedPrice + gstAmount;

    /* 2.7 Validity */
    const validFrom = new Date();
    const validTill = plan
      ? calculateValidTill(validFrom, plan.validity, plan.validityUnit)
      : null;

    /* 2.8 Generate IDs */
    const generatedClientId = generateClientId();
    const generatedReferralCode = generateReferralCode(fullName);

    /* 2.9 Create booking */
    const booking = await TimelyBooking.create({
      fullName,
      workEmail,
      mobileNumber,
      companySize: companySize || "1-10",
      industryType: industryType || "",
      address: address || "",
      organizationName: organizationName || "",
      panNumber: panNumber || "",

      planId: String(planId),
      planName: plan?.planName || "Custom Add-ons",
      planSnapshot: {
        price: baseAmount,
        discount,
        validity: plan?.validity || 0,
        validityUnit: plan?.validityUnit || "days",
      },

      accessibleProducts: accessibleProducts.map((p) => ({ name: p.name })),

      transactionId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
      baseAmount: discountedPrice,
      gstAmount,
      totalAmount,
      paymentStatus: "paid",
      paymentMethod: paymentDetails?.method || "",
      paidAt: validFrom,

      referralCode: referralCode || "",
      generatedReferralCode,
      clientId: generatedClientId,

      validFrom,
      validTill,
      status: "active",
    });

    /* 2.10 Client create / update */
    let client = await TimelyClient.findOne({ email: workEmail });

    if (client) {
      client.name = fullName;
      client.phone = mobileNumber;
      client.organisationName = organizationName || client.organisationName;
      client.address = address || client.address;
      client.industryType = industryType || client.industryType;
      client.companySize = companySize || client.companySize;
      client.panNumber = panNumber || client.panNumber;
      client.clientId = generatedClientId;
      client.referralCode = generatedReferralCode;
      client.planId = String(planId);
      client.planName = plan?.planName || "Custom Add-ons";
      client.accessibleProducts = accessibleProducts.map((p) => ({ name: p.name }));
      client.validFrom = validFrom;
      client.validTill = validTill;
      client.booking = booking._id;
      client.status = "active";
      await client.save();
    } else {
      client = await TimelyClient.create({
        name: fullName,
        email: workEmail,
        phone: mobileNumber,
        organisationName: organizationName || "",
        address: address || "",
        location: address || "",
        industryType: industryType || "",
        companySize: companySize || "",
        panNumber: panNumber || "",
        clientId: generatedClientId,
        referralCode: generatedReferralCode,
        planId: String(planId),
        planName: plan?.planName || "Custom Add-ons",
        accessibleProducts: accessibleProducts.map((p) => ({ name: p.name })),
        validFrom,
        validTill,
        booking: booking._id,
        status: "active",
      });
    }

    /* 2.11 Link booking ↔ client */
    booking.client = client._id;
    await booking.save();

    /* 2.12 Response */
    return res.status(200).json({
      success: true,
      step: "booking_completed",
      message: "Plan activated successfully",
      client: {
        clientId: booking.clientId,
        referralCode: booking.generatedReferralCode,
        name: booking.fullName,
        email: booking.workEmail,
      },
      booking: {
        _id: booking._id,
        planId: booking.planId,
        planName: booking.planName,
        transactionId: booking.transactionId,
        razorpayOrderId: booking.razorpayOrderId,
        baseAmount: booking.baseAmount,
        gstAmount: booking.gstAmount,
        totalAmount: booking.totalAmount,
        paymentStatus: booking.paymentStatus,
        validFrom: booking.validFrom,
        validTill: booking.validTill,
        accessibleProducts: booking.accessibleProducts,
        status: booking.status,
        createdAt: booking.createdAt,
      },
    });

  } catch (err) {
    console.error("bookPlan error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Something went wrong. Please try again.",
    });
  }
};
/* ══════════════════════════════════════════════
   OPTIONAL — GET all bookings (admin use)
   GET /api/clients/bookings
   ══════════════════════════════════════════════ */
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await TimelyBooking.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (err) {
    console.error("getAllBookings error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/* ══════════════════════════════════════════════
   OPTIONAL — GET single booking by clientId
   GET /api/clients/booking/:clientId
   ══════════════════════════════════════════════ */
exports.getBookingByClientId = async (req, res) => {
  try {
    const { clientId } = req.params;
    const booking = await TimelyBooking.findOne({ clientId });
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }
    return res.status(200).json({ success: true, data: booking });
  } catch (err) {
    console.error("getBookingByClientId error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
