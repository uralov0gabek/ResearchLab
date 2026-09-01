const { supabaseAdmin } = require('../config/supabase');
const AppError = require('../utils/AppError');

const fetchQuestions = async () => {
  const { data, error } = await supabaseAdmin.from('questions').select('*').order('order_index', { ascending: true });
  if (error) throw new AppError(error.message || 'Database error while fetching questions', 500);
  return data;
};

const saveQuestions = async (questionsToUpsert, idsToDelete) => {
  if (questionsToUpsert && questionsToUpsert.length > 0) {
    console.log('Upserting questions:', JSON.stringify(questionsToUpsert, null, 2));
    const { error } = await supabaseAdmin.from('questions').upsert(questionsToUpsert);
    if (error) {
      console.error('Supabase Upsert Error:', error);
      throw new AppError(error.message || 'Error upserting questions', 500);
    }
  }

  if (idsToDelete && idsToDelete.length > 0) {
    const { error } = await supabaseAdmin.from('questions').delete().in('id', idsToDelete);
    if (error) throw new AppError(error.message || 'Error deleting questions', 500);
  }

  return true;
};

module.exports = {
  fetchQuestions,
  saveQuestions
};
