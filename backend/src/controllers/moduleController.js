const { supabase } = require('../config/supabase');

const getModules = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('survey_modules')
      .select('*, questions(count)')
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    next(error);
  }
};

const createModule = async (req, res, next) => {
  try {
    const { title, status } = req.body;
    if (!title || typeof title !== 'string') {
      const error = new Error('Invalid or missing title');
      error.statusCode = 400;
      throw error;
    }
    const { data, error } = await supabase
      .from('survey_modules')
      .insert([{ title, status: status || 'draft' }])
      .select()
      .single();
      
    if (error) throw error;
    res.json(data);
  } catch (error) {
    next(error);
  }
};

const deleteModule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('survey_modules').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getModules,
  createModule,
  deleteModule
};
