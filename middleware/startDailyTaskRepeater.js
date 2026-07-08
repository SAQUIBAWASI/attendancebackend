// jobs/dailyTaskRepeater.js
const cron = require('node-cron');
const mongoose = require('mongoose');
const Task = require('../models/Task');
const Employee = require('../models/Employee');
const TaskNotification = require('../models/TaskNotification');
const fs = require('fs');
const path = require('path');

// ─── Log file setup ───
const LOG_DIR = path.join(__dirname, '../logs');
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const logFile = path.join(LOG_DIR, 'daily-task-repeater.log');

// ─── Custom logger ───
const writeLog = (message, type = 'INFO') => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${type}] ${message}\n`;
  
  // Console log with colors
  const colors = {
    INFO: '\x1b[36m',    // Cyan
    SUCCESS: '\x1b[32m', // Green
    WARNING: '\x1b[33m', // Yellow
    ERROR: '\x1b[31m',   // Red
    SCHEDULE: '\x1b[35m' // Purple
  };
  
  const color = colors[type] || colors.INFO;
  console.log(`${color}${logMessage}\x1b[0m`);
  
  // Write to file
  try {
    fs.appendFileSync(logFile, logMessage);
  } catch (err) {
    console.error('Failed to write to log file:', err);
  }
};

/**
 * Daily Task Repeater Job
 * Runs every day at 12:00 AM (midnight) IST
 */
const startDailyTaskRepeater = () => {
  
  writeLog('========================================', 'INFO');
  writeLog('🔄 INITIALIZING DAILY TASK REPEATER JOB', 'INFO');
  writeLog('========================================', 'INFO');
  writeLog(`⏰ Job will run daily at 12:00 AM IST (${getNextRunTime()})`, 'SCHEDULE');
  
  // ─── Get next run time ───
  function getNextRunTime() {
    const now = new Date();
    const next = new Date(now);
    next.setHours(24, 0, 0, 0); // Next midnight
    if (now.getHours() >= 0 && now.getMinutes() > 0) {
      next.setDate(next.getDate() + 1);
    }
    return next.toLocaleString('en-IN', { 
      timeZone: 'Asia/Kolkata',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  // ─── Count daily tasks (runs on startup) ───
  const countDailyTasks = async () => {
    try {
      const count = await Task.countDocuments({
        frequency: { $in: ['Daily'] },
        status: { $in: ['Completed', 'Pending', 'In Progress'] }
      });
      
      const allDailyTasks = await Task.find({
        frequency: { $in: ['Daily'] },
        status: { $in: ['Completed', 'Pending', 'In Progress'] }
      }).select('taskName status priority createdAt');
      
      writeLog(`📊 CURRENT DAILY TASKS STATUS:`, 'INFO');
      writeLog(`   Total Daily Tasks: ${count}`, 'INFO');
      
      if (count > 0) {
        writeLog(`   📋 Task List:`, 'INFO');
        allDailyTasks.forEach((task, index) => {
          writeLog(`   ${index + 1}. "${task.taskName}" - Status: ${task.status} - Priority: ${task.priority}`, 'INFO');
        });
        
        writeLog(`   📅 Next execution: ${getNextRunTime()}`, 'SCHEDULE');
        writeLog(`   ⏳ Time remaining: ${getTimeRemaining()}`, 'SCHEDULE');
      } else {
        writeLog(`   ✅ No daily tasks found. Nothing to repeat.`, 'SUCCESS');
      }
      
      return { count, tasks: allDailyTasks };
    } catch (error) {
      writeLog(`❌ Error counting daily tasks: ${error.message}`, 'ERROR');
      return { count: 0, tasks: [] };
    }
  };

  // ─── Get time remaining until next run ───
  function getTimeRemaining() {
    const now = new Date();
    const next = new Date(now);
    next.setHours(24, 0, 0, 0);
    if (now.getHours() >= 0 && now.getMinutes() > 0) {
      next.setDate(next.getDate() + 1);
    }
    
    const diff = next - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return `${hours}h ${minutes}m ${seconds}s`;
  }

  // ─── Run initial count on startup ───
  setTimeout(async () => {
    await countDailyTasks();
  }, 3000);

  // ─── Schedule job to run at 12:00 AM every day ───
  cron.schedule('0 0 * * *', async () => {
    const startTime = new Date();
    writeLog('========================================', 'INFO');
    writeLog(`🔄 DAILY TASK REPEATER EXECUTING AT: ${startTime.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`, 'INFO');
    writeLog('========================================', 'INFO');
    
    try {
      // ─── Get daily tasks before repeating ───
      const dailyTasks = await Task.find({
        frequency: { $in: ['Daily'] },
        status: { $in: ['Completed', 'Pending', 'In Progress'] }
      }).populate('assignedTo', '_id fullName email');
      
      const totalTasks = dailyTasks.length;
      writeLog(`📋 Found ${totalTasks} daily tasks to process`, 'INFO');
      
      if (totalTasks === 0) {
        writeLog('📭 No daily tasks found. Nothing to repeat.', 'WARNING');
        return;
      }
      
      // ─── Log all tasks being processed ───
      writeLog(`📋 TASKS BEING PROCESSED:`, 'INFO');
      dailyTasks.forEach((task, index) => {
        const assignedCount = task.assignedTo ? task.assignedTo.length : 0;
        writeLog(`   ${index + 1}. "${task.taskName}" - Status: ${task.status} - Assigned To: ${assignedCount} employees`, 'INFO');
      });
      
      let createdCount = 0;
      let failedCount = 0;
      let skippedCount = 0;
      const createdTasks = [];
      const failedTasks = [];
      
      for (const originalTask of dailyTasks) {
        try {
          // ─── Check if task should be repeated ───
          const lastRepeat = await Task.findOne({
            taskName: originalTask.taskName,
            frequency: { $in: ['Daily'] },
            createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
          }).sort({ createdAt: -1 });
          
          // ─── Skip if already repeated today ───
          if (lastRepeat && lastRepeat._id.toString() !== originalTask._id.toString()) {
            writeLog(`   ⏭️ Skipping "${originalTask.taskName}" - Already repeated today`, 'WARNING');
            skippedCount++;
            continue;
          }
          
          const assignedEmployeeIds = originalTask.assignedTo || [];
          
          // ─── Create new task ───
          const newTaskData = {
            taskName: originalTask.taskName,
            title: originalTask.title || originalTask.taskName,
            description: originalTask.description || '',
            projectId: originalTask.projectId || null,
            createdBy: originalTask.createdBy,
            createdByType: originalTask.createdByType || 'admin',
            assignType: originalTask.assignType || 'DEPARTMENT',
            assignedTo: assignedEmployeeIds,
            department: originalTask.department,
            priority: originalTask.priority || 'Medium',
            frequency: ['Daily'],
            submitDate: getNewSubmitDate(originalTask.submitDate),
            voiceNote: originalTask.voiceNote || null,
            remark: originalTask.remark || '',
            subtasks: createFreshSubtasks(originalTask.subtasks),
            attachments: originalTask.attachments || [],
            employeeUpdates: [],
            expenses: [],
            progress: 0,
            status: 'Pending',
            reportedIssues: [],
          };
          
          const newTask = await Task.create(newTaskData);
          
          // ─── Send notifications ───
          if (assignedEmployeeIds && assignedEmployeeIds.length > 0) {
            const sender = await Employee.findById(originalTask.createdBy).select('name');
            const senderName = sender ? sender.name : 'Admin';
            
            const submitDateStr = newTask.submitDate ? ` by ${new Date(newTask.submitDate).toLocaleDateString('en-IN')}` : '';
            const priorityStr = newTask.priority ? ` (${newTask.priority} priority)` : '';
            
            const notifications = assignedEmployeeIds.map((empId) => ({
              recipient: empId,
              sender: originalTask.createdBy,
              type: 'task_assigned',
              message: `📋 Daily task repeated: "${newTask.taskName}"${priorityStr}. Please complete it${submitDateStr}.`,
              taskId: newTask._id,
              isRead: false,
              createdAt: new Date()
            }));
            
            if (notifications.length > 0) {
              await TaskNotification.insertMany(notifications);
              writeLog(`   📨 Sent ${notifications.length} notifications for "${newTask.taskName}"`, 'SUCCESS');
            }
          }
          
          createdCount++;
          createdTasks.push({
            name: newTask.taskName,
            id: newTask._id,
            assignedTo: assignedEmployeeIds.length
          });
          
          writeLog(`   ✅ Created: "${newTask.taskName}" (ID: ${newTask._id}) - Assigned to ${assignedEmployeeIds.length} employees`, 'SUCCESS');
          
        } catch (error) {
          failedCount++;
          failedTasks.push({
            name: originalTask.taskName,
            error: error.message
          });
          writeLog(`   ❌ Failed: "${originalTask.taskName}" - ${error.message}`, 'ERROR');
        }
      }
      
      // ─── Summary ───
      const endTime = new Date();
      const duration = (endTime - startTime) / 1000;
      
      writeLog('========================================', 'INFO');
      writeLog(`📊 DAILY TASK REPEATER SUMMARY`, 'INFO');
      writeLog('========================================', 'INFO');
      writeLog(`   ✅ Created: ${createdCount} tasks`, 'SUCCESS');
      writeLog(`   ❌ Failed: ${failedCount} tasks`, 'ERROR');
      writeLog(`   ⏭️ Skipped: ${skippedCount} tasks (already repeated today)`, 'WARNING');
      writeLog(`   ⏱️ Duration: ${duration.toFixed(2)} seconds`, 'INFO');
      writeLog(`   📅 Next run: ${getNextRunTime()}`, 'SCHEDULE');
      writeLog(`   ⏳ Time remaining: ${getTimeRemaining()}`, 'SCHEDULE');
      
      if (createdTasks.length > 0) {
        writeLog(`\n   ✅ SUCCESSFULLY CREATED TASKS:`, 'SUCCESS');
        createdTasks.forEach((task, index) => {
          writeLog(`   ${index + 1}. "${task.name}" - ID: ${task.id} - Assigned: ${task.assignedTo} employees`, 'SUCCESS');
        });
      }
      
      if (failedTasks.length > 0) {
        writeLog(`\n   ❌ FAILED TASKS:`, 'ERROR');
        failedTasks.forEach((task, index) => {
          writeLog(`   ${index + 1}. "${task.name}" - Error: ${task.error}`, 'ERROR');
        });
      }
      
      writeLog('========================================', 'INFO');
      writeLog(`✅ DAILY TASK REPEATER COMPLETED AT: ${endTime.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`, 'SUCCESS');
      writeLog('========================================\n', 'INFO');
      
    } catch (error) {
      writeLog(`❌ DAILY TASK REPEATER JOB ERROR: ${error.message}`, 'ERROR');
      writeLog(`   Stack: ${error.stack}`, 'ERROR');
    }
  }, {
    scheduled: true,
    timezone: 'Asia/Kolkata'
  });
  
  // ─── Also run once immediately on startup (for testing) ───
  setTimeout(async () => {
    writeLog('🔄 Running initial task check on startup...', 'INFO');
    await countDailyTasks();
  }, 5000);
  
  writeLog('✅ Daily Task Repeater Job initialized successfully!', 'SUCCESS');
};

// ─── Helper: Calculate new submit date ───
const getNewSubmitDate = (originalSubmitDate) => {
  if (!originalSubmitDate) return null;
  
  const today = new Date();
  today.setHours(23, 59, 0, 0);
  return today;
};

// ─── Helper: Create fresh subtasks ───
const createFreshSubtasks = (originalSubtasks) => {
  if (!originalSubtasks || originalSubtasks.length === 0) return [];
  
  return originalSubtasks.map(subtask => ({
    name: subtask.name || '',
    description: subtask.description || '',
    status: 'Pending',
    priority: subtask.priority || 'Medium',
    submitDate: subtask.submitDate ? getNewSubmitDate(subtask.submitDate) : null,
    submittedDate: null,
    _id: new mongoose.Types.ObjectId().toString()
  }));
};

module.exports = startDailyTaskRepeater;