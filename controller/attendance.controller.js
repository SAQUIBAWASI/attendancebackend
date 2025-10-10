const Attendance = require("../models/Attendance");

const markAttendance = async (req, res) => {
  try {
    const { employeeId, date, status } = req.body;

    // ✅ Validation
    if (!employeeId || !date) {
      return res.status(400).json({
        error: "Employee ID and date are required",
      });
    }

    // ✅ Create attendance record
    const attendance = new Attendance({
      employeeId,
      date,
      status: status || "Present", // default status
    });

    await attendance.save();

    res.status(201).json({
      message: "Attendance marked successfully",
      attendance,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { markAttendance };
