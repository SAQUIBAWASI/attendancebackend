const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });

async function fixAllJobPosts() {
    try {
        const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/attendanceDB";
        await mongoose.connect(uri);
        console.log("✅ Connected to MongoDB\n");

        // Get the jobposts collection directly
        const db = mongoose.connection.db;
        const collection = db.collection('jobposts');

        const count = await collection.countDocuments();
        console.log(`📊 Found ${count} job posts\n`);

        if (count === 0) {
            console.log("⚠️  No job posts found in database");
            process.exit(0);
        }

        // Find all documents with the old assessmentId field
        const docsWithOldField = await collection.find({ assessmentId: { $exists: true } }).toArray();
        console.log(`🔍 Found ${docsWithOldField.length} job posts with old 'assessmentId' field\n`);

        // Remove the old field from all documents
        const result = await collection.updateMany(
            {},
            {
                $unset: { assessmentId: "" }
            }
        );
        console.log(`✅ Removed old 'assessmentId' field from ${result.modifiedCount} documents\n`);

        // Ensure all documents have assessmentIds as an array
        const ensureArrayResult = await collection.updateMany(
            { assessmentIds: { $exists: false } },
            { $set: { assessmentIds: [] } }
        );
        console.log(`✅ Added 'assessmentIds' array to ${ensureArrayResult.modifiedCount} documents\n`);

        // Show a sample document
        const sample = await collection.findOne();
        if (sample) {
            console.log("📄 Sample job post after fix:");
            console.log(`   Role: ${sample.role}`);
            console.log(`   AssessmentIds: ${JSON.stringify(sample.assessmentIds || [])}`);
            console.log(`   Has old assessmentId field: ${sample.assessmentId !== undefined}`);
        }

        console.log("\n✅ All job posts fixed!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Error:", err.message);
        console.error(err);
        process.exit(1);
    }
}

fixAllJobPosts();
