require('dns').setServers(['8.8.8.8', '8.8.4.4']);
const readline = require('readline/promises');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

(async () => {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const uri = (await rl.question('MongoDB URI (production): ')).trim();
  const name = (await rl.question('Admin name: ')).trim();
  const email = (await rl.question('Admin email: ')).trim().toLowerCase();
  const mobile = (await rl.question('Mobile with +91 (optional): ')).trim();
  const password = await rl.question('Password (min 8 chars): ');
  rl.close();

  if (password.length < 8) {
    console.log('Password too short');
    process.exit(1);
  }
  await mongoose.connect(uri);
  if (await User.findOne({ email })) {
    console.log('User already exists');
    process.exit(1);
  }
  await User.create({
    name,
    email,
    mobile,
    password: await bcrypt.hash(password, 10),
    role: 'admin',
  });
  console.log('Admin created: ' + email);
  process.exit(0);
})();