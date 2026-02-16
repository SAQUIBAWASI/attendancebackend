const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });
const Quiz = require("../models/Quiz");

async function verify() {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/attendanceDB");
        console.log("🔍 Verifying Assessment Module Data...");

        const assessment = await Quiz.findOne({ role: "UI Developer" });
        if (assessment) {
            console.log("✅ Found Assessment with Role metadata!");
            console.log(`Title: ${assessment.title}`);
            console.log(`Role: ${assessment.role}`);
            console.log(`Exp Level: ${assessment.experienceLevel}`);
            console.log(`Questions: ${assessment.questions.length}`);
            console.log(`Total Marks: ${assessment.totalMarks}`);
        } else {
            console.log("⚠️ No role-based assessments found. Seeding test data...");
            const testData = new Quiz({
                title: "Test Senior Developer Quiz",
                role: "UI Developer",
                experienceLevel: "Senior",
                duration: 45,
                totalMarks: 2,
                questions: [
                    { questionText: "Q1", options: ["A", "B"], correctAnswer: "A", marks: 1 },
                    { questionText: "Q2", options: ["A", "B"], correctAnswer: "B", marks: 1 }
                ]
            });
            await testData.save();
            console.log("✅ Seeded test assessment successfully!");
        }

        process.exit(0);
    } catch (err) {
        console.error("❌ Verification Failed:", err.message);
        process.exit(1);
    }
}

verify();
