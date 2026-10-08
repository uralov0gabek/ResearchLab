const { supabaseAdmin } = require('../config/supabase');
const { getResponseCPT, extractGeneration, extractRole } = require('./cptService');
const AppError = require('../utils/AppError');

const getAggregatedStats = async () => {
  const [responseResult, questionResult, taskResult] = await Promise.all([
    supabaseAdmin.from('responses').select('*'),
    supabaseAdmin.from('questions').select('*'),
    supabaseAdmin.from('cpt_tasks').select('*'),
  ]);
  const error = responseResult.error || questionResult.error || taskResult.error;
  if (error) throw new AppError(error.message || 'Failed to fetch analytics data', 500);
  const responses = responseResult.data || [];
  const questions = questionResult.data || [];
  const tasks = taskResult.data || [];
  const genAgg = Object.fromEntries(['Boomers', 'Gen X', 'Millennials', 'Gen Z'].map(name => [name, []]));
  const roleAgg = Object.fromEntries(['Founder', 'VC', 'Worker', 'Other'].map(name => [name, []]));

  responses.forEach(response => {
    const answers = response.answers || {};
    const cpt = getResponseCPT(response, tasks, questions);
    const generation = extractGeneration(answers, questions);
    const role = extractRole(answers, questions);
    if (genAgg[generation] && Number.isFinite(cpt.alpha)) genAgg[generation].push(cpt.alpha);
    if (Number.isFinite(cpt.lambda)) roleAgg[role].push(cpt.lambda);
  });

  const mean = values => values.length
    ? Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2))
    : null;

  return {
    totalResponses: responses.length,
    activeQuestions: questions.length,
    completionRate: responses.length
      ? Math.round(responses.filter(response => response.completed_at).length / responses.length * 100)
      : 0,
    genData: Object.entries(genAgg).map(([generation, values]) => ({ generation, avgRiskTolerance: mean(values) })),
    roleData: Object.entries(roleAgg).map(([role, values]) => ({ role, avgLossAversion: mean(values) })),
  };
};

module.exports = { getAggregatedStats };
