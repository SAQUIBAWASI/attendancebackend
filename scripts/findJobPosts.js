const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });

async function findJobPosts() {
    try {
        const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/attendanceDB";
        await mongoose.connect(uri);
        console.log("✅ Connected to MongoDB");

        // Try different possible collection names
        const possibleNames = ['jobposts', 'JobPosts', 'job_posts', 'jobs'];

        for (const name of possibleNames) {
            try {
                const collection = mongoose.connection.db.collection(name);
                const count = await collection.countDocuments();
                console.log(`\n📦 Collection '${name}': ${count} documents`);

                if (count > 0) {
                    const sample = await collection.findOne();
                    console.log("\nSample document:");
                    console.log(JSON.stringify(sample, null, 2));
                }
            } catch (err) {
                console.log(`Collection '${name}' not found or error:`, err.message);
            }
        }

        process.exit(0);
    } catch (err) {
        console.error("❌ Error:", err.message);
        process.exit(1);
    }
}

findJobPosts();
