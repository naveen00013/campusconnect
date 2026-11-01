const router = require('express').Router();
const User = require('../models/User');
const Notice = require('../models/Notice');
const Event = require('../models/Event');
const { todayUTC } = require('../utils/helpers');

router.get('/overview', async (req, res) => {
  const [students, teachers, noticeCount, notices, events] = await Promise.all([
    User.countDocuments({ role: 'student' }),
    User.countDocuments({ role: 'teacher' }),
    Notice.countDocuments({ audience: 'all' }),
    Notice.find({ audience: 'all' })
      .select('title content createdAt')
      .sort('-createdAt')
      .limit(8),
    Event.find({ date: { $gte: todayUTC() } })
      .select('title date time venue category')
      .sort('date')
      .limit(6),
  ]);
  res.json({ students, teachers, noticeCount, notices, events });
});

module.exports = router;