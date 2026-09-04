const { supabaseAdmin } = require('../config/supabase');
const { calculateCPTParameters } = require('./cptService');
const AppError = require('../utils/AppError');

/**
 * Handles saving responses and calculating CPT parameters dynamically
 * @param {string} userId - User identifier (session ID or UUID)
 * @param {Object} answers - Object mapping question IDs to answer payloads
 * @returns {Promise<boolean>} - Success status
 */
const saveResponse = async (userId, answers) => {
  if (!answers || typeof answers !== 'object') {
    throw new AppError('Missing or invalid answers', 400);
  }

  // Fetch CPT tasks for calculation
  const { data: cptTasks, error: cptError } = await supabaseAdmin.from('cpt_tasks').select('*');
  if (cptError) {
    console.error('Failed to fetch cpt tasks for calculation', cptError);
    // Non-fatal, we just can't calculate CPT parameters
  }
  
  // Calculate CPT Parameters dynamically
  let final_calculated = null;
  if (cptTasks && cptTasks.length > 0) {
    final_calculated = calculateCPTParameters(answers, cptTasks);
  }

  // Inject session ID into answers for tracking without violating FK
  const finalAnswers = { ...answers, session_id: userId };

  // Insert into responses table
  const { error: responseError } = await supabaseAdmin
    .from('responses')
    .insert({
      user_id: null, // Always null for anonymous users to avoid FK violations
      answers: finalAnswers,
      calculated_cpt_parameters: final_calculated,
      completed_at: new Date().toISOString()
    });

  if (responseError) throw new AppError(responseError.message || 'Database error', 500);

  return true;
};

/**
 * Fetches all responses formatted for the admin table
 * @returns {Promise<Array>} - List of formatted responses
 */
const fetchResponses = async () => {
  const { data: responses, error: respError } = await supabaseAdmin
    .from('responses')
    .select('*')
    .order('completed_at', { ascending: false, nullsFirst: false });
  
  if (respError) throw new AppError(respError.message || 'Database error', 500);

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

  return processed;
};

module.exports = {
  saveResponse,
  fetchResponses
};
