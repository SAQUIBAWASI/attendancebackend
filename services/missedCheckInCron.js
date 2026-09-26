// services/missedCheckInCron.js
const cron = require("node-cron");
const Employee = require("../models/Employee");
const Attendance = require("../models/Attendance");
const Shift = require("../models/Shift"); // 👈 path confirm karo
const { sendToToken } = require("./notificationService");

// ========================================
// 🔔 Get shift start time for an employee
// ========================================
const getEmployeeShiftStartTime = async (employeeId) => {
  try {
    // First: employee assignment wala shift dhundo
    let shift = await Shift.findOne({
      "employeeAssignment.employeeId": employeeId,
      isActive: true,
      isMasterShift: false,
    }).lean();

    // Fallback: legacy shift
    if (!shift) {
      shift = await Shift.findOne({
        employeeId: employeeId,
        isMasterShift: { $exists: false },
      }).lean();
    }

    if (!shift) return null;

    // employeeAssignment se timeRange nikaalo
    let timeRange = null;
    if (shift.employeeAssignment?.selectedTimeRange) {
      timeRange = shift.employeeAssignment.selectedTimeRange;
    } else if (shift.startTime && shift.endTime) {
      timeRange = `${shift.startTime} - ${shift.endTime}`;
    }

    if (!timeRange) return null;

    const [startTime] = timeRange.split(" - ").map((s) => s.trim());
    return startTime || null; // "10:00"
  } catch (err) {
    console.error(`❌ [CRON] Error fetching shift for ${employeeId}:`, err.message);
    return null;
  }
};

// ========================================
// ⏰ Missed Check-In Reminder
// Har 5 min me chalega
// ========================================
const sendMissedCheckInReminders = async () => {
  const now = new Date();
  console.log("\n========================================");
  console.log("⏰ [CRON] Missed check-in cron started at:", now.toISOString());

  try {
    // Server timezone check
    const istTime = new Date(
      now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    );
    const currentHH = String(istTime.getHours()).padStart(2, "0");
    const currentMM = String(istTime.getMinutes()).padStart(2, "0");
    const currentTimeStr = `${currentHH}:${currentMM}`;

    console.log("🕐 [CRON] Current IST time:", currentTimeStr);

    // Aaj ka start of day (IST)
    const startOfTodayIST = new Date(istTime);
    startOfTodayIST.setHours(0, 0, 0, 0);
    // UTC me convert (kyunki DB me dates UTC me hain)
    const startOfTodayUTC = new Date(
      Date.UTC(
        istTime.getFullYear(),
        istTime.getMonth(),
        istTime.getDate(),
        0, 0, 0, 0
      )
    );

    // Sab employees with valid FCM token
    const employees = await Employee.find({
      fcmToken: { $ne: null },
      isFcmTokenStored: true,
      status: "active",
    }).lean();

    console.log(`👥 [CRON] Employees with token: ${employees.length}`);

    let notified = 0;
    let skipped = 0;
    let noShift = 0;

    for (const emp of employees) {
      // Shift start time lo
      const shiftStart = await getEmployeeShiftStartTime(emp.employeeId);

      if (!shiftStart) {
        noShift++;
        continue;
      }

      // Shift start HH:MM ko minutes me convert
      const [shiftH, shiftM] = shiftStart.split(":").map(Number);
      const shiftMinutes = shiftH * 60 + shiftM;

      const [currH, currM] = currentTimeStr.split(":").map(Number);
      const currMinutes = currH * 60 + currM;

      const diff = currMinutes - shiftMinutes;

      // ✅ Exact 5 min baad hi trigger karo (5 se 9 minute window)
      // (5 min cron interval ke saath "5 min late" hit karne ke liye)
      if (diff < 5 || diff >= 10) {
        skipped++;
        continue;
      }

      console.log(
        `⏱️ [CRON] ${emp.employeeId} shift start: ${shiftStart}, late by: ${diff} min`
      );

      // Aaj already notify kiya?
      if (emp.lastMissedCheckInNotifiedAt) {
        const lastNotified = new Date(emp.lastMissedCheckInNotifiedAt);
        if (lastNotified.toDateString() === now.toDateString()) {
          console.log(`⏭️ [CRON] Already notified today: ${emp.employeeId}`);
          skipped++;
          continue;
        }
      }

      // Aaj check-in kiya hai?
      const todayAttendance = await Attendance.findOne({
        employeeId: emp.employeeId,
        checkInTime: { $gte: startOfTodayUTC },
      }).lean();

      if (todayAttendance) {
        console.log(`✅ [CRON] Already checked-in: ${emp.employeeId}`);
        skipped++;
        continue;
      }

      // 🚀 Send notification
      const title = "Check-In Reminder ⏰";
      const body = `Hey ${emp.name}, your shift started at ${shiftStart} and you're 5 minutes late for check-in. Are you not going to the office today?`;

      console.log(`📤 [CRON] Sending reminder to: ${emp.employeeId} (${emp.name})`);

      try {
        const result = await sendToToken({
          token: emp.fcmToken,
          title,
          body,
          data: {
            type: "MISSED_CHECK_IN",
            employeeId: String(emp.employeeId),
            shiftStartTime: String(shiftStart),
            timestamp: now.toISOString(),
          },
        });

        if (result.success) {
          console.log(`✅ [CRON] Reminder SENT to ${emp.employeeId}. ID: ${result.messageId}`);
          notified++;

          await Employee.updateOne(
            { _id: emp._id },
            { $set: { lastMissedCheckInNotifiedAt: now } }
          );
        } else {
          console.error(`❌ [CRON] Reminder FAILED for ${emp.employeeId}. Code: ${result.code}`);

          // Invalid token — clear karo
          if (
            result.code === "messaging/registration-token-not-registered" ||
            result.error === "NotRegistered" ||
            result.code === "messaging/invalid-registration-token"
          ) {
            await Employee.updateOne(
              { _id: emp._id },
              {
                $set: {
                  fcmToken: null,
                  isFcmTokenStored: false,
                  fcmUpdatedAt: now,
                },
              }
            );
            console.log(`🧹 [CRON] Invalid token cleared for ${emp.employeeId}`);
          }
        }
      } catch (e) {
        console.error(`❌ [CRON] Exception for ${emp.employeeId}:`, e.message);
      }
    }

    console.log(
      `📊 [CRON] Done — Notified: ${notified}, Skipped: ${skipped}, NoShift: ${noShift}`
    );
    console.log("========================================\n");
  } catch (err) {
    console.error("❌ [CRON] EXCEPTION:", err);
    console.log("========================================\n");
  }
};

// ========================================
// 🚀 Start Cron
// ========================================
const startMissedCheckInCron = () => {
  console.log("🚀 [CRON] Starting missed check-in cron...");

  cron.schedule(
    "*/5 * * * *", // har 5 min
    () => {
      sendMissedCheckInReminders();
    },
    {
      timezone: "Asia/Kolkata", // IST
    }
  );

  console.log("✅ [CRON] Missed check-in reminder scheduled (every 5 min, IST)");
};

module.exports = { startMissedCheckInCron, sendMissedCheckInReminders };