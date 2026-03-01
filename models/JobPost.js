const mongoose = require("mongoose");

const jobPostSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: true,
      trim: true,
    },

    salary: {
      type: String,
      required: true,
      trim: true,
    },

    experience: {
      type: String,
      enum: ["Fresher", "0-1", "1-2", "2-3", "3-4", "5+"],
      required: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    skills: {
      type: String,
      required: true,
      trim: true,
    },

    assessmentIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Quiz",
      },
    ],

    link: {
      type: String,
      unique: true,
    },

    status: {
      type: String,
      enum: ["active", "closed"],
      default: "active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("JobPost", jobPostSchema);
