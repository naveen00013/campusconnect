const router = require('express').Router();
const Event = require('../models/Event');
const { protect, allow } = require('../middleware/auth');

const CATS = ['academic', 'cultural', 'sports', 'workshop', 'holiday', 'other'];

router.get('/', protect, async (req, res) => {
  res.json(await Event.find().populate('createdBy', 'name').sort('date'));
});

router.post('/', protect, allow('admin', 'teacher'), async (req, res) => {
  const { title, description, date, time, venue, category } = req.body;
  if (!title || !title.trim())
    return res.status(400).json({ message: 'Event title is required' });
  const d = new Date(date);
  if (isNaN(d)) return res.status(400).json({ message: 'Please select a valid date' });

  const e = await Event.create({
    title: title.trim(),
    description,
    date: d,
    time: time || '',
    venue,
    category: CATS.includes(category) ? category : 'academic',
    createdBy: req.user._id,
  });
  res.status(201).json(e);
});

router.delete('/:id', protect, allow('admin', 'teacher'), async (req, res) => {
  const e = await Event.findById(req.params.id);
  if (!e) return res.status(404).json({ message: 'Event not found' });
  if (req.user.role !== 'admin' && String(e.createdBy) !== String(req.user._id))
    return res.status(403).json({ message: 'You can only delete your own events' });
  await e.deleteOne();
  res.json({ message: 'Deleted' });
});

module.exports = router;