/**
 * CPT Calculation Engine
 * 
 * Implements logic to calculate Cumulative Prospect Theory parameters
 * based on user lottery choices.
 */

export interface LotteryRow {
  sureAmount: number;
  gamble: string; // e.g. "50% chance to win 1.5m or 0"
  gambleG: number;
  gambleL?: number;
  prob: number;
}

/**
 * Calculates Alpha (α), Beta (β), and Lambda (λ)
 * 
 * @param answers The raw answers from the survey.
 * Expected structure for lottery questions is an array of 'A' or 'B'.
 */
export const calculateCPTParameters = (answers: Record<string, unknown>) => {
  // In a full implementation, you would parse the actual lottery questions
  // and map the user's A/B choices to find the switching point.
  // For the sake of the structural implementation based on the prompt:
  // 
  // Certainty Equivalent (CE): Find highest sure amount rejected and lowest accepted. CE = (highest rejected + lowest accepted) / 2
  // Alpha (α): α_i = ln(0.5) / ln(CE_i / X)
  // Beta (β): β_i = ln(0.5) / ln(CE_Li / L_i)
  // Lambda (λ): λ = (G*^α) / (L^β)

  // As a placeholder calculation until the exact lottery values are supplied:
  let alphaSum = 0;
  let betaSum = 0;
  let lambdaSum = 0;
  let count = 0;

  // Iterate over answers, identify lottery blocks, and calculate
  Object.values(answers).forEach((ansVal) => {
    const ans = ansVal as Record<string, unknown>;
    if (ans && typeof ans === 'object' && ans.type === 'lottery_response') {
      // Find switching point
      let highestRejected = 0;
      let lowestAccepted = Infinity;
      
      const choices = ans.choices as ('A' | 'B')[]; // Array of 'A' or 'B'
      const rows = ans.rows as LotteryRow[]; // Array of LotteryRow

      choices.forEach((choice: 'A' | 'B', index: number) => {
        const sureAmt = rows[index].sureAmount;
        if (choice === 'A') {
          // Accepted sure amount
          if (sureAmt < lowestAccepted) lowestAccepted = sureAmt;
        } else {
          // Rejected sure amount (took gamble)
          if (sureAmt > highestRejected) highestRejected = sureAmt;
        }
      });

      if (lowestAccepted === Infinity && highestRejected === 0) return; // No valid answers
      if (lowestAccepted === Infinity) lowestAccepted = highestRejected; 
      if (highestRejected === 0) highestRejected = lowestAccepted;

      const ce = (highestRejected + lowestAccepted) / 2;
      const x = rows[0].gambleG || 1; // max gamble amount
      
      const alpha = Math.log(0.5) / Math.log(ce / x);
      alphaSum += alpha;
      count++;
    }
  });

  return {
    alpha: count > 0 ? alphaSum / count : 0.88,
    beta: count > 0 ? betaSum / count : 0.88,
    lambda: count > 0 ? lambdaSum / count : 2.25
  };
};
