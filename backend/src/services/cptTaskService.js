const { supabaseAdmin } = require('../config/supabase');
const AppError = require('../utils/AppError');

const fetchCptTasks = async () => {
  const { data, error } = await supabaseAdmin.from('cpt_tasks').select('*').order('created_at', { ascending: false });
  if (error) throw new AppError(error.message || 'Database error while fetching cpt tasks', 500);
  return data;
};

const createCptTask = async (taskData) => {
  const { title, sure_amount, gamble_a_amount, gamble_a_prob, gamble_b_amount, gamble_b_prob } = taskData;
  
  if (!title) {
    throw new AppError('Title is required', 400);
  }

  let block = 'mixed';
  if (title.startsWith('G')) block = 'gain';
  if (title.startsWith('L')) block = 'loss';

  const { data, error } = await supabaseAdmin.from('cpt_tasks').insert([{
    title,
    block,
    sure_amount,
    gamble_a_amount,
    gamble_a_prob,
    gamble_b_amount,
    gamble_b_prob
  }]);

  if (error) throw new AppError(error.message || 'Database error while creating task', 500);
  return data;
};

module.exports = {
  fetchCptTasks,
  createCptTask
};
