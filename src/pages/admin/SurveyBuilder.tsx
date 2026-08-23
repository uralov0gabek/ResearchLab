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

const SurveyBuilder: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      if (data) {
        // Map database fields to the UI state
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
      setIsLoading(false);
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
    setIsSaving(true);
    try {
      // Upsert all current questions
      const questionsToUpsert = questions.map((q, index) => ({
        id: q.id,
        text: q.title,
        type: q.type,
        options: q.options,
        order_index: index,
        required: q.required
      }));

      const { error: upsertError } = await supabase
        .from('questions')
        .upsert(questionsToUpsert);

      if (upsertError) throw upsertError;

      // To handle deletions, we can fetch all IDs from the DB, compare with current, and delete the diff.
      const { data: dbQuestions, error: fetchError } = await supabase.from('questions').select('id');
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
    } catch (error) {
      console.error('Supabase Error:', error);
      alert('Failed to save questions.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex w-full min-h-[calc(100vh-4rem)] bg-[#FFFDF5] text-slate-800 font-sans">
      {/* Left Column (Sidebar - 1/4 width) */}
      <div className="w-1/4 bg-[#FFFDF5] border-r border-gray-200 p-6 flex flex-col hidden md:flex">
        <h2 className="text-xl font-bold mb-6 text-slate-900">Survey Modules</h2>
        <div className="space-y-3">
          <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm cursor-pointer border-l-4 border-l-[#F4C542]">
            <h3 className="font-semibold text-slate-800">Generational Loss Aversion</h3>
            <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span> Active • 12 Questions
            </p>
          </div>
          <div className="p-4 hover:bg-white border border-transparent hover:border-gray-200 rounded-xl cursor-pointer transition-all">
            <h3 className="font-semibold text-slate-700">Startup Ecosystem</h3>
            <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gray-300"></span> Draft • 8 Questions
            </p>
          </div>
          <div className="p-4 hover:bg-white border border-transparent hover:border-gray-200 rounded-xl cursor-pointer transition-all">
            <h3 className="font-semibold text-slate-700">Founder Risk Tolerance</h3>
            <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gray-300"></span> Draft • 15 Questions
            </p>
          </div>
        </div>
      </div>

      {/* Right Column (Main Area - 3/4 width) */}
      <div className="w-full md:w-3/4 p-4 md:p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 max-w-4xl mx-auto">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-1">Builder Canvas</h1>
            <p className="text-gray-600 font-medium">Editing: <span className="text-slate-900">Generational Loss Aversion</span></p>
          </div>
          <button 
            onClick={handleSave}
            disabled={isSaving || isLoading}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg transition-colors shadow-md font-medium shrink-0 ${
              isSaving || isLoading ? 'bg-slate-700 text-slate-300 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {isSaving ? 'Saving...' : 'Publish / Save Changes'}
          </button>
        </div>
        
        {/* Questions */}
        <div className="space-y-6 max-w-4xl mx-auto pb-12">
          {isLoading ? (
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
          <button 
            onClick={addQuestion}
            className="w-full py-6 border-2 border-dashed border-[#F4C542] bg-[#F4C542]/5 hover:bg-[#F4C542]/10 rounded-2xl text-[#c79a20] font-bold hover:text-[#a8821b] hover:border-[#d4a832] transition-all flex items-center justify-center gap-2 shadow-sm mt-4"
          >
            <Plus size={22} strokeWidth={2.5} />
            Add New Question
          </button>
          
          {/* Close the mapping conditional properly */}
          {questions.length > 0 ? null : null}
        </div>
      </div>
    </div>
  );
};

export default SurveyBuilder;
