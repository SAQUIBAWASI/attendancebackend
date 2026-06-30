// models/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // Kisko notification bhejna hai (Employee ID)
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
  },
  
  // Kisne bheja hai (Employee ID - jo task assign kar raha hai)
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
  },
  
  // Notification ka type
  type: {
    type: String,
    enum: ['task_assigned', 'task_updated', 'task_completed', 'task_overdue'],
    default: 'task_assigned'
  },
  
  // Notification ka message (simple text)
  message: {
    type: String,
  },
  
  // Task ID reference (optional)
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  },
  
  // Created at
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
notificationSchema.index({ recipient: 1, createdAt: -1 });

const Notification = mongoose.model('TaskNotification', notificationSchema);

module.exports = Notification;