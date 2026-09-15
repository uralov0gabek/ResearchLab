require('dotenv').config();
const { supabaseAdmin } = require('./src/config/supabase');
async function run() {
  const { data, error } = await supabaseAdmin.from('questions').select('id, question_text, title');
  console.log("Error:", error);
  console.log("Data length:", data ? data.length : 0);
  if(data && data.length > 0) console.log(data[0]);
}
run();
