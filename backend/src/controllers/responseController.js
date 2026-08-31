const { supabase } = require('../config/supabase');
const { calculateCPTParameters, extractGeneration, extractRole } = require('../utils/mathEngine');

const submitResponse = async (req, res, next) => {
  try {
    const { sessionId, answers, email } = req.body;
    
    if (!sessionId || typeof sessionId !== 'string' || !answers || typeof answers !== 'object') {
      const error = new Error('Missing or invalid sessionId or answers');
      error.statusCode = 400;
      throw error;
    }

    // 1. Insert into responses table
    const { error: responseError } = await supabase
      .from('responses')
      .insert({
        id: sessionId,
        session_id: sessionId,
        completed_at: new Date().toISOString()
      });

    if (responseError) throw responseError;

    // 2. Insert into answers table
    const answersData = Object.entries(answers).map(([question_id, value]) => ({
      response_id: sessionId,
      question_id,
      value
    }));

    if (answersData.length > 0) {
      const { error: answersError } = await supabase
        .from('answers')
        .insert(answersData);
      if (answersError) throw answersError;
    }

    // 3. Compute and Insert CPT Results
    const { data: cptTasks, error: cptTasksError } = await supabase.from('cpt_tasks').select('*');
    if (!cptTasksError && cptTasks && cptTasks.length > 0) {
      const { alpha, beta, lambda, gamma, delta } = calculateCPTParameters(answers, cptTasks);
      
      const { error: cptResultError } = await supabase
        .from('cpt_results')
        .insert({
          response_id: sessionId,
          alpha, beta, lambda, gamma, delta
        });
      
      if (cptResultError) console.error("Error inserting CPT results:", cptResultError);
    }

    // 4. Optionally insert email detached
    if (email) {
      const { error: emailError } = await supabase
        .from('respondent_emails')
        .insert({ email });
      if (emailError) console.error("Error inserting email:", emailError);
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

const getResponses = async (req, res, next) => {
  try {
    const { data: responses, error: respError } = await supabase
      .from('responses')
      .select('*')
      .order('created_at', { ascending: false, nullsFirst: false });
    
    if (respError) throw respError;

    const { data: answers, error: ansError } = await supabase.from('answers').select('*');
    if (ansError) throw ansError;

    const { data: cptResults, error: cptError } = await supabase.from('cpt_results').select('*');
    if (cptError) throw cptError;

    const answersByResponse = {};
    answers?.forEach(a => {
      if (!answersByResponse[a.response_id]) answersByResponse[a.response_id] = {};
      answersByResponse[a.response_id][a.question_id] = a.value;
    });

    const cptByResponse = {};
    cptResults?.forEach(c => {
      cptByResponse[c.response_id] = c;
    });

    const processed = responses.map(r => {
      const rAnswers = answersByResponse[r.id] || {};
      const cpt = cptByResponse[r.id] || {};
      const gen = extractGeneration(rAnswers) || 'Unknown';
      const role = extractRole(rAnswers) || 'Unknown';

      return {
        id: r.id,
        session_id: r.session_id || r.id,
        date: new Date(r.created_at || r.completed_at || r.started_at || new Date()).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }),
        generation: gen,
        role: role,
        alpha: cpt.alpha?.toFixed(3) || 'N/A',
        beta: cpt.beta?.toFixed(3) || 'N/A',
        lambda: cpt.lambda?.toFixed(3) || 'N/A',
        gamma: cpt.gamma?.toFixed(3) || 'N/A',
        delta: cpt.delta?.toFixed(3) || 'N/A',
      };
    });

    res.json({ responses: processed });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitResponse,
  getResponses
};
