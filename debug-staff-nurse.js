const mongoose = require("mongoose");
const JobPost = require("./models/jobPost");
const JobApplication = require("./models/JobApplication");

async function debug() {
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/attendanceDB");
        console.log("Connected to DB: attendanceDB");

        const targetRole = "Staff Nurse";

        const jobs = await JobPost.find({ role: new RegExp(`^${targetRole}$`, 'i') });
        console.log(`Found ${jobs.length} JobPosts for role "${targetRole}" (case-insensitive)`);
        jobs.forEach(j => console.log(` - ID: ${j._id}, Role: "${j.role}", Status: ${j.status}`));

        const jobIds = jobs.map(j => j._id);
        const apps = await JobApplication.find({ jobId: { $in: jobIds } });
        console.log(`Found ${apps.length} applications for these JobPosts`);

        const allJobRoles = await JobPost.distinct("role");
        console.log("All available roles in JobPost:", allJobRoles);

        const appJobIds = await JobApplication.distinct("jobId");
        console.log(`Applications exist for ${appJobIds.length} distinct jobIds`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

debug();
