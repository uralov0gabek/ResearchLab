/**
 * Calculates the Certainty Equivalent (CE) for a set of choices.
 *
 * @param {Array<{sureAmount: number, choice: 'A' | 'B'}>} choices - Array of user choices
 * @param {boolean} [isLoss=false] - Whether the gamble involves losses
 * @returns {number} The calculated Certainty Equivalent
 */
const calculateCertaintyEquivalent = (choices, isLoss = false) => {
  // A = Sure Amount, B = Gamble
  if (choices.length === 0) return 0;
  
  // Sort by absolute sure amount
  const sorted = [...choices].sort((a, b) => Math.abs(a.sureAmount) - Math.abs(b.sureAmount));
  
  let highestRejected = null;
  let lowestAccepted = null;

  for (const item of sorted) {
    const amt = Math.abs(item.sureAmount);
    if (item.choice === 'B') {
      highestRejected = amt;
    } else if (item.choice === 'A') {
      if (lowestAccepted === null) {
        lowestAccepted = amt;
      }
    }
  }

  const minAmt = Math.abs(sorted[0].sureAmount);
  const maxAmt = Math.abs(sorted[sorted.length - 1].sureAmount);
  const step = Math.abs(sorted[1]?.sureAmount - sorted[0]?.sureAmount) || 100000;

  if (highestRejected === null) {
    // Always chose Sure (A). Extremely risk-averse (for gains) or risk-seeking (for losses).
    return (minAmt - step / 2) * (isLoss ? -1 : 1);
  }

  if (lowestAccepted === null) {
    // Always chose Gamble (B). Extremely risk-seeking (for gains) or risk-averse (for losses).
    return (maxAmt + step / 2) * (isLoss ? -1 : 1);
  }

  return ((highestRejected + lowestAccepted) / 2) * (isLoss ? -1 : 1);
};

/**
 * Calculates the Indifference Point for mixed gambles (Loss Aversion).
 *
 * @param {Array<{gambleAmount1: number, choice: 'A' | 'B'}>} choices - User choices
 * @returns {number} The indifference point gain amount
 */
const calculateIndifferenceMixed = (choices) => {
  
  const sorted = [...choices].sort((a, b) => a.gambleAmount1 - b.gambleAmount1);
  
  let highestRejected = null; // highest gain rejected (chose A, sure 0)
  let lowestAccepted = null;  // lowest gain accepted (chose B, gamble)

  for (const item of sorted) {
    if (item.choice === 'A') {
      highestRejected = item.gambleAmount1;
    } else if (item.choice === 'B') {
      if (lowestAccepted === null) {
        lowestAccepted = item.gambleAmount1;
      }
    }
  }

  const minAmt = sorted[0].gambleAmount1;
  const maxAmt = sorted[sorted.length - 1].gambleAmount1;
  const step = (sorted[1]?.gambleAmount1 - sorted[0]?.gambleAmount1) || 100000;

  if (highestRejected === null) {
    // Always accepted the gamble (always B)
    return minAmt - step / 2;
  }
  if (lowestAccepted === null) {
    // Always rejected the gamble (always A)
    return maxAmt + step / 2;
  }

  return (highestRejected + lowestAccepted) / 2;
};

/**
 * Computes Alpha or Beta (Value sensitivity for gains or losses).
 * Uses the proxy formula: α = ln(p) / ln(CE/x).
 *
 * @param {number} ce - Certainty Equivalent
 * @param {number} p - Probability of non-zero outcome
 * @param {number} x - Gamble amount
 * @returns {number} The calculated sensitivity parameter
 */
const computeAlphaBeta = (ce, p, x) => {
  if (ce >= x) return 0.1; // extreme boundary
  return Math.log(p) / Math.log(ce / x);
};

/**
 * Main entry point to calculate all CPT Parameters from user answers and database tasks.
 *
 * @param {Object} answers - Mapping of question IDs to user answers
 * @param {Array} cptTasks - Raw task configuration from the database
 * @returns {Object} Object containing { alpha, beta, lambda, gamma, delta }
 */
const calculateCPTParameters = (answers, cptTasks) => {
  const blocks = {
    G1: [], G2: [], G3: [],
    L1: [], L2: [], L3: [],
    M1: [], M2: [], M3: []
  };

  cptTasks.forEach(task => {
    // Map properties from new question schema or older cpt_tasks schema
    const title = task.question_text || task.title || '';
    // Extract 2-char block prefix: e.g. "G1a. ..." -> "G1", "M3b. ..." -> "M3"
    const match = title.match(/^([A-Z]\d)/);
    const blockPrefix = match ? match[1] : '';
    
    // Inject raw data back into the task for the calculator
    if (task.options && task.options[0] && task.options[0].raw) {
      Object.assign(task, task.options[0].raw);
    }
    
    if (blockPrefix && blocks[blockPrefix] !== undefined) {
       blocks[blockPrefix].push(task);
    }
  });

  // Collect choices
  const getChoices = (blockTasks) => {
    return blockTasks.map(t => {
      let choice = answers[`cpt_${t.id}`] || answers[t.id];
      if (!choice) {
        // Search inside nested lottery_response from frontend
        for (const key in answers) {
          const val = answers[key];
          if (val && val.type === 'lottery_response' && Array.isArray(val.rows)) {
            const rowIndex = val.rows.findIndex(r => r.id === t.id);
            if (rowIndex !== -1 && val.choices) {
              choice = val.choices[rowIndex];
              break;
            }
          }
        }
      }
      return { ...t, choice };
    }).filter(t => t.choice);
  };

  // 1. Calculate Alphas (Gains)
  const alphas = ['G1', 'G2', 'G3'].map(b => {
    const choices = getChoices(blocks[b]);
    if (choices.length === 0) return null;
    const ce = calculateCertaintyEquivalent(choices, false);
    const x = choices[0].gamble_a_amount;
    const p = choices[0].gamble_a_prob / 100.0;
    return computeAlphaBeta(ce, p, x);
  }).filter(a => a !== null);

  const alpha = alphas.length > 0 ? alphas.reduce((a,b) => a+b, 0) / alphas.length : 1.0;

  // 2. Calculate Betas (Losses)
  const betas = ['L1', 'L2', 'L3'].map(b => {
    const choices = getChoices(blocks[b]);
    if (choices.length === 0) return null;
    const ce = Math.abs(calculateCertaintyEquivalent(choices, true));
    const x = Math.abs(choices[0].gamble_a_amount);
    const p = choices[0].gamble_a_prob / 100.0;
    return computeAlphaBeta(ce, p, x);
  }).filter(b => b !== null);

  const beta = betas.length > 0 ? betas.reduce((a,b) => a+b, 0) / betas.length : 1.0;

  // 3. Calculate Lambda (Mixed)
  // λ = (G*)^α / (-L)^β for a 50/50 mixed gamble
  const lambdas = ['M1', 'M2', 'M3'].map(b => {
    const choices = getChoices(blocks[b]);
    if (choices.length === 0) return null;
    const G_star = calculateIndifferenceMixed(choices);
    const L = Math.abs(choices[0].gamble_b_amount); // fixed loss
    
    // Calculate λ
    // p * v(G*) + p * v(-L) = 0 => (G*)^α - λ*(L)^β = 0 => λ = (G*)^α / L^β
    const valG = Math.pow(G_star, alpha);
    const valL = Math.pow(L, beta);
    return valG / valL;
  }).filter(l => l !== null && !isNaN(l));

  const lambda = lambdas.length > 0 ? lambdas.reduce((a,b) => a+b, 0) / lambdas.length : 2.25;

  // 4. Gamma & Delta (Probability Weighting)
  // Approximate placeholders for standard CPT
  const gamma = 0.65;
  const delta = 0.65;

  return { alpha, beta, lambda, gamma, delta };
};

/**
 * Extracts generation cohort based on the user's birth year answer.
 *
 * @param {Object} answers - Mapping of question IDs to answers
 * @returns {string} The demographic cohort (Boomers, Gen X, Millennials, Gen Z)
 */
const extractGeneration = (answers) => {
  let birthYear = 1990; // default
  for (const key in answers) {
    const val = answers[key];
    if (typeof val === 'string' && /^\d{4}$/.test(val.trim())) {
      const num = Number(val.trim());
      // Valid birth year check
      if (num >= 1900 && num <= new Date().getFullYear()) { 
        birthYear = num; 
        break; 
      }
    }
  }
  
  if (birthYear <= 1964) return 'Boomers';
  if (birthYear <= 1980) return 'Gen X';
  if (birthYear <= 1996) return 'Millennials';
  return 'Gen Z';
};

/**
 * Extracts the user's role (Founder, VC, Worker) based on their answers.
 *
 * @param {Object} answers - Mapping of question IDs to answers
 * @returns {string} The parsed role
 */
const extractRole = (answers) => {
  for (const key in answers) {
    const val = answers[key];
    if (typeof val === 'string') {
      const lower = val.toLowerCase();
      if (lower.includes('i run my own business')) return 'Founder';
      if (lower.includes('i am an investor') || lower.includes('venture capitalist')) return 'VC';
      if (lower.includes('employee') || lower.includes('salary') || lower.includes('wage')) return 'Worker';
    }
  }
  return 'Worker';
};

module.exports = {
  calculateCPTParameters,
  extractGeneration,
  extractRole
};
