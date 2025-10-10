// controllers/shift.controller.js

const Shift = require('../models/Shift');

const addShift = async (req, res) => {
  try {
    const { name, startTime, endTime, days } = req.body;

    if (!name || !startTime || !endTime || !Array.isArray(days) || days.length === 0) {
      return res.status(400).json({ error: 'All fields are required and days must be an array' });
    }

    const newShift = new Shift({ name, startTime, endTime, days });
    const savedShift = await newShift.save();

    res.status(201).json({ message: 'Shift added', data: savedShift });
  } catch (error) {
    console.error('Error in addShift:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getShifts = async (req, res) => {
  try {
    const shifts = await Shift.find();
    res.status(200).json({ message: 'Shifts fetched', data: shifts });
  } catch (error) {
    console.error('Error in getShifts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ✅ Export functions
module.exports = {
  addShift,
  getShifts,
};
