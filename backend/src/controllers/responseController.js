const { supabase } = require('../config/supabase');
const { calculateRiskAversion, calculateLossAversion, extractGeneration, extractRole } = require('../utils/mathEngine');

const submitResponse = async (req, res, next) => {
  try {
    const { sessionId, answers } = req.body;
    
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

    const { error: answersError } = await supabase
      .from('answers')
      .insert(answersData);

    if (answersError) throw answersError;

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

    const answersByResponse = {};
    answers?.forEach(a => {
      if (!answersByResponse[a.response_id]) answersByResponse[a.response_id] = {};
      answersByResponse[a.response_id][a.question_id] = a.value;
    });

    const processed = responses.map(r => {
      const rAnswers = answersByResponse[r.id] || {};
      const gen = extractGeneration(rAnswers) || 'Unknown';
      const role = extractRole(rAnswers) || 'Unknown';
      const risk = calculateRiskAversion(rAnswers);
      const loss = calculateLossAversion(rAnswers);

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
        riskTolerance: risk.toFixed(2),
        lossAversion: loss.toFixed(2)
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
