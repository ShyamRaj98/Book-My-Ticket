// server/middleware/admin.js
export function requireAdmin(req, res, next) {
  // Expect req.user to be set by auth middleware
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  next();
}
