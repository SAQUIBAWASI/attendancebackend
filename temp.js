const mongoose = require('mongoose');

async function main() {
  await mongoose.connect('mongodb+srv://saquiba:saquiba123@cluster0.hrgeeif.mongodb.net/attendanceDB');
  const Attendance = require('./attendancebackend/models/Attendance');
  const docs = await Attendance.find({ checkInTime: { $gte: new Date('2026-05-01') } }).limit(5).lean();
  console.log(JSON.stringify(docs, null, 2));
  process.exit(0);
}

main();
