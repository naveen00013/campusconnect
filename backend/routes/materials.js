const router = require('express').Router();
const Material = require('../models/Material');
const { protect, allow } = require('../middleware/auth');
const { esc, deptRegex } = require('../utils/helpers');

const TYPES = ['notes', 'video', 'book', 'assignment', 'other'];

router.get('/', protect, async (req, res) => {
  const conds = [];
  if (req.user.role === 'student' && req.user.department)
    conds.push({ $or: [{ department: '' }, { department: deptRegex(req.user.department) }] });

  const { q, subject, type } = req.query;
  if (type) conds.push({ type: String(type) });
  if (subject) conds.push({ subject: new RegExp('^' + esc(subject) + '$', 'i') });
  if (q)
    conds.push({
      $or: [
        { title: new RegExp(esc(q), 'i') },
        { subject: new RegExp(esc(q), 'i') },
      ],
    });

  const list = await Material.find(conds.length ? { $and: conds } : {})
    .populate('uploadedBy', 'name')
    .sort('-createdAt');
  res.json(list);
});

router.post('/', protect, allow('teacher', 'admin'), async (req, res) => {
  const { title, subject, description, type, link, department } = req.body;
  if (!title || !title.trim() || !subject || !subject.trim())
    return res.status(400).json({ message: 'Title and subject are required' });
  if (!/^https?:\/\/\S+$/i.test(link || ''))
    return res
      .status(400)
      .json({ message: 'Enter a valid link starting with http:// or https://' });

  const m = await Material.create({
    title: title.trim(),
    subject: subject.trim(),
    description,
    type: TYPES.includes(type) ? type : 'notes',
    link,
    department: (department || '').trim(),
    uploadedBy: req.user._id,
  });
  res.status(201).json(m);
});

router.delete('/:id', protect, allow('teacher', 'admin'), async (req, res) => {
  const m = await Material.findById(req.params.id);
  if (!m) return res.status(404).json({ message: 'Material not found' });
  if (req.user.role !== 'admin' && String(m.uploadedBy) !== String(req.user._id))
    return res.status(403).json({ message: 'You can only delete your own material' });
  await m.deleteOne();
  res.json({ message: 'Deleted' });
});

module.exports = router;