import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

let client: SupabaseClient | null = null;
let configured = false;

try {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase URL or Anon Key is missing. Check your .env file. The application may not function properly without these.");
  } else {
    client = createClient(supabaseUrl, supabaseAnonKey);
    configured = true;
  }
} catch (error) {
  console.error("Failed to initialize Supabase client:", error);
}

// Fallback dummy client if initialization failed
if (!client) {
  console.warn("Using fallback dummy Supabase client.");
  client = createClient('https://placeholder.supabase.co', 'placeholder_key');
}

export const isSupabaseConfigured = configured;
export const supabase = client;
