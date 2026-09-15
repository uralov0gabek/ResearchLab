const fs = require('fs');
const filePath = 'frontend/src/pages/admin/SurveyBuilder.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Add cptTasksList state
content = content.replace(
  'const [questions, setQuestions] = useState<Question[]>([]);',
  `const [questions, setQuestions] = useState<Question[]>([]);\n  const [cptTasksList, setCptTasksList] = useState<any[]>([]);`
);

// Fetch CPT tasks inside fetchQuestions
content = content.replace(
  'const data = await apiFetch(`/questions`);',
  `const data = await apiFetch('/questions');\n      const cptData = await apiFetch('/cpt-tasks').catch(() => []);\n      if (cptData) setCptTasksList(cptData);`
);

// Replace the lottery section
const targetLotterySection = `                  {q.type === 'lottery' && (
                    <div className="bg-[#FFFDF5] p-5 rounded-xl border border-[#F4C542]/30 mt-4 shadow-inner">
                      <div className="flex items-center gap-3 mb-2">
                        <LayoutGrid className="text-[#F4C542]" size={20} />
                        <h4 className="font-semibold text-slate-800">Cumulative Prospect Theory Lottery</h4>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed mb-4">
                        The options below represent the CPT tasks. You can manually edit the JSON or load the latest tasks directly from the CPT Builder database.
                      </p>
                      
                      <button
                        onClick={async () => {
                          try {
                            const tasks = await apiFetch('/cpt-tasks');
                            if (tasks && Array.isArray(tasks)) {
                              const formattedOptions = tasks.map((t: any) => ({
                                id: t.id,
                                sureAmount: t.sure_amount,
                                gamble: \`\${t.gamble_a_prob}% chance to win $\${t.gamble_a_amount} or \${t.gamble_b_prob}% chance to win $\${t.gamble_b_amount}\`
                              }));
                              updateQuestion(q.id, { options: formattedOptions });
                              alert(\`Successfully loaded \${formattedOptions.length} CPT tasks from database!\`);
                            }
                          } catch (err) {
                            alert('Failed to load CPT tasks from database.');
                            console.error(err);
                          }
                        }}
                        className="mb-4 px-4 py-2 bg-[#F4C542] hover:bg-[#d4a832] text-white font-semibold rounded-lg transition-colors flex items-center gap-2 text-sm"
                      >
                        <Dices size={16} /> Load CPT Tasks from Database
                      </button>

                      <textarea
                         value={typeof q.options === 'string' ? q.options : JSON.stringify(q.options, null, 2)}
                         onChange={(e) => {
                           try {
                             const parsed = JSON.parse(e.target.value);
                             updateQuestion(q.id, { options: parsed });
                           } catch {
                             updateQuestion(q.id, { options: e.target.value });
                           }
                         }}
                         className="w-full font-mono text-sm h-48 p-3 rounded border border-gray-300"
                         placeholder={\`[
  { "sureAmount": 20, "gamble": "50% chance to win 150 USD or 0 USD" }
]\`}
                      />
                    </div>
                  )}`;

const newLotterySection = `                  {q.type === 'lottery' && (
                    <div className="bg-[#FFFDF5] p-5 rounded-xl border border-[#F4C542]/30 mt-4 shadow-inner">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <LayoutGrid className="text-[#F4C542]" size={20} />
                          <h4 className="font-semibold text-slate-800">Select CPT Tasks</h4>
                        </div>
                        <button
                          onClick={() => {
                            const allFormatted = cptTasksList.map((t: any) => ({
                              id: t.id,
                              sureAmount: t.sure_amount,
                              gamble: \`\${t.gamble_a_prob}% chance to win $\${t.gamble_a_amount} or \${t.gamble_b_prob}% chance to win $\${t.gamble_b_amount}\`
                            }));
                            updateQuestion(q.id, { options: allFormatted });
                          }}
                          className="text-xs font-semibold text-[#F4C542] hover:text-[#d4a832] bg-[#F4C542]/10 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Select All
                        </button>
                      </div>
                      
                      <div className="max-h-64 overflow-y-auto space-y-2 pr-2 custom-scrollbar border border-slate-200 rounded-lg bg-white p-2">
                        {cptTasksList.length === 0 ? (
                          <p className="text-sm text-slate-500 text-center py-4">No CPT tasks found in database. Create them in CPT Builder.</p>
                        ) : (
                          cptTasksList.map((task: any) => {
                            const currentOptions = Array.isArray(q.options) ? q.options : [];
                            const isSelected = currentOptions.some((opt: any) => opt.id === task.id);
                            
                            return (
                              <label key={task.id} className={\`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors \${isSelected ? 'bg-blue-50/50 border-blue-200' : 'bg-white border-slate-100 hover:border-blue-100'}\`}>
                                <div className="pt-0.5">
                                  <input 
                                    type="checkbox" 
                                    checked={isSelected}
                                    onChange={(e) => {
                                      let newOptions = [...currentOptions];
                                      if (e.target.checked) {
                                        newOptions.push({
                                          id: task.id,
                                          sureAmount: task.sure_amount,
                                          gamble: \`\${task.gamble_a_prob}% chance to win $\${task.gamble_a_amount} or \${task.gamble_b_prob}% chance to win $\${task.gamble_b_amount}\`
                                        });
                                      } else {
                                        newOptions = newOptions.filter((opt: any) => opt.id !== task.id);
                                      }
                                      updateQuestion(q.id, { options: newOptions });
                                    }}
                                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  />
                                </div>
                                <div>
                                  <div className="font-medium text-sm text-slate-800">{task.title}</div>
                                  <div className="text-xs text-slate-500 mt-1">
                                    Sure: $\${task.sure_amount} | Gamble: \${task.gamble_a_prob}% $\${task.gamble_a_amount} / \${task.gamble_b_prob}% $\${task.gamble_b_amount}
                                  </div>
                                </div>
                              </label>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}`;

if (content.includes('Load CPT Tasks from Database')) {
  content = content.replace(targetLotterySection, newLotterySection);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully patched SurveyBuilder.tsx');
} else {
  console.log('Could not find target section in SurveyBuilder.tsx');
}
