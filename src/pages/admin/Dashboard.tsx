import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Users, FileText, Activity } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.email}!</h1>
        <p className="text-muted-foreground">
          Here's an overview of your research laboratory's activity.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Placeholder Stats Cards */}
        <div className="p-6 bg-card border border-border rounded-xl shadow-sm flex flex-col">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-lg">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-semibold">Active Surveys</h3>
          </div>
          <p className="text-3xl font-bold">0</p>
          <p className="text-sm text-muted-foreground mt-2">No active surveys yet</p>
        </div>

        <div className="p-6 bg-card border border-border rounded-xl shadow-sm flex flex-col">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-green-500/10 text-green-500 rounded-lg">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-semibold">Total Responses</h3>
          </div>
          <p className="text-3xl font-bold">0</p>
          <p className="text-sm text-muted-foreground mt-2">Across all versions</p>
        </div>

        <div className="p-6 bg-card border border-border rounded-xl shadow-sm flex flex-col">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-purple-500/10 text-purple-500 rounded-lg">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="font-semibold">Completion Rate</h3>
          </div>
          <p className="text-3xl font-bold">0%</p>
          <p className="text-sm text-muted-foreground mt-2">Average across surveys</p>
        </div>
      </div>

      <div className="mt-8 p-8 border border-dashed border-border rounded-xl bg-muted/20 flex items-center justify-center text-muted-foreground">
        <p>Survey creation and management features coming in the next steps.</p>
      </div>
    </div>
  );
};
