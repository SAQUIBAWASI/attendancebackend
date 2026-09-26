const WeekOff = require("./WeekOff");
const Attendance = require("./Attendance");
const Shift = require("./Shift");
const Leave = require("./Leave");

const WEEK_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_MAP = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6
};

const toDateKey = (value) => {
  if (!value) return "";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDayLabel = (dateStr) => {
  const date = new Date(`${dateStr}T00:00:00`);
  return date.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });
};

const resolveDayName = (dayName) => {
  if (!dayName) return "";
  if (dayName.length === 3) {
    return WEEK_DAYS.find((d) => d.startsWith(dayName)) || dayName;
  }
  return dayName;
};

const calculateDatesFromPattern = (record, targetMonth = null) => {
  if (!record) return [];

  const hasSpecificMonths = Array.isArray(record.selectedMonths) && record.selectedMonths.length > 0;

  if (targetMonth && hasSpecificMonths && !record.selectedMonths.includes(targetMonth)) {
    if (Array.isArray(record.specificDates)) {
      return record.specificDates.filter((d) => d.startsWith(targetMonth));
    }
    return [];
  }

  const calculatedDates = [];
  let monthsToProcess = [];

  if (targetMonth) {
    monthsToProcess = [targetMonth];
  } else if (hasSpecificMonths) {
    monthsToProcess = record.selectedMonths;
  } else {
    const now = new Date();
    monthsToProcess = [`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`];
  }

  if ((record.selectionMode === "weekly" || !record.selectionMode) && record.weekOffDays && record.weekOffDays.length > 0) {
    monthsToProcess.forEach((monthVal) => {
      if (hasSpecificMonths && !record.selectedMonths.includes(monthVal)) return;
      const [year, month] = monthVal.split("-").map(Number);
      const daysInMonth = new Date(year, month, 0).getDate();

      record.weekOffDays.forEach((dayName) => {
        const targetDay = DAY_MAP[resolveDayName(dayName)];
        if (targetDay === undefined) return;
        for (let day = 1; day <= daysInMonth; day++) {
          const date = new Date(year, month - 1, day);
          if (date.getDay() === targetDay) {
            calculatedDates.push(`${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`);
          }
        }
      });
    });
  }

  if (record.selectionMode === "weekwise" && record.weekwiseSelection && record.weekwiseSelection.length > 0) {
    monthsToProcess.forEach((monthVal) => {
      if (hasSpecificMonths && !record.selectedMonths.includes(monthVal)) return;
      const [year, month] = monthVal.split("-").map(Number);
      const daysInMonth = new Date(year, month, 0).getDate();

      record.weekwiseSelection.forEach(({ week, day }) => {
        const targetDay = DAY_MAP[resolveDayName(day)];
        if (targetDay === undefined) return;
        const firstDayOfMonth = new Date(year, month - 1, 1);
        const firstDayOffset = (targetDay - firstDayOfMonth.getDay() + 7) % 7;
        const targetDate = 1 + firstDayOffset + (week - 1) * 7;
        if (targetDate <= daysInMonth && targetDate > 0) {
          calculatedDates.push(`${year}-${String(month).padStart(2, "0")}-${String(targetDate).padStart(2, "0")}`);
        }
      });
    });
  }

  if (Array.isArray(record.specificDates) && record.specificDates.length > 0) {
    record.specificDates.forEach((dateStr) => {
      const dateMonth = dateStr.slice(0, 7);
      if (monthsToProcess.includes(dateMonth)) {
        calculatedDates.push(dateStr);
      }
    });
  }

  return Array.from(new Set(calculatedDates)).sort();
};

const getEmployeeWeekOffRecord = (records, employeeId) => {
  if (!employeeId || !Array.isArray(records)) return null;
  const empId = String(employeeId);

  const specificRecord = records.find((rec) =>
    !rec.selectAllEmployees &&
    rec.selectedEmployees?.some((e) => String(e.employeeId) === empId || String(e._id) === empId)
  );
  if (specificRecord) return specificRecord;

  return records.find((rec) => rec.selectAllEmployees === true) || null;
};

const getWorkedWeekOffCombOffOptions = async (employeeId, month) => {
  const now = new Date();
  const targetMonth = month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const [year, monthNum] = targetMonth.split("-").map(Number);
  const startDate = new Date(year, monthNum - 1, 1);
  const endDate = new Date(year, monthNum, 0, 23, 59, 59);

  const [weekOffRecords, attendanceRecords, shiftAssignment, usedLeaves] = await Promise.all([
    WeekOff.find().sort({ createdAt: -1 }),
    Attendance.find({
      employeeId,
      checkInTime: { $gte: startDate, $lte: endDate }
    }),
    Shift.findOne({
      $or: [
        { "employeeAssignment.employeeId": employeeId },
        { employeeId }
      ]
    }),
    Leave.find({
      employeeId,
      $or: [
        { isCombOff: true },
        { leaveType: { $regex: /comb|comp.?off/i } }
      ],
      status: { $nin: ["rejected"] }
    })
  ]);

  const weekOffRecord = getEmployeeWeekOffRecord(weekOffRecords, employeeId);
  const weekOffDates = calculateDatesFromPattern(weekOffRecord, targetMonth);
  const hasWorkAssignment = !!shiftAssignment;

  const workedMap = new Map();
  attendanceRecords.forEach((rec) => {
    const key = toDateKey(rec.checkInTime);
    if (key) workedMap.set(key, rec);
  });

  const usedWorkDates = new Set(
    usedLeaves
      .map((leave) => toDateKey(leave.combOffWorkDate || leave.startDate))
      .filter(Boolean)
  );

  const allWeekOffs = weekOffDates.map((dateStr) => {
    const att = workedMap.get(dateStr);
    const worked = Boolean(att && att.checkInTime);
    return {
      date: dateStr,
      day: formatDayLabel(dateStr),
      isWeekOff: true,
      hasWorkAssignment,
      worked,
      eligible: worked,
      used: usedWorkDates.has(dateStr),
      totalHours: att?.totalHours || att?.workingHours || 8,
      extraHours: att?.otHours || 0,
      status: usedWorkDates.has(dateStr) ? "used" : worked ? "active" : "not-worked",
      source: "weekOffWork"
    };
  });

  const options = allWeekOffs.filter((item) => item.eligible && !item.used);

  return {
    employeeId,
    month: targetMonth,
    weekOffDates,
    hasWorkAssignment,
    hasWeekOffPolicy: Boolean(weekOffRecord),
    options,
    allWeekOffs,
    workedCount: allWeekOffs.filter((item) => item.worked).length
  };
};

module.exports = {
  toDateKey,
  calculateDatesFromPattern,
  getEmployeeWeekOffRecord,
  getWorkedWeekOffCombOffOptions
};
