const mongoose = require('mongoose');
require('dotenv').config();

const JobApplication = require('./models/JobApplication');

async function checkData() {
    console.log("Starting checkData...");
    try {
        console.log("Connecting to:", process.env.MONGO_URI);
        if (!process.env.MONGO_URI) {
            console.error("MONGO_URI is undefined!");
            process.exit(1);
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB successfully");

        const selectedCount = await JobApplication.countDocuments({ status: "Selected" });
        console.log("Total Selected Candidates:", selectedCount);

        const withDatesCount = await JobApplication.countDocuments({
            status: "Selected",
            offerSentAt: { $exists: true },
            appliedAt: { $exists: true }
        });
        console.log("Selected Candidates with both dates:", withDatesCount);

        const samples = await JobApplication.find({
            status: "Selected"
        }).limit(10).select('appliedAt offerSentAt status');

        console.log("Sample Data (Selected):", JSON.stringify(samples, null, 2));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkData();
