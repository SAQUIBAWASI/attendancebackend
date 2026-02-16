const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });

async function findSpecificJob() {
    try {
        const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/attendanceDB";
        await mongoose.connect(uri);
        console.log("✅ Connected to MongoDB");

        const jobId = "6989c49fa0612a073eb236cb";

        // Search in all collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log(`\n🔍 Searching for job ID: ${jobId} in all collections...\n`);

        for (const collInfo of collections) {
            const collection = mongoose.connection.db.collection(collInfo.name);
            try {
                const doc = await collection.findOne({ _id: new mongoose.Types.ObjectId(jobId) });
                if (doc) {
                    console.log(`✅ FOUND in collection: ${collInfo.name}`);
                    console.log("\nDocument structure:");
                    console.log(JSON.stringify(doc, null, 2));

                    // Check for old assessmentId field
                    if (doc.assessmentId !== undefined) {
                        console.log("\n⚠️  Found old 'assessmentId' field (singular)!");
                        console.log("Removing it and ensuring assessmentIds is an array...");

                        await collection.updateOne(
                            { _id: doc._id },
                            {
                                $unset: { assessmentId: "" },
                                $set: { assessmentIds: doc.assessmentIds || [] }
                            }
                        );
                        console.log("✅ Fixed!");
                    }
                }
            } catch (err) {
                // Skip if error
            }
        }

        process.exit(0);
    } catch (err) {
        console.error("❌ Error:", err.message);
        process.exit(1);
    }
}

findSpecificJob();
