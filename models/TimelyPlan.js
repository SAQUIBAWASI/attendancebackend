// models/TimelyPlan.js
const mongoose = require("mongoose");

const timelyPlanSchema = new mongoose.Schema(
  {
    planName: {
      type: String,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    products: [
      {
        productName: {
          type: String,
        },
        features: [
          {
            type: String,
          },
        ],
      },
    ],
    price: {
      type: Number,
    },
    discount: {
      type: Number,
      default: 0,
    },
    validity: {
      type: Number,
    },
    validityUnit: {
      type: String,
      enum: ["days", "months", "years"],
      default: "days",
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("TimelyPlan", timelyPlanSchema);