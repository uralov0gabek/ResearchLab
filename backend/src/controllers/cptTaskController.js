const { supabaseAdmin } = require('../config/supabase');

const getTasks = async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin.from('cpt_tasks').select('*').order('created_at', { ascending: false });
    if (error) {
        return res.status(400).json({ error: error.message || 'Database error' });
    }
    res.json(data);
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Database error' });
  }
};

const createTask = async (req, res, next) => {
  try {
    const { title, sure_amount, gamble_a_amount, gamble_a_prob, gamble_b_amount, gamble_b_prob } = req.body;
    
    if (!title) {
        return res.status(400).json({ error: 'Title is required' });
    }

    const { data, error } = await supabaseAdmin.from('cpt_tasks').insert([{
      title,
      sure_amount,
      gamble_a_amount,
      gamble_a_prob,
      gamble_b_amount,
      gamble_b_prob
    }]);

    if (error) {
        return res.status(400).json({ error: error.message || 'Database error' });
    }

    res.json({ success: true, data });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Database error' });
  }
};

module.exports = {
  getTasks,
  createTask
};
