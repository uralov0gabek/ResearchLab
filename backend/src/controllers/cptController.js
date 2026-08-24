const { supabase } = require('../config/supabase');

const getCptTasks = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('cpt_tasks')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    next(error);
  }
};

const createCptTask = async (req, res, next) => {
  try {
    const { title, sure_amount, gamble_a_amount, gamble_a_prob, gamble_b_amount, gamble_b_prob } = req.body;
    
    if (!title || typeof title !== 'string' || sure_amount === undefined || gamble_a_amount === undefined) {
      const error = new Error('Invalid or missing required task fields');
      error.statusCode = 400;
      throw error;
    }

    const { data, error } = await supabase
      .from('cpt_tasks')
      .insert([{
        title,
        sure_amount,
        gamble_a_amount,
        gamble_a_prob,
        gamble_b_amount,
        gamble_b_prob
      }])
      .select()
      .single();
      
    if (error) throw error;
    res.json(data);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCptTasks,
  createCptTask
};
