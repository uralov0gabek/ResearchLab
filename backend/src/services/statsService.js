const { supabaseAdmin } = require('../config/supabase');
const { extractGeneration, extractRole } = require('./cptService');
const AppError = require('../utils/AppError');

/**
 * Aggregates dashboard stats for the admin overview
 * @returns {Promise<Object>} - The dashboard stats data
 */
const getAggregatedStats = async () => {
  const { data: responses, error: respError } = await supabaseAdmin.from('responses').select('*');
  const { data: questions, error: qError } = await supabaseAdmin.from('questions').select('*');
    
  if (respError) throw new AppError(respError.message || 'Failed to fetch responses', 500);
  if (qError) throw new AppError(qError.message || 'Failed to fetch questions', 500);

  const numActiveQuestions = questions?.length || 0;
  const totalResponses = responses?.length || 0;

  let completeCount = 0;
  responses?.forEach(r => {
    const rAnswers = r.answers || {};
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

  // Dynamically determine the role question based on conditional logic dependencies
  let roleQuestionId = null;
  let roleOptions = [];
  
  if (questions) {
    for (const q of questions) {
      if (q.conditional_logic && q.conditional_logic.questionId) {
        roleQuestionId = q.conditional_logic.questionId;
        break; // Assume the primary branch trigger is the Role question
      }
    }
    
    if (roleQuestionId) {
      const roleQ = questions.find(q => String(q.id) === String(roleQuestionId));
      if (roleQ && roleQ.options && Array.isArray(roleQ.options)) {
        roleOptions = roleQ.options;
      }
    }
  }

  // Fallback if no dynamic roles configured
  if (roleOptions.length === 0) {
    roleOptions = ['Founder', 'VC', 'Worker'];
  }

  const roleAgg = {};
  roleOptions.forEach(role => {
    roleAgg[role] = { totalLossAversion: 0, count: 0 };
  });

  responses?.forEach(r => {
    const demographicAnswers = r.answers || {}; 

    const gen = extractGeneration(demographicAnswers) || 'Millennials';
    
    // Dynamically extract the role
    let role = 'Worker';
    if (roleQuestionId && demographicAnswers[roleQuestionId]) {
      role = demographicAnswers[roleQuestionId];
    } else {
      // Legacy fallback
      role = extractRole(demographicAnswers) || 'Worker';
    }

    if (!roleAgg[role]) {
      roleAgg[role] = { totalLossAversion: 0, count: 0 }; // Handle unconfigured roles gracefully
    }
    
    const risk = r.calculated_cpt_parameters?.alpha || 1.0;
    const lossAversion = r.calculated_cpt_parameters?.lambda || 2.25;

    if (genAgg[gen]) {
      genAgg[gen].totalRisk += risk;
      genAgg[gen].count += 1;
    }

    roleAgg[role].totalLossAversion += lossAversion;
    roleAgg[role].count += 1;
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
