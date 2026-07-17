const mongoose = require("mongoose");

const companyIPSchema = new mongoose.Schema(
  {
    companyId: {
      type: String,
    },
    publicIp: {
      type: String,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("CompanyIP", companyIPSchema);