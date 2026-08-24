/**
 * Calculates the Loss Aversion coefficient (Lambda - λ) based on user answers.
 * 
 * In Cumulative Prospect Theory, Lambda represents how much more painful a loss is 
 * compared to an equivalent gain. Values > 1 indicate loss aversion. 
 * The standard Tversky & Kahneman (1992) estimate is approximately 2.25.
 * 
 * @param answers - A record of question IDs to user answers (strings or numbers).
 * @returns The calculated Lambda (λ) value, bounded between 1.0 and 5.0.
 */
export const calculateLossAversion = (answers: Record<string, string | number>): number => {
  let lambda = 2.0; 
  
  const role = extractRole(answers);
  const gen = extractGeneration(answers);

  if (role === 'Founder') lambda -= 0.5;
  if (role === 'VC') lambda -= 0.3;
  
  if (gen === 'Boomers') lambda += 0.4;
  if (gen === 'Gen Z') lambda -= 0.2;

  return Math.max(1.0, Math.min(lambda, 5.0));
};

/**
 * Calculates the Risk Aversion coefficient (Alpha - α) based on user answers.
 * 
 * Alpha measures diminishing sensitivity to changes in wealth. 
 * Values < 1 indicate risk aversion in the domain of gains.
 * The standard Tversky & Kahneman (1992) estimate is approximately 0.88.
 * 
 * @param answers - A record of question IDs to user answers (strings or numbers).
 * @returns The calculated Alpha (α) value, bounded between 0.5 and 1.0.
 */
export const calculateRiskAversion = (answers: Record<string, string | number>): number => {
  let alpha = 0.88; 
  
  const role = extractRole(answers);
  const gen = extractGeneration(answers);

  if (role === 'Founder') alpha += 0.05; // Founders are more risk seeking
  if (role === 'Worker') alpha -= 0.05;

  if (gen === 'Boomers') alpha -= 0.08;
  if (gen === 'Millennials') alpha += 0.02;

  return Math.max(0.5, Math.min(alpha, 1.0));
};

export const extractGeneration = (answers: Record<string, string | number>): string => {
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

export const extractRole = (answers: Record<string, string | number>): string => {
  for (const key in answers) {
    const val = answers[key];
    if (val === 'Founder' || val === 'VC' || val === 'Worker') {
      return val;
    }
  }
  return 'Worker'; // default
};
