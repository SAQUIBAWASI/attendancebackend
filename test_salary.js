const mongoose = require('mongoose');
const Employee = require('./models/Employee');
require('dotenv').config();

async function test() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tm-attendance');
  const emp = await Employee.findOne({ employeeId: 'EMP011' });
  if (!emp) {
    console.log("No EMP011");
    process.exit();
  }
  
  const feb = await emp.getSalaryForDate(new Date(2026, 1, 1)); // Feb 1
  const mar = await emp.getSalaryForDate(new Date(2026, 2, 1)); // Mar 1
  const apr = await emp.getSalaryForDate(new Date(2026, 3, 1)); // Apr 1
  
  console.log("Feb:", feb.salaryPerMonth);
  console.log("Mar:", mar.salaryPerMonth);
  console.log("Apr:", apr.salaryPerMonth);
  console.log("Current (root):", emp.salaryPerMonth);
  process.exit();
}
test();
