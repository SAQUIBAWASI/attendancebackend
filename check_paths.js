const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const mongoURI = "mongodb://127.0.0.1:27017/attendanceDB";

const EmployeeExperience = mongoose.model("EmployeeExperience", new mongoose.Schema({
    offerLetter: String,
    payslip: String
}), "employeeexperiences");

async function checkPaths() {
    try {
        await mongoose.connect(mongoURI, { dbName: "attendanceDB" });
        console.log("Connected to MongoDB");
        
        const experiences = await EmployeeExperience.find({ $or: [{ offerLetter: { $exists: true, $ne: "" } }, { payslip: { $exists: true, $ne: "" } }] }).limit(5);
        
        console.log("Found", experiences.length, "experiences with documents");
        experiences.forEach(exp => {
            console.log("ID:", exp._id);
            console.log("Offer Letter:", exp.offerLetter);
            console.log("Payslip:", exp.payslip);
            console.log("---");
        });
        
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

checkPaths();
