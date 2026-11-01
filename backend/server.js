require('dotenv').config();
if (process.env.NODE_ENV !== 'production') require('dns').setServers(['8.8.8.8', '8.8.4.4']);
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const { rateLimit } = require('express-rate-limit');

const app = express();
app.set('trust proxy', 1);

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : true,
  })
);
app.use(express.json({ limit: '1mb' }));

app.get('/', (req, res) => res.send('CampusConnect API is running'));

const limiter = (limit, message) =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { message },
  });

app.use('/api/auth/login', limiter(20, 'Too many login attempts. Try again after 15 minutes.'));
app.use('/api/auth/admin-login', limiter(5, 'Too many attempts. Try again after 15 minutes.'));
app.use('/api/auth/forgot', limiter(10, 'Too many requests. Try again after 15 minutes.'));
app.use('/api/auth/password/otp', limiter(10, 'Too many requests. Try again after 15 minutes.'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/notices', require('./routes/notices'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/assignments', require('./routes/assignments'));
app.use('/api/marks', require('./routes/marks'));
app.use('/api/users', require('./routes/users'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/public', require('./routes/public'));
app.use('/api/timetable', require('./routes/timetable'));
app.use('/api/materials', require('./routes/materials'));
app.use('/api/leaves', require('./routes/leaves'));
app.use('/api/events', require('./routes/events'));
app.use('/api/files', require('./routes/files'));

app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

app.use((err, req, res, next) => {
  console.error(err);
  const safe = err.status && err.status < 500;
  res.status(err.status || 500).json({
    message:
      safe || process.env.NODE_ENV !== 'production' ? err.message : 'Internal server error',
  });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log('Server on ' + PORT));
  })
  .catch((e) => console.log('DB error:', e.message));