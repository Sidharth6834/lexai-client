import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Scale, 
  Menu, 
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
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      };

      const res = await axios.put('/api/auth/profile', { name }, config);
      updateUser(res.data.user);
      toast.success('Profile updated successfully!', { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update profile', { id: toastId });
    } finally {
      setUpdatingInfo(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
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
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      };

      const res = await axios.put('/api/auth/change-password', {
        currentPassword,
        newPassword
      }, config);

      toast.success(res.data.message || 'Password changed successfully!', { id: toastId });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to change password', { id: toastId });
    } finally {
      setUpdatingPassword(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Active';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="h-screen bg-[#0A0B0D] text-[#F4F3EF] flex flex-col md:flex-row relative overflow-hidden font-sans">
      <Sidebar activePage="profile" isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

      {/* Mobile Header Bar */}
      <div className="h-16 bg-[#0E0F12] border-b border-[#202227] flex items-center justify-between px-4 sm:px-6 md:hidden sticky top-0 z-20 w-full shrink-0">
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 text-[#8E8D88] hover:text-white hover:bg-[#181A1F] rounded-lg transition"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center space-x-2 text-[#D97706]">
          <Scale className="h-5 w-5" />
          <span className="font-serif text-lg font-bold text-[#F4F3EF] tracking-tight">LegalMind</span>
        </div>
        <div className="h-8 w-8 rounded-lg bg-[#181A1F] border border-[#2A2C34] flex items-center justify-center text-[#D97706] font-mono text-xs font-semibold">
          {getInitials(user?.name)}
        </div>
      </div>

      {/* MAIN VIEW */}
      <main className="flex-1 min-w-0 z-10 flex flex-col h-screen overflow-y-auto">
        <div className="flex-1 p-5 sm:p-7 lg:p-10 max-w-6xl w-full mx-auto space-y-7">
          
          {/* Header section */}
          <div className="pb-5 border-b border-[#202227]">
            <span className="text-[10px] uppercase tracking-widest font-mono text-[#D97706] font-semibold">Account Identity</span>
            <h1 className="text-3xl font-serif font-bold text-[#F4F3EF] tracking-tight sm:text-4xl mt-1">
              Counsel Profile & Credentials
            </h1>
            <p className="text-xs text-[#8E8D88] mt-1">
              Manage personal details, authentication keys, and workspace audit statistics.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT SIDEBAR PROFILE CARD (5 columns) */}
            <div className="lg:col-span-5 space-y-5">
              
              {/* Profile Card */}
              <div className="p-6 rounded-xl bg-[#131518] border border-[#202227] shadow-sm">
                <div className="flex flex-col items-center text-center space-y-4">
                  {/* Avatar */}
                  <div className="h-20 w-20 rounded-xl bg-[#181A1F] border border-[#2A2C34] flex items-center justify-center text-[#D97706] font-mono text-2xl font-bold">
                    {getInitials(user?.name)}
                  </div>

                  {/* Name and Email */}
                  <div className="space-y-0.5">
                    <h2 className="text-lg font-serif font-bold text-[#F4F3EF]">{user?.name || 'User Profile'}</h2>
                    <div className="flex items-center justify-center space-x-1.5 text-[#8E8D88] text-xs font-mono">
                      <Mail className="h-3.5 w-3.5 text-[#D97706] shrink-0" />
                      <span className="truncate">{user?.email}</span>
                    </div>
                  </div>

                  {/* Linked accounts badges */}
                  <div className="w-full pt-4 border-t border-[#202227] flex flex-col items-center gap-2.5">
                    {user?.isGoogleUser ? (
                      <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-[#10B981]/10 border border-[#10B981]/25 rounded-md text-xs font-mono font-medium text-[#10B981]">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span>Google Linked OAuth</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-[#181A1F] border border-[#2A2C34] rounded-md text-xs font-mono font-medium text-[#D97706]">
                        <Key className="h-3.5 w-3.5" />
                        <span>Password Authenticated</span>
                      </div>
                    )}

                    <div className="flex items-center space-x-1.5 text-[11px] font-mono text-[#575652]">
                      <Calendar className="h-3 w-3" />
                      <span>Joined: {formatDate(user?.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Statistics Dashboard Widget */}
              <div className="p-5 rounded-xl bg-[#131518] border border-[#202227] space-y-3 shadow-sm">
                <h3 className="text-xs font-mono font-semibold text-[#8E8D88] tracking-wider uppercase border-b border-[#202227] pb-2">
                  My Audit Activity
                </h3>
                
                {loadingStats ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader className="animate-spin h-5 w-5 text-[#D97706]" />
                  </div>
                ) : stats ? (
                  <div className="grid grid-cols-3 gap-2.5">
                    
                    <div className="bg-[#181A1F] border border-[#202227] rounded-lg p-2.5 text-center space-y-1">
                      <div className="flex justify-center text-[#8E8D88]">
                        <FileText className="h-4 w-4" />
                      </div>
                      <p className="text-base font-mono font-bold text-[#F4F3EF]">{stats.totalDocuments || 0}</p>
                      <p className="text-[9px] text-[#8E8D88] font-mono uppercase tracking-wider">Total</p>
                    </div>

                    <div className="bg-[#181A1F] border border-[#202227] rounded-lg p-2.5 text-center space-y-1">
                      <div className="flex justify-center text-[#10B981]">
                        <CheckCircle className="h-4 w-4" />
                      </div>
                      <p className="text-base font-mono font-bold text-[#10B981]">{stats.analysesComplete || 0}</p>
                      <p className="text-[9px] text-[#10B981] font-mono uppercase tracking-wider">Audited</p>
                    </div>

                    <div className="bg-[#181A1F] border border-[#202227] rounded-lg p-2.5 text-center space-y-1">
                      <div className="flex justify-center text-[#D97706]">
                        <AlertTriangle className="h-4 w-4" />
                      </div>
                      <p className="text-base font-mono font-bold text-[#D97706]">{stats.riskAlerts || 0}</p>
                      <p className="text-[9px] text-[#D97706] font-mono uppercase tracking-wider">Alerts</p>
                    </div>

                  </div>
                ) : (
                  <p className="text-xs text-[#575652] text-center py-4 font-mono">No audit metrics recorded</p>
                )}
              </div>

            </div>

            {/* RIGHT PROFILE SETTINGS DETAILS PANEL (7 columns) */}
            <div className="lg:col-span-7 space-y-5">
              
              {/* Card 1: Account Settings Form */}
              <div className="p-6 rounded-xl bg-[#131518] border border-[#202227] shadow-sm space-y-4">
                <div>
                  <h3 className="text-base font-serif font-bold text-[#F4F3EF] tracking-tight">Identity Details</h3>
                  <p className="text-xs text-[#8E8D88]">Update your personal and firm account display name.</p>
                </div>

                <form onSubmit={handleInfoSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-mono font-medium text-[#8E8D88] uppercase tracking-wider mb-1.5">
                      Full Name
                    </label>
                    <input 
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#0A0B0D] border border-[#202227] rounded-lg text-xs text-[#F4F3EF] placeholder-[#575652] focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]/30 transition"
                      placeholder="Your name"
                    />
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      disabled={updatingInfo}
                      className="px-4 py-2 bg-[#D97706] hover:bg-[#B45309] text-white rounded-lg text-xs font-semibold shadow-sm transition disabled:opacity-50 cursor-pointer"
                    >
                      {updatingInfo ? 'Saving...' : 'Save Profile Name'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Card 2: Security settings */}
              <div className="p-6 rounded-xl bg-[#131518] border border-[#202227] shadow-sm space-y-4">
                <div>
                  <h3 className="text-base font-serif font-bold text-[#F4F3EF] tracking-tight">Security & Credentials</h3>
                  <p className="text-xs text-[#8E8D88]">Manage authentication keys and password configuration.</p>
                </div>

                {user?.isGoogleUser ? (
                  <div className="bg-[#181A1F] border border-[#202227] rounded-lg p-4 flex flex-col sm:flex-row items-center sm:items-start gap-3.5">
                    <div className="p-2.5 bg-[#10B981]/10 border border-[#10B981]/25 rounded-lg text-[#10B981] shrink-0">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div className="text-center sm:text-left space-y-1">
                      <h4 className="font-semibold text-[#F4F3EF] text-xs">OAuth SSO Verification Active</h4>
                      <p className="text-xs text-[#8E8D88] leading-relaxed">
                        This account is authenticated through Google Single Sign-In. You do not require local passwords. Update credentials directly in your Google Security Center.
                      </p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    
                    {/* Current password */}
                    <div>
                      <label className="block text-[11px] font-mono font-medium text-[#8E8D88] uppercase tracking-wider mb-1.5">
                        Current Password
                      </label>
                      <div className="relative">
                        <input 
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-[#0A0B0D] border border-[#202227] rounded-lg text-xs text-[#F4F3EF] placeholder-[#575652] focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]/30 transition font-mono pr-10"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#575652] hover:text-[#8E8D88] transition"
                        >
                          {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* New password */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-mono font-medium text-[#8E8D88] uppercase tracking-wider mb-1.5">
                          New Password
                        </label>
                        <div className="relative">
                          <input 
                            type={showNewPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-[#0A0B0D] border border-[#202227] rounded-lg text-xs text-[#F4F3EF] placeholder-[#575652] focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]/30 transition font-mono pr-10"
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#575652] hover:text-[#8E8D88] transition"
                          >
                            {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono font-medium text-[#8E8D88] uppercase tracking-wider mb-1.5">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <input 
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-[#0A0B0D] border border-[#202227] rounded-lg text-xs text-[#F4F3EF] placeholder-[#575652] focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]/30 transition font-mono pr-10"
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#575652] hover:text-[#8E8D88] transition"
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="submit"
                        disabled={updatingPassword}
                        className="px-4 py-2 bg-[#D97706] hover:bg-[#B45309] text-white rounded-lg text-xs font-semibold shadow-sm transition disabled:opacity-50 cursor-pointer"
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
