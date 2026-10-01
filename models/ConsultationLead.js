const mongoose = require("mongoose");

const consultationLeadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    businessName: {
      type: String,
      required: [true, "Business name is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
    },
    businessType: {
      type: String,
      required: [true, "Business type is required"],
      enum: [
        "Hospital",
        "Clinic",
        "Diagnostic Lab",
        "Doctor / Specialist",
        "Home Healthcare",
        "Healthcare Startup",
        "Other",
      ],
    },
    lookingFor: {
      type: String,
      required: [true, "Service selection is required"],
      enum: [
        "SEO",
        "Social Media Marketing",
        "Google Ads",
        "Meta Ads",
        "Lead Generation",
        "Content Marketing",
        "Full Digital Marketing",
        "Other",
      ],
    },
    status: {
      type: String,
      enum: ["New", "Contacted", "Converted", "Rejected"],
      default: "New",
    },
  },
  { timestamps: true }
);

consultationLeadSchema.index({ email: 1 });
consultationLeadSchema.index({ status: 1 });
consultationLeadSchema.index({ createdAt: -1 });

const ConsultationLead = mongoose.model("ConsultationLead", consultationLeadSchema);

module.exports = ConsultationLead;