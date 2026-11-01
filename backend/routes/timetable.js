const router = require('express').Router();
const Timetable = require('../models/Timetable');
const { protect, allow } = require('../middleware/auth');
const { deptRegex } = require('../utils/helpers');

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

const scope = (user, query) => {
  if (user.role === 'student')
    return user.department ? { department: deptRegex(user.department) } : {};
  if (user.role === 'teacher') return { teacher: user._id };
  return query.department ? { department: deptRegex(query.department) } : {};
};

router.get('/', protect, async (req, res) => {
  const list = await Timetable.find(scope(req.user, req.query))
    .populate('teacher', 'name')
    .sort('day startTime');
  res.json(list);
});

router.get('/today', protect, async (req, res) => {
  const q = Number(req.query.day);
  const day = Number.isInteger(q) && q >= 0 && q <= 6 ? q : new Date().getDay();
  const list = await Timetable.find({ ...scope(req.user, req.query), day })
    .populate('teacher', 'name')
    .sort('startTime');
  res.json(list);
});

router.post('/', protect, allow('admin'), async (req, res) => {
  const { department, day, startTime, endTime, subject, room, teacher } = req.body;

  if (
    !department || !String(department).trim() ||
    !subject || !String(subject).trim() ||
    day === undefined || day === ''
  )
    return res.status(400).json({ message: 'Department, day and subject are required' });

  const d = Number(day);
  if (!(d >= 0 && d <= 6))
    return res.status(400).json({ message: 'Invalid day' });
  if (!TIME.test(startTime) || !TIME.test(endTime))
    return res.status(400).json({ message: 'Enter a valid start and end time' });
  if (endTime <= startTime)
    return res.status(400).json({ message: 'End time must be after start time' });

  const clash = await Timetable.findOne({
    department: deptRegex(department),
    day: d,
    startTime: { $lt: endTime },
    endTime: { $gt: startTime },
  });
  if (clash)
    return res.status(400).json({
      message: `This slot overlaps with ${clash.subject} (${clash.startTime} - ${clash.endTime})`,
    });

  if (teacher) {
    const busy = await Timetable.findOne({
      teacher,
      day: d,
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
    });
    if (busy)
      return res
        .status(400)
        .json({ message: 'The selected faculty already has a class in this slot' });
  }

  const t = await Timetable.create({
    department: String(department).trim(),
    day: d,
    startTime,
    endTime,
    subject: String(subject).trim(),
    room: room ? String(room).trim() : '',
    teacher: teacher || undefined,
  });
  res.status(201).json(t);
});

router.delete('/:id', protect, allow('admin'), async (req, res) => {
  await Timetable.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;