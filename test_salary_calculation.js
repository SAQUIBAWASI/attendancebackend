const mongoose = require('mongoose');
const { getSalaries } = require('./controller/attendanceSummary.controller');
require('dotenv').config();

async function test() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tm-attendance');
  
  // Use November 2025 as there are records for it based on test_attendance_query.js (which had data from 2025-11)
  const req = {
    query: {
      month: '2025-11'
    }
  };
  
  const res = {
    status: function(code) {
      console.log("Res Status Code:", code);
      return this;
    },
    json: function(data) {
      console.log("JSON response success:", data.success);
      if (data.success) {
        console.log("Month:", data.monthName, data.year);
        console.log("Count:", data.count);
        data.salaries.forEach(s => {
          console.log(`- ${s.name} (${s.employeeId}): Present=${s.presentDays}, Earned WO=${s.earnedWeekOffs}, Default WO=${s.defaultWeekOffs}, WeekOffs=${s.weekOffs}, PaidDays=${s.paidDays}, CalcSalary=${s.calculatedSalaryDisplay}`);
        });
      } else {
        console.log("Error:", data.error);
      }
      process.exit();
    }
  };

  try {
    await getSalaries(req, res);
  } catch (err) {
    console.error("Test failed with error:", err);
    process.exit(1);
  }
}

test();
