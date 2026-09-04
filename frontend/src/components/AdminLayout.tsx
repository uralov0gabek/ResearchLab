import React, { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  LayoutDashboard,
  FileText,
  MousePointer2,
  Users,
  LineChart,
  Settings as SettingsIcon,
  LogOut,
  Menu
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { t } = useTranslation();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const navItems = [
    { name: t('Overview') || 'Overview', path: '/admin', icon: LayoutDashboard },
    { name: t('Survey Builder') || 'Survey Builder', path: '/admin/survey-builder', icon: FileText },
    { name: t('CPT Task Builder') || 'CPT Task Builder', path: '/admin/cpt-builder', icon: MousePointer2 },
    { name: t('Responses') || 'Responses', path: '/admin/responses', icon: Users },
    { name: 'Results', path: '/admin/results', icon: LineChart },
    { name: t('Settings') || 'Settings', path: '/admin/settings', icon: SettingsIcon },
  ];


  return (
    <div className="min-h-screen bg-[#FFFDF5] font-sans">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col shadow-xl transform transition-transform duration-300 md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6">
          <Link to="/" className="group block cursor-pointer">
            <div className="text-xl font-bold tracking-tight text-white group-hover:text-[#F4C542] transition-colors">{t('Research Lab')}</div>
            <p className="text-xs text-slate-400 mt-1 group-hover:text-slate-300 transition-colors">Loss Aversion Platform</p>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto mt-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/admin'}
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#F4C542] text-slate-900'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                <span className="truncate">{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-4">

          <button
            onClick={handleSignOut}
            className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-slate-300 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3 flex-shrink-0" />
            {t('Sign Out')}
          </button>
        </div>
      </div>

      {/* Main Content Wrapper */}
      <div className="flex flex-col min-h-screen md:ml-64">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center h-16 px-4 bg-white border-b border-slate-200 sticky top-0 z-30">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-2 text-slate-600 hover:text-slate-900 focus:outline-none"
            aria-label="Toggle menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="ml-2 font-semibold text-slate-800 truncate">{t('Research Lab')}</span>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
