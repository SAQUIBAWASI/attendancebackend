// const Shift = require("../models/Shift");

// // ✅ Assign new shift
// exports.assignShift = async (req, res) => {
//   try {
//     const { employeeId, employeeName, shiftType, startTime, endTime } = req.body;

//     if (!employeeId || !employeeName || !shiftType || !startTime || !endTime) {
//       return res.status(400).json({ message: "All fields are required" });
//     }

//     const newShift = new Shift({
//       employeeId,
//       employeeName,
//       shiftType,
//       startTime,
//       endTime,
//     });

//     await newShift.save();
//     res.status(201).json({ message: "Shift assigned successfully", shift: newShift });
//   } catch (error) {
//     console.error("Error assigning shift:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // ✅ Get all shifts
// exports.getAllShifts = async (req, res) => {
//   try {
//     const shifts = await Shift.find().sort({ createdAt: -1 });
//     res.status(200).json(shifts);
//   } catch (error) {
//     console.error("Error fetching shifts:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // ✅ Get shift by ID
// exports.getShiftById = async (req, res) => {
//   try {
//     const shift = await Shift.findById(req.params.id);
//     if (!shift) return res.status(404).json({ message: "Shift not found" });
//     res.status(200).json(shift);
//   } catch (error) {
//     console.error("Error fetching shift:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // ✅ Update shift
// exports.updateShift = async (req, res) => {
//   try {
//     const updatedShift = await Shift.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//       runValidators: true,
//     });
//     if (!updatedShift) return res.status(404).json({ message: "Shift not found" });
//     res.status(200).json({ message: "Shift updated successfully", shift: updatedShift });
//   } catch (error) {
//     console.error("Error updating shift:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // ✅ Delete shift
// exports.deleteShift = async (req, res) => {
//   try {
//     const deleted = await Shift.findByIdAndDelete(req.params.id);
//     if (!deleted) return res.status(404).json({ message: "Shift not found" });
//     res.status(200).json({ message: "Shift deleted successfully" });
//   } catch (error) {
//     console.error("Error deleting shift:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };


const Shift = require("../models/Shift");

// ✅ Assign new shift (YEH PEHLE SE HAI)
exports.assignShift = async (req, res) => {
  try {
    const { employeeId, employeeName, shiftType, startTime, endTime } = req.body;

    if (!employeeId || !employeeName || !shiftType || !startTime || !endTime) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // ✅ NEW: Shift type validation (frontend se aayega)
    if (!/^[A-Z]$/.test(shiftType)) {
      return res.status(400).json({ 
        message: "Shift type should be a single letter from A to Z" 
      });
    }

    const newShift = new Shift({
      employeeId,
      employeeName,
      shiftType: shiftType.toUpperCase(), // ✅ Uppercase kardo
      startTime,
      endTime,
    });

    await newShift.save();
    res.status(201).json({ 
      message: "Shift assigned successfully", 
      shift: newShift 
    });
  } catch (error) {
    console.error("Error assigning shift:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get all shifts (YEH PEHLE SE HAI)
exports.getAllShifts = async (req, res) => {
  try {
    const shifts = await Shift.find().sort({ createdAt: -1 });
    res.status(200).json(shifts);
  } catch (error) {
    console.error("Error fetching shifts:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get shift by ID (YEH PEHLE SE HAI)
exports.getShiftById = async (req, res) => {
  try {
    const shift = await Shift.findById(req.params.id);
    if (!shift) return res.status(404).json({ message: "Shift not found" });
    res.status(200).json(shift);
  } catch (error) {
    console.error("Error fetching shift:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Update shift (YEH PEHLE SE HAI)
exports.updateShift = async (req, res) => {
  try {
    const updatedShift = await Shift.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      {
        new: true,
        runValidators: true,
      }
    );
    if (!updatedShift) return res.status(404).json({ message: "Shift not found" });
    res.status(200).json({ 
      message: "Shift updated successfully", 
      shift: updatedShift 
    });
  } catch (error) {
    console.error("Error updating shift:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Delete shift (YEH PEHLE SE HAI)
exports.deleteShift = async (req, res) => {
  try {
    const deleted = await Shift.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Shift not found" });
    res.status(200).json({ message: "Shift deleted successfully" });
  } catch (error) {
    console.error("Error deleting shift:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ NEW: Get all unique shift types for dropdown
exports.getAllShiftTypes = async (req, res) => {
  try {
    // Database se unique shift types get karo
    const shiftTypes = await Shift.distinct("shiftType");
    res.status(200).json(shiftTypes);
  } catch (error) {
    console.error("Error fetching shift types:", error);
    res.status(500).json({ message: "Server error" });
  }
};