const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const JobApplication = require('../models/JobApplication');

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
            status: "Selected",
            offerSentAt: { $exists: true },
            appliedAt: { $exists: true }
        }).limit(5).select('appliedAt offerSentAt');

        console.log("Sample Data:", JSON.stringify(samples, null, 2));

        if (samples.length > 0) {
            samples.forEach(app => {
                const diffTime = Math.abs(app.offerSentAt - app.appliedAt);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                console.log(`Candidate ID: ${app._id}, Diff Days: ${diffDays}`);
            });
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkData();
