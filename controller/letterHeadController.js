const LetterHead = require('../models/LetterHead');
const fs = require('fs');
const path = require('path');

// 1. ADD LETTERHEAD
const addLetterHead = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a letterhead image'
      });
    }

    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    const letterheadUrl = `${baseUrl}/uploads/letterheads/${req.file.filename}`;
    
    const { name, isDefault } = req.body;

    if (isDefault === 'true' || isDefault === true) {
      await LetterHead.updateMany({}, { isDefault: false });
    }

    const letterHead = await LetterHead.create({
      name: name || 'Letterhead',
      letterheadUrl,
      isDefault: isDefault === 'true' || isDefault === true
    });

    res.status(201).json({
      success: true,
      message: 'Letterhead saved successfully',
      data: letterHead
    });

  } catch (error) {
    if (req.file) {
      const filePath = path.join(__dirname, '../uploads/letterheads', req.file.filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to save letterhead'
    });
  }
};

// 2. GET ALL LETTERHEADS
const getAllLetterHeads = async (req, res) => {
  try {
    const letterHeads = await LetterHead.find()
      .sort({ isDefault: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: letterHeads.length,
      data: letterHeads
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch letterheads'
    });
  }
};

// 3. UPDATE LETTERHEAD
const updateLetterHead = async (req, res) => {
  try {
    const letterHead = await LetterHead.findById(req.params.id);
    if (!letterHead) {
      return res.status(404).json({
        success: false,
        message: 'Letterhead not found'
      });
    }

    const { name, isDefault } = req.body;

    if (name) letterHead.name = name;

    if (isDefault === 'true' || isDefault === true) {
      await LetterHead.updateMany(
        { _id: { $ne: req.params.id } },
        { isDefault: false }
      );
      letterHead.isDefault = true;
    } else if (isDefault === 'false' || isDefault === false) {
      letterHead.isDefault = false;
    }

    if (req.file) {
      // Delete old file
      const oldFilePath = path.join(__dirname, '../uploads/letterheads', path.basename(letterHead.letterheadUrl));
      if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);

      const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
      letterHead.letterheadUrl = `${baseUrl}/uploads/letterheads/${req.file.filename}`;
    }

    await letterHead.save();

    res.status(200).json({
      success: true,
      message: 'Letterhead updated successfully',
      data: letterHead
    });

  } catch (error) {
    if (req.file) {
      const filePath = path.join(__dirname, '../uploads/letterheads', req.file.filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update letterhead'
    });
  }
};

// 4. DELETE LETTERHEAD
const deleteLetterHead = async (req, res) => {
  try {
    const letterHead = await LetterHead.findById(req.params.id);
    if (!letterHead) {
      return res.status(404).json({
        success: false,
        message: 'Letterhead not found'
      });
    }

    const filePath = path.join(__dirname, '../uploads/letterheads', path.basename(letterHead.letterheadUrl));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await letterHead.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Letterhead deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete letterhead'
    });
  }
};

module.exports = {
  addLetterHead,
  getAllLetterHeads,
  updateLetterHead,
  deleteLetterHead
};