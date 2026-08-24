import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Copy, ArrowUp, ArrowDown, Save, AlignLeft, List, Hash, LayoutGrid, CheckSquare, Loader2
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

type QuestionType = 'single_choice' | 'multiple_choice' | 'short_text' | 'number_input' | 'cpt_task';

interface Question {
  id: string;
  type: QuestionType;
  title: string;
  options: string[];
  required: boolean;
}

interface SurveyModule {
  id: string;
  title: string;
  status: string;
  question_count?: number;
}

const SurveyBuilder: React.FC = () => {
  const [modules, setModules] = useState<SurveyModule[]>([]);
  const [activeModule, setActiveModule] = useState<string | null>(null);
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoadingModules, setIsLoadingModules] = useState(true);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchModules();
  }, []);

  useEffect(() => {
    if (activeModule) {
      fetchQuestions(activeModule);
    } else {
      setQuestions([]);
    }
  }, [activeModule]);

  const fetchModules = async () => {
    setIsLoadingModules(true);
    try {
      const { data, error } = await supabase
        .from('survey_modules')
        .select('*, questions(count)')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      const formattedModules = data?.map((m: any) => ({
        ...m,
        question_count: m.questions?.[0]?.count || 0
      })) || [];
      
      setModules(formattedModules);
      
      if (formattedModules.length > 0 && !activeModule) {
        setActiveModule(formattedModules[0].id);
      }
    } catch (err) {
      console.error('Error fetching modules:', err);
      alert('Failed to load modules.');
    } finally {
      setIsLoadingModules(false);
    }
  };

  const fetchQuestions = async (moduleId: string) => {
    try {
      setIsLoadingQuestions(true);
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('module_id', moduleId)
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      if (data) {
        setQuestions(data.map((row: any) => ({
          id: row.id,
          type: row.type,
          title: row.text,
          options: row.options || [],
          required: row.required
        })));
      }
    } catch (err) {
      console.error('Error fetching questions:', err);
      alert('Failed to load questions.');
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const handleDeleteModule = async (e: React.MouseEvent, moduleId: string) => {
    e.stopPropagation();
    
    if (window.confirm('Are you sure you want to delete this module? All questions inside it will also be deleted.')) {
      try {
        const { error } = await supabase
          .from('survey_modules')
          .delete()
          .eq('id', moduleId);
          
        if (error) throw error;
        
        if (activeModule === moduleId) {
          setActiveModule(null);
        }
        
        fetchModules();
      } catch (err) {
        console.error('Error deleting module:', err);
        alert('Failed to delete module.');
      }
    }
  };

  const addModule = async () => {
    const title = prompt("Enter new module title:");
    if (!title) return;
    try {
      const { data, error } = await supabase
        .from('survey_modules')
        .insert([{ title, status: 'draft' }])
        .select()
        .single();
        
      if (error) throw error;
      
      await fetchModules();
      
      if (data) {
        setActiveModule(data.id);
      }
    } catch (err) {
      console.error('Error adding module:', err);
      alert('Failed to add module.');
    }
  };

  const addQuestion = () => {
    const newQ: Question = {
      id: crypto.randomUUID(),
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

  const duplicateQuestion = (index: number) => {
    const qToDuplicate = questions[index];
    const newQ: Question = {
      ...qToDuplicate,
      id: crypto.randomUUID(),
      title: qToDuplicate.title + ' (Copy)'
    };
    const newQuestions = [...questions];
    newQuestions.splice(index + 1, 0, newQ);
    setQuestions(newQuestions);
  };

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === questions.length - 1) return;
    
    const newQuestions = [...questions];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap
    [newQuestions[index], newQuestions[swapIndex]] = [newQuestions[swapIndex], newQuestions[index]];
    setQuestions(newQuestions);
  };

  const addOption = (qId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === qId) {
        return { ...q, options: [...q.options, `Option ${q.options.length + 1}`] };
      }
      return q;
    }));
  };

  const updateOption = (qId: string, index: number, value: string) => {
    setQuestions(questions.map(q => {
      if (q.id === qId) {
        const newOptions = [...q.options];
        newOptions[index] = value;
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const removeOption = (qId: string, index: number) => {
    setQuestions(questions.map(q => {
      if (q.id === qId) {
        const newOptions = q.options.filter((_, i) => i !== index);
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const handleSave = async () => {
    if (!activeModule) return;
    setIsSaving(true);
    try {
      const questionsToUpsert = questions.map((q, index) => ({
        id: q.id,
        module_id: activeModule,
        text: q.title,
        type: q.type,
        options: q.options,
        order_index: index,
        required: q.required
      }));

      if (questionsToUpsert.length > 0) {
        const { error: upsertError } = await supabase
          .from('questions')
          .upsert(questionsToUpsert);

        if (upsertError) throw upsertError;
      }

      const { data: dbQuestions, error: fetchError } = await supabase
        .from('questions')
        .select('id')
        .eq('module_id', activeModule);
        
      if (fetchError) throw fetchError;

      const currentIds = new Set(questions.map(q => q.id));
      const idsToDelete = dbQuestions?.filter(q => !currentIds.has(q.id)).map(q => q.id) || [];

      if (idsToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from('questions')
          .delete()
          .in('id', idsToDelete);
        
        if (deleteError) throw deleteError;
      }

      alert('Saved successfully!');
      fetchModules(); // Refresh modules to update question counts
    } catch (error) {
      console.error('Supabase Error:', error);
      alert('Failed to save questions.');
    } finally {
      setIsSaving(false);
    }
  };

  const activeModuleData = modules.find(m => m.id === activeModule);

  return (
    <div className="flex flex-col md:flex-row w-full min-h-[calc(100vh-4rem)] bg-[#FFFDF5] text-slate-800 font-sans">
      {/* Left Column (Sidebar) */}
      <div className="w-full md:w-1/4 bg-[#FFFDF5] border-b md:border-b-0 md:border-r border-gray-200 p-6 flex flex-col">
        <h2 className="text-xl font-bold mb-6 text-slate-900">Survey Modules</h2>
        <div className="space-y-3">
          {isLoadingModules ? (
            <div className="flex justify-center py-4"><Loader2 className="animate-spin text-slate-400" size={24} /></div>
          ) : modules.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-500">
              No modules found.<br />
            </div>
          ) : (
            modules.map(mod => (
              <div 
                key={mod.id}
                onClick={() => setActiveModule(mod.id)}
                className={`p-4 rounded-xl cursor-pointer transition-all flex justify-between items-start group ${activeModule === mod.id ? 'bg-white border border-gray-200 shadow-sm border-l-4 border-l-[#F4C542]' : 'hover:bg-white border border-transparent hover:border-gray-200'}`}
              >
                <div>
                  <h3 className={`font-semibold ${activeModule === mod.id ? 'text-slate-800' : 'text-slate-700'}`}>{mod.title}</h3>
                  <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${mod.status === 'active' ? 'bg-green-500' : 'bg-gray-300'}`}></span> {mod.status === 'active' ? 'Active' : 'Draft'} • {activeModule === mod.id ? questions.length : mod.question_count} Questions
                  </p>
                </div>
                <button 
                  onClick={(e) => handleDeleteModule(e, mod.id)}
                  className="text-gray-300 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity rounded-md hover:bg-red-50"
                  title="Delete Module"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
          <button 
            onClick={addModule} 
            className="w-full mt-4 py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 font-medium hover:border-[#F4C542] hover:text-[#c79a20] transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={18} /> Add Module
          </button>
        </div>
      </div>

      {/* Right Column (Main Area - 3/4 width) */}
      <div className="w-full md:w-3/4 p-4 md:p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 max-w-4xl mx-auto">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-1">Builder Canvas</h1>
            {activeModuleData ? (
              <p className="text-gray-600 font-medium">Editing: <span className="text-slate-900">{activeModuleData.title}</span></p>
            ) : (
              <p className="text-gray-600 font-medium">Select a module to edit</p>
            )}
          </div>
          <button 
            onClick={handleSave}
            disabled={isSaving || isLoadingQuestions || !activeModule}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg transition-colors shadow-md font-medium shrink-0 ${
              isSaving || isLoadingQuestions || !activeModule ? 'bg-slate-700 text-slate-300 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {isSaving ? 'Saving...' : 'Publish / Save Changes'}
          </button>
        </div>
        
        {/* Questions */}
        <div className="space-y-6 max-w-4xl mx-auto pb-12">
          {!activeModule ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="text-xl font-semibold text-slate-700 mb-2">No module selected</h3>
              <p className="text-gray-500 mb-6">Please select a module from the sidebar or create a new one.</p>
            </div>
          ) : isLoadingQuestions ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
              <Loader2 className="w-10 h-10 animate-spin mb-4 text-[#F4C542]" />
              <p className="font-medium text-lg">Loading questions...</p>
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="text-xl font-semibold text-slate-700 mb-2">No questions yet</h3>
              <p className="text-gray-500 mb-6">Start building your survey by adding a new question below.</p>
            </div>
          ) : questions.map((q, index) => (
            <div key={q.id} className="bg-white rounded-2xl shadow-sm border border-gray-200/80 overflow-hidden transition-all hover:shadow-md">
              {/* Card Header & Actions */}
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
                    title="Move Up"
                  >
                    <ArrowUp size={16} />
                  </button>
                  <button 
                    onClick={() => moveQuestion(index, 'down')}
                    disabled={index === questions.length - 1}
                    className="p-1.5 text-gray-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                    title="Move Down"
                  >
                    <ArrowDown size={16} />
                  </button>
                  <div className="w-px h-4 bg-gray-300 mx-1"></div>
                  <button 
                    onClick={() => duplicateQuestion(index)}
                    className="p-1.5 text-gray-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                    title="Duplicate"
                  >
                    <Copy size={16} />
                  </button>
                  <button 
                    onClick={() => removeQuestion(q.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Card Body */}
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
                  <div className="w-full md:w-56 shrink-0">
                    <div className="relative">
                      <select
                        value={q.type}
                        onChange={(e) => updateQuestion(q.id, { type: e.target.value as QuestionType })}
                        className="w-full appearance-none rounded-xl border border-gray-200 text-sm focus:border-[#F4C542] focus:ring-[#F4C542] bg-white py-2.5 pl-9 pr-8 outline-none shadow-sm font-medium text-slate-700 cursor-pointer"
                      >
                        <option value="single_choice">Single Choice</option>
                        <option value="multiple_choice">Multiple Choice</option>
                        <option value="short_text">Short Text</option>
                        <option value="number_input">Number Input</option>
                        <option value="cpt_task">Structured CPT Task</option>
                      </select>
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                        {q.type === 'single_choice' && <CheckSquare size={16} />}
                        {q.type === 'multiple_choice' && <List size={16} />}
                        {q.type === 'short_text' && <AlignLeft size={16} />}
                        {q.type === 'number_input' && <Hash size={16} />}
                        {q.type === 'cpt_task' && <LayoutGrid size={16} />}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dynamic Content based on Question Type */}
                <div className="pl-0 md:pl-2">
                  {(q.type === 'single_choice' || q.type === 'multiple_choice') && (
                    <div className="space-y-3">
                      {q.options.map((opt, optIndex) => (
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
                            title="Remove option"
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

                  {q.type === 'cpt_task' && (
                    <div className="bg-[#FFFDF5] p-5 rounded-xl border border-[#F4C542]/30 mt-4 shadow-inner">
                      <div className="flex items-center gap-3 mb-2">
                        <LayoutGrid className="text-[#F4C542]" size={20} />
                        <h4 className="font-semibold text-slate-800">Cumulative Prospect Theory Module</h4>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        This module will present participants with a series of structured lotteries (e.g., "50% chance to win $100 vs. 100% chance to win $40"). Parameters for the CPT task can be configured in the global settings.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Add Button */}
          {activeModule && (
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
    </div>
  );
};

export default SurveyBuilder;
