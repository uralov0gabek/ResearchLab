import { describe, expect, it } from 'vitest';
import { getSurveySections, mergeSurveyAnswers, normalizeQuestions, reconcileLotteryAnswers, sortLotteryRows } from './surveyQuestions';
import { getResponseCPT } from './cptCalculations';
import type { LotteryResponse, Question } from '../types';

const rows = [
  { id: 'g1b', title: 'G1b', sureAmount: 40, gamble: '50% chance to win 150 or 50% chance to win 0', gamble_a_amount: 150 },
  { id: 'l1a', title: 'L1a', sureAmount: -20, gamble: '50% chance to lose 150 or 50% chance to win 0', gamble_a_amount: -150 },
  { id: 'g1a', title: 'G1a', sureAmount: 20, gamble: '50% chance to win 150 or 50% chance to win 0', gamble_a_amount: 150 },
];

describe('survey ordering and snapshots', () => {
  it('keeps the question after CPT after all split groups', () => {
    const questions = normalizeQuestions([
      { id: 'first', type: 'short_text', block_name: 'A' },
      { id: 'cpt', type: 'lottery', block_name: 'A', options: rows },
      { id: 'last', type: 'short_text', block_name: 'A' },
      { id: 'next', type: 'short_text', block_name: 'B' },
    ]);
    expect(getSurveySections(questions).flatMap(section => section.questions.map(q => q.id)))
      .toEqual(['first', 'cpt__G1', 'cpt__L1', 'last', 'next']);
    expect(questions[1].options.map((row: any) => row.title)).toEqual(['G1a', 'G1b']);
  });

  it('sorts numeric group and row labels naturally', () => {
    expect(sortLotteryRows([{ title: 'G10a' }, { title: 'G2b' }, { title: 'G2a' }]).map(row => row.title))
      .toEqual(['G2a', 'G2b', 'G10a']);
  });

  it('remaps saved choices by row IDs when options reorder', () => {
    const question: Question = { id: 'q', type: 'lottery', text: '', block_name: 'A', options: [rows[2], rows[0]] };
    const answer: LotteryResponse = { type: 'lottery_response', rows: [rows[0], rows[2]], choices: ['A', 'B'], selectedValues: { 0: 'A', 1: 'B' } };
    const result = reconcileLotteryAnswers([question], { q: answer }).q as LotteryResponse;
    expect(result.choices).toEqual(['B', 'A']);
    expect(result.selectedValues).toEqual({ 0: 'B', 1: 'A' });
  });

  it('requires a changed task to be answered again', () => {
    const question: Question = { id: 'q', type: 'lottery', text: '', block_name: 'A', options: [{ ...rows[0], gamble_a_amount: 300 }] };
    const answer: LotteryResponse = { type: 'lottery_response', rows: [rows[0]], choices: ['A'], selectedValues: { 0: 'A' } };
    expect((reconcileLotteryAnswers([question], { q: answer }).q as LotteryResponse).choices).toEqual([null]);
  });

  it('merges split answers with aligned metadata and excludes hidden answers', () => {
    const questions = normalizeQuestions([{ id: 'cpt', type: 'lottery', block_name: 'A', options: rows }]);
    const answers = Object.fromEntries(questions.map(q => [q.id, {
      type: 'lottery_response' as const, rows: q.options,
      choices: q.options.map(() => 'B' as const),
      selectedValues: Object.fromEntries(q.options.map((_: unknown, i: number) => [i, 'B' as const])),
    }]));
    const merged = mergeSurveyAnswers(questions, { ...answers, hidden: 'old answer' });
    const cpt = merged.cpt as LotteryResponse;
    expect(Object.keys(merged)).toEqual(['cpt']);
    expect(cpt.rows.map(row => row.id)).toEqual(['g1a', 'g1b', 'l1a']);
    expect(cpt.choices).toEqual(['B', 'B', 'B']);
    expect(cpt.selectedValues).toEqual({ 0: 'B', 1: 'B', 2: 'B' });
    expect(cpt.rows[2].gamble_a_amount).toBe(-150);
  });

  it('copies defaults only for visible sliders', () => {
    const questions: Question[] = [{ id: 'visible', type: 'slider', text: '', block_name: 'A', options: { min: 1, max: 5 } }];
    expect(mergeSurveyAnswers(questions, { hidden: 5 })).toEqual({ visible: 3 });
  });

  it('displays authoritative server values without replacing missing estimates', () => {
    expect(getResponseCPT({ alpha: '1', beta: '1', lambda: '2.25', calculated_cpt_parameters: { alpha: 0.63, beta: null, lambda: null } }))
      .toEqual({ alpha: 0.63, beta: null, lambda: null });
    expect(getResponseCPT({ alpha: 'NaN', beta: 'Infinity', lambda: 'N/A' }))
      .toEqual({ alpha: null, beta: null, lambda: null });
  });
});
