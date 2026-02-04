const mongoose = require("mongoose");

const jobPostSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true,
  },
  responsibilities: {
    type: String,
    required: true,
  },
  skills: {
    type: String,
    required: true, // Can be comma-separated or stored as an array
  },
  salary: {
    type: String,
  },
  assessmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Quiz",
  },
  link: {
    type: String,
    unique: true,
  },
  status: {
    type: String,
    enum: ["active", "closed"],
    default: "active",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("JobPost", jobPostSchema);
