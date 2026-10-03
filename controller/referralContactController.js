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
      // Customer
      customerName,
      customerPhone,
      customerAddress,
      customerOrganization,        // ✅ NEW
      // Doctor
      doctorName,
      doctorOrganization,
      doctorPhone,
      doctorSpecialization,
      doctorAddress,               // ✅ NEW
      // Commission
      clinicCommission,
      pharmacyCommission,
      labCommission,
      // Dates & notes
      onboardDate,                 // ✅ NEW
      referralDate,                // fallback (purana)
      referralNotes,
      status,
      // Discounts (Special Offers)
      discountFees,                // ✅ NEW
      discountFeesType,            // ✅ NEW
      discountLab,                 // ✅ NEW
      discountLabType,             // ✅ NEW
      // Offers array (legacy)
      offers
    } = req.body;

    // Auto-calculate total commission
    const totalCommission =
      (parseFloat(clinicCommission) || 0) +
      (parseFloat(pharmacyCommission) || 0) +
      (parseFloat(labCommission) || 0);

    // Normalize offers
    let normalizedOffers = [];
    if (Array.isArray(offers)) {
      normalizedOffers = offers
        .filter((o) => o && o.offerName && o.offerAmount !== undefined)
        .map((o) => ({
          offerName: String(o.offerName).trim(),
          offerAmount: Number(o.offerAmount) || 0,
        }));
    }

    // Normalize discount types
    const normalizedFeesType = discountFeesType === '₹' ? '₹' : '%';
    const normalizedLabType = discountLabType === '₹' ? '₹' : '%';

    // onboardDate fallback to referralDate (backward compat)
    const finalOnboardDate = onboardDate || referralDate || "";

    const contact = new ReferralContact({
      referralType,

      // Customer
      customerName,
      customerPhone,
      customerAddress,
      customerOrganization: customerOrganization || "",

      // Doctor
      doctorName,
      doctorOrganization,
      doctorPhone,
      doctorSpecialization,
      doctorAddress: doctorAddress || "",

      // Commission
      clinicCommission: parseFloat(clinicCommission) || 0,
      pharmacyCommission: parseFloat(pharmacyCommission) || 0,
      labCommission: parseFloat(labCommission) || 0,
      totalCommission,

      // Dates
      onboardDate: finalOnboardDate,
      referralDate: referralDate || finalOnboardDate, // keep old field synced
      referralNotes,

      // Discounts
      discountFees: parseFloat(discountFees) || 0,
      discountFeesType: normalizedFeesType,
      discountLab: parseFloat(discountLab) || 0,
      discountLabType: normalizedLabType,

      // Offers
      offers: normalizedOffers,

      status
    });

    await contact.save();

    res.status(201).json({
      success: true,
      data: contact,
    });
  } catch (error) {
    console.error("addReferralContact error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// ==================== UPDATE ====================
const updateReferralContact = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // 🔹 Auto-calculate total commission
    if (
      updateData.clinicCommission !== undefined ||
      updateData.pharmacyCommission !== undefined ||
      updateData.labCommission !== undefined
    ) {
      const clinic = parseFloat(updateData.clinicCommission) || 0;
      const pharmacy = parseFloat(updateData.pharmacyCommission) || 0;
      const lab = parseFloat(updateData.labCommission) || 0;
      updateData.totalCommission = clinic + pharmacy + lab;
    }

    // 🔹 Normalize discount types
    if (updateData.discountFeesType !== undefined) {
      updateData.discountFeesType = updateData.discountFeesType === '₹' ? '₹' : '%';
    }
    if (updateData.discountLabType !== undefined) {
      updateData.discountLabType = updateData.discountLabType === '₹' ? '₹' : '%';
    }

    // 🔹 Normalize discount numbers
    if (updateData.discountFees !== undefined) {
      updateData.discountFees = parseFloat(updateData.discountFees) || 0;
    }
    if (updateData.discountLab !== undefined) {
      updateData.discountLab = parseFloat(updateData.discountLab) || 0;
    }

    // 🔹 onboardDate / referralDate sync
    // Agar frontend sirf onboardDate bhej raha hai to referralDate bhi sync karo (backward compat)
    if (updateData.onboardDate !== undefined && updateData.referralDate === undefined) {
      updateData.referralDate = updateData.onboardDate;
    }
    // Agar sirf referralDate bhej raha hai to onboardDate bhi set kar do
    if (updateData.referralDate !== undefined && updateData.onboardDate === undefined) {
      updateData.onboardDate = updateData.referralDate;
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
    console.error("updateReferralContact error:", error);
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