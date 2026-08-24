const { supabase } = require('../config/supabase');

const getQuestions = async (req, res, next) => {
  try {
    const moduleId = req.query.module_id;
    
    let query = supabase.from('questions').select('*');
    if (moduleId) {
      query = query.eq('module_id', moduleId);
      query = query.order('order_index', { ascending: true });
    } else {
      query = query.order('created_at', { ascending: true });
    }

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
