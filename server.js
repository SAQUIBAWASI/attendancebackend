// ✅ Load environment variables
require("dotenv").config();

// ✅ Import packages
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// ✅ Create Express app
const app = express();

// ✅ MIDDLEWARE - ORDER MATTERS!

// 1️⃣ CORS
app.use(
  cors({
    origin: "http://localhost:5173", // frontend URL
    credentials: true,
  })
);

// 2️⃣ Body parsers (must come BEFORE routes)
app.use(express.json({ limit: "10mb" })); // JSON body parse
app.use(express.urlencoded({ extended: true, limit: "10mb" })); // URL-encoded parse

// 3️⃣ Debugging middleware (optional, very useful)
app.use((req, res, next) => {
  console.log(`🔍 ${req.method} ${req.url}`);
  console.log("📦 Content-Type:", req.headers["content-type"]);
  console.log("📊 Body length:", Object.keys(req.body).length);
  console.log("📝 Body content:", req.body);
  next();
});

// ✅ TEST ROUTE
app.post("/api/debug-test", (req, res) => {
  console.log("✅ Debug Test Body:", req.body);
  res.json({
    message: "Debug successful!",
    receivedBody: req.body,
    bodyKeys: Object.keys(req.body),
  });
});

// ✅ ROUTES (keep AFTER middleware)
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/employees", require("./routes/employee.routes"));
app.use("/api/attendance", require("./routes/attendance.routes"));
app.use("/api/leaves", require("./routes/leave.routes"));
app.use("/api/department", require("./routes/department.routes"));
app.use("/api/roles", require("./routes/role.routes"));
app.use("/api/shifts", require("./routes/shift.routes"));

// ✅ MongoDB Connection & Server Start
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected Successfully!");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
  });
