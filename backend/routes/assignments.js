const router = require('express').Router();
const Assignment = require('../models/Assignment');
const { protect, allow } = require('../middleware/auth');
const { single, remove, info } = require('../middleware/upload');

router.get('/', protect, async (req, res) => {
  const list = await Assignment.find().populate('createdBy', 'name').sort('-createdAt');

  if (req.user.role === 'student') {
    return res.json(
      list.map((a) => {
        const mine = a.submissions.find((s) => String(s.student) === String(req.user._id));
        const o = a.toObject();
        delete o.submissions;
        return { ...o, submitted: !!mine, mySubmission: mine || null };
      })
    );
  }

  res.json(
    list.map((a) => {
      const o = a.toObject();
      o.submissionCount = a.submissions.length;
      delete o.submissions;
      return o;
    })
  );
});

router.post('/', protect, allow('teacher', 'admin'), single, async (req, res) => {
  const { title, description, subject, dueDate } = req.body;
  if (!title || !subject || !dueDate) {
    if (req.file) remove(req.file.filename);
    return res.status(400).json({ message: 'Title, subject and due date are required' });
  }
  const a = await Assignment.create({
    title,
    description,
    subject,
    dueDate,
    attachment: info(req.file),
    createdBy: req.user._id,
  });
  res.status(201).json(a);
});

router.post('/:id/submit', protect, allow('student'), single, async (req, res) => {
  const fail = (code, message) => {
    if (req.file) remove(req.file.filename);
    return res.status(code).json({ message });
  };
  const a = await Assignment.findById(req.params.id);
  if (!a) return fail(404, 'Assignment not found');
  if (a.submissions.some((s) => String(s.student) === String(req.user._id)))
    return fail(400, 'You have already submitted this assignment');
  const text = (req.body.text || '').trim();
  if (!text && !req.file) return fail(400, 'Write an answer or attach a file');

  a.submissions.push({ student: req.user._id, text, file: info(req.file) });
  await a.save();
  res.json({ message: 'Assignment submitted successfully' });
});

router.get('/:id/submissions', protect, allow('teacher', 'admin'), async (req, res) => {
  const a = await Assignment.findById(req.params.id).populate('submissions.student', 'name rollNo');
  if (!a) return res.status(404).json({ message: 'Assignment not found' });
  res.json(a.submissions);
});

router.delete('/:id', protect, allow('teacher', 'admin'), async (req, res) => {
  const a = await Assignment.findById(req.params.id);
  if (!a) return res.status(404).json({ message: 'Assignment not found' });
  if (req.user.role !== 'admin' && String(a.createdBy) !== String(req.user._id))
    return res.status(403).json({ message: 'You can only delete your own assignments' });
  remove(a.attachment?.file);
  a.submissions.forEach((s) => remove(s.file?.file));
  await a.deleteOne();
  res.json({ message: 'Deleted' });
});

module.exports = router;