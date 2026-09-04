import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Lock, Loader2, ArrowLeft, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [isLangOpen, setIsLangOpen] = useState(false);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('i18nextLng', lng);
    setIsLangOpen(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else if (data?.user) {
      navigate('/admin');
    } else {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF5] flex items-center justify-center p-4 text-slate-800 relative">
      {/* Language Switcher */}
      <div className="absolute top-4 right-4 z-50">
        <div className="relative">
          <button 
            onClick={() => setIsLangOpen(!isLangOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm font-medium text-slate-700 hover:bg-gray-50 shadow-sm"
            aria-haspopup="true"
          >
            <Globe size={16} className="text-slate-500" />
            <span className="uppercase">{i18n.language}</span>
          </button>
          
          {isLangOpen && (
            <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-lg py-1 border border-gray-100">
              <button onClick={() => changeLanguage('uz')} className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-gray-50">O'zbekcha</button>
              <button onClick={() => changeLanguage('en')} className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-gray-50">English</button>
              <button onClick={() => changeLanguage('ru')} className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-gray-50">Русский</button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="flex flex-col items-center mb-8">
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
          >
            <ArrowLeft size={16} />
            {t('Back to Home')}
          </button>
          
          <div className="bg-yellow-100 p-3 rounded-full mb-4">
            <Lock className="w-8 h-8 text-[#F4C542]" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{t('Admin Access')}</h2>
          <p className="text-gray-500 mt-2 text-center">Sign in to manage surveys and data</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">
                {t('Email Address')}
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F4C542] focus:border-[#F4C542] outline-none transition-all text-slate-800"
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F4C542] focus:border-[#F4C542] outline-none transition-all text-slate-800"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <>
                <Lock size={18} />
                {t('Sign In')}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
