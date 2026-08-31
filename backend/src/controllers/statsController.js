const { supabase } = require('../config/supabase');
const { calculateRiskAversion, calculateLossAversion, extractGeneration, extractRole } = require('../utils/mathEngine');

const getDashboardStats = async (req, res, next) => {
  try {
    const { data: responses, error: respError } = await supabase.from('responses').select('*');
    const { data: answers, error: ansError } = await supabase.from('answers').select('*');
    const { data: modules, error: qError } = await supabase.from('survey_modules').select('id, questions(id)').eq('status', 'active');
      
    if (respError) throw respError;
    if (ansError) throw ansError;
    if (qError) throw qError;

    const numActiveQuestions = modules?.reduce((acc, m) => acc + (m.questions?.length || 0), 0) || 0;
    const totalResponses = responses?.length || 0;

    const answersByResponse = {};
    answers?.forEach(a => {
      if (!answersByResponse[a.response_id]) answersByResponse[a.response_id] = {};
      answersByResponse[a.response_id][a.question_id] = a.value;
    });

    let completeCount = 0;
    responses?.forEach(r => {
      const rAnswers = answersByResponse[r.id] || {};
      if (numActiveQuestions > 0 && Object.keys(rAnswers).length >= numActiveQuestions) {
        completeCount++;
      }
    });
    const completionRate = responses?.length && numActiveQuestions > 0 
      ? Math.round((completeCount / responses.length) * 100) 
      : (responses?.length ? 100 : 0);

    const genAgg = {
      'Boomers': { totalRisk: 0, count: 0 },
      'Gen X': { totalRisk: 0, count: 0 },
      'Millennials': { totalRisk: 0, count: 0 },
      'Gen Z': { totalRisk: 0, count: 0 }
    };

    const roleAgg = {
      'Founder': { totalLossAversion: 0, count: 0 },
      'VC': { totalLossAversion: 0, count: 0 },
      'Worker': { totalLossAversion: 0, count: 0 }
    };

    responses?.forEach(r => {
      const rAnswers = answersByResponse[r.id] || {};
      const gen = extractGeneration(rAnswers) || 'Millennials';
      const role = extractRole(rAnswers) || 'Worker';
      
      const risk = calculateRiskAversion(rAnswers);
      const lossAversion = calculateLossAversion(rAnswers);

      if (genAgg[gen]) {
        genAgg[gen].totalRisk += risk;
        genAgg[gen].count += 1;
      }

      if (roleAgg[role]) {
        roleAgg[role].totalLossAversion += lossAversion;
        roleAgg[role].count += 1;
      }
    });

    const genData = Object.keys(genAgg).map(gen => ({
      generation: gen,
      avgRiskTolerance: genAgg[gen].count > 0 ? Number((genAgg[gen].totalRisk / genAgg[gen].count).toFixed(2)) : 0
    }));

    const roleData = Object.keys(roleAgg).map(role => ({
      role: role,
      avgLossAversion: roleAgg[role].count > 0 ? Number((roleAgg[role].totalLossAversion / roleAgg[role].count).toFixed(2)) : 0
    }));

    res.json({
      totalResponses,
      activeQuestions: numActiveQuestions,
      completionRate,
      genData,
      roleData
    });
  } catch (error) {
    console.error('Stats Error:', error);
    res.status(400).json({ error: error.message || 'Failed to fetch stats' });
  }
};

module.exports = {
  getDashboardStats
};
