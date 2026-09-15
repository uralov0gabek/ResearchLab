require('dotenv').config();
const { fetchQuestions } = require('./src/services/questionService');

fetchQuestions().then(data => {
  const cptTasks = data.filter(q => q.type === 'lottery');
  console.log('Total Questions:', data.length);
  console.log('CPT Tasks (lottery type) count:', cptTasks.length);
  if (cptTasks.length > 0) {
    console.log('First CPT Task ID:', cptTasks[0].id);
    console.log('First CPT Task Block:', JSON.stringify(cptTasks[0].block_name));
    console.log('First CPT Task conditional logic:', JSON.stringify(cptTasks[0].conditional_logic));
  }
}).catch(console.error);
