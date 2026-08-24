import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/*
 * ==========================================
 * SUPABASE RLS POLICIES FOR SQL EDITOR
 * ==========================================
 * Instruction for User:
 * Please run the following RLS policies in your Supabase SQL Editor to secure the database:
 * 
 * -- 1. responses and answers tables
 * -- INSERT for everyone (anon), SELECT/UPDATE/DELETE ONLY for authenticated admins
 * ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
 * CREATE POLICY "Enable insert for everyone" ON responses FOR INSERT TO public WITH CHECK (true);
 * CREATE POLICY "Enable select/update/delete for admins only" ON responses FOR ALL TO authenticated USING (true) WITH CHECK (true);
 * 
 * ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
 * CREATE POLICY "Enable insert for everyone" ON answers FOR INSERT TO public WITH CHECK (true);
 * CREATE POLICY "Enable select/update/delete for admins only" ON answers FOR ALL TO authenticated USING (true) WITH CHECK (true);
 * 
 * -- 2. questions table
 * -- SELECT for everyone (anon), INSERT/UPDATE/DELETE ONLY for authenticated admins
 * ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
 * CREATE POLICY "Enable select for everyone" ON questions FOR SELECT TO public USING (true);
 * CREATE POLICY "Enable insert/update/delete for admins only" ON questions FOR ALL TO authenticated USING (true) WITH CHECK (true);
 * ==========================================
 */

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
