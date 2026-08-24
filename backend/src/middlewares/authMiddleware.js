const jwt = require('jsonwebtoken');

/**
 * Middleware to verify admin access via Supabase JWT
 * Ensures the request has a valid Bearer token.
 */
const verifyAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.SUPABASE_JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Forbidden: Invalid or expired token' });
  }
};

module.exports = {
  verifyAdmin
};
