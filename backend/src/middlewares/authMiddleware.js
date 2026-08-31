const jwt = require('jsonwebtoken');

/**
 * Middleware to verify admin access via Supabase JWT
 * Ensures the request has a valid Bearer token.
 */
const verifyAdmin = (req, res, next) => {
  console.log('Incoming Auth Header:', req.headers.authorization);
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.replace(/^Bearer\s+/, '').trim();
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Empty token' });
  }

  if (!process.env.SUPABASE_JWT_SECRET) {
    console.error("CRITICAL ERROR: SUPABASE_JWT_SECRET is missing from environment variables.");
    return res.status(500).json({ error: "Server Configuration Error" });
  }

  try {
    const decoded = jwt.verify(token, process.env.SUPABASE_JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("JWT Verification Failed:", error.message);
    return res.status(403).json({ error: 'Forbidden: Invalid or expired token' });
  }
};

module.exports = {
  verifyAdmin
};
