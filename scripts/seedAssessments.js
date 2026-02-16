const mongoose = require("mongoose");
const axios = require("axios");

// Configuration
const API_URL = "http://localhost:5000/api/admin/add-bulkquizzes";

const assessments = {
    quizzes: [
        // UI DEVELOPER SET
        {
            topic: "UI Developer: React & Frontend",
            category: "UI Developer",
            questions: [
                { questionText: "What is the virtual DOM in React?", options: ["A direct copy of the DOM", "A lightweight representation of the real DOM", "A browser API", "A database for UI"], correctAnswer: "A lightweight representation of the real DOM" },
                { questionText: "Which CSS property is used to create a flex container?", options: ["display: block", "display: grid", "display: flex", "float: left"], correctAnswer: "display: flex" },
                { questionText: "What hook is used to handle side effects in React?", options: ["useState", "useContext", "useEffect", "useReducer"], correctAnswer: "useEffect" }
            ]
        },
        // NURSE SET
        {
            topic: "Nurse: Clinical Skills",
            category: "Nurse",
            questions: [
                { questionText: "Where is the best place to check a pulse in an emergency?", options: ["Radial artery", "Carotid artery", "Brachial artery", "Femoral artery"], correctAnswer: "Carotid artery" },
                { questionText: "What is the first step in basic life support?", options: ["Gives breaths", "Check for response", "Call for help", "Start compressions"], correctAnswer: "Check for response" },
                { questionText: "Which of the following is a normal adult respiratory rate?", options: ["6-10 bpm", "12-20 bpm", "25-30 bpm", "35-40 bpm"], correctAnswer: "12-20 bpm" }
            ]
        },
        // HR SET
        {
            topic: "HR: Employee Relations",
            category: "HR",
            questions: [
                { questionText: "What is the primary goal of professional development?", options: ["Increasing salary", "Improving employee skills and performance", "Meeting quarterly quotas", "Reducing lunch breaks"], correctAnswer: "Improving employee skills and performance" },
                { questionText: "What does 'Onboarding' refer to?", options: ["Firing an employee", "The process of integrating a new employee", "Booking a flight", "Reviewing budget"], correctAnswer: "The process of integrating a new employee" }
            ]
        }
    ]
};

async function seed() {
    try {
        console.log("🚀 Seeding Refined Role-Based Assessments...");
        const response = await axios.post(API_URL, assessments);
        if (response.data.success) {
            console.log("✅ Successfully seeded refined assessments!");
            console.log("Added roles: UI Developer, Nurse, HR");
        }
    } catch (error) {
        console.error("❌ Seeding Failed:", error.response?.data?.message || error.message);
    }
}

seed();
