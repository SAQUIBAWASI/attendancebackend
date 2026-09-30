// controllers/timelyPlanController.js
const TimelyPlan = require("../models/TimelyPlan");

/* ══════════════════════════════════════════════
   1️⃣ CREATE PLAN
   POST /api/timely-plans/add
   ══════════════════════════════════════════════ */
exports.createTimelyPlan = async (req, res) => {
  try {
    const {
      planName,
      description,
      products,
      price,
      discount,
      validity,
      validityUnit,
      status,
    } = req.body;

    if (!planName || price === undefined || !validity) {
      return res.status(400).json({
        success: false,
        message: "Plan name, price and validity are required",
      });
    }

    const existing = await TimelyPlan.findOne({
      planName: planName.trim(),
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "A plan with this name already exists",
      });
    }

    // ✅ Products validation — array of { productName, features }
    const sanitizedProducts = Array.isArray(products)
      ? products
          .filter((p) => p && p.productName && p.productName.trim())
          .map((p) => ({
            productName: p.productName.trim(),
            features: Array.isArray(p.features)
              ? p.features.filter((f) => f && f.trim())
              : [],
          }))
      : [];

    const plan = await TimelyPlan.create({
      planName: planName.trim(),
      description: (description || "").trim(),
      products: sanitizedProducts,
      price: Number(price),
      discount: Number(discount) || 0,
      validity: Number(validity),
      validityUnit: validityUnit || "days",
      status: status || "active",
    });

    return res.status(201).json({
      success: true,
      message: "Plan created successfully",
      data: plan,
    });
  } catch (error) {
    console.error("createTimelyPlan Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create plan",
    });
  }
};

/* ══════════════════════════════════════════════
   2️⃣ GET ALL PLANS
   GET /api/timely-plans/all
   ══════════════════════════════════════════════ */
exports.getAllTimelyPlans = async (req, res) => {
  try {
    const { search, status } = req.query;

    let filter = {};

    if (status && status !== "all") {
      filter.status = status;
    }

    if (search && search.trim()) {
      const q = search.trim();
      filter.$or = [
        { planName: { $regex: q, $options: "i" } },
        { products: { $regex: q, $options: "i" } },
        { features: { $regex: q, $options: "i" } },
      ];
    }

    const plans = await TimelyPlan.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Plans fetched successfully",
      count: plans.length,
      data: plans,
    });
  } catch (error) {
    console.error("getAllTimelyPlans Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch plans",
    });
  }
};

/* ══════════════════════════════════════════════
   3️⃣ GET PLAN BY ID
   GET /api/timely-plans/:id
   ══════════════════════════════════════════════ */
exports.getTimelyPlanById = async (req, res) => {
  try {
    const { id } = req.params;

    const plan = await TimelyPlan.findById(id);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: plan,
    });
  } catch (error) {
    console.error("getTimelyPlanById Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch plan",
    });
  }
};

/* ══════════════════════════════════════════════
   4️⃣ UPDATE PLAN
   PUT /api/timely-plans/update/:id
   ══════════════════════════════════════════════ */
exports.updateTimelyPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      planName,
      description,
      products,
      price,
      discount,
      validity,
      validityUnit,
      status,
    } = req.body;

    const plan = await TimelyPlan.findById(id);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found",
      });
    }

    // Duplicate plan name check
    if (planName && planName.trim() !== plan.planName) {
      const existing = await TimelyPlan.findOne({
        planName: planName.trim(),
        _id: { $ne: id },
      });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: "Another plan with this name already exists",
        });
      }
      plan.planName = planName.trim();
    }

    // ✅ Description update
    if (description !== undefined) {
      plan.description = (description || "").trim();
    }

    // ✅ Products update
    if (Array.isArray(products)) {
      plan.products = products
        .filter((p) => p && p.productName && p.productName.trim())
        .map((p) => ({
          productName: p.productName.trim(),
          features: Array.isArray(p.features)
            ? p.features.filter((f) => f && f.trim())
            : [],
        }));
    }

    if (price !== undefined) plan.price = Number(price);
    if (discount !== undefined) plan.discount = Number(discount);
    if (validity !== undefined) plan.validity = Number(validity);
    if (validityUnit) plan.validityUnit = validityUnit;
    if (status) plan.status = status;

    await plan.save();

    return res.status(200).json({
      success: true,
      message: "Plan updated successfully",
      data: plan,
    });
  } catch (error) {
    console.error("updateTimelyPlan Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update plan",
    });
  }
};

/* ══════════════════════════════════════════════
   5️⃣ DELETE PLAN
   DELETE /api/timely-plans/delete/:id
   ══════════════════════════════════════════════ */
exports.deleteTimelyPlan = async (req, res) => {
  try {
    const { id } = req.params;

    const plan = await TimelyPlan.findByIdAndDelete(id);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Plan deleted successfully",
      data: plan,
    });
  } catch (error) {
    console.error("deleteTimelyPlan Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete plan",
    });
  }
};

/* ══════════════════════════════════════════════
   6️⃣ TOGGLE STATUS (bonus)
   PUT /api/timely-plans/toggle-status/:id
   ══════════════════════════════════════════════ */
exports.toggleTimelyPlanStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const plan = await TimelyPlan.findById(id);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found",
      });
    }

    plan.status = plan.status === "active" ? "inactive" : "active";
    await plan.save();

    return res.status(200).json({
      success: true,
      message: `Plan status changed to '${plan.status}'`,
      data: plan,
    });
  } catch (error) {
    console.error("toggleTimelyPlanStatus Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to toggle status",
    });
  }
};