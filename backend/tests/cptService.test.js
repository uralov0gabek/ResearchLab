const test = require('node:test');
const assert = require('node:assert/strict');
const {
  calculateCPTParameters, calculateCertaintyEquivalent, snapshotLotteryAnswers,
  getResponseCPT, extractGeneration, extractRole,
} = require('../src/services/cptService');

const gains = [20, 40, 60, 80, 100, 120].map((amount, i) => ({
  id: `g${i}`, title: `G1${String.fromCharCode(97 + i)}`, sure_amount: amount,
  gamble_a_amount: 150, gamble_a_prob: 50, gamble_b_amount: 0, gamble_b_prob: 50,
}));
const losses = gains.map((task, i) => ({ ...task, id: `l${i}`, title: `L1${String.fromCharCode(97 + i)}`, sure_amount: -task.sure_amount, gamble_a_amount: -150 }));
const mixed = [40, 60, 80, 100, 120].map((amount, i) => ({
  id: `m${i}`, title: `M1${String.fromCharCode(97 + i)}`, sure_amount: 0,
  gamble_a_amount: amount, gamble_a_prob: 50, gamble_b_amount: -50, gamble_b_prob: 50,
}));
const tasks = [...gains, ...losses, ...mixed];
const choice = task => task.id.startsWith('g') ? (task.sure_amount < 50 ? 'B' : 'A')
  : task.id.startsWith('l') ? (Math.abs(task.sure_amount) < 50 ? 'A' : 'B')
    : task.gamble_a_amount < 70 ? 'A' : 'B';
const answer = (rows, choose = choice) => ({
  type: 'lottery_response',
  rows: rows.map(row => ({ ...row, sureAmount: row.sure_amount })),
  choices: rows.map(choose),
  selectedValues: Object.fromEntries(rows.map((row, i) => [i, choose(row)])),
});
const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-10, `${actual} != ${expected}`);

test('merged and separate CPT answers produce the same estimates', () => {
  const combined = calculateCPTParameters({ combined: answer(tasks) }, tasks);
  const separate = calculateCPTParameters({ gain: answer(gains), loss: answer(losses), mixed: answer(mixed) }, tasks);
  assert.deepEqual(combined, separate);
  close(combined.alpha, Math.log(0.5) / Math.log(50 / 150));
  close(combined.beta, combined.alpha);
  close(combined.lambda, Math.pow(70 / 50, combined.alpha));
});

test('loss CE brackets the adjacent switch in increasing loss magnitudes', () => {
  const rows = answer(losses).rows.map((row, i) => ({ ...row, choice: choice(losses[i]) }));
  assert.equal(calculateCertaintyEquivalent(rows, true), 50);
});

test('separate groups with identical configurations retain separate switching points', () => {
  const repeated = gains.map((task, i) => ({ ...task, id: `repeat${i}`, title: `G4${String.fromCharCode(97 + i)}` }));
  const first = calculateCPTParameters({ q: answer(gains) }, gains).alpha;
  const second = calculateCPTParameters({ q: answer(repeated, task => task.sure_amount < 90 ? 'B' : 'A') }, repeated).alpha;
  const combined = answer([...gains, ...repeated], task => task.id.startsWith('repeat') ? (task.sure_amount < 90 ? 'B' : 'A') : choice(task));
  close(calculateCPTParameters({ q: combined }, [...gains, ...repeated]).alpha, (first + second) / 2);
});

test('all-sure and all-uncertain gain choices have finite boundary estimates', () => {
  const rows = [10, 20, 30, 40, 50, 55].map((amount, i) => ({ ...gains[i], sure_amount: amount, gamble_a_amount: 60 }));
  for (const selection of ['A', 'B']) {
    const result = calculateCPTParameters({ q: answer(rows, () => selection) }, rows);
    assert.ok(Number.isFinite(result.alpha) && result.alpha > 0);
  }
  close(calculateCPTParameters({ q: answer(rows, () => 'B') }, rows).alpha, Math.log(0.5) / Math.log(57.5 / 60));
});

test('both legacy choice encodings and serialized responses are supported', () => {
  const expected = calculateCPTParameters({ q: answer(tasks) }, tasks);
  const choicesOnly = answer(tasks);
  delete choicesOnly.selectedValues;
  const selectedOnly = answer(tasks);
  delete selectedOnly.choices;
  assert.deepEqual(calculateCPTParameters({ q: choicesOnly }, tasks), expected);
  assert.deepEqual(calculateCPTParameters({ q: selectedOnly }, tasks), expected);
  assert.deepEqual(calculateCPTParameters({ q: JSON.stringify(choicesOnly) }, tasks), expected);
});

test('snapshots remain calculable after tasks change or are deleted', () => {
  const original = { q: answer(tasks) };
  const expected = calculateCPTParameters(original, tasks);
  const changed = tasks.map(task => ({ ...task, gamble_a_amount: 999, title: 'Renamed task' }));
  assert.deepEqual(calculateCPTParameters(original, changed), expected);
  assert.deepEqual(calculateCPTParameters(original, []), expected);
});

test('legacy displayed amounts take precedence over new task amounts', () => {
  const legacy = answer(gains);
  legacy.rows = gains.map(task => ({ id: task.id, sureAmount: task.sure_amount, gamble: '50% chance to win 150 or 50% chance to win 0' }));
  const changed = gains.map(task => ({ ...task, gamble_a_amount: 300 }));
  close(calculateCPTParameters({ q: legacy }, changed).alpha, Math.log(0.5) / Math.log(50 / 150));
});

test('saved IDs determine row metadata even when question options reorder', () => {
  const legacy = answer(tasks);
  legacy.rows = tasks.map(task => ({ id: task.id, sureAmount: task.sure_amount }));
  const question = { id: 'q', options: [...tasks].reverse().map(task => ({ ...task, sureAmount: task.sure_amount })) };
  assert.deepEqual(calculateCPTParameters({ q: legacy }, tasks, [question]), calculateCPTParameters({ q: answer(tasks) }, tasks));
});

test('arbitrary task titles and actual probabilities are used', () => {
  const renamed = tasks.map(task => ({ ...task, title: 'Custom task' }));
  assert.deepEqual(calculateCPTParameters({ q: answer(renamed) }, renamed), calculateCPTParameters({ q: answer(tasks) }, tasks));
  const quarter = tasks.map(task => ({ ...task, gamble_a_prob: 25, gamble_b_prob: 75 }));
  const result = calculateCPTParameters({ q: answer(quarter) }, quarter);
  close(result.alpha, Math.log(0.25) / Math.log(50 / 150));
  close(result.beta, result.alpha);
  close(result.lambda, Math.pow(70 / 50, result.alpha) / 3);
});

test('missing, incomplete, and inconsistent choices never produce invented parameters', () => {
  const empty = calculateCPTParameters({}, tasks);
  for (const key of ['alpha', 'beta', 'lambda', 'gamma', 'delta']) assert.equal(empty[key], null);
  const incomplete = answer(gains);
  incomplete.choices[1] = null;
  delete incomplete.selectedValues[1];
  assert.equal(calculateCPTParameters({ q: incomplete }, gains).alpha, null);
  assert.equal(calculateCPTParameters({ q: answer(gains, task => ['g0', 'g2'].includes(task.id) ? 'A' : 'B') }, gains).alpha, null);
});

test('old cached parameters are recalculated but versioned results are retained', () => {
  const answers = snapshotLotteryAnswers({ q: answer(tasks) }, tasks);
  const result = getResponseCPT({ answers, calculated_cpt_parameters: { alpha: 1, beta: 1, lambda: 2.25 } }, tasks);
  assert.notEqual(result.lambda, 2.25);
  assert.deepEqual(getResponseCPT({ answers: {}, calculated_cpt_parameters: result }, []), result);
});

test('demographics use the identified questions rather than unrelated answers', () => {
  const questions = [
    { id: 'birth', question_text: JSON.stringify({ en: 'D1. In what year were you born?' }) },
    { id: 'shock', options: ['Yes', 'No'] },
    { id: 'detail', conditional_logic: { questionId: 'shock', expectedValue: 'Yes' } },
    { id: 'activity', question_text: 'R1. What best describes your main current activity?' },
  ];
  assert.equal(extractGeneration({ workYear: '1980', birth: '2004' }, questions), 'Gen Z');
  assert.equal(extractGeneration({ workYear: '1980' }, questions), null);
  assert.equal(extractRole({ shock: 'Yes', activity: 'I run my own business (opportunity entrepreneur)' }, questions), 'Founder');
  assert.equal(extractRole({ shock: 'Yes' }, questions), 'Other');
});
