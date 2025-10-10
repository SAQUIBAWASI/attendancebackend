
const Attendance = require("../models/Attendance.js");


const router = express.Router();

// ✅ Mark attendance part start
router.post("/", async (req, res) => {
  try {
    const attendance = new Attendance(req.body);
    await attendance.save();
    res.json(attendance);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✅ Get all attendance records
router.get("/", async (req, res) => {
  try {
    const records = await Attendance.find().populate("employeeId");
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
