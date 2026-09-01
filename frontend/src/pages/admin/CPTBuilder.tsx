import React, { useState, useEffect } from 'react';
import { Settings, MousePointer2, Loader2, List, Edit2, Trash2, Plus } from 'lucide-react';
import { apiFetch } from '../../services/api/apiClient';

interface CPTTask {
  id: string;
  title: string;
  sure_amount: number;
  gamble_a_amount: number;
  gamble_a_prob: number;
  gamble_b_amount: number;
  gamble_b_prob: number;
  created_at?: string;
}

const CPTBuilder: React.FC = () => {
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [tasks, setTasks] = useState<CPTTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    sure_amount: 50,
    gamble_a_amount: 100,
    gamble_a_prob: 50,
    gamble_b_amount: 0,
    gamble_b_prob: 50
  });

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const data = await apiFetch('/questions');
      if (data) {
        const cptTasks = data
          .filter((q: any) => q.type === 'lottery')
          .map((q: any) => {
            const opts = Array.isArray(q.options) ? q.options[0] : null;
            const raw = opts?.raw || {};
            return {
              id: q.id,
              title: q.question_text || q.title,
              sure_amount: raw.sure_amount || 0,
              gamble_a_amount: raw.gamble_a_amount || 0,
              gamble_a_prob: raw.gamble_a_prob || 0,
              gamble_b_amount: raw.gamble_b_amount || 0,
              gamble_b_prob: raw.gamble_b_prob || 0,
              created_at: q.created_at
            };
          });
        setTasks(cptTasks);
      }
    } catch (error) {
      console.error('Error fetching CPT tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleSave = async () => {
    if (!formData.title) {
      setSaveMessage('Please enter a Task Name');
      setTimeout(() => setSaveMessage(null), 3000);
      return;
    }
    setIsSaving(true);
    try {
      await apiFetch('/questions', {
        method: 'POST',
        body: JSON.stringify({
          questionsToUpsert: [{
            id: editingTaskId || crypto.randomUUID(),
            block_name: 'CPT Tasks',
            question_text: formData.title,
            type: 'lottery',
            options: [{
              sureAmount: formData.sure_amount,
              gamble: `${formData.gamble_a_prob}% chance to win $${formData.gamble_a_amount} or ${formData.gamble_b_prob}% chance to win $${formData.gamble_b_amount}`,
              raw: { ...formData }
            }],
            required: true
          }],
          idsToDelete: []
        })
      });
      setIsConfiguring(false);
      setFormData({
        title: '',
        sure_amount: 50,
        gamble_a_amount: 100,
        gamble_a_prob: 50,
        gamble_b_amount: 0,
        gamble_b_prob: 50
      });
      setSaveMessage('Saved successfully!');
      setTimeout(() => setSaveMessage(null), 3000);
      setEditingTaskId(null);
      fetchTasks();
    } catch (error) {
      console.error('Error saving CPT task:', error);
      setSaveMessage('Failed to save CPT task.');
      setTimeout(() => setSaveMessage(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (task: CPTTask) => {
    setFormData({
      title: task.title,
      sure_amount: task.sure_amount,
      gamble_a_amount: task.gamble_a_amount,
      gamble_a_prob: task.gamble_a_prob,
      gamble_b_amount: task.gamble_b_amount,
      gamble_b_prob: task.gamble_b_prob
    });
    setEditingTaskId(task.id);
    setIsConfiguring(true);
  };

  const handleDelete = async (taskId: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    setIsLoading(true);
    try {
      await apiFetch('/questions', {
        method: 'POST',
        body: JSON.stringify({
          questionsToUpsert: [],
          idsToDelete: [taskId]
        })
      });
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">CPT Task Builder</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {!isConfiguring ? (
          <div className="p-12 flex flex-col items-center justify-center text-center border-b border-slate-100">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
              <MousePointer2 className="w-10 h-10 text-blue-500" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">CPT Task Configuration</h2>
            <p className="text-slate-500 max-w-md">
              Create and manage Cumulative Prospect Theory (CPT) tasks. Configure the sure amounts and gambles.
            </p>
            <button 
              onClick={() => setIsConfiguring(true)}
              className="mt-8 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Create New Task
            </button>
            {saveMessage && !isConfiguring && (
              <p className={`mt-4 font-medium text-sm flex items-center gap-1.5 ${saveMessage.includes('Failed') ? 'text-red-600' : 'text-green-600'}`}>
                {saveMessage}
              </p>
            )}
          </div>
        ) : (
          <div className="p-8 border-b border-slate-100">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">
              {editingTaskId ? 'Edit Task Configuration' : 'Task Configuration'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Task Name</label>
                <input 
                  type="text" 
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow" 
                  placeholder="e.g. Risk Tolerance Task" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Sure Amount ($)</label>
                <input 
                  type="number" 
                  name="sure_amount"
                  value={formData.sure_amount}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow" 
                />
              </div>
              <div className="hidden md:block"></div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Gamble Amount A ($)</label>
                <input 
                  type="number" 
                  name="gamble_a_amount"
                  value={formData.gamble_a_amount}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Probability A (%)</label>
                <input 
                  type="number" 
                  name="gamble_a_prob"
                  value={formData.gamble_a_prob}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Gamble Amount B ($)</label>
                <input 
                  type="number" 
                  name="gamble_b_amount"
                  value={formData.gamble_b_amount}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Probability B (%)</label>
                <input 
                  type="number" 
                  name="gamble_b_prob"
                  value={formData.gamble_b_prob}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow" 
                />
              </div>
            </div>
            <div className="mt-8 flex justify-between items-center">
              <div>
                {saveMessage && (
                  <span className={`font-medium text-sm flex items-center gap-1.5 ${saveMessage.includes('Failed') || saveMessage.includes('Please enter') ? 'text-red-600' : 'text-green-600'}`}>
                    {saveMessage}
                  </span>
                )}
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    setIsConfiguring(false);
                    setEditingTaskId(null);
                    setFormData({
                      title: '',
                      sure_amount: 50,
                      gamble_a_amount: 100,
                      gamble_a_prob: 50,
                      gamble_b_amount: 0,
                      gamble_b_prob: 50
                    });
                  }}
                  className="px-5 py-2.5 text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 font-medium rounded-lg transition-colors"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Configuration
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="p-8 bg-slate-50">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <List className="w-5 h-5 text-slate-500" />
              <h2 className="text-lg font-semibold text-slate-900">Saved CPT Tasks</h2>
            </div>
            {!isConfiguring && (
              <button
                onClick={() => setIsConfiguring(true)}
                className="px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Task
              </button>
            )}
          </div>
          
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center p-8 text-slate-500 bg-white rounded-xl border border-slate-200">
              No tasks saved yet.
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto w-full">
              <table className="w-full text-left text-sm text-slate-600 min-w-[600px]">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Title</th>
                    <th className="px-6 py-4 font-semibold">Sure Amount</th>
                    <th className="px-6 py-4 font-semibold">Gamble A</th>
                    <th className="px-6 py-4 font-semibold">Gamble B</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tasks.map((task) => (
                    <tr key={task.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{task.title}</td>
                      <td className="px-6 py-4">${task.sure_amount}</td>
                      <td className="px-6 py-4">
                        ${task.gamble_a_amount} ({task.gamble_a_prob}%)
                      </td>
                      <td className="px-6 py-4">
                        ${task.gamble_b_amount} ({task.gamble_b_prob}%)
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleEdit(task)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit task"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(task.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete task"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CPTBuilder;
