const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const { createRequire } = require('node:module');

const loadService = (name, database) => {
  const filename = path.resolve(__dirname, '../src/services', name);
  const loaded = new Module(filename);
  const localRequire = createRequire(filename);
  loaded.filename = filename;
  loaded.require = id => id === '../config/supabase' ? { supabaseAdmin: database } : localRequire(id);
  loaded._compile(fs.readFileSync(filename, 'utf8'), filename);
  return loaded.exports;
};

const database = (tables) => {
  const calls = [];
  return {
    calls,
    from(table) {
      const query = {
        select: () => query,
        order: (column, options) => { calls.push({ table, column, options }); return query; },
        insert: async data => { tables[table].push(data); return { error: null }; },
        then: (resolve, reject) => Promise.resolve({ data: tables[table], error: null }).then(resolve, reject),
      };
      return query;
    },
  };
};

const parameters = { alpha: 0.63, beta: 0.7, lambda: 1.5, gamma: null, delta: null, version: 2 };
const questions = [
  { id: 'birth', question_text: 'D1. In what year were you born?' },
  { id: 'shock', options: ['Yes', 'No'] },
  { id: 'hidden', conditional_logic: { questionId: 'shock', expectedValue: 'Yes' } },
  { id: 'role', question_text: 'R1. What best describes your main current activity?' },
];

test('Overview counts submitted responses despite hidden questions and excludes missing estimates', async () => {
  const responses = [
    { completed_at: '2026-10-08', answers: { birth: '2004', role: 'I run my own business', shock: 'No' }, calculated_cpt_parameters: parameters },
    { completed_at: '2026-10-08', answers: { birth: '2004', role: 'I run my own business' }, calculated_cpt_parameters: { ...parameters, alpha: null, beta: null, lambda: null } },
  ];
  const db = database({ responses, questions, cpt_tasks: [] });
  const stats = await loadService('statsService.js', db).getAggregatedStats();
  assert.equal(stats.totalResponses, 2);
  assert.equal(stats.completionRate, 100);
  assert.equal(stats.genData.find(row => row.generation === 'Gen Z').avgRiskTolerance, 0.63);
  assert.equal(stats.roleData.find(row => row.role === 'Founder').avgLossAversion, 1.5);
  assert.equal(stats.roleData.find(row => row.role === 'Worker').avgLossAversion, null);
  assert.ok(!stats.roleData.some(row => ['Yes', 'No'].includes(row.role)));
});

test('Responses returns the same authoritative parameters used by Overview', async () => {
  const response = { id: 'r', completed_at: '2026-10-08', answers: { birth: '2004', role: 'I run my own business' }, calculated_cpt_parameters: parameters };
  const db = database({ responses: [response], questions, cpt_tasks: [] });
  const fetched = await loadService('responseService.js', db).fetchResponses();
  assert.deepEqual(fetched[0].calculated_cpt_parameters, parameters);
  assert.equal(fetched[0].role, 'Founder');
  assert.equal(fetched[0].alpha, '0.630');
});

test('submission stores normalized choices and the displayed task snapshot', async context => {
  context.mock.method(globalThis, 'fetch', async () => ({ ok: true }));
  const tasks = [20, 40, 60].map((sure_amount, i) => ({ id: `g${i}`, title: `G1${String.fromCharCode(97 + i)}`, sure_amount, gamble_a_amount: 150, gamble_a_prob: 50, gamble_b_amount: 0, gamble_b_prob: 50 }));
  const tables = { responses: [], questions: [{ id: 'q', options: tasks }], cpt_tasks: tasks };
  const db = database(tables);
  await loadService('responseService.js', db).saveResponse('session', {
    q: { type: 'lottery_response', rows: tasks.map(task => task.id), selectedValues: { 0: 'B', 1: 'B', 2: 'A' } },
  });
  const stored = tables.responses[0];
  assert.deepEqual(stored.answers.q.choices, ['B', 'B', 'A']);
  assert.equal(stored.answers.q.rows[0].gamble_a_amount, 150);
  assert.equal(stored.calculated_cpt_parameters.version, 2);
  assert.ok(stored.calculated_cpt_parameters.alpha > 0);
  assert.equal(stored.calculated_cpt_parameters.beta, null);
  assert.ok(stored.completed_at);
});

test('CPT tasks sort naturally and question ordering has a stable tie breaker', async () => {
  const db = database({ cpt_tasks: [{ id: 'b', title: 'G10a' }, { id: 'a', title: 'G2a' }], questions: [] });
  const tasks = await loadService('cptTaskService.js', db).fetchCptTasks();
  assert.deepEqual(tasks.map(task => task.title), ['G2a', 'G10a']);
  await loadService('questionService.js', db).fetchQuestions();
  assert.deepEqual(db.calls.filter(call => call.table === 'questions').map(call => call.column), ['order_index', 'id']);
});
