import { AnswerValue, LotteryResponse } from '../types';

// Helper: Get numeric values from responses
const getLotteryChoice = (lotteryRes: LotteryResponse, index: number) => {
  return lotteryRes.selectedValues[index];
};

export const calculateCE = (
  lotteryRes: LotteryResponse, 
  isLoss: boolean = false
) => {
  if (!lotteryRes || !lotteryRes.rows || lotteryRes.rows.length === 0) return null;
  
  const rows = lotteryRes.rows;
  let rejectedAmounts: number[] = [];
  let acceptedAmounts: number[] = [];

  rows.forEach((row, i) => {
    const choice = getLotteryChoice(lotteryRes, i);
    // choice 'A' = Sure amount
    // choice 'B' = Gamble
    // isLoss: amounts are negative, but we use their absolute magnitude for calculations
    const amount = isLoss ? Math.abs(row.sureAmount) : row.sureAmount;
    
    if (choice === 'A') {
      acceptedAmounts.push(amount);
    } else if (choice === 'B') {
      rejectedAmounts.push(amount);
    }
  });

  if (acceptedAmounts.length > 0 && rejectedAmounts.length > 0) {
    const highestRejected = Math.max(...rejectedAmounts);
    const lowestAccepted = Math.min(...acceptedAmounts);
    return (highestRejected + lowestAccepted) / 2;
  }

  // Corner cases
  const allAmounts = rows.map(r => isLoss ? Math.abs(r.sureAmount) : r.sureAmount);
  const minAmount = Math.min(...allAmounts);
  const maxAmount = Math.max(...allAmounts);

  if (acceptedAmounts.length === 0) {
    // Always chose gamble
    // PDF: "If they always choose gamble: set CE just below smallest sure amount"
    // For losses: if they always gamble, they reject all sure losses.
    return Math.max(0, minAmount - (maxAmount - minAmount) / rows.length); 
  }

  if (rejectedAmounts.length === 0) {
    // Always chose sure
    return maxAmount + (maxAmount - minAmount) / rows.length;
  }

  return null;
};

export const calculateMixedGStar = (lotteryRes: LotteryResponse) => {
  if (!lotteryRes || !lotteryRes.rows || lotteryRes.rows.length === 0) return null;

  let rejectedGains: number[] = [];
  let acceptedGains: number[] = [];

  lotteryRes.rows.forEach((row, i) => {
    // In Mixed lotteries, the gamble changes, so we need to extract the Win amount from the text
    // "50% chance to win 400,000 UZS, 50% chance to lose 500,000 UZS"
    const match = row.gamble.match(/win ([\d,]+) UZS/);
    if (!match) return;
    const gain = parseInt(match[1].replace(/,/g, ''), 10);

    const choice = getLotteryChoice(lotteryRes, i);
    if (choice === 'A') {
      // Chose 0 sure -> rejected the gamble
      rejectedGains.push(gain);
    } else if (choice === 'B') {
      // Chose Gamble -> accepted the gamble
      acceptedGains.push(gain);
    }
  });

  if (acceptedGains.length > 0 && rejectedGains.length > 0) {
    const highestRejected = Math.max(...rejectedGains);
    const lowestAccepted = Math.min(...acceptedGains);
    return (highestRejected + lowestAccepted) / 2;
  }

  const allGains = [...rejectedGains, ...acceptedGains];
  if (allGains.length === 0) return null;

  const minGain = Math.min(...allGains);
  const maxGain = Math.max(...allGains);

  if (acceptedGains.length === 0) {
    // Always reject gamble (choose 0) -> treat G* slightly above largest gain
    return maxGain + (maxGain - minGain) / allGains.length;
  }

  if (rejectedGains.length === 0) {
    // Always accept gamble -> treat G* slightly below smallest gain
    return Math.max(0, minGain - (maxGain - minGain) / allGains.length);
  }

  return null;
};

export const calculateAlpha = (ce: number | null, X: number) => {
  if (!ce || ce <= 0 || X <= 0) return null;
  const ratio = ce / X;
  if (ratio <= 0 || ratio >= 1) return null; // Avoid log <= 0 or log(1)
  return Math.log(0.5) / Math.log(ratio);
};

export const calculateBeta = (ce_L: number | null, L: number) => {
  if (!ce_L || ce_L <= 0 || L <= 0) return null;
  const ratio = ce_L / L;
  if (ratio <= 0 || ratio >= 1) return null; 
  return Math.log(0.5) / Math.log(ratio);
};

export const calculateLambda = (alpha: number | null, beta: number | null, G_star: number | null, L: number) => {
  if (!alpha || !beta || !G_star || G_star <= 0 || L <= 0) return null;
  return Math.pow(G_star, alpha) / Math.pow(L, beta);
};

export interface CPTSummary {
  alpha: number | null;
  beta: number | null;
  lambda: number | null;
}

export const processUserCPT = (answers: Record<string, any>, questions: any[]): CPTSummary => {
  // Find questions by text prefix since IDs are UUIDs
  const G1 = questions.find(q => q.text && q.text.startsWith('G1.'));
  const G2 = questions.find(q => q.text && q.text.startsWith('G2.'));
  const G3 = questions.find(q => q.text && q.text.startsWith('G3.'));

  const L1 = questions.find(q => q.text && q.text.startsWith('L1.'));
  const L2 = questions.find(q => q.text && q.text.startsWith('L2.'));
  const L3 = questions.find(q => q.text && q.text.startsWith('L3.'));

  const M1 = questions.find(q => q.text && q.text.startsWith('M1.'));
  const M2 = questions.find(q => q.text && q.text.startsWith('M2.'));
  const M3 = questions.find(q => q.text && q.text.startsWith('M3.'));

  const getAnswer = (q?: any) => q ? answers[q.id] as LotteryResponse : null;

  // Constants based on PDF specification
  const G1_X = 1500000, G2_X = 600000, G3_X = 3000000;
  const L1_L = 1500000, L2_L = 600000, L3_L = 3000000;
  const M1_L = 500000,  M2_L = 1000000, M3_L = 200000;

  let alphas: number[] = [], betas: number[] = [], lambdas: number[] = [];

  // Gains -> Alphas
  if (G1) { const ce = calculateCE(getAnswer(G1)); const a = calculateAlpha(ce, G1_X); if (a) alphas.push(a); }
  if (G2) { const ce = calculateCE(getAnswer(G2)); const a = calculateAlpha(ce, G2_X); if (a) alphas.push(a); }
  if (G3) { const ce = calculateCE(getAnswer(G3)); const a = calculateAlpha(ce, G3_X); if (a) alphas.push(a); }

  // Losses -> Betas
  if (L1) { const ce = calculateCE(getAnswer(L1), true); const b = calculateBeta(ce, L1_L); if (b) betas.push(b); }
  if (L2) { const ce = calculateCE(getAnswer(L2), true); const b = calculateBeta(ce, L2_L); if (b) betas.push(b); }
  if (L3) { const ce = calculateCE(getAnswer(L3), true); const b = calculateBeta(ce, L3_L); if (b) betas.push(b); }

  const avgAlpha = alphas.length > 0 ? alphas.reduce((s, x) => s + x, 0) / alphas.length : null;
  const avgBeta = betas.length > 0 ? betas.reduce((s, x) => s + x, 0) / betas.length : null;

  // Mixed -> Lambdas (requires Alpha and Beta)
  if (avgAlpha && avgBeta) {
    if (M1) { const gs = calculateMixedGStar(getAnswer(M1)); const l = calculateLambda(avgAlpha, avgBeta, gs, M1_L); if (l) lambdas.push(l); }
    if (M2) { const gs = calculateMixedGStar(getAnswer(M2)); const l = calculateLambda(avgAlpha, avgBeta, gs, M2_L); if (l) lambdas.push(l); }
    if (M3) { const gs = calculateMixedGStar(getAnswer(M3)); const l = calculateLambda(avgAlpha, avgBeta, gs, M3_L); if (l) lambdas.push(l); }
  }

  const avgLambda = lambdas.length > 0 ? lambdas.reduce((s, x) => s + x, 0) / lambdas.length : null;

  return { alpha: avgAlpha, beta: avgBeta, lambda: avgLambda };
};
