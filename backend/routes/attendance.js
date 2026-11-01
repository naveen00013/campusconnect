const router = require('express').Router();
const Attendance = require('../models/Attendance');
const { protect, allow } = require('../middleware/auth');

router.post('/', protect, allow('teacher', 'admin'), async (req, res) => {
  const { date, subject, records } = req.body;
  if (!date || !subject || !Array.isArray(records) || !records.length)
    return res.status(400).json({ message: 'Date, subject and records are required' });

  const ops = records.map((r) => ({
    updateOne: {
      filter: { student: r.student, date, subject },
      update: { $set: { status: r.status, markedBy: req.user._id } },
      upsert: true,
    },
  }));
  await Attendance.bulkWrite(ops);
  res.json({ message: 'Attendance saved successfully' });
});

router.get('/my', protect, allow('student'), async (req, res) => {
  const list = await Attendance.find({ student: req.user._id }).sort('-date');
  const total = list.length;
  const present = list.filter((a) => a.status === 'present').length;
  const bySubject = {};
  list.forEach((a) => {
    bySubject[a.subject] = bySubject[a.subject] || { present: 0, total: 0 };
    bySubject[a.subject].total++;
    if (a.status === 'present') bySubject[a.subject].present++;
  });
  res.json({
    percentage: total ? Math.round((present / total) * 100) : 0,
    total,
    present,
    bySubject,
    records: list,
  });
});

router.get('/', protect, allow('teacher', 'admin'), async (req, res) => {
  const { date, subject } = req.query;
  const filter = {};
  if (date) filter.date = date;
  if (subject) filter.subject = subject;
  res.json(await Attendance.find(filter).populate('student', 'name rollNo'));
});

module.exports = router;