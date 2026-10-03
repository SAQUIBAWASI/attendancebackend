// cron/checkoutReminderCron.js
const cron = require("node-cron");
const axios = require("axios");
const Attendance = require("../models/Attendance");
const Employee = require("../models/Employee");

// ==========================================
// 🔧 CONFIGURATION
// ==========================================
const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY || "565249AxLd3LEpU17G6aae8ee2P1";
const MSG91_API_URL = "https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/";
const INTEGRATED_NUMBER = "919010480303";

const TEMPLATE_NAME = "reminder_checkout";
const TEMPLATE_NAMESPACE = "dad418a7_c0d7_42c8_8f6e_1d6abee724f2";
const TEMPLATE_LANG = "en";

// ✅ 5 min late hone par reminder bhejna
const LATE_THRESHOLD_MINUTES = 5;
// ✅ Ek din me max 3 reminder (spam se bachne ke liye)
const MAX_REMINDERS_PER_DAY = 3;
// ✅ Do reminders ke beech minimum gap (cooldown)
const COOLDOWN_MINUTES = 30;

// ==========================================
// 📤 WHATSAPP SEND FUNCTION
// ==========================================
const sendWhatsAppReminder = async (mobileNumber, employeeName) => {
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
          language: {
            code: TEMPLATE_LANG,
            policy: "deterministic",
          },
          namespace: TEMPLATE_NAMESPACE,
          to_and_components: [
            {
              to: [formattedNumber],
              components: {
                body_1: {
                  type: "text",
                  value: employeeName || "Employee",
                },
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
      `✅ [WHATSAPP] Sent to ${employeeName} (${formattedNumber})`,
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
const getEmployeeMap = async (employeeIds) => {
  if (!employeeIds || employeeIds.length === 0) return new Map();

  const employees = await Employee.find({
    employeeId: { $in: employeeIds },
  }).lean();

  return new Map(employees.map((e) => [e.employeeId, e]));
};

const getEmpId = (attendance) => {
  if (!attendance.employeeId) return null;
  if (typeof attendance.employeeId === "object") {
    return attendance.employeeId.employeeId || null;
  }
  return String(attendance.employeeId);
};

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

// ==========================================
// ⏰ MAIN CRON LOGIC (production)
// ✅ Har 5 min chalta hai
// ✅ Sirf unhe bhejta hai jinho ne 5+ min se checkout nahi kiya
// ==========================================
const checkAndSendCheckoutReminders = async () => {
  const now = new Date();
  console.log(`\n⏰ [CRON] Checking pending check-outs at ${now.toISOString()}`);

  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // ✅ Aaj ke active check-ins (checked-in ya on-break) jo checkout nahi kiye
    const activeAttendances = await Attendance.find({
      checkInTime: { $gte: startOfToday },
      status: { $in: ["checked-in", "on-break"] },
    }).lean();

    if (activeAttendances.length === 0) {
      console.log("ℹ️ [CRON] No active check-ins found.");
      return;
    }

    console.log(`📊 [CRON] Found ${activeAttendances.length} active check-in(s)`);

    // ✅ Unique empIds → employees fetch
    const empIds = [
      ...new Set(activeAttendances.map(getEmpId).filter(Boolean)),
    ];
    const employeeMap = await getEmployeeMap(empIds);

    let sent = 0;
    let skipped = 0;

    for (const attendance of activeAttendances) {
      try {
        const empId = getEmpId(attendance);
        const employee = employeeMap.get(empId);

        if (!employee) {
          console.log(`⚠️ [CRON] Employee not found in DB: ${empId}`);
          skipped++;
          continue;
        }

        // ✅ Expected checkout time = checkInTime + shiftHours
        const shiftHours =
          employee.shiftHours || attendance.assignedShiftHours || 8;
        const checkInTime = new Date(attendance.checkInTime);
        const expectedCheckOutTime = new Date(
          checkInTime.getTime() + shiftHours * 60 * 60 * 1000
        );

        // ✅ Kitne min late ho gaye
        const lateMinutes = Math.floor(
          (now.getTime() - expectedCheckOutTime.getTime()) / (1000 * 60)
        );

        // ⏭️ 5 min se kam late → skip
        if (lateMinutes < LATE_THRESHOLD_MINUTES) {
          console.log(
            `⏭️ [CRON] ${employee.name} | Late: ${lateMinutes} min (< ${LATE_THRESHOLD_MINUTES} min) → skip`
          );
          skipped++;
          continue;
        }

        const mobileNumber = getMobile(employee);
        if (!mobileNumber) {
          console.log(`⚠️ [CRON] No mobile for: ${employee.name} (${empId})`);
          skipped++;
          continue;
        }

        // ===== Spam prevention =====
        const todayReminders = (attendance.checkoutReminders || []).filter(
          (r) => {
            const reminderDate = new Date(r.sentAt);
            return reminderDate >= startOfToday;
          }
        );

        // ✅ Max 3 per day
        if (todayReminders.length >= MAX_REMINDERS_PER_DAY) {
          console.log(
            `🚫 [CRON] ${employee.name} already got ${MAX_REMINDERS_PER_DAY} reminders today → skip`
          );
          skipped++;
          continue;
        }

        // ✅ Cooldown: last reminder ke 30 min baad hi naya bhejo
        const lastReminder = todayReminders[todayReminders.length - 1];
        if (lastReminder) {
          const minutesSinceLast =
            (now.getTime() - new Date(lastReminder.sentAt).getTime()) /
            (1000 * 60);
          if (minutesSinceLast < COOLDOWN_MINUTES) {
            console.log(
              `⏸️ [CRON] ${employee.name} | Last reminder ${Math.round(minutesSinceLast)} min ago (cooldown ${COOLDOWN_MINUTES} min) → skip`
            );
            skipped++;
            continue;
          }
        }

        // ✅ Send WhatsApp
        console.log(
          `📤 [CRON] Sending to ${employee.name} (${mobileNumber}) | Late: ${lateMinutes} min | Shift: ${shiftHours}h`
        );

        const result = await sendWhatsAppReminder(
          mobileNumber,
          employee.name
        );

        // ✅ Log reminder
        await Attendance.findByIdAndUpdate(attendance._id, {
          $push: {
            checkoutReminders: {
              sentAt: new Date(),
              lateMinutes,
              mobileNumber: String(mobileNumber),
              status: result.success ? "sent" : "failed",
              error: result.success ? undefined : result.error,
            },
          },
        });

        if (result.success) sent++;
      } catch (empErr) {
        console.error("❌ [CRON] Error processing employee:", empErr.message);
      }
    }

    console.log(
      `📊 [CRON] Done — Sent: ${sent}, Skipped: ${skipped}, Total: ${activeAttendances.length}`
    );
  } catch (err) {
    console.error("❌ [CRON] Fatal error:", err.message);
  }
};

// ==========================================
// 🚀 CRON SCHEDULE
// ✅ Har 5 min chalta hai (*/5 * * * *)
// ==========================================
const startCheckoutReminderCron = () => {
  cron.schedule("*/5 * * * *", checkAndSendCheckoutReminders, {
    scheduled: true,
    timezone: "Asia/Kolkata",
  });

  console.log(
    "✅ [CRON] Checkout reminder cron started (every 5 min, IST) — threshold: 5 min late, cooldown: 30 min, max 3/day"
  );
};

module.exports = {
  startCheckoutReminderCron,
  checkAndSendCheckoutReminders,
  sendWhatsAppReminder,
};