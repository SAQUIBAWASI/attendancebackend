const VisitTarget = require("../models/VisitTarget");

// Assign or update a target for an employee for a given month
exports.setTarget = async (req, res) => {
  try {
    const { employeeId, employeeName, month, target } = req.body;

    if (!employeeId || !month || !target) {
      return res.status(400).json({
        success: false,
        message: "employeeId, month, and target are required.",
      });
    }

    // Upsert: if target for this employee+month exists, update it; otherwise create
    const result = await VisitTarget.findOneAndUpdate(
      { employeeId, month },
      { employeeId, employeeName: employeeName || "", month, target },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.json({
      success: true,
      message: "Target assigned successfully.",
      data: result,
    });
  } catch (err) {
    console.error("setTarget error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// Get all targets (Admin view)
exports.getAllTargets = async (req, res) => {
  try {
    const { month } = req.query;
    const filter = month ? { month } : {};
    const targets = await VisitTarget.find(filter).sort({ month: -1, employeeId: 1 });
    return res.json({ success: true, data: targets });
  } catch (err) {
    console.error("getAllTargets error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// Get target for a specific employee for a given month
exports.getEmployeeTarget = async (req, res) => {
  try {
    const { employeeId, month } = req.query;
    if (!employeeId || !month) {
      return res.status(400).json({ success: false, message: "employeeId and month required." });
    }
    const target = await VisitTarget.findOne({ employeeId, month });
    return res.json({ success: true, data: target || null });
  } catch (err) {
    console.error("getEmployeeTarget error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// Delete a target
exports.deleteTarget = async (req, res) => {
  try {
    const { id } = req.params;
    await VisitTarget.findByIdAndDelete(id);
    return res.json({ success: true, message: "Target deleted." });
  } catch (err) {
    console.error("deleteTarget error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};