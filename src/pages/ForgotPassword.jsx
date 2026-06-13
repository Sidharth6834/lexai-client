import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Mail, Lock, ShieldCheck, Eye, EyeOff, Scale, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1 = Request Code, 2 = Verify & Reset

  const navigate = useNavigate();

  // Step 1: Request reset code
  const handleRequestCode = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Sending reset code to your email...');

    try {
      await axios.post('/api/auth/forgot-password', { email });
      toast.success('Reset code sent! Please check your email.', { id: toastId });
      setStep(2);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to send reset code';
      toast.error(errorMsg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify code and update password
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!otp || !newPassword) {
      toast.error('All fields are required');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Resetting password...');

    try {
      const response = await axios.post('/api/auth/reset-password', {
        email,
        otp,
        newPassword,
      });

      toast.success(response.data.message || 'Password reset successful!', { id: toastId });
      navigate('/login');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Password reset failed';
      toast.error(errorMsg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glowing bubbles */}
      <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center items-center space-x-2 text-indigo-400">
          <Scale className="h-10 w-10 animate-pulse" />
          <span className="text-3xl font-extrabold text-white tracking-wider">LexAI</span>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white tracking-tight">
          Reset Password
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Recover access to your account securely
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="glass-card py-8 px-6 shadow-2xl rounded-3xl sm:px-10">
          {step === 1 ? (
            /* STEP 1: REQUEST CODE */
            <form className="space-y-6" onSubmit={handleRequestCode}>
              <div className="text-center pb-2">
                <p className="text-xs text-slate-400 leading-relaxed">
                  Enter the email address associated with your account, and we will send you a 6-digit reset code.
                </p>
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="mt-2 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="h-4.5 w-4.5" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 glass-input rounded-xl text-sm placeholder-slate-650 transition"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl text-sm font-bold text-white btn-gradient disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Sending Code...' : 'Send Reset Code'}
                </button>
              </div>
            </form>
          ) : (
            /* STEP 2: ENTER OTP & NEW PASSWORD */
            <form className="space-y-6" onSubmit={handleResetPassword}>
              <div className="text-center pb-2">
                <button 
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition mb-3 cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                  <span>Use different email address</span>
                </button>
                <p className="text-xs text-slate-400">
                  Enter the 6-digit reset code sent to <strong className="text-white">{email}</strong>.
                </p>
              </div>

              {/* Code Field */}
              <div>
                <label htmlFor="otp" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Verification Code
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-indigo-400">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="block w-full pl-11 pr-4 py-3.5 glass-input rounded-xl text-center text-lg font-bold tracking-[0.2em] placeholder-slate-700 transition"
                    placeholder="123456"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="new-password" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  New Password
                </label>
                <div className="mt-2 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="h-4.5 w-4.5" />
                  </div>
                  <input
                    id="new-password"
                    name="new-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="block w-full pl-11 pr-10 py-3 glass-input rounded-xl text-sm placeholder-slate-650 transition"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition"
                  >
                    {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl text-sm font-bold text-white btn-gradient disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Resetting Password...' : 'Reset Password'}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-400">
              Remembered your password?{' '}
              <Link to="/login" className="font-semibold text-indigo-400 hover:text-indigo-300 transition">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
