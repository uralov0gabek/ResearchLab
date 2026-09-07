import type { LotteryResponse } from '../types';

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
  const rejectedAmounts: number[] = [];
  const acceptedAmounts: number[] = [];

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

  const rejectedGains: number[] = [];
  const acceptedGains: number[] = [];

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


export const processUserCPT = (answers: Record<string, unknown>, questions: any[]): CPTSummary => {
  const getAnswer = (q?: any) => {
    if (!q) return null;
    const ans = answers[q.id];
    if (typeof ans === 'string') {
      try {
        return JSON.parse(ans) as LotteryResponse;
      } catch {
        return null;
      }
    }
    return ans as LotteryResponse;
  };

  const alphas: number[] = [], betas: number[] = [], lambdas: number[] = [];
  const mixedTasks: { ans: LotteryResponse; L: number }[] = [];

  questions.forEach(q => {
    if (q.type !== 'lottery' && q.type !== 'CPT') return;
    const ans = getAnswer(q);
    if (!ans || !ans.rows || ans.rows.length === 0) return;

    const firstGamble = ans.rows[0].gamble.toLowerCase();
    const hasWin = firstGamble.includes('win');
    const hasLose = firstGamble.includes('lose');

    if (hasWin && !hasLose) {
      const match = firstGamble.match(/win ([\d,]+) uzs/i);
      if (match) {
        const X = parseInt(match[1].replace(/,/g, ''), 10);
        const ce = calculateCE(ans);
        const a = calculateAlpha(ce, X);
        if (a) alphas.push(a);
      }
    } else if (hasLose && !hasWin) {
      const match = firstGamble.match(/lose ([\d,]+) uzs/i);
      if (match) {
        const L = parseInt(match[1].replace(/,/g, ''), 10);
        const ce = calculateCE(ans, true);
        const b = calculateBeta(ce, L);
        if (b) betas.push(b);
      }
    } else if (hasWin && hasLose) {
      const match = firstGamble.match(/lose ([\d,]+) uzs/i);
      if (match) {
        const L = parseInt(match[1].replace(/,/g, ''), 10);
        mixedTasks.push({ ans, L });
      }
    }
  });

  const avgAlpha = alphas.length > 0 ? alphas.reduce((s, x) => s + x, 0) / alphas.length : null;
  const avgBeta = betas.length > 0 ? betas.reduce((s, x) => s + x, 0) / betas.length : null;

  if (avgAlpha && avgBeta) {
    mixedTasks.forEach(({ ans, L }) => {
      const gs = calculateMixedGStar(ans);
      const l = calculateLambda(avgAlpha, avgBeta, gs, L);
      if (l) lambdas.push(l);
    });
  }

  const avgLambda = lambdas.length > 0 ? lambdas.reduce((s, x) => s + x, 0) / lambdas.length : null;

  return { alpha: avgAlpha, beta: avgBeta, lambda: avgLambda };
};
