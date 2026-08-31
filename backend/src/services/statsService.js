const { supabaseAdmin } = require('../config/supabase');
const { extractGeneration, extractRole } = require('./cptService');
const AppError = require('../utils/AppError');

/**
 * Aggregates dashboard stats for the admin overview
 * @returns {Promise<Object>} - The dashboard stats data
 */
const getAggregatedStats = async () => {
  const { data: responses, error: respError } = await supabaseAdmin.from('responses').select('*');
  const { data: answers, error: ansError } = await supabaseAdmin.from('answers').select('*');
  const { data: modules, error: qError } = await supabaseAdmin.from('survey_modules').select('id, questions(id)').eq('status', 'active');
    
  if (respError) throw new AppError(respError.message || 'Failed to fetch responses', 500);
  if (ansError) throw new AppError(ansError.message || 'Failed to fetch answers', 500);
  if (qError) throw new AppError(qError.message || 'Failed to fetch survey modules', 500);

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
    
    // We use the raw answers object from responses table if available to get demographics
    // Since 'answers' table might be incomplete if they didn't finish module by module
    const demographicAnswers = r.answers || rAnswers; 

    const gen = extractGeneration(demographicAnswers) || 'Millennials';
    const role = extractRole(demographicAnswers) || 'Worker';
    
    const risk = r.calculated_cpt_parameters?.alpha || 1.0;
    const lossAversion = r.calculated_cpt_parameters?.lambda || 2.25;

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

  return {
    totalResponses,
    activeQuestions: numActiveQuestions,
    completionRate,
    genData,
    roleData
  };
};

module.exports = {
  getAggregatedStats
};
