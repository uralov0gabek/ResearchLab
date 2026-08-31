const { supabaseAdmin } = require('../config/supabase');

const getQuestions = async (req, res, next) => {
  try {
    let query = supabaseAdmin.from('questions').select('*').order('order_index', { ascending: true });

    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Database error' });
  }
};

const upsertQuestions = async (req, res, next) => {
  try {
    const { questionsToUpsert, idsToDelete } = req.body;

    if (questionsToUpsert && questionsToUpsert.length > 0) {
      const { error } = await supabaseAdmin.from('questions').upsert(questionsToUpsert);
      if (error) throw error;
    }

    if (idsToDelete && idsToDelete.length > 0) {
      const { error } = await supabaseAdmin.from('questions').delete().in('id', idsToDelete);
      if (error) throw error;
    }

    res.json({ success: true });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Database error' });
  }
};

module.exports = {
  getQuestions,
  upsertQuestions
};
