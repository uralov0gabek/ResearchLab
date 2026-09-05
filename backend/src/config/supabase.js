const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// We need SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from .env
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('Missing Supabase environment variables. Make sure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in the backend/.env file.');
} else if (supabaseServiceKey.startsWith('sb_publishable_')) {
  console.error('\n❌ ERROR: SUPABASE_SERVICE_ROLE_KEY is set to a publishable Anon Key (sb_publishable_...).');
  console.error('This will cause RLS (Row-Level Security) to fail on POST/PUT requests.');
  console.error('Please update your backend/.env with the actual Service Role Key (JWT starting with eyJ...).\n');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
});

module.exports = { supabaseAdmin };
