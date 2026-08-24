import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Activity, 
  GitBranch, 
  Users, 
  BarChart, 
  Settings as SettingsIcon,
  LogOut,
  Menu,
  X
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans overflow-hidden relative">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/50 md:hidden transition-opacity" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-72 bg-[#0F172A] border-r border-slate-800 flex flex-col shadow-xl z-30 transition-transform duration-300 md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-[#F4C542] to-yellow-200 bg-clip-text text-transparent">
              Research Lab
            </h1>
            <p className="text-sm text-slate-400 mt-1">Research Admin</p>
          </div>
          <button 
            className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto mt-2">
          {NAV_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive 
                      ? 'bg-[#F4C542] text-[#1E293B] shadow-md' 
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                {link.name}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 mt-auto">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-200 font-bold border border-slate-700">
              {user?.email?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="text-sm truncate text-slate-300 flex-1">
              {user?.email || 'admin@uzcombinator.com'}
            </div>
          </div>
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-400/10 hover:text-red-300 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#F8FAFC]">
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center px-4 sm:px-8 sticky top-0 z-10 shadow-sm gap-4">
          <button 
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-100 transition-colors"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
          <h2 className="text-lg font-semibold text-slate-800">Admin Dashboard</h2>
        </header>
        <div className="flex-1 overflow-auto p-4 sm:p-8">
          <div className="max-w-7xl mx-auto pb-12">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

