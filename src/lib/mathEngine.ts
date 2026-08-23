export const calculateLossAversion = (answers: Record<string, any>): number => {
  // Placeholder formula for Lambda (λ)
  // Higher value means more loss averse. Usually > 1 (e.g., 2.25 is standard Tversky & Kahneman)
  
  let lambda = 2.0; 
  
  // Adjust based on some mock logic for demonstration
  const role = extractRole(answers);
  const gen = extractGeneration(answers);

  if (role === 'Founder') lambda -= 0.5; // Founders typically less loss averse
  if (role === 'VC') lambda -= 0.3;
  
  if (gen === 'Boomers') lambda += 0.4;
  if (gen === 'Gen Z') lambda -= 0.2;

  // Bound it to realistic numbers
  return Math.max(1.0, Math.min(lambda, 5.0));
};

export const calculateRiskAversion = (answers: Record<string, any>): number => {
  // Placeholder formula for Alpha (α)
  // Diminishing sensitivity. Typically ~0.88.
  
  let alpha = 0.88; 
  
  const role = extractRole(answers);
  const gen = extractGeneration(answers);

  if (role === 'Founder') alpha += 0.05; // Founders are more risk seeking
  if (role === 'Worker') alpha -= 0.05;

  if (gen === 'Boomers') alpha -= 0.08;
  if (gen === 'Millennials') alpha += 0.02;

  return Math.max(0.5, Math.min(alpha, 1.0));
};

export const extractGeneration = (answers: Record<string, any>): string => {
  // Find the age question answer and convert to Gen
  // We'll search through answers to find numeric age, assuming the question title might not be perfectly known here,
  // or we can just iterate and guess which one is age based on number.
  let age = 30; // default

  for (const key in answers) {
    const val = answers[key];
    if (typeof val === 'string' && !isNaN(Number(val))) {
      const num = Number(val);
      if (num >= 18 && num <= 100) {
        age = num;
        break;
      }
    }
  }

  if (age >= 60) return 'Boomers';
  if (age >= 44) return 'Gen X';
  if (age >= 28) return 'Millennials';
  return 'Gen Z';
};

export const extractRole = (answers: Record<string, any>): string => {
  for (const key in answers) {
    const val = answers[key];
    if (val === 'Founder' || val === 'VC' || val === 'Worker') {
      return val;
    }
  }
  return 'Worker'; // default
};
