const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    role: {
        type: String,
        required: true
    },
    experienceLevel: {
        type: String,
        enum: ["Fresher", "Junior", "Mid", "Senior"],
        required: true
    },
    duration: {
        type: Number,
        default: 30
    }, // in minutes
    totalMarks: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ["Active", "Inactive"],
        default: "Active"
    },
    questions: [
        {
            questionText: { type: String, required: true },
            options: [{ type: String, required: true }],
            correctAnswer: { type: String, required: true },
            marks: { type: Number, default: 1 }
        },
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});


module.exports = mongoose.model("Quiz", quizSchema);
