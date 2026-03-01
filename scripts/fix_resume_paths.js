const mongoose = require("mongoose");
const JobApplication = require("../models/JobApplication");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/attendanceDB", { dbName: "attendanceDB" });
        console.log("✅ MongoDB Connected");
    } catch (err) {
        console.error("❌ MongoDB Connection Error:", err);
        process.exit(1);
    }
};

const fixResumePaths = async () => {
    await connectDB();

    try {
        const applications = await JobApplication.find({ resume: { $exists: true, $ne: null } });
        console.log(`Found ${applications.length} applications with resumes`);

        let updatedCount = 0;

        for (const app of applications) {
            let originalPath = app.resume;
            let newPath = originalPath;

            // Check if path contains 'uploads' and strip everything before it
            if (originalPath.includes("uploads")) {
                const parts = originalPath.split(/uploads[\\/]/);
                if (parts.length > 1) {
                    newPath = "uploads/" + parts[parts.length - 1].replace(/\\/g, "/");
                }
            }

            // Normalize slashes just in case
            newPath = newPath.replace(/\\/g, "/");

            if (newPath !== originalPath) {
                app.resume = newPath;
                await app.save();
                console.log(`Updated: ${originalPath} -> ${newPath}`);
                updatedCount++;
            }
        }

        console.log(`✅ Migration Complete. Updated ${updatedCount} resume paths.`);
    } catch (error) {
        console.error("Migration Error:", error);
    } finally {
        mongoose.connection.close();
    }
};

fixResumePaths();
