const AttendanceSummary = require("../models/AttendanceSummary");

/**
 * 📌 Save Attendance Summary
 */
exports.saveSummary = async (req, res) => {
  try {
    const { summaries, fromDate, toDate, month } = req.body;

    if (!summaries || !Array.isArray(summaries)) {
      return res.status(400).json({ message: "Invalid summary data" });
    }

    // Remove old data for same month (optional)
    if (month) {
      await AttendanceSummary.deleteMany({ month });
    }

    const insertData = summaries.map((s) => ({
      ...s,
      fromDate,
      toDate,
      month,
    }));

    await AttendanceSummary.insertMany(insertData);

    res.json({
      message: "Summary saved successfully",
      count: insertData.length,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * 📌 Get Summary for Payroll
 */
exports.getSummary = async (req, res) => {
  try {
    const { month } = req.query;

    const filter = month ? { month } : {};

    const data = await AttendanceSummary.find(filter);

    res.json({
      count: data.length,
      summary: data,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
