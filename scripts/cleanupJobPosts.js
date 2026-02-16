const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });
const JobPost = require("../models/JobPost");

async function cleanupOldJobPosts() {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/attendanceDB");
        console.log("🔍 Cleaning up old job post records...");

        // Find all job posts
        const jobs = await JobPost.find();
        console.log(`Found ${jobs.length} job posts`);

        for (const job of jobs) {
            // Check if it has the old assessmentId field (singular)
            if (job.assessmentId !== undefined) {
                console.log(`Removing old assessmentId field from job: ${job.role}`);
                // Remove the old field
                await JobPost.updateOne(
                    { _id: job._id },
                    { $unset: { assessmentId: "" } }
                );
            }

            // Ensure assessmentIds is an array
            if (!Array.isArray(job.assessmentIds)) {
                console.log(`Fixing assessmentIds for job: ${job.role}`);
                await JobPost.updateOne(
                    { _id: job._id },
                    { $set: { assessmentIds: [] } }
                );
            }
        }

        console.log("✅ Cleanup complete!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Cleanup Failed:", err.message);
        process.exit(1);
    }
}

cleanupOldJobPosts();
