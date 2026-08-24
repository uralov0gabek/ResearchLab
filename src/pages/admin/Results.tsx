import React from 'react';
import { LineChart, Download } from 'lucide-react';

const Results: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Results & Analytics</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-12 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
            <LineChart className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">No Results Available Yet</h2>
          <p className="text-slate-500 max-w-md">
            Once participants complete your surveys and tasks, comprehensive analytics and detailed results will be displayed here.
          </p>
          <button 
            disabled
            className="mt-8 px-6 py-2.5 bg-slate-100 text-slate-400 font-medium rounded-lg transition-colors flex items-center gap-2 cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            Export Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default Results;
