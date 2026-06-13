import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Scale, 
  Menu, 
  User, 
  Mail, 
  Calendar, 
  ShieldCheck, 
  Lock, 
  Eye, 
  EyeOff, 
  Key, 
  CheckCircle, 
  AlertTriangle, 
  FileText,
  Loader
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';

const Profile = () => {
  const { user, token, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();

  // Navigation state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Profile forms state
  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Show/hide passwords
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Async task states
  const [updatingInfo, setUpdatingInfo] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Fetch stats from backend
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };
        const res = await axios.get('/api/documents/stats', config);
        setStats(res.data);
      } catch (err) {
        console.error('Error fetching profile stats:', err);
      } finally {
        setLoadingStats(false);
      }
    };

    if (token) {
      fetchStats();
    }
  }, [token]);

  // Handle Profile Info Update (Name)
  const handleInfoSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    setUpdatingInfo(true);
    const toastId = toast.loading('Updating profile name...');

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      const res = await axios.put('/api/auth/profile', { name }, config);
      updateUser({ name: res.data.user.name });
      toast.success('Profile name updated!', { id: toastId });
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.message || 'Failed to update name';
      toast.error(errorMsg, { id: toastId });
    } finally {
      setUpdatingInfo(false);
    }
  };

  // Handle Password Update
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('All password fields are required');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setUpdatingPassword(true);
    const toastId = toast.loading('Updating password...');

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      await axios.put('/api/auth/profile', { 
        currentPassword, 
        newPassword 
      }, config);

      toast.success('Password updated successfully!', { id: toastId });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.message || 'Failed to update password';
      toast.error(errorMsg, { id: toastId });
    } finally {
      setUpdatingPassword(false);
    }
  };

  // Helper: Format initials
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Helper: Format Date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="h-screen bg-[#030712] text-white flex flex-col md:flex-row relative overflow-hidden">
      {/* Visual background elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-slate-500/5 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* REUSABLE SIDEBAR */}
      <Sidebar activePage="profile" isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

      {/* MOBILE HEADER BAR */}
      <div className="h-16 bg-slate-950/75 backdrop-blur-xl border-b border-slate-900 flex items-center justify-between px-4 sm:px-6 md:hidden sticky top-0 z-20 w-full shrink-0">
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-xl transition"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="flex items-center space-x-2 text-indigo-400">
          <Scale className="h-6 w-6" />
          <span className="text-lg font-bold text-white tracking-wide">LegalMind</span>
        </div>
        <div className="h-8 w-8 rounded-full bg-indigo-650 flex items-center justify-center text-white font-bold text-xs shadow-md">
          {getInitials(user?.name)}
        </div>
      </div>

      {/* MAIN VIEW */}
      <main className="flex-1 min-w-0 z-10 flex flex-col h-screen overflow-y-auto">
        <div className="flex-1 p-6 sm:p-8 lg:p-12 max-w-7xl w-full mx-auto space-y-8">
          
          {/* Header section */}
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
              User Profile
            </h1>
            <p className="text-sm text-slate-400 mt-1 font-medium">
              Manage your personal settings, security settings, and view account statistics.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT SIDEBAR PROFILE CARD (5 columns) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Profile Glass Card */}
              <div className="relative overflow-hidden glass-card rounded-3xl p-6 sm:p-8 shadow-2xl hover:-translate-y-1 transition-all duration-305 group border border-white/5">
                {/* Spotlight hover element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-500/20 transition-colors duration-500" />
                
                <div className="flex flex-col items-center text-center space-y-6 relative z-10">
                  {/* Large Avatar initials block */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-indigo-500/40 rounded-full blur-md opacity-40 animate-pulse" />
                    <div className="relative h-24 w-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-650 flex items-center justify-center text-white font-extrabold text-3xl shadow-2xl border border-white/10">
                      {getInitials(user?.name)}
                    </div>
                  </div>

                  {/* Name and Email */}
                  <div className="space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight text-white">{user?.name || 'User Profile'}</h2>
                    <div className="flex items-center justify-center space-x-1.5 text-slate-400 text-sm font-medium">
                      <Mail className="h-4 w-4 text-indigo-400 shrink-0" />
                      <span className="truncate">{user?.email}</span>
                    </div>
                  </div>

                  {/* Linked accounts badges */}
                  <div className="w-full pt-4 border-t border-white/5 flex flex-col items-center gap-3">
                    {user?.isGoogleUser ? (
                      <div className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs font-bold text-emerald-400 shadow-sm shadow-emerald-500/5">
                        <ShieldCheck className="h-4 w-4" />
                        <span>Google Linked Account</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-xs font-bold text-indigo-400 shadow-sm shadow-indigo-500/5">
                        <Key className="h-4 w-4" />
                        <span>Password Authenticated</span>
                      </div>
                    )}

                    <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-medium">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Joined: {formatDate(user?.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Statistics Dashboard Widget (3D effect cards) */}
              <div className="glass-card rounded-3xl p-6 shadow-xl space-y-4 border border-white/5">
                <h3 className="text-sm font-bold text-white tracking-wider uppercase border-b border-white/5 pb-2.5">
                  My Audit Stats
                </h3>
                
                {loadingStats ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader className="animate-spin h-6 w-6 text-indigo-500" />
                  </div>
                ) : stats ? (
                  <div className="grid grid-cols-3 gap-3">
                    
                    {/* Stat Item: Total */}
                    <div className="bg-slate-950/45 border border-white/5 rounded-2xl p-3 text-center space-y-1 hover:border-indigo-500/30 hover:bg-slate-900/30 transition-all duration-200 group cursor-default shadow-md">
                      <div className="flex justify-center text-indigo-400 group-hover:scale-110 transition-transform duration-200">
                        <FileText className="h-5 w-5" />
                      </div>
                      <p className="text-lg font-extrabold text-white">{stats.totalDocuments || 0}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">Total</p>
                    </div>

                    {/* Stat Item: Complete */}
                    <div className="bg-slate-950/45 border border-white/5 rounded-2xl p-3 text-center space-y-1 hover:border-emerald-500/30 hover:bg-slate-900/30 transition-all duration-200 group cursor-default shadow-md">
                      <div className="flex justify-center text-emerald-400 group-hover:scale-110 transition-transform duration-200">
                        <CheckCircle className="h-5 w-5" />
                      </div>
                      <p className="text-lg font-extrabold text-white">{stats.analysesComplete || 0}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">Audited</p>
                    </div>

                    {/* Stat Item: Alerts */}
                    <div className="bg-slate-950/45 border border-white/5 rounded-2xl p-3 text-center space-y-1 hover:border-amber-500/30 hover:bg-slate-900/30 transition-all duration-200 group cursor-default shadow-md">
                      <div className="flex justify-center text-amber-400 group-hover:scale-110 transition-transform duration-200">
                        <AlertTriangle className="h-5 w-5" />
                      </div>
                      <p className="text-lg font-extrabold text-white">{stats.riskAlerts || 0}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">Alerts</p>
                    </div>

                  </div>
                ) : (
                  <p className="text-xs text-slate-500 text-center py-4">No audit data available</p>
                )}
              </div>

            </div>

            {/* RIGHT PROFILE SETTINGS DETAILS PANEL (7 columns) */}
            <div className="lg:col-span-7 space-y-8">
              
              {/* Card 1: Account Settings Form */}
              <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/5 shadow-2xl space-y-6">
                <div>
                  <h3 className="text-lg font-extrabold text-white tracking-tight">Profile Details</h3>
                  <p className="text-xs text-slate-400 mt-0.5 font-medium">Update your personal account details.</p>
                </div>

                <form onSubmit={handleInfoSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Full Name
                    </label>
                    <input 
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full glass-input rounded-xl px-4 py-3.5 text-sm placeholder-slate-650 transition"
                      placeholder="Your name"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={updatingInfo}
                      className="px-5 py-2.5 text-white rounded-xl text-xs font-bold btn-gradient disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {updatingInfo ? 'Saving...' : 'Save Profile Name'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Card 2: Security settings (Standard User Password settings OR Google link info) */}
              <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/5 shadow-2xl space-y-6">
                <div>
                  <h3 className="text-lg font-extrabold text-white tracking-tight">Security Settings</h3>
                  <p className="text-xs text-slate-400 mt-0.5 font-medium">Manage your sign-in methods and password configurations.</p>
                </div>

                {user?.isGoogleUser ? (
                  /* Google User informational view */
                  <div className="bg-slate-950/45 border border-white/5 rounded-2xl p-6 flex flex-col sm:flex-row items-center sm:items-start gap-4 shadow-inner">
                    <div className="p-3.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 shrink-0">
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div className="text-center sm:text-left space-y-1.5">
                      <h4 className="font-bold text-white text-sm">OAuth Verification Secured</h4>
                      <p className="text-xs text-slate-400 leading-relaxed font-medium">
                        This account is authenticated through Google Single Sign-In. You do not need to configure local passwords. If you wish to change account passwords, please update them directly inside your Google Account security center.
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Standard User Password change Form */
                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    
                    {/* Current password */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <input 
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full glass-input rounded-xl pl-4 pr-10 py-3.5 text-sm transition placeholder-slate-700"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-350 transition"
                        >
                          {showCurrentPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                        </button>
                      </div>
                    </div>

                    {/* New password */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                          New Password
                        </label>
                        <div className="relative">
                          <input 
                            type={showNewPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full glass-input rounded-xl pl-4 pr-10 py-3.5 text-sm transition placeholder-slate-700"
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-355 transition"
                          >
                            {showNewPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <input 
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full glass-input rounded-xl pl-4 pr-10 py-3.5 text-sm transition placeholder-slate-700"
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-355 transition"
                          >
                            {showConfirmPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                          </button>
                        </div>
                      </div>

                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        disabled={updatingPassword}
                        className="px-5 py-2.5 text-white rounded-xl text-xs font-bold btn-gradient disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {updatingPassword ? 'Updating...' : 'Update Password'}
                      </button>
                    </div>

                  </form>
                )}
              </div>

            </div>

          </div>

        </div>
      </main>
    </div>
  );
};

export default Profile;
