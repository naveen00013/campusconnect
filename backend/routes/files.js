const router = require('express').Router();
const mongoose = require('mongoose');
const File = require('../models/File');
const { protect } = require('../middleware/auth');

router.get('/:id', protect, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id))
    return res.status(400).json({ message: 'Invalid file' });
  const f = await File.findById(req.params.id);
  if (!f) return res.status(404).json({ message: 'File not found' });
  res.set('Content-Type', f.mime || 'application/octet-stream');
  res.send(f.data);
});

module.exports = router;