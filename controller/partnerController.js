const Partner = require('../models/Partner');

// Register new partner
exports.registerPartner = async (req, res) => {
  try {
    const { fullName, email, phone, organization, partnerType, city, message } = req.body;

    // Simple validation
    if (!fullName || !email || !phone || !organization || !partnerType || !city || !message) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Generate referral code (TIMELYPA001, TIMELYPA002, ...)
    const generateReferralCode = async () => {
      // Get the last partner to find the latest code
      const lastPartner = await Partner.findOne().sort({ createdAt: -1 });
      
      let nextNumber = 1;
      
      if (lastPartner && lastPartner.referralCode) {
        // Extract number from last referral code
        const lastCode = lastPartner.referralCode; // e.g., TIMELYPA005
        const lastNumber = parseInt(lastCode.replace('TIMELYPA', ''));
        if (!isNaN(lastNumber)) {
          nextNumber = lastNumber + 1;
        }
      }
      
      // Format number with leading zeros (001, 002, 003, ...)
      const paddedNumber = String(nextNumber).padStart(3, '0');
      return `TIMELYPA${paddedNumber}`;
    };

    const referralCode = await generateReferralCode();

    // Create partner
    const partner = new Partner({
      fullName,
      email,
      phone,
      organization,
      partnerType,
      city,
      message,
      referralCode: referralCode
    });

    await partner.save();

    res.status(201).json({
      success: true,
      message: 'Partner application submitted successfully!',
      data: {
        id: partner._id,
        fullName: partner.fullName,
        email: partner.email,
        referralCode: partner.referralCode,
        status: partner.status,
        createdAt: partner.createdAt
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register partner',
      error: error.message
    });
  }
};
// Get all partners
exports.getAllPartners = async (req, res) => {
  try {
    const partners = await Partner.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: partners
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch partners'
    });
  }
};

// Get partner by ID
exports.getPartnerById = async (req, res) => {
  try {
    const partner = await Partner.findById(req.params.id);
    
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    res.status(200).json({
      success: true,
      data: partner
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch partner'
    });
  }
};

// Get partner by referral code
exports.getPartnerByReferralCode = async (req, res) => {
  try {
    const { referralCode } = req.params;
    const partner = await Partner.findOne({ referralCode });
    
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found with this referral code'
      });
    }

    res.status(200).json({
      success: true,
      data: partner
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch partner'
    });
  }
};

// Update partner status
exports.updatePartnerStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const partner = await Partner.findById(req.params.id);
    
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    partner.status = status;
    await partner.save();

    res.status(200).json({
      success: true,
      message: 'Status updated successfully',
      data: partner
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update status'
    });
  }
};

// Delete partner
exports.deletePartner = async (req, res) => {
  try {
    const partner = await Partner.findById(req.params.id);
    
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    await partner.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Partner deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete partner'
    });
  }
};