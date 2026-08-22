import React from 'react';
import { Settings2 } from 'lucide-react';

export const CPTTaskBuilder: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">CPT Task Builder</h1>
          <p className="text-muted-foreground mt-2">Configure parameters for the Choice Probability Task.</p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 transition-colors shadow-sm border border-border">
          <Settings2 className="w-4 h-4" />
          Global Settings
        </button>
      </div>

      <div className="bg-card/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
        <h3 className="text-xl font-semibold mb-6">Task Variables</h3>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Base Probability (%)</label>
              <input type="number" defaultValue={50} className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Multiplier Step</label>
              <input type="number" defaultValue={1.5} step={0.1} className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
          </div>
          
          <div className="pt-4 border-t border-border">
            <button className="px-6 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors shadow-sm">
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
