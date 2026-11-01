const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  const h = req.headers.authorization;
  if (!h || !h.startsWith('Bearer '))
    return res.status(401).json({ message: 'Login required' });
  try {
    const d = jwt.verify(h.split(' ')[1], process.env.JWT_SECRET);
    req.user = await User.findById(d.id).select('-password');
    if (!req.user) return res.status(401).json({ message: 'User not found' });
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

exports.allow = (...roles) => (req, res, next) =>
  roles.includes(req.user.role)
    ? next()
    : res.status(403).json({ message: 'Access denied' });