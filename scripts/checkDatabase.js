const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });

async function checkDatabase() {
    try {
        const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/attendanceDB";
        console.log("Connecting to:", uri);

        await mongoose.connect(uri);
        console.log("✅ Connected to MongoDB");

        // List all collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log("\n📦 Collections in database:");
        collections.forEach(c => console.log(`  - ${c.name}`));

        // Check JobPost collection
        const JobPost = require("../models/JobPost");
        const jobs = await JobPost.find();
        console.log(`\n📋 Found ${jobs.length} job posts`);

        if (jobs.length > 0) {
            console.log("\nFirst job post structure:");
            console.log(JSON.stringify(jobs[0], null, 2));
        }

        process.exit(0);
    } catch (err) {
        console.error("❌ Error:", err.message);
        process.exit(1);
    }
}

checkDatabase();
