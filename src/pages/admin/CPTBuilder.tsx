import React from 'react';
import { Settings, MousePointer2 } from 'lucide-react';

const CPTBuilder: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">CPT Task Builder</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-12 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
            <MousePointer2 className="w-10 h-10 text-blue-500" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">CPT Task Configuration</h2>
          <p className="text-slate-500 max-w-md">
            CPT Task configuration will go here. You will be able to customize task parameters, stimuli, and trial settings.
          </p>
          <button className="mt-8 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Configure Task
          </button>
        </div>
      </div>
    </div>
  );
};

export default CPTBuilder;
