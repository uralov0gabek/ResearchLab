const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase with Service Role Key
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const verifyAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Missing or invalid token format' });
    }

    const token = authHeader.replace(/^Bearer\s+/, '').trim();

    // Let Supabase handle the cryptographic verification!
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.error("Supabase Auth Verification Failed:", error?.message);
      return res.status(403).json({ error: 'Forbidden: Invalid or expired token' });
    }

    // Attach user to request
    req.user = user;
    
    // (Optional RBAC check can go here later: if (user.role !== 'admin') ... )
    
    next();
  } catch (err) {
    console.error("Auth Middleware Error:", err.message);
    return res.status(500).json({ error: 'Internal Server Error during authentication' });
  }
};

module.exports = { verifyAdmin };
