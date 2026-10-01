const express = require("express");
const router = express.Router();
const {
  submitLead,
  getAllLeads,
  updateLeadStatus,
  deleteLead,
} = require("../controller/consultationLead.controller");

// ── Public ──────────────────────────────────────────────────────────────────
// POST /api/consultation-leads
router.post("/", submitLead);

// ── Admin (add auth middleware here when ready, e.g. router.use(verifyToken)) ─
// GET  /api/consultation-leads?status=New&page=1&limit=20
router.get("/", getAllLeads);

// PATCH /api/consultation-leads/:id/status
router.patch("/:id/status", updateLeadStatus);

// DELETE /api/consultation-leads/:id
router.delete("/:id", deleteLead);

module.exports = router;
