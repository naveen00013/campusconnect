const router = require('express').Router();
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Assignment = require('../models/Assignment');
const Mark = require('../models/Mark');
const Leave = require('../models/Leave');
const Event = require('../models/Event');
const { protect, allow } = require('../middleware/auth');
const { todayUTC } = require('../utils/helpers');

router.get('/stats', protect, async (req, res) => {
  const { role, _id } = req.user;
  const events = await Event.countDocuments({ date: { $gte: todayUTC() } });

  if (role === 'student') {
    const att = await Attendance.find({ student: _id });
    const present = att.filter((a) => a.status === 'present').length;
    const assignments = await Assignment.find();
    const pending = assignments.filter(
      (a) => !a.submissions.some((s) => String(s.student) === String(_id))
    ).length;
    const last = await Mark.findOne({ student: _id }).sort('-createdAt');
    return res.json({
      attendance: att.length ? Math.round((present / att.length) * 100) + '%' : '0%',
      pending,
      latest: last ? Math.round((last.marks / last.total) * 100) + '%' : '--',
      events,
    });
  }

  const pendingLeaves = await Leave.countDocuments({ status: 'pending' });

  if (role === 'teacher') {
    return res.json({
      students: await User.countDocuments({ role: 'student' }),
      assignments: await Assignment.countDocuments({ createdBy: _id }),
      marks: await Mark.countDocuments({ addedBy: _id }),
      pendingLeaves,
    });
  }

  res.json({
    students: await User.countDocuments({ role: 'student' }),
    teachers: await User.countDocuments({ role: 'teacher' }),
    pendingLeaves,
    events,
  });
});

router.get('/analytics', protect, allow('teacher', 'admin'), async (req, res) => {
  const attendance = await Attendance.aggregate([
    {
      $group: {
        _id: '$date',
        present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
        total: { $sum: 1 },
      },
    },
    { $sort: { _id: -1 } },
    { $limit: 7 },
    { $sort: { _id: 1 } },
    {
      $project: {
        _id: 0,
        date: '$_id',
        percentage: {
          $round: [{ $multiply: [{ $divide: ['$present', '$total'] }, 100] }, 0],
        },
      },
    },
  ]);

  const marks = await Mark.aggregate([
    {
      $group: {
        _id: '$subject',
        avg: { $avg: { $multiply: [{ $divide: ['$marks', '$total'] }, 100] } },
      },
    },
    { $project: { _id: 0, subject: '$_id', average: { $round: ['$avg', 0] } } },
    { $sort: { subject: 1 } },
  ]);

  res.json({ attendance, marks });
});

module.exports = router;