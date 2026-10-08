import type { AnswerValue, LotteryResponse, LotteryRow, Question } from '../types';

const stableText = (value: unknown): string => typeof value === 'string' ? value : value ? JSON.stringify(value) : '';
const isChoice = (value: unknown): value is 'A' | 'B' => value === 'A' || value === 'B';

export const sortLotteryRows = <T extends { title?: string }>(rows: T[]): T[] => [...rows].sort(
  (a, b) => a.title && b.title ? a.title.localeCompare(b.title, 'en', { numeric: true }) : 0
);

export const normalizeQuestions = (data: any[]): Question[] => data.flatMap(q => {
  const question: Question = {
    id: String(q.id), type: q.type === 'CPT' ? 'lottery' : q.type,
    text: stableText(q.question_text), block_name: stableText(q.block_name),
    options: q.options, required: Boolean(q.required), dependsOn: q.conditional_logic,
  };
  if (question.type !== 'lottery' || !Array.isArray(q.options)) return [question];
  const rows = sortLotteryRows(q.options.filter((row: any) => row && typeof row === 'object' && row.sureAmount != null)) as LotteryRow[];
  const groups = new Map<string, LotteryRow[]>();
  rows.forEach(row => {
    const group = row.title?.match(/^([GLM]\d+)/i)?.[1].toUpperCase() || 'Tasks';
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group)!.push(row);
  });
  if (groups.size <= 1) return rows.length ? [{ ...question, options: rows }] : [];
  return [...groups].map(([group, options]) => ({
    ...question, id: `${question.id}__${group}`, originalId: question.id,
    block_name: `${question.block_name} - ${group}`, options,
  }));
});

export const getSurveySections = (questions: Question[]) => {
  const sections: { name: string; questions: Question[] }[] = [];
  questions.forEach(question => {
    const previous = sections[sections.length - 1];
    if (previous?.name === question.block_name) previous.questions.push(question);
    else sections.push({ name: question.block_name, questions: [question] });
  });
  return sections;
};

// Session choices follow row IDs through reordering; changed tasks must be answered again.
export const reconcileLotteryAnswers = (questions: Question[], answers: Record<string, AnswerValue>) => {
  const next = { ...answers };
  questions.forEach(question => {
    if (question.type !== 'lottery' || !Array.isArray(question.options)) return;
    const answer = answers[question.id] ?? (question.originalId ? answers[question.originalId] : undefined);
    if (!answer || typeof answer !== 'object' || !('rows' in answer) || !Array.isArray(answer.rows)) return;
    const old = answer as LotteryResponse;
    const choices = (question.options as LotteryRow[]).map((row, index) => {
      const oldIndex = row.id ? old.rows.findIndex(saved => saved?.id === row.id) : index;
      const saved = old.rows[oldIndex];
      if (!saved) return null;
      const fields = ['sureAmount', 'gamble_a_amount', 'gamble_a_prob', 'gamble_b_amount', 'gamble_b_prob'] as const;
      if (fields.some(field => saved[field] != null && row[field] != null && Number(saved[field]) !== Number(row[field]))) return null;
      if (saved.gamble_a_amount == null && saved.gamble && saved.gamble !== row.gamble) return null;
      const choice = old.selectedValues?.[oldIndex] ?? old.choices?.[oldIndex];
      return isChoice(choice) ? choice : null;
    });
    next[question.id] = {
      type: 'lottery_response', rows: question.options, choices,
      selectedValues: Object.fromEntries(choices.map((choice, index) => [index, choice]).filter(([, choice]) => isChoice(choice))),
    };
  });
  return next;
};

export const mergeSurveyAnswers = (questions: Question[], answers: Record<string, AnswerValue>): Record<string, AnswerValue> => {
  const merged: Record<string, AnswerValue> = {};
  questions.forEach(question => {
    let answer = answers[question.id];
    if (question.type === 'slider' && answer === undefined) {
      answer = ((question.options?.min ?? 0) + (question.options?.max ?? 100)) / 2;
    }
    if (answer === undefined) return;
    if (question.type !== 'lottery' || !answer || typeof answer !== 'object' || !('rows' in answer)) {
      merged[question.id] = answer;
      return;
    }
    const id = question.originalId || question.id;
    const target = (merged[id] as LotteryResponse | undefined) || {
      type: 'lottery_response', choices: [], selectedValues: {}, rows: [],
    };
    const offset = target.rows.length;
    const lottery = answer as LotteryResponse;
    (question.options as LotteryRow[]).forEach((row, index) => {
      const choice = lottery.selectedValues?.[index] ?? lottery.choices?.[index];
      target.rows.push(row);
      target.choices.push(isChoice(choice) ? choice : null);
      if (isChoice(choice)) target.selectedValues[offset + index] = choice;
    });
    merged[id] = target;
  });
  return merged;
};
