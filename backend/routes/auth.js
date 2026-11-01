const router = require('express').Router();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Otp = require('../models/Otp');
const { protect, allow } = require('../middleware/auth');
const { deliverOtp } = require('../utils/notify');

const sign = (id, exp = '7d') => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: exp });
const emailOk = (e) => /^\S+@\S+\.\S+$/.test(e || '');
const DUMMY_HASH = bcrypt.hashSync('dummy-password', 10);
const label = { student: 'Student', teacher: 'Faculty' };
const publicUser = (u) => ({ id: u._id, name: u.name, email: u.email, role: u.role });
const cleanEmail = (v) => String(v || '').toLowerCase().trim();

const safeEqual = (a, b) => {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};

const normMobile = (m) => {
  const d = String(m || '').replace(/[\s-]/g, '');
  if (/^[6-9]\d{9}$/.test(d)) return '+91' + d;
  return /^\+[1-9]\d{9,14}$/.test(d) ? d : null;
};

const hashOtp = (c) =>
  crypto.createHmac('sha256', process.env.JWT_SECRET).update(String(c)).digest('hex');

const GENERIC =
  'If the account exists, an OTP has been sent to the registered email and mobile number.';

async function sendOtp(user, purpose) {
  const old = await Otp.findOne({ user: user._id, purpose });
  if (old && Date.now() - old.updatedAt.getTime() < 60000) return null;
  const code = String(crypto.randomInt(100000, 1000000));
  await Otp.findOneAndUpdate(
    { user: user._id, purpose },
    { codeHash: hashOtp(code), attempts: 0, expiresAt: new Date(Date.now() + 5 * 60000) },
    { upsert: true, setDefaultsOnInsert: true }
  );
  const channels = await deliverOtp(user, code);
  if (!channels.length) {
    await Otp.deleteOne({ user: user._id, purpose });
    throw new Error('OTP delivery failed');
  }
  return channels;
}

async function checkOtp(user, purpose, code) {
  const rec = await Otp.findOne({ user: user._id, purpose });
  if (!rec || rec.expiresAt < new Date()) return 'OTP expired. Please request a new one.';
  if (rec.attempts >= 5) {
    await rec.deleteOne();
    return 'Too many wrong attempts. Please request a new OTP.';
  }
  if (!safeEqual(hashOtp(code), rec.codeHash)) {
    rec.attempts += 1;
    await rec.save();
    return 'Incorrect OTP';
  }
  await rec.deleteOne();
  return null;
}

/* ---------- Login ---------- */
router.post('/login', async (req, res) => {
  const email = cleanEmail(req.body.email);
  const password = String(req.body.password || '');
  const portal = req.body.portal;
  if (!emailOk(email) || !password)
    return res.status(400).json({ message: 'Please enter a valid email and password' });

  const user = await User.findOne({ email });
  const ok = await bcrypt.compare(password, user ? user.password : DUMMY_HASH);
  if (!user || !ok || user.role === 'admin')
    return res.status(400).json({ message: 'Wrong email or password' });

  if (portal && portal !== user.role)
    return res.status(403).json({
      message: `This account belongs to ${label[user.role]}. Please use the ${label[user.role]} Login.`,
    });

  res.json({ token: sign(user._id), user: publicUser(user) });
});

router.post('/admin-login', async (req, res) => {
  const email = cleanEmail(req.body.email);
  const password = String(req.body.password || '');
  const accessCode = String(req.body.accessCode || '');

  if (!process.env.ADMIN_ACCESS_CODE)
    return res.status(500).json({ message: 'Admin access is not configured' });

  const user = await User.findOne({ email });
  const ok = await bcrypt.compare(password, user ? user.password : DUMMY_HASH);
  const codeOk = safeEqual(accessCode, process.env.ADMIN_ACCESS_CODE);

  if (!user || !ok || !codeOk || user.role !== 'admin')
    return res.status(400).json({ message: 'Invalid credentials' });

  res.json({ token: sign(user._id, '1d'), user: publicUser(user) });
});

router.get('/me', protect, (req, res) => res.json(req.user));

/* ---------- Users / profile ---------- */
router.post('/register', protect, allow('admin'), async (req, res) => {
  const { name, password, role, department, rollNo } = req.body;
  const email = cleanEmail(req.body.email);
  const mobile = req.body.mobile ? normMobile(req.body.mobile) : '';

  if (!name || !name.trim()) return res.status(400).json({ message: 'Name is required' });
  if (!emailOk(email)) return res.status(400).json({ message: 'Enter a valid email' });
  if (mobile === null) return res.status(400).json({ message: 'Enter a valid mobile number' });
  if (!password || password.length < 8)
    return res.status(400).json({ message: 'Password must be at least 8 characters' });
  if (!['student', 'teacher', 'admin'].includes(role))
    return res.status(400).json({ message: 'Invalid role' });
  if (await User.findOne({ email }))
    return res.status(400).json({ message: 'Email already exists' });

  const u = await User.create({
    name: name.trim(),
    email,
    password: await bcrypt.hash(password, 10),
    role,
    department,
    rollNo,
    mobile,
  });
  res.status(201).json({ id: u._id, name: u.name, role: u.role });
});

router.put('/profile', protect, async (req, res) => {
  const { name, department, currentPassword } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ message: 'Name cannot be empty' });

  const u = await User.findById(req.user._id);

  if (req.body.mobile !== undefined) {
    const m = req.body.mobile === '' ? '' : normMobile(req.body.mobile);
    if (m === null) return res.status(400).json({ message: 'Enter a valid mobile number' });
    if (m !== (u.mobile || '')) {
      if (!currentPassword || !(await bcrypt.compare(currentPassword, u.password)))
        return res
          .status(400)
          .json({ message: 'Enter your current password to change the mobile number' });
      u.mobile = m;
    }
  }

  u.name = name.trim();
  u.department = department;
  await u.save();
  const o = u.toObject();
  delete o.password;
  res.json(o);
});

/* ---------- Password change (logged in, OTP) ---------- */
router.post('/password/otp', protect, async (req, res) => {
  const u = await User.findById(req.user._id);
  try {
    const channels = await sendOtp(u, 'change');
    if (!channels)
      return res.status(429).json({ message: 'Please wait a minute before requesting another OTP' });
    res.json({ message: `OTP sent to ${channels.join(' and ')}` });
  } catch (e) {
    console.error(e.message);
    res.status(502).json({ message: 'Unable to send OTP right now. Please try again later.' });
  }
});

router.put('/password', protect, async (req, res) => {
  const { otp, newPassword } = req.body;
  if (!otp || !newPassword || newPassword.length < 8)
    return res.status(400).json({ message: 'Enter the OTP and a new password (minimum 8 characters)' });

  const u = await User.findById(req.user._id);
  const err = await checkOtp(u, 'change', otp);
  if (err) return res.status(400).json({ message: err });

  u.password = await bcrypt.hash(newPassword, 10);
  await u.save();
  res.json({ message: 'Password changed successfully' });
});

/* ---------- Forgot password (public, OTP) ---------- */
router.post('/forgot/otp', async (req, res) => {
  try {
    const email = cleanEmail(req.body.email);
    const user = emailOk(email) && (await User.findOne({ email }));
    if (user && user.role !== 'admin') await sendOtp(user, 'forgot');
  } catch (e) {
    console.error(e.message);
  }
  res.json({ message: GENERIC });
});

router.post('/forgot/reset', async (req, res) => {
  const { otp, newPassword } = req.body;
  if (!otp || !newPassword || newPassword.length < 8)
    return res.status(400).json({ message: 'Enter the OTP and a new password (minimum 8 characters)' });

  const user = await User.findOne({ email: cleanEmail(req.body.email) });
  const err =
    user && user.role !== 'admin' ? await checkOtp(user, 'forgot', otp) : 'Invalid or expired OTP';
  if (err) return res.status(400).json({ message: err });

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
  res.json({ message: 'Password reset successfully. You can now log in.' });
});

module.exports = router;