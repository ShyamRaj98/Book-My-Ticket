// server/middleware/admin.js
export function requireAdmin(req, res, next) {
  // Expect req.user to be set by auth middleware
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  next();
}

// middlewares/theater.js
export const requireTheater = (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  if (req.user.role !== "theater") {
    return res.status(403).json({ error: "Access denied: Theater only" });
  }
  next();
};

