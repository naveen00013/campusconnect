const router = require('express').Router();
const User = require('../models/User');
const { protect, allow } = require('../middleware/auth');

router.get('/', protect, allow('teacher', 'admin'), async (req, res) => {
  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.user.role === 'teacher') filter.role = 'student';
  res.json(await User.find(filter).select('-password').sort('name'));
});

router.delete('/:id', protect, allow('admin'), async (req, res) => {
  if (String(req.params.id) === String(req.user._id))
    return res.status(400).json({ message: 'You cannot delete your own account' });
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;