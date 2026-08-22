import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Activity, 
  GitBranch, 
  Users, 
  BarChart, 
  Settings as SettingsIcon,
  LogOut 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const NAV_LINKS = [
  { name: 'Overview', path: '/admin/overview', icon: LayoutDashboard },
  { name: 'Survey Builder', path: '/admin/survey-builder', icon: ClipboardList },
  { name: 'CPT Task Builder', path: '/admin/cpt-task-builder', icon: Activity },
  { name: 'Logic & Branching', path: '/admin/logic-branching', icon: GitBranch },
  { name: 'Responses', path: '/admin/responses', icon: Users },
  { name: 'CPT Results', path: '/admin/cpt-results', icon: BarChart },
  { name: 'Settings', path: '/admin/settings', icon: SettingsIcon },
];

export const AdminLayout: React.FC = () => {
  const { signOut, user } = useAuth();

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Sidebar */}
      <aside className="w-72 bg-card/80 backdrop-blur-xl border-r border-border flex flex-col shadow-sm">
        <div className="p-6">
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            UzCombinator Lab
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Research Admin</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {NAV_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-primary text-primary-foreground shadow-sm' 
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                {link.name}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border mt-auto">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold border border-primary/20">
              {user?.email?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="text-sm truncate text-muted-foreground flex-1">
              {user?.email || 'admin@uzcombinator.com'}
            </div>
          </div>
          <button
            onClick={signOut}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-background">
        <header className="h-16 bg-card/50 backdrop-blur-md border-b border-border flex items-center px-8 sticky top-0 z-10">
          <h2 className="text-lg font-semibold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Admin Panel</h2>
        </header>
        <div className="p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
