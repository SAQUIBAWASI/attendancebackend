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

// ⭐ YAHAN CHANGE KIYA HAI (checkout_reminder -> reminder_checkout)
const TEMPLATE_NAME = "reminder_checkout"; 
const TEMPLATE_NAMESPACE = "dad418a7_c0d7_42c8_8f6e_1d6abee724f2";
const TEMPLATE_LANG = "en";

// Kitne minute late hone par reminder bhejna hai
const LATE_THRESHOLD_MINUTES = 5;

// Ek employee ko ek din mein max kitne reminder (spam se bachne ke liye)
const MAX_REMINDERS_PER_DAY = 3;

// ==========================================
// 📤 WHATSAPP SEND FUNCTION
// ==========================================
const sendWhatsAppReminder = async (mobileNumber, employeeName) => {
  try {
    // Mobile number format: 91XXXXXXXXXX (without +)
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
      `✅ [WHATSAPP] Reminder sent to ${employeeName} (${formattedNumber}) | Response:`,
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
// ⏰ MAIN CRON LOGIC
// ==========================================
const checkAndSendCheckoutReminders = async () => {
  const now = new Date();
  console.log(`\n⏰ [CRON] Checking pending check-outs at ${now.toISOString()}`);

  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // 1️⃣ Aaj ke saare active (checked-in / on-break) attendance records
    const activeAttendances = await Attendance.find({
      checkInTime: { $gte: startOfToday },
      status: { $in: ["checked-in", "on-break"] },
    }).populate("employeeId");

    if (activeAttendances.length === 0) {
      console.log("ℹ️ [CRON] No active check-ins found.");
      return;
    }

    console.log(`📊 [CRON] Found ${activeAttendances.length} active check-in(s)`);

    for (const attendance of activeAttendances) {
      try {
        const employee = attendance.employeeId;
        if (!employee) {
          console.log("⚠️ [CRON] Employee not found for attendance:", attendance._id);
          continue;
        }

        // 2️⃣ Employee ka shift end time calculate karein
        const shiftHours = employee.shiftHours || attendance.assignedShiftHours || 8;
        const checkInTime = new Date(attendance.checkInTime);
        const expectedCheckOutTime = new Date(
          checkInTime.getTime() + shiftHours * 60 * 60 * 1000
        );

        // 3️⃣ Late minutes calculate karein
        const lateMinutes = Math.floor(
          (now.getTime() - expectedCheckOutTime.getTime()) / (1000 * 60)
        );

        // Agar 5 minute se kam late hai toh skip
        if (lateMinutes < LATE_THRESHOLD_MINUTES) {
          continue;
        }

        console.log(
          `👤 [CRON] ${employee.name} | Late by ${lateMinutes} min | Shift: ${shiftHours}h`
        );

        // 4️⃣ Employee ka mobile number check
        const mobileNumber =
          employee.mobileNumber || employee.phone || employee.mobile;
        if (!mobileNumber) {
          console.log(`⚠️ [CRON] No mobile number for ${employee.name}`);
          continue;
        }

        // 5️⃣ Spam prevention - aaj kitne reminders bheje?
        const todayReminders = (attendance.checkoutReminders || []).filter((r) => {
          const reminderDate = new Date(r.sentAt);
          return reminderDate >= startOfToday;
        });

        if (todayReminders.length >= MAX_REMINDERS_PER_DAY) {
          console.log(
            `🚫 [CRON] ${employee.name} already received ${MAX_REMINDERS_PER_DAY} reminders today. Skipping.`
          );
          continue;
        }

        // 6️⃣ Last reminder 30 min se pehle bheja tha? (cooldown)
        const lastReminder = todayReminders[todayReminders.length - 1];
        if (lastReminder) {
          const minutesSinceLast =
            (now.getTime() - new Date(lastReminder.sentAt).getTime()) / (1000 * 60);
          if (minutesSinceLast < 30) {
            console.log(
              `⏸️ [CRON] Last reminder sent ${Math.round(minutesSinceLast)} min ago. Cooldown active.`
            );
            continue;
          }
        }

        // 7️⃣ WhatsApp reminder bhejein
        const result = await sendWhatsAppReminder(mobileNumber, employee.name);

        // 8️⃣ Attendance record mein reminder log save karein
        if (result.success) {
          if (!attendance.checkoutReminders) attendance.checkoutReminders = [];
          attendance.checkoutReminders.push({
            sentAt: new Date(),
            lateMinutes,
            mobileNumber: String(mobileNumber),
            status: "sent",
          });
          await attendance.save();
        } else {
          if (!attendance.checkoutReminders) attendance.checkoutReminders = [];
          attendance.checkoutReminders.push({
            sentAt: new Date(),
            lateMinutes,
            mobileNumber: String(mobileNumber),
            status: "failed",
            error: result.error,
          });
          await attendance.save();
        }
      } catch (empErr) {
        console.error("❌ [CRON] Error processing employee:", empErr.message);
      }
    }
  } catch (err) {
    console.error("❌ [CRON] Fatal error:", err.message);
  }
};

// ==========================================
// 🚀 CRON SCHEDULE
// ==========================================
const startCheckoutReminderCron = () => {
  // Har minute chale (production mein har 1 min best hai)
  cron.schedule("* * * * *", checkAndSendCheckoutReminders, {
    scheduled: true,
    timezone: "Asia/Kolkata", // India timezone
  });

  console.log("✅ [CRON] Checkout reminder cron job started (every 1 min)");
};

module.exports = { startCheckoutReminderCron, checkAndSendCheckoutReminders };