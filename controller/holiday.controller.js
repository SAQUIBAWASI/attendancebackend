const Holiday = require("../models/Holiday");

// ─── Safe optional imports (won't crash if they fail) ───────────────────────
let Notification = null;
let Employee = null;
let sendPushToUser = null;

try {
  Notification = require("../models/Notification");
} catch (e) {
  console.warn("[Holiday] Notification model not found – skipping notifications");
}

try {
  Employee = require("../models/Employee");
} catch (e) {
  console.warn("[Holiday] Employee model not found – skipping notifications");
}

try {
  const notifController = require("./notification.controller");
  sendPushToUser = notifController.sendPushToUser || null;
} catch (e) {
  console.warn("[Holiday] notification.controller not found – skipping push");
}

// ─── Get All Holidays ────────────────────────────────────────────────────────
exports.getHolidays = async (req, res) => {
  try {
    const holidays = await Holiday.find({}).lean();
    // Sort by fromDate string (YYYY-MM-DD format sorts correctly as string)
    holidays.sort((a, b) => (a.fromDate || "").localeCompare(b.fromDate || ""));
    res.json(holidays);
  } catch (error) {
    console.error("❌ getHolidays error:", error.message);
    res.status(500).json({ message: "Failed to fetch holidays", error: error.message });
  }
};

// ─── Add Holiday ─────────────────────────────────────────────────────────────
exports.addHoliday = async (req, res) => {
  try {
    const { name, fromDate, toDate, totalDays, type, isActive, state } = req.body;

    if (!name || !fromDate || !toDate) {
      return res.status(400).json({ message: "name, fromDate and toDate are required" });
    }

    const newHoliday = await Holiday.create({
      name,
      fromDate,
      toDate,
      totalDays: totalDays || 1,
      type: type || "Public Holiday",
      state: state || "All",
      isActive: isActive !== undefined ? isActive : true,
    });

    // ── Optional: notify employees ───────────────────────────────────────────
    if (Notification && Employee) {
      try {
        const employees = await Employee.find({ status: "active" }).lean();
        const notifyPromises = employees.map((emp) =>
          Notification.create({
            userId: emp.employeeId,
            role: "employee",
            title: "New Holiday",
            message: `${name} – from ${fromDate} to ${toDate}`,
            type: "general",
          }).catch(() => {})
        );
        await Promise.all(notifyPromises);

        if (sendPushToUser) {
          employees.forEach((emp) =>
            sendPushToUser(emp.employeeId, {
              title: "Holiday Alert 🎉",
              body: `Upcoming: ${name}`,
              url: "/holidays-calendar",
            })
          );
        }
      } catch (notifErr) {
        console.warn("[Holiday] Notification error (non-critical):", notifErr.message);
      }
    }

    res.status(201).json({ message: "Holiday added", holiday: newHoliday });
  } catch (error) {
    console.error("❌ addHoliday error:", error.message);
    res.status(500).json({ message: "Failed to add holiday", error: error.message });
  }
};

// ─── Update Holiday ──────────────────────────────────────────────────────────
exports.updateHoliday = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, fromDate, toDate, totalDays, type, isActive, state } = req.body;

    const updateFields = { name, fromDate, toDate, totalDays, type };
    if (state !== undefined) updateFields.state = state;
    if (isActive !== undefined) updateFields.isActive = isActive;

    const holiday = await Holiday.findByIdAndUpdate(
      id,
      updateFields,
      { new: true }
    );

    if (!holiday) return res.status(404).json({ message: "Holiday not found" });

    res.json({ message: "Holiday updated", holiday });
  } catch (error) {
    console.error("❌ updateHoliday error:", error.message);
    res.status(500).json({ message: "Failed to update holiday", error: error.message });
  }
};

// ─── Delete Holiday ──────────────────────────────────────────────────────────
exports.deleteHoliday = async (req, res) => {
  try {
    const { id } = req.params;
    await Holiday.findByIdAndDelete(id);
    res.json({ message: "Holiday deleted" });
  } catch (error) {
    console.error("❌ deleteHoliday error:", error.message);
    res.status(500).json({ message: "Failed to delete holiday", error: error.message });
  }
};
