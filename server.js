// ✅ Load environment variables
require("dotenv").config();

// ✅ Import required packages
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// ✅ Initialize Express app
const app = express();

// ✅ Middleware setup
const allowedOrigins = ["http://localhost:5173", "http://localhost:3000"];

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

// ✅ Connect MongoDB
mongoose
  .connect(process.env.MONGO_URI, { dbName: "attendanceDB" })
  .then(() => console.log("✅ MongoDB Connected Successfully!"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// ✅ ROUTES
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/employees", require("./routes/employee.routes"));
app.use("/api/leaves", require("./routes/leave.routes"));
app.use("/api/department", require("./routes/department.routes"));
app.use("/api/roles", require("./routes/role.routes"));
app.use("/api/shifts", require("./routes/shift.routes"));
app.use("/api/attendance", require("./routes/attendance.routes")); // ✅ Attendance routes
app.use("/api/admin", require("./routes/adminroutes")); // ✅ Attendance routes


// ✅ Default test route
app.get("/", (req, res) => {
  res.json({
    message: "✅ Attendance API is running successfully!",
    availableRoutes: {
      auth: "/api/auth",
      employees: "/api/employees",
      admin: "/api/admin",
      leaves: "/api/leaves",
      department: "/api/department",
      roles: "/api/roles",
      shifts: "/api/shifts",
      attendance: {
        mark: "POST /api/attendance",
        get: "GET /api/attendance/:employeeId/:date",
        employee: "GET /api/attendance/employee/:employeeId"
      }
    },
  });
});

// ✅ Start the Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Mark attendance: POST http://localhost:${PORT}/api/attendance`);
  console.log(`📍 Frontend: http://localhost:3000`);
});