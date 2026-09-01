// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, ArrowUp, ArrowDown, Save, CheckSquare, Loader2, LayoutGrid, CheckCircle,
  CircleDot, CheckSquare as CheckSquareIcon, Type, Hash, Dices, ChevronDown
} from 'lucide-react';
import { apiFetch } from '../../services/api/apiClient';

type QuestionType = 'single_choice' | 'multiple_choice' | 'short_text' | 'number_input' | 'lottery' | 'matrix' | 'slider';

interface LogicRule {
  questionId: string;
  expectedValue: string;
}

interface LogicGroup {
  operator: 'AND' | 'OR';
  rules: LogicRule[];
}

interface Question {
  id: string;
  block_name: string;
  type: QuestionType;
  title: string;
  options: unknown; // Can be string[] or for lottery: { gambleAAmount, gambleAProb, gambleBAmount, gambleBProb } etc.
  required: boolean;
  dependsOn?: LogicGroup | LogicRule;
}

const QuestionTypeDropdown = ({ value, onChange }: { value: QuestionType, onChange: (v: QuestionType) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const types = [
    { value: 'single_choice', label: 'Single Choice', icon: CircleDot },
    { value: 'multiple_choice', label: 'Multiple Choice', icon: CheckSquareIcon },
    { value: 'short_text', label: 'Short Text', icon: Type },
    { value: 'number_input', label: 'Number Input', icon: Hash },
    { value: 'matrix', label: 'Matrix Table', icon: LayoutGrid },
    { value: 'slider', label: 'Slider Scale', icon: LayoutGrid },
    { value: 'lottery', label: 'Lottery Choice (CPT)', icon: Dices },
  ];
  
  const selected = types.find(t => t.value === value) || types[0];
  const Icon = selected.icon;

  return (
    <div className="relative w-full md:w-56 shrink-0">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        className="w-full flex items-center justify-between rounded-xl border border-gray-200 bg-white py-2.5 pl-3 pr-3 text-sm outline-none shadow-sm font-medium text-slate-700 hover:border-[#F4C542] focus:border-[#F4C542] focus:ring-1 focus:ring-[#F4C542] transition-all"
      >
        <span className="flex items-center gap-2">
          <Icon size={16} className="text-[#F4C542]" />
          {selected.label}
        </span>
        <ChevronDown size={16} className="text-slate-400" />
      </button>
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg py-1 overflow-hidden">
          {types.map(t => {
            const TIcon = t.icon;
            return (
              <button
                key={t.value}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); onChange(t.value as QuestionType); setIsOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left hover:bg-slate-50 transition-colors ${value === t.value ? 'bg-[#F4C542]/5 text-[#c79a20] font-semibold' : 'text-slate-700'}`}
              >
                <TIcon size={16} className={value === t.value ? 'text-[#F4C542]' : 'text-slate-400'} />
                {t.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  );
};

const SurveyBuilder: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [activeBlock, setActiveBlock] = useState<string | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  
  const [showAddBlockModal, setShowAddBlockModal] = useState(false);
  const [newBlockName, setNewBlockName] = useState('');

  const fetchQuestions = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await apiFetch(`/questions`);
      
      if (data) {
        const loadedQuestions = data.map((row: Record<string, unknown>) => ({
          id: String(row.id),
          block_name: String(row.block_name || 'Default Block'),
          type: String(row.type) as QuestionType,
          title: String(row.question_text || ''),
          options: row.options || [],
          required: Boolean(row.required),
          dependsOn: row.conditional_logic as LogicGroup | LogicRule | undefined
        }));
        setQuestions(loadedQuestions);
        
        // Extract unique blocks
        const blocks = Array.from(new Set(loadedQuestions.map((q: Question) => q.block_name)));
        if (blocks.length > 0 && !activeBlock) {
          setActiveBlock(blocks[0] as string);
        }
      }
    } catch (err) {
      console.error('Error fetching questions:', err);
      alert('Failed to load questions.');
    } finally {
      setIsLoading(false);
    }
  }, [activeBlock]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const uniqueBlocks = Array.from(new Set(questions.map(q => q.block_name)));

  const handleAddBlock = () => {
    setNewBlockName('');
    setShowAddBlockModal(true);
  };

  const addQuestion = () => {
    if (!activeBlock) return;
    const newQ: Question = {
      id: crypto.randomUUID(),
      block_name: activeBlock,
      type: 'single_choice',
      title: '',
      options: ['Option 1'],
      required: false
    };
    setQuestions([...questions, newQ]);
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const activeBlockQuestions = questions.filter(q => q.block_name === activeBlock);

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === activeBlockQuestions.length - 1) return;
    
    const newQuestions = [...questions];
    // Find absolute index in main array
    const absoluteIndex = questions.findIndex(q => q.id === activeBlockQuestions[index].id);
    const swapAbsoluteIndex = questions.findIndex(q => q.id === activeBlockQuestions[direction === 'up' ? index - 1 : index + 1].id);
    
    // Swap
    [newQuestions[absoluteIndex], newQuestions[swapAbsoluteIndex]] = [newQuestions[swapAbsoluteIndex], newQuestions[absoluteIndex]];
    setQuestions(newQuestions);
  };

  const addOption = (qId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === qId) {
        return { ...q, options: Array.isArray(q.options) ? [...q.options, `Option ${q.options.length + 1}`] : ['Option 1'] };
      }
      return q;
    }));
  };

  const updateOption = (qId: string, index: number, value: string) => {
    setQuestions(questions.map(q => {
      if (q.id === qId && Array.isArray(q.options)) {
        const newOptions = [...q.options];
        newOptions[index] = value;
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const removeOption = (qId: string, index: number) => {
    setQuestions(questions.map(q => {
      if (q.id === qId && Array.isArray(q.options)) {
        const newOptions = q.options.filter((_, i) => i !== index);
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const questionsToUpsert = questions.map((q, index) => ({
        id: q.id,
        block_name: q.block_name,
        question_text: q.title,
        type: q.type,
        options: q.options,
        order_index: index,
        required: q.required,
        conditional_logic: q.dependsOn
      }));

      const dbQuestions = await apiFetch(`/questions`);
      const currentIds = new Set(questions.map(q => q.id));
      const idsToDelete = dbQuestions?.filter((q: { id: string }) => !currentIds.has(q.id)).map((q: { id: string }) => q.id) || [];

      await apiFetch('/questions', {
        method: 'POST',
        body: JSON.stringify({ questionsToUpsert, idsToDelete })
      });

      sessionStorage.removeItem('survey_questions_cache'); // Clear frontend cache on save
      setSaveMessage('Saved successfully!');
      setTimeout(() => setSaveMessage(null), 3000);
      fetchQuestions(); 
    } catch (error) {
      console.error('Save Error:', error);
      setSaveMessage('Failed to save questions.');
      setTimeout(() => setSaveMessage(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row w-full min-h-[calc(100vh-4rem)] bg-[#FFFDF5] text-slate-800 font-sans">
      {/* Left Column (Sidebar) */}
      <div className="w-full md:w-1/4 bg-[#FFFDF5] border-b md:border-b-0 md:border-r border-gray-200 p-6 flex flex-col">
        <h2 className="text-xl font-bold mb-6 text-slate-900">Survey Blocks</h2>
        <div className="space-y-3">
          {isLoading ? (
            <div className="flex justify-center py-4"><Loader2 className="animate-spin text-slate-400" size={24} /></div>
          ) : uniqueBlocks.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-500">
              No blocks found.<br />
            </div>
          ) : (
            uniqueBlocks.map(block => (
              <div 
                key={block}
                onClick={() => setActiveBlock(block)}
                className={`p-4 rounded-xl cursor-pointer transition-all flex justify-between items-start group ${activeBlock === block ? 'bg-white border border-gray-200 shadow-sm border-l-4 border-l-[#F4C542]' : 'hover:bg-white border border-transparent hover:border-gray-200'}`}
              >
                <div>
                  <h3 className={`font-semibold ${activeBlock === block ? 'text-slate-800' : 'text-slate-700'}`}>{block}</h3>
                  <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-2">
                    {questions.filter(q => q.block_name === block).length} Questions
                  </p>
                </div>
              </div>
            ))
          )}
          <button 
            onClick={handleAddBlock} 
            className="w-full mt-4 py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 font-medium hover:border-[#F4C542] hover:text-[#c79a20] transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={18} /> Add Block
          </button>
        </div>
      </div>

      {/* Right Column (Main Area - 3/4 width) */}
      <div className="w-full md:w-3/4 p-4 md:p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 max-w-4xl mx-auto">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-1">Builder Canvas</h1>
            {activeBlock ? (
              <p className="text-gray-600 font-medium">Editing: <span className="text-slate-900">{activeBlock}</span></p>
            ) : (
              <p className="text-gray-600 font-medium">Select a block to edit</p>
            )}
          </div>
          <div className="flex items-center gap-4 shrink-0">
            {saveMessage && (
              <span className={`font-medium text-sm flex items-center gap-1.5 ${saveMessage.includes('Failed') ? 'text-red-600' : 'text-green-600'} animate-in fade-in duration-300`}>
                <CheckCircle size={16} /> {saveMessage}
              </span>
            )}
            <button 
              onClick={handleSave}
              disabled={isSaving || isLoading}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg transition-colors shadow-md font-medium shrink-0 ${
                isSaving || isLoading ? 'bg-slate-700 text-slate-300 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
        
        {/* Questions */}
        <div className="space-y-6 max-w-4xl mx-auto pb-12">
          {!activeBlock ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="text-xl font-semibold text-slate-700 mb-2">No block selected</h3>
              <p className="text-gray-500 mb-6">Please select a block from the sidebar or create a new one.</p>
            </div>
          ) : activeBlockQuestions.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="text-xl font-semibold text-slate-700 mb-2">No questions yet</h3>
              <p className="text-gray-500 mb-6">Start building your survey by adding a new question below.</p>
            </div>
          ) : activeBlockQuestions.map((q, index) => (
            <div key={q.id} className="bg-white rounded-2xl shadow-sm border border-gray-200/80 overflow-hidden transition-all hover:shadow-md">
              <div className="flex items-center justify-between p-4 bg-gray-50/50 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-xs font-bold">
                    {index + 1}
                  </span>
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-slate-600 flex items-center gap-2 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={q.required}
                        onChange={(e) => updateQuestion(q.id, { required: e.target.checked })}
                        className="w-4 h-4 rounded border-gray-300 text-slate-900 focus:ring-slate-900"
                      />
                      Required
                    </label>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => moveQuestion(index, 'up')}
                    disabled={index === 0}
                    className="p-1.5 text-gray-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <ArrowUp size={16} />
                  </button>
                  <button 
                    onClick={() => moveQuestion(index, 'down')}
                    disabled={index === activeBlockQuestions.length - 1}
                    className="p-1.5 text-gray-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <ArrowDown size={16} />
                  </button>
                  <div className="w-px h-4 bg-gray-300 mx-1"></div>
                  <button 
                    onClick={() => removeQuestion(q.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-6 mb-6">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={q.title}
                      onChange={(e) => updateQuestion(q.id, { title: e.target.value })}
                      placeholder="Enter your question title..."
                      className="w-full text-xl font-semibold bg-transparent border-none focus:ring-0 p-0 placeholder:text-gray-300 text-slate-900 focus:outline-none"
                    />
                  </div>
                  <QuestionTypeDropdown
                    value={q.type}
                    onChange={(val) => updateQuestion(q.id, { type: val })}
                  />
                </div>

                <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <CheckSquare size={16} />
                      <span>Skip Logic / Conditional Display</span>
                    </div>
                  </div>
                  
                  {(() => {
                    let logicGroup: LogicGroup = { operator: 'AND', rules: [] };
                    if (q.dependsOn) {
                      if ('operator' in q.dependsOn) {
                        logicGroup = q.dependsOn as LogicGroup;
                      } else if ('questionId' in (q.dependsOn as Record<string, unknown>)) {
                        logicGroup = { operator: 'AND', rules: [q.dependsOn as LogicRule] };
                      }
                    }

                    const addRule = () => {
                      const newRules = [...logicGroup.rules, { questionId: '', expectedValue: '' }];
                      updateQuestion(q.id, { dependsOn: { ...logicGroup, rules: newRules } });
                    };

                    const updateRule = (rIdx: number, updates: Partial<LogicRule>) => {
                      const newRules = [...logicGroup.rules];
                      newRules[rIdx] = { ...newRules[rIdx], ...updates };
                      updateQuestion(q.id, { dependsOn: { ...logicGroup, rules: newRules } });
                    };

                    const removeRule = (rIdx: number) => {
                      const newRules = logicGroup.rules.filter((_, i) => i !== rIdx);
                      if (newRules.length === 0) {
                        updateQuestion(q.id, { dependsOn: undefined });
                      } else {
                        updateQuestion(q.id, { dependsOn: { ...logicGroup, rules: newRules } });
                      }
                    };

                    return (
                      <div className="space-y-3">
                        {logicGroup.rules.length > 0 && (
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm text-slate-600">Show this question ONLY IF</span>
                            <select
                              value={logicGroup.operator}
                              onChange={(e) => updateQuestion(q.id, { dependsOn: { ...logicGroup, operator: e.target.value as 'AND' | 'OR' } })}
                              className="appearance-none rounded border border-gray-300 text-sm font-medium focus:border-[#F4C542] focus:ring-[#F4C542] bg-white py-1 px-2 outline-none"
                            >
                              <option value="AND">ALL</option>
                              <option value="OR">ANY</option>
                            </select>
                            <span className="text-sm text-slate-600">of the following conditions are met:</span>
                          </div>
                        )}
                        
                        {logicGroup.rules.map((rule, rIdx) => (
                          <div key={rIdx} className="flex flex-col sm:flex-row gap-2 items-center bg-white p-2 rounded-lg border border-gray-100 shadow-sm">
                            <span className="text-xs font-semibold text-slate-400 w-8 text-center">
                              {rIdx === 0 ? 'IF' : logicGroup.operator}
                            </span>
                            <select
                              value={rule.questionId}
                              onChange={(e) => updateRule(rIdx, { questionId: e.target.value })}
                              className="flex-1 appearance-none rounded border border-gray-200 text-sm focus:border-[#F4C542] focus:ring-[#F4C542] bg-slate-50 py-1.5 px-2 outline-none min-w-[150px]"
                            >
                              <option value="">Select question...</option>
                              {questions.filter(otherQ => otherQ.id !== q.id).map(otherQ => (
                                <option key={otherQ.id} value={otherQ.id}>
                                  {otherQ.title.substring(0, 40)}{otherQ.title.length > 40 ? '...' : ''}
                                </option>
                              ))}
                            </select>
                            <span className="text-sm text-slate-500 shrink-0 mx-1">equals</span>
                            <input
                              type="text"
                              placeholder="Expected answer..."
                              value={rule.expectedValue}
                              onChange={(e) => updateRule(rIdx, { expectedValue: e.target.value })}
                              className="flex-1 rounded border border-gray-200 text-sm focus:border-[#F4C542] focus:ring-[#F4C542] bg-slate-50 py-1.5 px-2 outline-none min-w-[150px]"
                            />
                            <button 
                              onClick={() => removeRule(rIdx)}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                        
                        <div className="pt-2">
                          <button 
                            onClick={addRule}
                            className="inline-flex items-center gap-1.5 text-sm text-[#F4C542] hover:text-[#d4a832] font-semibold transition-colors bg-white border border-[#F4C542]/20 rounded-lg px-3 py-1.5 hover:bg-[#F4C542]/5"
                          >
                            <Plus size={14} strokeWidth={3} />
                            Add Condition
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <div className="pl-0 md:pl-2">
                  {(q.type === 'single_choice' || q.type === 'multiple_choice') && Array.isArray(q.options) && (
                    <div className="space-y-3">
                      {q.options.map((opt: string, optIndex: number) => (
                        <div key={optIndex} className="flex items-center gap-3 group/opt">
                          <div className={`w-4 h-4 border-2 border-gray-300 ${q.type === 'single_choice' ? 'rounded-full' : 'rounded'} flex-shrink-0`} />
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => updateOption(q.id, optIndex, e.target.value)}
                            placeholder={`Option ${optIndex + 1}`}
                            className="flex-1 text-base border-b border-transparent focus:border-gray-300 hover:border-gray-200 focus:ring-0 py-1 bg-transparent transition-colors outline-none text-slate-700"
                          />
                          <button 
                            onClick={() => removeOption(q.id, optIndex)}
                            className="text-gray-300 hover:text-red-400 p-1 opacity-0 group-hover/opt:opacity-100 transition-opacity"
                            disabled={q.options.length <= 1}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                      <div className="pt-2">
                        <button 
                          onClick={() => addOption(q.id)}
                          className="inline-flex items-center gap-2 text-sm text-[#d4a832] hover:text-[#b38d2a] font-semibold p-1 transition-colors"
                        >
                          <Plus size={16} strokeWidth={3} />
                          Add Option
                        </button>
                      </div>
                    </div>
                  )}

                  {q.type === 'short_text' && (
                    <div className="w-full border-b-2 border-dashed border-gray-200 pb-2 text-gray-400 text-base mt-4">
                      Short answer text will appear here...
                    </div>
                  )}
                  
                  {q.type === 'number_input' && (
                    <div className="w-32 border-b-2 border-dashed border-gray-200 pb-2 text-gray-400 text-base mt-4">
                      Numeric input...
                    </div>
                  )}

                  {q.type === 'slider' && (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-4">
                      <h4 className="font-semibold text-slate-700 text-sm mb-3">Slider Configuration</h4>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-slate-500 mb-1">Min Value</label>
                          <input
                            type="number"
                            value={q.options?.min || 0}
                            onChange={(e) => updateQuestion(q.id, { options: { ...q.options, min: Number(e.target.value) } })}
                            className="w-full rounded border border-gray-300 py-1.5 px-3 text-sm outline-none focus:border-[#F4C542]"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-slate-500 mb-1">Max Value</label>
                          <input
                            type="number"
                            value={q.options?.max || 100}
                            onChange={(e) => updateQuestion(q.id, { options: { ...q.options, max: Number(e.target.value) } })}
                            className="w-full rounded border border-gray-300 py-1.5 px-3 text-sm outline-none focus:border-[#F4C542]"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-slate-500 mb-1">Step</label>
                          <input
                            type="number"
                            value={q.options?.step || 1}
                            onChange={(e) => updateQuestion(q.id, { options: { ...q.options, step: Number(e.target.value) } })}
                            className="w-full rounded border border-gray-300 py-1.5 px-3 text-sm outline-none focus:border-[#F4C542]"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {q.type === 'matrix' && (
                    <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 mt-4 space-y-4">
                      <h4 className="font-semibold text-slate-700 text-sm">Matrix Configuration</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Rows */}
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Statements (Rows)</label>
                          <div className="space-y-2">
                            {(q.options?.rows || ['Statement 1']).map((r: string, rIdx: number) => (
                              <div key={rIdx} className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={r}
                                  onChange={(e) => {
                                    const newRows = [...(q.options?.rows || [])];
                                    newRows[rIdx] = e.target.value;
                                    updateQuestion(q.id, { options: { ...q.options, rows: newRows } });
                                  }}
                                  className="flex-1 rounded border border-gray-200 py-1.5 px-3 text-sm outline-none focus:border-[#F4C542]"
                                />
                                <button
                                  onClick={() => {
                                    const newRows = (q.options as {rows?: string[]})?.rows?.filter((_: unknown, i: number) => i !== rIdx) || [];
                                    updateQuestion(q.id, { options: { ...q.options, rows: newRows } });
                                  }}
                                  className="text-gray-400 hover:text-red-500"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            ))}
                            <button
                              onClick={() => {
                                const newRows = [...(q.options?.rows || []), `Statement ${(q.options?.rows?.length || 1) + 1}`];
                                updateQuestion(q.id, { options: { ...q.options, rows: newRows } });
                              }}
                              className="text-xs font-semibold text-[#F4C542] hover:text-[#d4a832] flex items-center gap-1 mt-1"
                            >
                              <Plus size={12} /> Add Row
                            </button>
                          </div>
                        </div>

                        {/* Columns */}
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Scale Points (Columns)</label>
                          <div className="space-y-2">
                            {(q.options?.columns || ['Option 1']).map((c: string, cIdx: number) => (
                              <div key={cIdx} className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={c}
                                  onChange={(e) => {
                                    const newCols = [...(q.options?.columns || [])];
                                    newCols[cIdx] = e.target.value;
                                    updateQuestion(q.id, { options: { ...q.options, columns: newCols } });
                                  }}
                                  className="flex-1 rounded border border-gray-200 py-1.5 px-3 text-sm outline-none focus:border-[#F4C542]"
                                />
                                <button
                                  onClick={() => {
                                    const newCols = (q.options as {columns?: string[]})?.columns?.filter((_: unknown, i: number) => i !== cIdx) || [];
                                    updateQuestion(q.id, { options: { ...q.options, columns: newCols } });
                                  }}
                                  className="text-gray-400 hover:text-red-500"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            ))}
                            <button
                              onClick={() => {
                                const newCols = [...(q.options?.columns || []), `Option ${(q.options?.columns?.length || 1) + 1}`];
                                updateQuestion(q.id, { options: { ...q.options, columns: newCols } });
                              }}
                              className="text-xs font-semibold text-[#F4C542] hover:text-[#d4a832] flex items-center gap-1 mt-1"
                            >
                              <Plus size={12} /> Add Column
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {q.type === 'lottery' && (
                    <div className="bg-[#FFFDF5] p-5 rounded-xl border border-[#F4C542]/30 mt-4 shadow-inner">
                      <div className="flex items-center gap-3 mb-2">
                        <LayoutGrid className="text-[#F4C542]" size={20} />
                        <h4 className="font-semibold text-slate-800">Cumulative Prospect Theory Lottery</h4>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed mb-4">
                        Define the rows for the A/B choices. For example: "50% chance to win X and 50% chance to win Y."
                        <br />You should define this in JSON format for the options field, e.g.:
                      </p>
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
                         className="w-full font-mono text-sm h-32 p-3 rounded border border-gray-300"
                         placeholder={`[
  { "sureAmount": 200000, "gamble": "50% chance to win 1500000 UZS or 0 UZS" }
]`}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {activeBlock && (
            <button 
              onClick={addQuestion}
              className="w-full py-6 border-2 border-dashed border-[#F4C542] bg-[#F4C542]/5 hover:bg-[#F4C542]/10 rounded-2xl text-[#c79a20] font-bold hover:text-[#a8821b] hover:border-[#d4a832] transition-all flex items-center justify-center gap-2 shadow-sm mt-4"
            >
              <Plus size={22} strokeWidth={2.5} />
              Add New Question
            </button>
          )}
        </div>
      </div>

      {/* Add Block Modal */}
      {showAddBlockModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Enter new block name</h3>
            <input
              type="text"
              value={newBlockName}
              onChange={(e) => setNewBlockName(e.target.value)}
              placeholder="e.g. Founder Questions"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-6 focus:outline-none focus:border-[#F4C542] focus:ring-1 focus:ring-[#F4C542]"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newBlockName.trim()) {
                  setActiveBlock(newBlockName.trim());
                  setShowAddBlockModal(false);
                  setNewBlockName('');
                }
              }}
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowAddBlockModal(false)}
                className="px-5 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (newBlockName.trim()) {
                    setActiveBlock(newBlockName.trim());
                    setShowAddBlockModal(false);
                    setNewBlockName('');
                  }
                }}
                disabled={!newBlockName.trim()}
                className="px-5 py-2.5 rounded-xl font-medium bg-[#F4C542] text-slate-900 hover:bg-[#e3b532] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SurveyBuilder;
