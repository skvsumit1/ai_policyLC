const { readData } = require('../utils/fileStore');

function requireAuth(req, res, next) {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required. Provide x-user-id header.' });
  }
  const user = readData('users.json').find(u => u.id === userId);
  if (!user) {
    return res.status(401).json({ error: 'Invalid user ID.' });
  }
  req.user = user;
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Authentication required.' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: `Access denied. Required role(s): ${roles.join(', ')}` });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
