const mongoose = require('mongoose');
const Employee = require('./models/Employee');
require('dotenv').config();

async function test() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tm-attendance');
  const emp = await Employee.findOne({ employeeId: 'EMP011' });
  const activeIncrements = emp.salaryIncrements.filter(inc => inc.isActive === true);
  const oldestFirst = [...activeIncrements].sort((a, b) => {
    const timeDiff = new Date(a.effectiveFrom) - new Date(b.effectiveFrom);
    if (timeDiff === 0) {
      return new Date(a.createdAt) - new Date(b.createdAt);
    }
    return timeDiff;
  });
  
  console.log("Oldest increment:", oldestFirst[0]?.oldSalaryPerMonth);
  console.log("Oldest increment created at:", oldestFirst[0]?.createdAt);
  process.exit();
}
test();
