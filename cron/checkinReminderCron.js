// cron/checkinReminderCron.js
const cron = require("node-cron");
const axios = require("axios");
const Attendance = require("../models/Attendance");
const Employee = require("../models/Employee");
const Shift = require("../models/Shift");

// ==========================================
// 🔧 CONFIGURATION
// ==========================================
const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY || "565249AxLd3LEpU17G6aae8ee2P1";
const MSG91_API_URL = "https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/";
const INTEGRATED_NUMBER = "919010480303";

const TEMPLATE_NAME = "checkin_reminder";
const TEMPLATE_NAMESPACE = "dad418a7_c0d7_42c8_8f6e_1d6abee724f2";
const TEMPLATE_LANG = "en";

const CHECKIN_LINK = process.env.CHECKIN_LINK || "https://timelyhealth.com/attendance";

const LATE_THRESHOLD_MINUTES = 5;

// ⭐ SIRF EK BAAR REMINDER PER DAY
const MAX_REMINDERS_PER_DAY = 1;

// ==========================================
// 📤 WHATSAPP SEND FUNCTION (2 Variables)
// ==========================================
const sendWhatsAppReminder = async (mobileNumber, employeeName, checkinLink) => {
  try {
    let formattedNumber = String(mobileNumber).replace(/\D/g, "");
    if (formattedNumber.length === 10) {
      formattedNumber = "91" + formattedNumber;
    }

    const payload = {
      integrated_number: INTEGRATED_NUMBER,
      content_type: "template",
      payload: {
        messaging_product: "whatsapp",
        type: "template",
        template: {
          name: TEMPLATE_NAME,
          language: { code: TEMPLATE_LANG, policy: "deterministic" },
          namespace: TEMPLATE_NAMESPACE,
          to_and_components: [
            {
              to: [formattedNumber],
              components: {
                body_1: { type: "text", value: employeeName || "Employee" },
                body_2: { type: "text", value: checkinLink || CHECKIN_LINK },
              },
            },
          ],
        },
      },
    };

    const response = await axios.post(MSG91_API_URL, payload, {
      headers: {
        "Content-Type": "application/json",
        authkey: MSG91_AUTH_KEY,
      },
    });

    console.log(
      `✅ [WHATSAPP] Check-in reminder sent to ${employeeName} (${formattedNumber})`,
      response.data
    );
    return { success: true, data: response.data };
  } catch (error) {
    console.error(
      `❌ [WHATSAPP] Failed for ${employeeName}:`,
      error.response?.data || error.message
    );
    return { success: false, error: error.message };
  }
};

// ==========================================
// 🔧 HELPERS
// ==========================================
const getMobile = (employee) => {
  if (!employee) return null;
  return (
    employee.phone ||
    employee.mobileNumber ||
    employee.mobile ||
    employee.alternateNumber ||
    null
  );
};

// ⭐ SHIFT START TIME PARSER
const parseShiftStartTime = (startTimeStr) => {
  if (!startTimeStr) return null;

  try {
    const today = new Date();
    const str = String(startTimeStr).trim().toUpperCase();

    // AM/PM format
    if (str.includes("AM") || str.includes("PM")) {
      const match = str.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/);
      if (match) {
        let hour = parseInt(match[1]);
        const minute = parseInt(match[2]);
        const period = match[3];

        if (period === "PM" && hour !== 12) hour += 12;
        if (period === "AM" && hour === 12) hour = 0;

        today.setHours(hour, minute, 0, 0);
        return today;
      }
    }

    // 24-hour format "10:00" or "17:30"
    const match = str.match(/^(\d{1,2}):(\d{2})$/);
    if (match) {
      const hour = parseInt(match[1]);
      const minute = parseInt(match[2]);
      today.setHours(hour, minute, 0, 0);
      return today;
    }

    return null;
  } catch (err) {
    console.error("❌ Error parsing shift start time:", err.message);
    return null;
  }
};

// ⭐ Ek employee ka shift start time nikaalo (Shift collection se)
const getEmployeeShiftStartTime = async (employeeId) => {
  try {
    let shift = await Shift.findOne({
      "employeeAssignment.employeeId": employeeId,
      isActive: true,
      isMasterShift: false,
    }).lean();

    if (!shift) {
      shift = await Shift.findOne({
        employeeId: employeeId,
        isMasterShift: { $exists: false },
      }).lean();
    }

    if (!shift) {
      shift = await Shift.findOne({ employeeId: employeeId }).lean();
    }

    if (!shift) return null;

    let startTimeStr = null;

    if (shift.employeeAssignment?.selectedTimeRange) {
      const timeRange = shift.employeeAssignment.selectedTimeRange;
      const parts = timeRange.split(" - ");
      if (parts[0]) startTimeStr = parts[0].trim();
    } else if (shift.startTime) {
      startTimeStr = shift.startTime;
    }

    if (!startTimeStr) return null;

    return parseShiftStartTime(startTimeStr);
  } catch (err) {
    console.error(`❌ Error fetching shift for ${employeeId}:`, err.message);
    return null;
  }
};

// ==========================================
// ⏰ MAIN CRON LOGIC
// ==========================================
const checkAndSendCheckinReminders = async () => {
  const now = new Date();
  console.log(`\n⏰ [CHECK-IN CRON] Checking at ${now.toISOString()}`);

  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // ✅ SIRF ACTIVE EMPLOYEES
    const employees = await Employee.find({
      status: "active",
      $or: [
        { mobileNumber: { $exists: true, $ne: null } },
        { phone: { $exists: true, $ne: null } },
        { mobile: { $exists: true, $ne: null } },
      ],
    }).lean();

    if (employees.length === 0) {
      console.log("ℹ️ [CHECK-IN CRON] No active employees found.");
      return;
    }

    console.log(`📊 [CHECK-IN CRON] Checking ${employees.length} active employee(s)`);

    let sent = 0;
    let skipped = 0;

    for (const employee of employees) {
      try {
        const empId = employee.employeeId;
        if (!empId) {
          skipped++;
          continue;
        }

        // ✅ Aaj ka attendance check karo
        const todayAttendance = await Attendance.findOne({
          employeeId: empId,
          checkInTime: { $gte: startOfToday },
        }).lean();

        // ✅ Already check-in kar chuka hai toh skip
        if (todayAttendance) {
          continue;
        }

        // ⭐ CHECK: Aaj already reminder bhej chuke hain kya?
        // Agar haan, toh skip kar do (sirf 1 reminder per day)
        const todayReminders = (employee.checkinReminders || []).filter((r) => {
          const reminderDate = new Date(r.sentAt);
          return reminderDate >= startOfToday;
        });

        if (todayReminders.length >= MAX_REMINDERS_PER_DAY) {
          console.log(
            `🚫 [CHECK-IN CRON] ${employee.name} already got reminder today → skip`
          );
          skipped++;
          continue;
        }

        // ⭐ SHIFT COLLECTION SE START TIME NIKAALO
        const shiftStartTime = await getEmployeeShiftStartTime(empId);

        if (!shiftStartTime) {
          console.log(
            `⏭️ [CHECK-IN CRON] ${employee.name} (${empId}) → no shift assigned, skip`
          );
          skipped++;
          continue;
        }

        // ✅ Kitne min late ho gaye (shift start se)
        const lateMinutes = Math.floor(
          (now.getTime() - shiftStartTime.getTime()) / (1000 * 60)
        );

        // ⏭️ Shift start hone se 5 min se kam hua → abhi time nahi
        if (lateMinutes < LATE_THRESHOLD_MINUTES) {
          continue;
        }

        const mobileNumber = getMobile(employee);
        if (!mobileNumber) {
          console.log(`⚠️ [CHECK-IN CRON] No mobile for: ${employee.name} (${empId})`);
          skipped++;
          continue;
        }

        // ✅ Send WhatsApp
        console.log(
          `📤 [CHECK-IN CRON] Sending to ${employee.name} (${mobileNumber}) | Late: ${lateMinutes} min | Shift Start: ${shiftStartTime.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`
        );

        const result = await sendWhatsAppReminder(
          mobileNumber,
          employee.name,
          CHECKIN_LINK
        );

        // ✅ Log reminder
        await Employee.updateOne(
          { employeeId: empId },
          {
            $push: {
              checkinReminders: {
                sentAt: new Date(),
                lateMinutes,
                mobileNumber: String(mobileNumber),
                status: result.success ? "sent" : "failed",
                error: result.success ? undefined : result.error,
              },
            },
          }
        );

        if (result.success) sent++;
      } catch (empErr) {
        console.error("❌ [CHECK-IN CRON] Error processing employee:", empErr.message);
      }
    }

    console.log(
      `📊 [CHECK-IN CRON] Done — Sent: ${sent}, Skipped: ${skipped}, Total: ${employees.length}`
    );
  } catch (err) {
    console.error("❌ [CHECK-IN CRON] Fatal error:", err.message);
  }
};

// ==========================================
// 🚀 CRON SCHEDULE (Har 5 min)
// ==========================================
const startCheckinReminderCron = () => {
  cron.schedule("*/5 * * * *", checkAndSendCheckinReminders, {
    scheduled: true,
    timezone: "Asia/Kolkata",
  });

  console.log(
    "✅ [CRON] Check-in reminder cron started (every 5 min, IST) — ONLY 1 reminder per day per employee"
  );
};

module.exports = {
  startCheckinReminderCron,
  checkAndSendCheckinReminders,
  sendWhatsAppReminder,
};