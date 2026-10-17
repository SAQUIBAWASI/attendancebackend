// ═══════════════════════════════════════════════════════════════════════
// NEW: Revenue Target Controller
// File: controllers/revenueTargetController.js
// ═══════════════════════════════════════════════════════════════════════
const RevenueTarget = require("../models/RevenueTarget");

/* ============================================================ */
/* Helper: Status nikaalo                                       */
/* ============================================================ */
const getStatusFromAmounts = (achieved, target) => {
  const a = Number(achieved) || 0;
  const t = Number(target) || 0;
  const diff = a - t;

  if (t === 0) return { status: "PENDING", diff };
  if (Math.abs(diff) < 0.5) return { status: "ACHIEVED", diff: 0 };
  if (diff > 0) return { status: "EXCEEDED", diff };
  return { status: "SHORTFALL", diff };
};

/* ============================================================ */
/* GET /api/appointment-slots/revenue-target?month=10&year=2026 */
/* ============================================================ */
exports.getRevenueTarget = async (req, res) => {
  try {
    const { month, year } = req.query;

    // ✅ Agar month/year dono nahi hain → SAARE targets return karo
    if (!month && !year) {
      const targets = await RevenueTarget.find({}).sort({ year: -1, month: -1 });
      return res.status(200).json({
        success: true,
        targets,
        count: targets.length,
      });
    }

    // ✅ Agar sirf ek missing hai → 400 (partial query invalid)
    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: "Provide both month and year, or neither (to get all)",
      });
    }

    const monthNum = Number(month);
    const yearNum = Number(year);

    if (monthNum < 1 || monthNum > 12) {
      return res.status(400).json({
        success: false,
        message: "month must be between 1 and 12",
      });
    }

    const target = await RevenueTarget.findOne({
      month: monthNum,
      year: yearNum,
    });

    if (!target) {
      return res.status(200).json({
        success: true,
        target: null,
        message: "No target set for this month",
      });
    }

    return res.status(200).json({
      success: true,
      target,
    });
  } catch (error) {
    console.error("❌ getRevenueTarget error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch revenue target",
      error: error.message,
    });
  }
};

/* ============================================================ */
/* POST /api/appointment-slots/save-revenue-target               */
/* Sirf month, year, amount lo — achieved abhi nahi             */
/* ============================================================ */
exports.saveRevenueTarget = async (req, res) => {
  try {
    const { month, year, amount, category, footFall } = req.body; // ✅ footFall add kiya

    if (!month || !year || amount === undefined || amount === null) {
      return res.status(400).json({
        success: false,
        message: "month, year, and amount are required",
      });
    }

    const monthNum = Number(month);
    const yearNum = Number(year);
    const amountNum = Number(amount);
    const footFallNum = Number(footFall) || 0; // ✅ footFall parse kiya

    if (monthNum < 1 || monthNum > 12) {
      return res.status(400).json({ success: false, message: "month must be between 1 and 12" });
    }
    if (isNaN(amountNum) || amountNum < 0) {
      return res.status(400).json({ success: false, message: "amount must be a non-negative number" });
    }
    if (isNaN(footFallNum) || footFallNum < 0) {
      return res.status(400).json({ success: false, message: "footFall must be a non-negative number" });
    }

    const VALID_CATEGORIES = ["clinic", "lab", "clinicPharmacy", "retailPharmacy"];
    const categoryKey = category && VALID_CATEGORIES.includes(category) ? category : "clinic";

    const target = await RevenueTarget.findOneAndUpdate(
      { month: monthNum, year: yearNum, category: categoryKey },
      {
        month: monthNum,
        year: yearNum,
        category: categoryKey,
        amount: amountNum,
        footFall: footFallNum, // ✅ Save footFall
        savedAt: new Date(),
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Revenue target saved successfully",
      target,
    });
  } catch (error) {
    console.error("❌ saveRevenueTarget error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save revenue target",
      error: error.message,
    });
  }
};



/* ============================================================ */
/* PUT /api/appointment-slots/update-revenue-target/:id          */
/* Full update — amount + achieved dono (ya sirf ek bhi)         */
/* ============================================================ */
exports.updateRevenueTarget = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, achieved, status, footFall } = req.body; // ✅ footFall add kiya

    const existing = await RevenueTarget.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Revenue target not found" });
    }

    const newAmount = amount !== undefined ? Number(amount) : existing.amount;
    const newAchieved = achieved !== undefined ? Number(achieved) : existing.achieved;
    const newFootFall = footFall !== undefined ? Number(footFall) : existing.footFall; // ✅ Handle footFall

    let finalStatus = status;
    let finalDiff = existing.diff;

    if (!status) {
      const calc = getStatusFromAmounts(newAchieved, newAmount);
      finalStatus = calc.status;
      finalDiff = calc.diff;
    } else {
      finalDiff = newAchieved - newAmount;
    }

    const updated = await RevenueTarget.findByIdAndUpdate(
      id,
      {
        amount: newAmount,
        footFall: newFootFall, // ✅ Update footFall
        achieved: newAchieved,
        status: finalStatus,
        diff: finalDiff,
        savedAt: new Date(),
      },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Revenue target updated successfully",
      target: updated,
    });
  } catch (error) {
    console.error("❌ updateRevenueTarget error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update revenue target",
      error: error.message,
    });
  }
};
/* ============================================================ */
/* PATCH /api/appointment-slots/update-target-achieved           */
/* Future me achieved + status update karne ke liye             */
/* Body: { month, year, achieved }                              */
/* ============================================================ */
exports.updateAchievedByMonth = async (req, res) => {
  try {
    const { month, year, achieved } = req.body;

    if (!month || !year || achieved === undefined) {
      return res.status(400).json({
        success: false,
        message: "month, year, and achieved are required",
      });
    }

    const monthNum = Number(month);
    const yearNum = Number(year);
    const achievedNum = Number(achieved) || 0;

    const existing = await RevenueTarget.findOne({ month: monthNum, year: yearNum });
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Revenue target not found for this month/year",
      });
    }

    const { status, diff } = getStatusFromAmounts(achievedNum, existing.amount);

    existing.achieved = achievedNum;
    existing.status = status;
    existing.diff = diff;
    existing.savedAt = new Date();
    await existing.save();

    return res.status(200).json({
      success: true,
      message: "Achieved value updated successfully",
      target: existing,
    });
  } catch (error) {
    console.error("❌ updateAchievedByMonth error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update achieved value",
      error: error.message,
    });
  }
};

/* ============================================================ */
/* GET /api/appointment-slots/all-revenue-targets                */
/* ============================================================ */
exports.getAllRevenueTargets = async (req, res) => {
  try {
    const aggregated = await RevenueTarget.aggregate([
      {
        $group: {
          _id: { month: "$month", year: "$year" },
          amount: { $sum: "$amount" },
          achieved: { $sum: { $ifNull: ["$achieved", 0] } },
          lastSavedAt: { $max: "$savedAt" },
          firstId: { $first: "$_id" },
        },
      },
      {
        $project: {
          _id: "$firstId",
          month: "$_id.month",
          year: "$_id.year",
          amount: 1,
          achieved: 1,
          savedAt: "$lastSavedAt",
        },
      },
      { $sort: { year: -1, month: -1 } },
    ]);

    return res.status(200).json({
      success: true,
      targets: aggregated,
      count: aggregated.length,
    });
  } catch (error) {
    console.error("❌ getAllRevenueTargets error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch revenue targets",
      error: error.message,
    });
  }
};

/* ============================================================ */
/* DELETE /api/appointment-slots/revenue-target/:id              */
/* ============================================================ */
exports.deleteRevenueTarget = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await RevenueTarget.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Revenue target not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Revenue target deleted successfully",
    });
  } catch (error) {
    console.error("❌ deleteRevenueTarget error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete revenue target",
      error: error.message,
    });
  }
};