const Slot = require("../models/Slot");




// 1. Add Slot - Add new slot(s) with date, day and time slots (Single or Bulk)
const addSlot = async (req, res) => {
  try {
    const { slots } = req.body;

    // Check if it's bulk or single
    if (!slots || !Array.isArray(slots) || slots.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide slots array"
      });
    }

    const addedSlots = [];
    const errors = [];

    // Process each slot
    for (const slotData of slots) {
      const { day, date, time_slots } = slotData;

      // Validate required fields
      if (!day || !date || !time_slots || !Array.isArray(time_slots) || time_slots.length === 0) {
        errors.push({
          date,
          message: "Missing required fields: day, date, or time_slots"
        });
        continue;
      }

      try {
        // Check if slot already exists for this date
        const existingSlot = await Slot.findOne({ "slots.date": date });

        if (existingSlot) {
          // Add new slot to existing document
          const updatedSlot = await Slot.findOneAndUpdate(
            { "slots.date": date },
            {
              $push: {
                slots: {
                  day,
                  date,
                  time_slots: time_slots.map(t => ({ 
                    time: t.time, 
                    isBooked: t.isBooked || false 
                  }))
                }
              }
            },
            { new: true }
          );
          addedSlots.push({
            date,
            success: true,
            data: updatedSlot
          });
        } else {
          // Create new slot document
          const newSlot = new Slot({
            slots: [
              {
                day,
                date,
                time_slots: time_slots.map(t => ({ 
                  time: t.time, 
                  isBooked: t.isBooked || false 
                }))
              }
            ]
          });

          await newSlot.save();
          addedSlots.push({
            date,
            success: true,
            data: newSlot
          });
        }
      } catch (err) {
        errors.push({
          date,
          message: err.message
        });
      }
    }

    // Response
    if (addedSlots.length === 0 && errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Failed to add any slots",
        errors
      });
    }

    res.status(201).json({
      success: true,
      message: `${addedSlots.length} slot(s) added successfully`,
      data: {
        added: addedSlots,
        errors: errors.length > 0 ? errors : undefined
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};




// 2. Get All Slots
const getAllSlots = async (req, res) => {
  try {
    const slots = await Slot.find();
    
    res.status(200).json({
      success: true,
      data: slots
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// 3. Update Slot - Update specific time slot
const updateSlot = async (req, res) => {
  try {
    const { slotId, day, date, time_slots } = req.body;

    // Find and update the specific slot
    const updatedSlot = await Slot.findOneAndUpdate(
      { "slots._id": slotId },
      {
        $set: {
          "slots.$.day": day,
          "slots.$.date": date,
          "slots.$.time_slots": time_slots
        }
      },
      { new: true }
    );

    if (!updatedSlot) {
      return res.status(404).json({
        success: false,
        message: "Slot not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Slot updated successfully",
      data: updatedSlot
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// 4. Delete Slot - Delete specific slot
const deleteSlot = async (req, res) => {
  try {
    const { slotId } = req.params;

    // Remove the specific slot from array
    const updatedSlot = await Slot.findOneAndUpdate(
      { "slots._id": slotId },
      {
        $pull: {
          slots: { _id: slotId }
        }
      },
      { new: true }
    );

    if (!updatedSlot) {
      return res.status(404).json({
        success: false,
        message: "Slot not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Slot deleted successfully",
      data: updatedSlot
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  addSlot,
  getAllSlots,
  updateSlot,
  deleteSlot
};