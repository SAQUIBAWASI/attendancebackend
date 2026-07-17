const mongoose = require('mongoose');
const Attendance = require('./models/Attendance');
require('dotenv').config();

async function test() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tm-attendance');
  
  // Find one record to see fields
  const record = await Attendance.findOne();
  console.log("One Attendance Record:", JSON.stringify(record, null, 2));

  // Count using 'date' filter
  const startDate = new Date(2026, 6, 1); // July 1st 2026
  const endDate = new Date(2026, 7, 0); // July 31st 2026
  
  const countWithDate = await Attendance.countDocuments({
    date: { $gte: startDate, $lte: endDate }
  });
  console.log("Count with 'date' field:", countWithDate);

  // Count using 'checkInTime' filter
  const countWithCheckIn = await Attendance.countDocuments({
    checkInTime: { $gte: startDate, $lte: endDate }
  });
  console.log("Count with 'checkInTime' field:", countWithCheckIn);

  process.exit();
}
test();
