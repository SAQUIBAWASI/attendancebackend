const express = require('express');
const router = express.Router();
const {
  registerPartner,
  getAllPartners,
  getPartnerById,
  getPartnerByReferralCode,
  updatePartnerStatus,
  deletePartner
} = require('../controller/partnerController');

// Public route - Register partner
router.post('/register', registerPartner);

// Admin routes
router.get('/allpartners', getAllPartners);
router.get('/referral/:referralCode', getPartnerByReferralCode);
router.get('/:id', getPartnerById);
router.put('/updatestatus/:id', updatePartnerStatus);
router.delete('/deletepartner/:id', deletePartner);

module.exports = router;