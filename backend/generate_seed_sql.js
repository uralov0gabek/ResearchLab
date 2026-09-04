const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const generateUUID = () => crypto.randomUUID();

const questions = [];
let order = 0;

function addQ(block_name, question_text, type, options = null, conditional_logic = null, required = true, id = generateUUID()) {
  order += 10;
  questions.push({ id, block_name, question_text, type, options, conditional_logic, order_index: order, required });
  return id;
}

const cptTasks = [];
function addCPT(block, title, sure_amount, gamble_a_amount, gamble_a_prob, gamble_b_amount, gamble_b_prob, id = generateUUID()) {
  cptTasks.push({ id, title, block, sure_amount, gamble_a_amount, gamble_a_prob, gamble_b_amount, gamble_b_prob });
  return id;
}

// --- QUESTIONS ---
addQ("Section A. Basic demographics", "D1. In what year were you born?", "number_input");
addQ("Section A. Basic demographics", "D2. What is your gender?", "single_choice", [
  "Male", "Female", "Prefer not to say"
]);
addQ("Section A. Basic demographics", "D3. What is the highest level of education you have completed?", "single_choice", [
  "Less than secondary school", "Secondary school", "Vocational/college", "Bachelor's degree", "Master's degree or higher"
]);

addQ("Section B. Where you lived in formative years (ages 15-24)", "F1. In which country did you live for most of the time between ages 15 and 24?", "short_text");
addQ("Section B. Where you lived in formative years (ages 15-24)", "F2. In which region/city did you live for most of the time between ages 15 and 24?", "short_text");
addQ("Section B. Where you lived in formative years (ages 15-24)", "F3. In which year did you first start working full-time (or running your own business) for at least 6 months?", "number_input");

const s1_id = addQ("Section C. Family economic shocks during formative years", "S1. Did the main earner in your household lose their job for economic reasons (layoff, factory closure, privatization, etc.) when you were 15-24?", "single_choice", [
  "Yes", "No", "Don't know / don't remember"
]);
addQ("Section C. Family economic shocks during formative years", "S1a. Around which year did this happen?", "short_text", null, { questionId: s1_id, expectedValue: "Yes" });

const s2_id = addQ("Section C. Family economic shocks during formative years", "S2. During that same period (15-24), did your household experience long delays in wage payments (for example, salaries not paid for 3 months or more)?", "single_choice", [
  "Yes", "No", "Don't know / don't remember"
]);
addQ("Section C. Family economic shocks during formative years", "S2a. Around which year did this happen?", "short_text", null, { questionId: s2_id, expectedValue: "Yes" });

const s3_id = addQ("Section C. Family economic shocks during formative years", "S3. During that period, did your household lose a large part of its savings because of inflation, currency reform, or devaluation?", "single_choice", [
  "Yes", "No", "Don't know / don't remember"
]);
addQ("Section C. Family economic shocks during formative years", "S3a. Around which year did this happen?", "short_text", null, { questionId: s3_id, expectedValue: "Yes" });

const s4_id = addQ("Section C. Family economic shocks during formative years", "S4. Between ages 15 and 24, did your household move to another city or country mainly for economic reasons (job loss, factory closure, lack of opportunities)?", "single_choice", [
  "Yes", "No"
]);
addQ("Section C. Family economic shocks during formative years", "S4a. From which place to which place did you move?", "short_text", null, { questionId: s4_id, expectedValue: "Yes" });
addQ("Section C. Family economic shocks during formative years", "S4b. Around which year did this happen?", "short_text", null, { questionId: s4_id, expectedValue: "Yes" });

addQ("Section D. Family background", "B1. What was your mother's highest level of education when you were around 15?", "single_choice", [
  "Less than secondary", "Secondary", "Vocational/college", "University degree", "Don't know"
]);
addQ("Section D. Family background", "B2. What was your father's highest level of education when you were around 15?", "single_choice", [
  "Less than secondary", "Secondary", "Vocational/college", "University degree", "Don't know"
]);
addQ("Section D. Family background", "B3. What was your family's economic situation when you were around 15?", "single_choice", [
  "Much worse off than most families around us", "Worse off than most", "About average", "Better off than most", "Much better off than most"
]);
addQ("Section D. Family background", "B4. Did either of your parents run a business or work as an entrepreneur (including self-employment) when you were growing up (before age 18)?", "single_choice", [
  "Yes, one parent", "Yes, both parents", "No", "Don't know"
]);

const r1_id = addQ("Section E. Current role and outcomes", "R1. What best describes your main current activity?", "single_choice", [
  "I run my own business mainly because I had no better job options (necessity entrepreneur)",
  "I run my own business mainly because I saw a good opportunity (opportunity entrepreneur)",
  "I work as an employee (salary or wage)",
  "I am an investor / business angel / venture capitalist",
  "I am a student",
  "I am unemployed",
  "Other"
]);

const entrepreneurLogic = {
  operator: "OR",
  rules: [
    { questionId: r1_id, expectedValue: "I run my own business mainly because I had no better job options (necessity entrepreneur)" },
    { questionId: r1_id, expectedValue: "I run my own business mainly because I saw a good opportunity (opportunity entrepreneur)" }
  ]
};

addQ("Section E. Current role and outcomes", "R2a. Is your business legally registered as a company (LLC/JSC etc.), or are you self-employed without registration?", "single_choice", [
  "Legally registered company", "Self-employed / unregistered", "I do not run a business"
], entrepreneurLogic);
addQ("Section E. Current role and outcomes", "R2b. How many employees (excluding yourself) does your business currently have?", "single_choice", [
  "0", "1-4", "5-19", "20 or more"
], entrepreneurLogic);
addQ("Section E. Current role and outcomes", "R2c. In the last 12 months, what was the approximate total revenue of your business?", "single_choice", [
  "Very small (under 10M UZS per year)", "Small (10M-50M UZS)", "Medium (50M-500M UZS)", "Large (above 500M UZS)"
], entrepreneurLogic);

addQ("Section E. Current role and outcomes", "R3. What is your personal monthly income (from all sources) before taxes?", "single_choice", [
  "Less than 5M UZS", "5M-15M UZS", "15M-30M UZS", "More than 30M UZS"
]);
addQ("Section E. Current role and outcomes", "R4. Do you or your household own the dwelling you currently live in?", "single_choice", [
  "Yes", "No"
]);

// --- CPT ---
const G1_SURE_AMOUNTS = [200000, 400000, 600000, 800000, 1000000, 1200000];
G1_SURE_AMOUNTS.forEach((sure, i) => addCPT("gain", `G1${String.fromCharCode(97+i)}`, sure, 1500000, 50, 0, 50, `11111111-2222-3333-4444-10000000000${i}`));

const G2_SURE_AMOUNTS = [100000, 200000, 300000, 400000, 500000, 550000];
G2_SURE_AMOUNTS.forEach((sure, i) => addCPT("gain", `G2${String.fromCharCode(97+i)}`, sure, 600000, 50, 0, 50, `11111111-2222-3333-4444-10000000001${i}`));

const G3_SURE_AMOUNTS = [400000, 800000, 1200000, 1600000, 2000000, 2400000];
G3_SURE_AMOUNTS.forEach((sure, i) => addCPT("gain", `G3${String.fromCharCode(97+i)}`, sure, 3000000, 50, 0, 50, `11111111-2222-3333-4444-10000000002${i}`));

const L1_SURE_AMOUNTS = [-200000, -400000, -600000, -800000, -1000000, -1200000];
L1_SURE_AMOUNTS.forEach((sure, i) => addCPT("loss", `L1${String.fromCharCode(97+i)}`, sure, -1500000, 50, 0, 50, `11111111-2222-3333-4444-20000000000${i}`));

const L2_SURE_AMOUNTS = [-100000, -200000, -300000, -400000, -500000, -550000];
L2_SURE_AMOUNTS.forEach((sure, i) => addCPT("loss", `L2${String.fromCharCode(97+i)}`, sure, -600000, 50, 0, 50, `11111111-2222-3333-4444-20000000001${i}`));

const L3_SURE_AMOUNTS = [-400000, -800000, -1200000, -1600000, -2000000, -2400000];
L3_SURE_AMOUNTS.forEach((sure, i) => addCPT("loss", `L3${String.fromCharCode(97+i)}`, sure, -3000000, 50, 0, 50, `11111111-2222-3333-4444-20000000002${i}`));

const M1_WIN_AMOUNTS = [400000, 600000, 800000, 1000000, 1200000];
M1_WIN_AMOUNTS.forEach((win, i) => addCPT("mixed", `M1${String.fromCharCode(97+i)}`, 0, win, 50, -500000, 50, `11111111-2222-3333-4444-30000000000${i}`));

const M2_WIN_AMOUNTS = [600000, 800000, 1000000, 1400000, 1800000];
M2_WIN_AMOUNTS.forEach((win, i) => addCPT("mixed", `M2${String.fromCharCode(97+i)}`, 0, win, 50, -1000000, 50, `11111111-2222-3333-4444-30000000001${i}`));

const M3_WIN_AMOUNTS = [150000, 250000, 350000, 500000];
M3_WIN_AMOUNTS.forEach((win, i) => addCPT("mixed", `M3${String.fromCharCode(97+i)}`, 0, win, 50, -200000, 50, `11111111-2222-3333-4444-30000000002${i}`));

// --- UzC & Psychology ---
const f0_id = addQ("Section F. UzCombinator", "F0. Have you ever applied to UzCombinator (or seriously considered applying)?", "single_choice", [
  "Yes, I applied", "I considered applying but did not submit", "No"
]);

const appliedLogic = { operator: "OR", rules: [{ questionId: f0_id, expectedValue: "Yes, I applied" }, { questionId: f0_id, expectedValue: "I considered applying but did not submit" }] };

addQ("Section F. UzCombinator", "Q1. What were your main reasons for applying (or considering applying)?", "multiple_choice", [
  "Access to mentoring and know-how", "Help with product development and validation", "Help entering international markets", "Network of investors and partners", "Stipend / financial support", "Reputation / signalling (being selected)", "Other"
], appliedLogic);
addQ("Section F. UzCombinator", "Q2. Which of these was the most important single reason for you?", "single_choice", [
  "Mentoring and know-how", "Product / MVP support", "Investor access", "International expansion", "Financial support", "Signalling / brand", "Other"
], appliedLogic);
addQ("Section F. UzCombinator", "Q3. Before applying, how strongly did you agree with: 'UzCombinator would significantly increase my startup's chances of long-term success.'", "slider", { min: 1, max: 5 }, appliedLogic);

addQ("Section F. Exit Plan", "Q4. What is your current preferred exit path for your startup?", "single_choice", [
  "Build for long-term cash-flow (no specific exit planned)", "Sell to a local company (trade sale)", "Sell to an international company (acquisition)", "IPO on a local exchange", "IPO on an international exchange", "Not sure yet"
], entrepreneurLogic);
addQ("Section F. Exit Plan", "Q5. Over what time horizon do you imagine a major exit or liquidity event (if any)?", "single_choice", [
  "Within 3 years", "3-5 years", "5-10 years", "More than 10 years", "No exit planned / not sure"
], entrepreneurLogic);
addQ("Section F. Exit Plan", "Q6. For me, achieving a big exit is more important than staying in control of the company.", "slider", { min: 1, max: 5 }, entrepreneurLogic);

const strictlyAppliedLogic = { questionId: f0_id, expectedValue: "Yes, I applied" };
addQ("Section F. Experience with UzCombinator decisions", "Q7. What was the outcome of your latest UzCombinator application?", "single_choice", [
  "My startup was accepted", "My startup was rejected", "I started but did not finish the application"
], strictlyAppliedLogic);
addQ("Section F. Experience with UzCombinator decisions", "Q8. In your own words, why do you think UzCombinator accepted or rejected your startup?", "short_text", null, strictlyAppliedLogic);
addQ("Section F. Experience with UzCombinator decisions", "Q9. Which factors do you believe UzCombinator cared most about when evaluating your startup?", "multiple_choice", [
  "Innovativeness of the idea", "Market size and scalability", "Team commitment and resilience", "Traction (users, revenue)", "Pitch quality", "English / communication skills", "Other"
], strictlyAppliedLogic);

addQ("Section G. Perceptions of accepted founders", "G1. How committed do you think most accepted founders were to their startups during the program?", "slider", { min: 1, max: 5 });
addQ("Section G. Perceptions of accepted founders", "G2. 'Most accepted founders were highly committed to their startups.'", "slider", { min: 1, max: 5 });
addQ("Section G. Perceptions of accepted founders", "G3. During and after the program, how often did UzCombinator team and founders meet to track the progress of startups?", "single_choice", [
  "Once a week", "Once every two weeks", "Once a month", "Less often / ad hoc", "I don't know"
]);

addQ("Section H. Psychology and indirect risk-seeking", "Q13. Which free-time activities do you regularly engage in?", "multiple_choice", [
  "Team sports (football, basketball, etc.)", "Individual competitive sports (boxing, martial arts, etc.)", "Outdoor activities (hiking, climbing, cycling, etc.)", "High-speed or extreme sports (motorcycling, downhill skiing, etc.)", "Creative hobbies (music, writing, design)", "Gaming, online competitions", "Reading, studying, quiet hobbies", "Other"
]);
addQ("Section H. Psychology and indirect risk-seeking", "Q14. 'In my free time, I often choose activities that feel intense or challenging.'", "slider", { min: 1, max: 5 });
addQ("Section H. Psychology and indirect risk-seeking", "Q15. Imagine you have a free Sunday. Which plan would you usually choose?", "single_choice", [
  "Mostly Plan A",
  "Mostly Plan B",
  "Depends strongly on my mood / workload"
]);

addQ("Section I. General psychological framing and reactions", "Q16. 'I am comfortable making decisions when the outcome is uncertain, as long as the upside could be large.'", "slider", { min: 1, max: 5 });
addQ("Section I. General psychological framing and reactions", "Q17. After a big setback in your startup or work life, how do you usually react?", "single_choice", [
  "After a big setback, my first reaction is to pull back and protect what I have.",
  "After a big setback, I usually feel motivated to try a new, bolder strategy."
]);

const escapeSql = (str) => {
    if (str === null || str === undefined) return 'NULL';
    if (typeof str === 'string') return "'" + str.replace(/'/g, "''") + "'";
    if (typeof str === 'object') return "'" + JSON.stringify(str).replace(/'/g, "''") + "'::jsonb";
    return str;
};

let sql = `-- Seed Questions\n`;
sql += `DELETE FROM public.questions;\n`;
for (const q of questions) {
    sql += `INSERT INTO public.questions (id, block_name, question_text, type, options, conditional_logic, order_index, required) VALUES (${escapeSql(q.id)}, ${escapeSql(q.block_name)}, ${escapeSql(q.question_text)}, ${escapeSql(q.type)}, ${escapeSql(q.options)}, ${escapeSql(q.conditional_logic)}, ${q.order_index}, ${q.required});\n`;
}

sql += `\n-- Seed CPT Tasks\n`;
sql += `DELETE FROM public.cpt_tasks;\n`;
for (const t of cptTasks) {
    sql += `INSERT INTO public.cpt_tasks (id, title, block, sure_amount, gamble_a_amount, gamble_a_prob, gamble_b_amount, gamble_b_prob) VALUES (${escapeSql(t.id)}, ${escapeSql(t.title)}, ${escapeSql(t.block)}, ${t.sure_amount}, ${t.gamble_a_amount}, ${t.gamble_a_prob}, ${t.gamble_b_amount}, ${t.gamble_b_prob});\n`;
}

const outputPath = path.join(__dirname, '../supabase/seed.sql');
fs.writeFileSync(outputPath, sql);
console.log('Successfully generated supabase/seed.sql');
