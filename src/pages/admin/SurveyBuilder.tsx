import React, { useState, useEffect } from 'react';
import { PlusCircle, Edit, Trash2, ArrowUp, ArrowDown, Save, Check, X, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

// Types
type Survey = {
  id: string;
  title: string;
  description: string;
  created_at: string;
  versions?: { status: string; id: string; version_number: number }[];
};

type QuestionType = 'short_text' | 'long_text' | 'multiple_choice' | 'single_choice' | 'number_input';

type Question = {
  id: string; // uuid from db or temp id for UI
  survey_version_id?: string;
  type: QuestionType;
  text: string;
  options: any; // e.g., string[] for choices
  order_index: number;
  is_required: boolean;
  isNew?: boolean; // track if it's not in db yet
};

export const SurveyBuilder: React.FC = () => {
  const [view, setView] = useState<'list' | 'edit'>('list');
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Edit State
  const [currentSurvey, setCurrentSurvey] = useState<Partial<Survey> | null>(null);
  const [currentVersion, setCurrentVersion] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (view === 'list') {
      fetchSurveys();
    }
  }, [view]);

  const fetchSurveys = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('surveys')
      .select('id, title, description, created_at, versions:survey_versions(id, status, version_number)')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error(error);
    } else {
      setSurveys(data || []);
    }
    setLoading(false);
  };

  const handleCreateNew = async () => {
    // Just set state to new
    setCurrentSurvey({ title: 'New Survey', description: '' });
    setCurrentVersion(null);
    setQuestions([]);
    setView('edit');
  };

  const handleEdit = async (survey: Survey) => {
    setLoading(true);
    setCurrentSurvey(survey);
    setView('edit');
    
    // Find draft version or latest
    const versions = survey.versions || [];
    let versionToEdit = versions.find(v => v.status === 'draft');
    if (!versionToEdit && versions.length > 0) {
      versionToEdit = versions.sort((a,b) => b.version_number - a.version_number)[0];
    }
    
    if (versionToEdit) {
      setCurrentVersion(versionToEdit);
      // Fetch questions
      const { data: qData, error } = await supabase
        .from('questions')
        .select('*')
        .eq('survey_version_id', versionToEdit.id)
        .order('order_index', { ascending: true });
        
      if (!error && qData) {
        setQuestions(qData as Question[]);
      }
    } else {
      setCurrentVersion(null);
      setQuestions([]);
    }
    
    setLoading(false);
  };

  const addQuestion = (type: QuestionType) => {
    setQuestions([...questions, {
      id: `temp-${Date.now()}`,
      type,
      text: '',
      options: type === 'multiple_choice' || type === 'single_choice' ? ['Option 1'] : null,
      order_index: questions.length,
      is_required: false,
      isNew: true
    }]);
  };

  const updateQuestion = (index: number, updates: Partial<Question>) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], ...updates };
    setQuestions(updated);
  };

  const removeQuestion = (index: number) => {
    const updated = [...questions];
    updated.splice(index, 1);
    // update order_index
    setQuestions(updated.map((q, i) => ({ ...q, order_index: i })));
  };

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === questions.length - 1) return;
    
    const newQuestions = [...questions];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap
    const temp = newQuestions[index];
    newQuestions[index] = newQuestions[swapIndex];
    newQuestions[swapIndex] = temp;
    
    // Update order indexes
    setQuestions(newQuestions.map((q, i) => ({ ...q, order_index: i })));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      let surveyId = currentSurvey?.id;
      
      // 1. Save or Create Survey
      if (!surveyId) {
        const { data: sData, error: sErr } = await supabase
          .from('surveys')
          .insert({
            title: currentSurvey?.title || 'Untitled Survey',
            description: currentSurvey?.description || '',
            created_by: userData.user?.id
          })
          .select()
          .single();
          
        if (sErr) throw sErr;
        surveyId = sData.id;
        setCurrentSurvey(sData);
      } else {
        const { error: sErr } = await supabase
          .from('surveys')
          .update({
            title: currentSurvey?.title || 'Untitled Survey',
            description: currentSurvey?.description || ''
          })
          .eq('id', surveyId);
        if (sErr) throw sErr;
      }
      
      // 2. Save or Create Version
      let versionId = currentVersion?.id;
      if (!versionId) {
        const { data: vData, error: vErr } = await supabase
          .from('survey_versions')
          .insert({
            survey_id: surveyId,
            version_number: (currentSurvey?.versions?.length || 0) + 1,
            status: 'draft'
          })
          .select()
          .single();
        if (vErr) throw vErr;
        versionId = vData.id;
        setCurrentVersion(vData);
      }
      
      // 3. Save Questions
      // First, get existing questions for this version to handle deletes
      const { data: existingQs } = await supabase
        .from('questions')
        .select('id')
        .eq('survey_version_id', versionId);
        
      const currentQIds = questions.filter(q => !q.isNew).map(q => q.id);
      const qsToDelete = (existingQs || []).filter(eq => !currentQIds.includes(eq.id)).map(eq => eq.id);
      
      if (qsToDelete.length > 0) {
         await supabase.from('questions').delete().in('id', qsToDelete);
      }
      
      // Upsert questions
      for (const q of questions) {
        const qData = {
          survey_version_id: versionId,
          type: q.type,
          text: q.text,
          options: q.options,
          order_index: q.order_index,
          is_required: q.is_required
        };
        
        if (q.isNew) {
          const { error: iErr } = await supabase.from('questions').insert(qData);
          if (iErr) throw iErr;
        } else {
          const { error: uErr } = await supabase.from('questions').update(qData).eq('id', q.id);
          if (uErr) throw uErr;
        }
      }
      
      // Reload questions to get real IDs
      const { data: reloadedQs } = await supabase
        .from('questions')
        .select('*')
        .eq('survey_version_id', versionId)
        .order('order_index', { ascending: true });
        
      if (reloadedQs) setQuestions(reloadedQs as Question[]);
      
      alert('Survey saved successfully!');
      
    } catch (err: any) {
      setError(err.message || 'Failed to save survey');
    }
    setSaving(false);
  };
  
  const handlePublish = async () => {
    if (!currentVersion?.id) {
        alert("Please save the survey first.");
        return;
    }
    setSaving(true);
    try {
        const { error } = await supabase
          .from('survey_versions')
          .update({ status: 'published', published_at: new Date().toISOString() })
          .eq('id', currentVersion.id);
          
        if (error) throw error;
        setCurrentVersion({...currentVersion, status: 'published'});
        alert("Survey published!");
    } catch (err: any) {
        setError(err.message || 'Failed to publish survey');
    }
    setSaving(false);
  }

  if (view === 'list') {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Survey Builder</h1>
            <p className="text-muted-foreground mt-2">Design and manage demographic and psychometric questionnaires.</p>
          </div>
          <button 
            onClick={handleCreateNew}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors shadow-sm">
            <PlusCircle className="w-4 h-4" />
            New Survey
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
             <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid gap-4">
            {surveys.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground bg-card/50 rounded-2xl border border-white/10">
                No surveys found. Create one to get started.
              </div>
            ) : surveys.map((survey) => {
              const latestVersion = survey.versions?.sort((a,b) => b.version_number - a.version_number)[0];
              const status = latestVersion?.status || 'draft';
              
              return (
                <div key={survey.id} className="bg-card/50 backdrop-blur-xl border border-white/10 p-6 rounded-2xl flex items-center justify-between group hover:border-primary/30 transition-all cursor-pointer" onClick={() => handleEdit(survey)}>
                  <div>
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      {survey.title}
                      <span className={`text-xs px-2 py-0.5 rounded-full ${status === 'published' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                        {status}
                      </span>
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">Created {new Date(survey.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
                      <Edit className="w-4 h-4" /> Edit Survey
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Edit View
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 bg-background/80 backdrop-blur-md z-10 py-4 border-b border-border/40">
        <div className="flex items-center gap-4">
          <button onClick={() => setView('list')} className="p-2 hover:bg-muted rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Edit Survey</h1>
            {currentVersion && (
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                Version {currentVersion.version_number}
                <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${currentVersion.status === 'published' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                  {currentVersion.status}
                </span>
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {currentVersion?.status !== 'published' && (
            <button 
              onClick={handlePublish}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted font-medium transition-colors">
              Publish
            </button>
          )}
          <button 
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors shadow-sm">
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5" /> {error}
        </div>
      )}

      {/* Survey Info */}
      <div className="bg-card/50 backdrop-blur-xl border border-white/10 p-6 rounded-2xl space-y-4">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">Survey Title</label>
          <input 
            type="text" 
            value={currentSurvey?.title || ''}
            onChange={(e) => setCurrentSurvey(prev => ({...prev, title: e.target.value}))}
            className="w-full bg-background border border-input rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 text-lg font-medium"
            placeholder="e.g., Demographics Questionnaire"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">Description</label>
          <textarea 
            value={currentSurvey?.description || ''}
            onChange={(e) => setCurrentSurvey(prev => ({...prev, description: e.target.value}))}
            className="w-full bg-background border border-input rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[100px]"
            placeholder="Brief description of the survey's purpose..."
          />
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Questions</h3>
        
        {loading ? (
            <div className="flex items-center justify-center py-8">
               <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        ) : (
          questions.map((q, index) => (
            <div key={q.id} className="bg-card border border-white/10 rounded-2xl p-5 shadow-sm group relative">
              <div className="absolute right-4 top-4 flex items-center gap-1 opacity-50 hover:opacity-100 transition-opacity">
                <button onClick={() => moveQuestion(index, 'up')} disabled={index === 0} className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground disabled:opacity-30">
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button onClick={() => moveQuestion(index, 'down')} disabled={index === questions.length - 1} className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground disabled:opacity-30">
                  <ArrowDown className="w-4 h-4" />
                </button>
                <button onClick={() => removeQuestion(index)} className="p-1.5 hover:bg-red-500/20 hover:text-red-500 rounded text-muted-foreground ml-2">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 pr-24">
                <div className="flex gap-4">
                  <div className="w-1/3">
                    <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Type</label>
                    <select 
                      value={q.type}
                      onChange={(e) => {
                        const newType = e.target.value as QuestionType;
                        let newOptions = q.options;
                        if ((newType === 'multiple_choice' || newType === 'single_choice') && !Array.isArray(q.options)) {
                           newOptions = ['Option 1'];
                        }
                        updateQuestion(index, { type: newType, options: newOptions });
                      }}
                      className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <option value="short_text">Short Text</option>
                      <option value="long_text">Long Text</option>
                      <option value="single_choice">Single Choice (Radio)</option>
                      <option value="multiple_choice">Multiple Choice (Checkbox)</option>
                      <option value="number_input">Number Input</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Question Text</label>
                    <input 
                      type="text" 
                      value={q.text}
                      onChange={(e) => updateQuestion(index, { text: e.target.value })}
                      className="w-full bg-background border border-input rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="Enter question text here..."
                    />
                  </div>
                </div>

                {/* Options Editor */}
                {(q.type === 'single_choice' || q.type === 'multiple_choice') && (
                  <div className="pl-4 border-l-2 border-border space-y-2 mt-4">
                    <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Options</label>
                    {(q.options as string[] || []).map((opt, optIndex) => (
                      <div key={optIndex} className="flex gap-2">
                        <input
                           type="text"
                           value={opt}
                           onChange={(e) => {
                             const newOpts = [...(q.options as string[])];
                             newOpts[optIndex] = e.target.value;
                             updateQuestion(index, { options: newOpts });
                           }}
                           className="flex-1 bg-background border border-input rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                           placeholder={`Option ${optIndex + 1}`}
                        />
                        <button 
                          onClick={() => {
                            const newOpts = [...(q.options as string[])];
                            newOpts.splice(optIndex, 1);
                            updateQuestion(index, { options: newOpts });
                          }}
                          className="p-1.5 text-muted-foreground hover:text-red-500 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button 
                      onClick={() => {
                        const newOpts = [...(q.options as string[] || []), `Option ${(q.options?.length || 0) + 1}`];
                        updateQuestion(index, { options: newOpts });
                      }}
                      className="text-xs text-primary hover:underline font-medium mt-2 flex items-center gap-1"
                    >
                      <PlusCircle className="w-3 h-3" /> Add Option
                    </button>
                  </div>
                )}

                <div className="pt-2">
                  <label className="flex items-center gap-2 text-sm cursor-pointer w-max">
                    <input 
                      type="checkbox" 
                      checked={q.is_required}
                      onChange={(e) => updateQuestion(index, { is_required: e.target.checked })}
                      className="rounded border-input text-primary focus:ring-primary/50 bg-background"
                    />
                    Required Question
                  </label>
                </div>
              </div>
            </div>
          ))
        )}

        {/* Add Question Button */}
        <div className="pt-4 flex justify-center pb-12">
          <div className="bg-card/50 border border-white/5 p-2 rounded-xl flex flex-wrap items-center justify-center gap-2 backdrop-blur-sm">
            <span className="text-sm font-medium text-muted-foreground px-2">Add new:</span>
            {['short_text', 'single_choice', 'multiple_choice'].map(t => (
              <button 
                key={t}
                onClick={() => addQuestion(t as QuestionType)}
                className="px-3 py-1.5 bg-background border border-border rounded-lg text-sm hover:border-primary/50 hover:text-primary transition-colors"
              >
                {t.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </button>
            ))}
          </div>
        </div>
        
      </div>
    </div>
  );
};
