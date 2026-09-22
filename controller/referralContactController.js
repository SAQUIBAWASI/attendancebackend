// controllers/referralContactController.js
const ReferralContact = require('../models/ReferralContact');

// ==================== GET ALL ====================
const getAllReferralContacts = async (req, res) => {
  try {
    const contacts = await ReferralContact.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: contacts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== GET BY ID ====================
const getReferralContactById = async (req, res) => {
  try {
    const contact = await ReferralContact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Referral contact not found'
      });
    }
    res.status(200).json({
      success: true,
      data: contact
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== ADD ====================
const addReferralContact = async (req, res) => {
  try {
    const {
      referralType,
      customerName,
      customerPhone,
      customerAddress,
      doctorName,
      doctorOrganization,
      doctorPhone,
      doctorSpecialization,
      clinicCommission,
      pharmacyCommission,
      labCommission,
      referralDate,
      referralNotes,
      status
    } = req.body;

    // Auto-calculate total commission
    const totalCommission = (parseFloat(clinicCommission) || 0) + 
                           (parseFloat(pharmacyCommission) || 0) + 
                           (parseFloat(labCommission) || 0);

    const contact = new ReferralContact({
      referralType,
      customerName,
      customerPhone,
      customerAddress,
      doctorName,
      doctorOrganization,
      doctorPhone,
      doctorSpecialization,
      clinicCommission: parseFloat(clinicCommission) || 0,
      pharmacyCommission: parseFloat(pharmacyCommission) || 0,
      labCommission: parseFloat(labCommission) || 0,
      totalCommission,
      referralDate,
      referralNotes,
      status
    });

    await contact.save();
    res.status(201).json({
      success: true,
      data: contact
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== UPDATE ====================
const updateReferralContact = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Auto-calculate total commission if commission fields are updated
    if (updateData.clinicCommission !== undefined || 
        updateData.pharmacyCommission !== undefined || 
        updateData.labCommission !== undefined) {
      const clinic = parseFloat(updateData.clinicCommission) || 0;
      const pharmacy = parseFloat(updateData.pharmacyCommission) || 0;
      const lab = parseFloat(updateData.labCommission) || 0;
      updateData.totalCommission = clinic + pharmacy + lab;
    }

    const contact = await ReferralContact.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Referral contact not found'
      });
    }

    res.status(200).json({
      success: true,
      data: contact
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== DELETE ====================
const deleteReferralContact = async (req, res) => {
  try {
    const contact = await ReferralContact.findByIdAndDelete(req.params.id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Referral contact not found'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Referral contact deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};





const addOffer = async (req, res) => {
  try {
    const { offerName, offerAmount } = req.body;

    if (!offerName || offerAmount === undefined) {
      return res.status(400).json({
        success: false,
        message: "offerName and offerAmount are required"
      });
    }

    const referral = await ReferralContact.findById(req.params.id);
    if (!referral) {
      return res.status(404).json({ success: false, message: "Referral not found" });
    }

    referral.offers.push({
      offerName: String(offerName).trim(),
      offerAmount: Number(offerAmount)
    });

    await referral.save();
    res.json({ success: true, data: referral });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update existing offer
// @route   PUT /api/referralcontacts/updateoffer/:id/:offerId
const updateOffer = async (req, res) => {
  try {
    const { offerName, offerAmount } = req.body;
    const { id, offerId } = req.params;

    const referral = await ReferralContact.findById(id);
    if (!referral) {
      return res.status(404).json({ success: false, message: "Referral not found" });
    }

    const offer = referral.offers.id(offerId);
    if (!offer) {
      return res.status(404).json({ success: false, message: "Offer not found" });
    }

    offer.offerName = String(offerName).trim();
    offer.offerAmount = Number(offerAmount);

    await referral.save();
    res.json({ success: true, data: referral });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete offer
// @route   DELETE /api/referralcontacts/deleteoffer/:id/:offerId
const deleteOffer = async (req, res) => {
  try {
    const { id, offerId } = req.params;

    const referral = await ReferralContact.findById(id);
    if (!referral) {
      return res.status(404).json({ success: false, message: "Referral not found" });
    }

    const offer = referral.offers.id(offerId);
    if (!offer) {
      return res.status(404).json({ success: false, message: "Offer not found" });
    }

    offer.deleteOne();
    await referral.save();

    res.json({ success: true, data: referral });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


module.exports = {
  getAllReferralContacts,
  getReferralContactById,
  addReferralContact,
  updateReferralContact,
  deleteReferralContact,
  addOffer,
  updateOffer,
  deleteOffer
};