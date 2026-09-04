import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Supabase details from frontend/.env
const supabaseUrl = 'https://cofkuydtrnajowtbfhox.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvZmt1eWR0cm5ham93dGJmaG94Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzQyMDIzOSwiZXhwIjoyMTAyOTk2MjM5fQ.YWG1Evc56JGPcH6--cipZVcyu3_SHRs6Ab8pNXFjqPQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seed() {
  console.log('Logging in to Supabase...');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'admin@gmail.com',
    password: 'Admin12345@'
  });

  if (authError) {
    console.error('Login failed:', authError.message);
    process.exit(1);
  }

  console.log('Login successful. Reading questions...');
  
  const questionsPath = path.join(process.cwd(), '../tests', 'questions.json');
  const questions = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));

  const formattedQuestions = questions.map((q, index) => ({
    id: q.id,
    block_name: q.block_name,
    question_text: q.title,
    type: q.type,
    options: q.options || [],
    order_index: index,
    required: q.required !== undefined ? q.required : true,
    conditional_logic: null
  }));

  console.log(`Inserting ${formattedQuestions.length} questions...`);

  const { data, error } = await supabase
    .from('questions')
    .upsert(formattedQuestions, { onConflict: 'id' });

  if (error) {
    console.error('Error inserting questions:', error);
    process.exit(1);
  }

  console.log('Successfully inserted all questions to Supabase!');
}

seed().catch(console.error);
