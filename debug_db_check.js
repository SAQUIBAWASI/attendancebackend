require("dotenv").config();
const mongoose = require("mongoose");
const JobApplication = require("./models/JobApplication");

// Connect to MongoDB
mongoose
    .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/attendanceDB", { // Ensure URI matches server.js
        dbName: "attendanceDB",
    })
    .then(async () => {
        console.log("✅ MongoDB Connected for Debugging");

        try {
            const apps = await JobApplication.find({
                candidateAgreementsUpload: { $exists: true, $ne: null }
            });

            console.log(`Found ${apps.length} applications with uploaded documents.`);

            if (apps.length > 0) {
                apps.forEach(app => {
                    console.log(`- ID: ${app._id}, Name: ${app.firstName} ${app.lastName}, File: ${app.candidateAgreementsUpload}`);
                });
            } else {
                console.log("No applications found with 'candidateAgreementsUpload' set.");
                // Check total applications to be sure
                const total = await JobApplication.countDocuments();
                console.log(`Total Applications in DB: ${total}`);
            }

        } catch (err) {
            console.error("Error querying DB:", err);
        } finally {
            mongoose.connection.close();
        }
    })
    .catch((err) => console.error("❌ MongoDB Connection Error:", err));
