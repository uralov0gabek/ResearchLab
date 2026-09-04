import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = 'https://cofkuydtrnajowtbfhox.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvZmt1eWR0cm5ham93dGJmaG94Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzQyMDIzOSwiZXhwIjoyMTAyOTk2MjM5fQ.YWG1Evc56JGPcH6--cipZVcyu3_SHRs6Ab8pNXFjqPQ';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log('Logging in...');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'admin@gmail.com',
    password: 'Admin12345@'
  });

  if (authError) {
    console.error('Login failed:', authError.message);
    process.exit(1);
  }

  // 1. CONDITIONAL LOGIC
  console.log('Fetching questions to update conditional logic...');
  const { data: allQuestions } = await supabase.from('questions').select('id, question_text');
  
  const findId = (prefix) => {
    const q = allQuestions.find(q => q.question_text && q.question_text.startsWith(prefix));
    return q ? q.id : null;
  };

  const idS1 = findId('S1.');
  const idS1a = findId('S1a.');
  const idS2 = findId('S2.');
  const idS2a = findId('S2a.');
  const idS3 = findId('S3.');
  const idS3a = findId('S3a.');
  const idS4 = findId('S4.');
  const idS4a = findId('S4a.');

  const updates = [];
  if (idS1 && idS1a) updates.push({ id: idS1a, conditional_logic: { questionId: idS1, expectedValue: 'Yes' } });
  if (idS2 && idS2a) updates.push({ id: idS2a, conditional_logic: { questionId: idS2, expectedValue: 'Yes' } });
  if (idS3 && idS3a) updates.push({ id: idS3a, conditional_logic: { questionId: idS3, expectedValue: 'Yes' } });
  if (idS4 && idS4a) updates.push({ id: idS4a, conditional_logic: { questionId: idS4, expectedValue: 'Yes' } });

  for (const update of updates) {
    await supabase.from('questions').update({ conditional_logic: update.conditional_logic }).eq('id', update.id);
  }
  console.log('Conditional logic updated for S1a, S2a, S3a, S4a.');

  // 2. CPT TASK BUILDER SEEDING
  // First, we might need to delete old single_choice lotteries to avoid duplication,
  // but it's safer to just insert the new ones and let the admin delete duplicates if needed.
  // Actually, we can delete the old ones based on their block_name.
  console.log('Deleting old single_choice lotteries...');
  const { error: delError } = await supabase.from('questions')
    .delete()
    .in('block_name', [
      'α (alpha) — Value sensitivity for gains',
      'β (beta) — Value sensitivity for losses',
      'λ (lambda) — Loss aversion'
    ]);
  
  if (delError) console.error('Failed to delete old lotteries:', delError.message);

  const cptTasks = [];
  let orderIndexOffset = 1000;

  const addLottery = (block, title, sure, gambA, probA, gambB, probB) => {
    cptTasks.push({
      id: crypto.randomUUID(),
      block_name: block, // 'CPT Tasks'
      question_text: title,
      type: 'lottery',
      order_index: orderIndexOffset++,
      required: true,
      options: [{
        sureAmount: sure,
        gamble: `${probA}% chance to win ${gambA} or ${probB}% chance to win ${gambB}`,
        raw: {
          title: title,
          sure_amount: sure,
          gamble_a_amount: gambA,
          gamble_a_prob: probA,
          gamble_b_amount: gambB,
          gamble_b_prob: probB
        }
      }]
    });
  };

  const blockAlpha = 'α (alpha) — Value sensitivity for gains';
  const blockBeta = 'β (beta) — Value sensitivity for losses';
  const blockLambda = 'λ (lambda) — Loss aversion';

  // G1
  [200000, 400000, 600000, 800000, 1000000, 1200000].forEach((s, i) => {
    addLottery(blockAlpha, `G1${String.fromCharCode(97+i)}.`, s, 1500000, 50, 0, 50);
  });
  // G2
  [100000, 200000, 300000, 400000, 500000, 550000].forEach((s, i) => {
    addLottery(blockAlpha, `G2${String.fromCharCode(97+i)}.`, s, 600000, 50, 0, 50);
  });
  // G3
  [400000, 800000, 1200000, 1600000, 2000000, 2400000].forEach((s, i) => {
    addLottery(blockAlpha, `G3${String.fromCharCode(97+i)}.`, s, 3000000, 50, 0, 50);
  });

  // L1
  [-200000, -400000, -600000, -800000, -1000000, -1200000].forEach((s, i) => {
    addLottery(blockBeta, `L1${String.fromCharCode(97+i)}.`, s, -1500000, 50, 0, 50);
  });
  // L2
  [-100000, -200000, -300000, -400000, -500000, -550000].forEach((s, i) => {
    addLottery(blockBeta, `L2${String.fromCharCode(97+i)}.`, s, -600000, 50, 0, 50);
  });
  // L3
  [-400000, -800000, -1200000, -1600000, -2000000, -2400000].forEach((s, i) => {
    addLottery(blockBeta, `L3${String.fromCharCode(97+i)}.`, s, -3000000, 50, 0, 50);
  });

  // M1
  [400000, 600000, 800000, 1000000, 1200000].forEach((g, i) => {
    addLottery(blockLambda, `M1${String.fromCharCode(97+i)}.`, 0, g, 50, -500000, 50);
  });
  // M2
  [600000, 800000, 1000000, 1400000, 1800000].forEach((g, i) => {
    addLottery(blockLambda, `M2${String.fromCharCode(97+i)}.`, 0, g, 50, -1000000, 50);
  });
  // M3
  [150000, 250000, 350000, 500000].forEach((g, i) => {
    addLottery(blockLambda, `M3${String.fromCharCode(97+i)}.`, 0, g, 50, -200000, 50);
  });

  console.log(`Inserting ${cptTasks.length} CPT lottery tasks...`);
  const { error: insertError } = await supabase.from('questions').insert(cptTasks);
  
  if (insertError) {
    console.error('Error inserting CPT tasks:', insertError);
    process.exit(1);
  }

  console.log('CPT tasks inserted successfully!');
}

run().catch(console.error);
