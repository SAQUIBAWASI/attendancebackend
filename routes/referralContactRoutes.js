// routes/referralContactRoutes.js
const express = require('express');
const router = express.Router();
const {
  getAllReferralContacts,
  addReferralContact,
  updateReferralContact,
  deleteReferralContact,
  updateOffer,
  addOffer,
  deleteOffer
} = require('../controller/referralContactController');

// GET all referral contacts
router.get('/getallreferralcontacts', getAllReferralContacts);

// POST add referral contact
router.post('/addreferralcontact', addReferralContact);

// PUT update referral contact
router.put('/updatereferralcontact/:id', updateReferralContact);

// DELETE referral contact
router.delete('/deletereferralcontact/:id', deleteReferralContact);


// ✅ OFFER ROUTES
router.post("/addoffer/:id", addOffer);
router.put("/updateoffer/:id/:offerId", updateOffer);
router.delete("/deleteoffer/:id/:offerId", deleteOffer);


module.exports = router;