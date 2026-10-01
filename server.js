
const dns = require("dns");

// Force Public DNS Servers
dns.setServers([
  "8.8.8.8",        // Google Primary
  "8.8.4.4",        // Google Secondary
  "1.1.1.1",        // Cloudflare
  "208.67.222.222"  // OpenDNS
]);


// ✅ Load environment variables
require("dotenv").config();

// ✅ Import required packages
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const taskRoutes = require("./routes/task.routes");
const employeeTaskRoutes = require("./routes/employeeTask.routes");
const { startMissedCheckInCron } = require("./services/missedCheckInCron");
const { startCheckoutReminderCron } = require("./cron/checkoutReminderCron");
const axios = require("axios");



// ✅ IMPORT DAILY TASK REPEATER JOB
const startDailyTaskRepeater = require("./middleware/startDailyTaskRepeater");

// ✅ Initialize Express app
const app = express();


// JSON body limit badha do (base64 PDF ke liye)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// ✅ Middleware setup
const allowedOrigins = ["http://localhost:5173", "http://localhost:3000", "http://localhost:3001", 'https://attendancefrontend.vercel.app', "https://bm-frontend-lyart.vercel.app", "https://www.timelyhealth.in",
  "https://timelyhealth.in", "http://62.72.29.27:3045", "https://taskmanagement.iryax.com", "https://ingrainhire.ingrainsystems.com", "https://digital.timelyhealth.in"];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// 🔍 DEBUG: Log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// ✅ Serve static files (for uploaded images)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// 🚨 Fallback for missing uploads: If file isn't found in /uploads, don't fallback to API 404
app.use("/uploads", (req, res) => {
  res.status(404).send(`
    <html>
      <head><title>File Not Found</title></head>
      <body style="font-family: sans-serif; text-align: center; padding: 50px;">
        <h2>Document Not Found</h2>
        <p>The requested file could not be found on the server. It may have been deleted or moved.</p>
      </body>
    </html>
  `);
});

// ✅ Connect MongoDB
mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/attendanceDB", {
    dbName: "attendanceDB",
  })
  .then(() => {
    console.log("✅ MongoDB Connected Successfully!");
    startMissedCheckInCron();
    startCheckoutReminderCron();

    
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
  });

// ✅ ROUTES
const applicationRoutes = require("./routes/jobApplication.routes");
app.use("/api/applications", applicationRoutes);

app.use("/api/jobs", require("./routes/jobPost.routes")); // Move to top
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/employees", require("./routes/employee.routes"));
app.use("/api/leaves", require("./routes/leave.routes"));
app.use("/api/shifts", require("./routes/shift.routes"));
app.use("/api/admin", require("./routes/adminroutes"));
app.use("/api/empl", require("./routes/empl.routers"));
app.use("/api/candidate", require("./routes/candidate.routes")); // Candidate Routes
app.use("/api/location", require("./routes/location.routes"));
app.use("/api/attendance", require("./routes/attendance.routes"));
app.use("/api/attendancesummary", require("./routes/attendancesummary.routes"));
app.use("/api/salary", require("./routes/salary.routes"));
app.use("/api/user-activity", require("./routes/userActivity.routes"));
app.use("/api/expense", require("./routes/expense.routes"));
app.use("/api/call-data", require("./routes/callData.routes"));
app.use("/api/visit-targets", require("./routes/visitTarget.routes"));
app.use("/api/holidays", require("./routes/holiday.routes"));
app.use("/api/tasks", require("./routes/task.routes"));
app.use("/api/employee/tasks", require("./routes/employeeTask.routes"));
const patientRoutes = require("./routes/patients");
const referralContactRoutes = require('./routes/referralContactRoutes');
const timelyPlanRoutes = require("./routes/timelyPlanRoutes");
const timelyClientRoutes = require("./routes/timelyClientRoutes");





const dashboardRoutes = require("./routes/dashboard.routes");
const eventRoutes = require("./routes/eventRoutes");

// ✅ Client Requests
app.use("/api/client-requests", require("./routes/clientRequest.routes"));

// ✅ Notifications
app.use("/api/notifications", require("./routes/notification.routes"));


app.use("/api/appointment-slots", require("./routes/appointmentSlot.routes"));

app.use("/api/consultation-leads", require("./routes/consultationLead.routes"));


app.use("/api/teams", require("./routes/team.routes"));
app.use("/api/partners", require("./routes/partner.routes"));
app.use("/api/patients", patientRoutes);


// ✅ Simple Test Route to verify server update
app.get("/api/test-application-routes", (req, res) => {
  res.json({ message: "Job Application Routes are active!" });
});

app.get("/api/ping-debug", (req, res) => {
  res.json({
    message: "PING",
    path: __dirname,
    node_version: process.version,
    uptime: process.uptime()
  });
});




// ==========================================
// 📤 DIRECT WHATSAPP TEST — Specific Number
// ==========================================
app.post("/send-test-whatsapp", async (req, res) => {
  try {
    const { mobileNumber, employeeName } = req.body;

    if (!mobileNumber) {
      return res.status(400).json({
        success: false,
        message: "mobileNumber is required (e.g., 919876543210)",
      });
    }

    // Number format clean karo
    let formattedNumber = String(mobileNumber).replace(/\D/g, "");
    if (formattedNumber.length === 10) {
      formattedNumber = "91" + formattedNumber;
    }

    const MSG91_AUTH_KEY = "565249AxLd3LEpU17G6aae8ee2P1";
    const MSG91_API_URL =
      "https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/";

    const payload = {
      integrated_number: "919010480303",
      content_type: "template",
      payload: {
        messaging_product: "whatsapp",
        type: "template",
        template: {
          // ⭐ YAHAN CHANGE KIYA HAI (checkout_reminder -> reminder_checkout)
          name: "reminder_checkout", 
          language: {
            code: "en",
            policy: "deterministic",
          },
          namespace: "dad418a7_c0d7_42c8_8f6e_1d6abee724f2",
          to_and_components: [
            {
              to: [formattedNumber],
              components: {
                body_1: {
                  type: "text",
                  value: employeeName || "Test User",
                },
              },
            },
          ],
        },
      },
    };

    console.log(`\n🧪 [TEST] Sending WhatsApp to: ${formattedNumber}`);
    console.log("📤 Payload:", JSON.stringify(payload, null, 2));

    const response = await axios.post(MSG91_API_URL, payload, {
      headers: {
        "Content-Type": "application/json",
        authkey: MSG91_AUTH_KEY,
      },
    });

    console.log("✅ [TEST] MSG91 Response:", response.data);

    res.status(200).json({
      success: true,
      message: `WhatsApp sent to ${formattedNumber}`,
      msg91Response: response.data,
    });
  } catch (error) {
    console.error(
      "❌ [TEST] Error:",
      error.response?.data || error.message
    );
    res.status(500).json({
      success: false,
      message: "Failed to send WhatsApp",
      error: error.response?.data || error.message,
    });
  }
});

app.use("/api/department", require("./routes/department.routes"));
app.use("/api/roles", require("./routes/role.routes"));
app.use("/api/permissions", require("./routes/permission.routes"));
app.use("/api/services", require("./routes/serviceRoutes"));
app.use("/api/doctors", require("./routes/doctorRoutes"));
app.use("/api/letterheads", require("./routes/letterHeadRoutes"));
app.use("/api/dashboard", require("./routes/dashboard.routes"));

app.use("/api/events", require("./routes/eventRoutes"));

app.use('/api/referralcontacts', referralContactRoutes);



// ✅ COMP-OFF ROUTES - Add this line (if not already present, remove duplicate)
app.use("/api/leaves", require("./routes/compOff.routes"));  // ✅ Comp-off routes

// ✅ Medical Certificates
app.use("/api/medical-certificates", require("./routes/medicalCertificate.routes"));

// ✅ Attendance Edit Requests
app.use("/api/attendance-edit-requests", require("./routes/attendanceEditRequest.routes"));

// ✅ Password Reset
app.use("/api/password-reset", require("./routes/passwordReset.routes"));


app.use("/api/timely-plans", timelyPlanRoutes);
app.use("/api/timely-clients", timelyClientRoutes);



const UPLOADS_ROOT = process.env.UPLOADS_ROOT || path.join(__dirname, "uploads");

console.log("\n═══════════════════════════════════════════════════════════");
console.log("📁 [SERVER] Working Directory (cwd):", process.cwd());
console.log("📁 [SERVER] __dirname:", __dirname);
console.log("📁 [SERVER] UPLOADS_ROOT:", UPLOADS_ROOT);
console.log("📁 [SERVER] UPLOADS_ROOT exists:", fs.existsSync(UPLOADS_ROOT));

if (!fs.existsSync(UPLOADS_ROOT)) {
  console.log(`⚠️ [SERVER] UPLOADS_ROOT does NOT exist — creating it now`);
  fs.mkdirSync(UPLOADS_ROOT, { recursive: true });
}

// Create all required upload subfolders
const REQUIRED_UPLOAD_DIRS = [
  "attendance",
  "attendanceimage",
  "candidate-documents",
  "employee-documents",
  "employee-experience",
  "faces",
  "letterheads",
  "medical-certificates",
];

REQUIRED_UPLOAD_DIRS.forEach((dir) => {
  const fullPath = path.join(UPLOADS_ROOT, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`📁 [SERVER] Created: ${dir}`);
  }
});

console.log("✅ [SERVER] All upload folders verified");

// List existing files in employee-documents for debugging
try {
  const empDocDir = path.join(UPLOADS_ROOT, "employee-documents");
  if (fs.existsSync(empDocDir)) {
    const files = fs.readdirSync(empDocDir);
    console.log("📁 [SERVER] Employee-documents file count:", files.length);
    if (files.length > 0) {
      console.log("📁 [SERVER] Sample files:", files.slice(0, 5));
    }
  } else {
    console.log("⚠️ [SERVER] employee-documents folder MISSING!");
  }
} catch (e) {
  console.log("⚠️ [SERVER] Error listing:", e.message);
}
console.log("═══════════════════════════════════════════════════════════\n");

// ✅ Default test route
app.get("/", (req, res) => {
  res.json({
    message: "✅ Attendance API is running successfully!",
    availableRoutes: {
      auth: "/api/auth",
      employees: "/api/employees",
      admin: "/api/admin",
      empl: "/api/empl",
      leaves: "/api/leaves",
      department: "/api/department",
      roles: "/api/roles",
      shifts: "/api/shifts",
      location: "/api/location",
      salary: "/api/salary",
      holidays: "/api/holidays",
      tasks: "/api/tasks",
      attendance: {
        checkin: "POST /api/attendance/checkin",
        checkout: "POST /api/attendance/checkout",
        getAll: "GET /api/attendance/all",
      },
      compOffs: {
        getAll: "GET /api/leaves/comp-offs",
        createRequest: "POST /api/leaves/comp-off-requests",
        update: "PUT /api/leaves/comp-offs/update/:id",
        delete: "DELETE /api/leaves/comp-offs/:id"
      }
    },
  });
});

// 🚨 Catch-all 404 Handler (Logs unhandled requests)
app.use((req, res, next) => {
  console.log(`[WARNING] Unhandled 404 Request: ${req.method} ${req.url}`);
  res.status(404).json({ success: false, message: "Route not found on server" });
});

// 🚨 Global Error Handler
app.use((err, req, res, next) => {
  const errorLog = `
=== GLOBAL SERVER ERROR ===
Time: ${new Date().toISOString()}
Error Message: ${err.message}
Error Stack: ${err.stack}
URL: ${req.originalUrl}
Method: ${req.method}
===========================
`;
  // Write to a different log file to be safe, or same one
  try {
    fs.appendFileSync('backend_errors.log', errorLog);
  } catch (e) {
    console.error("Failed to write to log file:", e);
  }

  console.error("=== GLOBAL SERVER ERROR ===");
  console.error(err);

  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: err.message
  });
});

// ✅ Start the Server
const PORT = process.env.PORT || 5001; // ✅ Changed to 5001 to avoid conflict with coworking-backend
app.listen(PORT, () => {
  console.log(`\n\n===============================================================`);
  console.log(`🚀 ATTENDANCE BACKEND IS RUNNING on port ${PORT}`);
  console.log(`===============================================================\n\n`);
  console.log(`📍 Frontend: http://localhost:3000`);
});