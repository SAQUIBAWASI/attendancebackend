require("dotenv").config();
const mongoose = require("mongoose");
const Shift = require("C:/Users/Ingran/Desktop/Saquiba Files/AD/attendancebackend/models/Shift");

const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/attendanceDB";

async function run() {
  await mongoose.connect(mongoUri, { dbName: "attendanceDB" });
  console.log("Connected to MongoDB.");

  const allShifts = await Shift.find({ isMasterShift: false }).limit(10).lean();
  console.log("Sample Shift Assignments (isMasterShift: false):");
  allShifts.forEach(shift => {
    console.log(JSON.stringify(shift, null, 2));
  });

  await mongoose.disconnect();
}

run().catch(console.error);