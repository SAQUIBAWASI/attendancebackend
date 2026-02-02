const Holiday = require("../models/Holiday");
const Notification = require("../models/Notification"); // ✅ Import Notification
const Employee = require("../models/Employee"); // ✅ Import Employee
const { sendPushToUser } = require("./notification.controller"); // ✅ Helper

// ✅ Add Holiday
exports.addHoliday = async (req, res) => {
  try {
    const { name, date, day, year, type } = req.body;

    if (!name || !date || !year) {
      return res.status(400).json({ message: "Name, Date and Year are required" });
    }

    const newHoliday = new Holiday({ name, date, day, year, type });
    await newHoliday.save();

    // 🔔 Notify ALL Employees
    // Using simple "userId: ALL" approach if you implemented it in notification.controller
    // OR calling createNotification directly if we want to save DB records directly here to be safer/faster.
    // Let's use the explicit loop here for clarity or rely on notification.controller logic.
    // Since I implemented "ALL" logic in createNotification, let's just trigger it via HTTP-like call? 
    // No, better to duplicate logic slightly or re-use function.
    // I already implemented logic in notification controller for "ALL".
    // I can just call the shared logic if I extracted it, but I didn't extract "createNotification" logic into a clean service, just helper.
    // So I will implement the loop here to be safe and dependent-less.

    const employees = await Employee.find({ status: "active" });
    const notifyPromises = employees.map(emp => 
       Notification.create({
         userId: emp.employeeId,
         role: "employee",
         title: "New Holiday Added",
         message: `${name} on ${date} (${day})`,
         type: "general"
       })
    );
    await Promise.all(notifyPromises);

    // Push Notification
    employees.forEach(emp => {
      sendPushToUser(emp.employeeId, {
        title: "Holiday Alert",
        body: `Upcoming Holiday: ${name} on ${date}`,
        url: "/"
      });
    });

    res.status(201).json({ message: "Holiday added and employees notified", holiday: newHoliday });
  } catch (error) {
    console.error("Error adding holiday:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get Holidays
exports.getHolidays = async (req, res) => {
  try {
    const holidays = await Holiday.find().sort({ date: 1 });
    res.json(holidays);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Delete Holiday
exports.deleteHoliday = async (req, res) => {
  try {
    const { id } = req.params;
    await Holiday.findByIdAndDelete(id);
    res.json({ message: "Holiday deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
