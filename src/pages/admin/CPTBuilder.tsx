import React, { useState } from 'react';
import { Settings, MousePointer2 } from 'lucide-react';

const CPTBuilder: React.FC = () => {
  const [isConfiguring, setIsConfiguring] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">CPT Task Builder</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {!isConfiguring ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
              <MousePointer2 className="w-10 h-10 text-blue-500" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">CPT Task Configuration</h2>
            <p className="text-slate-500 max-w-md">
              CPT Task configuration will go here. You will be able to customize task parameters, stimuli, and trial settings.
            </p>
            <button 
              onClick={() => setIsConfiguring(true)}
              className="mt-8 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Configure Task
            </button>
          </div>
        ) : (
          <div className="p-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">Task Configuration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Task Name</label>
                <input type="text" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow" placeholder="e.g. Risk Tolerance Task" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Sure Amount ($)</label>
                <input type="number" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow" placeholder="50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Gamble Amount A ($)</label>
                <input type="number" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow" placeholder="100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Probability A (%)</label>
                <input type="number" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow" placeholder="50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Gamble Amount B ($)</label>
                <input type="number" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow" placeholder="0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Probability B (%)</label>
                <input type="number" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow" placeholder="50" />
              </div>
            </div>
            <div className="mt-8 flex justify-end gap-3">
              <button 
                onClick={() => setIsConfiguring(false)}
                className="px-5 py-2.5 text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
                Save Configuration
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CPTBuilder;
