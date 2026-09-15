const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, 'backend/.env') });
const { fetchQuestions } = require('./backend/src/services/questionService');

fetchQuestions().then(data => {
  const cptTasks = data.filter(q => q.type === 'lottery');
  console.log('Total Questions:', data.length);
  console.log('CPT Tasks (lottery type) count:', cptTasks.length);
  if (cptTasks.length > 0) {
    console.log('First CPT Task ID:', cptTasks[0].id);
    console.log('First CPT Task Block:', cptTasks[0].block_name);
  }
}).catch(console.error);
