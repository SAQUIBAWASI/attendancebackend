// const ConsultationLead = require("../models/ConsultationLead");
// const nodemailer = require("nodemailer");

// // ─── Email transporter (reuse existing EMAIL_USER / EMAIL_PASS from .env) ───
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// // ─── Helper: send notification email to admin ───────────────────────────────
// async function sendAdminNotification(lead) {
//   try {
//     await transporter.sendMail({
//       from: `"Timely Health Website" <${process.env.EMAIL_USER}>`,
//       to: process.env.EMAIL_USER, // admin inbox
//       subject: `📩 New Consultation Request — ${lead.businessName}`,
//       html: `
//         <h2 style="color:#16a34a;">New Free Consultation Request</h2>
//         <table cellpadding="8" style="border-collapse:collapse;width:100%;font-family:sans-serif;">
//           <tr><td><b>Name</b></td><td>${lead.name}</td></tr>
//           <tr style="background:#f9fafb;"><td><b>Business</b></td><td>${lead.businessName}</td></tr>
//           <tr><td><b>Phone</b></td><td>${lead.phone}</td></tr>
//           <tr style="background:#f9fafb;"><td><b>Email</b></td><td>${lead.email}</td></tr>
//           <tr><td><b>Business Type</b></td><td>${lead.businessType}</td></tr>
//           <tr style="background:#f9fafb;"><td><b>Looking For</b></td><td>${lead.lookingFor}</td></tr>
//           <tr><td><b>Submitted At</b></td><td>${new Date(lead.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</td></tr>
//         </table>
//       `,
//     });
//   } catch (err) {
//     console.error("⚠️  Admin notification email failed:", err.message);
//     // Non-fatal — don't throw; lead is already saved
//   }
// }

// // ─── Helper: send confirmation email to the lead ────────────────────────────
// async function sendLeadConfirmation(lead) {
//   try {
//     await transporter.sendMail({
//       from: `"Timely Health" <${process.env.EMAIL_USER}>`,
//       to: lead.email,
//       subject: "We received your consultation request! 🎉",
//       html: `
//         <h2 style="color:#16a34a;">Hi ${lead.name},</h2>
//         <p>Thank you for reaching out to <b>Timely Health</b>!</p>
//         <p>We've received your request for <b>${lead.lookingFor}</b> and our team will get in touch with you shortly.</p>
//         <br/>
//         <p style="color:#6b7280;font-size:13px;">If you have any urgent questions, feel free to reply to this email.</p>
//         <p>— The Timely Health Team</p>
//       `,
//     });
//   } catch (err) {
//     console.error("⚠️  Lead confirmation email failed:", err.message);
//   }
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // POST /api/consultation-leads
// // Submit a new free-consultation request (public — no auth required)
// // ─────────────────────────────────────────────────────────────────────────────
// exports.submitLead = async (req, res) => {
//   try {
//     const { name, businessName, phone, email, businessType, lookingFor } =
//       req.body;

//     // Basic presence check (Mongoose will also validate enums / required)
//     if (!name || !businessName || !phone || !email || !businessType || !lookingFor) {
//       return res
//         .status(400)
//         .json({ success: false, message: "All fields are required." });
//     }

//     const lead = await ConsultationLead.create({
//       name,
//       businessName,
//       phone,
//       email,
//       businessType,
//       lookingFor,
//     });

//     // Fire-and-forget emails (don't block the response)
//     sendAdminNotification(lead);
//     sendLeadConfirmation(lead);

//     return res.status(201).json({
//       success: true,
//       message: "Your consultation request has been submitted successfully!",
//       data: lead,
//     });
//   } catch (error) {
//     // Duplicate email — give a friendly message
//     if (error.code === 11000) {
//       return res.status(409).json({
//         success: false,
//         message:
//           "A request with this email already exists. We'll be in touch soon!",
//       });
//     }
//     console.error("❌ submitLead error:", error);
//     return res
//       .status(500)
//       .json({ success: false, message: "Server error. Please try again." });
//   }
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // GET /api/consultation-leads
// // Fetch all leads — admin only (add your auth middleware on the route)
// // ─────────────────────────────────────────────────────────────────────────────
// exports.getAllLeads = async (req, res) => {
//   try {
//     const { status, page = 1, limit = 20 } = req.query;
//     const filter = status ? { status } : {};

//     const [leads, total] = await Promise.all([
//       ConsultationLead.find(filter)
//         .sort({ createdAt: -1 })
//         .skip((page - 1) * limit)
//         .limit(Number(limit)),
//       ConsultationLead.countDocuments(filter),
//     ]);

//     return res.json({
//       success: true,
//       total,
//       page: Number(page),
//       pages: Math.ceil(total / limit),
//       data: leads,
//     });
//   } catch (error) {
//     console.error("❌ getAllLeads error:", error);
//     return res
//       .status(500)
//       .json({ success: false, message: "Server error." });
//   }
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // PATCH /api/consultation-leads/:id/status
// // Update lead status — admin only
// // ─────────────────────────────────────────────────────────────────────────────
// exports.updateLeadStatus = async (req, res) => {
//   try {
//     const { status } = req.body;
//     const allowed = ["New", "Contacted", "Converted", "Rejected"];
//     if (!allowed.includes(status)) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Invalid status value." });
//     }

//     const lead = await ConsultationLead.findByIdAndUpdate(
//       req.params.id,
//       { status },
//       { new: true }
//     );

//     if (!lead) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Lead not found." });
//     }

//     return res.json({ success: true, data: lead });
//   } catch (error) {
//     console.error("❌ updateLeadStatus error:", error);
//     return res
//       .status(500)
//       .json({ success: false, message: "Server error." });
//   }
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // DELETE /api/consultation-leads/:id
// // Delete a lead — admin only
// // ─────────────────────────────────────────────────────────────────────────────
// exports.deleteLead = async (req, res) => {
//   try {
//     const lead = await ConsultationLead.findByIdAndDelete(req.params.id);
//     if (!lead) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Lead not found." });
//     }
//     return res.json({ success: true, message: "Lead deleted successfully." });
//   } catch (error) {
//     console.error("❌ deleteLead error:", error);
//     return res
//       .status(500)
//       .json({ success: false, message: "Server error." });
//   }
// };


const ConsultationLead = require("../models/ConsultationLead");
const nodemailer = require("nodemailer");

// ═══════════════════════════════════════════════════════════════
// EMAIL TRANSPORTER (factory — created on demand, safe if .env missing)
// ═══════════════════════════════════════════════════════════════
function getTransporter() {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("⚠️  EMAIL_USER / EMAIL_PASS missing — emails disabled");
    return null;
  }
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

// ═══════════════════════════════════════════════════════════════
// HELPER: Admin notification email
// ═══════════════════════════════════════════════════════════════
async function sendAdminNotification(lead) {
  try {
    const transporter = getTransporter();
    if (!transporter) return;

    await transporter.sendMail({
      from: `"Timely Health Website" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `📩 New Consultation Request — ${lead.businessName}`,
      html: `
        <h2 style="color:#16a34a;">New Free Consultation Request</h2>
        <table cellpadding="8" style="border-collapse:collapse;width:100%;font-family:sans-serif;">
          <tr><td><b>Name</b></td><td>${lead.name}</td></tr>
          <tr style="background:#f9fafb;"><td><b>Business</b></td><td>${lead.businessName}</td></tr>
          <tr><td><b>Phone</b></td><td>${lead.phone}</td></tr>
          <tr style="background:#f9fafb;"><td><b>Email</b></td><td>${lead.email}</td></tr>
          <tr><td><b>Business Type</b></td><td>${lead.businessType}</td></tr>
          <tr style="background:#f9fafb;"><td><b>Looking For</b></td><td>${lead.lookingFor}</td></tr>
          <tr><td><b>Submitted At</b></td><td>${new Date(lead.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</td></tr>
        </table>
      `,
    });
    console.log("✅ Admin notification sent");
  } catch (err) {
    console.error("⚠️  Admin notification email failed:", err.message);
  }
}

// ═══════════════════════════════════════════════════════════════
// HELPER: Lead confirmation email
// ═══════════════════════════════════════════════════════════════
async function sendLeadConfirmation(lead) {
  try {
    const transporter = getTransporter();
    if (!transporter) return;

    await transporter.sendMail({
      from: `"Timely Health" <${process.env.EMAIL_USER}>`,
      to: lead.email,
      subject: "We received your consultation request! 🎉",
      html: `
        <h2 style="color:#16a34a;">Hi ${lead.name},</h2>
        <p>Thank you for reaching out to <b>Timely Health</b>!</p>
        <p>We've received your request for <b>${lead.lookingFor}</b> and our team will get in touch with you shortly.</p>
        <br/>
        <p style="color:#6b7280;font-size:13px;">If you have any urgent questions, feel free to reply to this email.</p>
        <p>— The Timely Health Team</p>
      `,
    });
    console.log("✅ Lead confirmation sent");
  } catch (err) {
    console.error("⚠️  Lead confirmation email failed:", err.message);
  }
}

// ═══════════════════════════════════════════════════════════════
// POST /api/consultation-leads
// Submit a new free-consultation request (public — no auth required)
// ═══════════════════════════════════════════════════════════════
exports.submitLead = async (req, res) => {
  try {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📥 POST /consultation-leads");
    console.log("📥 Body:", req.body);
    console.log("📥 Origin:", req.headers.origin);

    const { name, businessName, phone, email, businessType, lookingFor } = req.body;

    // Basic presence check (Mongoose will also validate enums / required)
    if (!name || !businessName || !phone || !email || !businessType || !lookingFor) {
      console.log("❌ Missing fields");
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    const lead = await ConsultationLead.create({
      name,
      businessName,
      phone,
      email,
      businessType,
      lookingFor,
    });

    console.log("✅ Lead saved:", lead._id);

    // Fire-and-forget emails — with .catch() so they can NEVER break the response
    sendAdminNotification(lead).catch((e) =>
      console.error("⚠️  Admin email background error:", e.message)
    );
    sendLeadConfirmation(lead).catch((e) =>
      console.error("⚠️  Lead email background error:", e.message)
    );

    return res.status(201).json({
      success: true,
      message: "Your consultation request has been submitted successfully!",
      data: lead,
    });
  } catch (error) {
    console.error("❌ submitLead error name:", error.name);
    console.error("❌ submitLead error message:", error.message);

    // Duplicate email — give a friendly message
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "A request with this email already exists. We'll be in touch soon!",
      });
    }

    // Mongoose validation error
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors)
          .map((e) => e.message)
          .join(", "),
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
    });
  }
};

// ═══════════════════════════════════════════════════════════════
// GET /api/consultation-leads
// Fetch all leads — admin only (add your auth middleware on the route)
// ═══════════════════════════════════════════════════════════════
exports.getAllLeads = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = status ? { status } : {};

    const [leads, total] = await Promise.all([
      ConsultationLead.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      ConsultationLead.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: leads,
    });
  } catch (error) {
    console.error("❌ getAllLeads error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ═══════════════════════════════════════════════════════════════
// PATCH /api/consultation-leads/:id/status
// Update lead status — admin only
// ═══════════════════════════════════════════════════════════════
exports.updateLeadStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["New", "Contacted", "Converted", "Rejected"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value." });
    }

    const lead = await ConsultationLead.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!lead) {
      return res.status(404).json({ success: false, message: "Lead not found." });
    }

    return res.json({ success: true, data: lead });
  } catch (error) {
    console.error("❌ updateLeadStatus error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ═══════════════════════════════════════════════════════════════
// DELETE /api/consultation-leads/:id
// Delete a lead — admin only
// ═══════════════════════════════════════════════════════════════
exports.deleteLead = async (req, res) => {
  try {
    const lead = await ConsultationLead.findByIdAndDelete(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, message: "Lead not found." });
    }
    return res.json({ success: true, message: "Lead deleted successfully." });
  } catch (error) {
    console.error("❌ deleteLead error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};