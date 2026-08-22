import React from 'react';
import { PlusCircle } from 'lucide-react';

export const SurveyBuilder: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Survey Builder</h1>
          <p className="text-muted-foreground mt-2">Design and manage demographic and psychometric questionnaires.</p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors shadow-sm">
          <PlusCircle className="w-4 h-4" />
          New Survey
        </button>
      </div>

      <div className="grid gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card/50 backdrop-blur-xl border border-white/10 p-6 rounded-2xl flex items-center justify-between group hover:border-primary/30 transition-all cursor-pointer">
            <div>
              <h3 className="font-semibold text-lg">Demographics Questionnaire {i}</h3>
              <p className="text-sm text-muted-foreground mt-1">Last edited 2 days ago • 15 questions</p>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="text-sm font-medium text-primary hover:underline">Edit Survey</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
