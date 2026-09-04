import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://cofkuydtrnajowtbfhox.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvZmt1eWR0cm5ham93dGJmaG94Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzQyMDIzOSwiZXhwIjoyMTAyOTk2MjM5fQ.YWG1Evc56JGPcH6--cipZVcyu3_SHRs6Ab8pNXFjqPQ';

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

  console.log('Login successful. Deleting old questions...');
  
  // Clear existing questions to start fresh with PDF structure
  const { error: delError } = await supabase
    .from('questions')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

  if (delError) {
    console.error('Error deleting old questions:', delError);
  }

  const questions = [];
  let orderIndex = 0;

  const add = (block, title, type, options = [], required = true, id = crypto.randomUUID()) => {
    questions.push({
      id,
      block_name: block,
      question_text: title,
      type,
      options,
      order_index: orderIndex++,
      required,
      conditional_logic: null
    });
    return id;
  };

  const addLogic = (questionId, targetQuestionId, expectedValue) => {
    const q = questions.find(q => q.id === questionId);
    if (q) {
      q.conditional_logic = { questionId: targetQuestionId, expectedValue };
    }
  };

  // Block: Basic demographics
  const blkDemo = 'Basic demographics';
  add(blkDemo, 'D1. In what year were you born?', 'number_input', []);
  add(blkDemo, 'D2. What is your gender?', 'single_choice', ['Male', 'Female', 'Prefer not to say']);
  add(blkDemo, 'D3. What is the highest level of education you have completed?', 'single_choice', [
    'Less than secondary school',
    'Secondary school',
    'Vocational/college',
    'Bachelor\'s degree',
    'Master\'s degree or higher'
  ]);

  add(blkDemo, 'F1. In which country did you live for most of the time between ages 15 and 24?', 'short_text', []);
  add(blkDemo, 'F2. In which region/city did you live for most of the time between ages 15 and 24?', 'short_text', []);
  add(blkDemo, 'F3. In which year did you first start working full-time (or running your own business) for at least 6 months?', 'number_input', []);

  const s1Id = add(blkDemo, 'S1. Did the main earner in your household lose their job for economic reasons (layoff, factory closure, privatization, etc.) when you were 15–24?', 'single_choice', ['Yes', 'No', 'Don\'t know / don\'t remember']);
  const s1aId = add(blkDemo, 'S1a. Around which year did this happen?', 'number_input', [], false);
  addLogic(s1aId, s1Id, 'Yes');

  const s2Id = add(blkDemo, 'S2. During that same period (15–24), did your household experience long delays in wage payments (for example, salaries not paid for 3 months or more)?', 'single_choice', ['Yes', 'No', 'Don\'t know / don\'t remember']);
  const s2aId = add(blkDemo, 'S2a. Around which year did this happen?', 'number_input', [], false);
  addLogic(s2aId, s2Id, 'Yes');

  const s3Id = add(blkDemo, 'S3. During that period, did your household lose a large part of its savings because of inflation, currency reform, or devaluation?', 'single_choice', ['Yes', 'No', 'Don\'t know / don\'t remember']);
  const s3aId = add(blkDemo, 'S3a. Around which year did this happen?', 'number_input', [], false);
  addLogic(s3aId, s3Id, 'Yes');

  const s4Id = add(blkDemo, 'S4. Between ages 15 and 24, did your household move to another city or country mainly for economic reasons (job loss, factory closure, lack of opportunities)?', 'single_choice', ['Yes', 'No']);
  const s4aId = add(blkDemo, 'S4a. From which place to which place did you move?', 'short_text', [], false);
  const s4bId = add(blkDemo, 'S4b. Around which year did this happen?', 'number_input', [], false);
  addLogic(s4aId, s4Id, 'Yes');
  addLogic(s4bId, s4Id, 'Yes');

  add(blkDemo, 'B1. What was your mother’s highest level of education when you were around 15?', 'single_choice', ['Less than secondary', 'Secondary', 'Vocational/college', 'University degree', 'Don\'t know']);
  add(blkDemo, 'B2. What was your father’s highest level of education when you were around 15?', 'single_choice', ['Less than secondary', 'Secondary', 'Vocational/college', 'University degree', 'Don\'t know']);
  add(blkDemo, 'B3. What was your family’s economic situation when you were around 15?', 'single_choice', ['Much worse off than most families around us', 'Worse off than most', 'About average', 'Better off than most', 'Much better off than most']);
  add(blkDemo, 'B4. Did either of your parents run a business or work as an entrepreneur (including self-employment) when you were growing up (before age 18)?', 'single_choice', ['Yes, one parent', 'Yes, both parents', 'No', 'Don\'t know']);

  add(blkDemo, 'R1. What best describes your main current activity?', 'single_choice', [
    'I run my own business mainly because I had no better job options (necessity entrepreneur)',
    'I run my own business mainly because I saw a good opportunity (opportunity entrepreneur)',
    'I work as an employee (salary or wage)',
    'I am an investor / business angel / venture capitalist',
    'I am a student',
    'I am unemployed',
    'Other'
  ]);

  add(blkDemo, 'R2a. Is your business legally registered as a company (LLC/JSC etc.), or are you self-employed without registration?', 'single_choice', ['Legally registered company', 'Self-employed / unregistered', 'I do not run a business'], false);
  add(blkDemo, 'R2b. How many employees (excluding yourself) does your business currently have?', 'single_choice', ['0', '1-4', '5-19', '20 or more'], false);
  add(blkDemo, 'R2c. In the last 12 months, what was the approximate total revenue of your business?', 'single_choice', ['Very small', 'Small', 'Medium', 'Large'], false);
  add(blkDemo, 'R3. What is your personal monthly income (from all sources) before taxes?', 'single_choice', ['Less than A UZS', 'A-B UZS', 'B-C UZS', 'More than C UZS']);
  add(blkDemo, 'R4. Do you or your household own the dwelling you currently live in?', 'single_choice', ['Yes', 'No']);


  const addLottery = (block, title, sure, gambA, probA, gambB, probB) => {
    add(block, title, 'lottery', [{
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
    }]);
  };

  const blockAlpha = 'α (alpha) — Value sensitivity for gains';
  const blockBeta = 'β (beta) — Value sensitivity for losses';
  const blockLambda = 'λ (lambda) — Loss aversion';

  // G1
  [200000, 400000, 600000, 800000, 1000000, 1200000].forEach((s, i) => {
    addLottery(blockAlpha, `G1${String.fromCharCode(97+i)}. You have a 50% chance to win 1,500,000 UZS and a 50% chance to win 0 UZS.`, s, 1500000, 50, 0, 50);
  });
  // G2
  [100000, 200000, 300000, 400000, 500000, 550000].forEach((s, i) => {
    addLottery(blockAlpha, `G2${String.fromCharCode(97+i)}. You have a 50% chance to win 600,000 UZS and a 50% chance to win 0 UZS.`, s, 600000, 50, 0, 50);
  });
  // G3
  [400000, 800000, 1200000, 1600000, 2000000, 2400000].forEach((s, i) => {
    addLottery(blockAlpha, `G3${String.fromCharCode(97+i)}. You have a 50% chance to win 3,000,000 UZS and a 50% chance to win 0 UZS.`, s, 3000000, 50, 0, 50);
  });

  // L1
  [-200000, -400000, -600000, -800000, -1000000, -1200000].forEach((s, i) => {
    addLottery(blockBeta, `L1${String.fromCharCode(97+i)}. You have a 50% chance to lose 1,500,000 UZS and a 50% chance to lose 0 UZS.`, s, -1500000, 50, 0, 50);
  });
  // L2
  [-100000, -200000, -300000, -400000, -500000, -550000].forEach((s, i) => {
    addLottery(blockBeta, `L2${String.fromCharCode(97+i)}. You have a 50% chance to lose 600,000 UZS and a 50% chance to lose 0 UZS.`, s, -600000, 50, 0, 50);
  });
  // L3
  [-400000, -800000, -1200000, -1600000, -2000000, -2400000].forEach((s, i) => {
    addLottery(blockBeta, `L3${String.fromCharCode(97+i)}. You have a 50% chance to lose 3,000,000 UZS and a 50% chance to lose 0 UZS.`, s, -3000000, 50, 0, 50);
  });

  // M1
  [400000, 600000, 800000, 1000000, 1200000].forEach((g, i) => {
    addLottery(blockLambda, `M1${String.fromCharCode(97+i)}. A gamble with a 50% chance to win money and a 50% chance to lose 500,000 UZS.`, 0, g, 50, -500000, 50);
  });
  // M2
  [600000, 800000, 1000000, 1400000, 1800000].forEach((g, i) => {
    addLottery(blockLambda, `M2${String.fromCharCode(97+i)}. A gamble with a 50% chance to win money and a 50% chance to lose 1,000,000 UZS.`, 0, g, 50, -1000000, 50);
  });
  // M3
  [150000, 250000, 350000, 500000].forEach((g, i) => {
    addLottery(blockLambda, `M3${String.fromCharCode(97+i)}. A gamble with a 50% chance to win money and a 50% chance to lose 200,000 UZS.`, 0, g, 50, -200000, 50);
  });

  // Block: Survey for accepted applicants
  const blkAccepted = 'Survey for accepted applicants';
  const f0Id = add(blkAccepted, 'F0. Have you ever applied to UzCombinator (or seriously considered applying)?', 'single_choice', ['Yes, I applied', 'I considered applying but did not submit', 'No']);
  
  add(blkAccepted, 'Q1. What were your main reasons for applying (or considering applying) to UzCombinator?', 'multiple_choice', [
    'Access to mentoring and know-how',
    'Help with product development and validation',
    'Help entering international markets',
    'Network of investors and partners',
    'Stipend / financial support',
    'Reputation / signalling (being selected)',
    'Other'
  ]);
  
  add(blkAccepted, 'Q2. Which of these was the most important single reason for you?', 'single_choice', [
    'Mentoring and know-how',
    'Product / MVP support',
    'Investor access',
    'International expansion',
    'Financial support',
    'Signalling / brand of UzCombinator',
    'Other'
  ]);

  add(blkAccepted, 'Q3. Before applying, how strongly did you agree: UzCombinator would significantly increase my startup’s chances of long-term success.', 'slider', { min: 1, max: 5, step: 1 });
  add(blkAccepted, 'Q3b. UzCombinator would help me raise venture capital or grants.', 'slider', { min: 1, max: 5, step: 1 });
  add(blkAccepted, 'Q3c. UzCombinator would help me personally grow as a founder.', 'slider', { min: 1, max: 5, step: 1 });

  add(blkAccepted, 'Q4. What is your current preferred exit path for your startup?', 'single_choice', [
    'Build for long-term cash-flow (no specific exit planned)',
    'Sell to a local company (trade sale)',
    'Sell to an international company (acquisition)',
    'IPO on a local exchange',
    'IPO on an international exchange (e.g., Nasdaq)',
    'Not sure yet'
  ]);
  
  add(blkAccepted, 'Q5. Over what time horizon do you imagine a major exit or liquidity event (if any)?', 'single_choice', [
    'Within 3 years',
    '3-5 years',
    '5-10 years',
    'More than 10 years',
    'No exit planned / not sure'
  ]);

  add(blkAccepted, 'Q6. For me, achieving a big exit is more important than staying in control of the company.', 'slider', { min: 1, max: 5, step: 1 });
  add(blkAccepted, 'Q6b. I would accept significant dilution if it strongly increases the chance of a large exit.', 'slider', { min: 1, max: 5, step: 1 });

  add(blkAccepted, 'Q7. What was the outcome of your latest UzCombinator application?', 'single_choice', [
    'My startup was accepted',
    'My startup was rejected',
    'I started but did not finish the application'
  ]);

  add(blkAccepted, 'Q8. In your own words, why do you think UzCombinator accepted or rejected your startup?', 'short_text', []);

  add(blkAccepted, 'Q9. Which factors do you believe UzCombinator cared most about when evaluating your startup?', 'multiple_choice', [
    'Innovativeness of the idea',
    'Market size and scalability',
    'Team commitment and resilience',
    'Traction (users, revenue)',
    'Pitch quality',
    'English / communication skills',
    'Other'
  ]);

  add(blkAccepted, 'Q10. I worried about the risk of failing publicly.', 'slider', { min: 1, max: 5, step: 1 });
  add(blkAccepted, 'Q10b. I felt pressure to prove myself to family, friends, or colleagues.', 'slider', { min: 1, max: 5, step: 1 });
  add(blkAccepted, 'Q10c. I saw UzCombinator as a chance to take a big leap, even if it is risky.', 'slider', { min: 1, max: 5, step: 1 });

  add(blkAccepted, 'G1. How committed do you think most accepted founders were to their startups during the program?', 'slider', { min: 1, max: 5, step: 1 });
  add(blkAccepted, 'G2. Most accepted founders were highly committed to their startups.', 'slider', { min: 1, max: 5, step: 1 });
  add(blkAccepted, 'G2b. Accepted founders regularly showed up prepared to sessions.', 'slider', { min: 1, max: 5, step: 1 });
  add(blkAccepted, 'G2c. Some accepted founders were not serious and treated UzCombinator as a side project.', 'slider', { min: 1, max: 5, step: 1 });

  add(blkAccepted, 'G3. During and after the program, how often did UzCombinator team and founders meet to track the progress of startups?', 'single_choice', [
    'Once a week',
    'Once every two weeks',
    'Once a month',
    'Less often / ad hoc',
    'I don\'t know'
  ]);

  add(blkAccepted, 'G4. Briefly describe how progress and the investment pipeline were tracked (for example, meetings, dashboards, reports).', 'short_text', []);

  add(blkAccepted, 'Q13. Which free-time activities do you regularly engage in?', 'multiple_choice', [
    'Team sports (football, basketball, etc.)',
    'Individual competitive sports (boxing, martial arts, etc.)',
    'Outdoor activities (hiking, climbing, cycling, etc.)',
    'High-speed or extreme sports (motorcycling, downhill skiing, etc.)',
    'Creative hobbies (music, writing, design)',
    'Gaming, online competitions',
    'Reading, studying, quiet hobbies',
    'Other'
  ]);

  add(blkAccepted, 'Q14. In my free time, I often choose activities that feel intense or challenging.', 'slider', { min: 1, max: 5, step: 1 });
  add(blkAccepted, 'Q14b. I enjoy situations where there is some chance of failure or danger, as long as I can learn from it.', 'slider', { min: 1, max: 5, step: 1 });

  add(blkAccepted, 'Q15. Imagine you have a free Sunday and enough money for either plan: Plan A: Relax at home, meet friends, watch a movie. Plan B: Try a new, challenging activity. Which plan would you usually choose?', 'single_choice', [
    'Mostly Plan A',
    'Mostly Plan B',
    'Depends strongly on my mood / workload'
  ]);

  add(blkAccepted, 'Q16. I prefer clear, predictable situations even if the upside is smaller.', 'slider', { min: 1, max: 5, step: 1 });
  add(blkAccepted, 'Q16b. I am comfortable making decisions when the outcome is uncertain, as long as the upside could be large.', 'slider', { min: 1, max: 5, step: 1 });

  add(blkAccepted, 'Q17. After a big setback in your startup or work life, how do you usually react?', 'single_choice', [
    'After a big setback, my first reaction is to pull back and protect what I have.',
    'After a big setback, I usually feel motivated to try a new, bolder strategy.'
  ]);

  // Add the two empty blocks requested
  add('Survey for rejected applicants', 'This section is currently empty. Please add questions here.', 'short_text', [], false);
  add('Survey for UzCombinator team', 'This section is currently empty. Please add questions here.', 'short_text', [], false);


  console.log(`Inserting ${questions.length} questions...`);

  // Insert in chunks of 50 to avoid any limits
  for (let i = 0; i < questions.length; i += 50) {
    const chunk = questions.slice(i, i + 50);
    const { error } = await supabase.from('questions').insert(chunk);
    if (error) {
      console.error('Error inserting chunk:', error);
      process.exit(1);
    }
  }

  console.log('Successfully inserted all questions to Supabase!');
}

seed().catch(console.error);
