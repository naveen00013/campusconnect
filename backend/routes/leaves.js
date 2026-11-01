const router = require('express').Router();
const Leave = require('../models/Leave');
const { protect, allow } = require('../middleware/auth');

const TYPES = ['sick', 'casual', 'event', 'other'];

router.post('/', protect, allow('student'), async (req, res) => {
  const { type, fromDate, toDate, reason } = req.body;
  const from = new Date(fromDate);
  const to = new Date(toDate);

  if (isNaN(from) || isNaN(to))
    return res.status(400).json({ message: 'Please select valid dates' });
  if (to < from)
    return res.status(400).json({ message: 'End date cannot be before the start date' });
  if (!reason || reason.trim().length < 5)
    return res
      .status(400)
      .json({ message: 'Please provide a reason (at least 5 characters)' });

  const l = await Leave.create({
    student: req.user._id,
    type: TYPES.includes(type) ? type : 'casual',
    fromDate: from,
    toDate: to,
    reason: reason.trim(),
  });
  res.status(201).json(l);
});

router.get('/my', protect, allow('student'), async (req, res) => {
  res.json(await Leave.find({ student: req.user._id }).sort('-createdAt'));
});

router.get('/', protect, allow('teacher', 'admin'), async (req, res) => {
  const filter = ['pending', 'approved', 'rejected'].includes(req.query.status)
    ? { status: req.query.status }
    : {};
  const list = await Leave.find(filter)
    .populate('student', 'name rollNo department')
    .populate('reviewedBy', 'name')
    .sort('-createdAt');
  res.json(list);
});

router.put('/:id/review', protect, allow('teacher', 'admin'), async (req, res) => {
  const { status, remark } = req.body;
  if (!['approved', 'rejected'].includes(status))
    return res.status(400).json({ message: 'Invalid status' });

  const l = await Leave.findById(req.params.id);
  if (!l) return res.status(404).json({ message: 'Application not found' });
  if (l.status !== 'pending')
    return res.status(400).json({ message: 'This application has already been reviewed' });

  l.status = status;
  l.remark = (remark || '').trim();
  l.reviewedBy = req.user._id;
  await l.save();
  res.json(l);
});

router.delete('/:id', protect, allow('student'), async (req, res) => {
  const l = await Leave.findOne({ _id: req.params.id, student: req.user._id });
  if (!l) return res.status(404).json({ message: 'Application not found' });
  if (l.status !== 'pending')
    return res.status(400).json({ message: 'Only pending applications can be cancelled' });
  await l.deleteOne();
  res.json({ message: 'Cancelled' });
});

module.exports = router;