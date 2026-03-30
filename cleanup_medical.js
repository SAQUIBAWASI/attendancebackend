const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/attendanceDB";

const medicalCertificateSchema = new mongoose.Schema({
  employeeId: String,
  candidateId: mongoose.Schema.Types.ObjectId,
});

const MedicalCertificate = mongoose.model("MedicalCertificate", medicalCertificateSchema);

async function cleanup() {
  try {
    console.log("Connecting to MongoDB:", MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log("Connected.");

    // Delete records where employeeId is literally "undefined" (string) or null
    const res1 = await MedicalCertificate.deleteMany({
      $or: [
        { employeeId: "undefined" },
        { employeeId: null },
        { employeeId: "" }
      ]
    });
    console.log(`Deleted ${res1.deletedCount} records with invalid employeeId.`);

    // Delete records where candidateId is invalid (if any)
    const res2 = await MedicalCertificate.deleteMany({
      $and: [
          { employeeId: { $exists: false } },
          { candidateId: { $exists: false } }
      ]
    });
    console.log(`Deleted ${res2.deletedCount} records with no IDs at all.`);

    await mongoose.disconnect();
    console.log("Done.");
  } catch (error) {
    console.error("Cleanup failed:", error);
  }
}

cleanup();
