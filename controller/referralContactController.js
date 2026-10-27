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
      customerName, customerPhone, customerAddress, customerOrganization,
      doctorName, doctorOrganization, doctorPhone, doctorSpecialization, doctorAddress,
      serviceCommission, serviceCommissionType,
      pharmacyCommission, pharmacyCommissionType,
      labCommission, labCommissionType,
      feesCommission, feesCommissionType,
      consultationFee, onboardDate, referralDate, referralNotes, status,
      discountFees, discountFeesType, discountLab, discountLabType, discountPharmacy, discountPharmacyType,
      services, offers
    } = req.body;

    const totalCommission =
      (parseFloat(serviceCommission) || 0) + (parseFloat(pharmacyCommission) || 0) +
      (parseFloat(labCommission) || 0) + (parseFloat(feesCommission) || 0);

    let normalizedOffers = [];
    if (Array.isArray(offers)) {
      normalizedOffers = offers
        .filter((o) => o && o.offerName && o.offerAmount !== undefined)
        .map((o) => ({
          offerName: String(o.offerName).trim(),
          offerAmount: Number(o.offerAmount) || 0,
          offerUnit: o.offerUnit === '%' ? '%' : '₹',
        }));
    }

    // ✅ Push Discounts into Offers Array
    const df = parseFloat(discountFees) || 0;
    if (df > 0) normalizedOffers.push({ offerName: 'Fees Discount', offerAmount: df, offerUnit: discountFeesType === '₹' ? '₹' : '%' });
    
    const dl = parseFloat(discountLab) || 0;
    if (dl > 0) normalizedOffers.push({ offerName: 'Lab Discount', offerAmount: dl, offerUnit: discountLabType === '₹' ? '₹' : '%' });
    
    const dp = parseFloat(discountPharmacy) || 0;
    if (dp > 0) normalizedOffers.push({ offerName: 'Pharmacy Discount', offerAmount: dp, offerUnit: discountPharmacyType === '₹' ? '₹' : '%' });

    let normalizedServices = [];
    if (Array.isArray(services)) {
      normalizedServices = services.filter((s) => s && s.name).map((s) => ({
        name: String(s.name).trim(), price: Number(s.price) || 0,
      }));
    }

    const normalizedServiceType = serviceCommissionType === '₹' ? '₹' : '%';
    const normalizedPharmacyType = pharmacyCommissionType === '₹' ? '₹' : '%';
    const normalizedLabCommType = labCommissionType === '₹' ? '₹' : '%';
    const normalizedFeesCommType = feesCommissionType === '₹' ? '₹' : '%';

    const finalOnboardDate = onboardDate || referralDate || "";
    const normalizedConsultationFee = parseFloat(consultationFee) || 0;

    const contact = new ReferralContact({
      referralType,
      customerName, customerPhone, customerAddress, customerOrganization: customerOrganization || "",
      doctorName, doctorOrganization, doctorPhone, doctorSpecialization, doctorAddress: doctorAddress || "",
      serviceCommission: parseFloat(serviceCommission) || 0,
      serviceCommissionType: normalizedServiceType,
      pharmacyCommission: parseFloat(pharmacyCommission) || 0,
      pharmacyCommissionType: normalizedPharmacyType,
      labCommission: parseFloat(labCommission) || 0,
      labCommissionType: normalizedLabCommType,
      feesCommission: parseFloat(feesCommission) || 0,
      feesCommissionType: normalizedFeesCommType,
      totalCommission,
      consultationFee: normalizedConsultationFee,
      services: normalizedServices,
      onboardDate: finalOnboardDate,
      referralDate: referralDate || finalOnboardDate,
      referralNotes,
      
      // ✅ Set individual discount fields to 0 since they are now in offers
      discountFees: 0, discountFeesType: '%',
      discountLab: 0, discountLabType: '%',
      discountPharmacy: 0, discountPharmacyType: '%',
      
      offers: normalizedOffers,
      status
    });

    await contact.save();
    res.status(201).json({ success: true, data: contact });
  } catch (error) {
    console.error("addReferralContact error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== UPDATE ====================
const updateReferralContact = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    const existing = await ReferralContact.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Referral contact not found' });
    }

    // Legacy Migration
    if (updateData.clinicCommission !== undefined && updateData.serviceCommission === undefined) {
      updateData.serviceCommission = updateData.clinicCommission;
      delete updateData.clinicCommission;
    }
    if (updateData.clinicCommissionType !== undefined && updateData.serviceCommissionType === undefined) {
      updateData.serviceCommissionType = updateData.clinicCommissionType;
      delete updateData.clinicCommissionType;
    }
    delete updateData.clinicCommission;
    delete updateData.clinicCommissionType;

    if (updateData.serviceCommission !== undefined || updateData.pharmacyCommission !== undefined || updateData.labCommission !== undefined || updateData.feesCommission !== undefined) {
      const service  = parseFloat(updateData.serviceCommission !== undefined ? updateData.serviceCommission : existing.serviceCommission) || 0;
      const pharmacy = parseFloat(updateData.pharmacyCommission !== undefined ? updateData.pharmacyCommission : existing.pharmacyCommission) || 0;
      const lab      = parseFloat(updateData.labCommission !== undefined ? updateData.labCommission : existing.labCommission) || 0;
      const fees     = parseFloat(updateData.feesCommission !== undefined ? updateData.feesCommission : existing.feesCommission) || 0;
      updateData.totalCommission = service + pharmacy + lab + fees;
    }

    if (updateData.serviceCommission !== undefined) updateData.serviceCommission = parseFloat(updateData.serviceCommission) || 0;
    if (updateData.pharmacyCommission !== undefined) updateData.pharmacyCommission = parseFloat(updateData.pharmacyCommission) || 0;
    if (updateData.labCommission !== undefined) updateData.labCommission = parseFloat(updateData.labCommission) || 0;
    if (updateData.feesCommission !== undefined) updateData.feesCommission = parseFloat(updateData.feesCommission) || 0;

    if (updateData.serviceCommissionType !== undefined) updateData.serviceCommissionType = updateData.serviceCommissionType === '₹' ? '₹' : '%';
    if (updateData.pharmacyCommissionType !== undefined) updateData.pharmacyCommissionType = updateData.pharmacyCommissionType === '₹' ? '₹' : '%';
    if (updateData.labCommissionType !== undefined) updateData.labCommissionType = updateData.labCommissionType === '₹' ? '₹' : '%';
    if (updateData.feesCommissionType !== undefined) updateData.feesCommissionType = updateData.feesCommissionType === '₹' ? '₹' : '%';

    if (updateData.consultationFee !== undefined) updateData.consultationFee = parseFloat(updateData.consultationFee) || 0;

    if (updateData.services !== undefined) {
      if (Array.isArray(updateData.services)) {
        updateData.services = updateData.services.filter((s) => s && s.name).map((s) => ({
            name: String(s.name).trim(), price: Number(s.price) || 0,
        }));
      } else {
        updateData.services = [];
      }
    }

    if (updateData.onboardDate !== undefined && updateData.referralDate === undefined) updateData.referralDate = updateData.onboardDate;
    if (updateData.referralDate !== undefined && updateData.onboardDate === undefined) updateData.onboardDate = updateData.referralDate;

    // ✅ Handle Offers Array & Discounts Merger
    let customOffers = [];
    if (updateData.offers && Array.isArray(updateData.offers)) {
       customOffers = updateData.offers.filter(o => !['Fees Discount', 'Lab Discount', 'Pharmacy Discount'].includes(o.offerName));
    } else {
       customOffers = existing.offers ? existing.offers.filter(o => !['Fees Discount', 'Lab Discount', 'Pharmacy Discount'].includes(o.offerName)) : [];
    }

    const df = parseFloat(updateData.discountFees !== undefined ? updateData.discountFees : existing.discountFees) || 0;
    const dft = updateData.discountFeesType !== undefined ? updateData.discountFeesType : existing.discountFeesType;
    if (df > 0) customOffers.push({ offerName: 'Fees Discount', offerAmount: df, offerUnit: dft === '₹' ? '₹' : '%' });

    const dl = parseFloat(updateData.discountLab !== undefined ? updateData.discountLab : existing.discountLab) || 0;
    const dlt = updateData.discountLabType !== undefined ? updateData.discountLabType : existing.discountLabType;
    if (dl > 0) customOffers.push({ offerName: 'Lab Discount', offerAmount: dl, offerUnit: dlt === '₹' ? '₹' : '%' });

    const dp = parseFloat(updateData.discountPharmacy !== undefined ? updateData.discountPharmacy : existing.discountPharmacy) || 0;
    const dpt = updateData.discountPharmacyType !== undefined ? updateData.discountPharmacyType : existing.discountPharmacyType;
    if (dp > 0) customOffers.push({ offerName: 'Pharmacy Discount', offerAmount: dp, offerUnit: dpt === '₹' ? '₹' : '%' });

    updateData.offers = customOffers;
    
    // ✅ Clear individual discount fields
    updateData.discountFees = 0;
    updateData.discountFeesType = '%';
    updateData.discountLab = 0;
    updateData.discountLabType = '%';
    updateData.discountPharmacy = 0;
    updateData.discountPharmacyType = '%';

    const contact = await ReferralContact.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: contact });
  } catch (error) {
    console.error("updateReferralContact error:", error);
    res.status(500).json({ success: false, message: error.message });
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