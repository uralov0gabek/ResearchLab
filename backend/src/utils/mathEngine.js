const calculateCertaintyEquivalent = (choices, isLoss = false) => {
  // choices is an array of { sureAmount: number, choice: 'A' | 'B' }
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

const calculateIndifferenceMixed = (choices) => {
  // choices is an array of { gambleAmount1: number (Gain), choice: 'A' (Sure 0) | 'B' (Mixed Gamble) }
  if (choices.length === 0) return 0;
  
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

const computeAlphaBeta = (ce, p, x, y = 0) => {
  // α = ln(CE) / ln(p * x) simplified for single non-zero outcome
  // This is a simplified proxy. 
  // v(CE) = p * v(x). If v(x) = x^α, CE^α = p * x^α => CE = p^(1/α) * x => α = ln(p) / ln(CE/x)
  if (ce <= 0 || x <= 0) return 1.0;
  if (ce >= x) return 0.1; // extreme boundary
  return Math.log(p) / Math.log(ce / x);
};

const calculateCPTParameters = (answers, cptTasks) => {
  // cptTasks: array of DB rows from cpt_tasks table
  
  // Group tasks by block
  const blocks = {
    G1: [], G2: [], G3: [],
    L1: [], L2: [], L3: [],
    M1: [], M2: [], M3: []
  };

  cptTasks.forEach(task => {
    if (blocks[task.title.split('_')[0]]) {
       blocks[task.title.split('_')[0]].push(task);
    }
  });

  // Collect choices
  const getChoices = (blockTasks) => {
    return blockTasks.map(t => ({
      ...t,
      choice: answers[`cpt_${t.id}`] || answers[t.id]
    })).filter(t => t.choice);
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

const extractGeneration = (answers) => {
  let age = 30; // default
  for (const key in answers) {
    const val = answers[key];
    if (typeof val === 'string' && !isNaN(Number(val))) {
      const num = Number(val);
      if (num >= 18 && num <= 100) { age = num; break; }
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
    if (val === 'Founder' || val === 'VC' || val === 'Worker' || val === 'Investor') return val;
  }
  return 'Worker';
};

module.exports = {
  calculateCPTParameters,
  extractGeneration,
  extractRole
};
