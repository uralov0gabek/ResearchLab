const { supabaseAdmin } = require('../config/supabase');

const submitResponse = async (req, res, next) => {
  try {
    const { answers, userId, calculated_cpt_parameters } = req.body;
    
    if (!answers || typeof answers !== 'object') {
      const error = new Error('Missing or invalid answers');
      error.statusCode = 400;
      throw error;
    }

    // Insert into responses table
    const { error: responseError } = await supabaseAdmin
      .from('responses')
      .insert({
        user_id: userId || null,
        answers,
        calculated_cpt_parameters,
        completed_at: new Date().toISOString()
      });

    if (responseError) throw responseError;

    res.json({ success: true });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Database error' });
  }
};

const getResponses = async (req, res, next) => {
  try {
    const { data: responses, error: respError } = await supabaseAdmin
      .from('responses')
      .select('*')
      .order('completed_at', { ascending: false, nullsFirst: false });
    
    if (respError) throw respError;

    const processed = responses.map(r => {
      const cpt = r.calculated_cpt_parameters || {};
      
      return {
        id: r.id,
        user_id: r.user_id,
        date: new Date(r.completed_at || r.started_at || new Date()).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }),
        alpha: cpt.alpha?.toFixed(3) || 'N/A',
        beta: cpt.beta?.toFixed(3) || 'N/A',
        lambda: cpt.lambda?.toFixed(3) || 'N/A',
      };
    });

    res.json({ responses: processed });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Database error' });
  }
};

module.exports = {
  submitResponse,
  getResponses
};
