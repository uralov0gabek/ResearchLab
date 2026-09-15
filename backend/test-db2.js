require('dotenv').config();
const { supabaseAdmin } = require('./src/config/supabase');
async function run() {
  const { data, error } = await supabaseAdmin.from('questions').select('*').limit(1);
  console.log("Error:", error);
  console.log(data);
}
run();
