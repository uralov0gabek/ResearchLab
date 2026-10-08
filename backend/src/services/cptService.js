const CALCULATION_VERSION = 2;

const parseValue = (value) => {
  if (typeof value !== 'string') return value;
  try { return JSON.parse(value); } catch { return value; }
};

const numeric = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const result = Number(value);
  return Number.isFinite(result) ? result : null;
};

const localizedText = (value) => {
  const parsed = parseValue(value);
  if (parsed && typeof parsed === 'object') return parsed.en || parsed.uz || parsed.ru || '';
  return typeof parsed === 'string' ? parsed : '';
};

const validChoice = (value) => value === 'A' || value === 'B';
const average = (values) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;

// Saved row fields take precedence over editable task definitions.
const resolveRow = (row, tasks, options, index) => {
  const saved = row && typeof row === 'object' ? row : {};
  const id = saved.id || (typeof row === 'string' ? row : null);
  const option = id ? options.find(item => item?.id === id) : options[index];
  const task = tasks.find(item => item.id === (id || option?.id));
  const data = { ...task, ...option, ...saved };
  const resolved = {
    ...data,
    sureAmount: numeric(saved.sureAmount ?? saved.sure_amount ?? option?.sureAmount ?? option?.sure_amount ?? task?.sure_amount),
    gamble_a_amount: numeric(data.gamble_a_amount),
    gamble_a_prob: numeric(data.gamble_a_prob),
    gamble_b_amount: numeric(data.gamble_b_amount),
    gamble_b_prob: numeric(data.gamble_b_prob),
  };

  // Older snapshots may contain only the displayed two-outcome description.
  const outcomes = [...localizedText(saved.gamble || data.gamble).matchAll(/([\d.]+)%\s+chance\s+to\s+(win|lose)\s+\$?(-?[\d,]+(?:\.\d+)?)/gi)];
  if (outcomes.length === 2) {
    outcomes.forEach((match, i) => {
      const key = i === 0 ? 'a' : 'b';
      const amount = Number(match[3].replace(/,/g, ''));
      if (saved.gamble && saved['gamble_' + key + '_amount'] == null) {
        resolved['gamble_' + key + '_amount'] = match[2].toLowerCase() === 'lose' ? -Math.abs(amount) : amount;
      } else resolved['gamble_' + key + '_amount'] ??= match[2].toLowerCase() === 'lose' ? -Math.abs(amount) : amount;
      if (saved.gamble && saved['gamble_' + key + '_prob'] == null) resolved['gamble_' + key + '_prob'] = Number(match[1]);
      else resolved['gamble_' + key + '_prob'] ??= Number(match[1]);
    });
  }
  return resolved;
};

const snapshotLotteryAnswers = (answers, tasks = [], questions = []) => Object.fromEntries(
  Object.entries(answers).map(([id, value]) => {
    const answer = parseValue(value);
    if (!answer || answer.type !== 'lottery_response') return [id, value];
    const question = questions.find(item => String(item.id) === id.split('__')[0]);
    const options = parseValue(question?.options);
    const fallbackOptions = Array.isArray(options) ? options : [];
    const rows = Array.isArray(answer.rows) && answer.rows.length ? answer.rows : fallbackOptions;
    const choices = rows.map((_, i) => validChoice(answer.selectedValues?.[i]) ? answer.selectedValues[i] : answer.choices?.[i] ?? null);
    return [id, {
      ...answer,
      choices,
      selectedValues: Object.fromEntries(choices.map((choice, i) => [i, choice]).filter(([, choice]) => validChoice(choice))),
      rows: rows.map((row, i) => resolveRow(row, tasks, fallbackOptions, i)),
    }];
  })
);

// Lower choices must precede upper choices; otherwise there is no unique switch.
const switchingPoint = (rows, amountKey, lowerChoice, upperLimit = Infinity) => {
  if (rows.length < 2 || rows.some(row => !validChoice(row.choice))) return null;
  const sorted = [...rows].sort((a, b) => a[amountKey] - b[amountKey]);
  const unique = [];
  for (const row of sorted) {
    const previous = unique[unique.length - 1];
    if (previous?.[amountKey] === row[amountKey]) {
      if (previous.choice !== row.choice) return null;
    } else unique.push(row);
  }
  if (unique.length < 2) return null;
  const switchIndex = unique.findIndex(row => row.choice !== lowerChoice);
  if (switchIndex !== -1 && unique.slice(switchIndex).some(row => row.choice === lowerChoice)) return null;
  const amounts = unique.map(row => row[amountKey]);
  const min = amounts[0], max = amounts[amounts.length - 1];
  if (switchIndex === 0) return (Math.max(0, min - (amounts[1] - min)) + min) / 2;
  if (switchIndex === -1) {
    const upper = Math.min(upperLimit, max + (max - amounts[amounts.length - 2]));
    return upper > max ? (max + upper) / 2 : null;
  }
  return (amounts[switchIndex - 1] + amounts[switchIndex]) / 2;
};

const calculateCertaintyEquivalent = (rows, isLoss = false, maximum = Infinity) => switchingPoint(
  rows.map(row => ({ ...row, amount: Math.abs(row.sureAmount) })), 'amount', isLoss ? 'A' : 'B', maximum
);

const computeAlphaBeta = (ce, probability, amount) => {
  if (!(ce > 0 && ce < amount && probability > 0 && probability < 1)) return null;
  const result = Math.log(probability) / Math.log(ce / amount);
  return Number.isFinite(result) && result > 0 ? result : null;
};

const calculateCPTParameters = (answers, tasks = [], questions = []) => {
  const snapshots = snapshotLotteryAnswers(answers || {}, tasks, questions);
  const rows = [], seen = new Set();
  Object.values(snapshots).forEach(answer => {
    if (answer?.type !== 'lottery_response') return;
    answer.rows.forEach((row, i) => {
      if (row.id && seen.has(row.id)) return;
      if (row.id) seen.add(row.id);
      rows.push({ ...row, choice: answer.choices[i] });
    });
  });
  tasks.forEach(task => {
    if (seen.has(task.id)) return;
    const choice = snapshots['cpt_' + task.id] ?? snapshots[task.id];
    if (validChoice(choice)) rows.push({ ...resolveRow(task, tasks, [], 0), choice });
  });

  const groups = new Map();
  rows.forEach(row => {
    const a = row.gamble_a_amount, b = row.gamble_b_amount;
    const pa = row.gamble_a_prob, pb = row.gamble_b_prob;
    if ([a, b, pa, pb, row.sureAmount].some(value => value === null) ||
        !(pa > 0 && pb > 0) || Math.abs(pa + pb - 100) > 0.000001) return;
    let kind, amount, probability, gainProbability, lossProbability;
    if (a * b < 0 && row.sureAmount === 0) {
      kind = 'mixed';
      amount = Math.abs(Math.min(a, b));
      gainProbability = (a > 0 ? pa : pb) / 100;
      lossProbability = (a < 0 ? pa : pb) / 100;
    } else if ((a === 0 || b === 0) && a !== b) {
      const outcome = a !== 0 ? a : b;
      kind = outcome > 0 ? 'gain' : 'loss';
      if ((kind === 'gain' && row.sureAmount < 0) || (kind === 'loss' && row.sureAmount > 0)) return;
      amount = Math.abs(outcome);
      probability = (a !== 0 ? pa : pb) / 100;
    } else return;
    // Preserve repeated task groups without restricting their names to a whitelist.
    const groupId = row.group_id || row.group || localizedText(row.title).match(/^([a-z]+\d+)/i)?.[1].toUpperCase();
    const key = JSON.stringify([groupId, kind, amount, probability, gainProbability, lossProbability]);
    if (!groups.has(key)) groups.set(key, { kind, amount, probability, gainProbability, lossProbability, rows: [] });
    groups.get(key).rows.push({ ...row, gain: Math.max(a, b) });
  });

  const alphas = [], betas = [], mixed = [];
  groups.forEach(group => {
    if (group.kind === 'mixed') { mixed.push(group); return; }
    const ce = calculateCertaintyEquivalent(group.rows, group.kind === 'loss', group.amount);
    const parameter = computeAlphaBeta(ce, group.probability, group.amount);
    if (parameter !== null) (group.kind === 'gain' ? alphas : betas).push(parameter);
  });
  const alpha = average(alphas), beta = average(betas), lambdas = [];
  if (alpha !== null && beta !== null) {
    mixed.forEach(group => {
      const gain = switchingPoint(group.rows, 'gain', 'A');
      if (!(gain > 0)) return;
      const lambda = group.gainProbability * Math.pow(gain, alpha) /
        (group.lossProbability * Math.pow(group.amount, beta));
      if (Number.isFinite(lambda) && lambda > 0) lambdas.push(lambda);
    });
  }
  // This CE estimator uses objective probabilities; weighting parameters are not fitted.
  return { alpha, beta, lambda: average(lambdas), gamma: null, delta: null, version: CALCULATION_VERSION };
};

const getResponseCPT = (response, tasks = [], questions = []) => {
  const saved = response.calculated_cpt_parameters;
  if (saved?.version === CALCULATION_VERSION) {
    return { ...saved, ...Object.fromEntries(['alpha', 'beta', 'lambda', 'gamma', 'delta'].map(key => [key, numeric(saved[key])])) };
  }
  return calculateCPTParameters(response.answers || {}, tasks, questions);
};

const findRoleQuestion = (questions) => questions.find(question => {
  const text = localizedText(question.question_text || question.text || question.title).toLowerCase();
  return /^r1[.\s:]/.test(text) || text.includes('what best describes your main current activity');
}) || questions.find(question => {
  const options = parseValue(question.options);
  return Array.isArray(options) && options.filter(option => /entrepreneur|investor|employee|venture capitalist/i.test(localizedText(option))).length >= 2;
});

const extractGeneration = (answers, questions = []) => {
  const question = questions.find(item => {
    const text = localizedText(item.question_text || item.text || item.title).toLowerCase();
    return /^d1[.\s:]/.test(text) || text.includes('year were you born') || text.includes('birth year');
  });
  const birthYear = numeric(question ? answers[question.id] : answers.birthYear ?? answers.birth_year);
  if (!Number.isInteger(birthYear) || birthYear < 1900 || birthYear > new Date().getFullYear()) return null;
  if (birthYear <= 1964) return 'Boomers';
  if (birthYear <= 1980) return 'Gen X';
  if (birthYear <= 1996) return 'Millennials';
  return 'Gen Z';
};

const extractRole = (answers, questions = []) => {
  const question = findRoleQuestion(questions);
  const role = localizedText(question ? answers[question.id] : answers.role).toLowerCase();
  if (/entrepreneur|i run my own business|founder/.test(role)) return 'Founder';
  if (/investor|venture capitalist|^vc$/.test(role)) return 'VC';
  if (/employee|salary|wage|worker/.test(role)) return 'Worker';
  return 'Other';
};

module.exports = {
  calculateCPTParameters, calculateCertaintyEquivalent, snapshotLotteryAnswers,
  getResponseCPT, extractGeneration, extractRole,
};
