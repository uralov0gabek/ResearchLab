const calculateLossAversion = (answers) => {
  let lambda = 2.0; 
  
  const role = extractRole(answers);
  const gen = extractGeneration(answers);

  if (role === 'Founder') lambda -= 0.5;
  if (role === 'VC') lambda -= 0.3;
  
  if (gen === 'Boomers') lambda += 0.4;
  if (gen === 'Gen Z') lambda -= 0.2;

  return Math.max(1.0, Math.min(lambda, 5.0));
};

const calculateRiskAversion = (answers) => {
  let alpha = 0.88; 
  
  const role = extractRole(answers);
  const gen = extractGeneration(answers);

  if (role === 'Founder') alpha += 0.05;
  if (role === 'Worker') alpha -= 0.05;

  if (gen === 'Boomers') alpha -= 0.08;
  if (gen === 'Millennials') alpha += 0.02;

  return Math.max(0.5, Math.min(alpha, 1.0));
};

const extractGeneration = (answers) => {
  let age = 30; // default

  for (const key in answers) {
    const val = answers[key];
    if (typeof val === 'string' && !isNaN(Number(val))) {
      const num = Number(val);
      if (num >= 18 && num <= 100) {
        age = num;
        break;
      }
    } else if (typeof val === 'number') {
      if (val >= 18 && val <= 100) {
        age = val;
        break;
      }
    }
  }

  if (age >= 60) return 'Boomers';
  if (age >= 44) return 'Gen X';
  if (age >= 28) return 'Millennials';
  return 'Gen Z';
};

const extractRole = (answers) => {
  for (const key in answers) {
    const val = answers[key];
    if (val === 'Founder' || val === 'VC' || val === 'Worker') {
      return val;
    }
  }
  return 'Worker'; // default
};

module.exports = {
  calculateLossAversion,
  calculateRiskAversion,
  extractGeneration,
  extractRole
};
