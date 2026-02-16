const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Load env from parent dir if needed, or default
dotenv.config({ path: path.join(__dirname, "../.env") });

const Quiz = require("../models/Quiz");

const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/attendanceDB";

const assessments = [
    // UI DEVELOPER SET
    {
        title: "UI Developer: React & Frontend",
        description: "Core React hooks, CSS Flexbox/Grid, and DOM basics.",
        category: "UI Developer",
        questions: [
            { questionText: "What is the virtual DOM in React?", options: ["A direct copy of the DOM", "A lightweight representation of the real DOM", "A browser API", "A database for UI"], correctAnswer: "A lightweight representation of the real DOM" },
            { questionText: "Which CSS property is used to create a flex container?", options: ["display: block", "display: grid", "display: flex", "float: left"], correctAnswer: "display: flex" },
            { questionText: "What hook is used to handle side effects in React?", options: ["useState", "useContext", "useEffect", "useReducer"], correctAnswer: "useEffect" }
        ]
    },
    // NURSE SET
    {
        title: "Nurse: Clinical Skills",
        description: "Emergency response, vital signs, and patient care basics.",
        category: "Nurse",
        questions: [
            { questionText: "Where is the best place to check a pulse in an emergency?", options: ["Radial artery", "Carotid artery", "Brachial artery", "Femoral artery"], correctAnswer: "Carotid artery" },
            { questionText: "What is the first step in basic life support?", options: ["Gives breaths", "Check for response", "Call for help", "Start compressions"], correctAnswer: "Check for response" },
            { questionText: "Which of the following is a normal adult respiratory rate?", options: ["6-10 bpm", "12-20 bpm", "25-30 bpm", "35-40 bpm"], correctAnswer: "12-20 bpm" }
        ]
    },
    // HR SET
    {
        title: "HR: Employee Relations",
        description: "Conflict resolution, onboarding, and professional development.",
        category: "HR",
        questions: [
            { questionText: "What is the primary goal of professional development?", options: ["Increasing salary", "Improving employee skills and performance", "Meeting quarterly quotas", "Reducing lunch breaks"], correctAnswer: "Improving employee skills and performance" },
            { questionText: "What does 'Onboarding' refer to?", options: ["Firing an employee", "The process of integrating a new employee", "Booking a flight", "Reviewing budget"], correctAnswer: "The process of integrating a new employee" }
        ]
    }
];

async function seed() {
    try {
        console.log("🚀 Connecting to MongoDB...");
        await mongoose.connect(mongoURI, { dbName: "attendanceDB" });
        console.log("✅ Connected!");

        // Optional: Clear existing quizzes if you want a clean slate
        // await Quiz.deleteMany({});
        // console.log("🗑️ Cleared existing quizzes.");

        console.log("📥 Seeding assessments...");
        const result = await Quiz.insertMany(assessments);
        console.log(`✅ Successfully seeded ${result.length} assessments!`);

        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding Failed:", error.message);
        process.exit(1);
    }
}

seed();
