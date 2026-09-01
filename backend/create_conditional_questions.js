require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

async function createConditionalQuestions() {
  console.log(`🚀 Shartli (Conditional) savollar bazaga yuklanmoqda...`);

  // Maxsus ID'larni oldindan belgilaymiz, shartlar to'g'ri bog'lanishi uchun
  const q1_id = "11111111-1111-1111-1111-111111111111"; // Asosiy savol
  const q2_id = "22222222-2222-2222-2222-222222222222"; // Founder savoli
  const q3_id = "33333333-3333-3333-3333-333333333333"; // VC savoli
  const q4_id = "44444444-4444-4444-4444-444444444444"; // Worker savoli

  const conditionalQuestions = [
    {
      id: q1_id,
      block_name: "Kasbiy ma'lumotlar",
      question_text: "Sizning kasbingiz nima?",
      type: "single_choice",
      options: [
        { id: "Founder", text: "Founder (Asoschi)" },
        { id: "VC", text: "VC (Investor)" },
        { id: "Worker", text: "Worker (Xodim)" }
      ],
      conditional_logic: null, // Barchaga ko'rinadi
      order_index: 2000,
      required: true
    },
    {
      id: q2_id,
      block_name: "Founderlar uchun",
      question_text: "Kompaniyangiz qachon tashkil etilgan?",
      type: "short_text",
      options: null,
      conditional_logic: {
        questionId: q1_id,
        expectedValue: "Founder" // Faqat q1 da Founder ni tanlasa ko'rinadi
      },
      order_index: 2001,
      required: true
    },
    {
      id: q3_id,
      block_name: "Investorlar uchun (VC)",
      question_text: "Qanday sohalardagi startaplarga sarmoya kiritasiz?",
      type: "multiple_choice",
      options: [
        { id: "IT", text: "IT va Dasturlash" },
        { id: "Med", text: "Tibbiyot" },
        { id: "Fintech", text: "Moliya (Fintech)" }
      ],
      conditional_logic: {
        questionId: q1_id,
        expectedValue: "VC" // Faqat VC ni tanlasa ko'rinadi
      },
      order_index: 2002,
      required: true
    },
    {
      id: q4_id,
      block_name: "Xodimlar uchun",
      question_text: "Hozirgi ish joyingizda necha yildan beri ishlaysiz?",
      type: "number_input",
      options: null,
      conditional_logic: {
        questionId: q1_id,
        expectedValue: "Worker" // Faqat Worker ni tanlasa ko'rinadi
      },
      order_index: 2003,
      required: true
    }
  ];

  const { error } = await supabase.from('questions').upsert(conditionalQuestions);
  
  if (error) {
    console.error(`❌ Xatolik yuz berdi:`, error.message);
  } else {
    console.log(`✅ Shartli savollar bazaga muvaffaqiyatli saqlandi!`);
    console.log(`Endi saytingizga (Vercel) kirib tekshirib ko'rishingiz mumkin.`);
  }
}

createConditionalQuestions();
