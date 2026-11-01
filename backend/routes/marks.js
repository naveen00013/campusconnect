const router = require('express').Router();
const Mark = require('../models/Mark');
const { protect, allow } = require('../middleware/auth');

router.post('/', protect, allow('teacher', 'admin'), async (req, res) => {
  const { student, subject, exam, marks, total } = req.body;
  if (!student || !subject || !exam || marks == null || !total)
    return res.status(400).json({ message: 'Please fill in all details' });
  if (Number(marks) > Number(total))
    return res.status(400).json({ message: 'Marks cannot exceed the total' });
  const m = await Mark.create({
    student,
    subject,
    exam,
    marks,
    total,
    addedBy: req.user._id,
  });
  res.status(201).json(m);
});

router.get('/my', protect, allow('student'), async (req, res) => {
  res.json(await Mark.find({ student: req.user._id }).sort('-createdAt'));
});

router.get('/', protect, allow('teacher', 'admin'), async (req, res) => {
  res.json(await Mark.find().populate('student', 'name rollNo').sort('-createdAt'));
});

router.delete('/:id', protect, allow('teacher', 'admin'), async (req, res) => {
  await Mark.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;