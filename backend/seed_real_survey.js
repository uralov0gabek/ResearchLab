require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const generateUUID = () => crypto.randomUUID();

const questions = [];
let order = 0;

// Helper to push questions
function addQ(block_name, question_text, type, options = null, conditional_logic = null, required = true, id = generateUUID()) {
  order += 10;
  questions.push({ id, block_name, question_text, type, options, conditional_logic, order_index: order, required });
  return id;
}

// ---------------------------------------------------------
// SECTION A: Demographics
// ---------------------------------------------------------
addQ("Section A. Basic demographics", "D1. In what year were you born?", "number_input");
addQ("Section A. Basic demographics", "D2. What is your gender?", "single_choice", [
  "Male", "Female", "Prefer not to say"
]);
addQ("Section A. Basic demographics", "D3. What is the highest level of education you have completed?", "single_choice", [
  "Less than secondary school", "Secondary school", "Vocational/college", "Bachelor's degree", "Master's degree or higher"
]);

// ---------------------------------------------------------
// SECTION B: Formative years
// ---------------------------------------------------------
addQ("Section B. Formative years (ages 15–24)", "F1. In which country did you live for most of the time between ages 15 and 24?", "short_text");
addQ("Section B. Formative years (ages 15–24)", "F2. In which region/city did you live for most of the time between ages 15 and 24?", "short_text");
addQ("Section B. Formative years (ages 15–24)", "F3. In which year did you first start working full-time (or running your own business) for at least 6 months?", "number_input");

// ---------------------------------------------------------
// SECTION C: Family economic shocks
// ---------------------------------------------------------
const s1_id = addQ("Section C. Family economic shocks", "S1. Did the main earner in your household lose their job for economic reasons when you were 15–24?", "single_choice", [
  "Yes", "No", "Don't know / don't remember"
]);
addQ("Section C. Family economic shocks", "S1a. Around which year did this happen?", "number_input", null, { questionId: s1_id, expectedValue: "Yes" });

const s2_id = addQ("Section C. Family economic shocks", "S2. During that same period (15–24), did your household experience long delays in wage payments?", "single_choice", [
  "Yes", "No", "Don't know / don't remember"
]);
addQ("Section C. Family economic shocks", "S2a. Around which year did this happen?", "number_input", null, { questionId: s2_id, expectedValue: "Yes" });

const s3_id = addQ("Section C. Family economic shocks", "S3. During that period, did your household lose a large part of its savings because of inflation, currency reform, or devaluation?", "single_choice", [
  "Yes", "No", "Don't know / don't remember"
]);
addQ("Section C. Family economic shocks", "S3a. Around which year did this happen?", "number_input", null, { questionId: s3_id, expectedValue: "Yes" });

const s4_id = addQ("Section C. Family economic shocks", "S4. Between ages 15 and 24, did your household move to another city or country mainly for economic reasons?", "single_choice", [
  "Yes", "No"
]);
addQ("Section C. Family economic shocks", "S4a. From which place to which place did you move?", "short_text", null, { questionId: s4_id, expectedValue: "Yes" });
addQ("Section C. Family economic shocks", "S4b. Around which year did this happen?", "number_input", null, { questionId: s4_id, expectedValue: "Yes" });

// ---------------------------------------------------------
// SECTION D: Family background
// ---------------------------------------------------------
addQ("Section D. Family background", "B1. What was your mother’s highest level of education when you were around 15?", "single_choice", [
  "Less than secondary", "Secondary", "Vocational/college", "University degree", "Don't know"
]);
addQ("Section D. Family background", "B2. What was your father’s highest level of education when you were around 15?", "single_choice", [
  "Less than secondary", "Secondary", "Vocational/college", "University degree", "Don't know"
]);
addQ("Section D. Family background", "B3. What was your family’s economic situation when you were around 15?", "single_choice", [
  "Much worse off than most", "Worse off than most", "About average", "Better off than most", "Much better off than most"
]);
addQ("Section D. Family background", "B4. Did either of your parents run a business or work as an entrepreneur when you were growing up?", "single_choice", [
  "Yes, one parent", "Yes, both parents", "No", "Don't know"
]);

// ---------------------------------------------------------
// SECTION E: Current role and outcomes
// ---------------------------------------------------------
const r1_id = addQ("Section E. Current role and outcomes", "R1. What best describes your main current activity?", "single_choice", [
  "I run my own business mainly because I had no better job options",
  "I run my own business mainly because I saw a good opportunity",
  "I work as an employee (salary or wage)",
  "I am an investor / business angel / venture capitalist",
  "I am a student",
  "I am unemployed",
  "Other"
]);

// Conditional logic for R2a, R2b, R2c: if entrepreneur
const entrepreneurLogic = {
  operator: "OR",
  rules: [
    { questionId: r1_id, expectedValue: "I run my own business mainly because I had no better job options" },
    { questionId: r1_id, expectedValue: "I run my own business mainly because I saw a good opportunity" }
  ]
};

addQ("Section E. Current role and outcomes", "R2a. Is your business legally registered as a company?", "single_choice", [
  "Legally registered company", "Self-employed / unregistered", "I do not run a business"
], entrepreneurLogic);
addQ("Section E. Current role and outcomes", "R2b. How many employees (excluding yourself) does your business currently have?", "single_choice", [
  "0", "1–4", "5–19", "20 or more"
], entrepreneurLogic);
addQ("Section E. Current role and outcomes", "R2c. In the last 12 months, what was the approximate total revenue of your business?", "single_choice", [
  "Very small (under 10M UZS)", "Small (10M - 50M UZS)", "Medium (50M - 500M UZS)", "Large (above 500M UZS)"
], entrepreneurLogic);

addQ("Section E. Current role and outcomes", "R3. What is your personal monthly income (from all sources) before taxes?", "single_choice", [
  "Less than 5M UZS", "5M - 15M UZS", "15M - 30M UZS", "More than 30M UZS"
]);
addQ("Section E. Current role and outcomes", "R4. Do you or your household own the dwelling you currently live in?", "single_choice", [
  "Yes", "No"
]);

// ---------------------------------------------------------
// BLOCK 1: Gains Lotteries
// ---------------------------------------------------------
const gainGamble = (win) => `50% chance to win ${win.toLocaleString()} UZS, 50% chance to win 0 UZS`;
addQ("Block 1. Gain Lotteries", "G1. You have a 50% chance to win 1,500,000 UZS and a 50% chance to win 0 UZS.", "lottery", 
  [200000, 400000, 600000, 800000, 1000000, 1200000].map((sureAmount, i) => ({ id: i, sureAmount, gamble: gainGamble(1500000) }))
, null, true, "11111111-2222-3333-4444-100000000001");
addQ("Block 1. Gain Lotteries", "G2. You have a 50% chance to win 600,000 UZS and a 50% chance to win 0 UZS.", "lottery", 
  [100000, 200000, 300000, 400000, 500000, 550000].map((sureAmount, i) => ({ id: i, sureAmount, gamble: gainGamble(600000) }))
, null, true, "11111111-2222-3333-4444-100000000002");
addQ("Block 1. Gain Lotteries", "G3. You have a 50% chance to win 3,000,000 UZS and a 50% chance to win 0 UZS.", "lottery", 
  [400000, 800000, 1200000, 1600000, 2000000, 2400000].map((sureAmount, i) => ({ id: i, sureAmount, gamble: gainGamble(3000000) }))
, null, true, "11111111-2222-3333-4444-100000000003");

// ---------------------------------------------------------
// BLOCK 2: Loss Lotteries
// ---------------------------------------------------------
const lossGamble = (lose) => `50% chance to lose ${Math.abs(lose).toLocaleString()} UZS, 50% chance to lose 0 UZS`;
addQ("Block 2. Loss Lotteries", "L1. You have a 50% chance to lose 1,500,000 UZS and a 50% chance to lose 0 UZS.", "lottery", 
  [-200000, -400000, -600000, -800000, -1000000, -1200000].map((sureAmount, i) => ({ id: i, sureAmount, gamble: lossGamble(-1500000) }))
, null, true, "11111111-2222-3333-4444-200000000001");
addQ("Block 2. Loss Lotteries", "L2. You have a 50% chance to lose 600,000 UZS and a 50% chance to lose 0 UZS.", "lottery", 
  [-100000, -200000, -300000, -400000, -500000, -550000].map((sureAmount, i) => ({ id: i, sureAmount, gamble: lossGamble(-600000) }))
, null, true, "11111111-2222-3333-4444-200000000002");
addQ("Block 2. Loss Lotteries", "L3. You have a 50% chance to lose 3,000,000 UZS and a 50% chance to lose 0 UZS.", "lottery", 
  [-400000, -800000, -1200000, -1600000, -2000000, -2400000].map((sureAmount, i) => ({ id: i, sureAmount, gamble: lossGamble(-3000000) }))
, null, true, "11111111-2222-3333-4444-200000000003");

// ---------------------------------------------------------
// BLOCK 3: Mixed Lotteries
// ---------------------------------------------------------
const mixedGamble = (win, lose) => `50% chance to win ${win.toLocaleString()} UZS, 50% chance to lose ${Math.abs(lose).toLocaleString()} UZS`;
addQ("Block 3. Mixed Lotteries", "M1. Choose between 0 UZS for sure and a gamble where you can lose 500,000 UZS.", "lottery", 
  [400000, 600000, 800000, 1000000, 1200000].map((winAmount, i) => ({ id: i, sureAmount: 0, gamble: mixedGamble(winAmount, -500000) }))
, null, true, "11111111-2222-3333-4444-300000000001");
addQ("Block 3. Mixed Lotteries", "M2. Choose between 0 UZS for sure and a gamble where you can lose 1,000,000 UZS.", "lottery", 
  [600000, 800000, 1000000, 1400000, 1800000].map((winAmount, i) => ({ id: i, sureAmount: 0, gamble: mixedGamble(winAmount, -1000000) }))
, null, true, "11111111-2222-3333-4444-300000000002");
addQ("Block 3. Mixed Lotteries", "M3. Choose between 0 UZS for sure and a gamble where you can lose 200,000 UZS.", "lottery", 
  [150000, 250000, 350000, 500000].map((winAmount, i) => ({ id: i, sureAmount: 0, gamble: mixedGamble(winAmount, -200000) }))
, null, true, "11111111-2222-3333-4444-300000000003");

// ---------------------------------------------------------
// SECTION F: UzCombinator
// ---------------------------------------------------------
const f0_id = addQ("Section F. UzCombinator", "F0. Have you ever applied to UzCombinator (or seriously considered applying)?", "single_choice", [
  "Yes, I applied", "I considered applying but did not submit", "No"
]);

const appliedLogic = { operator: "OR", rules: [{ questionId: f0_id, expectedValue: "Yes, I applied" }, { questionId: f0_id, expectedValue: "I considered applying but did not submit" }] };

addQ("Section F. UzCombinator", "Q1. What were your main reasons for applying (or considering applying)?", "multiple_choice", [
  "Access to mentoring and know-how", "Help with product development and validation", "Help entering international markets", "Network of investors and partners", "Stipend / financial support", "Reputation / signalling (being selected)"
], appliedLogic);
addQ("Section F. UzCombinator", "Q2. Which of these was the most important single reason for you?", "single_choice", [
  "Mentoring and know-how", "Product / MVP support", "Investor access", "International expansion", "Financial support", "Signalling / brand"
], appliedLogic);
addQ("Section F. UzCombinator", "Q3. Before applying, how strongly did you agree with: 'UzCombinator would significantly increase my startup’s chances of long-term success.'", "slider", { min: 1, max: 5 }, appliedLogic);

const isFounderLogic = { operator: "OR", rules: [{ questionId: r1_id, expectedValue: "I run my own business mainly because I had no better job options" }, { questionId: r1_id, expectedValue: "I run my own business mainly because I saw a good opportunity" }] };

addQ("Section F. Exit Plan", "Q4. What is your current preferred exit path for your startup?", "single_choice", [
  "Build for long-term cash-flow", "Sell to a local company (trade sale)", "Sell to an international company (acquisition)", "IPO on a local exchange", "IPO on an international exchange", "Not sure yet"
], isFounderLogic);
addQ("Section F. Exit Plan", "Q5. Over what time horizon do you imagine a major exit or liquidity event?", "single_choice", [
  "Within 3 years", "3–5 years", "5–10 years", "More than 10 years", "No exit planned / not sure"
], isFounderLogic);
addQ("Section F. Exit Plan", "Q6. I would accept significant dilution if it strongly increases the chance of a large exit.", "slider", { min: 1, max: 5 }, isFounderLogic);

const strictlyAppliedLogic = { questionId: f0_id, expectedValue: "Yes, I applied" };
addQ("Section F. UzCombinator Decisions", "Q7. What was the outcome of your latest UzCombinator application?", "single_choice", [
  "My startup was accepted", "My startup was rejected", "I started but did not finish the application"
], strictlyAppliedLogic);
addQ("Section F. UzCombinator Decisions", "Q9. Which factors do you believe UzCombinator cared most about when evaluating your startup?", "multiple_choice", [
  "Innovativeness of the idea", "Market size and scalability", "Team commitment and resilience", "Traction (users, revenue)", "Pitch quality", "English / communication skills"
], strictlyAppliedLogic);

// ---------------------------------------------------------
// SECTION H & I: Psychology
// ---------------------------------------------------------
addQ("Section H. Psychology and lifestyle", "Q13. Which free-time activities do you regularly engage in?", "multiple_choice", [
  "Team sports", "Individual competitive sports", "Outdoor activities (hiking, climbing)", "High-speed or extreme sports", "Creative hobbies", "Gaming, online competitions", "Reading, studying, quiet hobbies"
]);
addQ("Section H. Psychology and lifestyle", "Q14. 'In my free time, I often choose activities that feel intense or challenging.'", "slider", { min: 1, max: 5 });
addQ("Section H. Psychology and lifestyle", "Q15. Imagine you have a free Sunday. Which plan would you usually choose?", "single_choice", [
  "Mostly Plan A: Relax at home, meet friends, watch a movie.",
  "Mostly Plan B: Try a new, challenging activity (e.g. mountain biking) that could go badly or very well.",
  "Depends strongly on my mood / workload"
]);

addQ("Section I. General psychology", "Q16. 'I am comfortable making decisions when the outcome is uncertain, as long as the upside could be large.'", "slider", { min: 1, max: 5 });
addQ("Section I. General psychology", "Q17. After a big setback in your startup or work life, how do you usually react?", "slider", { min: 1, max: 5 });

async function runSeed() {
  console.log(`🧹 Eski savollarni tozalash...`);
  await supabase.from('questions').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

  console.log(`🌱 ${questions.length} ta yangi haqiqiy savollar bazaga yozilmoqda...`);
  
  // Slice array into chunks of 10 for upsert to prevent size limits
  for (let i = 0; i < questions.length; i += 10) {
    const chunk = questions.slice(i, i + 10);
    const { error } = await supabase.from('questions').upsert(chunk);
    if (error) {
      console.error(`❌ Xatolik yuz berdi chunk ${i}:`, error.message);
      return;
    }
  }

  console.log(`✅ Barcha savollar muvaffaqiyatli saqlandi! Loyiha ishlab chiqarish (production) ga tayyor!`);
}

runSeed();
