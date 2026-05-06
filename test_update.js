const mongoose = require("mongoose");
const Employee = require("./models/Employee");

mongoose.connect("mongodb+srv://saquiba:saquiba123@cluster0.hrgeeif.mongodb.net/attendanceDB?retryWrites=true&w=majority&appName=attendance", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log("Connected to MongoDB");
  const employee = await Employee.findOne({ employeeId: "EMP011" });
  if (employee) {
    employee.basicPay = 20201;
    employee.ctc = 250000;
    await employee.save();
    console.log("Updated employee:", await Employee.findOne({ employeeId: "EMP011" }).select("employeeId name basicPay ctc"));
  }
  process.exit();
});
