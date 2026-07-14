const jwt = require('jsonwebtoken');

const jwtSecret = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? null : 'development_secret');

exports.authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Please log in first.' });
  try {
    if (!jwtSecret) return res.status(500).json({ message: 'JWT_SECRET is not configured on the server.' });
    req.user = jwt.verify(token, jwtSecret);
    next();
  } catch { res.status(401).json({ message: 'Your session has expired. Please log in again.' }); }
};

exports.adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required.' });
  next();
};
