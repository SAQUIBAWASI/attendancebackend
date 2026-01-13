// scripts/seedDepartmentsAndRoles.js
const mongoose = require('mongoose');
const Department = require('../models/Department');
const Role = require('../models/Role');
require('dotenv').config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to database');

    // Default departments (आपके employees के departments से)
    const departments = [
      { name: 'Laboratory Medicine', description: 'Lab and diagnostics department' },
      { name: 'Developer', description: 'Software development team' },
      { name: 'Sales', description: 'Sales and business development' },
      { name: 'Marketing', description: 'Marketing and promotion' },
      { name: 'Medical', description: 'Medical department' },
      { name: 'Finance', description: 'Finance and accounting' },
      { name: 'Nursing', description: 'Nursing staff' },
      { name: 'Digital Marketing', description: 'Digital marketing team' },
      { name: 'Management', description: 'Management and administration' }
    ];

    // Default roles (आपके employees के roles से)
    const roles = [
      { name: 'Phlebotomist', description: 'Medical phlebotomist' },
      { name: 'Administrator', description: 'System administrator' },
      { name: 'Manager', description: 'Department manager' },
      { name: 'Team Lead', description: 'Team leader' },
      { name: 'Employee', description: 'General employee' },
      { name: 'HR Manager', description: 'Human resources manager' },
      { name: 'Staff Nurse', description: 'Nursing staff' },
      { name: 'Consultant', description: 'Consultant' },
      { name: 'Graphic Designer', description: 'Designer' },
      { name: 'Web Developer', description: 'Web developer' },
      { name: 'Sales Executive', description: 'Sales executive' }
    ];

    // Add departments if they don't exist
    for (const dept of departments) {
      const exists = await Department.findOne({ 
        name: { $regex: new RegExp(`^${dept.name}$`, 'i') } 
      });
      
      if (!exists) {
        await Department.create(dept);
        console.log(`✅ Added department: ${dept.name}`);
      }
    }

    // Add roles if they don't exist
    for (const role of roles) {
      const exists = await Role.findOne({ 
        name: { $regex: new RegExp(`^${role.name}$`, 'i') } 
      });
      
      if (!exists) {
        await Role.create(role);
        console.log(`✅ Added role: ${role.name}`);
      }
    }

    console.log('✅ Seeding completed successfully');
    mongoose.disconnect();
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedData();