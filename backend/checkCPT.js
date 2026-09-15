require('dotenv').config();
const { supabaseAdmin } = require('./src/config/supabase');

async function check() {
  const { data, error } = await supabaseAdmin.from('cpt_tasks').select('*');
  if (error) console.error(error);
  console.log('cpt_tasks count:', data ? data.length : 0);
}
check();
