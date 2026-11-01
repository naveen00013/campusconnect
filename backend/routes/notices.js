const router = require('express').Router();
const Notice = require('../models/Notice');
const { protect, allow } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  const filter =
    req.user.role === 'admin' ? {} : { audience: { $in: ['all', req.user.role] } };
  const list = await Notice.find(filter)
    .populate('postedBy', 'name role')
    .sort('-createdAt');
  res.json(list);
});

router.post('/', protect, allow('admin', 'teacher'), async (req, res) => {
  const { title, content, audience } = req.body;
  if (!title || !content)
    return res.status(400).json({ message: 'Title and content are required' });
  const n = await Notice.create({
    title,
    content,
    audience: audience || 'all',
    postedBy: req.user._id,
  });
  res.status(201).json(n);
});

router.delete('/:id', protect, allow('admin', 'teacher'), async (req, res) => {
  const n = await Notice.findById(req.params.id);
  if (!n) return res.status(404).json({ message: 'Notice not found' });
  if (req.user.role !== 'admin' && String(n.postedBy) !== String(req.user._id))
    return res.status(403).json({ message: 'You can only delete your own notices' });
  await n.deleteOne();
  res.json({ message: 'Deleted' });
});

module.exports = router;