// const axios = require('axios'); // existing APIs ko call karne ke liye

// // Helper: get week number of month
// function getWeekOfMonth(dateStr) {
//   const date = new Date(dateStr);
//   const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
//   return Math.ceil((date.getDate() + firstDay.getDay()) / 7);
// }

// // ✅ Reports API
// const getAttendanceReport = async (req, res) => {
//   try {
//     const { month, department, reportType } = req.query; // month="YYYY-MM", reportType=daily/weekly/monthly

//     // 1️⃣ Fetch employees from existing API
//     const employeesRes = await axios.get('http://localhost:5000/api/employees'); 
//     let employees = employeesRes.data; // assuming array of {id, name, department,...}
//     if (department && department !== 'all') {
//       employees = employees.filter(emp => emp.department === department);
//     }
//     const employeeIds = employees.map(emp => emp.id);

//     // 2️⃣ Fetch attendance records from existing API
//     const attendanceRes = await axios.get('http://localhost:5000/api/attendance'); 
//     let records = attendanceRes.data; // assuming array of {employeeId, date, status, locationStatus,...}
//     records = records.filter(r => employeeIds.includes(r.employeeId) && r.date.startsWith(month));

//     // 3️⃣ Employee summary
//     const empSummary = {};
//     employees.forEach(emp => {
//       empSummary[emp.id] = {
//         name: emp.name,
//         department: emp.department,
//         total: 0,
//         present: 0,
//         absent: 0,
//         late: 0,
//         locationStatus: 'Inside Range'
//       };
//     });

//     records.forEach(record => {
//       const emp = empSummary[record.employeeId];
//       if (emp) {
//         emp.total++;
//         if (record.status === 'present') emp.present++;
//         else if (record.status === 'absent') emp.absent++;
//         else if (record.status === 'late') emp.late++;

//         if (record.locationStatus === 'outside') {
//           if (emp.locationStatus === 'Inside Range') emp.locationStatus = 'Outside Range';
//           else if (emp.locationStatus !== 'Outside Range') emp.locationStatus = 'Mixed';
//         }
//       }
//     });

//     const summaryData = Object.values(empSummary).map(emp => ({
//       ...emp,
//       attendanceRate: emp.total > 0 ? ((emp.present / emp.total) * 100).toFixed(1) : 0
//     }));

//     // 4️⃣ Chart / Aggregated Data
//     let chartData = [];
//     if (reportType === 'daily') {
//       const dailyData = {};
//       records.forEach(record => {
//         if (!dailyData[record.date]) dailyData[record.date] = { date: record.date, present: 0, absent: 0, late: 0 };
//         if (record.status === 'present') dailyData[record.date].present++;
//         else if (record.status === 'absent') dailyData[record.date].absent++;
//         else if (record.status === 'late') dailyData[record.date].late++;
//       });
//       chartData = Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date));
//     } else if (reportType === 'weekly') {
//       const weeklyData = {};
//       records.forEach(record => {
//         const week = getWeekOfMonth(record.date);
//         if (!weeklyData[week]) weeklyData[week] = { week, present: 0, absent: 0, late: 0 };
//         if (record.status === 'present') weeklyData[week].present++;
//         else if (record.status === 'absent') weeklyData[week].absent++;
//         else if (record.status === 'late') weeklyData[week].late++;
//       });
//       chartData = Object.values(weeklyData);
//     } else { // monthly
//       const totalPresent = records.filter(r => r.status === 'present').length;
//       const totalAbsent = records.filter(r => r.status === 'absent').length;
//       const totalLate = records.filter(r => r.status === 'late').length;
//       chartData = [{ month, present: totalPresent, absent: totalAbsent, late: totalLate }];
//     }

//     res.json({ success: true, summary: summaryData, chartData });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: 'Server Error' });
//   }
// };

// module.exports = { getAttendanceReport };

