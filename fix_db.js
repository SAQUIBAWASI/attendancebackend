const mongoose = require('mongoose');
const Employee = require('./models/Employee');

mongoose.connect("mongodb+srv://saquiba:saquiba123@cluster0.hrgeeif.mongodb.net/attendanceDB?retryWrites=true&w=majority&appName=attendance")
  .then(async () => {
    const emps = await Employee.find({'salaryIncrements': {$exists: true, $not: {$size: 0}}});
    let updated = 0;
    for (const emp of emps) {
      const active = emp.salaryIncrements.filter(i => i.isActive);
      active.sort((a,b) => new Date(b.effectiveFrom) - new Date(a.effectiveFrom));
      if (active.length > 0) {
        const latest = active[0];
        if (latest.newSalaryPerMonth !== emp.salaryPerMonth && emp.salaryPerMonth > 0) {
          console.log('Fixing mismatch for', emp.employeeId, 'DB:', emp.salaryPerMonth, 'Increment:', latest.newSalaryPerMonth);
          const diff = emp.salaryPerMonth - latest.newSalaryPerMonth;
          const currentDate = new Date();
          const incrementRecord = {
            incrementType: 'amount',
            incrementValue: diff,
            oldSalaryPerMonth: latest.newSalaryPerMonth,
            newSalaryPerMonth: emp.salaryPerMonth,
            effectiveFrom: currentDate,
            effectiveMonth: currentDate.getMonth() + 1,
            effectiveYear: currentDate.getFullYear(),
            reason: 'Auto-fixed mismatch from direct edit',
            isActive: true
          };
          emp.salaryIncrements.push(incrementRecord);
          await emp.save();
          updated++;
        }
      }
    }
    console.log('Fixed mismatches:', updated);
    process.exit(0);
  }).catch(err => {
    console.error(err);
    process.exit(1);
  });
