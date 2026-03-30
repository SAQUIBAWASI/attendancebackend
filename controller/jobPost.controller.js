const JobPost = require("../models/jobPost");
const Notification = require("../models/Notification"); // Adjusted based on file name
const crypto = require("crypto");




const createJobPost = async (req, res) => {
  try {
    const {
      role,
      salary,
      experience,
      location,
      description,
      skills,
      assessmentIds,
      department,
      vacancies,
    } = req.body;

    if (!role || !salary || !experience || !location || !description || !skills) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be filled",
      });
    }

    const uniqueId = crypto.randomBytes(4).toString("hex");
    const link = `/jobs/${uniqueId}`;

    const jobPost = await JobPost.create({
      department: department || "General",
      vacancies: vacancies || 1,
      role,
      salary,
      experience,
      location,
      description,
      skills,
      assessmentIds: assessmentIds || [],
      link,
    });

    res.status(201).json({
      success: true,
      message: "Job post created successfully",
      jobPost,
    });
  } catch (error) {
    console.error("Create Job Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// 🟢 Get All Job Posts
const getAllJobPosts = async (req, res) => {
  try {
    const jobPosts = await JobPost.find().populate("assessmentIds").sort({ createdAt: -1 });

    res.status(200).json({ success: true, jobPosts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🟢 Get Job Post by Unique ID (for public view)
const getJobPostByLink = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`[DEBUG] Fetching job details for: ${id}`);

    // 1. Try finding by the link format (/jobs/hex)
    let jobPost = await JobPost.findOne({ link: `/jobs/${id}` }).populate("assessmentIds");
    console.log(`[DEBUG] Found by link: ${!!jobPost}`);

    // 2. Fallback: If not found, check if 'id' is a valid MongoDB ObjectId
    if (!jobPost && id.match(/^[0-9a-fA-F]{24}$/)) {
      jobPost = await JobPost.findById(id).populate("assessmentIds");
      console.log(`[DEBUG] Found by ID: ${!!jobPost}`);
    }

    if (!jobPost) {
      console.log(`[DEBUG] Job not found: ${id}`);
      return res.status(404).json({ success: false, message: "Job post not found" });
    }

    res.status(200).json({ success: true, jobPost });
  } catch (error) {
    console.error(`[ERROR] getJobPostByLink: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};



const updateJobPost = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Job ID is required",
      });
    }

    const updatedJob = await JobPost.findByIdAndUpdate(
      id,
      {
        department: req.body.department,
        vacancies: req.body.vacancies,
        role: req.body.role,
        salary: req.body.salary,
        experience: req.body.experience,
        location: req.body.location,
        description: req.body.description,
        skills: req.body.skills,
        assessmentIds: req.body.assessmentIds || [],
      },
      {
        new: true,
        runValidators: true,
      }
    ).populate("assessmentIds");

    if (!updatedJob) {
      return res.status(404).json({
        success: false,
        message: "Job post not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Job post updated successfully",
      jobPost: updatedJob,
    });
  } catch (error) {
    console.error("Update Job Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// 🟢 Delete Job Post
const deleteJobPost = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Attempting to delete Job ID:", id);

    if (!id) {
      return res.status(400).json({ success: false, message: "Job post ID is required" });
    }

    const deletedJob = await JobPost.findByIdAndDelete(id);

    if (!deletedJob) {
      console.log("Delete failed: Job not found for ID", id);
      return res.status(404).json({ success: false, message: "Job post not found in database" });
    }

    console.log("Delete successful");
    res.status(200).json({ success: true, message: "Job post deleted successfully" });
  } catch (error) {
    console.error("Job Post Delete Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createJobPost, getAllJobPosts, getJobPostByLink, updateJobPost, deleteJobPost };
