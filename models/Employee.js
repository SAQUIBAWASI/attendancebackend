// const mongoose = require("mongoose");

// const employeeSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   email: { type: String, required: true, required: true },
//   password: { type: String, required: true }, // new field
//   department: { type: String },
//   role: { type: String },
//   joinDate: { type: Date },
//   phone: { type: String },
//   address: { type: String },
//   employeeId: { type: String, unique: true, required: true }
// });

// module.exports = mongoose.model("Employee", employeeSchema);

// const mongoose = require("mongoose");

// const employeeSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   email: { type: String, required: true },
//   password: { type: String, required: true },
//   department: { type: String },
//   role: { type: String },
//   joinDate: { type: Date },
//   phone: { type: String },
//   address: { type: String },

//   // 🔥 Salary fields added
//   salaryPerMonth: { 
//     type: Number, 
//     default: 0 
//   },

//   shiftHours: { 
//     type: Number, 
//     default: 0 
//   },

//   weekOffPerMonth: {         // ⭐ ADDED NEW FIELD
//     type: Number,
//     default: 0
//   },
  
//   employeeId: { type: String, unique: true, required: true },

//   location: { 
//     type: mongoose.Schema.Types.ObjectId, 
//     ref: "Location", 
//     default: null 
//   }
// });

// module.exports = mongoose.model("Employee", employeeSchema);


// const mongoose = require("mongoose");

// const employeeSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   email: { type: String, required: true },
//   password: { type: String, required: true },
//   department: { type: String },
//   role: { type: String },
//   joinDate: { type: Date },
//   phone: { type: String },
//   address: { type: String },

//   // 🔥 Salary fields added
//   salaryPerMonth: { 
//     type: Number, 
//     default: 0 
//   },

//   shiftHours: { 
//     type: Number, 
//     default: 0 
//   },

//   weekOffPerMonth: {         // ⭐ ADDED NEW FIELD
//     type: Number,
//     default: 0
//   },
  
//   employeeId: { type: String, unique: true, required: true },

//   location: { 
//     type: mongoose.Schema.Types.ObjectId, 
//     ref: "Location", 
//     default: null 
//   },

//   // ✅ YAHAN PE YE LINE ADD KARDO (BAS ITNA KARDO)
//   shiftType: { 
//     type: String,
//     default: "A"  // Default value
//   }
// });

// module.exports = mongoose.model("Employee", employeeSchema);

// models/Employee.js
// const mongoose = require("mongoose");

// const employeeSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   email: { type: String, required: true },
//   password: { type: String, required: true },
  
//   // ✅ EXISTING FIELDS (कुछ employees में ये fields होंगे)
//   department: { type: String },
//   role: { type: String },
  
//   // ✅ NEW FIELDS (Reference के लिए)
//   departmentId: { 
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Department',
//     default: null
//   },
//   roleId: { 
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Role',
//     default: null
//   },
  
//   // ✅ REST OF YOUR FIELDS
//   employeeId: { type: String, unique: true, required: true },
//   joinDate: { type: Date },
//   phone: { type: String },
//   address: { type: String },
//   location: { type: mongoose.Schema.Types.ObjectId, ref: "Location", default: null },
//   shiftType: { type: String, default: "A" },
//   salaryPerMonth: { type: Number, default: 0 },
//   shiftHours: { type: Number, default: 0 },
//   weekOffPerMonth: { type: Number, default: 0 }

// }, { timestamps: true });

// module.exports = mongoose.model("Employee", employeeSchema);


// const mongoose = require("mongoose");

// const employeeSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   email: { type: String, required: true },
//   password: { type: String, required: true },
  
//   departmentId: { 
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Department',
//     default: null
//   },
//   roleId: { 
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Role',
//     default: null
//   },
//   department: { type: String },
//   role: { type: String },
  
//   employeeId: { type: String, unique: true, required: true },
//   joinDate: { type: Date },
//   dob: { type: Date },
  
//   // ✅ COMPLETE ADDRESS FIELDS
//   addressLine1: { type: String },
//   addressLine2: { type: String },
//   city: { type: String },
//   state: { type: String },
//   pinCode: { type: String },
//   country: { type: String, default: "India" },
  
//   // Keep for backward compatibility
//   address: { type: String },
//   phone: { type: String },
//   location: { type: mongoose.Schema.Types.ObjectId, ref: "Location", default: null },
//   shiftType: { type: String, default: "A" },
//   salaryPerMonth: { type: Number, default: 0 },
//   shiftHours: { type: Number, default: 0 },
//   weekOffPerMonth: { type: Number, default: 0 },
  
//   weekOffType: { 
//     type: String, 
//     enum: ['day', 'number', ''], 
//     default: '' 
//   },
//   weekOffDay: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', ''] },
//   weekOffCount: { type: Number, default: 0 },

//   // ✅ Status Field
//   status: { 
//     type: String, 
//     enum: ['active', 'inactive'], 
//     default: 'active' 
//   }

// }, { timestamps: true });

// module.exports = mongoose.model("Employee", employeeSchema);


// const mongoose = require("mongoose");

// const employeeSchema = new mongoose.Schema({
//   // Personal Info
//   name: { type: String, required: true },
//   firstName: { type: String },
//   lastName: { type: String },
//   email: { type: String, required: true },
//   password: { type: String, required: true },
//   phone: { type: String, required: true, unique: true },
//   alternateNumber: { type: String },
//   parentsName: { type: String },
  
//   // Bank & Statutory Details
//   bankName: { type: String, default: "" },
//   bankAccountNo: { type: String, default: "" },
//   ifscCode: { type: String, default: "" },
//   panNumber: { type: String, default: "" },
//   pfNumber: { type: String, default: "" },
//   uanNumber: { type: String, default: "" },
//   esicNumber: { type: String, default: "" },
//   branch: { type: String, default: "" },
  
//   // Employment Info
//   employeeId: { type: String, unique: true, required: true },
//   joinDate: { type: Date, required: true },
//   dob: { type: Date },
  
//   // Department & Role
//   departmentId: { 
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Department',
//     default: null
//   },
//   roleId: { 
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Role',
//     default: null
//   },
//   department: { type: String, required: true },
//   role: { type: String, required: true },
  
//   // Address
//   addressLine1: { type: String, required: true },
//   addressLine2: { type: String },
//   city: { type: String, required: true },
//   state: { type: String, required: true },
//   pinCode: { type: String, required: true },
//   country: { type: String, default: "India" },
  
//   // Location
//   location: { 
//     type: mongoose.Schema.Types.ObjectId, 
//     ref: "Location", 
//     default: null 
//   },
  
//   // Shift & Schedule
//   shiftType: { type: String, default: "A" },
//   shiftHours: { type: Number, default: 8 },
  
//   // Salary
//   salaryPerMonth: { type: Number, default: 0 },
//   ctc: { type: Number, default: 0 },
//   basicPay: { type: Number, default: 0 },
//   hra: { type: Number, default: 0 },
//   conveyanceAllowance: { type: Number, default: 0 },
//   medicalAllowance: { type: Number, default: 0 },
//   performanceAllowance: { type: Number, default: 0 },
//   specialAllowance: { type: Number, default: 0 },
//   ptax: { type: Number, default: 0 },
//   gmc: { type: String, default: "" },
//   gmcAmount: { type: Number, default: 0 },
//   otherDeductions: { type: Number, default: 0 },
//   weekOffPerMonth: { type: Number, default: 0 },
  
//   // Week Off
//   weekOffType: { 
//     type: String, 
//     enum: ['day', 'number', ''], 
//     default: '' 
//   },
//   weekOffCount: { type: Number, default: 0 },
  
//   // Status
//   status: { 
//     type: String, 
//     enum: ['active', 'inactive'], 
//     default: 'active' 
//   },
  
//   // Custom Leave Limits
//   maxCL: { type: Number, default: 1 },
//   maxSL: { type: Number, default: 1 },
//   maxEL: { type: Number, default: 12 },
//   maxCompOff: { type: Number, default: 0 },
  
//   // Permissions
//   permissions: {
//     type: [String],
//     default: []
//   },
  
//   // Timestamps
//   createdAt: { type: Date, default: Date.now },
//   updatedAt: { type: Date, default: Date.now }

// }, { timestamps: true });

// // Pre-save middleware to combine firstName and lastName
// employeeSchema.pre('save', function(next) {
//   if (this.firstName || this.lastName) {
//     this.name = `${this.firstName || ''} ${this.lastName || ''}`.trim();
//   }
//   next();
// });

// module.exports = mongoose.model("Employee", employeeSchema);


const mongoose = require("mongoose");

// Salary Increment History Schema
const salaryIncrementSchema = new mongoose.Schema({
  incrementType: { type: String, enum: ['percentage', 'amount'], required: true },
  incrementValue: { type: Number, required: true },
  oldSalaryPerMonth: { type: Number, default: 0 },
  oldBasicPay: { type: Number, default: 0 },
  oldHra: { type: Number, default: 0 },
  oldConveyanceAllowance: { type: Number, default: 0 },
  oldMedicalAllowance: { type: Number, default: 0 },
  oldPerformanceAllowance: { type: Number, default: 0 },
  oldSpecialAllowance: { type: Number, default: 0 },
  oldCtc: { type: Number, default: 0 },
  newSalaryPerMonth: { type: Number, default: 0 },
  newBasicPay: { type: Number, default: 0 },
  newHra: { type: Number, default: 0 },
  newConveyanceAllowance: { type: Number, default: 0 },
  newMedicalAllowance: { type: Number, default: 0 },
  newPerformanceAllowance: { type: Number, default: 0 },
  newSpecialAllowance: { type: Number, default: 0 },
  newCtc: { type: Number, default: 0 },
  effectiveFrom: { type: Date, required: true },
  effectiveMonth: { type: Number, required: true },
  effectiveYear: { type: Number, required: true },
  reason: { type: String, default: "" },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', default: null },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// Future Salary Increment Schema
const futureSalaryIncrementSchema = new mongoose.Schema({
  incrementType: { type: String, enum: ['percentage', 'amount'], required: true },
  incrementValue: { type: Number, required: true },
  effectiveFrom: { type: Date, required: true },
  effectiveMonth: { type: Number, required: true },
  effectiveYear: { type: Number, required: true },
  reason: { type: String, default: "" },
  isApplied: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Main Employee Schema
const employeeSchema = new mongoose.Schema({
  // Personal Info
  name: { type: String, required: true },
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String, required: true },
  password: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  alternateNumber: { type: String },
  parentsName: { type: String },
  
  // Bank & Statutory Details
  bankName: { type: String, default: "" },
  bankAccountNo: { type: String, default: "" },
  ifscCode: { type: String, default: "" },
  panNumber: { type: String, default: "" },
  pfNumber: { type: String, default: "" },
  uanNumber: { type: String, default: "" },
  esicNumber: { type: String, default: "" },
  branch: { type: String, default: "" },
  
  // Employment Info
  employeeId: { type: String, unique: true, required: true },
  joinDate: { type: Date, required: true },
  dob: { type: Date },



  assignedWorkingDays: {
    type: Number,
    default: 26,
  },

   // ============================================
// SALARY INCREMENTS ARRAY - WITHOUT approvedBy
// ============================================
salaryIncrements: {
  type: [{
    incrementType: { 
      type: String, 
      enum: ['percentage', 'amount'],
      required: true
    },
    incrementValue: { 
      type: Number, 
      required: true 
    },
    oldSalaryPerMonth: { 
      type: Number, 
      default: 0 
    },
    newSalaryPerMonth: { 
      type: Number, 
      default: 0 
    },
    effectiveFrom: { 
      type: Date, 
      required: true 
    },
    effectiveMonth: { 
      type: Number, 
      required: true 
    },
    effectiveYear: { 
      type: Number, 
      required: true 
    },
    reason: { 
      type: String, 
      default: "" 
    },
    createdAt: { 
      type: Date, 
      default: Date.now 
    }
  }],
  default: []
},

// Employee schema mein ye field add karo
extraDays: {
  type: [{
    date: { type: Date, required: true },
    day: { type: String },
    totalHours: { type: Number, default: 0 },
    extraHours: { type: Number, default: 0 },
    checkInTime: { type: Date },
    checkOutTime: { type: Date },
    isCompOffRequested: { type: Boolean, default: false },
    compOffRequestId: { type: mongoose.Schema.Types.ObjectId, ref: 'ExtraDayCompOff', default: null },
    month: { type: String }, // "2026-08"
    year: { type: Number },
    monthNumber: { type: Number },
    // ============================================
    // NEW FIELDS - ADD THESE
    // ============================================
    usedBefore: { 
      type: Date, 
      default: function() {
        const date = new Date(this.date);
        date.setMonth(date.getMonth() - 1); // Default 1 month before
        return date;
      }
    },
    status: { 
      type: String, 
      enum: ['active', 'expired', 'used'], 
      default: 'active' 
    }
  }],
  default: []
},
  
  // Department & Role
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
  roleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', default: null },
  department: { type: String, required: true },
  role: { type: String, required: true },
  
  // Address
  addressLine1: { type: String, required: true },
  addressLine2: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pinCode: { type: String, required: true },
  country: { type: String, default: "India" },
  
  // Location
  location: { type: mongoose.Schema.Types.ObjectId, ref: "Location", default: null },
  
  // Shift & Schedule
  shiftType: { type: String, default: "A" },
  shiftHours: { type: Number, default: 8 },
  
  // Current Salary
  salaryPerMonth: { type: Number, default: 0 },
  ctc: { type: Number, default: 0 },
  basicPay: { type: Number, default: 0 },
  hra: { type: Number, default: 0 },
  conveyanceAllowance: { type: Number, default: 0 },
  medicalAllowance: { type: Number, default: 0 },
  performanceAllowance: { type: Number, default: 0 },
  specialAllowance: { type: Number, default: 0 },
  ptax: { type: Number, default: 0 },
  gmc: { type: String, default: "" },
  gmcAmount: { type: Number, default: 0 },
  otherDeductions: { type: Number, default: 0 },
  weekOffPerMonth: { type: Number, default: 0 },
  
  // Week Off
  weekOffType: { type: String, enum: ['day', 'number', ''], default: '' },
  weekOffCount: { type: Number, default: 0 },
  
  // Status
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  
  // Custom Leave Limits
  maxCL: { type: Number, default: 1 },
  maxSL: { type: Number, default: 1 },
  maxEL: { type: Number, default: 12 },
  maxCompOff: { type: Number, default: 0 },
  
  // Permissions
  permissions: { type: [String], default: [] },
  
  // Password Reset
  resetPasswordToken: { type: String, default: null },
  resetPasswordExpires: { type: Date, default: null },
  
  // Salary Increment History
  salaryIncrements: [salaryIncrementSchema],
  futureIncrements: [futureSalaryIncrementSchema],
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }

}, { timestamps: true });

// Pre-save middleware to combine firstName and lastName
employeeSchema.pre('save', function(next) {
  if (this.firstName || this.lastName) {
    this.name = `${this.firstName || ''} ${this.lastName || ''}`.trim();
  }
  next();
});

// ==================== SALARY INCREMENT METHODS ====================

// Method to calculate and apply increment
employeeSchema.methods.applyIncrement = async function(incrementType, incrementValue, effectiveDate, reason = "", approvedBy = null, newComponents = null) {
  const effectiveFrom = new Date(effectiveDate);
  effectiveFrom.setHours(0, 0, 0, 0);
  const effectiveMonth = effectiveFrom.getMonth() + 1;
  const effectiveYear = effectiveFrom.getFullYear();
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  
  // Store old values
  const oldValues = {
    oldSalaryPerMonth: this.salaryPerMonth,
    oldBasicPay: this.basicPay,
    oldHra: this.hra,
    oldConveyanceAllowance: this.conveyanceAllowance,
    oldMedicalAllowance: this.medicalAllowance,
    oldPerformanceAllowance: this.performanceAllowance,
    oldSpecialAllowance: this.specialAllowance,
    oldCtc: this.ctc
  };
  
  // Use newComponents as base if provided (i.e. if user modified them before applying increment)
  const baseSalaryPerMonth = newComponents ? (newComponents.salaryPerMonth || this.salaryPerMonth) : this.salaryPerMonth;
  const baseBasicPay = newComponents ? (newComponents.basicPay || this.basicPay) : this.basicPay;
  const baseHra = newComponents ? (newComponents.hra || this.hra) : this.hra;
  const baseConveyanceAllowance = newComponents ? (newComponents.conveyanceAllowance || this.conveyanceAllowance) : this.conveyanceAllowance;
  const baseMedicalAllowance = newComponents ? (newComponents.medicalAllowance || this.medicalAllowance) : this.medicalAllowance;
  const basePerformanceAllowance = newComponents ? (newComponents.performanceAllowance || this.performanceAllowance) : this.performanceAllowance;
  const baseSpecialAllowance = newComponents ? (newComponents.specialAllowance || this.specialAllowance) : this.specialAllowance;
  const baseCtc = newComponents ? (newComponents.ctc || this.ctc) : this.ctc;

  // Calculate new values
  let newSalaryPerMonth = baseSalaryPerMonth;
  let newBasicPay = baseBasicPay;
  let newHra = baseHra;
  let newConveyanceAllowance = baseConveyanceAllowance;
  let newMedicalAllowance = baseMedicalAllowance;
  let newPerformanceAllowance = basePerformanceAllowance;
  let newSpecialAllowance = baseSpecialAllowance;
  let newCtc = baseCtc;
  
  if (incrementType === 'percentage') {
    const percentage = incrementValue / 100;
    newSalaryPerMonth = baseSalaryPerMonth * (1 + percentage);
    newBasicPay = baseBasicPay * (1 + percentage);
    newHra = baseHra * (1 + percentage);
    newConveyanceAllowance = baseConveyanceAllowance * (1 + percentage);
    newMedicalAllowance = baseMedicalAllowance * (1 + percentage);
    newPerformanceAllowance = basePerformanceAllowance * (1 + percentage);
    newSpecialAllowance = baseSpecialAllowance * (1 + percentage);
    newCtc = baseCtc * (1 + percentage);
  } else if (incrementType === 'amount') {
    newSalaryPerMonth = baseSalaryPerMonth + incrementValue;
    newCtc = baseCtc + incrementValue;
    if (baseSalaryPerMonth > 0) {
      const ratio = incrementValue / baseSalaryPerMonth;
      newBasicPay = baseBasicPay + (baseBasicPay * ratio);
      newHra = baseHra + (baseHra * ratio);
      newConveyanceAllowance = baseConveyanceAllowance + (baseConveyanceAllowance * ratio);
      newMedicalAllowance = baseMedicalAllowance + (baseMedicalAllowance * ratio);
      newPerformanceAllowance = basePerformanceAllowance + (basePerformanceAllowance * ratio);
      newSpecialAllowance = baseSpecialAllowance + (baseSpecialAllowance * ratio);
    } else {
      newBasicPay = incrementValue;
    }
  }
  
  // Create increment record
  const incrementRecord = {
    incrementType,
    incrementValue,
    ...oldValues,
    newSalaryPerMonth,
    newBasicPay,
    newHra,
    newConveyanceAllowance,
    newMedicalAllowance,
    newPerformanceAllowance,
    newSpecialAllowance,
    newCtc,
    effectiveFrom,
    effectiveMonth,
    effectiveYear,
    reason,
    approvedBy,
    isActive: true
  };
  
  // Add to history
  this.salaryIncrements.push(incrementRecord);
  
  // ✅ IMPORTANT: Always update current salary to latest increment value
  // This ensures salaryPerMonth always reflects the most recent increment
  this.salaryPerMonth = newSalaryPerMonth;
  this.basicPay = newBasicPay;
  this.hra = newHra;
  this.conveyanceAllowance = newConveyanceAllowance;
  this.medicalAllowance = newMedicalAllowance;
  this.performanceAllowance = newPerformanceAllowance;
  this.specialAllowance = newSpecialAllowance;
  this.ctc = newCtc;
  
  console.log(`✅ Increment applied: ${this.name} salary updated from ${oldValues.oldSalaryPerMonth} to ${newSalaryPerMonth}`);
  
  await this.save();
  return incrementRecord;
};

// Method to get salary for a specific date
employeeSchema.methods.getSalaryForDate = async function(date) {
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);
  
  // Get all active increments
  const activeIncrements = this.salaryIncrements.filter(inc => inc.isActive === true);
  
  // Find all increments applied strictly before the target month
  const targetMonthStr = targetDate.toISOString().slice(0, 7);
  const applicableIncrements = activeIncrements.filter(inc => {
    const incDate = new Date(inc.effectiveFrom);
    const incMonthStr = incDate.toISOString().slice(0, 7);
    return incMonthStr < targetMonthStr;
  });
  
  // Sort by effective date (latest first)
  applicableIncrements.sort((a, b) => new Date(b.effectiveFrom) - new Date(a.effectiveFrom));
  
  if (applicableIncrements.length > 0) {
    const latestIncrement = applicableIncrements[0];
    return {
      salaryPerMonth: latestIncrement.newSalaryPerMonth,
      basicPay: latestIncrement.newBasicPay,
      hra: latestIncrement.newHra,
      conveyanceAllowance: latestIncrement.newConveyanceAllowance,
      medicalAllowance: latestIncrement.newMedicalAllowance,
      performanceAllowance: latestIncrement.newPerformanceAllowance,
      specialAllowance: latestIncrement.newSpecialAllowance,
      ctc: latestIncrement.newCtc,
      effectiveFrom: latestIncrement.effectiveFrom
    };
  }
  
  // If no applicable increments but increments exist (meaning targetDate is before the first increment)
  if (activeIncrements.length > 0) {
    // Find the increment with the earliest effective date
    const earliestIncrement = [...activeIncrements].sort((a, b) => new Date(a.effectiveFrom).getTime() - new Date(b.effectiveFrom).getTime())[0];
    
    // Return the old salary from the earliest increment
    return {
      salaryPerMonth: earliestIncrement.oldSalaryPerMonth || earliestIncrement.previousSalaryPerMonth || this.originalSalary || this.salaryPerMonth,
      basicPay: earliestIncrement.oldBasicPay || earliestIncrement.previousBasicPay || this.basicPay,
      hra: earliestIncrement.oldHra || earliestIncrement.previousHra || this.hra,
      conveyanceAllowance: earliestIncrement.oldConveyanceAllowance || earliestIncrement.previousConveyanceAllowance || this.conveyanceAllowance,
      medicalAllowance: earliestIncrement.oldMedicalAllowance || earliestIncrement.previousMedicalAllowance || this.medicalAllowance,
      performanceAllowance: earliestIncrement.oldPerformanceAllowance || earliestIncrement.previousPerformanceAllowance || this.performanceAllowance,
      specialAllowance: earliestIncrement.oldSpecialAllowance || earliestIncrement.previousSpecialAllowance || this.specialAllowance,
      ctc: earliestIncrement.oldCtc || earliestIncrement.previousCtc || this.ctc,
      effectiveFrom: this.joinDate
    };
  }
  
  // Return current salary if no increments found at all
  return {
    salaryPerMonth: this.salaryPerMonth,
    basicPay: this.basicPay,
    hra: this.hra,
    conveyanceAllowance: this.conveyanceAllowance,
    medicalAllowance: this.medicalAllowance,
    performanceAllowance: this.performanceAllowance,
    specialAllowance: this.specialAllowance,
    ctc: this.ctc,
    effectiveFrom: this.joinDate
  };
};

// Method to get salary for a specific month
employeeSchema.methods.getSalaryForMonth = async function(yearMonth) {
  const [year, month] = yearMonth.split('-').map(Number);
  const firstDayOfMonth = new Date(year, month - 1, 1);
  firstDayOfMonth.setHours(0, 0, 0, 0);
  return await this.getSalaryForDate(firstDayOfMonth);
};

// Method to apply future increments that are due
employeeSchema.methods.applyDueIncrements = async function() {
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  
  const dueIncrements = this.futureIncrements.filter(inc => 
    !inc.isApplied && new Date(inc.effectiveFrom) <= currentDate
  );
  
  let appliedCount = 0;
  for (const increment of dueIncrements) {
    await this.applyIncrement(
      increment.incrementType,
      increment.incrementValue,
      increment.effectiveFrom,
      increment.reason
    );
    increment.isApplied = true;
    appliedCount++;
  }
  
  if (appliedCount > 0) {
    await this.save();
  }
  return appliedCount;
};

// Static method to get employee salary history
employeeSchema.statics.getSalaryHistory = async function(employeeId, startDate, endDate) {
  const employee = await this.findById(employeeId);
  if (!employee) return null;
  
  const history = [];
  let currentDate = new Date(startDate);
  currentDate.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);
  
  while (currentDate <= end) {
    const salary = await employee.getSalaryForDate(currentDate);
    history.push({
      date: new Date(currentDate),
      month: currentDate.getMonth() + 1,
      year: currentDate.getFullYear(),
      monthDisplay: currentDate.toLocaleString('default', { month: 'long', year: 'numeric' }),
      salary: salary
    });
    currentDate.setMonth(currentDate.getMonth() + 1);
  }
  
  return history;
};

module.exports = mongoose.model("Employee", employeeSchema);