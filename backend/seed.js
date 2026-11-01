require('dotenv').config();
require('dns').setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await User.deleteMany({});
  const pw = await bcrypt.hash('123456', 10);
  await User.insertMany([
    { name: 'Admin', email: 'admin@campus.com', password: pw, role: 'admin' },
    { name: 'Teacher One', email: 'teacher@campus.com', password: pw, role: 'teacher', department: 'IT' },
    { name: 'Student One', email: 'student@campus.com', password: pw, role: 'student', department: 'IT', rollNo: '101' },
  ]);
  console.log('Seeded');
  process.exit();
})();