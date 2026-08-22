import React from 'react';
import { Download } from 'lucide-react';

export const CPTResults: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">CPT Results</h1>
          <p className="text-muted-foreground mt-2">Analyze experimental data from the Choice Probability Tasks.</p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors shadow-sm">
          <Download className="w-4 h-4" />
          Download Dataset
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 min-h-[300px] flex items-center justify-center border-dashed">
          <p className="text-muted-foreground">Loss Aversion Coefficient Distribution</p>
        </div>
        <div className="bg-card/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 min-h-[300px] flex items-center justify-center border-dashed">
          <p className="text-muted-foreground">Decision Time Analysis</p>
        </div>
      </div>
    </div>
  );
};
