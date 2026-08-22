import React from 'react';

export const Overview: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Overview</h1>
        <p className="text-muted-foreground mt-2">Get a high-level summary of your research operations.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card/50 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all">
          <h3 className="font-medium text-muted-foreground mb-2">Total Responses</h3>
          <p className="text-4xl font-bold bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent">1,248</p>
        </div>
        <div className="bg-card/50 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all">
          <h3 className="font-medium text-muted-foreground mb-2">Active Surveys</h3>
          <p className="text-4xl font-bold bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent">4</p>
        </div>
        <div className="bg-card/50 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all">
          <h3 className="font-medium text-muted-foreground mb-2">Completion Rate</h3>
          <p className="text-4xl font-bold bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent">87%</p>
        </div>
      </div>
      
      <div className="bg-card/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 min-h-[400px] flex items-center justify-center border-dashed">
        <p className="text-muted-foreground">Activity Chart Placeholder</p>
      </div>
    </div>
  );
};
