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


const mongoose = require("mongoose");

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
  
  // Employment Info
  employeeId: { type: String, unique: true, required: true },
  joinDate: { type: Date, required: true },
  dob: { type: Date },
  
  // Department & Role
  departmentId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    default: null
  },
  roleId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    default: null
  },
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
  location: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Location", 
    default: null 
  },
  
  // Shift & Schedule
  shiftType: { type: String, default: "A" },
  shiftHours: { type: Number, default: 8 },
  
  // Salary
  salaryPerMonth: { type: Number, default: 0 },
  weekOffPerMonth: { type: Number, default: 0 },
  
  // Week Off
  weekOffType: { 
    type: String, 
    enum: ['day', 'number', ''], 
    default: '' 
  },
  weekOffCount: { type: Number, default: 0 },
  
  // Status
  status: { 
    type: String, 
    enum: ['active', 'inactive'], 
    default: 'active' 
  },
  
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

module.exports = mongoose.model("Employee", employeeSchema);