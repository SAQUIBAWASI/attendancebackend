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
const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  
  // ✅ EXISTING FIELDS (कुछ employees में ये fields होंगे)
  department: { type: String },
  role: { type: String },
  
  // ✅ NEW FIELDS (Reference के लिए)
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
  
  // ✅ REST OF YOUR FIELDS
  employeeId: { type: String, unique: true, required: true },
  joinDate: { type: Date },
  phone: { type: String },
  address: { type: String },
  location: { type: mongoose.Schema.Types.ObjectId, ref: "Location", default: null },
  shiftType: { type: String, default: "A" },
  salaryPerMonth: { type: Number, default: 0 },
  shiftHours: { type: Number, default: 0 },
  weekOffPerMonth: { type: Number, default: 0 }

}, { timestamps: true });

module.exports = mongoose.model("Employee", employeeSchema);