const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  // 🔥 Skip auth for OPTIONS preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

const adminOnly = (req, res, next) => {
  if (!req.user.roles.includes('admin')) return res.status(403).json({ message: 'Admin only' });
  next();
};

module.exports = { authMiddleware, adminOnly }; 