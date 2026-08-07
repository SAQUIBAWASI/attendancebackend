
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



// ✅ IMPORT DAILY TASK REPEATER JOB
const startDailyTaskRepeater = require("./middleware/startDailyTaskRepeater");

// ✅ Initialize Express app
const app = express();

// ✅ Middleware setup
const allowedOrigins = ["http://localhost:5173", "http://localhost:3000", "http://localhost:3001", 'https://attendancefrontend.vercel.app', "https://bm-frontend-lyart.vercel.app", "https://www.timelyhealth.in",
  "https://timelyhealth.in", "http://62.72.29.27:3045", "https://taskmanagement.iryax.com", "https://ingrainhire.ingrainsystems.com"];

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
    
    // ✅ START DAILY TASK REPEATER JOB AFTER DB CONNECTION
    console.log("\n📅 Starting Daily Task Repeater Job...");
    startDailyTaskRepeater();
    
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

// ✅ Client Requests
app.use("/api/client-requests", require("./routes/clientRequest.routes"));

// ✅ Notifications
app.use("/api/notifications", require("./routes/notification.routes"));


app.use("/api/teams", require("./routes/team.routes"));

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

app.use("/api/department", require("./routes/department.routes"));
app.use("/api/roles", require("./routes/role.routes"));
app.use("/api/permissions", require("./routes/permission.routes"));

// ✅ COMP-OFF ROUTES - Add this line (if not already present, remove duplicate)
app.use("/api/leaves", require("./routes/compOff.routes"));  // ✅ Comp-off routes

// ✅ Medical Certificates
app.use("/api/medical-certificates", require("./routes/medicalCertificate.routes"));

// ✅ Attendance Edit Requests
app.use("/api/attendance-edit-requests", require("./routes/attendanceEditRequest.routes"));

// ✅ Password Reset
app.use("/api/password-reset", require("./routes/passwordReset.routes"));

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
  console.log(`📍 Check-in: POST http://localhost:${PORT}/api/attendance/checkin`);
  console.log(`📍 Check-out: POST http://localhost:${PORT}/api/attendance/checkout`);
  console.log(`📍 View all: GET http://localhost:${PORT}/api/attendance/all`);
  console.log(`📍 Comp-offs: GET http://localhost:${PORT}/api/leaves/comp-offs`); // ✅ Added
  console.log(`📍 Comp-off Requests: GET http://localhost:${PORT}/api/leaves/comp-off-requests`);
  console.log(`📍 Frontend: http://localhost:3000`);
});