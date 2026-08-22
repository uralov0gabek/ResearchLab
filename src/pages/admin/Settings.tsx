import React from 'react';

export const Settings: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-2">Manage platform configuration and user access.</p>
      </div>

      <div className="bg-card/50 backdrop-blur-xl border border-white/10 rounded-2xl divide-y divide-border/50">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">General Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Project Name</label>
              <input type="text" defaultValue="UzCombinator Lab Research" className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Support Email</label>
              <input type="email" defaultValue="research@uzcombinator.com" className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-destructive">Danger Zone</h3>
          <p className="text-sm text-muted-foreground mb-4">Permanently delete all collected data. This action cannot be undone.</p>
          <button className="px-4 py-2 rounded-lg bg-destructive/10 text-destructive font-medium hover:bg-destructive hover:text-destructive-foreground transition-colors border border-destructive/20">
            Clear All Research Data
          </button>
        </div>
      </div>
    </div>
  );
};
