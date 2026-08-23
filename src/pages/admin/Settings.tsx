import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Shield, Key, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [emailLoading, setEmailLoading] = useState(true);

  useEffect(() => {
    const fetchUserEmail = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (data?.user) {
          setAdminEmail(data.user.email || null);
        }
      } catch (err) {
        console.error('Error fetching user email:', err);
      } finally {
        setEmailLoading(false);
      }
    };
    fetchUserEmail();
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError("New passwords don't match.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    try {
      setLoading(true);
      // Supabase updateUser only requires the new password to update it for the authenticated user
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) throw updateError;

      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error('Error updating password:', err);
      setError(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
      
      {/* Profile Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-slate-800">Admin Profile</h2>
              <p className="text-sm text-slate-500">Manage your administrative account details.</p>
            </div>
          </div>
        </div>
        <div className="p-6 md:p-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-3xl font-bold border-4 border-white shadow-sm">
              {emailLoading ? (
                <Loader2 className="w-8 h-8 animate-spin" />
              ) : (
                (adminEmail || user?.email || 'A').charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Primary Administrator</h3>
              <p className="text-slate-500">
                {emailLoading ? 'Loading email...' : (adminEmail || user?.email || 'admin@uzcombinator.com')}
              </p>
              <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full border border-green-200">
                Active Session
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <Key className="w-6 h-6 text-[#F4C542]" />
            <div>
              <h2 className="text-xl font-bold text-slate-800">Security Settings</h2>
              <p className="text-sm text-slate-500">Update your password to keep your account secure.</p>
            </div>
          </div>
        </div>
        
        <div className="p-6 md:p-8">
          <form onSubmit={handleUpdatePassword} className="max-w-md space-y-5">
            {error && (
              <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm flex items-start gap-3 border border-red-100">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}
            
            {success && (
              <div className="p-4 bg-green-50 text-green-700 rounded-lg text-sm flex items-start gap-3 border border-green-100">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <p>Password successfully updated.</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Current Password</label>
              <input
                type="password"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F4C542] focus:border-transparent transition-all"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
              <input
                type="password"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F4C542] focus:border-transparent transition-all"
                placeholder="Must be at least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm New Password</label>
              <input
                type="password"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F4C542] focus:border-transparent transition-all"
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>

    </div>
  );
};

export default Settings;
