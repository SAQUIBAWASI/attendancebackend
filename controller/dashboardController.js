const mongoose = require("mongoose");
const Employee = require("../models/Employee");
const Attendance = require("../models/Attendance");
const Shift = require("../models/Shift");


// ======================================================
// GET TOP PERFORMERS
// ======================================================

// ======================================================
// GET TOP PERFORMERS
// ======================================================

const getTopPerformers = async (req, res) => {
  try {
    const now = new Date();

    const month =
      Number(req.query.month) || now.getMonth() + 1;

    const year =
      Number(req.query.year) || now.getFullYear();

    // ==================================================
    // MONTH DATE RANGE
    // ==================================================

    const startDate = new Date(
      year,
      month - 1,
      1
    );

    startDate.setHours(
      0,
      0,
      0,
      0
    );

    const endDate = new Date(
      year,
      month,
      0
    );

    endDate.setHours(
      23,
      59,
      59,
      999
    );

    const totalDays =
      new Date(
        year,
        month,
        0
      ).getDate();

    // ==================================================
    // GET ACTIVE EMPLOYEES
    // ==================================================

    const employees =
      await Employee.find({
        status: "active",
      }).lean();

    if (!employees.length) {
      return res.status(200).json({
        success: true,
        month,
        year,
        totalEmployees: 0,
        performers: [],
      });
    }

    // ==================================================
    // GET ATTENDANCE
    // ==================================================

    const attendanceRecords =
      await Attendance.find({
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      }).lean();

    // ==================================================
    // GET ACTIVE SHIFTS
    // ==================================================

    const shifts =
      await Shift.find({
        isActive: true,
      }).lean();

    // ==================================================
    // CALCULATE PERFORMANCE
    // ==================================================

    const performers =
      employees.map(
        (employee) => {

          const employeeId =
            String(
              employee.employeeId
            );

          // =============================================
          // EMPLOYEE ATTENDANCE
          // =============================================

          const employeeAttendance =
            attendanceRecords.filter(
              (attendance) =>
                String(
                  attendance.employeeId
                ) === employeeId
            );

          // =============================================
          // SHIFT HOURS
          // =============================================

          let shiftHours =
            Number(
              employee.shiftHours
            );

          if (
            !shiftHours ||
            shiftHours <= 0
          ) {
            shiftHours = 8;
          }

          // =============================================
          // WEEK OFF
          // =============================================

          let weekOffCount =
            Number(
              employee.weekOffCount
            ) || 0;

          weekOffCount =
            Math.min(
              Math.max(
                weekOffCount,
                0
              ),
              totalDays
            );

          // =============================================
          // EXPECTED WORKING DAYS
          // =============================================

          const expectedWorkingDays =
            Math.max(
              totalDays -
              weekOffCount,
              0
            );

          // =============================================
          // PRESENT DATES
          // =============================================

          const presentDates =
            new Set();

          employeeAttendance.forEach(
            (attendance) => {

              if (
                attendance.checkInTime ||
                attendance.checkOutTime ||
                attendance.status ===
                  "checked-in" ||
                attendance.status ===
                  "checked-out" ||
                attendance.status ===
                  "on-break"
              ) {

                const attendanceDate =
                  new Date(
                    attendance.checkInTime ||
                    attendance.checkOutTime ||
                    attendance.createdAt
                  );

                const dateKey =
                  `${attendanceDate.getFullYear()}-${String(
                    attendanceDate.getMonth() + 1
                  ).padStart(2, "0")}-${String(
                    attendanceDate.getDate()
                  ).padStart(2, "0")}`;

                presentDates.add(
                  dateKey
                );
              }
            }
          );

          const presentDays =
            presentDates.size;

          // =============================================
          // ABSENT DAYS
          // =============================================

          const absentDays =
            Math.max(
              expectedWorkingDays -
              presentDays,
              0
            );

          // =============================================
          // ATTENDANCE SCORE
          // =============================================

          let workingDaysScore = 0;

          if (
            expectedWorkingDays > 0
          ) {

            workingDaysScore =
              (
                presentDays /
                expectedWorkingDays
              ) * 100;
          }

          workingDaysScore =
            Math.min(
              Math.max(
                workingDaysScore,
                0
              ),
              100
            );

          // =============================================
          // ACTUAL WORKING HOURS
          // =============================================

          let actualWorkingHours = 0;

          employeeAttendance.forEach(
            (attendance) => {

              actualWorkingHours +=
                Number(
                  attendance.workingHours
                ) || 0;
            }
          );

          // =============================================
          // EXPECTED WORKING HOURS
          // =============================================

          const expectedWorkingHours =
            expectedWorkingDays *
            shiftHours;

          // =============================================
          // WORKING HOURS SCORE
          // =============================================

          let workingHoursScore = 0;

          if (
            expectedWorkingHours > 0
          ) {

            workingHoursScore =
              (
                actualWorkingHours /
                expectedWorkingHours
              ) * 100;
          }

          workingHoursScore =
            Math.min(
              Math.max(
                workingHoursScore,
                0
              ),
              100
            );

          // =============================================
          // FIND ALL EMPLOYEE SHIFTS
          // =============================================

          const employeeShifts =
            shifts.filter(
              (shift) =>
                String(
                  shift.employeeAssignment
                    ?.employeeId
                ) === employeeId ||

                String(
                  shift.employeeId
                ) === employeeId
            );

          // =============================================
          // SHIFT TIME FUNCTION
          // =============================================

          const getShiftTimes =
            (shift) => {

              let startTime = null;
              let endTime = null;

              if (!shift) {
                return {
                  startTime,
                  endTime,
                };
              }

              // -----------------------------------------
              // New assignment structure
              // -----------------------------------------

              startTime =
                shift.employeeAssignment
                  ?.startTime ||
                null;

              endTime =
                shift.employeeAssignment
                  ?.endTime ||
                null;

              // -----------------------------------------
              // timeSlots
              // -----------------------------------------

              if (!startTime) {
                startTime =
                  shift.timeSlots?.[0]
                    ?.startTime ||
                  null;
              }

              if (!endTime) {
                endTime =
                  shift.timeSlots?.[0]
                    ?.endTime ||
                  null;
              }

              // -----------------------------------------
              // Legacy
              // -----------------------------------------

              if (!startTime) {
                startTime =
                  shift.startTime ||
                  null;
              }

              if (!endTime) {
                endTime =
                  shift.endTime ||
                  null;
              }

              return {
                startTime,
                endTime,
              };
            };

          // =============================================
          // DEFAULT SHIFT
          // =============================================

          const defaultShift =
            employeeShifts[0] ||
            null;

          const defaultShiftTimes =
            getShiftTimes(
              defaultShift
            );

          // =============================================
          // LATE COMING
          // =============================================

          let lateComingDays = 0;

          const lateComingDetails =
            [];

          const checkedLateDates =
            new Set();

          // =============================================
          // PROCESS EACH ATTENDANCE DATE
          // =============================================

          employeeAttendance.forEach(
            (attendance) => {

              if (
                !attendance.checkInTime
              ) {
                return;
              }

              const checkIn =
                new Date(
                  attendance.checkInTime
                );

              // -----------------------------------------
              // DATE KEY
              // -----------------------------------------

              const dateKey =
                `${checkIn.getFullYear()}-${String(
                  checkIn.getMonth() + 1
                ).padStart(2, "0")}-${String(
                  checkIn.getDate()
                ).padStart(2, "0")}`;

              // -----------------------------------------
              // DUPLICATE DATE
              // -----------------------------------------

              if (
                checkedLateDates.has(
                  dateKey
                )
              ) {
                return;
              }

              checkedLateDates.add(
                dateKey
              );

              // -----------------------------------------
              // FIND DATE-WISE SHIFT
              // -----------------------------------------

              let selectedShift =
                defaultShift;

              const matchingShifts =
                employeeShifts
                  .filter(
                    (shift) => {

                      const effectiveFrom =
                        shift
                          .employeeAssignment
                          ?.effectiveFrom;

                      if (
                        !effectiveFrom
                      ) {
                        return false;
                      }

                      const effectiveDate =
                        new Date(
                          effectiveFrom
                        );

                      return (
                        effectiveDate <=
                        checkIn
                      );
                    }
                  )
                  .sort(
                    (a, b) => {

                      const dateA =
                        new Date(
                          a
                            .employeeAssignment
                            ?.effectiveFrom ||
                          0
                        );

                      const dateB =
                        new Date(
                          b
                            .employeeAssignment
                            ?.effectiveFrom ||
                          0
                        );

                      return (
                        dateB -
                        dateA
                      );
                    }
                  );

              if (
                matchingShifts.length
              ) {
                selectedShift =
                  matchingShifts[0];
              }

              // -----------------------------------------
              // GET SHIFT TIME
              // -----------------------------------------

              const {
                startTime,
                endTime,
              } =
                getShiftTimes(
                  selectedShift
                );

              // -----------------------------------------
              // SHIFT NOT FOUND
              // -----------------------------------------

              if (!startTime) {

                console.log(
                  "⚠️ SHIFT START NOT FOUND:",
                  {
                    employeeId,
                    employeeName:
                      employee.name,
                    date:
                      dateKey,
                    selectedShift,
                  }
                );

                return;
              }

              // -----------------------------------------
              // PARSE SHIFT TIME
              // -----------------------------------------

              const timeParts =
                String(
                  startTime
                )
                  .split(":")
                  .map(Number);

              if (
                timeParts.length < 2 ||
                Number.isNaN(
                  timeParts[0]
                ) ||
                Number.isNaN(
                  timeParts[1]
                )
              ) {

                console.log(
                  "⚠️ INVALID SHIFT TIME:",
                  {
                    employeeId,
                    date:
                      dateKey,
                    startTime,
                  }
                );

                return;
              }

              // -----------------------------------------
              // SHIFT START
              // -----------------------------------------

              const shiftStart =
                new Date(checkIn);

              shiftStart.setHours(
                timeParts[0],
                timeParts[1],
                0,
                0
              );

              // -----------------------------------------
              // 5 MINUTE GRACE
              // -----------------------------------------

              const graceTime =
                new Date(
                  shiftStart.getTime() +
                  5 * 60 * 1000
                );

              // -----------------------------------------
              // LATE CHECK
              // -----------------------------------------

              if (
                checkIn >
                shiftStart
              ) {

                lateComingDays++;

                const lateByMinutes =
                  Math.floor(
                    (
                      checkIn -
                      shiftStart
                    ) / 60000
                  );

                const lateDetails = {

                  date:
                    dateKey,

                  shiftType:
                    selectedShift?.shiftType ||
                    employee.shiftType ||
                    null,

                  shiftName:
                    selectedShift?.shiftName ||
                    null,

                  shiftStartTime:
                    startTime,

                  shiftEndTime:
                    endTime,

                  shiftStart:
                    shiftStart.toISOString(),

                  graceTime:
                    graceTime.toISOString(),

                  checkInTime:
                    checkIn.toISOString(),

                  lateByMinutes,

                };

                lateComingDetails.push(
                  lateDetails
                );

                console.log(
                  "🔴 LATE COMING:",
                  {
                    employeeId,
                    employeeName:
                      employee.name,
                    ...lateDetails,
                  }
                );
              }
            }
          );

          // =============================================
          // LATE COMING SCORE
          // =============================================

          let lateComingScore = 100;

          if (
            expectedWorkingDays > 0
          ) {

            lateComingScore =
              (
                (
                  expectedWorkingDays -
                  lateComingDays
                ) /
                expectedWorkingDays
              ) * 100;
          }

          lateComingScore =
            Math.max(
              0,
              Math.min(
                lateComingScore,
                100
              )
            );

          // =============================================
          // TOTAL SCORE
          // =============================================

          const totalScore =
            lateComingScore +
            workingDaysScore +
            workingHoursScore;

          // =============================================
          // PERFORMANCE %
          // =============================================

          const performancePercentage =
            totalScore / 3;

          // =============================================
          // RETURN DATA
          // =============================================

          return {

            employeeId:
              employee._id,

            employeeCode:
              employee.employeeId,

            name:
              employee.name,

            email:
              employee.email,

            department:
              employee.department,

            // -----------------------------------------
            // SHIFT
            // -----------------------------------------

            shiftType:
              employee.shiftType,

            shiftHours,

            shiftStartTime:
              defaultShiftTimes.startTime,

            shiftEndTime:
              defaultShiftTimes.endTime,

            // -----------------------------------------
            // MONTH
            // -----------------------------------------

            month,
            year,

            totalDays,

            // -----------------------------------------
            // DAYS
            // -----------------------------------------

            weekOffCount,

            expectedWorkingDays,

            presentDays,

            absentDays,

            // -----------------------------------------
            // LATE
            // -----------------------------------------

            lateComingDays,

            lateComingDetails,

            // -----------------------------------------
            // HOURS
            // -----------------------------------------

            expectedWorkingHours:
              Number(
                expectedWorkingHours.toFixed(
                  2
                )
              ),

            actualWorkingHours:
              Number(
                actualWorkingHours.toFixed(
                  2
                )
              ),

            // -----------------------------------------
            // SCORES
            // -----------------------------------------

            lateComingScore:
              Number(
                lateComingScore.toFixed(
                  2
                )
              ),

            workingDaysScore:
              Number(
                workingDaysScore.toFixed(
                  2
                )
              ),

            workingHoursScore:
              Number(
                workingHoursScore.toFixed(
                  2
                )
              ),

            // -----------------------------------------
            // TOTAL
            // -----------------------------------------

            totalScore:
              Number(
                totalScore.toFixed(
                  2
                )
              ),

            performancePercentage:
              Number(
                performancePercentage.toFixed(
                  2
                )
              ),
          };
        }
      );

    // ==================================================
    // SORT
    // ==================================================

    performers.sort(
      (a, b) => {

        // 1️⃣ Highest performance
        if (
          b.performancePercentage !==
          a.performancePercentage
        ) {

          return (
            b.performancePercentage -
            a.performancePercentage
          );
        }

        // 2️⃣ Highest attendance
        if (
          b.presentDays !==
          a.presentDays
        ) {

          return (
            b.presentDays -
            a.presentDays
          );
        }

        // 3️⃣ Highest working hours
        if (
          b.actualWorkingHours !==
          a.actualWorkingHours
        ) {

          return (
            b.actualWorkingHours -
            a.actualWorkingHours
          );
        }

        // 4️⃣ Lowest late coming
        return (
          a.lateComingDays -
          b.lateComingDays
        );
      }
    );

    // ==================================================
    // TOP 5
    // ==================================================

    const topPerformers =
      performers.slice(
        0,
        5
      );

    // ==================================================
    // RESPONSE
    // ==================================================

    return res.status(200).json({

      success: true,

      month,
      year,

      totalEmployees:
        employees.length,

      performers:
        topPerformers,

    });

  } catch (error) {

    console.error(
      "Top Performers Error:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "Failed to calculate top performers",

      error:
        error.message,

    });
  }
};

// ======================================================
// GET ALL PERFORMERS
// ======================================================

const getAllPerformers = async (req, res) => {
  try {
    const now = new Date();

    const month =
      Number(req.query.month) || now.getMonth() + 1;

    const year =
      Number(req.query.year) || now.getFullYear();

    // ==================================================
    // MONTH DATE RANGE
    // ==================================================

    const startDate = new Date(year, month - 1, 1);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(year, month, 0);
    endDate.setHours(23, 59, 59, 999);

    const totalDays = new Date(
      year,
      month,
      0
    ).getDate();

    // ==================================================
    // GET ACTIVE EMPLOYEES
    // ==================================================

    const employees = await Employee.find({
      status: "active",
    }).lean();

    if (!employees.length) {
      return res.status(200).json({
        success: true,
        month,
        year,
        totalEmployees: 0,
        performers: [],
      });
    }

    // ==================================================
    // GET ATTENDANCE
    // ==================================================

    const attendanceRecords = await Attendance.find({
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    }).lean();

    // ==================================================
    // GET ACTIVE SHIFTS
    // ==================================================

    const shifts = await Shift.find({
      isActive: true,
    }).lean();

    // ==================================================
    // CALCULATE PERFORMANCE
    // ==================================================

    const performers = employees.map((employee) => {

      const employeeId =
        String(employee.employeeId);

      // =================================================
      // EMPLOYEE ATTENDANCE
      // =================================================

      const employeeAttendance =
        attendanceRecords.filter(
          (attendance) =>
            String(attendance.employeeId) ===
            employeeId
        );

      // =================================================
      // SHIFT HOURS
      // =================================================

      let shiftHours =
        Number(employee.shiftHours);

      if (!shiftHours || shiftHours <= 0) {
        shiftHours = 8;
      }

      // =================================================
      // WEEK OFF
      // =================================================

      let weekOffCount =
        Number(employee.weekOffCount) || 0;

      weekOffCount = Math.min(
        Math.max(
          weekOffCount,
          0
        ),
        totalDays
      );

      // =================================================
      // EXPECTED WORKING DAYS
      // =================================================

      const expectedWorkingDays =
        Math.max(
          totalDays -
          weekOffCount,
          0
        );

      // =================================================
      // PRESENT DATES
      // =================================================

      const presentDates = new Set();

      employeeAttendance.forEach(
        (attendance) => {

          if (
            attendance.checkInTime ||
            attendance.checkOutTime ||
            attendance.status === "checked-in" ||
            attendance.status === "checked-out" ||
            attendance.status === "on-break"
          ) {

            const attendanceDate =
              new Date(
                attendance.checkInTime ||
                attendance.checkOutTime ||
                attendance.createdAt
              );

            const dateKey =
              `${attendanceDate.getFullYear()}-${String(
                attendanceDate.getMonth() + 1
              ).padStart(2, "0")}-${String(
                attendanceDate.getDate()
              ).padStart(2, "0")}`;

            presentDates.add(dateKey);
          }
        }
      );

      const presentDays =
        presentDates.size;

      // =================================================
      // ABSENT DAYS
      // =================================================

      const absentDays =
        Math.max(
          expectedWorkingDays -
          presentDays,
          0
        );

      // =================================================
      // ATTENDANCE SCORE
      // =================================================

      let workingDaysScore = 0;

      if (
        expectedWorkingDays > 0
      ) {

        workingDaysScore =
          (
            presentDays /
            expectedWorkingDays
          ) * 100;
      }

      workingDaysScore =
        Math.min(
          Math.max(
            workingDaysScore,
            0
          ),
          100
        );

      // =================================================
      // ACTUAL WORKING HOURS
      // =================================================

      let actualWorkingHours = 0;

      employeeAttendance.forEach(
        (attendance) => {

          actualWorkingHours +=
            Number(
              attendance.workingHours
            ) || 0;
        }
      );

      // =================================================
      // EXPECTED WORKING HOURS
      // =================================================

      const expectedWorkingHours =
        expectedWorkingDays *
        shiftHours;

      // =================================================
      // WORKING HOURS SCORE
      // =================================================

      let workingHoursScore = 0;

      if (
        expectedWorkingHours > 0
      ) {

        workingHoursScore =
          (
            actualWorkingHours /
            expectedWorkingHours
          ) * 100;
      }

      workingHoursScore =
        Math.min(
          Math.max(
            workingHoursScore,
            0
          ),
          100
        );

      // =================================================
      // FIND EMPLOYEE SHIFTS
      // =================================================
      //
      // Employee ke liye jitne bhi shift records hain
      // unko collect karenge.
      //
      // =================================================

      const employeeShifts =
        shifts.filter(
          (shift) =>
            String(
              shift.employeeAssignment?.employeeId
            ) === employeeId ||
            String(
              shift.employeeId
            ) === employeeId
        );

      // =================================================
      // SHIFT DEBUG
      // =================================================

      console.log(
        "EMPLOYEE SHIFT DEBUG:",
        {
          employeeId,
          employeeName:
            employee.name,
          shiftCount:
            employeeShifts.length,
          shifts:
            employeeShifts.map(
              (shift) => ({
                shiftType:
                  shift.shiftType,

                shiftName:
                  shift.shiftName,

                assignment:
                  shift.employeeAssignment,

                timeSlots:
                  shift.timeSlots,
              })
            ),
        }
      );

      // =================================================
      // FUNCTION TO GET SHIFT TIME
      // =================================================

      const getShiftTimes = (shift) => {

        let startTime = null;
        let endTime = null;

        if (!shift) {
          return {
            startTime,
            endTime,
          };
        }

        // ---------------------------------------------
        // 1. Employee assignment
        // ---------------------------------------------

        startTime =
          shift.employeeAssignment?.startTime ||
          null;

        endTime =
          shift.employeeAssignment?.endTime ||
          null;

        // ---------------------------------------------
        // 2. Time slots
        // ---------------------------------------------

        if (!startTime) {

          startTime =
            shift.timeSlots?.[0]?.startTime ||
            null;
        }

        if (!endTime) {

          endTime =
            shift.timeSlots?.[0]?.endTime ||
            null;
        }

        // ---------------------------------------------
        // 3. Legacy
        // ---------------------------------------------

        if (!startTime) {
          startTime =
            shift.startTime ||
            null;
        }

        if (!endTime) {
          endTime =
            shift.endTime ||
            null;
        }

        return {
          startTime,
          endTime,
        };
      };

      // =================================================
      // GET EMPLOYEE DEFAULT SHIFT
      // =================================================

      let defaultShift =
        employeeShifts[0] || null;

      let defaultShiftTimes =
        getShiftTimes(
          defaultShift
        );

      // =================================================
      // DATE-WISE LATE DATA
      // =================================================

      let lateComingDays = 0;

      const lateComingDetails = [];

      // Prevent duplicate date
      const checkedLateDates =
        new Set();

      // =================================================
      // PROCESS EVERY ATTENDANCE
      // =================================================

      employeeAttendance.forEach(
        (attendance) => {

          // ---------------------------------------------
          // Need check-in
          // ---------------------------------------------

          if (
            !attendance.checkInTime
          ) {
            return;
          }

          const checkIn =
            new Date(
              attendance.checkInTime
            );

          // ---------------------------------------------
          // DATE KEY
          // ---------------------------------------------

          const dateKey =
            `${checkIn.getFullYear()}-${String(
              checkIn.getMonth() + 1
            ).padStart(2, "0")}-${String(
              checkIn.getDate()
            ).padStart(2, "0")}`;

          // ---------------------------------------------
          // DUPLICATE DATE
          // ---------------------------------------------

          if (
            checkedLateDates.has(
              dateKey
            )
          ) {
            return;
          }

          checkedLateDates.add(
            dateKey
          );

          // ---------------------------------------------
          // FIND SHIFT FOR DATE
          // ---------------------------------------------

          let selectedShift =
            defaultShift;

          // ---------------------------------------------
          // Check effectiveFrom
          // ---------------------------------------------

          const matchingShift =
            employeeShifts
              .filter((shift) => {

                const effectiveFrom =
                  shift.employeeAssignment
                    ?.effectiveFrom;

                if (!effectiveFrom) {
                  return false;
                }

                const effectiveDate =
                  new Date(
                    effectiveFrom
                  );

                return (
                  effectiveDate <=
                  checkIn
                );
              })
              .sort(
                (a, b) => {

                  const dateA =
                    new Date(
                      a.employeeAssignment
                        ?.effectiveFrom ||
                      0
                    );

                  const dateB =
                    new Date(
                      b.employeeAssignment
                        ?.effectiveFrom ||
                      0
                    );

                  return (
                    dateB -
                    dateA
                  );
                }
              );

          if (
            matchingShift.length > 0
          ) {

            selectedShift =
              matchingShift[0];
          }

          // ---------------------------------------------
          // GET SHIFT TIME
          // ---------------------------------------------

          const {
            startTime,
            endTime,
          } =
            getShiftTimes(
              selectedShift
            );

          // ---------------------------------------------
          // NO SHIFT START TIME
          // ---------------------------------------------

          if (!startTime) {

            console.log(
              "⚠️ SHIFT START NOT FOUND:",
              {
                employeeId,
                employeeName:
                  employee.name,
                date:
                  dateKey,
                selectedShift,
              }
            );

            return;
          }

          // ---------------------------------------------
          // TIME PARTS
          // ---------------------------------------------

          const timeParts =
            String(
              startTime
            )
              .split(":")
              .map(Number);

          if (
            timeParts.length < 2 ||
            Number.isNaN(
              timeParts[0]
            ) ||
            Number.isNaN(
              timeParts[1]
            )
          ) {

            console.log(
              "⚠️ INVALID SHIFT TIME:",
              {
                employeeId,
                date:
                  dateKey,
                startTime,
              }
            );

            return;
          }

          // ---------------------------------------------
          // SHIFT START DATE
          // ---------------------------------------------

          const shiftStart =
            new Date(checkIn);

          shiftStart.setHours(
            timeParts[0],
            timeParts[1],
            0,
            0
          );

          // ---------------------------------------------
          // 5 MINUTE GRACE
          // ---------------------------------------------

          const graceTime =
            new Date(
              shiftStart.getTime() +
              5 * 60 * 1000
            );

          // ---------------------------------------------
          // LATE CHECK
          // ---------------------------------------------

          if (
            checkIn >
            shiftStart
          ) {

            lateComingDays++;

            const lateByMinutes =
              Math.floor(
                (
                  checkIn -
                  shiftStart
                ) / 60000
              );

            const lateDetails = {

              date:
                dateKey,

              shiftType:
                selectedShift?.shiftType ||
                employee.shiftType ||
                null,

              shiftName:
                selectedShift?.shiftName ||
                null,

              shiftStartTime:
                startTime,

              shiftEndTime:
                endTime,

              shiftStart:
                shiftStart.toISOString(),

              graceTime:
                graceTime.toISOString(),

              checkInTime:
                checkIn.toISOString(),

              lateByMinutes,

            };

            lateComingDetails.push(
              lateDetails
            );

            // -------------------------------------------
            // DEBUG
            // -------------------------------------------

            console.log(
              "🔴 LATE COMING:",
              {
                employeeId,
                employeeName:
                  employee.name,
                ...lateDetails,
              }
            );
          }
        }
      );

      // =================================================
      // LATE COMING SCORE
      // =================================================

      let lateComingScore = 100;

      if (
        expectedWorkingDays > 0
      ) {

        lateComingScore =
          (
            (
              expectedWorkingDays -
              lateComingDays
            ) /
            expectedWorkingDays
          ) * 100;
      }

      lateComingScore =
        Math.max(
          0,
          Math.min(
            lateComingScore,
            100
          )
        );

      // =================================================
      // TOTAL SCORE
      // =================================================

      const totalScore =
        lateComingScore +
        workingDaysScore +
        workingHoursScore;

      // =================================================
      // FINAL PERFORMANCE
      // =================================================

      const performancePercentage =
        totalScore / 3;

      // =================================================
      // RETURN EMPLOYEE
      // =================================================

      return {

        employeeId:
          employee._id,

        employeeCode:
          employee.employeeId,

        name:
          employee.name,

        email:
          employee.email,

        department:
          employee.department,

        // ---------------------------------------------
        // SHIFT
        // ---------------------------------------------

        shiftType:
          employee.shiftType,

        shiftHours,

        shiftStartTime:
          defaultShiftTimes.startTime,

        shiftEndTime:
          defaultShiftTimes.endTime,

        // ---------------------------------------------
        // MONTH
        // ---------------------------------------------

        month,
        year,

        totalDays,

        // ---------------------------------------------
        // DAYS
        // ---------------------------------------------

        weekOffCount,

        expectedWorkingDays,

        presentDays,

        absentDays,

        // ---------------------------------------------
        // LATE
        // ---------------------------------------------

        lateComingDays,

        lateComingDetails,

        // ---------------------------------------------
        // HOURS
        // ---------------------------------------------

        expectedWorkingHours:
          Number(
            expectedWorkingHours.toFixed(
              2
            )
          ),

        actualWorkingHours:
          Number(
            actualWorkingHours.toFixed(
              2
            )
          ),

        // ---------------------------------------------
        // SCORES
        // ---------------------------------------------

        lateComingScore:
          Number(
            lateComingScore.toFixed(
              2
            )
          ),

        workingDaysScore:
          Number(
            workingDaysScore.toFixed(
              2
            )
          ),

        workingHoursScore:
          Number(
            workingHoursScore.toFixed(
              2
            )
          ),

        // ---------------------------------------------
        // TOTAL
        // ---------------------------------------------

        totalScore:
          Number(
            totalScore.toFixed(
              2
            )
          ),

        performancePercentage:
          Number(
            performancePercentage.toFixed(
              2
            )
          ),
      };
    });

    // ==================================================
    // SORT
    // ==================================================

    performers.sort(
      (a, b) => {

        // 1️⃣ Performance
        if (
          b.performancePercentage !==
          a.performancePercentage
        ) {

          return (
            b.performancePercentage -
            a.performancePercentage
          );
        }

        // 2️⃣ Present Days
        if (
          b.presentDays !==
          a.presentDays
        ) {

          return (
            b.presentDays -
            a.presentDays
          );
        }

        // 3️⃣ Working Hours
        if (
          b.actualWorkingHours !==
          a.actualWorkingHours
        ) {

          return (
            b.actualWorkingHours -
            a.actualWorkingHours
          );
        }

        // 4️⃣ Lowest Late
        return (
          a.lateComingDays -
          b.lateComingDays
        );
      }
    );

    // ==================================================
    // RESPONSE
    // ==================================================

    return res.status(200).json({

      success: true,

      month,

      year,

      totalEmployees:
        employees.length,

      performers,

    });

  } catch (error) {

    console.error(
      "Get All Performers Error:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "Failed to get all performers",

      error:
        error.message,

    });
  }
};
// ======================================================
// DEPARTMENT PERFORMANCE
// ======================================================

const getDepartmentPerformance = async (req, res) => {
  try {
    const now = new Date();

    const month =
      Number(req.query.month) || now.getMonth() + 1;

    const year =
      Number(req.query.year) || now.getFullYear();

    // --------------------------------------------------
    // DATE RANGE
    // --------------------------------------------------

    const startDate = new Date(year, month - 1, 1);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(year, month, 0);
    endDate.setHours(23, 59, 59, 999);

    const totalDays = new Date(
      year,
      month,
      0
    ).getDate();

    // --------------------------------------------------
    // GET EMPLOYEES
    // --------------------------------------------------

    const employees = await Employee.find({
      status: "active",
    }).lean();

    // --------------------------------------------------
    // GET ATTENDANCE
    // --------------------------------------------------

    const attendanceRecords = await Attendance.find({
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    }).lean();

    // --------------------------------------------------
    // GET SHIFTS
    // --------------------------------------------------

    const shifts = await Shift.find({
      isActive: true,
    }).lean();

    // --------------------------------------------------
    // GROUP EMPLOYEES BY DEPARTMENT
    // --------------------------------------------------

    const departmentMap = {};

    employees.forEach((employee) => {
      const department =
        employee.department || "Other";

      if (!departmentMap[department]) {
        departmentMap[department] = [];
      }

      departmentMap[department].push(employee);
    });

    // --------------------------------------------------
    // CALCULATE DEPARTMENT PERFORMANCE
    // --------------------------------------------------

    const departmentPerformance =
      Object.entries(departmentMap).map(
        ([departmentName, departmentEmployees]) => {

          let totalDepartmentScore = 0;

          let totalDepartmentEmployees =
            departmentEmployees.length;

          let totalPresentDays = 0;

          let totalExpectedDays = 0;

          let totalActualHours = 0;

          let totalExpectedHours = 0;

          let totalLateDays = 0;

          // --------------------------------------------
          // EACH EMPLOYEE
          // --------------------------------------------

          departmentEmployees.forEach((employee) => {

            const employeeId =
              String(employee.employeeId);

            // Employee attendance
            const employeeAttendance =
              attendanceRecords.filter(
                (attendance) =>
                  String(attendance.employeeId) ===
                  employeeId
              );

            // ------------------------------------------
            // SHIFT HOURS
            // ------------------------------------------

            const shiftHours =
              Number(employee.shiftHours) > 0
                ? Number(employee.shiftHours)
                : 8;

            // ------------------------------------------
            // WEEK OFF
            // ------------------------------------------

            let weekOffCount =
              Number(employee.weekOffCount) || 0;

            weekOffCount = Math.min(
              Math.max(weekOffCount, 0),
              totalDays
            );

            // ------------------------------------------
            // EXPECTED WORKING DAYS
            // ------------------------------------------

            const expectedWorkingDays =
              Math.max(
                totalDays - weekOffCount,
                0
              );

            // ------------------------------------------
            // PRESENT DAYS
            // ------------------------------------------

            const presentDates = new Set();

            employeeAttendance.forEach(
              (attendance) => {

                if (
                  attendance.checkInTime ||
                  attendance.checkOutTime
                ) {
                  const date = new Date(
                    attendance.checkInTime ||
                    attendance.checkOutTime
                  );

                  const dateKey =
                    `${date.getFullYear()}-${String(
                      date.getMonth() + 1
                    ).padStart(2, "0")}-${String(
                      date.getDate()
                    ).padStart(2, "0")}`;

                  presentDates.add(dateKey);
                }
              }
            );

            const presentDays =
              presentDates.size;

            // ------------------------------------------
            // WORKING DAYS SCORE
            // ------------------------------------------

            let workingDaysScore = 0;

            if (expectedWorkingDays > 0) {
              workingDaysScore =
                (presentDays /
                  expectedWorkingDays) *
                100;
            }

            workingDaysScore =
              Math.min(
                workingDaysScore,
                100
              );

            // ------------------------------------------
            // ACTUAL WORKING HOURS
            // ------------------------------------------

            let actualWorkingHours = 0;

            employeeAttendance.forEach(
              (attendance) => {
                actualWorkingHours +=
                  Number(
                    attendance.workingHours
                  ) || 0;
              }
            );

            // ------------------------------------------
            // EXPECTED WORKING HOURS
            // ------------------------------------------

            const expectedWorkingHours =
              expectedWorkingDays *
              shiftHours;

            // ------------------------------------------
            // WORKING HOURS SCORE
            // ------------------------------------------

            let workingHoursScore = 0;

            if (expectedWorkingHours > 0) {
              workingHoursScore =
                (actualWorkingHours /
                  expectedWorkingHours) *
                100;
            }

            workingHoursScore =
              Math.min(
                workingHoursScore,
                100
              );

            // ------------------------------------------
            // FIND EMPLOYEE SHIFT
            // ------------------------------------------

            const employeeShift =
              shifts.find(
                (shift) =>
                  String(
                    shift.employeeAssignment
                      ?.employeeId
                  ) === employeeId ||
                  String(
                    shift.employeeId
                  ) === employeeId
              );

            let shiftStartTime = null;

            if (employeeShift) {
              shiftStartTime =
                employeeShift
                  .employeeAssignment
                  ?.startTime ||
                employeeShift.startTime ||
                null;
            }

            // ------------------------------------------
            // LATE COMING
            // ------------------------------------------

            let lateComingDays = 0;

            if (shiftStartTime) {

              employeeAttendance.forEach(
                (attendance) => {

                  if (
                    !attendance.checkInTime
                  ) {
                    return;
                  }

                  const checkIn =
                    new Date(
                      attendance.checkInTime
                    );

                  const timeParts =
                    shiftStartTime
                      .split(":")
                      .map(Number);

                  const shiftStart =
                    new Date(checkIn);

                  shiftStart.setHours(
                    timeParts[0] || 0,
                    timeParts[1] || 0,
                    0,
                    0
                  );

                  if (
                    checkIn > shiftStart
                  ) {
                    lateComingDays++;
                  }
                }
              );
            }

            // ------------------------------------------
            // LATE SCORE
            // ------------------------------------------

            let lateComingScore = 100;

            if (
              expectedWorkingDays > 0
            ) {
              lateComingScore =
                (
                  (
                    expectedWorkingDays -
                    lateComingDays
                  ) /
                  expectedWorkingDays
                ) *
                100;
            }

            lateComingScore =
              Math.max(
                0,
                Math.min(
                  lateComingScore,
                  100
                )
              );

            // ------------------------------------------
            // EMPLOYEE TOTAL SCORE
            // ------------------------------------------

            const employeeTotalScore =
              lateComingScore +
              workingDaysScore +
              workingHoursScore;

            const employeePercentage =
              employeeTotalScore / 3;

            // ------------------------------------------
            // DEPARTMENT TOTALS
            // ------------------------------------------

            totalDepartmentScore +=
              employeePercentage;

            totalPresentDays +=
              presentDays;

            totalExpectedDays +=
              expectedWorkingDays;

            totalActualHours +=
              actualWorkingHours;

            totalExpectedHours +=
              expectedWorkingHours;

            totalLateDays +=
              lateComingDays;
          });

          // --------------------------------------------
          // DEPARTMENT FINAL RATE
          // --------------------------------------------

          const departmentRate =
            totalDepartmentEmployees > 0
              ? totalDepartmentScore /
                totalDepartmentEmployees
              : 0;

          // --------------------------------------------
          // COLOR
          // --------------------------------------------

          let color = "#10b981";

          if (departmentRate >= 90) {
            color = "#10b981";
          } else if (departmentRate >= 75) {
            color = "#34d399";
          } else if (departmentRate >= 60) {
            color = "#facc15";
          } else {
            color = "#f97316";
          }

          return {
            name: departmentName,

            rate: Number(
              departmentRate.toFixed(2)
            ),

            color,

            employeeCount:
              totalDepartmentEmployees,

            presentDays:
              totalPresentDays,

            expectedWorkingDays:
              totalExpectedDays,

            actualWorkingHours:
              Number(
                totalActualHours.toFixed(2)
              ),

            expectedWorkingHours:
              Number(
                totalExpectedHours.toFixed(2)
              ),

            lateComingDays:
              totalLateDays,
          };
        }
      );

    // --------------------------------------------------
    // SORT HIGH → LOW
    // --------------------------------------------------

    departmentPerformance.sort(
      (a, b) => b.rate - a.rate
    );

    // --------------------------------------------------
    // RESPONSE
    // --------------------------------------------------

    return res.status(200).json({
      success: true,

      month,
      year,

      departmentPerformance,
    });

  } catch (error) {

    console.error(
      "Department Performance Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to calculate department performance",
      error: error.message,
    });
  }
};

// ======================================================
// GET ALL DEPARTMENTS
// ======================================================

const getAllDepartment = async (req, res) => {
  try {
    const departments = await Employee.distinct("department", {
      status: "active",
      department: {
        $exists: true,
        $ne: "",
        $ne: null,
      },
    });

    const allDepartments = departments
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));

    return res.status(200).json({
      success: true,
      totalDepartments: allDepartments.length,
      departments: allDepartments,
    });

  } catch (error) {
    console.error(
      "Get All Departments Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to get departments",
      error: error.message,
    });
  }
};

const getEmployeePerformance = async (req, res) => {
  try {
    const { employeeId } = req.params;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: "Employee ID is required",
      });
    }

    const now = new Date();

    const month =
      Number(req.query.month) || now.getMonth() + 1;

    const year =
      Number(req.query.year) || now.getFullYear();

    // ================================
    // DATE RANGE
    // ================================
    const startDate = new Date(year, month - 1, 1);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(year, month, 0);
    endDate.setHours(23, 59, 59, 999);

    const totalDays = new Date(
      year,
      month,
      0
    ).getDate();

    // ================================
    // FIND EMPLOYEE
    // Supports Mongo _id OR employeeId
    // ================================
    let employee = null;

    if (mongoose.Types.ObjectId.isValid(employeeId)) {
      employee = await Employee.findById(employeeId).lean();
    }

    if (!employee) {
      employee = await Employee.findOne({
        employeeId: employeeId,
      }).lean();
    }

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // ================================
    // ATTENDANCE
    // ================================
    const attendanceRecords = await Attendance.find({
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    }).lean();

    // ================================
    // SHIFTS
    // ================================
    const shifts = await Shift.find({
      isActive: true,
    }).lean();

    const employeeCode = String(
      employee.employeeId
    );

    const employeeMongoId = String(
      employee._id
    );

    // ================================
    // EMPLOYEE ATTENDANCE
    // ================================
    const employeeAttendance =
      attendanceRecords.filter((attendance) => {

        const attendanceEmployeeId =
          String(attendance.employeeId);

        return (
          attendanceEmployeeId === employeeCode ||
          attendanceEmployeeId === employeeMongoId
        );
      });

    // ================================
    // SHIFT HOURS
    // ================================
    let shiftHours =
      Number(employee.shiftHours);

    if (!shiftHours || shiftHours <= 0) {
      shiftHours = 8;
    }

    // ================================
    // WEEK OFF
    // ================================
    let weekOffCount =
      Number(employee.weekOffCount) || 0;

    weekOffCount = Math.min(
      Math.max(weekOffCount, 0),
      totalDays
    );

    // ================================
    // EXPECTED WORKING DAYS
    // ================================
    const expectedWorkingDays =
      Math.max(
        totalDays - weekOffCount,
        0
      );

    // ================================
    // PRESENT DAYS
    // ================================
    const presentDates = new Set();

    employeeAttendance.forEach(
      (attendance) => {

        if (
          attendance.checkInTime ||
          attendance.checkOutTime ||
          attendance.status === "checked-in" ||
          attendance.status === "checked-out" ||
          attendance.status === "on-break"
        ) {

          const attendanceDate =
            new Date(
              attendance.checkInTime ||
              attendance.checkOutTime ||
              attendance.createdAt
            );

          const dateKey =
            `${attendanceDate.getFullYear()}-${String(
              attendanceDate.getMonth() + 1
            ).padStart(2, "0")}-${String(
              attendanceDate.getDate()
            ).padStart(2, "0")}`;

          presentDates.add(dateKey);
        }
      }
    );

    const presentDays =
      presentDates.size;

    // ================================
    // ABSENT DAYS
    // ================================
    const absentDays =
      Math.max(
        expectedWorkingDays - presentDays,
        0
      );

    // ================================
    // ATTENDANCE SCORE
    // ================================
    let workingDaysScore = 0;

    if (expectedWorkingDays > 0) {
      workingDaysScore =
        (
          presentDays /
          expectedWorkingDays
        ) * 100;
    }

    workingDaysScore =
      Math.min(
        Math.max(
          workingDaysScore,
          0
        ),
        100
      );

    // ================================
    // ACTUAL WORKING HOURS
    // ================================
    let actualWorkingHours = 0;

    employeeAttendance.forEach(
      (attendance) => {
        actualWorkingHours +=
          Number(
            attendance.workingHours
          ) || 0;
      }
    );

    // ================================
    // EXPECTED WORKING HOURS
    // ================================
    const expectedWorkingHours =
      expectedWorkingDays *
      shiftHours;

    // ================================
    // WORKING HOURS SCORE
    // ================================
    let workingHoursScore = 0;

    if (expectedWorkingHours > 0) {
      workingHoursScore =
        (
          actualWorkingHours /
          expectedWorkingHours
        ) * 100;
    }

    workingHoursScore =
      Math.min(
        Math.max(
          workingHoursScore,
          0
        ),
        100
      );

    // ================================
    // FIND SHIFT
    // ================================
    const employeeShift =
      shifts.find(
        (shift) => {

          const assignedEmployee =
            String(
              shift.employeeAssignment
                ?.employeeId
            );

          const shiftEmployee =
            String(
              shift.employeeId
            );

          return (
            assignedEmployee ===
              employeeCode ||
            assignedEmployee ===
              employeeMongoId ||
            shiftEmployee ===
              employeeCode ||
            shiftEmployee ===
              employeeMongoId
          );
        }
      );

    // ================================
    // SHIFT START
    // ================================
    let shiftStartTime = null;

    if (employeeShift) {
      shiftStartTime =
        employeeShift
          .employeeAssignment
          ?.startTime ||
        employeeShift.startTime ||
        null;
    }

    // ================================
    // LATE COMING
    // ================================
    let lateComingDays = 0;

    const checkedLateDates =
      new Set();

    if (shiftStartTime) {

      employeeAttendance.forEach(
        (attendance) => {

          if (!attendance.checkInTime) {
            return;
          }

          const checkIn =
            new Date(
              attendance.checkInTime
            );

          const dateKey =
            `${checkIn.getFullYear()}-${String(
              checkIn.getMonth() + 1
            ).padStart(2, "0")}-${String(
              checkIn.getDate()
            ).padStart(2, "0")}`;

          if (
            checkedLateDates.has(
              dateKey
            )
          ) {
            return;
          }

          checkedLateDates.add(
            dateKey
          );

          const timeParts =
            String(
              shiftStartTime
            )
              .split(":")
              .map(Number);

          const shiftStart =
            new Date(checkIn);

          shiftStart.setHours(
            timeParts[0] || 0,
            timeParts[1] || 0,
            0,
            0
          );

          if (
            checkIn > shiftStart
          ) {
            lateComingDays++;
          }
        }
      );
    }

    // ================================
    // LATE SCORE
    // ================================
    let lateComingScore = 100;

    if (expectedWorkingDays > 0) {
      lateComingScore =
        (
          (
            expectedWorkingDays -
            lateComingDays
          ) /
          expectedWorkingDays
        ) * 100;
    }

    lateComingScore =
      Math.max(
        0,
        Math.min(
          lateComingScore,
          100
        )
      );

    // ================================
    // TOTAL SCORE
    // ================================
    const totalScore =
      lateComingScore +
      workingDaysScore +
      workingHoursScore;

    const performancePercentage =
      totalScore / 3;

    // ================================
    // RESPONSE
    // ================================
    return res.status(200).json({
      success: true,

      employee: {
        employeeId: employee._id,
        employeeCode: employee.employeeId,
        name: employee.name,
        email: employee.email,
        department: employee.department,
      },

      month,
      year,

      totalDays,

      weekOffCount,

      expectedWorkingDays,

      presentDays,

      absentDays,

      lateComingDays,

      expectedWorkingHours:
        Number(
          expectedWorkingHours.toFixed(2)
        ),

      actualWorkingHours:
        Number(
          actualWorkingHours.toFixed(2)
        ),

      lateComingScore:
        Number(
          lateComingScore.toFixed(2)
        ),

      workingDaysScore:
        Number(
          workingDaysScore.toFixed(2)
        ),

      workingHoursScore:
        Number(
          workingHoursScore.toFixed(2)
        ),

      totalScore:
        Number(
          totalScore.toFixed(2)
        ),

      performancePercentage:
        Number(
          performancePercentage.toFixed(2)
        ),

      shiftType:
        employee.shiftType,

      shiftHours,

      shiftStartTime,
    });

  } catch (error) {

    console.error(
      "Get Employee Performance Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch employee performance",
      error: error.message,
    });
  }
};

module.exports = {
  getTopPerformers,
  getAllPerformers,
  getDepartmentPerformance,
  getEmployeePerformance,
  getAllDepartment,
};