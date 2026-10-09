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
      customerOrganization,
      // Doctor
      doctorName,
      doctorOrganization,
      doctorPhone,
      doctorSpecialization,
      doctorAddress,
      // Commission
      serviceCommission,            // ✅ renamed from clinicCommission
      serviceCommissionType,        // ✅ renamed from clinicCommissionType
      pharmacyCommission,
      pharmacyCommissionType,
      labCommission,
      labCommissionType,
      feesCommission,
      feesCommissionType,
      // Consultation Fee (₹)
      consultationFee,
      // Dates & notes
      onboardDate,
      referralDate,
      referralNotes,
      status,
      // Discounts (Special Offers)
      discountFees,
      discountFeesType,
      discountLab,
      discountLabType,
      // Services
      services,
      // Offers array (legacy)
      offers
    } = req.body;

    // Auto-calculate total commission
    const totalCommission =
      (parseFloat(serviceCommission) || 0) +   // ✅ renamed
      (parseFloat(pharmacyCommission) || 0) +
      (parseFloat(labCommission) || 0) +
      (parseFloat(feesCommission) || 0);

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

    // Normalize services
    let normalizedServices = [];
    if (Array.isArray(services)) {
      normalizedServices = services
        .filter((s) => s && s.name)
        .map((s) => ({
          name: String(s.name).trim(),
          price: Number(s.price) || 0,
        }));
    }

    // Normalize discount types
    const normalizedFeesType = discountFeesType === '₹' ? '₹' : '%';
    const normalizedLabType = discountLabType === '₹' ? '₹' : '%';

    // Normalize commission types
    const normalizedServiceType = serviceCommissionType === '₹' ? '₹' : '%';  // ✅ renamed
    const normalizedPharmacyType = pharmacyCommissionType === '₹' ? '₹' : '%';
    const normalizedLabCommType = labCommissionType === '₹' ? '₹' : '%';
    const normalizedFeesCommType = feesCommissionType === '₹' ? '₹' : '%';

    const finalOnboardDate = onboardDate || referralDate || "";
    const normalizedConsultationFee = parseFloat(consultationFee) || 0;

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
      serviceCommission: parseFloat(serviceCommission) || 0,     // ✅ renamed
      serviceCommissionType: normalizedServiceType,              // ✅ renamed
      pharmacyCommission: parseFloat(pharmacyCommission) || 0,
      pharmacyCommissionType: normalizedPharmacyType,
      labCommission: parseFloat(labCommission) || 0,
      labCommissionType: normalizedLabCommType,
      feesCommission: parseFloat(feesCommission) || 0,
      feesCommissionType: normalizedFeesCommType,
      totalCommission,

      // Consultation Fee
      consultationFee: normalizedConsultationFee,

      // Services
      services: normalizedServices,

      // Dates
      onboardDate: finalOnboardDate,
      referralDate: referralDate || finalOnboardDate,
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
      updateData.serviceCommission !== undefined ||    // ✅ renamed
      updateData.pharmacyCommission !== undefined ||
      updateData.labCommission !== undefined ||
      updateData.feesCommission !== undefined
    ) {
      const service  = parseFloat(updateData.serviceCommission) || 0;   // ✅ renamed
      const pharmacy = parseFloat(updateData.pharmacyCommission) || 0;
      const lab      = parseFloat(updateData.labCommission) || 0;
      const fees     = parseFloat(updateData.feesCommission) || 0;
      updateData.totalCommission = service + pharmacy + lab + fees;
    }

    // 🔹 Normalize commission values
    if (updateData.serviceCommission !== undefined) {       // ✅ renamed
      updateData.serviceCommission = parseFloat(updateData.serviceCommission) || 0;
    }
    if (updateData.pharmacyCommission !== undefined) {
      updateData.pharmacyCommission = parseFloat(updateData.pharmacyCommission) || 0;
    }
    if (updateData.labCommission !== undefined) {
      updateData.labCommission = parseFloat(updateData.labCommission) || 0;
    }
    if (updateData.feesCommission !== undefined) {
      updateData.feesCommission = parseFloat(updateData.feesCommission) || 0;
    }

    // 🔹 Normalize commission types
    if (updateData.serviceCommissionType !== undefined) {   // ✅ renamed
      updateData.serviceCommissionType = updateData.serviceCommissionType === '₹' ? '₹' : '%';
    }
    if (updateData.pharmacyCommissionType !== undefined) {
      updateData.pharmacyCommissionType = updateData.pharmacyCommissionType === '₹' ? '₹' : '%';
    }
    if (updateData.labCommissionType !== undefined) {
      updateData.labCommissionType = updateData.labCommissionType === '₹' ? '₹' : '%';
    }
    if (updateData.feesCommissionType !== undefined) {
      updateData.feesCommissionType = updateData.feesCommissionType === '₹' ? '₹' : '%';
    }

    // ✅ Normalize consultationFee
    if (updateData.consultationFee !== undefined) {
      updateData.consultationFee = parseFloat(updateData.consultationFee) || 0;
    }

    // ✅ Normalize services
    if (updateData.services !== undefined) {
      if (Array.isArray(updateData.services)) {
        updateData.services = updateData.services
          .filter((s) => s && s.name)
          .map((s) => ({
            name: String(s.name).trim(),
            price: Number(s.price) || 0,
          }));
      } else {
        updateData.services = [];
      }
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
    if (updateData.onboardDate !== undefined && updateData.referralDate === undefined) {
      updateData.referralDate = updateData.onboardDate;
    }
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