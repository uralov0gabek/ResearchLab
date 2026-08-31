const { supabase } = require('../config/supabase');

const getQuestions = async (req, res, next) => {
  try {
    let query = supabase.from('questions').select('*').order('order_index', { ascending: true });

    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (error) {
    next(error);
  }
};

const upsertQuestions = async (req, res, next) => {
  try {
    const { questionsToUpsert, idsToDelete } = req.body;

    if (questionsToUpsert && questionsToUpsert.length > 0) {
      const { error } = await supabase.from('questions').upsert(questionsToUpsert);
      if (error) throw error;
    }

    if (idsToDelete && idsToDelete.length > 0) {
      const { error } = await supabase.from('questions').delete().in('id', idsToDelete);
      if (error) throw error;
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getQuestions,
  upsertQuestions
};
