const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase with Service Role Key
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  }
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

    // Since users are manually managed in Supabase by the owner,
    // any valid authenticated user is considered an admin.
    
    // Attach user to request
    req.user = user;
    
    next();
  } catch (err) {
    console.error("Auth Middleware Error:", err.message);
    return res.status(500).json({ error: 'Internal Server Error during authentication' });
  }
};

module.exports = { verifyAdmin };
