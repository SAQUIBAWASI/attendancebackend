// // ✅ Load environment variables
// require("dotenv").config();

// // ============================================
// // 🔥 CRITICAL DNS FIX - MUST BE HERE (TOP)
// // ============================================
const dns = require("dns");

// Force Public DNS Servers
dns.setServers([
  "8.8.8.8",        // Google Primary
  "8.8.4.4",        // Google Secondary
  "1.1.1.1",        // Cloudflare
  "208.67.222.222"  // OpenDNS
]);

// // 🔥 Force IPv4 Lookup
// const originalLookup = dns.lookup;
// dns.lookup = (hostname, options, callback) => {
//   if (typeof options === "function") {
//     callback = options;
//     options = { family: 4, hints: dns.ADDRCONFIG };
//   } else {
//     options = options || {};
//     options.family = 4;
//     options.hints = dns.ADDRCONFIG;
//   }
//   return originalLookup(hostname, options, callback);
// };

// console.log("🔧 DNS Fix Applied");
// console.log("📡 DNS Servers:", dns.getServers());

// // ✅ Import required packages
// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const fs = require("fs");
// const path = require("path");

// // ✅ Initialize Express app
// const app = express();

// // ✅ Middleware setup
// const allowedOrigins = [
//   "http://localhost:5173",
//   "http://localhost:3000",
//   "http://localhost:3001",
//   "https://attendancefrontend.vercel.app",
//   "https://bm-frontend-lyart.vercel.app",
//   "https://www.timelyhealth.in",
//   "https://timelyhealth.in"
// ];

// app.use(
//   cors({
//     origin: function (origin, callback) {
//       if (!origin) return callback(null, true);
//       if (allowedOrigins.includes(origin)) {
//         return callback(null, true);
//       } else {
//         return callback(new Error("Not allowed by CORS"));
//       }
//     },
//     credentials: true,
//   })
// );

// app.use(express.json({ limit: "10mb" }));
// app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// // 🔍 DEBUG: Log all requests
// app.use((req, res, next) => {
//   console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
//   next();
// });

// // ✅ Serve static files
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// // ============================================
// // ✅ MongoDB Connection (IMPROVED)
// // ============================================

// const MONGO_URI =
//   process.env.MONGO_URI ||
//   "mongodb://127.0.0.1:27017/attendanceDB";

// console.log("🔄 Connecting to MongoDB...");

// mongoose
//   .connect(MONGO_URI, {
//     dbName: "attendanceDB",
//     serverSelectionTimeoutMS: 30000,
//     connectTimeoutMS: 30000,
//     socketTimeoutMS: 60000,
//     family: 4, // Force IPv4
//     retryWrites: true,
//     retryReads: true,
//     maxPoolSize: 10,
//     minPoolSize: 1,
//     heartbeatFrequencyMS: 10000,
//   })
//   .then(() => {
//     console.log("✅ MongoDB Connected Successfully!");
//     console.log("📊 Database:", mongoose.connection.name);
//     console.log("🌐 Host:", mongoose.connection.host);
//   })
//   .catch((err) => {
//     console.error("❌ MongoDB Connection Error:", err.message);
//   });

// // ============================================
// // ✅ ROUTES
// // ============================================

// const applicationRoutes = require("./routes/jobApplication.routes");
// app.use("/api/applications", applicationRoutes);

// app.use("/api/jobs", require("./routes/jobPost.routes"));
// app.use("/api/auth", require("./routes/auth.routes"));
// app.use("/api/employees", require("./routes/employee.routes"));
// app.use("/api/leaves", require("./routes/leave.routes"));
// app.use("/api/shifts", require("./routes/shift.routes"));
// app.use("/api/admin", require("./routes/adminroutes"));
// app.use("/api/empl", require("./routes/empl.routers"));
// app.use("/api/candidate", require("./routes/candidate.routes"));
// app.use("/api/location", require("./routes/location.routes"));
// app.use("/api/attendance", require("./routes/attendance.routes"));
// app.use("/api/attendancesummary", require("./routes/attendancesummary.routes"));
// app.use("/api/salary", require("./routes/salary.routes"));
// app.use("/api/user-activity", require("./routes/userActivity.routes"));
// app.use("/api/expense", require("./routes/expense.routes"));
// app.use("/api/client-requests", require("./routes/clientRequest.routes"));
// app.use("/api/notifications", require("./routes/notification.routes"));
// app.use("/api/department", require("./routes/department.routes"));
// app.use("/api/roles", require("./routes/role.routes"));
// app.use("/api/permissions", require("./routes/permission.routes"));
// app.use("/api/attendance-edit-requests", require("./routes/attendanceEditRequest.routes"));
// app.use("/api/medical-certificates", require("./routes/medicalCertificate.routes"));
// // ✅ Client Requests
// app.use("/api/client-requests", require("./routes/clientRequest.routes"));

// // ============================================
// // ✅ Default Route
// // ============================================

// app.get("/", (req, res) => {
//   res.json({
//     message: "✅ Attendance API is running successfully!",
//     dnsServers: dns.getServers(),
//     dbStatus:
//       mongoose.connection.readyState === 1
//         ? "Connected"
//         : "Disconnected",
//   });
// });

// // ============================================
// // 🚨 404 Handler
// // ============================================

// app.use((req, res) => {
//   console.log(`[WARNING] Unhandled 404 Request: ${req.method} ${req.url}`);
//   res.status(404).json({ success: false, message: "Route not found [TAG_5001_B]" });
// });

// // ============================================
// // 🚨 Global Error Handler
// // ============================================

// app.use((err, req, res, next) => {
//   const errorLog = `
// === GLOBAL SERVER ERROR ===
// Time: ${new Date().toISOString()}
// Error: ${err.message}
// URL: ${req.originalUrl}
// Method: ${req.method}
// ===========================
// `;

//   try {
//     fs.appendFileSync("backend_errors.log", errorLog);
//   } catch (e) {
//     console.error("Log write failed:", e);
//   }

//   console.error(err);

//   res.status(500).json({
//     success: false,
//     message: "Internal Server Error",
//   });
// });

// // ============================================
// // ✅ Start Server
// // ============================================

// const PORT = process.env.PORT || 5001;

// app.listen(PORT, () => {
//   console.log("\n=================================================");
//   console.log(`🚀 ATTENDANCE BACKEND RUNNING ON PORT ${PORT}`);
//   console.log("=================================================\n");
//   console.log(`📡 DNS Servers: ${dns.getServers().join(", ")}`);
// });

// // ============================================
// // ✅ Graceful Shutdown
// // ============================================

// process.on("SIGINT", async () => {
//   console.log("\n👋 Shutting down gracefully...");
//   await mongoose.connection.close();
//   console.log("👋 MongoDB connection closed");
//   process.exit(0);
// });



// // ✅ Load environment variables
// require("dotenv").config();

// // ✅ Import required packages
// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const fs = require("fs");
// const path = require("path");

// // ✅ Import schemas for auto-convert
// const Employee = require("./models/Employee");
// const Attendance = require("./models/Attendance");
// const AttendanceSummary = require("./models/AttendanceSummary");

// const Leave = require("./models/Leave");
// const Shift = require("./models/Shift");
// const UserActivity = require("./models/UserActivity");
// const CompOff = require("./models/CompOff");
// const Expense = require("./models/Expense");
// const ExtraDayCompOff = require("./models/ExtraDayCompOff");
// const Permission = require("./models/Permission");
// const Notification = require("./models/Notification");

// // ✅ Initialize Express app
// const app = express();

// // ✅ Middleware setup
// const allowedOrigins = ["http://localhost:5173", "http://localhost:3000", "http://localhost:3001", 'https://attendancefrontend.vercel.app', "https://bm-frontend-lyart.vercel.app", "https://www.timelyhealth.in",
//   "https://timelyhealth.in"];

// app.use(
//   cors({
//     origin: function (origin, callback) {
//       if (!origin) return callback(null, true);
//       if (allowedOrigins.includes(origin)) {
//         return callback(null, true);
//       } else {
//         return callback(new Error("Not allowed by CORS"));
//       }
//     },
//     credentials: true,
//   })
// );

// app.use(express.json({ limit: "10mb" }));
// app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// // 🔍 DEBUG: Log all requests
// app.use((req, res, next) => {
//   console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
//   next();
// });

// // ✅ Serve static files (for uploaded images)
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// app.use("/uploads", (req, res) => {
//   res.status(404).send(`
//     <html>
//       <head><title>File Not Found</title></head>
//       <body style="font-family: sans-serif; text-align: center; padding: 50px;">
//         <h2>Document Not Found</h2>
//         <p>The requested file could not be found on the server. It may have been deleted or moved.</p>
//       </body>
//     </html>
//   `);
// });

// // ============================================
// // AUTO-CONVERT EMP → TH ON SERVER START
// // ============================================
// const convertEmployeeIdsToTH = async () => {
//   try {
//     console.log('\n🔄 ==========================================');
//     console.log('🔄 Starting EMP → TH Conversion (ALL COLLECTIONS)');
//     console.log('🔄 ==========================================\n');

//     const results = {
//       employees: { updated: [], errors: [], totalFound: 0 },
//       attendance: { updated: [], errors: [], totalFound: 0 },
//       attendanceSummary: { updated: [], errors: [], totalFound: 0 },
//       leaves: { updated: [], errors: [], totalFound: 0 },
//       shifts: { updated: [], errors: [], totalFound: 0 },
//       userActivity: { updated: [], errors: [], totalFound: 0 },
//       compOff: { updated: [], errors: [], totalFound: 0 },
//       expense: { updated: [], errors: [], totalFound: 0 },
//       extraDayCompOff: { updated: [], errors: [], totalFound: 0 },
//       permission: { updated: [], errors: [], totalFound: 0 },
//       notification: { updated: [], errors: [], totalFound: 0 }
//     };

//     // Helper function to update ONLY employeeId - NO VALIDATION
//     const updateCollection = async (model, collectionName, resultsObj, isUnique = true) => {
//       try {
//         console.log(`📋 Fetching ${collectionName} with EMP prefix...`);
//         const records = await model.find({ employeeId: { $regex: /^EMP/i } });
//         resultsObj.totalFound = records.length;
//         console.log(`   Found ${records.length} records in ${collectionName}\n`);

//         if (records.length === 0) return;

//         console.log(`   🔄 Converting ${collectionName}:`);

//         for (const record of records) {
//           try {
//             const oldId = record.employeeId;
//             const numPart = oldId.replace(/[^0-9]/g, '');
//             const newId = `TH${numPart}`;
            
//             let shouldSkip = false;
//             if (isUnique) {
//               const existing = await model.findOne({ employeeId: newId });
//               if (existing) {
//                 shouldSkip = true;
//                 resultsObj.errors.push({ oldId, newId, error: 'TH ID already exists' });
//                 console.log(`      ⚠️ ${oldId} → SKIPPED (${newId} already exists)`);
//               }
//             }

//             if (!shouldSkip) {
//               await model.updateOne(
//                 { _id: record._id },
//                 { $set: { employeeId: newId } }
//               );
//               resultsObj.updated.push({ oldId, newId });
//               console.log(`      ✅ ${oldId} → ${newId}`);
//             }
//           } catch (err) {
//             resultsObj.errors.push({ oldId: record.employeeId, error: err.message });
//             console.log(`      ❌ ${record.employeeId} → ERROR: ${err.message}`);
//           }
//         }
//         console.log(`   ✅ ${collectionName} conversion complete\n`);
//       } catch (error) {
//         console.log(`   ❌ Error fetching ${collectionName}:`, error.message);
//       }
//     };

//     // ============================================
//     // SPECIAL: SHIFT COLLECTION - employeeAssignment wala bhi convert
//     // ============================================
//     const updateShiftCollection = async () => {
//       try {
//         console.log(`📋 ===== SHIFTS COLLECTION (with employeeAssignment) =====`);
        
//         // ✅ Find shifts where employeeAssignment.employeeId starts with EMP
//         const shifts = await Shift.find({
//           'employeeAssignment.employeeId': { $regex: /^EMP/i }
//         });
        
//         results.shifts.totalFound = shifts.length;
//         console.log(`   Found ${shifts.length} shifts with employeeAssignment.employeeId having EMP prefix\n`);

//         if (shifts.length === 0) return;

//         console.log(`   🔄 Converting employeeAssignment.employeeId in Shifts:`);

//         for (const shift of shifts) {
//           try {
//             const oldId = shift.employeeAssignment.employeeId;
//             const numPart = oldId.replace(/[^0-9]/g, '');
//             const newId = `TH${numPart}`;
            
//             // Update nested field
//             await Shift.updateOne(
//               { _id: shift._id },
//               { $set: { 'employeeAssignment.employeeId': newId } }
//             );
            
//             results.shifts.updated.push({ oldId, newId, type: 'nested' });
//             console.log(`      ✅ ${oldId} → ${newId} (nested)`);
            
//           } catch (err) {
//             results.shifts.errors.push({ 
//               oldId: shift.employeeAssignment?.employeeId || 'unknown', 
//               error: err.message 
//             });
//             console.log(`      ❌ ${shift.employeeAssignment?.employeeId} → ERROR: ${err.message}`);
//           }
//         }
        
//         // ✅ Also convert direct employeeId in shifts (already handled but adding for safety)
//         console.log(`   📋 Also checking direct employeeId in Shifts...`);
//         const directShifts = await Shift.find({ employeeId: { $regex: /^EMP/i } });
        
//         for (const shift of directShifts) {
//           try {
//             const oldId = shift.employeeId;
//             const numPart = oldId.replace(/[^0-9]/g, '');
//             const newId = `TH${numPart}`;
            
//             await Shift.updateOne(
//               { _id: shift._id },
//               { $set: { employeeId: newId } }
//             );
            
//             // Check if already counted
//             const alreadyCounted = results.shifts.updated.some(u => u.oldId === oldId);
//             if (!alreadyCounted) {
//               results.shifts.updated.push({ oldId, newId, type: 'direct' });
//               console.log(`      ✅ ${oldId} → ${newId} (direct)`);
//             }
//           } catch (err) {
//             console.log(`      ❌ ${shift.employeeId} → ERROR: ${err.message}`);
//           }
//         }
        
//         console.log(`   ✅ Shifts conversion complete\n`);
//       } catch (error) {
//         console.log(`   ❌ Error fetching Shifts:`, error.message);
//       }
//     };

//     // ============================================
//     // 1️⃣ EMPLOYEE - UNIQUE
//     // ============================================
//     console.log('📋 ===== EMPLOYEE COLLECTION =====');
//     await updateCollection(Employee, 'Employees', results.employees, true);

//     // ============================================
//     // 2️⃣ ATTENDANCE - NOT UNIQUE
//     // ============================================
//     console.log('📋 ===== ATTENDANCE COLLECTION =====');
//     await updateCollection(Attendance, 'Attendance', results.attendance, false);

//     // ============================================
//     // 3️⃣ ATTENDANCE SUMMARY - NOT UNIQUE
//     // ============================================
//     console.log('📋 ===== ATTENDANCE SUMMARY COLLECTION =====');
//     await updateCollection(AttendanceSummary, 'AttendanceSummary', results.attendanceSummary, false);

//     // ============================================
//     // 4️⃣ LEAVES - NOT UNIQUE
//     // ============================================
//     console.log('📋 ===== LEAVES COLLECTION =====');
//     const Leave = require('./models/Leave');
//     await updateCollection(Leave, 'Leaves', results.leaves, false);

//     // ============================================
//     // 5️⃣ SHIFTS - SPECIAL (direct + nested)
//     // ============================================
//     await updateShiftCollection();

//     // ============================================
//     // 6️⃣ USER ACTIVITY - NOT UNIQUE
//     // ============================================
//     console.log('📋 ===== USER ACTIVITY COLLECTION =====');
//     const UserActivity = require('./models/UserActivity');
//     await updateCollection(UserActivity, 'UserActivity', results.userActivity, false);

//     // ============================================
//     // 7️⃣ COMP OFF - NOT UNIQUE
//     // ============================================
//     console.log('📋 ===== COMP OFF COLLECTION =====');
//     const CompOff = require('./models/CompOff');
//     await updateCollection(CompOff, 'CompOff', results.compOff, false);

//     // ============================================
//     // 8️⃣ EXPENSE - NOT UNIQUE
//     // ============================================
//     console.log('📋 ===== EXPENSE COLLECTION =====');
//     const Expense = require('./models/Expense');
//     await updateCollection(Expense, 'Expense', results.expense, false);

//     // ============================================
//     // 9️⃣ EXTRA DAY COMP OFF - NOT UNIQUE
//     // ============================================
//     console.log('📋 ===== EXTRA DAY COMP OFF COLLECTION =====');
//     const ExtraDayCompOff = require('./models/ExtraDayCompOff');
//     await updateCollection(ExtraDayCompOff, 'ExtraDayCompOff', results.extraDayCompOff, false);

//     // ============================================
//     // 🔟 PERMISSION - NOT UNIQUE
//     // ============================================
//     console.log('📋 ===== PERMISSION COLLECTION =====');
//     const Permission = require('./models/Permission');
//     await updateCollection(Permission, 'Permission', results.permission, false);

//     // ============================================
//     // 1️⃣1️⃣ NOTIFICATION - NOT UNIQUE
//     // ============================================
//     console.log('📋 ===== NOTIFICATION COLLECTION =====');
//     const Notification = require('./models/Notification');
//     await updateCollection(Notification, 'Notification', results.notification, false);

//     // ============================================
//     // 📊 FINAL SUMMARY
//     // ============================================
//     console.log('\n\n📊 ==========================================');
//     console.log('📊 CONVERSION SUMMARY');
//     console.log('📊 ==========================================');

//     const collections = [
//       { name: 'Employees', data: results.employees },
//       { name: 'Attendance', data: results.attendance },
//       { name: 'AttendanceSummary', data: results.attendanceSummary },
//       { name: 'Leaves', data: results.leaves },
//       { name: 'Shifts', data: results.shifts },
//       { name: 'UserActivity', data: results.userActivity },
//       { name: 'CompOff', data: results.compOff },
//       { name: 'Expense', data: results.expense },
//       { name: 'ExtraDayCompOff', data: results.extraDayCompOff },
//       { name: 'Permission', data: results.permission },
//       { name: 'Notification', data: results.notification }
//     ];

//     let totalFound = 0;
//     let totalUpdated = 0;
//     let totalErrors = 0;

//     console.log('\n📋 COLLECTION WISE SUMMARY:');
//     console.log('   ┌──────────────────┬─────────┬─────────┬────────┐');
//     console.log('   │ Collection       │ Found   │ Updated │ Errors │');
//     console.log('   ├──────────────────┼─────────┼─────────┼────────┤');

//     for (const col of collections) {
//       const found = col.data.totalFound || 0;
//       const updated = col.data.updated.length || 0;
//       const errors = col.data.errors.length || 0;
//       totalFound += found;
//       totalUpdated += updated;
//       totalErrors += errors;
      
//       const name = col.name.padEnd(16);
//       console.log(`   │ ${name} │ ${String(found).padStart(7)} │ ${String(updated).padStart(7)} │ ${String(errors).padStart(6)} │`);
//     }

//     console.log('   ├──────────────────┼─────────┼─────────┼────────┤');
//     console.log(`   │ TOTAL            │ ${String(totalFound).padStart(7)} │ ${String(totalUpdated).padStart(7)} │ ${String(totalErrors).padStart(6)} │`);
//     console.log('   └──────────────────┴─────────┴─────────┴────────┘');

//     console.log('\n📊 ==========================================');
//     console.log(`✅ Conversion Complete!`);
//     console.log(`   Total Found: ${totalFound} records`);
//     console.log(`   Updated: ${totalUpdated} records`);
//     console.log(`   Errors: ${totalErrors}`);
//     console.log('📊 ==========================================\n');

//   } catch (error) {
//     console.error('❌ Auto-conversion error:', error.message);
//     console.error(error.stack);
//   }
// };
// // ✅ Connect MongoDB
// mongoose
//   .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/attendanceDB", {
//     dbName: "attendanceDB",
//   })
//   .then(async () => {
//     console.log("✅ MongoDB Connected Successfully!");
    
//     // 🔄 Run auto-conversion after DB connection
//     await convertEmployeeIdsToTH();
    
//     // ✅ Start the Server after conversion
//     const PORT = process.env.PORT || 5001;
//     app.listen(PORT, () => {
//       console.log(`\n\n===============================================================`);
//       console.log(`🚀 ATTENDANCE BACKEND IS RUNNING on port ${PORT}`);
//       console.log(`===============================================================\n\n`);
//       console.log(`📍 Check-in: POST http://localhost:${PORT}/api/attendance/checkin`);
//       console.log(`📍 Check-out: POST http://localhost:${PORT}/api/attendance/checkout`);
//       console.log(`📍 View all: GET http://localhost:${PORT}/api/attendance/all`);
//       console.log(`📍 Comp-offs: GET http://localhost:${PORT}/api/leaves/comp-offs`);
//       console.log(`📍 Comp-off Requests: GET http://localhost:${PORT}/api/leaves/comp-off-requests`);
//       console.log(`📍 Frontend: http://localhost:3000`);
//     });
//   })
//   .catch((err) => {
//     console.error("❌ MongoDB Connection Error:", err);
//     process.exit(1);
//   });

// // ✅ ROUTES
// const applicationRoutes = require("./routes/jobApplication.routes");
// app.use("/api/applications", applicationRoutes);

// app.use("/api/jobs", require("./routes/jobPost.routes"));
// app.use("/api/auth", require("./routes/auth.routes"));
// app.use("/api/employees", require("./routes/employee.routes"));
// app.use("/api/leaves", require("./routes/leave.routes"));
// app.use("/api/shifts", require("./routes/shift.routes"));
// app.use("/api/admin", require("./routes/adminroutes"));
// app.use("/api/empl", require("./routes/empl.routers"));
// app.use("/api/candidate", require("./routes/candidate.routes"));
// app.use("/api/location", require("./routes/location.routes"));
// app.use("/api/attendance", require("./routes/attendance.routes"));
// app.use("/api/attendancesummary", require("./routes/attendancesummary.routes"));
// app.use("/api/salary", require("./routes/salary.routes"));
// app.use("/api/user-activity", require("./routes/userActivity.routes"));
// app.use("/api/expense", require("./routes/expense.routes"));
// app.use("/api/holidays", require("./routes/holiday.routes"));
// app.use("/api/client-requests", require("./routes/clientRequest.routes"));
// app.use("/api/notifications", require("./routes/notification.routes"));

// // ✅ Simple Test Route
// app.get("/api/test-application-routes", (req, res) => {
//   res.json({ message: "Job Application Routes are active!" });
// });

// app.get("/api/ping-debug", (req, res) => {
//   res.json({
//     message: "PING",
//     path: __dirname,
//     node_version: process.version,
//     uptime: process.uptime()
//   });
// });

// app.use("/api/department", require("./routes/department.routes"));
// app.use("/api/roles", require("./routes/role.routes"));
// app.use("/api/permissions", require("./routes/permission.routes"));
// app.use("/api/leaves", require("./routes/compOff.routes"));
// app.use("/api/medical-certificates", require("./routes/medicalCertificate.routes"));
// app.use("/api/attendance-edit-requests", require("./routes/attendanceEditRequest.routes"));
// app.use("/api/password-reset", require("./routes/passwordReset.routes"));

// // ✅ Default test route
// app.get("/", (req, res) => {
//   res.json({
//     message: "✅ Attendance API is running successfully!",
//     availableRoutes: {
//       auth: "/api/auth",
//       employees: "/api/employees",
//       admin: "/api/admin",
//       empl: "/api/empl",
//       leaves: "/api/leaves",
//       department: "/api/department",
//       roles: "/api/roles",
//       shifts: "/api/shifts",
//       location: "/api/location",
//       salary: "/api/salary",
//       holidays: "/api/holidays",
//       attendance: {
//         checkin: "POST /api/attendance/checkin",
//         checkout: "POST /api/attendance/checkout",
//         getAll: "GET /api/attendance/all",
//       },
//       compOffs: {
//         getAll: "GET /api/leaves/comp-offs",
//         createRequest: "POST /api/leaves/comp-off-requests",
//         update: "PUT /api/leaves/comp-offs/update/:id",
//         delete: "DELETE /api/leaves/comp-offs/:id"
//       }
//     },
//   });
// });

// // 🚨 Catch-all 404 Handler
// app.use((req, res, next) => {
//   console.log(`[WARNING] Unhandled 404 Request: ${req.method} ${req.url}`);
//   res.status(404).json({ success: false, message: "Route not found on server" });
// });

// // 🚨 Global Error Handler
// app.use((err, req, res, next) => {
//   const errorLog = `
// === GLOBAL SERVER ERROR ===
// Time: ${new Date().toISOString()}
// Error Message: ${err.message}
// Error Stack: ${err.stack}
// URL: ${req.originalUrl}
// Method: ${req.method}
// ===========================
// `;
//   try {
//     fs.appendFileSync('backend_errors.log', errorLog);
//   } catch (e) {
//     console.error("Failed to write to log file:", e);
//   }

//   console.error("=== GLOBAL SERVER ERROR ===");
//   console.error(err);

//   res.status(500).json({
//     success: false,
//     message: "Internal Server Error",
//     error: err.message
//   });
// });

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



// ✅ Initialize Express app
const app = express();

// ✅ Middleware setup
const allowedOrigins = ["http://localhost:5173", "http://localhost:3000", "http://localhost:3001", 'https://attendancefrontend.vercel.app', "https://bm-frontend-lyart.vercel.app", "https://www.timelyhealth.in",
  "https://timelyhealth.in", "http://62.72.29.27:3045", "https://taskmanagement.iryax.com"];

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
  .then(() => console.log("✅ MongoDB Connected Successfully!"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

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
app.use("/api/holidays", require("./routes/holiday.routes"));
app.use("/api/tasks", require("./routes/task.routes"));
app.use("/api/employee/tasks", require("./routes/employeeTask.routes"));

// ✅ Client Requests
app.use("/api/client-requests", require("./routes/clientRequest.routes"));

// ✅ Notifications
app.use("/api/notifications", require("./routes/notification.routes"));

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