// Dummy hardcoded admin "database"
const admins = [
  {
    id: '1',
    name: 'Saidulureddy',
    email: 'saidulureddy@gmail.com',
    password: 'reddy123', // no bcrypt here
  },
  {
    id: '2',
    name: 'Demo User',
    email: 'demo@gmail.com',
    password: 'demo@123',
  }
];

module.exports = admins;
